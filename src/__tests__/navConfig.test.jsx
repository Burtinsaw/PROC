import { describe, it, expect } from 'vitest';
import navConfig from '../navigation/navConfig';

function collect(){
  const out=[];
  navConfig.forEach(item=>{
    if(item.path) out.push(item.id);
    if(item.groups){
      item.groups.forEach(g=> g.links.forEach(l=> out.push(l.id)));
    }
  });
  return out;
}

describe('navConfig integrity', () => {
  it('has unique ids', () => {
    const ids = collect();
    const dup = ids.filter((id,i)=> ids.indexOf(id)!==i);
    expect(dup).toEqual([]);
  });
  it('all link paths start with /', () => {
    const paths=[];
    navConfig.forEach(item=>{ if(item.path) paths.push(item.path); if(item.groups){ item.groups.forEach(g=> g.links.forEach(l=> paths.push(l.path))); }});
    expect(paths.every(p=> p.startsWith('/'))).toBe(true);
  });
});
