import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Box, Chip, Stack, Tooltip } from '@mui/material';
import NeutralBadge from './common/NeutralBadge';
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

export default function ExchangeRatesWidget({ compact = false }) {
  const [rates, setRates] = useState(null);
  const lastRatesRef = useRef(null);
  const latestRatesRef = useRef(null);
  const [timeStrs, setTimeStrs] = useState({});
  const historyRef = useRef({}); // { USD: [..], EUR: [..], ... }
  const inflightRef = useRef(false);
  const retryAtRef = useRef(0);

  // Locale-aware formatter (tr-TR) without trailing zeros, up to 4 decimals
  // Yuvarlama yapmamak için yüksek bir üst sınır veriyoruz (örn. RUB 0,51427 -> 0,51427 kalır)
  const rateFormatter = useMemo(() => new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 10
  }), []);

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

  const fetchRates = useCallback(async (force = false) => {
    if (inflightRef.current) return; // aynı anda birden fazla istek atma
    const now = Date.now();
    if (retryAtRef.current && now < retryAtRef.current) return; // 429 sonrası bekle
    try {
  inflightRef.current = true;
  // Backend proxy: /api/exchange (axios baseURL '/api') EVDS varsa onu kullanır, yoksa fallback'ler
  const { data } = await axios.get(force ? 'exchange?force=1' : 'exchange');
      if (data?.success) {
        // Önceki anlık görüntü (trend karşılaştırma)
        const previous = latestRatesRef.current?.rates || lastRatesRef.current;
        lastRatesRef.current = previous;
  setRates(data);
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
  // 3 dakikada bir yenile (backend tarafında zaten cache var)
  const iv = setInterval(fetchRates, 3 * 60 * 1000);
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
  const Spark = ({ series = [], width = 20, height = 12, trend = 'neutral' }) => {
    const vals = series.filter((v) => typeof v === 'number');
    if (!vals.length) return null;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
  const endPad = 2; // sağ tarafta 2px boşluğu kesin
  const stepX = (width - endPad) / Math.max(vals.length - 1, 1);
    const points = vals.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * height;
      return `${x},${y}`;
    }).join(' ');
    const color = trend === 'up' ? '#2e7d32' : trend === 'down' ? '#d32f2f' : 'currentColor';
    return (
  <svg width={width} height={height} style={{ marginRight: 0, display: 'block' }}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="0.9"
          opacity={0.85}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  const Rate = ({ code, value }) => {
    let arrow = '→';
    let arrowColor = 'inherit';
    const prev = lastRatesRef.current?.[code];
    if (typeof prev === 'number' && typeof value === 'number') {
      const diff = value - prev;
      const eps = 0.0001; // yuvarlama hassasiyeti
      if (diff > eps) { arrow = '↑'; arrowColor = '#2e7d32'; } // yeşil
      else if (diff < -eps) { arrow = '↓'; arrowColor = '#d32f2f'; } // kırmızı
      else { arrow = '→'; arrowColor = 'inherit'; }
    }
    return (
      <Chip
        size="small"
        // Nötr görünüm; sadece ok renklenecek
        variant={'filled'}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ fontWeight: 700, ml: 0 }}>{code}</Box>
            <Box component="span" sx={{ opacity: 0.9, ml: '3px', pr: '1px' }}>
              {typeof value === 'number' ? rateFormatter.format(value) : '-'}{' '}
              <Box component="span" sx={{ color: arrowColor, fontWeight: 700 }}>{arrow}</Box>
            </Box>
          </Box>
        }
        sx={{
          px: 0,
          mr: .25,
          fontWeight: 600,
          minHeight: 'unset',
          bgcolor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          '& .MuiChip-label': {
            pl: '2px', pr: '2px', py: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            lineHeight: 1, gap: 0, overflow: 'hidden', whiteSpace: 'nowrap'
          }
        }}
      />
    );
  };

  const content = (
    <Stack direction="row" spacing={compact ? 0.5 : 0.75} alignItems="center" sx={{ mr: compact ? 0 : 1.5 }}>
      <Stack direction="row" spacing={0.4} alignItems="center">
        {rates?.rates && (
          <>
            <Rate code="USD" value={rates.rates.USD} />
            <Rate code="EUR" value={rates.rates.EUR} />
            {!compact && <Rate code="RUB" value={rates.rates.RUB} />}
            {!compact && <Rate code="CNY" value={rates.rates.CNY} />}
            {rates.rates.EURUSD && <Rate code="EUR/USD" value={rates.rates.EURUSD} />}
          </>
        )}
      </Stack>
      {/* Manuel yenile */}
      <Tooltip title="Kurları yenile">
        <Chip
          size="small"
          variant="filled"
          sx={{ ml: 0.5, bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
          label="↻"
          onClick={() => fetchRates(true)}
        />
      </Tooltip>
      {!compact && <Box sx={{ width: 1, height: 22, borderLeft: '1px solid', borderColor: 'divider', mx: 0.75 }} />}
      <Stack direction="row" spacing={0.4} alignItems="center" sx={{ display: compact ? 'none' : 'flex' }}>
        {tzList.map((t) => (
          <NeutralBadge
            key={t.key}
            tooltip={t.tz}
            icon={<Flag code={t.key} />}
            label={timeStrs[t.key] || ''}
            variant="subtle"
            size="small"
          />
        ))}
      </Stack>
    </Stack>
  );

  if (!compact) return content;
  return (
    <Box sx={{
      display:'flex', alignItems:'center', px:1, py:0.25,
      border:'1px solid', borderColor:'divider', borderRadius:1,
      bgcolor:'background.paper'
    }}>
      {content}
    </Box>
  );
}
