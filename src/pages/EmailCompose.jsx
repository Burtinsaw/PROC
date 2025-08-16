import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Paper, Stack, TextField, Typography, Chip, FormControl, InputLabel, Select, MenuItem, IconButton, Menu, MenuItem as MuiMenuItem, Tooltip, Snackbar, Autocomplete, CircularProgress, Breadcrumbs, Link, Switch, FormControlLabel, Avatar } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import ShareIcon from '@mui/icons-material/Share';
import SendIcon from '@mui/icons-material/Send';
import DescriptionIcon from '@mui/icons-material/Description';
import BorderColorIcon from '@mui/icons-material/BorderColor';
const RichTextEditor = lazy(() => import('../components/RichTextEditor'));
const TemplateEditorPanel = lazy(() => import('../components/email/TemplateEditorPanel'));
import dayjs from 'dayjs';
import { upsertDraft, sendNow, scheduleSend, lockDraft, unlockDraft, getDraft, uploadDraftAttachment, listDraftAttachments, deleteDraftAttachment, joinDraftPresence, leaveDraftPresence, getDraftPresence, patchDraft, listAccounts, listSignatures, suggestContacts, listTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api/email';
import { useChat } from '../contexts/ChatContext';

function useQuery(){
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function EmailCompose(){
  const query = useQuery();
  const navigate = useNavigate();
  const draftIdParam = query.get('id');
  // Bağlama parametreleri (compose'a entity context ile gelindiyse)
  const linkEntityType = query.get('entityType') || undefined;
  const linkEntityId = query.get('entityId') ? Number(query.get('entityId')) : undefined;
  const linkEntityKey = query.get('entityKey') || undefined;
  const [draftId, setDraftId] = useState(draftIdParam ? Number(draftIdParam) : null);
  const MAX_ATTACHMENTS = 20;
  const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50MB toplam sınır
  const [form, setForm] = useState({ to:'', cc:'', bcc:'', subject:'', bodyText:'', bodyHtml:'' });
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const autosaveTimer = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [collab, setCollab] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [signatures, setSignatures] = useState([]);
  const [templatesAnchor, setTemplatesAnchor] = useState(null);
  const templatesButtonRef = useRef(null);
  const [templates, setTemplates] = useState([]);
  const [tplDialogOpen, setTplDialogOpen] = useState(false);
  const [tplForm, setTplForm] = useState({ id:null, name:'', html:'', isShared:false, shortcut:'' });
  const [tplSaving, setTplSaving] = useState(false);
  const tplNameRef = useRef(null);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrOptions, setAddrOptions] = useState([]);
  const addrFetchTimer = useRef(null);
  const currentAddrQueryRef = useRef('');
  const addrCacheRef = useRef(new Map()); // q -> { items, ts }
  // Çoklu adres chip listeleri
  const [toList, setToList] = useState([]);
  const [ccList, setCcList] = useState([]);
  const [bccList, setBccList] = useState([]);
  // Drag&drop ve yükleme durumu
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  // cevap hatırlatma değeri ileride taslak meta olarak saklanabilir
  const chat = useChat();
  // İmzayı otomatik ekleme tercihi (localStorage ile senkron)
  const [autoSig, setAutoSig] = useState(() => {
    try { return localStorage.getItem('email.autoIncludeSignature') !== '0'; } catch { return true; }
  });

  // Toplam ek boyutu hesaplama ve okunur format
  const currentTotalBytes = useMemo(() => {
    try { return (attachments||[]).reduce((sum, a) => sum + (Number(a?.size)||0), 0); } catch { return 0; }
  }, [attachments]);
  const formatBytes = (n) => {
    const b = Number(n||0);
    if (b < 1024) return `${b} B`;
    if (b < 1024*1024) return `${(b/1024).toFixed(1)} KB`;
    return `${(b/1024/1024).toFixed(1)} MB`;
  };

  // Basit e-posta doğrulayıcı (RFC basitleştirilmiş)
  const isValidEmail = (v) => /.+@.+\..+/.test(String(v||'').trim());
  // Yardımcılar: küçük/büyük harf duyarsız tekilleştirme ve güvenli ekleme
  const dedupeCaseInsensitive = (arr) => {
    const seen = new Set();
    const out = [];
    for (const x of arr || []) {
      const key = String(x).toLowerCase();
      if (!seen.has(key)) { seen.add(key); out.push(x); }
    }
    return out;
  };
  const addUnique = (setter, value) => setter(prev => prev.some(p => String(p).toLowerCase() === String(value).toLowerCase()) ? prev : [...prev, value]);

  // Body içine imza ekleme/yerine koyma yardımcıları
  const buildSignatureHtml = useMemo(() => (sig) => sig ? `\n<div data-signature="true" data-sig-id="${sig.id||''}">${sig.html}</div>` : '', []);
  const stripSignatureHtml = useMemo(() => (html) => (html||'').replace(/\n?<div[^>]*data-signature="true"[\s\S]*?<\/div>/i, ''), []);
  const findDefaultSignatureForAccount = useMemo(() => (accId) => {
      if (!signatures?.length) return null;
      // Öncelik: hesap için isDefault olan, sonra hesap için herhangi biri, sonra genel isDefault, son olarak ilk öğe
      const list = signatures || [];
      const byAccDefault = list.find(s => s.accountId === accId && s.isDefault);
      if (byAccDefault) return byAccDefault;
      const byAccAny = list.find(s => s.accountId === accId);
      if (byAccAny) return byAccAny;
      const generalDefault = list.find(s => !s.accountId && s.isDefault);
      if (generalDefault) return generalDefault;
      return list[0];
    }
  , [signatures]);

  // Load existing draft if id provided
  useEffect(() => {
    let mounted = true;
    async function load(){
      try{
        if (!draftIdParam) return;
        const { item } = await getDraft(Number(draftIdParam));
        if (mounted && item){
          setDraftId(item.id);
          setForm({ to:item.to||'', cc:item.cc||'', bcc:item.bcc||'', subject:item.subject||'', bodyText:item.bodyText||'', bodyHtml:item.bodyHtml||'' });
          try {
            const parse = (s)=> String(s||'').split(/[;,]/).map(x=>x.trim()).filter(Boolean);
            setToList(parse(item.to)); setCcList(parse(item.cc)); setBccList(parse(item.bcc));
          } catch { /* ignore parse */ }
          setAccountId(item.accountId || '');
          try { const { items } = await listDraftAttachments(item.id); if(mounted) setAttachments(items||[]); } catch { /* ignore */ }
        }
        try { await lockDraft(Number(draftIdParam)); } catch { /* ignore */ }
        // presence join + socket oda katılımı
  try { await joinDraftPresence(Number(draftIdParam)); } catch { /* ignore */ }
  try { chat?.socket?.emit?.('draft:join', Number(draftIdParam)); } catch { /* ignore */ }
  try { const { users } = await getDraftPresence(Number(draftIdParam)); if(mounted) setCollab(users||[]); } catch { /* ignore */ }
      } catch(e){ setError(e.message || 'Taslak yüklenemedi'); }
    }
    load();
    return () => {
      mounted = false;
      if (draftIdParam) { unlockDraft(Number(draftIdParam)).catch(()=>{}); }
      if (draftIdParam) { leaveDraftPresence(Number(draftIdParam)).catch(()=>{}); }
  try { chat?.socket?.emit?.('draft:leave', Number(draftIdParam)); } catch { /* ignore */ }
    };
  }, [draftIdParam, chat?.socket]);

  // Hesapları yükle ve gerekirse varsayılanı ata
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { items } = await listAccounts();
        if (!mounted) return;
        setAccounts(items || []);
        if (!accountId && items && items.length > 0) setAccountId(items[0].id);
  // imzaları da çek
  try { const sig = await listSignatures(); if (mounted) setSignatures(sig?.items || []); } catch { /* ignore signature load */ }
        // mevcut form değerlerinden listeleri türet (örn. query ile gelen taslak yoksa)
        try {
          const parse = (s)=> String(s||'').split(/[;,]/).map(x=>x.trim()).filter(Boolean);
          setToList(prev => prev.length ? prev : parse(form.to));
          setCcList(prev => prev.length ? prev : parse(form.cc));
          setBccList(prev => prev.length ? prev : parse(form.bcc));
        } catch { /* ignore parse */ }
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [accountId, form.to, form.cc, form.bcc]);

  // İmzaları veya hesabı yükledikten sonra otomatik ekleme
  useEffect(() => {
    if (!autoSig) return;
    // Yeni taslak veya imzasız body için uygula; mevcut bir imza varsa hesap değişiminde değiştir
    const sig = findDefaultSignatureForAccount(accountId ? Number(accountId) : null);
    if (!sig) return;
    setForm(f => {
      // Eğer henüz imza yoksa, sonuna ekle
      const hasSig = /data-signature="true"/.test(f.bodyHtml || '');
      if (!hasSig) {
        return { ...f, bodyHtml: (f.bodyHtml || '') + buildSignatureHtml(sig) };
      }
      // Hesap değişmiş olabilir: mevcut imzayı yeni seçili ile değiştir
      const newHtml = stripSignatureHtml(f.bodyHtml) + buildSignatureHtml(sig);
      return { ...f, bodyHtml: newHtml };
    });
    // not: draft autosave zaten bağımlılıklarla çalışır
  }, [signatures, accountId, autoSig, findDefaultSignatureForAccount, buildSignatureHtml, stripSignatureHtml]);

  // Auto-save every 2s after change (iyileştirilmiş)
  useEffect(() => {
    if (busy) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    const data = { ...form };
    autosaveTimer.current = setTimeout(async () => {
      try {
        // Anlamlı değişim kontrolü
        const normalized = normalizeFormForSave(data);
        const prev = lastSavedDataRef.current;
        if (prev && JSON.stringify(prev) === JSON.stringify(normalized)) return;
        const payload = { id: draftId, ...data, accountId: accountId || undefined };
        let item;
        try {
          ({ item } = await upsertDraft(payload));
  } catch {
          ({ item } = await upsertDraft(payload)); // tek seferlik retry
        }
        if (!draftId) setDraftId(item.id);
        lastSavedDataRef.current = normalized;
        setInfo(`Taslak kaydedildi ${dayjs(item.updatedAt).format('HH:mm:ss')}`);
        setError('');
        // Patch yayını (best-effort, diğer istemciler için)
        try { if (draftId) await patchDraft(draftId, data); } catch { /* ignore */ }
        try { chat?.socket?.emit?.('email:draft:typing', { id: draftId }); } catch { /* ignore */ }
      } catch(e){
        const now = Date.now();
        if (now - (lastErrorAtRef.current||0) > 3000) {
          setError(e.message || 'Taslak kaydedilemedi');
          lastErrorAtRef.current = now;
        }
      }
    }, 2000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [form, busy, draftId, chat?.socket, accountId]);

  const onChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // Autosave iyileştirme: anlamlı değişim ve hata spam azaltma
  const lastSavedDataRef = useRef(null);
  const lastErrorAtRef = useRef(0);
  const normalizeFormForSave = (f) => {
    const pick = (o, keys) => keys.reduce((acc,k)=>{ acc[k] = String(o[k]||'').trim(); return acc; },{});
    return pick(f, ['to','cc','bcc','subject','bodyHtml','bodyText']);
  };

  // Yerel otomatik taslak yedeği (offline/bağlantı kopması için)
  const localMirrorKey = 'email.compose.localDraft';
  const localMirrorTimer = useRef(null);
  const isFormEmpty = (f) => {
    const t = String(f?.to||'').trim();
    const c = String(f?.cc||'').trim();
    const b = String(f?.bcc||'').trim();
    const s = String(f?.subject||'').trim();
    const h = String(f?.bodyHtml||'').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim();
    const p = String(f?.bodyText||'').trim();
    return !t && !c && !b && !s && !h && !p;
  };
  // Form değişince yerel yedekle (500ms debounce)
  useEffect(() => {
    if (localMirrorTimer.current) clearTimeout(localMirrorTimer.current);
    localMirrorTimer.current = setTimeout(() => {
      try {
        const snapshot = {
          ts: Date.now(),
          form: normalizeFormForSave(form)
        };
        localStorage.setItem(localMirrorKey, JSON.stringify(snapshot));
      } catch { /* ignore */ }
    }, 500);
    return () => { if (localMirrorTimer.current) clearTimeout(localMirrorTimer.current); };
  }, [form]);

  // İlk açılışta yerel taslak varsa ve aktif draft id yoksa geri yüklemeyi teklif et
  useEffect(() => {
    try {
      if (draftId) return; // sunucu tarafı taslak zaten var
      if (draftIdParam) return; // URL ile gelen draft var
      const raw = localStorage.getItem(localMirrorKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data?.form) return;
      const age = Date.now() - (Number(data.ts)||0);
      if (age > 24*60*60*1000) return; // 24 saatten eski ise yok say
      if (!isFormEmpty(form)) return; // mevcut form boş değilse karışma
      const ok = window.confirm('Son seansınızdan kaydedilmemiş bir taslak bulundu. Geri yüklemek ister misiniz?');
      if (ok) {
        setForm(f => ({ ...f, ...data.form }));
        setInfo('Yerel taslak geri yüklendi');
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sayfadan ayrılmadan önce uyar (kaydedilmemiş değişiklikler varsa)
  useEffect(() => {
    const handler = (e) => {
      try {
        const normalized = normalizeFormForSave(form);
        const prev = lastSavedDataRef.current;
        const changed = !prev || JSON.stringify(prev) !== JSON.stringify(normalized);
        if (changed) {
          e.preventDefault();
          e.returnValue = '';
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form]);

  // Socket presence/patch dinleyicileri
  useEffect(() => {
    if (!chat?.socket || !draftId) return;
    const onPresence = (p) => { if(p?.id===draftId) setCollab(p.users||[]); };
    const onPatch = (ev) => {
      if (ev?.id !== draftId) return;
      // başka kullanıcıdan gelen güncellemeleri form'a uygula (basit merge)
      setForm(f => ({ ...f, ...ev.updates }));
    };
    chat.socket.on('email:draft:presence', onPresence);
    chat.socket.on('email:draft:patch', onPatch);
    return () => { chat.socket.off?.('email:draft:presence', onPresence); chat.socket.off?.('email:draft:patch', onPatch); };
  }, [chat?.socket, draftId]);

  // Ek yükleme
  const onPickFile = async (e) => {
    try{
      const file = e.target.files?.[0];
      if(!file || !draftId) return;
  if ((attachments?.length || 0) >= MAX_ATTACHMENTS) { setError(`En fazla ${MAX_ATTACHMENTS} ek ekleyebilirsiniz`); return; }
  if ((currentTotalBytes + file.size) > MAX_TOTAL_BYTES) { setError(`Toplam ek boyutu ${formatBytes(MAX_TOTAL_BYTES)} sınırını aşıyor`); return; }
      const { attachments: list } = await uploadDraftAttachment(draftId, file);
      setAttachments(list||[]);
    } catch(err){ setError(err.message || 'Ek yüklenemedi'); }
  };
  const openTemplates = (e) => setTemplatesAnchor(e?.currentTarget || templatesButtonRef.current);
  const closeTemplates = () => setTemplatesAnchor(null);
  const insertTemplate = (html) => { setForm(f => ({ ...f, bodyHtml: (f.bodyHtml || '') + html })); closeTemplates(); };
  const insertSignature = (sig) => { if(!sig) return; setForm(f => ({ ...f, bodyHtml: stripSignatureHtml(f.bodyHtml) + buildSignatureHtml(sig) })); };
  const onToggleAutoSig = (e) => {
    const v = !!e.target.checked;
    setAutoSig(v);
    try { localStorage.setItem('email.autoIncludeSignature', v ? '1' : '0'); } catch { /* ignore */ }
    if (!v) {
      // İmza kullanımını kapatınca mevcut imzayı kaldır
      setForm(f => ({ ...f, bodyHtml: stripSignatureHtml(f.bodyHtml) }));
    } else {
      // Açınca mevcut hesaba göre varsayılan imzayı uygula
      const sig = findDefaultSignatureForAccount(accountId ? Number(accountId) : null);
      if (sig) setForm(f => ({ ...f, bodyHtml: stripSignatureHtml(f.bodyHtml) + buildSignatureHtml(sig) }));
    }
  };
  const removeAttachment = async (p) => {
    try{ if(!draftId) return; const { attachments: list } = await deleteDraftAttachment(draftId, p); setAttachments(list||[]); } catch { /* ignore */ }
  };

  // Şablonlar: ilk yükleme
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await listTemplates();
        if (mounted) setTemplates(items || []);
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, []);

  // Şablon yönetimi işlemleri
  const onEditTemplate = (tpl) => {
    setTplForm({ id: tpl?.id || null, name: tpl?.name || '', html: tpl?.html || '', isShared: !!tpl?.isShared, shortcut: tpl?.shortcut || '' });
    setTplDialogOpen(true);
  };
  const onNewTemplate = () => { setTplForm({ id:null, name:'', html: form.bodyHtml || '', isShared:false, shortcut:'' }); setTplDialogOpen(true); };
  const onSaveTemplate = async () => {
    if (tplSaving) return;
    if (!String(tplForm.name||'').trim() || !String(tplForm.html||'').trim()) return;
    try{
      setTplSaving(true);
      if (tplForm.id) await updateTemplate(tplForm.id, { name: tplForm.name, html: tplForm.html, isShared: tplForm.isShared, shortcut: tplForm.shortcut });
      else await createTemplate({ name: tplForm.name, html: tplForm.html, isShared: tplForm.isShared, shortcut: tplForm.shortcut });
      setTplDialogOpen(false);
      const items = await listTemplates();
      setTemplates(items||[]);
      setInfo('Şablon kaydedildi');
    }catch(e){ setError(e.message || 'Şablon kaydedilemedi'); }
    finally{ setTplSaving(false); }
  };
  const onDeleteTemplate = async (tpl) => {
    if (!tpl?.id) return; if (!window.confirm('Bu şablonu silmek istiyor musunuz?')) return;
    try { await deleteTemplate(tpl.id); setTemplates(await listTemplates()); setInfo('Şablon silindi'); }
    catch(e){ setError(e.message || 'Şablon silinemedi'); }
  };

  // Şablon dialogu açıldığında adı alanına odaklan
  useEffect(() => {
    if (tplDialogOpen) setTimeout(() => tplNameRef.current?.focus?.(), 0);
  }, [tplDialogOpen]);

  // Adres önerileri (async)
  const scheduleAddrFetch = (input) => {
    const q = String(input||'').trim();
    if (addrFetchTimer.current) { clearTimeout(addrFetchTimer.current); addrFetchTimer.current = null; }
    if (!q || q.length < 2) { setAddrOptions([]); setAddrLoading(false); return; }
    setAddrLoading(true);
    addrFetchTimer.current = setTimeout(async () => {
      currentAddrQueryRef.current = q;
      try {
        // TTL cache: 5 dakika
        const cached = addrCacheRef.current.get(q);
        const now = Date.now();
        if (cached && (now - cached.ts) < 5*60*1000) {
          setAddrOptions(cached.items.map(it => ({ label: it.email, name: it.name })));
          return;
        }
        const items = await suggestContacts(q);
        addrCacheRef.current.set(q, { items, ts: now });
        if (currentAddrQueryRef.current === q) {
          setAddrOptions(items.map(it => ({ label: it.email, name: it.name })));
        }
      } finally {
        if (currentAddrQueryRef.current === q) setAddrLoading(false);
      }
    }, 300);
  };
  const onAddrInputChange = (_e, value) => { scheduleAddrFetch(value); };
  const onAddrSelectList = (field) => (_e, valueArray) => {
    const clean = (arr)=> (arr||[])
      .map(v => typeof v === 'string' ? v : v?.label)
      .filter(Boolean)
      .filter(isValidEmail);
    const arr = dedupeCaseInsensitive(clean(valueArray));
    if (field === 'to') setToList(arr);
    if (field === 'cc') setCcList(arr);
    if (field === 'bcc') setBccList(arr);
  };
  const makeKeyDownHandler = (field, listSetter) => (e) => {
    const v = String(e.target.value || '').trim();
    if (!v) return;
    if (e.key === 'Enter' || e.key === ',' || e.key === ';' || e.key === 'Tab'){
      e.preventDefault();
  if (!isValidEmail(v)) { setError('Geçersiz e-posta adresi'); return; }
  addUnique(listSetter, v);
    }
  };
  // Otomatik adres toplama global zamanlayıcıya taşındı (AppShellHeader)

  // Listeler değişince form string'lerini güncelle
  const joinEmails = (arr)=> (arr||[]).filter(Boolean).join(', ');
  useEffect(()=>{ setForm(f => (f.to === joinEmails(toList) ? f : { ...f, to: joinEmails(toList) })); }, [toList]);
  useEffect(()=>{ setForm(f => (f.cc === joinEmails(ccList) ? f : { ...f, cc: joinEmails(ccList) })); }, [ccList]);
  useEffect(()=>{ setForm(f => (f.bcc === joinEmails(bccList) ? f : { ...f, bcc: joinEmails(bccList) })); }, [bccList]);

  // To/Cc/Bcc arasında tekilleştirme: Öncelik sırası To > Cc > Bcc
  useEffect(() => {
    const toSet = new Set((toList||[]).map(x => String(x).toLowerCase()));
    const ccFiltered = (ccList||[]).filter(x => !toSet.has(String(x).toLowerCase()));
    const mix = new Set([...toSet, ...ccFiltered.map(x => String(x).toLowerCase())]);
    const bccFiltered = (bccList||[]).filter(x => !mix.has(String(x).toLowerCase()));
    const same = (a,b)=> (a||[]).join(',') === (b||[]).join(',');
    if (!same(ccList, ccFiltered)) setCcList(ccFiltered);
    if (!same(bccList, bccFiltered)) setBccList(bccFiltered);
  }, [toList, ccList, bccList]);

  async function handleSend(){
    try{
      setBusy(true); setError(''); setInfo('');
      // Uyarılar: konu veya içerik boşsa kullanıcıdan onay al
      if (!String(form.subject||'').trim()) {
        const proceed = window.confirm('Konu boş. Yine de göndermek istiyor musunuz?');
        if (!proceed) { setBusy(false); return; }
      }
      const plainFromHtml = String(stripSignatureHtml(form.bodyHtml||''))
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      const bodyPlain = String(form.bodyText||'').trim();
      if (!plainFromHtml && !bodyPlain) {
        const proceed = window.confirm('İçerik boş. Yine de göndermek istiyor musunuz?');
        if (!proceed) { setBusy(false); return; }
      }
      let id = draftId;
      if (!id) {
        const payload = { id: draftId || undefined, ...form, accountId: accountId || undefined };
        const { item } = await upsertDraft(payload);
        id = item.id; setDraftId(id);
      }
  const link = (linkEntityType && (linkEntityId || linkEntityKey)) ? { entityType: linkEntityType, entityId: linkEntityId, entityKey: linkEntityKey } : undefined;
  const res = await sendNow({ draftId: id, accountId: accountId || undefined, link });
      if (res.success){
        setInfo('Gönderildi');
        navigate('/');
      } else { setError(res.error || 'Gönderilemedi'); }
    } catch(e){ setError(e.message || 'Gönderilemedi'); }
    finally { setBusy(false); }
  }

  async function handleSchedule(){
    try{
      if(!scheduledAt) { setError('Plan tarihi seçin'); return; }
  if (!dayjs(scheduledAt).isAfter(dayjs())) { setError('Plan tarihi gelecekte olmalı'); return; }
      setBusy(true); setError(''); setInfo('');
      let id = draftId;
      if (!id) {
        const payload = { id: draftId || undefined, ...form, accountId: accountId || undefined };
        const { item } = await upsertDraft(payload);
        id = item.id; setDraftId(id);
      }
  const res = await scheduleSend({ draftId: id, scheduledAt, accountId: accountId || undefined });
  if (res.success){ setInfo('Planlandı'); setScheduledAt(''); }
      else setError(res.error || 'Planlanamadı');
    } catch(e){ setError(e.message || 'Planlanamadı'); }
    finally { setBusy(false); }
  }

  // Hızlı planla (Alt+S): boşsa +1 saat sonrası ile planla
  async function handleQuickSchedule(whenStr){
    try{
      const when = String(whenStr||'');
      if (!when || !dayjs(when).isAfter(dayjs())) { setError('Plan tarihi gelecekte olmalı'); return; }
      setBusy(true); setError(''); setInfo('');
      let id = draftId;
      if (!id) {
        const payload = { id: draftId || undefined, ...form, accountId: accountId || undefined };
        const { item } = await upsertDraft(payload);
        id = item.id; setDraftId(id);
      }
      const res = await scheduleSend({ draftId: id, scheduledAt: when, accountId: accountId || undefined });
      if (res.success){ setInfo('Planlandı'); setScheduledAt(''); }
      else setError(res.error || 'Planlanamadı');
    } catch(e){ setError(e.message || 'Planlanamadı'); }
    finally { setBusy(false); }
  }

  async function handleSave(){
    try{
      setBusy(true); setError('');
      const payload = { id: draftId, ...form, accountId: accountId || undefined };
      const { item } = await upsertDraft(payload);
      if (!draftId) setDraftId(item.id);
      setInfo('Taslak kaydedildi');
  // Yerel yedeği temizle
  try { localStorage.removeItem(localMirrorKey); } catch { /* ignore */ }
    } catch(e){ setError(e.message || 'Kaydedilemedi'); }
    finally { setBusy(false); }
  }

  const canSend = !busy && (toList?.length > 0);
  const scheduleInvalid = !scheduledAt || !dayjs(scheduledAt).isAfter(dayjs());
  const onRootKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canSend) handleSend();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      if (!busy) handleSave();
    }
    // Hızlı planla: Alt+S
    if (e.altKey && (e.key === 's' || e.key === 'S')){
      e.preventDefault();
      const when = scheduledAt || dayjs().add(1,'hour').format('YYYY-MM-DDTHH:mm');
      setScheduledAt(when);
      if (!busy) handleQuickSchedule(when);
    }
    // Şablon menüsünü aç: Ctrl+Shift+T
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 't' || e.key === 'T')){
      e.preventDefault();
      openTemplates({ currentTarget: templatesButtonRef.current });
    }
    // Kısayol ile şablon ekle: Ctrl+Shift+Y
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'y' || e.key === 'Y')){
      e.preventDefault();
      const code = window.prompt('Şablon kısayolu?');
      if (!code) return;
      const t = (templates||[]).find(x => String(x.shortcut||'').toLowerCase() === String(code).toLowerCase());
      if (t?.html) insertTemplate(t.html);
      else setError('Kısayol bulunamadı');
    }
    // Esc ile açik menüyü kapat
    if (e.key === 'Escape') {
  if (tplDialogOpen) { e.preventDefault(); setTplDialogOpen(false); return; }
  else if (templatesAnchor) closeTemplates();
    }
  };

  // Panodan dosya/görsel yapıştırmayı ek olarak yükle
  const onRootPaste = async (e) => {
    try {
      const files = Array.from(e.clipboardData?.files || []);
      if (!files.length) return;
      let effectiveDraftId = draftId;
      if (!effectiveDraftId) {
        // Henüz taslak yoksa oluştur
        const payload = { id: draftId || undefined, ...form, accountId: accountId || undefined };
        const { item } = await upsertDraft(payload);
        if (item?.id) { setDraftId(item.id); effectiveDraftId = item.id; }
      }
      if (!effectiveDraftId && !files.length) return;
      setUploading(true);
      for (const file of files) {
        if ((attachments?.length || 0) >= MAX_ATTACHMENTS) { setError(`En fazla ${MAX_ATTACHMENTS} ek ekleyebilirsiniz`); break; }
        if ((currentTotalBytes + file.size) > MAX_TOTAL_BYTES) { setError(`Toplam ek boyutu ${formatBytes(MAX_TOTAL_BYTES)} sınırını aşıyor`); break; }
        const { attachments: list } = await uploadDraftAttachment(effectiveDraftId, file);
        setAttachments(list||[]);
      }
      setInfo('Panodan ek(ler) eklendi');
    } catch(err) {
      setError(err?.message || 'Pano verisi eklenemedi');
    } finally {
      setUploading(false);
    }
  };

  return (
  <Box p={2} onKeyDown={onRootKeyDown} onPaste={onRootPaste}>
      <Stack spacing={1} mb={2}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: 12 }}>
          <Link underline="hover" color="inherit" href="/email/inbox">E-Posta</Link>
          <Typography color="text.primary" sx={{ fontSize: 12 }}>Yeni E-Posta</Typography>
        </Breadcrumbs>
        <Typography variant="h5">Yeni E-Posta</Typography>
      </Stack>
      <Paper variant="outlined" sx={{ borderColor: dragActive ? 'primary.main' : undefined }}>
        <Box p={2}
          sx={{ position: 'relative' }}
          onDragOver={(e)=>{ e.preventDefault(); setDragActive(true);} }
          onDragLeave={(e)=>{ e.preventDefault(); setDragActive(false);} }
          onDrop={async (e)=>{
            e.preventDefault();
            setDragActive(false);
            try{
              const files = Array.from(e.dataTransfer?.files || []);
              if (!files.length) return;
              // Taslak yoksa oluştur
              let id = draftId;
              if (!id) {
                const payload = { id: draftId || undefined, ...form, accountId: accountId || undefined };
                const { item } = await upsertDraft(payload);
                id = item.id; setDraftId(id);
              }
              setUploading(true);
              const allowedSlots = Math.max(0, MAX_ATTACHMENTS - (attachments?.length || 0));
              if (allowedSlots <= 0) { setError(`En fazla ${MAX_ATTACHMENTS} ek ekleyebilirsiniz`); return; }
              const toUpload = files.slice(0, allowedSlots);
              const skippedCount = files.length - toUpload.length;
              const skipMsgs = [];
              let accBytes = currentTotalBytes;
              for (const file of toUpload){
                if (file.size > 25*1024*1024) { skipMsgs.push(`${file.name}: 25MB sınırı aşıyor`); continue; }
                if ((accBytes + file.size) > MAX_TOTAL_BYTES) { skipMsgs.push(`${file.name}: toplam ${formatBytes(MAX_TOTAL_BYTES)} sınırı aşılırdı`); continue; }
                const { attachments: list } = await uploadDraftAttachment(id, file);
                setAttachments(list||[]);
                accBytes += file.size;
              }
              if (skippedCount > 0) skipMsgs.push(`${skippedCount} dosya ek sınırından dolayı atlandı`);
              if (skipMsgs.length) setError(skipMsgs.join(' • '));
              else setInfo('Ek yüklendi');
            } catch(err){ setError(err.message || 'Ek yüklenemedi'); }
            finally{ setUploading(false); }
          }}
        >
          {dragActive && (
            <Box sx={{ position:'absolute', inset:0, zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', bgcolor:'rgba(0,0,0,0.35)', color:'#fff', borderRadius:1, pointerEvents:'none' }}>
              <Typography variant="subtitle1">Dosyaları buraya bırakın — 25MB/dosya, max {MAX_ATTACHMENTS} ek</Typography>
            </Box>
          )}
          <Stack spacing={2}>
            {/* Hatalar sağ-alt Snackbar ile gösteriliyor */}
            
            {/* Başlık satırı: Sol boşluk + Sağda araçlar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: '40px' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Ek Ekle">
                  <span>
                    <IconButton component="label" color="default" size="small" aria-label="Ek ekle">
                      <AttachFileIcon />
                      <input type="file" hidden onChange={onPickFile} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Şablonlar (Ctrl+Shift+T)">
                  <IconButton color="default" size="small" onClick={openTemplates} ref={templatesButtonRef} aria-label="Şablonlar">
                    <DescriptionIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cevap hatırlatma">
                  <IconButton color="default" size="small" onClick={() => { prompt('Kaç gün sonra hatırlatalım?', '3'); }} aria-label="Cevap hatırlatma">
                    <MoreTimeIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Planla (Alt+S)">
                  <IconButton color="default" size="small" onClick={()=> setScheduledAt(dayjs().add(1,'hour').format('YYYY-MM-DDTHH:mm'))} aria-label="Planla">
                    <ScheduleSendIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Taslağı paylaş">
                  <IconButton color="default" size="small" onClick={()=> alert('Paylaşım: Taslağa katıl linki ekip içinde paylaşılabilir')} aria-label="Taslağı paylaş">
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
        {/* Mesajlardan adres toplama ve CSV içe aktarma Compose ekranından kaldırıldı. 
          Adres toplama arka planda otomatik yapılır; CSV içe aktarma posta ayarlarına taşınacaktır. */}
                <FormControl size="small" sx={{ minWidth: 200, ml: 1 }}>
                  <InputLabel id="compose-account">Hesap</InputLabel>
                  <Select labelId="compose-account" label="Hesap" value={accountId || ''} onChange={(e)=> setAccountId(e.target.value)}>
                    {(accounts||[])
                      .filter(a => (a.emailAddress||'').toLowerCase() !== 'noreply@bninovasyon.com')
                      .map(a => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.emailAddress || a.username || `Hesap #${a.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
        <Tooltip title={canSend ? "Gönder (Ctrl+Enter)" : "Alıcı ekleyin"}>
                  <span>
          <IconButton color="primary" size="small" onClick={handleSend} disabled={!canSend} aria-label="Gönder">
                      <SendIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Box>

            {/* Kime satırı */}
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={addrOptions}
                  loading={addrLoading}
                  onInputChange={onAddrInputChange}
                  value={toList}
                  onChange={onAddrSelectList('to')}
                      renderTags={(value, getTagProps) =>
                        (value||[]).map((opt, index) => {
                          const email = typeof opt === 'string' ? opt : (opt?.label || '');
                          const letter = (email || '?').trim().charAt(0).toUpperCase() || '?';
                          return (
                            <Chip
                              {...getTagProps({ index })}
                              label={email}
                              size="small"
                              avatar={<Avatar sx={{ width: 18, height: 18, fontSize: 12 }}>{letter}</Avatar>}
                            />
                          );
                        })
                      }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Kime"
                      placeholder="user@example.com"
                      onKeyDown={makeKeyDownHandler('to', setToList)}
                      onPaste={(e)=>{
                        try{
                          const text = e.clipboardData?.getData('text') || '';
                          if (!text) return;
                          const parts = text.split(/[\s,;\n\t]+/).map(s=>s.trim()).filter(Boolean).filter(isValidEmail);
                          if (!parts.length) return;
                          e.preventDefault();
                          setToList(prev => dedupeCaseInsensitive([...(prev||[]), ...parts]));
                        }catch{/* ignore */}
                      }}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: 40,
                          '& fieldset': { borderColor: 'transparent' },
                          '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
                          '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {addrLoading ? <CircularProgress color="inherit" size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  getOptionLabel={(opt)=> typeof opt === 'string' ? opt : (opt.label || '')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} />
            </Grid>

            {/* Cc/Bcc satırı */}
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={addrOptions}
                      loading={addrLoading}
                      onInputChange={onAddrInputChange}
                      value={ccList}
                      onChange={onAddrSelectList('cc')}
                      renderTags={(value, getTagProps) =>
                        (value||[]).map((opt, index) => {
                          const email = typeof opt === 'string' ? opt : (opt?.label || '');
                          const letter = (email || '?').trim().charAt(0).toUpperCase() || '?';
                          return (
                            <Chip
                              {...getTagProps({ index })}
                              label={email}
                              size="small"
                              avatar={<Avatar sx={{ width: 18, height: 18, fontSize: 12 }}>{letter}</Avatar>}
                            />
                          );
                        })
                      }
                      renderInput={(params) => (
                        <TextField 
                          {...params}
                          size="small" 
                          label="Cc" 
                          onKeyDown={makeKeyDownHandler('cc', setCcList)}
                          onPaste={(e)=>{
                            try{
                              const text = e.clipboardData?.getData('text') || '';
                              if (!text) return;
                              const parts = text.split(/[\s,;\n\t]+/).map(s=>s.trim()).filter(Boolean).filter(isValidEmail);
                              if (!parts.length) return;
                              e.preventDefault();
                              setCcList(prev => dedupeCaseInsensitive([...(prev||[]), ...parts]));
                            }catch{/* ignore */}
                          }}
                          fullWidth 
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: 40,
                              '& fieldset': { borderColor: 'transparent' },
                              '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
                              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                            }
                          }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {addrLoading ? <CircularProgress color="inherit" size={16} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                      getOptionLabel={(opt)=> typeof opt === 'string' ? opt : (opt.label || '')}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={addrOptions}
                      loading={addrLoading}
                      onInputChange={onAddrInputChange}
                      value={bccList}
                      onChange={onAddrSelectList('bcc')}
                      renderTags={(value, getTagProps) =>
                        (value||[]).map((opt, index) => {
                          const email = typeof opt === 'string' ? opt : (opt?.label || '');
                          const letter = (email || '?').trim().charAt(0).toUpperCase() || '?';
                          return (
                            <Chip
                              {...getTagProps({ index })}
                              label={email}
                              size="small"
                              avatar={<Avatar sx={{ width: 18, height: 18, fontSize: 12 }}>{letter}</Avatar>}
                            />
                          );
                        })
                      }
                      renderInput={(params) => (
                        <TextField 
                          {...params}
                          size="small" 
                          label="Bcc" 
                          onKeyDown={makeKeyDownHandler('bcc', setBccList)}
                          onPaste={(e)=>{
                            try{
                              const text = e.clipboardData?.getData('text') || '';
                              if (!text) return;
                              const parts = text.split(/[\s,;\n\t]+/).map(s=>s.trim()).filter(Boolean).filter(isValidEmail);
                              if (!parts.length) return;
                              e.preventDefault();
                              setBccList(prev => dedupeCaseInsensitive([...(prev||[]), ...parts]));
                            }catch{/* ignore */}
                          }}
                          fullWidth 
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: 40,
                              '& fieldset': { borderColor: 'transparent' },
                              '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
                              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                            }
                          }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {addrLoading ? <CircularProgress color="inherit" size={16} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                      getOptionLabel={(opt)=> typeof opt === 'string' ? opt : (opt.label || '')}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} />
            </Grid>

            {/* Konu satırı */}
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField 
                  size="small" 
                  label="Konu" 
                  value={form.subject} 
                  onChange={onChange('subject')} 
                  fullWidth 
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 40,
                      '& fieldset': { borderColor: 'transparent' },
                      '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} />
            </Grid>
            <Menu anchorEl={templatesAnchor} open={Boolean(templatesAnchor)} onClose={closeTemplates}>
              {templates.length === 0 && (
                <MuiMenuItem disabled>Şablon yok</MuiMenuItem>
              )}
              {templates.map(t => (
                <MuiMenuItem key={t.id} onClick={()=> insertTemplate(t.html)}>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                    <span>{t.name}</span>
                    {t.shortcut ? <Chip size="small" label={t.shortcut} /> : null}
                    <Box sx={{ flex:1 }} />
                    <Tooltip title="Düzenle"><IconButton size="small" onClick={(e)=>{ e.stopPropagation(); onEditTemplate(t); }}><BorderColorIcon fontSize="inherit" /></IconButton></Tooltip>
                    <Tooltip title="Sil"><IconButton size="small" color="error" onClick={(e)=>{ e.stopPropagation(); onDeleteTemplate(t); }}>✕</IconButton></Tooltip>
                  </Box>
                </MuiMenuItem>
              ))}
              <MuiMenuItem onClick={onNewTemplate}>+ Yeni Şablon</MuiMenuItem>
            </Menu>
            <Box>
              <Typography variant="subtitle2" gutterBottom>İçerik (Zengin Metin)</Typography>
              <Suspense fallback={<Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1, color: 'text.secondary', fontSize: 13 }}>Editör yükleniyor…</Box>}>
                <RichTextEditor value={form.bodyHtml} onChange={(html)=> setForm(f => ({ ...f, bodyHtml: html }))} />
              </Suspense>
              <Typography variant="caption" color="text.secondary">Gerekirse düz metin için (bodyText) alanı kullanılır.</Typography>
              <Stack direction="row" spacing={1} mt={1} alignItems="center" sx={{ position:'relative', zIndex: 1 }}>
                <FormControlLabel control={<Switch size="small" checked={!!autoSig} onChange={onToggleAutoSig} />} labelPlacement="end" label={<Typography variant="caption">İmzayı otomatik ekle</Typography>} />
                <Button size="small" variant="text" startIcon={<BorderColorIcon />} onClick={()=> insertSignature(signatures.find(s=> s.isDefault) || signatures[0])} disabled={!signatures?.length}>İmzayı Ekle</Button>
                {signatures?.length > 1 && (
                  <Stack direction="row" spacing={1}>
                    {signatures.map(s => (
                      <Chip key={s.id} size="small" label={s.name} onClick={()=> insertSignature(s)} />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {attachments.map((a) => (
                  <Chip key={a.path} label={`${a.filename}${a.size?` · ${formatBytes(a.size)}`:''}`} onDelete={()=> removeAttachment(a.path)} variant="outlined" />
                ))}
                {uploading && <Chip label="Yükleniyor..." color="info" variant="outlined" icon={<CircularProgress size={14} />} />}
                {(attachments?.length||0) > 0 && (
                  <Chip
                    size="small"
                    color={currentTotalBytes > MAX_TOTAL_BYTES*0.9 ? 'warning' : 'default'}
                    label={`${attachments.length}/${MAX_ATTACHMENTS} • ${formatBytes(currentTotalBytes)} / ${formatBytes(MAX_TOTAL_BYTES)}`}
                  />
                )}
              </Stack>
              <Box flex={1} />
              {(attachments?.length||0) > 0 && (
                <Tooltip title="Tüm ekleri temizle">
                  <span>
                    <Button size="small" onClick={async ()=>{
                      if (!draftId) return;
                      if (!window.confirm('Tüm ekleri silmek istiyor musunuz?')) return;
                      try{
                        for (const a of attachments){
                          await deleteDraftAttachment(draftId, a.path);
                        }
                        const { items } = await listDraftAttachments(draftId);
                        setAttachments(items||[]);
                        setInfo('Tüm ekler temizlendi');
                      }catch(err){ setError(err.message || 'Ekler temizlenemedi'); }
                    }}>Tümünü temizle</Button>
                  </span>
                </Tooltip>
              )}
              {collab && collab.length>0 && (
                <Stack direction="row" spacing={1}>
                  {collab.map(u => (<Chip key={u.id} size="small" label={u.name||`Kişi #${u.id}`} color="info" />))}
                </Stack>
              )}
            </Stack>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  type="datetime-local"
                  label="Planla (tarih/saat)"
                  InputLabelProps={{ shrink: true }}
                  value={scheduledAt}
                  onChange={(e)=> setScheduledAt(e.target.value)}
                  fullWidth
                  inputProps={{ min: dayjs().format('YYYY-MM-DDTHH:mm') }}
                  helperText={`Yerel saat dilimi: ${Intl.DateTimeFormat().resolvedOptions().timeZone || 'bilinmiyor'}`}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={()=>{
                    const normalized = normalizeFormForSave(form);
                    const prev = lastSavedDataRef.current;
                    const changed = !prev || JSON.stringify(prev) !== JSON.stringify(normalized);
                    if (changed && !window.confirm('Kaydedilmemiş değişiklikler var. Çıkmak istiyor musunuz?')) return;
                    navigate(-1);
                  }} disabled={busy}>İptal</Button>
                  <Button variant="outlined" color="info" onClick={handleSave} disabled={busy} title="Ctrl+S ile kaydedebilirsiniz">Taslak olarak kaydet</Button>
                  <Button variant="contained" color="secondary" onClick={handleSchedule} disabled={busy || scheduleInvalid}>Planla</Button>
                  <Button variant="contained" onClick={handleSend} disabled={!canSend}>Gönder</Button>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Paper>
      {/* Snackbar: sağ-alt, 3.5s */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={!!info}
        autoHideDuration={3500}
        onClose={()=> setInfo('')}
        message={info}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={!!error}
        autoHideDuration={4500}
        onClose={()=> setError('')}
        message={error}
      />
      {tplDialogOpen && (
        <Suspense fallback={null}>
          <TemplateEditorPanel
            tplForm={tplForm}
            setTplForm={setTplForm}
            tplSaving={tplSaving}
            onSaveTemplate={onSaveTemplate}
            onClose={() => setTplDialogOpen(false)}
            tplNameRef={tplNameRef}
          />
        </Suspense>
      )}
    </Box>
  );
}
