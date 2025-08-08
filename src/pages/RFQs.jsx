import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'sonner';
import MainCard from '../components/common/MainCard';
import PageHeader from '../components/common/PageHeader';

export default function RFQs() {
	const navigate = useNavigate();
		const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [q, setQ] = useState('');
		const initRan = useRef(false);

	const load = async () => {
		setLoading(true);
		try {
			const { data } = await axios.get('/rfqs');
			const list = Array.isArray(data?.rfqs) ? data.rfqs : [];
			setRows(list.map((r) => ({
				id: r.id,
				rfqNumber: r.rfqNumber,
				title: r.title,
				status: r.status,
				deadline: r.deadline,
				createdAt: r.createdAt,
				talepTitle: r.talep?.talepBasligi || '-',
				createdBy: r.createdBy ? `${r.createdBy.firstName || ''} ${r.createdBy.lastName || ''}`.trim() : '-'
			})));
		} finally {
			setLoading(false);
		}
	};

			useEffect(() => {
				if (initRan.current) return;
				initRan.current = true;
				load().catch((e) => {
				console.error('RFQs load error:', e);
				toast.error('RFQ listesi yüklenemedi');
			});
		}, []);

	const columns = useMemo(() => [
		{ field: 'rfqNumber', headerName: 'No', flex: 0.6, minWidth: 120 },
		{ field: 'title', headerName: 'Başlık', flex: 1.2, minWidth: 200 },
		{ field: 'talepTitle', headerName: 'Talep', flex: 1, minWidth: 180 },
		{ field: 'status', headerName: 'Durum', flex: 0.6, minWidth: 120 },
		{ field: 'deadline', headerName: 'Son Tarih', flex: 0.8, minWidth: 140, valueGetter: ({ value }) => value ? new Date(value).toLocaleDateString('tr-TR') : '-' },
		{ field: 'createdAt', headerName: 'Oluşturma', flex: 0.8, minWidth: 160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' },
		{ field: 'createdBy', headerName: 'Oluşturan', flex: 0.8, minWidth: 160 },
	], []);

	const filteredRows = useMemo(() => {
		const s = q.trim().toLowerCase();
		if (!s) return rows;
		return rows.filter((r) =>
			[r.rfqNumber, r.title, r.talepTitle, r.status, r.createdBy]
				.filter(Boolean)
				.some((v) => String(v).toLowerCase().includes(s))
		);
	}, [rows, q]);

		return (
				<Box>
					<PageHeader
						title="RFQ Listesi"
						description="Teklif taleplerinizi takip edin ve detaylarına erişin."
						right={<Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
							<TextField fullWidth size="small" placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} />
							<Button variant="outlined" onClick={load}>Yenile</Button>
						</Stack>}
					/>

				<MainCard content={false} sx={{ overflow: 'hidden' }}>
					<Box sx={{ height: 560, width: '100%' }}>
						{loading ? (
							<Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
								<CircularProgress />
							</Stack>
						) : (
							<DataGrid
								rows={filteredRows}
								columns={columns}
								disableRowSelectionOnClick
								onRowClick={(p) => navigate(`/rfqs/${p.id}`)}
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

