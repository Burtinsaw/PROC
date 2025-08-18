import React, { useEffect, useMemo, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { Box, Button, CircularProgress, MenuItem, Paper, Select, Stack, TextField, Typography, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Universal Components - Theme-aware components  
import { UniversalPageHeader, UniversalSectionCard, UniversalFilterBar, UniversalStatusChip } from '../components/universal';

// Other components
import PriorityChip from '../components/common/PriorityChip';
import ActionBar from '../components/common/ActionBar';
import TableSkeleton from '../components/common/skeletons/TableSkeleton';
import EmptyState from '../components/common/EmptyState';

// Services
import axios from '../utils/axios';
import { toast } from 'sonner';

const RequestsGrid = lazy(() => import('../tables/RequestsGrid'));

export default function Requests() {
	const navigate = useNavigate();
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [q, setQ] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [priorityFilter, setPriorityFilter] = useState('');
	const [hasProforma, setHasProforma] = useState(''); // '', 'true', 'false'
	const [selectionModel, setSelectionModel] = useState([]);
	const [bulkLoading, setBulkLoading] = useState(false);
	const initRan = useRef(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const params = {};
			if (statusFilter) params.durum = statusFilter;
			if (hasProforma) params.hasProforma = hasProforma;
			const { data } = await axios.get('/talepler', { params });
			const list = Array.isArray(data) ? data : [];
			setRows(list.map((t) => ({
				id: t.id,
				talepNo: t.talepNo,
				talepBasligi: t.talepBasligi,
				durum: t.durum,
				firma: t.firma,
				proformaNumber: t.proformaNumber,
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
	}, [statusFilter, hasProforma]);

	useEffect(() => {
		if (initRan.current) return;
		initRan.current = true;
		load();
	}, [load]);

	// Re-load on server-side filters change
	useEffect(() => { load(); }, [load]);

	const columns = useMemo(() => [
		{ field: 'talepNo', headerName: 'Talep No', flex: 0.7, minWidth: 120 },
		{ field: 'talepBasligi', headerName: 'Başlık', flex: 1.4, minWidth: 220 },
		{ field: 'firma', headerName: 'Firma', flex: 1, minWidth: 180 },
		{ field: 'durum', headerName: 'Durum', flex: 0.7, minWidth: 120, renderCell: (p)=> <UniversalStatusChip status={p.value} /> },
		{ field: 'oncelik', headerName: 'Öncelik', flex: 0.6, minWidth: 110, renderCell: (p)=> <PriorityChip value={p.value} /> },
		{ field: 'proformaNumber', headerName: 'Proforma', flex: 0.9, minWidth: 150, renderCell: (p) => (
			p.value ? (
				<Chip
					size="small"
					label={p.value}
					variant="outlined"
					color="info"
					onClick={(e) => { e.stopPropagation(); navigate(`/proforma/${p.value}`); }}
				/>
			) : <Chip size="small" label="Yok" variant="outlined" />
		)},
		{ field: 'user', headerName: 'Talep Sahibi', flex: 1, minWidth: 180 },
		{ field: 'createdAt', headerName: 'Oluşturma', flex: 0.9, minWidth: 160, valueGetter: ({ value }) => value ? new Date(value).toLocaleString('tr-TR') : '-' },
	], [navigate]);

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
				<UniversalPageHeader
					title="Procurement Requests"
					subtitle="View and manage all procurement requests efficiently"
					actions={[
						<Button key="new" variant="contained" onClick={() => navigate('/requests/new')}>New Request</Button>
					]}
				/>

				<UniversalSectionCard title="Request Management">
					<UniversalFilterBar
						search={{ value: q, onChange: setQ, placeholder: 'Search requests...' }}
						onRefresh={load}
						onClear={() => { setQ(''); setStatusFilter(''); setPriorityFilter(''); setHasProforma(''); }}
						onFilter={() => {}}
						onExport={() => {}}
					/>
					<ActionBar
						count={selectionModel.length}
						actions={[
							{ key: 'approve', label: 'Bulk Approve', color: 'success', onClick: () => runBulk('approve'), loading: bulkLoading },
							{ key: 'reject', label: 'Bulk Reject', color: 'warning', variant: 'outlined', onClick: () => runBulk('reject'), loading: bulkLoading },
							{ key: 'delete', label: 'Bulk Delete', color: 'error', variant: 'outlined', onClick: () => runBulk('delete'), loading: bulkLoading }
						]}
					/>
					<Box sx={{ height: 560, width: '100%' }}>
						{loading ? (
							<TableSkeleton rows={8} columns={7} />
						) : filteredRows.length === 0 ? (
							<EmptyState title="No requests found" description="Change filters or create a new request." actionLabel="New Request" onAction={()=> navigate('/requests/new')} />
						) : (
							<Suspense fallback={<TableSkeleton rows={8} columns={7} />}>
								<RequestsGrid
									rows={filteredRows}
									columns={columns}
									selectionModel={selectionModel}
									setSelectionModel={setSelectionModel}
									onRowClick={(p) => navigate(`/requests/${p.id}`)}
								/>
							</Suspense>
						)}
					</Box>
				</UniversalSectionCard>
			</Box>
		);
	}

