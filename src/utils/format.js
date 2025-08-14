// Reusable number & currency formatting helpers
// Locale defaults to Turkish but can be overridden.

export function formatNumber(value, { locale='tr-TR', minimumFractionDigits=0, maximumFractionDigits=2 } = {}) {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(locale, { minimumFractionDigits, maximumFractionDigits }).format(num);
}

export function formatCurrency(value, { currency='TRY', locale='tr-TR', minimumFractionDigits=2, maximumFractionDigits=2 } = {}) {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(locale, { style:'currency', currency, minimumFractionDigits, maximumFractionDigits }).format(num);
}

export function humanizeDelta(value) {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  if (Math.abs(num) < 1000) return String(num);
  const units = [ { v:1e9, s:'B' }, { v:1e6, s:'M' }, { v:1e3, s:'K' } ];
  for (const u of units) {
    if (Math.abs(num) >= u.v) return (num / u.v).toFixed(1).replace(/\.0$/,'') + u.s;
  }
  return String(num);
}

export default { formatNumber, formatCurrency, humanizeDelta };
