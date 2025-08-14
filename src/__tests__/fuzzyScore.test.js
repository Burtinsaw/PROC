import { describe, it, expect } from 'vitest';
import { fuzzyScore } from '../utils/fuzzyScore';

describe('fuzzyScore', () => {
  it('exact match highest', () => {
    expect(fuzzyScore('dashboard','dashboard')).toBe(1000);
  });
  it('prefix match', () => {
    expect(fuzzyScore('dashboard','dash')).toBe(600);
  });
  it('substring rank decreases with position', () => {
    const early = fuzzyScore('helloworld','hello'); // prefix => 600
    const later = fuzzyScore('helloworld','world'); // substring => 400 - index (index 5 => 395)
    expect(early).toBeGreaterThan(later);
  });
  it('fuzzy sequential positive', () => {
    const v = fuzzyScore('navigation','ngt');
    expect(v).toBeGreaterThan(0);
  });
  it('missing char -1', () => {
    expect(fuzzyScore('abc','adz')).toBe(-1);
  });
});
