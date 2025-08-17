import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { orderedCurrencies, PRIORITY_CURRENCIES } from '../constants/currencies';

let cache = null;
let inflight = null;

export default function useAllowedCurrencies() {
  const [list, setList] = useState(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) { setList(cache); setLoading(false); return; }
    if (!inflight) {
      inflight = api.get('/companies/_allowed-currencies')
        .then(({ data }) => {
          const raw = Array.isArray(data?.allowedCurrencies) ? data.allowedCurrencies : [];
          const uniq = Array.from(new Set(raw.map(c => String(c || '').toUpperCase()).filter(Boolean)));
          const prioritized = [
            ...PRIORITY_CURRENCIES.filter(c => uniq.includes(c)),
            ...uniq.filter(c => !PRIORITY_CURRENCIES.includes(c))
          ];
          cache = prioritized.length ? prioritized : null;
          return cache;
        })
        .catch((e) => { cache = null; throw e; })
        .finally(() => { inflight = null; });
    }
    inflight.then((val) => { setList(val); setLoading(false); }).catch((e) => { setError(e); setLoading(false); });
  }, []);

  return { currencies: list || orderedCurrencies(), loading, error };
}
