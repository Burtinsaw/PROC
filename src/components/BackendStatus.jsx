import React, { useEffect, useState, useRef } from 'react';
import { Alert, Collapse, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from '../utils/axios';

export default function BackendStatus() {
  const [down, setDown] = useState(false);
  const timer = useRef(null);

  const ping = async () => {
    try {
      await axios.get('/health', { timeout: 3000 });
      setDown(false);
    } catch {
      setDown(true);
    }
  };

  useEffect(() => {
    ping();
    // 20 sn'de bir kontrol et (daha az gürültü ve rate limit güvenli)
    timer.current = setInterval(ping, 20000);
    return () => clearInterval(timer.current);
  }, []);

  return (
    <Collapse in={down}>
      <Alert
        severity="warning"
        action={
          <IconButton color="inherit" size="small" onClick={ping}>
            <RefreshIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ borderRadius: 0 }}
      >
        Sunucuya ulaşılamıyor. Backend henüz başlatılmamış olabilir. Tekrar dene.
      </Alert>
    </Collapse>
  );
}
