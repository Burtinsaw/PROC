import React from 'react';
import { Box, Typography, Stack, Paper, Stepper, Step, StepLabel, Button, Chip } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../../utils/axios';

const steps = ['Oluşturuldu','İnceleme','Onay','Satınalma','Tamamlandı'];

export default function TalepTakip(){
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('id') || 'TLP-001';
  const [talep, setTalep] = React.useState(null);
  const activeStep = 2; // placeholder

  React.useEffect(()=>{
    let mounted = true;
    (async ()=>{
  try {
        // If id looks like code (has dashes and letters), fetch by code; else by numeric id
        const byCode = /[A-Z]+-\d{4}-\d{4}-/.test(id);
        const url = byCode ? `/talepler/code/${encodeURIComponent(id)}` : `/talepler/${encodeURIComponent(id)}`;
        const { data } = await axios.get(url);
        if(mounted) setTalep(data);
      } catch {/* ignore */}
  finally { /* noop */ }
    })();
    return ()=>{ mounted = false; };
  }, [id]);
  return (
    <Box p={3} sx={{ display:'flex', flexDirection:'column', gap:3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap={2} alignItems="center">
          <Button size="small" variant="text" startIcon={<ArrowLeft size={16} />} onClick={()=>navigate('/talep')}>Geri</Button>
          <Typography variant="h4" fontWeight={600}>Talep Takip</Typography>
        </Stack>
      </Stack>
      <Paper elevation={0} sx={{ p:3, borderRadius:3, display:'flex', flexDirection:'column', gap:3 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="subtitle1" fontWeight={600}>{id}</Typography>
          {talep?.proformaNumber && (
            <Chip size="small" color="info" variant="outlined" label={talep.proformaNumber}
              onClick={()=> navigate(`/proforma/${encodeURIComponent(talep.proformaNumber)}`)} />
          )}
        </Stack>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
}
