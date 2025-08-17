import { describe, it, expect } from 'vitest';
import { rowsToCsv, parseCSV } from '../utils/csv';

describe('csv utils', () => {
  it('rowsToCsv generates header and rows', () => {
    const rows = [
      { trackingNo: 'TRK-1', carrier: 'Maersk', incoterm: 'CIF', status: 'in_transit', eta: '2025-01-01T00:00:00Z', createdAt: '2025-01-02T00:00:00Z' },
      { trackingNo: 'TRK,2', carrier: 'ACME, Inc', incoterm: 'FOB', status: 'delivered', eta: '', createdAt: '' },
    ];
    const columns = [
      { field: 'trackingNo', headerName: 'Takip No' },
      { field: 'carrier', headerName: 'Taşıyıcı' },
      { field: 'incoterm', headerName: 'Incoterm' },
      { field: 'status', headerName: 'Durum' },
      { field: 'eta', headerName: 'ETA' },
      { field: 'createdAt', headerName: 'Oluşturma' },
    ];
    const csv = rowsToCsv(rows, columns);
    const lines = csv.split(/\r?\n/);
    expect(lines[0]).toBe('Takip No,Taşıyıcı,Incoterm,Durum,ETA,Oluşturma');
    // ikinci satır virgül kaçışı içermez
    expect(lines[1]).toContain('TRK-1');
    // üçüncü satırda virgül içeren alanlar tırnaklanır
    expect(lines[2]).toContain('"TRK,2"');
    expect(lines[2]).toContain('"ACME, Inc"');
  });

  it('parseCSV parses CSV and detects delimiter', () => {
    const csv = 'a,b\n1,2\n3,4';
    const { headers, rows } = parseCSV(csv);
    expect(headers).toEqual(['a','b']);
    expect(rows).toEqual([{ a: '1', b: '2' }, { a: '3', b: '4' }]);
  });

  it('parseCSV handles semicolon and quotes', () => {
    const csv = 'col1;col2\n"ACME, Inc";"TRK,2"';
    const { headers, rows } = parseCSV(csv);
    expect(headers).toEqual(['col1','col2']);
    expect(rows[0]).toEqual({ col1: 'ACME, Inc', col2: 'TRK,2' });
  });
});
