import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  Stack,
  Divider,
  Rating,
  LinearProgress
} from '@mui/material';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { useAppTheme } from '../contexts/useAppTheme';
import UniversalStatusChip from '../components/common/UniversalStatusChip';
import { UniversalPageHeader } from '../components/universal';
import { researchSuppliersFull, getResearchJobs, getResearchJob, markResearchSaved, setResearchSavedMap, getResearchSavedMap } from '../api/suppliers';
import { createCompany } from '../api/companies';
import { checkCompanyDuplicate } from '../api/companies';
import { exportCompanies } from '../api/companies';
import { getCompanyById } from '../api/companies';

// Mock data
const mockSuppliers = [
  {
    id: 1,
    name: 'ABC Teknoloji Ltd.',
    category: 'Teknoloji',
    country: 'Türkiye',
    city: 'İstanbul',
    email: 'info@abcteknoloji.com',
    phone: '+90 212 555 0101',
    website: 'www.abcteknoloji.com',
    rating: 4.5,
    totalOrders: 156,
    totalValue: 2500000,
    status: 'active',
    performance: 94,
    deliveryTime: 5,
    qualityScore: 4.7,
    priceCompetitiveness: 4.2,
    reliability: 4.8,
    lastOrderDate: '2025-01-15',
    establishedYear: 2015,
    employeeCount: 150,
    certifications: ['ISO 9001', 'ISO 14001', 'CE'],
    specialties: ['Bilgisayar', 'Ağ Ekipmanları', 'Yazılım']
  },
  {
    id: 2,
    name: 'Güvenlik Sistemleri A.Ş.',
    category: 'Güvenlik',
    country: 'Türkiye',
    city: 'Ankara',
    email: 'satış@guvenliksistem.com',
    phone: '+90 312 555 0202',
    website: 'www.guvenliksistem.com',
    rating: 4.8,
    totalOrders: 89,
    totalValue: 1800000,
    status: 'active',
    performance: 97,
    deliveryTime: 3,
    qualityScore: 4.9,
    priceCompetitiveness: 3.8,
    reliability: 4.9,
    lastOrderDate: '2025-01-20',
    establishedYear: 2010,
    employeeCount: 75,
    certifications: ['ISO 27001', 'TSE'],
    specialties: ['CCTV', 'Alarm Sistemleri', 'Erişim Kontrolü']
  }
];

const categories = ['Tümü', 'Teknoloji', 'Güvenlik', 'Mobilya', 'Tıbbi Malzeme'];
const countries = ['Tümü', 'Türkiye', 'Almanya', 'Çin', 'ABD'];

