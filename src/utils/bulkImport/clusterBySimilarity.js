// Basit benzerlik kümeleri: isimlere fuzzy skor uygular, gruplar.
// Giriş: rows: [{ name, ... }], opts: { threshold: 0.82 }
// Çıkış: groups: [{ representative, items:[{row,index,score}], id }]

import { fuzzyScore } from '../fuzzyScore';

export function clusterBySimilarity(rows, opts = {}){
  const threshold = opts.threshold ?? 0.82;
  const used = new Array(rows.length).fill(false);
  const groups = [];

  for(let i=0;i<rows.length;i++){
    if(used[i]) continue;
    const base = rows[i];
    used[i] = true;
    const group = [{ row: base, index: i, score: 1 }];
    for(let j=i+1;j<rows.length;j++){
      if(used[j]) continue;
      const compare = rows[j];
      const s = fuzzyScore(String(base.name||''), String(compare.name||''));
      if(s >= threshold){
        used[j] = true;
        group.push({ row: compare, index: j, score: s });
      }
    }
    // pick representative: highest code presence then longest name
    let representative = group[0].row;
    for(const g of group){
      if((g.row.code && !representative.code) || (String(g.row.name||'').length > String(representative.name||'').length)){
        representative = g.row;
      }
    }
    groups.push({ id: `g${groups.length+1}`, representative, items: group });
  }
  return groups;
}

export default clusterBySimilarity;
