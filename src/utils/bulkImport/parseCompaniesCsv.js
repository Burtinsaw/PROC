// parseCompaniesCsv: basit CSV/TSV/; algılama ve başlık eşleme
// Dönüş: { rows: Array<{name,code,type,email,phone}>, meta }

function detectDelimiter(text){
  if(text.includes('\t')) return '\t';
  const counts = {
    ',': (text.match(/,/g)||[]).length,
    ';': (text.match(/;/g)||[]).length,
    '|': (text.match(/\|/g)||[]).length,
  };
  let best = ','; let max = counts[best];
  for(const k of Object.keys(counts)) if(counts[k] > max){ best = k; max = counts[k]; }
  return best;
}

const HEADER_CANDIDATES = {
  name: ['name','firma','şirket','sirket','company','title','ad','unvan','ünvan','firma adı','company name'],
  code: ['code','kod','company code','firma kodu','sicil'],
  type: ['type','tip','tür','tur','category','kategori','role'],
  email: ['email','mail','e-posta','eposta','e mail'],
  phone: ['phone','telefon','tel','gsm','mobile'],
  preferredCurrency: ['preferredcurrency','currency','para birimi','pb','kur','default currency']
};

function normalizeHeader(h){ return String(h||'').toLowerCase().trim(); }

function mapHeaders(headerCells){
  const mapping = {};
  headerCells.forEach((cell, idx) => {
    const n = normalizeHeader(cell);
    for(const key in HEADER_CANDIDATES){
      if(HEADER_CANDIDATES[key].some(tok => n.includes(tok))){
        if(!Object.values(mapping).includes(key)) mapping[idx] = key;
      }
    }
  });
  return mapping; // index -> fieldName
}

export function parseCompaniesCsv(raw){
  if(!raw || !raw.trim()) return { rows: [], meta: { empty:true } };
  const delimiter = detectDelimiter(raw);
  const rawLines = raw.split(/\r?\n/);
  const lines = rawLines.filter(l => l.trim());
  if(!lines.length) return { rows: [], meta: { empty:true } };
  const firstCells = lines[0].split(delimiter).map(c=>c.trim());
  const headerMap = mapHeaders(firstCells);
  const hasHeader = Object.keys(headerMap).length >= 1;
  const startIdx = hasHeader ? 1 : 0;

  const rows = [];
  let skipped = 0;
  for(let i=startIdx;i<lines.length;i++){
    const cells = lines[i].split(delimiter).map(c=>c.trim());
    if(cells.every(c=>!c)){ skipped++; continue; }
  const base = { name:'', code:'', type:'', email:'', phone:'', preferredCurrency:'' };
    if(hasHeader){
      Object.entries(headerMap).forEach(([colIdx, field]) => {
        const val = cells[colIdx];
        base[field] = val || base[field];
      });
      if(!base.name) base.name = cells[0] || '';
    } else {
      base.name = cells[0] || '';
      base.code = cells[1] || '';
      base.type = cells[2] || '';
      base.email = cells[3] || '';
      base.phone = cells[4] || '';
    }
    if(base.name) rows.push(base);
  }

  return { rows, meta: { delimiter, hasHeader, header: hasHeader? firstCells:null, headerMap, stats:{ rawLineCount: rawLines.length, nonEmptyLineCount: lines.length, parsedCount: rows.length, skipped } } };
}

export default parseCompaniesCsv;
