import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Divider, Grid, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import axios from '../utils/axios';
import { toast } from 'sonner';
import MainCard from '../components/common/MainCard';

export default function RFQDetail() {
	const { id } = useParams();
	const [rfq, setRfq] = useState(null);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState(0);
	const [cmp, setCmp] = useState(null);
	const [cmpLoading, setCmpLoading] = useState(false);

	const load = async () => {
		setLoading(true);
		try {
			const { data } = await axios.get(`/rfqs/${id}`);
			setRfq(data?.rfq || data); // controller bazen { rfq } bazen direkt rfq dönebilir
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load().catch((e) => {
			console.error('RFQ detail load error:', e);
			toast.error('RFQ detayı yüklenemedi');
		});
	}, [id]);

	if (loading) {
		return (
			<Stack alignItems="center" justifyContent="center" sx={{ height: 400 }}>
				<CircularProgress />
			</Stack>
		);
	}

	if (!rfq) {
		return (
			<Box p={2}>
				<Typography>RFQ bulunamadı.</Typography>
			</Box>
		);
	}

	const infoRows = [
		{ k: 'RFQ No', v: rfq.rfqNumber },
		{ k: 'Başlık', v: rfq.title },
		{ k: 'Durum', v: rfq.status },
		{ k: 'Son Tarih', v: rfq.deadline ? new Date(rfq.deadline).toLocaleString('tr-TR') : '-' },
		{ k: 'Talep', v: rfq.talep?.talepBasligi || '-' },
	];

		return (
			<Box>
				<Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
					<Typography variant="h5">RFQ Detayı</Typography>
							<Stack direction="row" gap={1} alignItems="center">
								{rfq.status && <Chip label={rfq.status} color="primary" variant="outlined" />}
								{rfq.sentAt && (
									<Chip size="small" variant="outlined" label={`Gönderildi: ${new Date(rfq.sentAt).toLocaleString('tr-TR')}`} />
								)}
						<Button
							size="small"
							variant="contained"
									disabled={String(rfq.status).toLowerCase() === 'sent'}
							onClick={async () => {
								try {
									await axios.patch(`/rfqs/${id}/send`);
									toast.success('RFQ gönderildi');
									await load();
								} catch (e) {
									toast.error('Gönderme başarısız');
								}
							}}
						>Gönder</Button>
					</Stack>
				</Paper>

				<MainCard content sx={{ p: 0 }}>
					<Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 1, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
						<Tab label="Genel" />
						<Tab label="Karşılaştırma" onClick={async () => {
							if (cmp || cmpLoading) return;
							try {
								setCmpLoading(true);
								const { data } = await axios.get(`/rfqs/${id}/comparison`);
								setCmp(data);
							} catch (e) {
								toast.error('Karşılaştırma getirilemedi');
							} finally {
								setCmpLoading(false);
							}
						}} />
					</Tabs>

					{tab === 0 && (
						<Box sx={{ p: 2 }}>
							<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
										<MainCard title="Bilgi">
											<Stack gap={1}>
												{infoRows.map((row) => (
													<Stack key={row.k} direction="row" justifyContent="space-between">
														<Typography color="text.secondary">{row.k}</Typography>
														<Typography>{row.v || '-'}</Typography>
													</Stack>
												))}
											</Stack>
										</MainCard>
				</Grid>

				<Grid item xs={12} md={6}>
										<MainCard title="Talep Ürünleri">
											<Stack gap={1}>
												{rfq.talep?.urunler?.length ? rfq.talep.urunler.map((u) => (
													<Stack key={u.id} direction="row" justifyContent="space-between">
														<Typography>{u.urunAdi || u.name}</Typography>
														<Typography color="text.secondary">{u.miktar || u.quantity} {u.birim || u.unit}</Typography>
													</Stack>
												)) : <Typography color="text.secondary">Kayıt bulunamadı</Typography>}
											</Stack>
										</MainCard>
				</Grid>

				<Grid item xs={12}>
										<MainCard title="RFQ Kalemleri">
											<Stack gap={1}>
												{rfq.items?.length ? rfq.items.map((it) => (
													<Stack key={it.id} direction="row" justifyContent="space-between">
														<Typography>{it.urunAdi || it.productName}</Typography>
														<Typography color="text.secondary">{it.miktar || it.quantity} {it.birim || it.unit}</Typography>
													</Stack>
												)) : <Typography color="text.secondary">Kayıt bulunamadı</Typography>}
											</Stack>
										</MainCard>
				</Grid>

				<Grid item xs={12}>
										<MainCard title="Teklifler">
											<Quotes rfqId={rfq.id} />
										</MainCard>
				</Grid>
							</Grid>
						</Box>
					)}

					{tab === 1 && (
						<Box sx={{ p: 2 }}>
							<MainCard title="Karşılaştırma">
								{cmpLoading && <CircularProgress size={20} />}
								{!cmpLoading && !cmp && <Typography color="text.secondary">Veri yok</Typography>}
								{!cmpLoading && cmp && (
									<Stack gap={2}>
										<Typography>Toplam Kalem: {cmp.rfqInfo?.totalItems || 0} | Toplam Teklif: {cmp.rfqInfo?.totalQuotes || 0}</Typography>
										<Divider />
										{cmp.itemComparisons?.map((row, idx) => (
											<Box key={idx}>
												<Typography fontWeight={600}>{row.productName || row.itemNumber}</Typography>
												<Stack sx={{ pl: 2 }} gap={0.5}>
													{row.quotes?.map((q, i) => (
														<Typography key={i} color="text.secondary">{q.supplier}: {q.unitPrice} {q.currency}</Typography>
													))}
												</Stack>
											</Box>
										))}
									</Stack>
								)}
							</MainCard>
						</Box>
					)}
				</MainCard>
			</Box>
	);
}

function Quotes({ rfqId }) {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);

	const load = async () => {
		setLoading(true);
		try {
			const { data } = await axios.get(`/rfqs/${rfqId}/quotes`);
			setRows(Array.isArray(data?.quotes) ? data.quotes : []);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load().catch((e) => {
			console.error('Quotes load error:', e);
			toast.error('Teklifler yüklenemedi');
		});
	}, [rfqId]);

	if (loading) return <CircularProgress size={20} />;
	if (!rows.length) return <Typography color="text.secondary">Teklif bulunamadı</Typography>;

	return (
		<Stack gap={1}>
			{rows.map((q) => (
				<Stack key={q.id} direction="row" justifyContent="space-between">
					<Typography>{q.supplier?.name || 'Tedarikçi'}</Typography>
					<Typography color="text.secondary">{q.totalAmount} {q.currency}</Typography>
				</Stack>
			))}
		</Stack>
	);
}

