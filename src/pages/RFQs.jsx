import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Paper, Stack, Tooltip } from '@mui/material';
import StatusChip from '../components/common/StatusChip';
import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'sonner';
import MainCard from '../components/common/MainCard';
import PageHeader from '../components/common/PageHeader';
import TableSkeleton from '../components/common/skeletons/TableSkeleton';
import EmptyState from '../components/common/EmptyState';
import FilterBar from '../components/table/FilterBar';
import usePermissions from '../hooks/usePermissions';
const RFQsGrid = lazy(() => import('../tables/RFQsGrid'));

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
				// Fetch approval SLA summary for RFQs
				let slaMap = new Map();
				try {
					const { data: s } = await axios.get('/approvals/_summary', {
						params: {
							entityType: 'rfq',
							status: 'pending',
							overdueFirst: 'true',
							fields: 'entityId,slaDeadline,minutesRemaining,isOverdue,nextRole'
						},
						headers: { 'X-Suppress-Error-Toast': '1' }
					});
					const arr = Array.isArray(s?.approvals) ? s.approvals : [];
					slaMap = new Map(arr.map(a => [Number(a.entityId), a]));
				} catch { /* ignore SLA fetch errors */ }
				setRows(list.map((r) => {
					const sla = slaMap.get(Number(r.id));
					return {
						id: r.id,
						rfqNumber: r.rfqNumber,
						title: r.title,
						status: r.status,
						deadline: r.deadline,
						createdAt: r.createdAt,
						talepTitle: r.talep?.talepBasligi || '-',
						createdBy: r.createdBy ? `${r.createdBy.firstName || ''} ${r.createdBy.lastName || ''}`.trim() : '-',
						slaDeadline: sla?.slaDeadline || null,
						slaMinutes: sla?.minutesRemaining ?? null,
						slaOverdue: !!sla?.isOverdue,
						slaNextRole: sla?.nextRole || null
					};
				}));
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
		{ field: 'sla', headerName: 'SLA', flex: 0.7, minWidth: 140, sortable: false, filterable: false, valueGetter: (params)=> params.row.slaOverdue ? 'overdue' : (params.row.slaMinutes ?? null), renderCell: (p)=>{
			const r = p.row;
			if(r.slaOverdue) return <Chip size="small" color="error" label="Gecikmiş" />;
			if(r.slaMinutes != null) return <Chip size="small" color={r.slaMinutes <= 15 ? 'warning' : 'default'} label={`${r.slaMinutes} dk`} />;
			return <Chip size="small" variant="outlined" label="-" />;
		}},
		{ field: 'slaNextRole', headerName: 'Sıradaki Rol', flex: 0.7, minWidth: 140, renderCell: (p)=> p.value ? <Chip size="small" variant="outlined" label={p.value} /> : '-' },
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
							<Suspense fallback={<TableSkeleton rows={8} columns={7} />}>
								<RFQsGrid
									rows={filteredRows}
									columns={columns}
									onRowClick={(p) => navigate(`/rfqs/${p.id}`)}
								/>
							</Suspense>
						)}
					</Box>
				</MainCard>
			</Box>
		);
}

