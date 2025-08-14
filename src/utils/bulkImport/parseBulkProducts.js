// Simple bulk product parser & language/column inference
// Input: raw text (CSV/TSV or pasted table). Returns { products, meta }
import axios from '../../utils/axios';

const HEADER_CANDIDATES = {
  name: ['name','ürün','urun','product','description','açıklama','aciklama','item'],
  quantity: ['qty','quantity','miktar','adet','amount'],
  unit: ['unit','birim','uom'],
  brand: ['brand','marka'],
  articleNumber: ['model','article','sku','kod','code','parça','parca','no']
};

function detectDelimiter(text){
  if(text.includes('\t')) return '\t';
  const comma = (text.match(/,/g)||[]).length;
  const semi = (text.match(/;/g)||[]).length;
  const pipe = (text.match(/\|/g)||[]).length;
  if(semi > comma && semi > pipe) return ';';
  if(pipe > comma) return '|';
  return ','; // default
}

function normalizeHeader(h){
  return h.toLowerCase().trim();
}

function mapHeaders(headerCells){
  const mapping = {};
  headerCells.forEach((cell, idx) => {
    const n = normalizeHeader(cell);
    for(const key in HEADER_CANDIDATES){
      if(HEADER_CANDIDATES[key].some(tok => n.includes(tok))){
        if(!Object.values(mapping).includes(key)) mapping[idx] = key; // first match
      }
    }
  });
  return mapping; // index -> fieldName
}

function detectLanguageSample(text){
  const sample = text.slice(0, 4000);
  const turkish = /[çğıöşüÇĞİÖŞÜ]/;
  const cyrillic = /[\u0400-\u04FF]/; // Russian/Cyrillic block
  const hasTr = turkish.test(sample);
  const hasRu = cyrillic.test(sample);
  let guess = 'en';
  if (hasRu) guess = 'ru'; else if (hasTr) guess = 'tr';
  return { hasTurkish: hasTr, hasRussian: hasRu, guess };
}

// Unit and token normalization maps
const UNIT_MAP = {
  pcs: 'adet', pc: 'adet', piece: 'adet', pieces: 'adet', unit: 'adet', items: 'adet',
  adet: 'adet', kalem: 'adet',
  'шт': 'adet', 'шт.': 'adet', 'штука': 'adet', 'штуки': 'adet',
  kg: 'kg', g: 'g', gr: 'g', gram: 'g', ton: 'ton', l: 'L', lt: 'L', liter: 'L', litre: 'L', ml: 'mL',
  pack: 'paket', package: 'paket', packet: 'paket', pkg: 'paket', kutu: 'kutu', box: 'kutu', коробка: 'kutu', набор: 'set', set: 'set', упак: 'paket', упаковка: 'paket'
};

const NAME_TOKEN_MAP_TO_TR = {
  screw: 'vida', bolt: 'civata', washer: 'pul', nut: 'somun', bearing: 'rulman', filter: 'filtre', pump: 'pompa', valve: 'valf', pipe: 'boru', hose: 'hortum',
  винт: 'vida', болт: 'civata', шайба: 'pul', гайка: 'somun', подшипник: 'rulman', фильтр: 'filtre', насос: 'pompa', клапан: 'valf', труба: 'boru', шланг: 'hortum'
};

function normalizeUnit(raw){
  if(!raw) return 'adet';
  const k = raw.toLowerCase().trim();
  return UNIT_MAP[k] || raw;
}

function translateNameTokensToTR(name, sourceLang){
  if(!name) return name;
  if(sourceLang === 'tr') return name;
  return name.split(/\s+/).map(tok => {
    const lower = tok.toLowerCase();
    return NAME_TOKEN_MAP_TO_TR[lower] || tok;
  }).join(' ');
}

