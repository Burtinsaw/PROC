import { describe, it, expect } from 'vitest';
import { parseCompaniesCsv } from '../utils/bulkImport/parseCompaniesCsv';

describe('parseCompaniesCsv', () => {
  it('parses CSV with headers and maps common columns', () => {
    const csv = 'Name,Code,Type,Email,Phone\nACME Inc,ACM,Vendor,info@acme.com,555-0100';
    const { rows, meta } = parseCompaniesCsv(csv);
    expect(meta.hasHeader).toBe(true);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'ACME Inc', code: 'ACM', type: 'Vendor', email: 'info@acme.com', phone: '555-0100' });
  });

  it('detects ; delimiter and handles headerless files', () => {
    const csv = 'Foo Co;FOO;;;;\nBar Ltd;BAR;;;;';
    const { rows, meta } = parseCompaniesCsv(csv);
    expect(meta.delimiter).toBe(';');
    expect(meta.hasHeader).toBe(false);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ name: 'Foo Co', code: 'FOO' });
    expect(rows[1]).toMatchObject({ name: 'Bar Ltd', code: 'BAR' });
  });

  it('skips empty lines and keeps basic stats', () => {
    const csv = '\n\nname,code\nA Corp,AAA\n\n ,  \nB Corp,BBB\n';
    const { rows, meta } = parseCompaniesCsv(csv);
    expect(rows).toHaveLength(2);
    expect(meta.stats.parsedCount).toBe(2);
    expect(meta.stats.rawLineCount).toBeGreaterThan(0);
  });
});
