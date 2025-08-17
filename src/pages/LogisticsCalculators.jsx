import React, { useState } from 'react';
import { Box, Stack, TextField, Typography, Divider } from '@mui/material';
import MainCard from '../components/common/MainCard';
import PageHeader from '../components/common/PageHeader';
import { calcVolumeM3, calcVolumetricWeightKg, calcDesi, containerTareKg, trailerTareKg, round } from '../utils/logisticsCalc';

export default function LogisticsCalculators(){
  const [dims, setDims] = useState({ l: '', w: '', h: '', p: '1' });
  const [divisor, setDivisor] = useState('6000');
  const [containerType, setContainerType] = useState('20GP');
  const [trailerType, setTrailerType] = useState('standard');

  const L = parseFloat(dims.l||'0');
  const W = parseFloat(dims.w||'0');
  const H = parseFloat(dims.h||'0');
  const P = parseFloat(dims.p||'1');
  const D = parseFloat(divisor||'6000');

  const vol = calcVolumeM3(L,W,H,P);
  const vw = calcVolumetricWeightKg(L,W,H,P,D);
  const desi = calcDesi(L,W,H,P,3000);
  const tare = containerTareKg(containerType);
  const trailerTare = trailerTareKg(trailerType);

  return (
    <Box>
      <PageHeader title="Lojistik Hesaplamalar" description="Hacim, volumetrik ağırlık, desi ve ekipman darası" />
      <MainCard sx={{ mt:1 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1">Ölçüler (cm) ve Adet</Typography>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
            <TextField label="Uzunluk (cm)" value={dims.l} onChange={e=>setDims(d=>({...d,l:e.target.value}))} size="small" />
            <TextField label="Genişlik (cm)" value={dims.w} onChange={e=>setDims(d=>({...d,w:e.target.value}))} size="small" />
            <TextField label="Yükseklik (cm)" value={dims.h} onChange={e=>setDims(d=>({...d,h:e.target.value}))} size="small" />
            <TextField label="Parça" value={dims.p} onChange={e=>setDims(d=>({...d,p:e.target.value}))} size="small" />
            <TextField label="Volumetrik Bölü (örn: 6000)" value={divisor} onChange={e=>setDivisor(e.target.value)} size="small" />
          </Stack>
          <Typography variant="body2">Hacim: <b>{round(vol,3)} m³</b> — Volumetrik Ağırlık: <b>{round(vw,2)} kg</b> — Desi: <b>{round(desi,0)}</b></Typography>
          <Divider />
          <Typography variant="subtitle1">Ekipman Darası</Typography>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
            <TextField label="Konteyner Tipi" value={containerType} onChange={e=>setContainerType(e.target.value)} size="small" placeholder="20GP|40GP|40HC|45HC" />
            <TextField label="Dorse Tipi" value={trailerType} onChange={e=>setTrailerType(e.target.value)} size="small" placeholder="standard|mega" />
          </Stack>
          <Typography variant="body2">Konteyner Darası: <b>{tare} kg</b> — Dorse Darası: <b>{trailerTare} kg</b></Typography>
          <Divider />
          <Typography variant="body2" color="text.secondary">Not: Bu hesaplamalar yaklaşık değerler içindir. Operasyonel kararlar için taşıyıcı/terminal verilerini doğrulayın.</Typography>
        </Stack>
      </MainCard>
    </Box>
  );
}