export function parseBulkProducts(raw){
  if(!raw || !raw.trim()) return { products: [], meta: { empty:true } };
  const delimiter = detectDelimiter(raw);
  const rawLines = raw.split(/\r?\n/);
  const lines = rawLines.filter(l => l.trim());
  if(!lines.length) return { products: [], meta: { empty:true } };
  const firstCells = lines[0].split(delimiter).map(c=>c.trim());
  const headerMap = mapHeaders(firstCells);
  const hasHeader = Object.keys(headerMap).length >= 1; // treat as header if we matched something meaningful
  const startIdx = hasHeader ? 1 : 0;
  const products = [];
  let unitNormalizedCount = 0;
  let skippedEmpty = 0;
  for(let i=startIdx;i<lines.length;i++){
    const cells = lines[i].split(delimiter).map(c=>c.trim());
    if(cells.every(c=>!c)){ skippedEmpty++; continue; }
    const base = { name:'', quantity:1, unit:'adet', brand:'', articleNumber:'' };
  if(hasHeader){
      Object.entries(headerMap).forEach(([colIdx, field]) => {
        const val = cells[colIdx];
        if(field === 'quantity') base[field] = Number(val.replace(/[^0-9.,]/g,'').replace(',','.')) || 1;
        else base[field] = val || base[field];
      });
      if(!base.name) base.name = cells[0] || '';
    } else {
      // positional fallback
      base.name = cells[0] || '';
      if(cells[1]) base.quantity = Number(cells[1].replace(/[^0-9.,]/g,'').replace(',','.')) || 1;
      if(cells[2]) base.unit = cells[2];
      if(cells[3]) base.brand = cells[3];
      if(cells[4]) base.articleNumber = cells[4];
    }
    const beforeUnit = base.unit;
    base.unit = normalizeUnit(base.unit);
    if(beforeUnit !== base.unit) unitNormalizedCount++;
    if(base.name) products.push(base);
  }
  const lang = detectLanguageSample(raw);
  return {
    products,
    meta: { delimiter, hasHeader, header: hasHeader ? firstCells : null, headerMap, language: lang, stats: {
      rawLineCount: rawLines.length,
      nonEmptyLineCount: lines.length,
      parsedCount: products.length,
      skippedEmpty,
      unitNormalizedCount
    } }
  };
}

// Placeholder translation (would call backend service in real implementation)
export async function translateProductsIfNeeded(products, target = 'tr'){
  if(!products || !products.length) return { products: products || [], stats: { skipped:true } };
  if(!['tr','en','ru'].includes(target)) return { products, stats: { skipped:true } };
  const blob = products.map(p=>p.name).join(' ');
  const sourceLang = /[çğıöşüÇĞİÖŞÜ]/.test(blob) ? 'tr' : (/[\u0400-\u04FF]/.test(blob) ? 'ru' : 'en');
  if(sourceLang === target) return { products, stats: { skipped:true, reason:'same-language' } };
  try {
    const resp = await axios.post('/translate/batch', { items: products.map(p=>p.name), target, sourceLang });
    const data = resp.data;
    if(!data.translations) throw new Error('no translations');
    const map = new Map(data.translations.map(t => [t.source, t.translated]));
    const translatedProducts = products.map(p => ({ ...p, name: map.get(p.name) || p.name, unit: normalizeUnit(p.unit) }));
    return { products: translatedProducts, stats: data.stats || { backend:true } };
  } catch (e){
    console.warn('translateProductsIfNeeded fallback:', e.message);
    // fallback only for target=tr using token-level local approach
    if(target === 'tr' && sourceLang !== 'tr') {
      return { products: products.map(p => ({ ...p, name: translateNameTokensToTR(p.name, sourceLang), unit: normalizeUnit(p.unit) })), stats: { fallback:true } };
    }
    return { products, stats: { error:true, message: e.message } };
  }
}

export function mergeProducts(existing, imported){
  // naive duplicate merge by name+brand
  const key = (p) => (p.name + '|' + (p.brand||'')).toLowerCase();
  const map = new Map(existing.map(p=>[key(p), p]));
  imported.forEach(p => {
    const k = key(p);
    if(map.has(k)){
      // accumulate quantity if duplicate
      map.get(k).quantity += p.quantity || 0;
    } else {
      map.set(k, p);
    }
  });
  return Array.from(map.values());
}

export default parseBulkProducts;
