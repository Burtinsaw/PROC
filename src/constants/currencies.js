// ISO 4217 kodları; öncelikli olanlar en üstte gelir
export const PRIORITY_CURRENCIES = ['USD', 'EUR', 'RUB', 'CNY'];

export const ALL_CURRENCIES = [
  // Öncelikli
  'USD','EUR','RUB','CNY',
  // Yaygın diğerleri
  'TRY','GBP','JPY','CHF','AUD','CAD','SEK','NOK','DKK',
  'AED','SAR','KWD','QAR','BHD','OMR',
  'PLN','CZK','HUF','RON','BGN',
  'RSD','UAH','GEL','AZN',
  'ILS','ZAR','MXN','BRL','CLP','COP','PEN','ARS',
  'HKD','SGD','KRW','TWD','THB','MYR','IDR','PHP','VND',
  'INR','PKR','BDT',
  'EGP','MAD','TND',
  'NZD'
];

export function orderedCurrencies() {
  const seen = new Set();
  const combined = [...PRIORITY_CURRENCIES, ...ALL_CURRENCIES];
  return combined.filter(c => !seen.has(c) && seen.add(c));
}
