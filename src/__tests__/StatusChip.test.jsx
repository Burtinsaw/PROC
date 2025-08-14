import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusChip from '../components/common/StatusChip';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';

function renderWithTheme(ui){
  return render(<MUIThemeProvider theme={createTheme()}>{ui}</MUIThemeProvider>);
}

describe('StatusChip', () => {
  it('renders approved label', () => {
    renderWithTheme(<StatusChip status="approved" />);
    expect(screen.getByText(/Onaylandı/i)).toBeInTheDocument();
  });
  it('falls back to raw status when unknown', () => {
    renderWithTheme(<StatusChip status="weird_status" />);
    expect(screen.getByText(/weird_status/)).toBeInTheDocument();
  });
});
