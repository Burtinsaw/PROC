// Minimal CSV parser with quote support and delimiter auto-detect (, or ;)
// Returns { headers: string[], rows: Array<Record<string,string>> }
export function parseCSV(text){
  if(typeof text !== 'string') return { headers: [], rows: [] };
  // Trim BOM
  if(text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const firstLine = text.split(/\r?\n/).find(l => l.trim().length>0) || '';
  const commaCount = (firstLine.match(/,/g)||[]).length;
  const semiCount = (firstLine.match(/;/g)||[]).length;
  const delim = semiCount>commaCount ? ';' : ',';

  const rows = [];
  let cur = [];
  let field = '';
  let inQuotes = false;
  let i=0;
  const pushField = () => { cur.push(field); field=''; };
  const pushRow = () => { rows.push(cur); cur=[]; };
  const len = text.length;
  while(i<len){
    const ch = text[i];
    if(inQuotes){
      if(ch === '"'){
        if(text[i+1] === '"'){ field+='"'; i+=2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    } else {
      if(ch === '"'){ inQuotes = true; i++; continue; }
      if(ch === delim){ pushField(); i++; continue; }
      if(ch === '\n') { pushField(); pushRow(); i++; continue; }
      if(ch === '\r'){ // handle CRLF
        if(text[i+1] === '\n'){ pushField(); pushRow(); i+=2; continue; }
        pushField(); pushRow(); i++; continue;
      }
      field += ch; i++; continue;
    }
  }
  // flush last field/row
  pushField(); pushRow();

  // Remove possible trailing empty row
  while(rows.length && rows[rows.length-1].every(v => v === '')) rows.pop();
  if(!rows.length) return { headers: [], rows: [] };

  // Determine headers: if first row has any non-empty non-numeric-like labels with no duplicates, treat as header
  const first = rows[0].map(v => v.trim());
  const isHeader = first.some(c => /[A-Za-z-\uFFFF]/.test(c)) && new Set(first).size === first.length;
  const headers = isHeader ? first : first.map((_, idx) => `col${idx+1}`);
  const startIdx = isHeader ? 1 : 0;
  const outRows = [];
  for(let r=startIdx; r<rows.length; r++){
    const raw = rows[r];
    if(raw.every(v => !String(v).trim())) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (raw[idx] ?? '').trim(); });
    outRows.push(obj);
  }
  return { headers, rows: outRows };
}

export default parseCSV;
