import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Chip, CircularProgress, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import MainCard from '../components/common/MainCard';
import PageHeader from '../components/common/PageHeader';

export default function Requests() {
	const navigate = useNavigate();
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [q, setQ] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [priorityFilter, setPriorityFilter] = useState('');
	const [selectionModel, setSelectionModel] = useState([]);
	const [bulkLoading, setBulkLoading] = useState(false);
	const initRan = useRef(false);

	const load = async () => {
		setLoading(true);
		try {
			const { data } = await axios.get('/talepler');
			const list = Array.isArray(data) ? data : [];
			setRows(list.map((t) => ({
				id: t.id,
				talepNo: t.talepNo,
				talepBasligi: t.talepBasligi,
				durum: t.durum,
				firma: t.firma,
				oncelik: t.oncelik,
				createdAt: t.createdAt,
				user: t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() : '-'
			})));
		} catch (e) {
			console.error('Requests load error:', e);
			toast.error('Talepler yüklenemedi');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (initRan.current) return;
		initRan.current = true;
		load();
	}, []);

	const statusOptions = useMemo(() => {
		const set = new Set(rows.map((r) => r.durum).filter(Boolean));
		return Array.from(set);
	}, [rows]);

	const priorityOptions = useMemo(() => {
		const set = new Set(rows.map((r) => r.oncelik).filter(Boolean));
		return Array.from(set);
	}, [rows]);

	const columns = useMemo(() => [
		{ field: 'talepNo', headerName: 'Talep No', flex: 0.7, minWidth: 120 },
		{ field: 'talepBasligi', headerName: 'Başlık', flex: 1.4, minWidth: 220 },
		{ field: 'firma', headerName: 'Firma', flex: 1, minWidth: 180 },
		{ field: 'durum', headerName: 'Durum', flex: 0.7, minWidth: 120 },
		{ field: 'oncelik', headerName: 'Öncelik', flex: 0.6, minWidth: 100 },
		{ field: 'user', headerName: 'Talep Sahibi', flex: 1, minWidth: 180 },
		{ field: 'createdAt', headerName: 'Oluşturma', flex: 0.9, minWidth: 160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' },
	], []);

	const filteredRows = useMemo(() => {
		const s = q.trim().toLowerCase();
		let list = rows;
		if (statusFilter) list = list.filter((r) => r.durum === statusFilter);
		if (priorityFilter) list = list.filter((r) => r.oncelik === priorityFilter);
		if (!s) return list;
		return list.filter((r) =>
			[r.talepNo, r.talepBasligi, r.firma, r.durum, r.user]
				.filter(Boolean)
				.some((v) => String(v).toLowerCase().includes(s))
		);
	}, [rows, q, statusFilter, priorityFilter]);

	const runBulk = async (action) => {
		if (!selectionModel.length) return;
		try {
			setBulkLoading(true);
			const endpoint = action === 'approve'
				? '/talepler/bulk-approve'
				: action === 'reject'
					? '/talepler/bulk-reject'
					: '/talepler/bulk-delete';
			await axios.post(endpoint, { ids: selectionModel });
			toast.success('İşlem tamamlandı');
			await load();
			setSelectionModel([]);
		} catch (e) {
			console.error('Bulk action error:', e);
			toast.error('Toplu işlem başarısız');
		} finally {
			setBulkLoading(false);
		}
	};

		return (
				<Box>
					<PageHeader
						title="Talepler"
						description="Tüm satın alma taleplerini görüntüleyin ve yönetin."
						right={<Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
						<Stack direction={{ xs: 'column', sm: 'row' }} gap={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
							<Select size="small" displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 140 }}>
								<MenuItem value=""><em>Durum: Hepsi</em></MenuItem>
								{statusOptions.map((s) => (
									<MenuItem key={s} value={s}>{s}</MenuItem>
								))}
							</Select>
							<Select size="small" displayEmpty value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} sx={{ minWidth: 140 }}>
								<MenuItem value=""><em>Öncelik: Hepsi</em></MenuItem>
								{priorityOptions.map((p) => (
									<MenuItem key={p} value={p}>{p}</MenuItem>
								))}
							</Select>
						</Stack>
						<TextField fullWidth size="small" placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} />
						<Stack direction="row" gap={1}>
							<Button variant="outlined" onClick={load}>Yenile</Button>
							<Button variant="contained" onClick={() => navigate('/requests/new')}>Yeni Talep</Button>
						</Stack>
						</Stack>}
					/>

				<MainCard content={false} sx={{ overflow: 'hidden' }}>
					{selectionModel.length > 0 && (
						<Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
							<Typography variant="body2">Seçili: {selectionModel.length}</Typography>
							<Stack direction="row" gap={1}>
								<Button size="small" variant="contained" color="success" disabled={bulkLoading} onClick={() => runBulk('approve')}>Toplu Onayla</Button>
								<Button size="small" variant="outlined" color="warning" disabled={bulkLoading} onClick={() => runBulk('reject')}>Toplu Reddet</Button>
								<Button size="small" variant="outlined" color="error" disabled={bulkLoading} onClick={() => runBulk('delete')}>Toplu Sil</Button>
							</Stack>
						</Box>
					)}
					<Box sx={{ height: 560, width: '100%' }}>
						{loading ? (
							<Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
								<CircularProgress />
							</Stack>
						) : (
							<DataGrid
								rows={filteredRows}
								columns={columns}
								checkboxSelection
								rowSelectionModel={selectionModel}
								onRowSelectionModelChange={(m) => setSelectionModel(m)}
								disableRowSelectionOnClick
								onRowClick={(p) => navigate(`/requests/${p.id}`)}
								pageSizeOptions={[10, 25, 50]}
								initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
								sx={{
									border: 'none',
									'& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover', fontWeight: 600 },
									'& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' }
								}}
							/>
						)}
					</Box>
				</MainCard>
			</Box>
		);
	}

