import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Paper, Stack, TextField, Typography, Tooltip } from '@mui/material';
import StatusChip from '../components/common/StatusChip';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'sonner';
import MainCard from '../components/common/MainCard';
import PageHeader from '../components/common/PageHeader';
import TableSkeleton from '../components/common/skeletons/TableSkeleton';
import EmptyState from '../components/common/EmptyState';
import FilterBar from '../components/table/FilterBar';
import usePermissions from '../hooks/usePermissions';

export default function RFQs() {
	const navigate = useNavigate();
	const { any } = usePermissions();
	const canCreate = any(['requests:create']);
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
		{ field: 'status', headerName: 'Durum', flex: 0.6, minWidth: 120, renderCell: (p) => <StatusChip status={p.value} /> },
		{ field: 'deadline', headerName: 'Son Tarih', flex: 0.8, minWidth: 140, valueGetter: (params) => {
			const value = params?.value;
			if(!value) return '-';
			const d = new Date(value);
			return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('tr-TR');
		}},
		{ field: 'createdAt', headerName: 'Oluşturma', flex: 0.8, minWidth: 160, valueGetter: (params) => {
			const value = params?.value;
			if(!value) return '-';
			const d = new Date(value);
			return isNaN(d.getTime()) ? '-' : d.toLocaleString('tr-TR');
		}},
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
								right={
									<Stack direction="row" gap={1}>
										<Tooltip title={canCreate? 'Yeni RFQ':'Yetki yok'}>
											<span><Button disabled={!canCreate} variant="contained" onClick={()=>navigate('/satinalma/rfq/olustur')}>Yeni RFQ</Button></span>
										</Tooltip>
										<Button variant="outlined" onClick={load}>Yenile</Button>
									</Stack>
								}
							/>

				<MainCard content={false} sx={{ overflow: 'hidden' }}>
					<FilterBar
						search={{ value: q, onChange: setQ, placeholder: 'Ara...' }}
						onRefresh={load}
						onClear={()=> setQ('')}
					/>
					<Box sx={{ height: 560, width: '100%' }}>
						{loading ? (
							<TableSkeleton rows={8} columns={7} />
						) : filteredRows.length===0 ? (
							<EmptyState title="Kayıt yok" description="Aramanızı değiştirin veya yeni RFQ oluşturun." />
						) : (
							<DataGrid
								rows={filteredRows}
								columns={columns}
								disableRowSelectionOnClick
								onRowClick={(p) => navigate(`/rfqs/${p.id}`)}
								pageSizeOptions={[10, 25, 50]}
								initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
								density="compact"
								sx={(theme)=>({
									border: '1px solid',
									borderColor: theme.palette.divider,
									borderRadius: 12,
									'& .MuiDataGrid-columnHeaders': { fontWeight: 600 },
									'& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: theme.palette.mode==='dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' },
									'& .MuiDataGrid-row.Mui-selected': { backgroundColor: theme.palette.action.selected, '&:hover': { backgroundColor: theme.palette.action.selected }},
									'& .MuiDataGrid-cell': { outline: 'none !important' }
								})}
							/>
						)}
					</Box>
				</MainCard>
			</Box>
		);
}

