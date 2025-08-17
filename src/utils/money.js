export function formatMoney(value, currency = 'TRY', locale = 'tr-TR') {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  try {
    const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 });
    return fmt.format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}
