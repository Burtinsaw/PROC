import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, fetchStaging, updateStagingItem, promoteStaging, startExtraction, updateRequestStatus, REQUEST_STATUS_LABELS } from '../../api/requests';
import { Box, Typography, CircularProgress, Card, CardContent, Chip, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TextField, Tooltip, Stack, Divider } from '@mui/material';
import { Check, X, RefreshCcw, Rocket, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

export default function RequestDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [stagingJobs, setStagingJobs] = useState([]);
  const [items, setItems] = useState([]);
  const [addingLines, setAddingLines] = useState(false);
  const [newLines, setNewLines] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [polling, setPolling] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const load = async ()=>{
    try {
      setLoading(true);
  const { request: req } = await getRequest(id);
  setRequest(req);
  setItems(req.items || []);
      const jobs = await fetchStaging(id);
      setStagingJobs(jobs);
  } catch{ toast.error('Talep yüklenemedi'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleAccepted = async (st) => {
    try {
      await updateStagingItem(st.id, { accepted: !st.accepted });
      toast.success('Güncellendi');
      load();
    } catch{ toast.error('Güncellenemedi'); }
  };

  const handlePromote = async ()=>{
    try {
      setPromoting(true);
      const res = await promoteStaging(id);
  toast.success(`Promote: ${res.added} kalem eklendi`);
      load();
    } catch{ toast.error('Promote başarısız'); }
    finally { setPromoting(false); }
  };

  const pollJobs = async (attempt=0)=>{
    try {
      const jobs = await fetchStaging(id);
      setStagingJobs(jobs);
      if (jobs.some(j=> j.status !== 'completed') && attempt < 20) {
        setTimeout(()=> pollJobs(attempt+1), 1500);
      } else {
        setPolling(false);
      }
    } catch { setPolling(false); }
  };

  const handleAddLines = async ()=>{
    const lines = newLines.split('\n').map(l=>l.trim()).filter(Boolean);
    if(!lines.length) return toast.warning('Satır girin');
    try {
      setAddingLines(true);
      await startExtraction(id, lines);
      setNewLines('');
      toast.success('Job kuyruğa alındı');
      setPolling(true);
      pollJobs();
    } catch { toast.error('Extraction başarısız'); }
    finally { setAddingLines(false); }
  };

  const changeStatus = async (next)=>{
    try { setStatusUpdating(true); await updateRequestStatus(id, next); toast.success('Durum güncellendi'); load(); }
    catch { toast.error('Durum güncellenemedi'); }
    finally { setStatusUpdating(false); }
  };

  const acceptedCount = stagingJobs.reduce((acc,j)=> acc + j.stagingItems.filter(s=>s.accepted).length, 0);

  if(loading) return <Box p={4} textAlign='center'><CircularProgress /></Box>;
  if(!request) return <Box p={4}>Bulunamadı</Box>;

  const status = request.status;
  const transitions = {
    draft:['review','rejected'],
    review:['approved','rejected','draft'],
    approved:['converted'],
    rejected:['draft'],
    converted:[]
  };

  return (
    <Box p={2}>
      <Button variant='text' onClick={()=>navigate(-1)} sx={{mb:2}}>Geri</Button>
      <Card sx={{mb:2}}>
        <CardContent>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Box>
              <Typography variant='h5'>{request.code}</Typography>
              <Typography variant='body2' color='text.secondary'>{request.contactName || '-'} / {request.company?.name || '-'}</Typography>
            </Box>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Chip label={REQUEST_STATUS_LABELS[status] || status} color='primary' />
              {transitions[status].map(tr => (
                <Button key={tr} size='small' disabled={statusUpdating} variant='outlined' onClick={()=>changeStatus(tr)}>{REQUEST_STATUS_LABELS[tr] || tr}</Button>
              ))}
            </Stack>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{mb:2}}>
        <CardContent>
          <Typography variant='h6' gutterBottom>Extraction Satır Ekle</Typography>
          <TextField multiline minRows={4} fullWidth placeholder='Her satır bir ürün...' value={newLines} onChange={e=>setNewLines(e.target.value)} />
          <Box mt={1} display='flex' gap={1}>
            <Button startIcon={<Rocket size={16} />} disabled={addingLines} variant='contained' onClick={handleAddLines}>Çıkar</Button>
            <Button startIcon={<RefreshCcw size={16} />} onClick={load}>Yenile</Button>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{mb:2}}>
        <CardContent>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
            <Typography variant='h6'>Staging Kalemleri</Typography>
            <Tooltip title='Accepted kalemleri RequestItems tablosuna aktarır'>
              <span>
                <Button startIcon={<ArrowUpRight size={16} />} disabled={!acceptedCount || promoting} variant='contained' onClick={handlePromote}>Promote ({acceptedCount})</Button>
              </span>
            </Tooltip>
          </Box>
      {stagingJobs.map(job => (
            <Box key={job.id} mb={3}>
        <Typography variant='subtitle2' gutterBottom>Job #{job.id} - {job.status} {job.status!=='completed' && polling && '⏳'}</Typography>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Accept</TableCell>
                    <TableCell>Raw</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Conf</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {job.stagingItems.map(st => (
                    <TableRow key={st.id} selected={st.accepted}>
                      <TableCell width={60}>
                        <IconButton size='small' color={st.accepted?'success':'default'} onClick={()=>toggleAccepted(st)}>
                          {st.accepted? <Check size={18} /> : <X size={18} />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{st.rawLine}</TableCell>
                      <TableCell>{st.description}</TableCell>
                      <TableCell>{st.quantity || 1}</TableCell>
                      <TableCell>{st.unit || '-'}</TableCell>
                      <TableCell>{st.confidence || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {!job.stagingItems.length && <TableRow><TableCell colSpan={6} align='center'>Kalem yok</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Box>
          ))}
          {!stagingJobs.length && <Typography variant='body2'>Extraction verisi yok.</Typography>}
          <Divider sx={{my:3}} />
          <Typography variant='h6' gutterBottom>Request Kalemleri</Typography>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell>Marka</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Parça No</TableCell>
                <TableCell>Miktar</TableCell>
                <TableCell>Birim</TableCell>
                <TableCell>Conf</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(it => (
                <TableRow key={it.id}>
                  <TableCell>{it.lineNo}</TableCell>
                  <TableCell>{it.description || it.rawText}</TableCell>
                  <TableCell>{it.brand || '-'}</TableCell>
                  <TableCell>{it.model || '-'}</TableCell>
                  <TableCell>{it.partNumber || '-'}</TableCell>
                  <TableCell>{it.quantity || 1}</TableCell>
                  <TableCell>{it.unit || '-'}</TableCell>
                  <TableCell>{it.confidence || '-'}</TableCell>
                </TableRow>
              ))}
              {!items.length && <TableRow><TableCell colSpan={8} align='center'>Henüz promote edilmiş kalem yok</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
