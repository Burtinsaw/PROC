const express = require('express');
const router = express.Router();
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

// Simple in-memory cache (could be replaced with Redis later)
let cache = { data: null, ts: 0 };
const TTL_MS = 5 * 60 * 1000; // 5 minutes

// Helper to parse TCMB XML
function extractRatesFromTCMB(xmlObj) {
  const currencies = xmlObj?.Tarih_Date?.Currency || [];
  const wanted = ['USD', 'EUR', 'RUB', 'CNY'];
  const map = {};
  currencies.forEach(c => {
    const code = c['@_Kod'];
    if (wanted.includes(code)) {
      // Try BanknoteSelling then ForexSelling fallback
      const selling = parseFloat(c.BanknoteSelling || c.ForexSelling || '0');
      if (selling) map[code] = selling;
    }
  });
  if (map.EUR && map.USD) {
    map.EURUSD = parseFloat((map.EUR / map.USD).toFixed(4));
  }
  return map;
}

// Parse flexible JSON from hasanadiguzel.com.tr
function extractRatesFromHasan(json) {
  const wanted = ['USD', 'EUR', 'RUB', 'CNY'];
  const out = {};
  // Flatten all nested arrays/objects
  const stack = [json];
  while (stack.length) {
    const cur = stack.pop();
    if (Array.isArray(cur)) {
      cur.forEach(v => stack.push(v));
    } else if (cur && typeof cur === 'object') {
      const code = (cur.Kod || cur.Code || cur.CurrencyCode || cur.Currency)?.toString().toUpperCase();
      if (code && wanted.includes(code)) {
        const selling = parseFloat(cur.BanknoteSelling || cur.Banknote_Selling || cur.Selling || cur.ForexSelling || '0');
        if (selling) out[code] = selling;
      }
      // EUR/USD cross on EUR -> CrossRateOther
      if (code === 'EUR') {
        const cr = parseFloat(cur.CrossRateOther || cur.Cross_Rate_Other || '0');
        if (cr) out.EURUSD = parseFloat(cr.toFixed(4));
      }
      Object.values(cur).forEach(v => {
        if (v && (typeof v === 'object' || Array.isArray(v))) stack.push(v);
      });
    }
  }
  return out;
}

router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    if (cache.data && now - cache.ts < TTL_MS) {
      return res.json({ success: true, source: 'cache', rates: cache.data, updatedAt: new Date(cache.ts).toISOString() });
    }
    // Try Hasan Adiguzel JSON API first
    let rates = null;
    try {
      const r1 = await axios.get('http://hasanadiguzel.com.tr/api/kurgetir', { timeout: 8000 });
      const j = r1.data;
      const parsed = extractRatesFromHasan(j);
      if (Object.keys(parsed).length) rates = parsed;
    } catch (e) {
      console.warn('Hasan API fallback to TCMB:', e.message);
    }

    // Fallback: TCMB XML
    if (!rates) {
  const resp = await axios.get('https://www.tcmb.gov.tr/kurlar/today.xml', { responseType: 'text' });
  const text = resp.data;
      const parser = new XMLParser({ ignoreAttributes: false });
      const xmlObj = parser.parse(text);
      rates = extractRatesFromTCMB(xmlObj);
    }

    cache = { data: rates, ts: now };
    res.json({ success: true, source: 'live', rates, updatedAt: new Date(now).toISOString() });
  } catch (err) {
    console.error('Exchange route error:', err.message);
    res.status(500).json({ success: false, message: 'Kur verisi alınamadı', error: err.message });
  }
});

module.exports = router;
