import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Paper, Chip, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, CircularProgress } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'sonner';
import { UniversalPageHeader } from '../../components/universal';

export default function TalepBekleyen(){
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        // "Onay Bekliyor" durumundaki talepleri getir
        const { data } = await axios.get('/talepler', { params: { durum: 'Onay Bekliyor' } });
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setRows(list.map(t => ({
          id: t.id,
          talepNo: t.talepNo,
          talepBasligi: t.talepBasligi,
          durum: t.durum,
          firma: t.firma,
          proformaNumber: t.proformaNumber,
          olusturan: t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() : '-'
        })));
      } catch (e) {
        console.error('Bekleyen talepler yüklenemedi', e);
        toast.error('Bekleyen talepler alınamadı');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const headerActions = [
    <Button 
      key="back"
      size="small" 
      variant="text" 
      startIcon={<ArrowLeft size={16} />} 
      onClick={() => navigate('/talep')}
    >
      Geri
    </Button>
  ];

  return (
    <Box>
      <UniversalPageHeader
        title="Bekleyen Talepler"
        subtitle="Onay veya işleme alınmayı bekleyen taleplerin listesi"
        actions={headerActions}
      />
      
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{ width: 180 }}>Talep No</TableCell>
                <TableCell>Başlık</TableCell>
                <TableCell>Firma</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Oluşturan</TableCell>
                <TableCell>Proforma</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={20} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Kayıt bulunamadı</TableCell>
                </TableRow>
              ) : (
                rows.map(r => (
                  <TableRow key={r.id} hover sx={{ cursor:'pointer' }} onClick={()=>navigate(`/talep/takip?id=${r.talepNo || r.id}`)}>
                    <TableCell>{r.talepNo}</TableCell>
                    <TableCell>{r.talepBasligi}</TableCell>
                    <TableCell>{r.firma}</TableCell>
                    <TableCell><Chip size="small" label={r.durum} /></TableCell>
                    <TableCell>{r.olusturan}</TableCell>
                    <TableCell onClick={(e)=> e.stopPropagation()}>
                      {r.proformaNumber ? (
                        <Chip
                          size="small"
                          label={r.proformaNumber}
                          color="info"
                          variant="outlined"
                          onClick={()=> navigate(`/proforma/${r.proformaNumber}`)}
                        />
                      ) : (
                        <Chip size="small" label="Yok" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
