import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Chip, Typography, Stack, Tooltip } from '@mui/material';
import axios from '../utils/axios';

// Basit inline SVG bayraklar (küçük boyut için stilize)
const Flag = ({ code }) => {
  const size = 14;
  switch (code) {
    case 'GB':
      return (
        <svg width={size} height={size * 0.7} viewBox="0 0 60 42">
          <rect width="60" height="42" fill="#012169"/>
          <path d="M0,0 60,42 M60,0 0,42" stroke="#fff" strokeWidth="8"/>
          <path d="M0,0 60,42 M60,0 0,42" stroke="#C8102E" strokeWidth="4"/>
          <path d="M30,0 v42 M0,21 h60" stroke="#fff" strokeWidth="14"/>
          <path d="M30,0 v42 M0,21 h60" stroke="#C8102E" strokeWidth="8"/>
        </svg>
      );
    case 'US':
      return (
        <svg width={size} height={size * 0.7} viewBox="0 0 57 30">
          <rect width="57" height="30" fill="#b22234"/>
          {Array.from({length: 5}).map((_,i)=>(<rect key={i} y={(i*2+1)*3} width="57" height="3" fill="#fff"/>))}
          <rect width="22" height="15" fill="#3c3b6e"/>
        </svg>
      );
    case 'JP':
      return (
        <svg width={size} height={size * 0.7} viewBox="0 0 3 2">
          <rect width="3" height="2" fill="#fff"/>
          <circle cx="1.5" cy="1" r="0.6" fill="#bc002d"/>
        </svg>
      );
    case 'CN':
      return (
        <svg width={size} height={size * 0.7} viewBox="0 0 30 20">
          <rect width="30" height="20" fill="#de2910"/>
          <polygon points="5,2 6,5 9,5 6.5,7 7.5,10 5,8.5 2.5,10 3.5,7 1,5 4,5" fill="#ffde00"/>
        </svg>
      );
    default:
      return null;
  }
};

const tzList = [
  { key: 'GB', tz: 'Europe/London' },
  { key: 'US', tz: 'America/New_York' },
  { key: 'JP', tz: 'Asia/Tokyo' },
  { key: 'CN', tz: 'Asia/Shanghai' }
];

