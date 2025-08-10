import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Divider, Grid, Paper, Stack, Tooltip, Typography } from '@mui/material';
import axios from '../utils/axios';
import { toast } from 'sonner';
import MainCard from '../components/common/MainCard';

export default function RequestDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [talep, setTalep] = useState(null);
	const [loading, setLoading] = useState(true);

	const load = async () => {
		setLoading(true);
		try {
			const { data } = await axios.get(`/talepler/${id}`);
			setTalep(data);
		} catch (e) {
			console.error('Talep detayı yüklenemedi:', e);
			toast.error('Talep detayı yüklenemedi');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, [id]);

	if (loading) {
		return (
			<Stack alignItems="center" justifyContent="center" sx={{ height: 400 }}>
				<CircularProgress />
			</Stack>
		);
	}

	if (!talep) {
		return (
			<Box p={2}>
				<Typography>Talep bulunamadı.</Typography>
			</Box>
		);
	}

	const infoRows = [
		{ k: 'Talep No', v: talep.talepNo },
		{ k: 'Başlık', v: talep.talepBasligi },
		{ k: 'Durum', v: talep.durum },
		{ k: 'Firma', v: talep.firma },
		{ k: 'Talep Sahibi', v: `${talep.user?.firstName || ''} ${talep.user?.lastName || ''}`.trim() },
	];

		return (
			<Box>
				<Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
				<Typography variant="h5">Talep Detayı</Typography>
					<Stack direction="row" gap={1} alignItems="center">
					{talep.durum && <Chip label={talep.durum} color="primary" variant="outlined" />}
						<Tooltip title={talep.durum === 'Onaylandı' ? 'Satınalma siparişi oluştur' : 'Önce talebi onaylayın'}>
							<span>
								<Button size="small" variant="contained" color="secondary" disabled={talep.durum !== 'Onaylandı'} onClick={async ()=>{
									try {
										// Map talep ürünleri to PO items (basic)
										const items = (talep.urunler||[]).map(u=>({ description: u.urunAdi, quantity: u.miktar, unitPrice: 0, totalPrice: 0 }));
										const { data } = await axios.post('/purchase-orders/create-from-request', { talepId: talep.id, items });
										const poId = data?.purchaseOrder?.id || data?.id;
										if (poId){ toast.success('PO oluşturuldu'); navigate(`/purchase-orders/${poId}`); }
										else toast.error('PO yanıtı geçersiz');
									} catch(e){ console.error('PO create error', e); toast.error(e?.response?.data?.error || 'PO oluşturulamadı'); }
								}}>
									PO Oluştur
								</Button>
							</span>
						</Tooltip>
						<Button
							size="small"
							variant="outlined"
							onClick={async () => {
								try {
									await axios.put(`/talepler/${id}/status`, { status: 'Onaylandı' });
									toast.success('Talep onaylandı');
									await load();
								} catch (e) {
									toast.error('Onaylama başarısız');
								}
							}}
						>Onayla</Button>
						<Button
							size="small"
							color="warning"
							variant="outlined"
							onClick={async () => {
								try {
									await axios.put(`/talepler/${id}/status`, { status: 'Reddedildi' });
									toast.success('Talep reddedildi');
									await load();
								} catch (e) {
									toast.error('Reddetme başarısız');
								}
							}}
						>Reddet</Button>
						<Tooltip title={talep.durum === 'Onaylandı' ? '' : 'Önce talebi onaylayın'}>
							<span>
						<Button
									size="small"
									variant="contained"
							disabled={talep.durum !== 'Onaylandı'}
									onClick={async () => {
										try {
											const { data } = await axios.post('/rfqs/create-from-request', { talepId: id, title: `${talep.talepBasligi} - Teklif Talebi` });
											const rfqId = data?.rfq?.id || data?.id;
											if (rfqId) {
												toast.success('RFQ oluşturuldu');
												navigate(`/rfqs/${rfqId}`);
											} else {
												toast.error('RFQ oluşturma yanıtı geçersiz');
											}
										} catch (e) {
											console.error('RFQ oluşturma hatası:', e);
											toast.error(e?.response?.data?.error || 'RFQ oluşturulamadı');
										}
									}}
								>RFQ Başlat</Button>
							</span>
						</Tooltip>
						</Stack>
					</Paper>

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
							<MainCard title="Ürünler">
								<Stack gap={1}>
									{talep.urunler?.length ? talep.urunler.map((u) => (
										<Stack key={u.id} direction="row" justifyContent="space-between">
											<Typography>{u.urunAdi}</Typography>
											<Typography color="text.secondary">{u.miktar} {u.birim}</Typography>
										</Stack>
									)) : <Typography color="text.secondary">Kayıt bulunamadı</Typography>}
								</Stack>
							</MainCard>
						</Grid>
					</Grid>
				</Box>
			);
}

