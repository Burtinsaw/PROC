// Basit CSV dışa aktarma yardımcıları

function escapeCsv(value) {
  if (value == null) return '';
  const s = String(value);
  // Eğer virgül, çift tırnak veya satır sonu içeriyorsa tırnakla ve iç tırnakları kaçır
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// columns: [{ field, headerName }]
export function rowsToCsv(rows, columns) {
  const headers = columns.map(c => escapeCsv(c.headerName || c.field));
  const lines = [headers.join(',')];
  for (const row of rows) {
    const line = columns.map(c => {
      let v = row?.[c.field];
      // Tarih gibi nesneleri stringe çevir
      if (v instanceof Date) v = v.toISOString();
      return escapeCsv(v);
    }).join(',');
    lines.push(line);
  }
  return lines.join('\n');
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportRowsToCsv({ filename = 'shipments.csv', rows, columns }) {
  const csv = rowsToCsv(rows, columns);
  downloadCsv(filename, csv);
}

// İsteğe bağlı toplu export için named exports kullanıyoruz
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

// Sadece named export
