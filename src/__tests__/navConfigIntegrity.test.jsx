import { describe, it, expect } from 'vitest';
import navConfig from '../navigation/navConfig';

function collectPaths(cfg) {
  const paths = [];
  cfg.forEach(item => {
    if(item.path) paths.push(item.path);
    if(item.groups) item.groups.forEach(g => g.links.forEach(l => paths.push(l.path)));
  });
  return paths;
}

describe('navConfig integrity', () => {
  it('ids are unique across top-level items', () => {
    const ids = navConfig.map(i => i.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
  it('group link ids are unique within each item', () => {
    navConfig.forEach(item => {
      if(item.groups) {
        item.groups.forEach(g => {
          const ids = g.links.map(l => l.id);
          const unique = new Set(ids);
          expect(unique.size).toBe(ids.length);
        });
      }
    });
  });
  it('paths start with a slash', () => {
    const paths = collectPaths(navConfig);
    paths.forEach(p => expect(p.startsWith('/')).toBe(true));
  });
  it('no duplicate paths', () => {
    const paths = collectPaths(navConfig);
    const counts = paths.reduce((a,p)=> { a[p]=(a[p]||0)+1; return a; }, {});
  Object.values(counts).forEach(c => expect(c).toBe(1));
  });
});
