// Basit lojistik hesaplamaları yardımcıları

// m3 hesaplama (cm ölçüler)
export function calcVolumeM3(lengthCm = 0, widthCm = 0, heightCm = 0, pieces = 1) {
  const L = Number(lengthCm) || 0;
  const W = Number(widthCm) || 0;
  const H = Number(heightCm) || 0;
  const P = Number(pieces) || 0;
  return (L * W * H * P) / 1_000_000; // cm^3 -> m^3
}

// Volumetrik ağırlık (kg) — divisor: 6000 (IATA yaygın), 5000 (bazı kargo)
export function calcVolumetricWeightKg(lengthCm, widthCm, heightCm, pieces = 1, divisor = 6000) {
  const L = Number(lengthCm) || 0;
  const W = Number(widthCm) || 0;
  const H = Number(heightCm) || 0;
  const P = Number(pieces) || 0;
  if (!divisor) divisor = 6000;
  return (L * W * H * P) / divisor;
}

// Konteyner darası (kg) — yaklaşık değerler
export function containerTareKg(type = '20GP') {
  const map = {
    '20GP': 2200,
    '40GP': 3800,
    '40HC': 4000,
    '45HC': 4800
  };
  return map[type] ?? 0;
}

// Tipik dorse boş ağırlığı (kg) — yaklaşık değer
export function trailerTareKg(type = 'standard') {
  const map = { standard: 6500, mega: 7200 };
  return map[type] ?? 6500;
}

// Desi: kargo sektöründe sıklıkla (L*W*H)/3000 veya /4000; burada parametreli
export function calcDesi(lengthCm, widthCm, heightCm, pieces = 1, divisor = 3000) {
  const L = Number(lengthCm) || 0;
  const W = Number(widthCm) || 0;
  const H = Number(heightCm) || 0;
  const P = Number(pieces) || 0;
  return (L * W * H * P) / divisor;
}

export function round(n, digits = 2) {
  const f = Math.pow(10, digits);
  return Math.round((Number(n) || 0) * f) / f;
}
