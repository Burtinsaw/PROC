// Fuzzy scoring utility shared with CommandPalette.
// Rules priority: exact > prefix > contiguous substring > sequential fuzzy; missing letters => -1.
export function fuzzyScore(labelLower, query){
  if(!query) return 0;
  const l = labelLower;
  const q = query.toLowerCase();
  if(l === q) return 1000;
  if(l.startsWith(q)) return 600;
  const idx = l.indexOf(q);
  if(idx>=0) return 400 - idx;
  let s = 0, last=-1;
  for(const ch of q){
    const p = l.indexOf(ch, last+1);
    if(p===-1) return -1;
    s += (last === -1 || p === last+1) ? 15 : 5;
    last = p;
  }
  return s;
}
export default fuzzyScore;