export default function ExchangeRatesWidget() {
  const [rates, setRates] = useState(null);
  const lastRatesRef = useRef(null);
  const latestRatesRef = useRef(null);
  const [timeStrs, setTimeStrs] = useState({});
  const [updatedAt, setUpdatedAt] = useState(null);
  const historyRef = useRef({}); // { USD: [..], EUR: [..], ... }
  const inflightRef = useRef(false);
  const retryAtRef = useRef(0);

  // Uygulama yeniden yüklense bile trendi korumak için önceki kurları al
  useEffect(() => {
    try {
      const persisted = sessionStorage.getItem('lastExchangeRates');
      if (persisted) lastRatesRef.current = JSON.parse(persisted);
  } catch {
      // ignore storage parse errors in dev
    }
    try {
      const h = sessionStorage.getItem('exchangeHistory');
      if (h) historyRef.current = JSON.parse(h) || {};
  } catch {
      // ignore
    }
  }, []);

  // Keep a ref in sync with current state to compare deltas without re-creating callbacks
  useEffect(() => {
    latestRatesRef.current = rates;
  }, [rates]);

  const fetchRates = useCallback(async () => {
    if (inflightRef.current) return; // aynı anda birden fazla istek atma
    const now = Date.now();
    if (retryAtRef.current && now < retryAtRef.current) return; // 429 sonrası bekle
    try {
      inflightRef.current = true;
      const { data } = await axios.get('/exchange');
      if (data?.success) {
        // Önceki anlık görüntü (trend karşılaştırma)
        const previous = latestRatesRef.current?.rates || lastRatesRef.current;
        lastRatesRef.current = previous;
        setRates(data);
        setUpdatedAt(Date.now());
        // Tarihçe: her kur için son 10 değeri sakla
        const hist = { ...(historyRef.current || {}) };
        Object.entries(data.rates || {}).forEach(([k, v]) => {
          if (typeof v !== 'number') return;
          const arr = Array.isArray(hist[k]) ? hist[k] : [];
          arr.push(Number(v));
          while (arr.length > 10) arr.shift();
          hist[k] = arr;
        });
        historyRef.current = hist;
        // Kalıcı olarak sakla ki sayfa yenilense de trend hesaplanabilsin
        try {
          sessionStorage.setItem('lastExchangeRates', JSON.stringify(data.rates));
          sessionStorage.setItem('exchangeHistory', JSON.stringify(historyRef.current));
  } catch {
          // ignore storage write errors in dev
        }
      }
    } catch (e) {
      console.error('Kur alınamadı', e);
      // 429 ise 2 dakika bekle
      const status = e?.response?.status;
      if (status === 429) {
        retryAtRef.current = Date.now() + 2 * 60 * 1000;
      }
    }
    finally {
      inflightRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchRates();
  // 15 dakikada bir yenile (backend tarafında zaten cache var)
  const iv = setInterval(fetchRates, 15 * 60 * 1000);
    return () => clearInterval(iv);
  }, [fetchRates]);

  useEffect(() => {
    const tick = () => {
      const next = {};
      tzList.forEach(t => {
        next[t.key] = new Intl.DateTimeFormat('tr-TR', {
          timeZone: t.tz,
          hour: '2-digit', minute: '2-digit'
        }).format(new Date());
      });
      setTimeStrs(next);
    };
    tick();
    const iv = setInterval(tick, 1000 * 30);
    return () => clearInterval(iv);
  }, []);

  // Basit sparkline
  const Spark = ({ series = [], width = 28, height = 12, trend = 'neutral' }) => {
    const vals = series.filter((v) => typeof v === 'number');
    if (!vals.length) return null;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    const stepX = width / Math.max(vals.length - 1, 1);
    const points = vals.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * height;
      return `${x},${y}`;
    }).join(' ');
    const color = trend === 'up' ? '#2e7d32' : trend === 'down' ? '#d32f2f' : 'currentColor';
    return (
      <svg width={width} height={height} style={{ marginRight: 0 }}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="1" opacity={0.8} />
      </svg>
    );
  };

  const Rate = ({ code, value }) => {
    let color = 'default';
    let arrow = '→';
    const prev = lastRatesRef.current?.[code];
    if (typeof prev === 'number' && typeof value === 'number') {
      const diff = value - prev;
      const eps = 0.0001; // yuvarlama hassasiyeti
      if (diff > eps) { color = 'success'; arrow = '↑'; }
      else if (diff < -eps) { color = 'error'; arrow = '↓'; }
      else { color = 'default'; arrow = '→'; }
    }
  const hist = historyRef.current?.[code] || [];
  const trend = arrow === '↑' ? 'up' : arrow === '↓' ? 'down' : 'neutral';
    return (
      <Chip
        size="small"
        color={color === 'default' ? undefined : color}
        variant={color === 'default' ? 'outlined' : 'filled'}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Sparkline en solda; USD öncesi mesafe 1px */}
            <Spark series={hist} trend={trend} />
            <Box component="span" sx={{ fontWeight: 700, ml: '2px' }}>{code}</Box>
            <Box component="span" sx={{ opacity: 0.9, ml: 0 }}>{value?.toFixed(4)} {arrow}</Box>
          </Box>
        }
  sx={{ px: 0, mr: .5, fontWeight: 600, '& .MuiChip-label': { px: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' } }}
      />
    );
  };

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mr: 1.5 }}>
      <Stack direction="row" spacing={0.4} alignItems="center">
        {rates?.rates && (
          <>
            <Rate code="USD" value={rates.rates.USD} />
            <Rate code="EUR" value={rates.rates.EUR} />
            <Rate code="RUB" value={rates.rates.RUB} />
            <Rate code="CNY" value={rates.rates.CNY} />
            {rates.rates.EURUSD && <Rate code="EUR/USD" value={rates.rates.EURUSD} />}
          </>
        )}
      </Stack>
      {/* Son güncelleme */}
      {updatedAt && (
        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
          {(() => {
            const sec = Math.floor((Date.now() - updatedAt) / 1000);
            if (sec < 60) return `Az önce`;
            const min = Math.floor(sec / 60);
            if (min < 60) return `${min} dk önce güncellendi`;
            const hr = Math.floor(min / 60);
            return `${hr} sa önce güncellendi`;
          })()}
        </Typography>
      )}
  <Box sx={{ width: 1, height: 22, borderLeft: '1px solid', borderColor: 'divider', mx: 0.75 }} />
  <Stack direction="row" spacing={0.4} alignItems="center">
        {tzList.map((t) => (
          <Tooltip key={t.key} title={t.tz}>
            <Chip
              size="small"
              variant="outlined"
              sx={{ '& .MuiChip-label': { px: 0.5, display: 'flex', alignItems: 'center' } }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Flag code={t.key} />
                  <span>{timeStrs[t.key] || ''}</span>
                </Box>
              }
            />
          </Tooltip>
        ))}
      </Stack>
    </Stack>
  );
}