const SupplierManagement = () => {
  const { theme } = useAppTheme();
  const [suppliers] = useState(mockSuppliers);
  const [filteredSuppliers, setFilteredSuppliers] = useState(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedCountry, setSelectedCountry] = useState('Tümü');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // AI Tedarikçi Araştırma durumu
  const [researchForm, setResearchForm] = useState({ query: '', brand: '', article: '', targetCountry: '' });
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchResults, setResearchResults] = useState([]);
  const [researchError, setResearchError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [savedIndices, setSavedIndices] = useState(new Set()); // anlık araştırma önerileri için
  const [currentJobId, setCurrentJobId] = useState(null);
  const [dupMap, setDupMap] = useState(new Map()); // idx -> {duplicate, matches}
  const [savedMap, setSavedMap] = useState(new Map()); // idx -> companyId (current research)
  // AI durum self-test
  const [aiStatus, setAiStatus] = useState(null);
  const [aiStatusLoading, setAiStatusLoading] = useState(false);

  // Araştırma geçmişi UI durumu
  const [showHistory, setShowHistory] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobsCount, setJobsCount] = useState(0);
  const jobsLimit = 50;
  const [jobsOffset, setJobsOffset] = useState(0);
  const [jobsSort, setJobsSort] = useState('createdAt');
  const [jobsOrder, setJobsOrder] = useState('DESC');
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');
  const [jobsStatus, setJobsStatus] = useState(''); // completed|running|failed
  const [jobsProvider, setJobsProvider] = useState(''); // gemini|fallback
  const [selectedJob, setSelectedJob] = useState(null); // { job, suggestions }
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [jobSavedIndices, setJobSavedIndices] = useState(new Set());
  const [jobsQuery, setJobsQuery] = useState('');
  const [jobDupMap, setJobDupMap] = useState(new Map()); // history detail için idx -> dup info
  const [jobSavedMap, setJobSavedMap] = useState(new Map()); // history detail idx -> companyId
  // Mükerrer detay dialogu
  const [dupDialogOpen, setDupDialogOpen] = useState(false);
  const [dupDialogMatches, setDupDialogMatches] = useState([]);
  const [dupDialogTitle, setDupDialogTitle] = useState('');
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [companyDialogData, setCompanyDialogData] = useState(null);

  useEffect(() => {
    let filtered = suppliers;

    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'Tümü') {
      filtered = filtered.filter(supplier => supplier.category === selectedCategory);
    }

    if (selectedCountry !== 'Tümü') {
      filtered = filtered.filter(supplier => supplier.country === selectedCountry);
    }

    setFilteredSuppliers(filtered);
  }, [searchTerm, selectedCategory, selectedCountry, suppliers]);

  // Geçmiş paneli değişkenleri değiştikçe server'dan veri çek
  useEffect(() => {
    (async () => {
      if (!showHistory) return;
      try {
        setJobsLoading(true);
        setJobsError('');
        const res = await getResearchJobs({
          limit: jobsLimit,
          offset: jobsOffset,
          sort: jobsSort,
          order: jobsOrder,
          q: jobsQuery.trim() || undefined,
          status: jobsStatus || undefined,
          provider: jobsProvider || undefined
        });
        setJobs(res.jobs);
        setJobsCount(res.count || res.jobs.length || 0);
      } catch (e) {
        setJobsError(e?.message || 'Geçmiş alınamadı');
      } finally {
        setJobsLoading(false);
      }
    })();
  }, [showHistory, jobsOffset, jobsSort, jobsOrder, jobsQuery, jobsStatus, jobsProvider]);

  // Araştırma sonuçları geldiğinde otomatik mükerrer kontrolü yap
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!Array.isArray(researchResults) || researchResults.length === 0) return;
      try {
        const entries = [];
        for (let idx = 0; idx < researchResults.length; idx++) {
          const sug = researchResults[idx];
          const url = sug?.url || sug?.link || sug?.website || '';
          const name = sug?.name || sug?.title || (url ? new URL(url, window.location.origin).hostname : `Öneri ${idx+1}`);
          try {
            const dup = await checkCompanyDuplicate({ name, website: url });
            entries.push([idx, dup]);
          } catch {
            // sessiz geç
          }
        }
        if (!cancelled && entries.length) {
          setDupMap(prev => {
            const m = new Map(prev);
            entries.forEach(([i, d]) => m.set(i, d));
            return m;
          });
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [researchResults]);

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  };

  const supplierStatusMap = {
    active: 'approved',
    pending: 'pending',
    suspended: 'rejected'
  };

  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.status === 'active').length,
    avgRating: (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1),
    totalValue: suppliers.reduce((sum, s) => sum + s.totalValue, 0)
  };

  return (
    <Box sx={{ 
      p: 2,
      bgcolor: 'background.default',
      minHeight: 'calc(100vh - 64px)',
      width: '100%'
    }}>
  <UniversalPageHeader title="Tedarikçi Yönetimi" subtitle="Tedarikçilerinizi yönetin, performanslarını takip edin ve yeni tedarikçiler ekleyin" />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`, color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Toplam Tedarikçi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.colors.success} 0%, #4caf50 100%)`, color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.active}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Aktif Tedarikçi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #3f51b5 100%)`, color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.avgRating}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ortalama Puan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, #9c27b0 100%)`, color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₺{(stats.totalValue / 1000000).toFixed(1)}M
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Toplam İşlem Hacmi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid
            size={{
              xs: 12,
              md: 4
            }}>
            <TextField
              fullWidth
              placeholder="Tedarikçi ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={16} style={{ color: 'var(--mui-palette-text-secondary)', marginRight: 4 }} />
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 2
            }}>
            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Kategori"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 2
            }}>
            <FormControl fullWidth>
              <InputLabel>Ülke</InputLabel>
              <Select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                label="Ülke"
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>{country}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 4
            }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                sx={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)` }}
              >
                Yeni Tedarikçi
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download size={16} />}
                onClick={async ()=>{
                  try {
                    const res = await exportCompanies();
                    const json = typeof res?.data === 'object' ? JSON.stringify(res.data, null, 2) : String(res?.data ?? '');
                    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
                    const link = document.createElement('a');
                    const urlObj = URL.createObjectURL(blob);
                    link.href = urlObj;
                    link.setAttribute('download', 'companies.json');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(urlObj);
                  } catch (e) {
                    try { (await import('sonner')).toast?.error?.(e?.message || 'Dışa aktarma başarısız'); } catch { /* noop */ }
                  }
                }}
              >
                Dışa Aktar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* AI Tedarikçi Araştırma Paneli */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>AI Tedarikçi Araştırma</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {!!researchResults?.length && (
              <Chip size="small" label={`${researchResults.length} öneri`} sx={{ bgcolor: theme.colors.background }} />
            )}
            <Button
              size="small"
              variant="outlined"
              disabled={aiStatusLoading}
              onClick={async ()=>{
                setAiStatus(null);
                setAiStatusLoading(true);
                try {
                  // axios instance baseURL=/api, bu nedenle /ai/selftest doğru hedefe gider
                  const { default: api } = await import('../utils/axios');
                  const r = await api.get('/ai/selftest');
                  setAiStatus(r?.data || null);
                } catch {
                  // self-test hatasını UI'da sessiz geç: kullanıcı zaten ana panelde uyarı görecek
                } finally {
                  setAiStatusLoading(false);
                }
              }}
            >Durumu Kontrol Et</Button>
          </Stack>
        </Box>
        <Grid container spacing={1} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Sorgu"
              placeholder="Örn: endüstriyel vana üreticisi"
              fullWidth
              value={researchForm.query}
              onChange={(e) => setResearchForm(f => ({ ...f, query: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Marka"
              placeholder="Örn: Siemens"
              fullWidth
              value={researchForm.brand}
              onChange={(e) => setResearchForm(f => ({ ...f, brand: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Model / Parça Kodu"
              placeholder="Örn: 6ES7 214-1AG40-0XB0"
              fullWidth
              value={researchForm.article}
              onChange={(e) => setResearchForm(f => ({ ...f, article: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              label="Hedef Ülke"
              placeholder="Örn: TR, DE, US"
              fullWidth
              value={researchForm.targetCountry}
              onChange={(e) => setResearchForm(f => ({ ...f, targetCountry: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Search size={16} />}
              disabled={researchLoading || (!researchForm.query && !researchForm.brand && !researchForm.article)}
              onClick={async () => {
                setResearchError('');
                setResearchLoading(true);
                setSavedIndices(new Set());
                setSavedMap(new Map());
                try {
                  const { suggestions: results, jobId } = await researchSuppliersFull({
                    query: researchForm.query?.trim() || undefined,
                    brand: researchForm.brand?.trim() || undefined,
                    article: researchForm.article?.trim() || undefined,
                    targetCountry: researchForm.targetCountry?.trim() || undefined
                  });
                  setCurrentJobId(jobId ?? null);
                  let out = Array.isArray(results) ? results : [];
                  // Frontend fallback: sonuç yoksa en az 1 öneri üret
                  if ((!out || out.length === 0) && (researchForm.query || researchForm.brand || researchForm.article)) {
                    const base = (researchForm.brand || researchForm.article || researchForm.query || '').trim();
                    if (base) {
                      out = [{
                        name: `${base} Tedarik`,
                        country: researchForm.targetCountry || 'TR',
                        url: '',
                        notes: 'Yerel fallback (AI kapalıysa gösterilir)',
                        confidence: 0.15
                      }];
                    }
                  }
                  setResearchResults(out);
                  // mevcut job için saved-map çek
                  if (jobId) {
                    try {
                      const items = await getResearchSavedMap(jobId);
                      const m = new Map();
                      items.forEach(it => { if (Number.isInteger(it.index) && Number.isInteger(it.companyId)) m.set(it.index, it.companyId); });
                      setSavedMap(m);
                    } catch { /* sessiz */ }
                  }
                } catch (e) {
                  // 501 gibi durumlar için kullanıcı dostu mesaj
                  const msg = e?.response?.data?.message || e?.message || 'Araştırma başarısız.';
                  setResearchError(msg);
                  setResearchResults([]);
                } finally {
                  setResearchLoading(false);
                }
              }}
              sx={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)` }}
            >
              Araştır
            </Button>
          </Grid>
        </Grid>
        {researchLoading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
        {!!researchError && (
          <Box sx={{ mt: 2 }}>
            <Stack spacing={1}>
              <Chip color="warning" icon={<AlertTriangle size={16} />} label={researchError} />
              {/etkin değil|enabled/i.test(researchError) && (
                <Typography variant="caption" color="text.secondary">
                  AI öneri servisi etkin değil görünüyor. GEMINI_API_KEY ayarını yapın ve yukarıdaki "Durumu Kontrol Et" ile doğrulayın.
                </Typography>
              )}
            </Stack>
          </Box>
        )}
        {aiStatusLoading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
        {!!aiStatus && (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" label={`Google Translate: ${aiStatus.googleTranslate?.configured ? (aiStatus.googleTranslate?.ok ? 'OK' : 'hatalı') : 'yok'}`} />
              <Chip size="small" label={`Gemini: ${aiStatus.gemini?.configured ? (aiStatus.gemini?.ok ? 'OK' : 'hatalı') : 'yok'}`} />
              <Chip size="small" label={`Süre: ${aiStatus.durationMs}ms`} />
            </Stack>
          </Box>
        )}
        {!!researchResults?.length && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ad</TableCell>
                  <TableCell>Ülke</TableCell>
                  <TableCell>Bağlantı</TableCell>
                  <TableCell>Güven</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell align="right">İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Fallback bilgisini kullanıcıya küçük bir chip ile göster */}
                {researchResults.length === 1 && researchResults[0]?.notes?.includes('fallback') && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Chip size="small" label="AI kapalı: yerel fallback öneri gösteriliyor" />
                    </TableCell>
                  </TableRow>
                )}
                {researchResults.map((sug, idx) => {
                  const url = sug?.url || sug?.link || sug?.website || '';
                  const name = sug?.name || sug?.title || (url ? new URL(url, window.location.origin).hostname : `Öneri ${idx+1}`);
                  const hostname = (() => { try { return url ? new URL(url).hostname : ''; } catch { return ''; }})();
                  const confidence = typeof sug?.confidence === 'number' ? Math.round(sug.confidence * 100) : (typeof sug?.score === 'number' ? Math.round(sug.score * 100) : null);
                  const country = sug?.country || sug?.location || '';
                  const snippet = sug?.snippet || sug?.description || sug?.notes || '';
                  const saved = savedIndices.has(idx);
                  const linkedCompanyId = savedMap.get(idx);
                  const dupInfo = dupMap.get(idx);
                  return (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{name}</Typography>
                        {!!hostname && (
                          <Typography variant="caption" color="text.secondary">{hostname}</Typography>
                        )}
                      </TableCell>
                      <TableCell>{country || '-'}</TableCell>
                      <TableCell>
                        {url ? (
                          <Button component="a" href={url} target="_blank" rel="noreferrer" size="small" startIcon={<Globe size={14} />}>Aç</Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {confidence != null ? (
                          <Chip size="small" label={`${confidence}%`} sx={{ bgcolor: theme.colors.background }} />
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" noWrap title={snippet}>{snippet || '-'}</Typography>
                          {dupInfo?.duplicate && (
                            <Tooltip title={`Zaten mevcut (${dupInfo.count})`}>
                              <Chip
                                size="small"
                                color="warning"
                                label="Mükerrer"
                                onClick={() => {
                                  setDupDialogTitle(name);
                                  setDupDialogMatches(Array.isArray(dupInfo?.matches) ? dupInfo.matches : []);
                                  setDupDialogOpen(true);
                                }}
                                sx={{ cursor: 'pointer' }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        {saved ? (
                          <Chip size="small" color="success" label="Kaydedildi" />
                        ) : (
                          <Button
                          size="small"
              variant="contained"
              disabled={savingId === idx || dupInfo?.duplicate}
                          onClick={async ()=>{
                            setSavingId(idx);
                            try {
                              // önce duplicate kontrol
                              const dup = await checkCompanyDuplicate({ name, website: url });
                              setDupMap(prev => new Map(prev).set(idx, dup));
                              if (dup?.duplicate) {
                                try { (await import('sonner')).toast?.message?.('Bu tedarikçi zaten kayıtlı görünüyor'); } catch { /* noop */ }
                                return;
                              }
                              const payload = {
                                name: name,
                                country: country || undefined,
                                website: url || undefined,
                                notes: snippet || undefined,
                                type: 'supplier'
                              };
                              const created = await createCompany(payload);
                              try { (await import('sonner')).toast?.success?.('Tedarikçi kaydedildi'); } catch { /* noop */ }
                              setSavedIndices(prev => new Set(prev).add(idx));
                              if (currentJobId != null) {
                                try {
                                  await markResearchSaved(currentJobId, [idx]);
                                  if (created?.id) {
                                    await setResearchSavedMap(currentJobId, { index: idx, companyId: created.id });
                                  }
                                } catch { /* noop */ }
                              }
                            } catch (e) {
                              const msg = e?.response?.data?.message || e?.message || 'Kaydetme başarısız';
                              try { (await import('sonner')).toast?.error?.(msg); } catch { /* noop */ }
                            } finally {
                              setSavingId(null);
                            }
                          }}
                        >Kaydet</Button>
                        )}
                        {!!linkedCompanyId && (
                          <Button size="small" sx={{ ml: 1 }} variant="outlined" onClick={async ()=>{
                            try {
                              const c = await getCompanyById(linkedCompanyId);
                              setCompanyDialogData(c);
                              setCompanyDialogOpen(true);
                            } catch { /* noop */ }
                          }}>Şirketi Aç</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Araştırma Geçmişi Paneli */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Araştırma Geçmişi</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Geçmişte ara..."
              value={jobsQuery}
              onChange={(e)=>setJobsQuery(e.target.value)}
            />
            <Button size="small" variant="outlined" onClick={() => setShowHistory(v => !v)}>
              {showHistory ? 'Gizle' : 'Göster'}
            </Button>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Durum</InputLabel>
              <Select value={jobsStatus} label="Durum" onChange={(e)=>{ setJobsStatus(e.target.value); setJobsOffset(0); }}>
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="completed">Tamamlandı</MenuItem>
                <MenuItem value="running">Çalışıyor</MenuItem>
                <MenuItem value="failed">Hatalı</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Sağlayıcı</InputLabel>
              <Select value={jobsProvider} label="Sağlayıcı" onChange={(e)=>{ setJobsProvider(e.target.value); setJobsOffset(0); }}>
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="gemini">Gemini</MenuItem>
                <MenuItem value="fallback">Fallback</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
        {showHistory && (
          <>
            {jobsLoading && <LinearProgress />}
            {!!jobsError && (
              <Box sx={{ mt: 1 }}>
                <Chip color="warning" icon={<AlertTriangle size={16} />} label={jobsError} />
              </Box>
            )}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sırala</InputLabel>
                <Select value={jobsSort} label="Sırala" onChange={(e)=>{ setJobsSort(e.target.value); setJobsOffset(0); }}>
                  <MenuItem value="createdAt">Tarih</MenuItem>
                  <MenuItem value="durationMs">Süre</MenuItem>
                  <MenuItem value="suggestionsCount">Öneri</MenuItem>
                  <MenuItem value="provider">Sağlayıcı</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Yön</InputLabel>
                <Select value={jobsOrder} label="Yön" onChange={(e)=>{ setJobsOrder(e.target.value); setJobsOffset(0); }}>
                  <MenuItem value="DESC">Azalan</MenuItem>
                  <MenuItem value="ASC">Artan</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button size="small" disabled={jobsOffset<=0 || jobsLoading} onClick={()=>{
                  setJobsOffset(o=>Math.max(0, o - jobsLimit));
                }}>Önceki</Button>
                <Typography variant="caption">{jobsOffset+1}-{Math.min(jobsOffset+jobsLimit, jobsCount)} / {jobsCount}</Typography>
                <Button size="small" disabled={jobsOffset + jobsLimit >= jobsCount || jobsLoading} onClick={()=>{
                  setJobsOffset(o=>o + jobsLimit);
                }}>Sonraki</Button>
              </Stack>
            </Stack>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Sorgu</TableCell>
                    <TableCell>Marka</TableCell>
                    <TableCell>Parça</TableCell>
                    <TableCell>Ülke</TableCell>
                    <TableCell>Sağlayıcı</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Öneri</TableCell>
                    <TableCell>Süre (ms)</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(jobs || []).filter(j => {
                    const q = jobsQuery.trim().toLowerCase();
                    if (!q) return true;
                    const s = `${j.query||''} ${j.brand||''} ${j.article||''} ${j.targetCountry||''}`.toLowerCase();
                    return s.includes(q);
                  }).map(job => (
                    <TableRow key={job.id} hover>
                      <TableCell>{job.id}</TableCell>
                      <TableCell>{job.query || '-'}</TableCell>
                      <TableCell>{job.brand || '-'}</TableCell>
                      <TableCell>{job.article || '-'}</TableCell>
                      <TableCell>{job.targetCountry || '-'}</TableCell>
                      <TableCell>{job.provider || '-'}</TableCell>
                      <TableCell>
                        <UniversalStatusChip status={(job.status || '').toLowerCase()} />
                      </TableCell>
                      <TableCell>{job.suggestionsCount ?? '-'}</TableCell>
                      <TableCell>{job.durationMs ?? '-'}</TableCell>
                      <TableCell>{job.createdAt ? new Date(job.createdAt).toLocaleString() : '-'}</TableCell>
                      <TableCell align="right">
            <Button size="small" onClick={async ()=>{
                          setSelectedRows(new Set());
                          setJobError('');
                          setJobLoading(true);
                          try {
                            const data = await getResearchJob(job.id);
                            setSelectedJob(data);
                            setJobSavedIndices(new Set(Array.isArray(data?.savedIndices) ? data.savedIndices : []));
                // saved-map çek
                try {
                  const items = await getResearchSavedMap(job.id);
                  const m = new Map();
                  items.forEach(it => { if (Number.isInteger(it.index) && Number.isInteger(it.companyId)) m.set(it.index, it.companyId); });
                  setJobSavedMap(m);
                } catch { /* noop */ }
                          } catch(e){
                            setJobError(e?.message || 'Kayıt alınamadı');
                            setSelectedJob(null);
                          } finally { setJobLoading(false); }
                        }}>Görüntüle</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {jobLoading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
              </Box>
            )}
            {!!jobError && (
              <Box sx={{ mt: 2 }}>
                <Chip color="warning" icon={<AlertTriangle size={16} />} label={jobError} />
              </Box>
            )}
            {/* Seçili geçmiş kaydı yüklendiğinde öneriler için mükerrer kontrolü */}
            {selectedJob && !jobLoading && (
              <AutoDupCheck job={selectedJob} onMap={(m)=> setJobDupMap(m)} />
            )}
            {!!selectedJob?.suggestions?.length && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Seçili Kayıt: #{selectedJob?.job?.id} — {selectedJob?.job?.query || selectedJob?.job?.brand || selectedJob?.job?.article || ''}
                    {Array.isArray(selectedJob?.suggestions) && (
                      <>
                        {' '}(<strong>{jobSavedIndices.size}</strong> / {selectedJob.suggestions.length} kaydedildi)
                      </>
                    )}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                    size="small"
                    variant="contained"
                    disabled={bulkSaving || selectedRows.size === 0}
                    onClick={async ()=>{
                      setBulkSaving(true);
                      try {
                        const list = selectedJob.suggestions;
                        for (const idx of Array.from(selectedRows)) {
                          const sug = list[idx];
                          if (!sug) continue;
                          const url = sug?.url || sug?.link || sug?.website || '';
                          const name = sug?.name || sug?.title || (url ? new URL(url, window.location.origin).hostname : `Öneri ${idx+1}`);
                          const country = sug?.country || sug?.location || '';
                          const snippet = sug?.snippet || sug?.description || sug?.notes || '';
                          // duplicate check
                          try {
                            const dup = await checkCompanyDuplicate({ name, website: url });
                            if (dup?.duplicate) continue;
                          } catch { /* noop */ }
                          const payload = { name, country: country || undefined, website: url || undefined, notes: snippet || undefined, type: 'supplier' };
                          try {
                            const c = await createCompany(payload);
                            if (selectedJob?.job?.id && c?.id) {
                              try { await setResearchSavedMap(selectedJob.job.id, { index: idx, companyId: c.id }); } catch { /* noop */ }
                            }
                          } catch { /* tekil hata, devam et */ }
                        }
                        try { (await import('sonner')).toast?.success?.('Seçilenler kaydedildi'); } catch { /* noop */ }
                        setJobSavedIndices(prev => {
                          const next = new Set(prev);
                          Array.from(selectedRows).forEach(i => next.add(i));
                          return next;
                        });
                        try { await markResearchSaved(selectedJob?.job?.id, Array.from(selectedRows)); } catch { /* noop */ }
                      } finally {
                        setBulkSaving(false);
                      }
                    }}
                  >Seçilenleri Kaydet</Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        try {
                          const rows = selectedJob.suggestions.map((sug, idx) => {
                            const url = sug?.url || sug?.link || sug?.website || '';
                            const name = sug?.name || sug?.title || (url ? new URL(url, window.location.origin).hostname : `Öneri ${idx+1}`);
                            const country = sug?.country || sug?.location || '';
                            const snippet = sug?.snippet || sug?.description || sug?.notes || '';
                            const score = typeof sug?.confidence === 'number' ? sug.confidence : (typeof sug?.score === 'number' ? sug.score : '');
                            return { name, country, url, snippet, score };
                          });
                          const header = ['name','country','url','snippet','score'];
                          const csv = [header.join(','), ...rows.map(r => header.map(h => (`${(r[h] ?? '').toString().replaceAll('"','""')}`)).map(v=>`"${v}"`).join(','))].join('\n');
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                          const link = document.createElement('a');
                          const urlObj = URL.createObjectURL(blob);
                          link.href = urlObj;
                          const fname = `research_job_${selectedJob?.job?.id || 'export'}.csv`;
                          link.setAttribute('download', fname);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(urlObj);
                        } catch { /* noop */ }
                      }}
                    >CSV Dışa Aktar</Button>
                  </Stack>
                </Box>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <input
                            type="checkbox"
                            checked={selectedRows.size > 0 && selectedRows.size === selectedJob.suggestions.length}
                            onChange={(e)=>{
                              const all = new Set();
                              if (e.target.checked) {
                                selectedJob.suggestions.forEach((_, i) => all.add(i));
                              }
                              setSelectedRows(all);
                            }}
                          />
                        </TableCell>
                        <TableCell>Ad</TableCell>
                        <TableCell>Ülke</TableCell>
                        <TableCell>Bağlantı</TableCell>
                        <TableCell>Güven</TableCell>
                        <TableCell>Açıklama</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedJob.suggestions.map((sug, idx) => {
                        const url = sug?.url || sug?.link || sug?.website || '';
                        const name = sug?.name || sug?.title || (url ? new URL(url, window.location.origin).hostname : `Öneri ${idx+1}`);
                        const hostname = (() => { try { return url ? new URL(url).hostname : ''; } catch { return ''; }})();
                        const confidence = typeof sug?.confidence === 'number' ? Math.round(sug.confidence * 100) : (typeof sug?.score === 'number' ? Math.round(sug.score * 100) : null);
                        const country = sug?.country || sug?.location || '';
                        const snippet = sug?.snippet || sug?.description || sug?.notes || '';
                        const saved = jobSavedIndices.has(idx);
                        const linkedCompanyId = jobSavedMap.get(idx);
                        const dupInfo = jobDupMap.get(idx);
                        const checked = selectedRows.has(idx);
                        return (
                          <TableRow key={idx} hover>
                            <TableCell padding="checkbox">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={saved || dupInfo?.duplicate}
                                onChange={(e)=>{
                                  setSelectedRows(prev => {
                                    const next = new Set(prev);
                                    if (e.target.checked) next.add(idx); else next.delete(idx);
                                    return next;
                                  });
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{name}</Typography>
                              {!!hostname && (
                                <Typography variant="caption" color="text.secondary">{hostname}</Typography>
                              )}
                            </TableCell>
                            <TableCell>{country || '-'}</TableCell>
                            <TableCell>
                              {url ? (
                                <Button component="a" href={url} target="_blank" rel="noreferrer" size="small" startIcon={<Globe size={14} />}>Aç</Button>
                              ) : (
                                <Typography variant="caption" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {confidence != null ? (
                                <Chip size="small" label={`${confidence}%`} sx={{ bgcolor: theme.colors.background }} />
                              ) : (
                                <Typography variant="caption" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" noWrap title={snippet}>{snippet || '-'}</Typography>
                                {dupInfo?.duplicate && (
                                  <Tooltip title={`Zaten mevcut (${dupInfo.count})`}>
                                    <Chip
                                      size="small"
                                      color="warning"
                                      label="Mükerrer"
                                      onClick={() => {
                                        setDupDialogTitle(name);
                                        setDupDialogMatches(Array.isArray(dupInfo?.matches) ? dupInfo.matches : []);
                                        setDupDialogOpen(true);
                                      }}
                                      sx={{ cursor: 'pointer' }}
                                    />
                                  </Tooltip>
                                )}
                                {saved && (
                                  <Tooltip title="Bu öneri şirket olarak kaydedildi">
                                    <Chip size="small" color="success" label="Kaydedildi" />
                                  </Tooltip>
                                )}
                                {!!linkedCompanyId && (
                                  <Button size="small" variant="outlined" onClick={async ()=>{
                                    try {
                                      const c = await getCompanyById(linkedCompanyId);
                                      setCompanyDialogData(c);
                                      setCompanyDialogOpen(true);
                                    } catch { /* noop */ }
                                  }}>Şirketi Aç</Button>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        )}
      </Card>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.colors.background }}>
                <TableCell>Tedarikçi</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Konum</TableCell>
                <TableCell>Puan</TableCell>
                <TableCell>Performans</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.colors.primary }}>
                        {supplier.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {supplier.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {supplier.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={supplier.category} 
                      size="small" 
                      sx={{ 
                        backgroundColor: theme.colors.background,
                        color: theme.colors.primary,
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{supplier.city}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {supplier.country}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Rating value={supplier.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="caption">({supplier.rating})</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 100 }}>
                      <Typography variant="caption">{supplier.performance}%</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={supplier.performance}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: theme.colors.background
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <UniversalStatusChip status={supplierStatusMap[supplier.status] || supplier.status} />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Görüntüle">
                        <IconButton
                          size="small"
                          onClick={() => handleViewSupplier(supplier)}
                          sx={{ color: theme.colors.info }}
                        >
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton
                          size="small"
                          sx={{ color: theme.colors.primary }}
                        >
                          <Pencil size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          size="small"
                          sx={{ color: theme.colors.error }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tedarikçi Detayları</DialogTitle>
        <DialogContent>
          {selectedSupplier && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">{selectedSupplier.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSupplier.email}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
      {/* Şirket detay dialogu (basit görüntüleme) */}
      <Dialog open={companyDialogOpen} onClose={() => setCompanyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Şirket Detayı</DialogTitle>
        <DialogContent dividers>
          {!companyDialogData ? (
            <Typography variant="body2" color="text.secondary">Yükleniyor veya veri yok</Typography>
          ) : (
            <Stack spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{companyDialogData.name}</Typography>
              <Typography variant="body2">Kod: {companyDialogData.code || '-'}</Typography>
              <Typography variant="body2">E-posta: {companyDialogData.email || '-'}</Typography>
              <Typography variant="body2">Telefon: {companyDialogData.phone || '-'}</Typography>
              <Typography variant="body2">Tür: {companyDialogData.type || '-'}</Typography>
              <Typography variant="caption" color="text.secondary">Oluşturma: {companyDialogData.createdAt ? new Date(companyDialogData.createdAt).toLocaleString() : '-'}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompanyDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
      {/* Mükerrer eşleşmeler dialogu */}
      <Dialog
        open={dupDialogOpen}
        onClose={() => setDupDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mükerrer: {dupDialogTitle}</DialogTitle>
        <DialogContent dividers>
          {(!dupDialogMatches || dupDialogMatches.length === 0) ? (
            <Typography variant="body2" color="text.secondary">Eşleşme bulunamadı</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ad</TableCell>
                    <TableCell>Kod</TableCell>
                    <TableCell>E-posta</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>Tür</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dupDialogMatches.map((m)=> (
                    <TableRow key={m.id}>
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{m.code || '-'}</TableCell>
                      <TableCell>{m.email || '-'}</TableCell>
                      <TableCell>{m.phone || '-'}</TableCell>
                      <TableCell>{m.type || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDupDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierManagement;

// Mükerrer detay dialogu (sayfa kökünde render)
// Not: Basit kullanım için doğrudan üst component içinde Dialog render ettik
// Bu nedenle SupplierManagement içinde Dialog JSX'ini aşağıda ekliyoruz

// Yardımcı: geçmişten seçili job için otomatik duplicate taraması (yan etkisiz ve sessiz)
function AutoDupCheck({ job, onMap }){
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!job?.suggestions?.length) return;
      try {
  // statik import edilen checkCompanyDuplicate'i kullan (dinamik import uyarısını önlemek için)
  const m = new Map();
        for (let idx = 0; idx < job.suggestions.length; idx++) {
          const sug = job.suggestions[idx];
          const url = sug?.url || sug?.link || sug?.website || '';
          const name = sug?.name || sug?.title || (url ? new URL(url, window.location.origin).hostname : `Öneri ${idx+1}`);
          try {
            const dup = await checkCompanyDuplicate({ name, website: url });
            m.set(idx, dup);
          } catch { /* noop */ }
        }
        if (!cancelled) onMap?.(m);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [job, onMap]);
  return null;
}
