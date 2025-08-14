import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import KeyValueEditor from '../components/KeyValueEditor';

function renderWithTheme(ui){
  return render(<MUIThemeProvider theme={createTheme()}>{ui}</MUIThemeProvider>);
}

describe('KeyValueEditor', () => {
  it('adds and edits key-value rows', () => {
    const handleChange = vi.fn();
    renderWithTheme(<KeyValueEditor value={{}} onChange={handleChange} />);

  // Click add (accessible name comes from aria-label)
  fireEvent.click(screen.getByRole('button', { name: /add-attribute/i }));

    // Fill first row key/value
    const key0 = screen.getByTestId('kv-key-0');
    const val0 = screen.getByTestId('kv-value-0');
    fireEvent.change(key0, { target: { value: 'renk' } });
    fireEvent.change(val0, { target: { value: 'kırmızı' } });

    expect(handleChange).toHaveBeenCalled();
    const last = handleChange.mock.calls.pop()[0];
    expect(last).toMatchObject({ renk: 'kırmızı' });
  });
});
