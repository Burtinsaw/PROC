/* eslint-env vitest */
import { resolveStatus, STATUS_TOKENS } from '../tokens/status';

describe('status tokens', () => {
  test('known status returns mapped label/color', () => {
    const r = resolveStatus('approved');
    expect(r.label).toBe('Onaylandı');
    expect(r.color).toBe('success');
  });

  test('unknown status falls back to raw', () => {
    const raw = 'mystery_state';
    const r = resolveStatus(raw);
    expect(r.label).toBe(raw);
    expect(r.color).toBe('default');
  });

  test('all tokens have required fields', () => {
    Object.values(STATUS_TOKENS).forEach((v) => {
      expect(v).toHaveProperty('color');
      expect(v).toHaveProperty('label');
      expect(typeof v.label).toBe('string');
    });
  });
});
