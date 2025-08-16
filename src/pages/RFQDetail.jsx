import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Grid, Paper, Stack, Tab, Tabs, Typography, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Switch, FormControlLabel, Slider, Avatar } from '@mui/material';
import StatusChip from '../components/common/StatusChip';
import axios from '../utils/axios';
import { toast } from 'sonner';
import MainCard from '../components/common/MainCard';

export default function RFQDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [rfq, setRfq] = useState(null);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState(0);
	const [emails, setEmails] = useState({ items: [], total: 0 });
	const [emailsLoading, setEmailsLoading] = useState(false);

	const loadEmails = useCallback(async () => {
		try {
			setEmailsLoading(true);
			const { data } = await axios.get(`/rfqs/${id}/emails`);
			setEmails({ items: data?.items || [], total: data?.total || 0 });
		} catch (e) {
			toast.error('E-postalar yüklenemedi');
		} finally { setEmailsLoading(false); }
	}, [id]);
	const [cmp, setCmp] = useState(null);
	const [cmpLoading, setCmpLoading] = useState(false);
	const [showScores, setShowScores] = useState(true);
	const [visibleSuppliers, setVisibleSuppliers] = useState({});
	const [priceWeight, setPriceWeight] = useState(70);

	// Restore preferences
	useEffect(() => {
		try {
			const saved = JSON.parse(localStorage.getItem('rfqCmpPrefs') || '{}');
			if (saved.priceWeight != null) setPriceWeight(saved.priceWeight);
		} catch { /* ignore */ }
	}, []);

		const loadRfq = useCallback(async () => {
			setLoading(true);
			try {
				const { data } = await axios.get(`/rfqs/${id}`);
				setRfq(data);
			} catch {
				toast.error('RFQ yüklenemedi');
			} finally { setLoading(false); }
		}, [id]);
		useEffect(() => { loadRfq(); }, [loadRfq]);

	const infoRows = useMemo(() => rfq ? [
		{ k: 'Numara', v: rfq.rfqNumber },
		{ k: 'Durum', v: rfq.status },
		{ k: 'Oluşturma', v: rfq.createdAt ? new Date(rfq.createdAt).toLocaleString('tr-TR') : '-' },
		{ k: 'Deadline', v: rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('tr-TR') : '-' }
	] : [], [rfq]);

	const matrix = useMemo(() => {
		if (!cmp) return null;
		const { items = [], suppliers = [], quotes = [], metrics = {} } = cmp;
		const cell = {};
		for (const q of quotes) cell[`${q.supplierId}:${q.itemId}`] = q;
		const visInit = Object.keys(visibleSuppliers).length ? visibleSuppliers : suppliers.reduce((a, s) => { a[s.id] = true; return a; }, {});
			if (Object.keys(visibleSuppliers).length === 0) {
				let initVis = visInit;
				try {
					const saved = JSON.parse(localStorage.getItem('rfqCmpPrefs') || '{}');
					if (saved.visibleSuppliersNames) {
						const setNames = new Set(saved.visibleSuppliersNames);
						initVis = suppliers.reduce((acc, s) => { acc[s.id] = setNames.has(s.name); return acc; }, {});
					}
				} catch { /* ignore */ }
				setVisibleSuppliers(initVis);
			}
		return { items, suppliers, cell, metrics, vis: visInit };
	}, [cmp, visibleSuppliers]);

	// Persist preferences
	useEffect(() => {
		const handle = setTimeout(() => {
			try {
				const visibleNames = Object.entries(visibleSuppliers).filter(([, v]) => v).map(([id]) => {
					const sup = (cmp?.suppliers || []).find(s => String(s.id) === String(id));
					return sup?.name;
				}).filter(Boolean);
				localStorage.setItem('rfqCmpPrefs', JSON.stringify({ priceWeight, visibleSuppliersNames: visibleNames }));
			} catch { /* ignore */ }
		}, 300);
		return () => clearTimeout(handle);
	}, [priceWeight, visibleSuppliers, cmp]);

	const formatMoney = v => v == null ? '-' : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(v).replace('TRY', '₺');

	if (loading) return <Box p={3}><CircularProgress size={28} /></Box>;
	if (!rfq) return <Box p={3}><Typography>RFQ bulunamadı</Typography></Box>;

	const exportCSV = () => {
		if (!matrix) return;
		const activeSuppliers = matrix.suppliers.filter(s => matrix.vis[s.id]);
		const header = ['Kalem', ...activeSuppliers.map(s => s.name + (rfq.awardedSupplierId === s.id ? ' *' : ''))];
		const rows = matrix.items.map(it => {
			const prices = activeSuppliers.map(s => {
				const q = matrix.cell[`${s.id}:${it.id}`];
				if (!q) return '';
				return (q.unitPriceBase ?? q.unitPrice ?? '').toString().replace(/\n/g, ' ');
			});
			return [it.description, ...prices];
		});
		const lines = [header, ...rows].map(r => r.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','));
		const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a'); a.href = url; a.download = `rfq_${id}_comparison.csv`; a.click(); URL.revokeObjectURL(url);
	};

	return (
		<Box p={2} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Paper elevation={0} sx={t => ({ p: 2.5, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.palette.mode === 'dark' ? 'linear-gradient(120deg, rgba(30,41,59,0.85), rgba(17,24,39,0.65))' : 'linear-gradient(120deg,#ffffff,#f1f5f9)' })}>
				<Stack gap={0.5}>
					<Typography variant="h5" fontWeight={600}>{rfq.title}</Typography>
					<Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
						<Chip size="small" label={rfq.rfqNumber} />
						{rfq.status && <StatusChip status={rfq.status} />}
						{rfq.sentAt && <Chip size="small" variant="outlined" label={`Gönderildi: ${new Date(rfq.sentAt).toLocaleDateString('tr-TR')}`} />}
						{rfq.awardedSupplierId && <Chip size="small" color="success" variant="outlined" label="Ödüllendirildi" />}
					</Stack>
				</Stack>
				<Stack direction="row" gap={1}>
					<Button size="small" variant="outlined" onClick={async ()=>{
						try {
							const { data } = await axios.get(`/proformas/by-rfq/${id}`);
							const num = data?.meta?.proformaNumber || data?.proforma?.proformaNumber;
							if (!num) { toast.info('Bu RFQ için proforma yok'); return; }
							navigate(`/proforma/${encodeURIComponent(num)}`);
						} catch (e) {
							if (e?.response?.status === 404) toast.info('Bu RFQ için proforma yok'); else toast.error('Proforma getirilemedi');
						}
					}}>Proforma</Button>
					<Button size="small" variant="contained" disabled={String(rfq.status).toLowerCase() === 'sent'} onClick={async () => {
						try { await axios.patch(`/rfqs/${id}/send`); toast.success('RFQ gönderildi'); await loadRfq(); } catch { toast.error('Gönderme başarısız'); }
					}}>Gönder</Button>
				</Stack>
			</Paper>
			<MainCard content sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
				<Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 1, borderBottom: t => `1px solid ${t.palette.divider}` }}>
					<Tab label="Genel" />
					<Tab label="Karşılaştırma" onClick={async () => {
						if (cmp || cmpLoading) return;
						try { setCmpLoading(true); const { data } = await axios.get(`/rfqs/${id}/comparison`); setCmp(data); } catch { toast.error('Karşılaştırma getirilemedi'); } finally { setCmpLoading(false); }
					}} />
					<Tab label="Geçmiş" />
					<Tab label={`E-postalar${emails.total?` (${emails.total})`:''}`} onClick={() => { if (!emails.items.length) loadEmails(); }} />
				</Tabs>
				{tab === 0 && (
					<Box sx={{ p: 2 }}>
						<Grid container spacing={2}>
							<Grid item xs={12} md={4}>
								<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
									<Typography variant="subtitle2" fontWeight={600} gutterBottom>Bilgi</Typography>
									<Stack gap={1}>{infoRows.map(r => <Stack key={r.k} direction="row" justifyContent="space-between"><Typography color="text.secondary">{r.k}</Typography><Typography>{r.v || '-'}</Typography></Stack>)}</Stack>
								</Paper>
							</Grid>
							<Grid item xs={12} md={4}>
								<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
									<Typography variant="subtitle2" fontWeight={600} gutterBottom>Talep Ürünleri</Typography>
									<Stack gap={.75}>{rfq.talep?.urunler?.length ? rfq.talep.urunler.map(u => <Stack key={u.id} direction="row" justifyContent="space-between"><Typography>{u.urunAdi || u.name}</Typography><Typography color="text.secondary">{u.miktar || u.quantity} {u.birim || u.unit}</Typography></Stack>) : <Typography color="text.secondary" variant="body2">Kayıt yok</Typography>}</Stack>
								</Paper>
							</Grid>
							<Grid item xs={12} md={4}>
								<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
									<Typography variant="subtitle2" fontWeight={600} gutterBottom>RFQ Kalemleri</Typography>
									<Stack gap={.75}>{rfq.items?.length ? rfq.items.map(it => <Stack key={it.id} direction="row" justifyContent="space-between"><Typography>{it.urunAdi || it.productName}</Typography><Typography color="text.secondary">{it.miktar || it.quantity} {it.birim || it.unit}</Typography></Stack>) : <Typography color="text.secondary" variant="body2">Kayıt yok</Typography>}</Stack>
								</Paper>
							</Grid>
							<Grid item xs={12}>
								<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
									<Typography variant="subtitle2" fontWeight={600} gutterBottom>Zaman Çizelgesi</Typography>
														<Stack gap={1}>{[
															{ t: 'Oluşturuldu', d: rfq.createdAt },
															rfq.sentAt && { t: 'Gönderildi', d: rfq.sentAt }
														].filter(Boolean).map((ev, i) => (
															<Stack key={i} direction="row" gap={2} alignItems="center">
																<Chip size="small" label={ev.t} />
																<Typography variant="caption" color="text.secondary">{new Date(ev.d).toLocaleString('tr-TR')}</Typography>
															</Stack>
														))}</Stack>
								</Paper>
							</Grid>
						</Grid>
					</Box>
				)}
				{tab === 1 && (
					<Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Typography variant="subtitle2" fontWeight={600}>Karşılaştırma Matrisi</Typography>
							<FormControlLabel control={<Switch size="small" checked={showScores} onChange={e => setShowScores(e.target.checked)} />} label={<Typography variant="caption">Skorları Göster</Typography>} />
						</Stack>
						<Stack direction={{ xs: 'column', md: 'row' }} gap={2} alignItems="center" sx={{ px: 2, pt: 1 }}>
							<Stack direction="row" gap={2} alignItems="center" sx={{ minWidth: 240 }}>
								<Typography variant="caption" color="text.secondary">Fiyat Ağırlığı</Typography>
								<Slider size="small" value={priceWeight} onChange={(_, v) => setPriceWeight(v)} step={5} min={0} max={100} sx={{ width: 160 }} />
								<Chip size="small" label={`${priceWeight}%`} />
							</Stack>
							<Typography variant="caption" color="text.secondary">Teslim Ağırlığı: {100 - priceWeight}%</Typography>
						</Stack>
						{cmp && matrix && (
							<Stack direction="row" gap={1} sx={{ mb: 1 }}>
								<Button size="small" variant="contained" color="success" onClick={async () => {
									try {
										const totals = {};
										for (const it of matrix.items) {
											for (const s of matrix.suppliers) {
												const q = matrix.cell[`${s.id}:${it.id}`];
												if (q?.score?.overall) totals[s.id] = (totals[s.id] || 0) + q.score.overall;
											}
										}
										const best = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
										if (!best) { toast.error('Skor bulunamadı'); return; }
										await axios.post(`/rfqs/${id}/award`, { supplierId: Number(best[0]) });
										toast.success('RFQ award edildi');
										await loadRfq();
									} catch { toast.error('Award başarısız'); }
								}}>En İyiye Award</Button>
								<Button size="small" variant="outlined" onClick={exportCSV}>CSV Dışa Aktar</Button>
							</Stack>
						)}
						{cmpLoading && <CircularProgress size={22} />}
						{!cmpLoading && cmp && matrix && (
							<Box sx={{ overflow: 'auto' }}>
								<Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
									{matrix.suppliers.map(s => {
										const active = matrix.vis[s.id];
										return <Chip key={s.id} size="small" color={active ? 'primary' : 'default'} variant={active ? 'filled' : 'outlined'} label={s.name} onClick={() => setVisibleSuppliers(v => ({ ...v, [s.id]: !v[s.id] }))} />;
									})}
									<Chip size="small" onClick={() => setVisibleSuppliers(matrix.suppliers.reduce((a, s) => { a[s.id] = true; return a; }, {}))} label="Tümünü Göster" variant="outlined" />
									<Chip size="small" onClick={() => setVisibleSuppliers(matrix.suppliers.reduce((a, s) => { a[s.id] = false; return a; }, {}))} label="Tümünü Gizle" variant="outlined" />
								</Stack>
								<Table size="small" sx={{ minWidth: 860 }}>
									<TableHead>
										<TableRow>
											<TableCell width={240}>Kalem</TableCell>
											{matrix.suppliers.filter(s => matrix.vis[s.id]).map(s => {
												const isAwarded = rfq.awardedSupplierId === s.id;
												return <TableCell key={s.id} sx={isAwarded ? theme => ({ background: theme.palette.mode === 'dark' ? '#1b3725' : '#e8f5e9', fontWeight: 600, borderBottom: `2px solid ${theme.palette.success.main}` }) : undefined}>{s.name}{isAwarded && ' 🏆'}</TableCell>;
											})}
										</TableRow>
									</TableHead>
									<TableBody>
										{matrix.items.map(it => {
											const bestSupplierId = matrix.metrics?.bestPriceSupplierIdPerItem?.[it.id];
											const varInfo = matrix.metrics?.variance?.[it.id];
											return (
												<TableRow key={it.id} hover>
													<TableCell>
														<Stack gap={0.25}>
															<Typography fontSize={13} fontWeight={500}>{it.description}</Typography>
															<Typography variant="caption" color="text.secondary">{it.qty} {it.uom}</Typography>
															{varInfo && <Typography variant="caption" color="text.secondary">Spread: {varInfo.pctSpread?.toFixed(1)}%</Typography>}
														</Stack>
													</TableCell>
													{matrix.suppliers.filter(s => matrix.vis[s.id]).map(s => {
														const q = matrix.cell[`${s.id}:${it.id}`];
														const isBest = bestSupplierId === s.id && q?.unitPriceBase > 0;
														const isAwarded = rfq.awardedSupplierId === s.id;
														const bg = isBest ? theme => theme.palette.success.light + '33' : undefined;
														const border = theme => {
															if (isBest) return `1px solid ${theme.palette.success.main}`;
															if (isAwarded) return `1px dashed ${theme.palette.success.main}`;
															return undefined;
														};
														return (
															<TableCell key={s.id} sx={{ position: 'relative', background: bg, border, verticalAlign: 'top' }}>
																{q ? (
																	<Stack gap={0.25}>
																		<Tooltip title={`Orijinal: ${q.unitPrice} ${q.currency}${q.fxRate && q.currency !== 'TRY' ? ` | Kur: ${q.fxRate}` : ''}`}>
																			<Typography fontSize={13} fontWeight={500}>{formatMoney(q.unitPriceBase)}</Typography>
																		</Tooltip>
																		{matrix.metrics?.variance?.[it.id]?.min > 0 && q.unitPriceBase > 0 && !isBest && (() => { const min = matrix.metrics.variance[it.id].min; const diffPct = ((q.unitPriceBase - min) / min) * 100; return diffPct >= 0 ? <Chip size="small" variant="outlined" color={diffPct < 10 ? 'warning' : 'error'} label={`+${diffPct.toFixed(1)}%`} sx={{ height: 18, fontSize: 10, alignSelf: 'flex-start' }} /> : null; })()}
																		{isBest && <Chip size="small" color="success" label="En İyi" sx={{ height: 18, fontSize: 10, alignSelf: 'flex-start' }} />}
																		{!isBest && isAwarded && <Chip size="small" color="success" variant="outlined" label="Award" sx={{ height: 18, fontSize: 10, alignSelf: 'flex-start' }} />}
																		{showScores && q.score && (() => {
																			const overallDynamic = ((q.score.price * priceWeight) + (q.score.lead * (100 - priceWeight))) / 100;
																			return <Tooltip title={`Orijinal: ${q.score.overall} | Dinamik: ${overallDynamic.toFixed(1)} (Fiyat ${priceWeight} / Lead ${100 - priceWeight})`}><Typography variant="caption" color="text.secondary">O:{overallDynamic.toFixed(1)} P:{q.score.price} L:{q.score.lead}</Typography></Tooltip>;
																		})()}
																		{q.leadTimeDays && <Typography variant="caption" color="text.secondary">LT: {q.leadTimeDays}g</Typography>}
																	</Stack>
																) : <Typography variant="caption" color="text.disabled">-</Typography>}
															</TableCell>
														);
													})}
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</Box>
						)}
						{!cmpLoading && !cmp && <Typography variant="body2" color="text.secondary">Karşılaştırma verisi yok.</Typography>}
						{cmp && matrix && (
							<Stack direction="row" gap={2} flexWrap="wrap" sx={{ pt: 1 }}>
								<Chip size="small" label="Yeşil çerçeve: En iyi fiyat" color="success" variant="outlined" />
								{showScores && <Chip size="small" label="Skor O:Overall P:Price L:Lead" />}
							</Stack>
						)}
					</Box>
				)}
				{tab === 2 && <AuditHistory rfqId={id} />}
				{tab === 3 && (
					<Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
						<Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
							<Button size="small" variant="outlined" onClick={() => {
								const params = new URLSearchParams();
								params.set('entityType', 'rfq');
								params.set('entityId', String(id));
								if (rfq?.rfqNumber) params.set('entityKey', rfq.rfqNumber);
								navigate(`/email/compose?${params.toString()}`);
							}}>E‑posta Yaz</Button>
						</Stack>
						{emailsLoading && <CircularProgress size={20} />}
						{!emailsLoading && emails.items.length === 0 && <Typography color="text.secondary" variant="body2">Bu RFQ ile ilişkilendirilmiş e-posta yok.</Typography>}
						{!emailsLoading && emails.items.length > 0 && (
							<Stack gap={1}>
								{emails.items.map((l) => {
									const m = l.email || {};
									return (
										<Paper key={l.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
											<Stack direction="row" gap={1.25} alignItems="flex-start">
												<Avatar sx={{ width: 28, height: 28 }}>{(m.from||'?').slice(0,1).toUpperCase()}</Avatar>
												<Box sx={{ flex: 1, minWidth: 0 }}>
													<Stack direction="row" justifyContent="space-between" alignItems="center">
														<Typography fontWeight={600} noWrap>{m.subject || '(No Subject)'}</Typography>
														<Typography variant="caption" color="text.secondary">{m.date ? new Date(m.date).toLocaleString('tr-TR') : '-'}</Typography>
													</Stack>
													<Typography variant="caption" color="text.secondary" noWrap>{m.from}</Typography>
													<Typography variant="body2" sx={{ mt: .5 }} noWrap>{m.snippet || m.bodyText || ''}</Typography>
												</Box>
												<Chip size="small" label={l.linkSource || 'manual'} />
											</Stack>
										</Paper>
									);
								})}
							</Stack>
						)}
					</Box>
				)}
			</MainCard>
		</Box>
	);
}

function AuditHistory({ rfqId }) {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [action, setAction] = useState('');
	const [start, setStart] = useState('');
	const [end, setEnd] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

			const load = useCallback(async () => {
				setLoading(true);
				try {
					const params = new URLSearchParams();
					if (action) params.append('action', action);
					if (start) params.append('start', start);
					if (end) params.append('end', end);
					params.append('page', page);
					params.append('limit', '25');
					const { data } = await axios.get(`/audit/rfq/${rfqId}?` + params.toString());
					setRows(data.rows || []);
					setTotalPages(data.totalPages || 1);
				} catch { /* ignore */ } finally { setLoading(false); }
			}, [rfqId, action, start, end, page]);
			useEffect(() => { load(); }, [load]);

	return (
		<Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Stack direction={{ xs: 'column', md: 'row' }} gap={2} alignItems={{ md: 'flex-end' }}>
				<Box>
					<Typography variant="caption" color="text.secondary">Aksiyon</Typography>
					<input style={{ width: 160, padding: 4 }} value={action} onChange={e => { setPage(1); setAction(e.target.value); }} placeholder="ör: rfq.create" />
				</Box>
				<Box>
					<Typography variant="caption" color="text.secondary">Başlangıç</Typography>
					<input type="date" value={start} onChange={e => { setPage(1); setStart(e.target.value); }} />
				</Box>
				<Box>
					<Typography variant="caption" color="text.secondary">Bitiş</Typography>
					<input type="date" value={end} onChange={e => { setPage(1); setEnd(e.target.value); }} />
				</Box>
				<Button size="small" variant="outlined" onClick={() => { setAction(''); setStart(''); setEnd(''); setPage(1); }}>Sıfırla</Button>
			</Stack>
			{loading ? <CircularProgress size={20} /> : (
				rows.length ? (
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>Zaman</TableCell>
								<TableCell>Aksiyon</TableCell>
								<TableCell>Kullanıcı</TableCell>
								<TableCell>Fark</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map(r => {
								const diff = r.metadata?.diff || {}; const changed = Object.keys(diff.changed || {}).join(', ');
								const added = Object.keys(diff.added || {}).join(', ');
								const removed = Object.keys(diff.removed || {}).join(', ');
								const summary = [changed && `Changed: ${changed}`, added && `Added: ${added}`, removed && `Removed: ${removed}`].filter(Boolean).join(' | ');
								return (
									<TableRow key={r.id}>
										<TableCell><Typography variant="caption">{new Date(r.createdAt).toLocaleString('tr-TR')}</Typography></TableCell>
										<TableCell>{r.action}</TableCell>
										<TableCell>{r.user?.username || '-'}</TableCell>
										<TableCell><Typography variant="caption" color="text.secondary">{summary || '-'}</Typography></TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				) : <Typography color="text.secondary" variant="body2">Kayıt yok</Typography>
			)}
			<Stack direction="row" gap={1} justifyContent="flex-end" alignItems="center">
				<Typography variant="caption">Sayfa {page}/{totalPages}</Typography>
				<Button size="small" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Önceki</Button>
				<Button size="small" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sonraki</Button>
			</Stack>
		</Box>
	);
}

