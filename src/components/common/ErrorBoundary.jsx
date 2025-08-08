import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
          <Paper sx={{ p: 3, maxWidth: 560, width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>Bir hata oluştu</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Beklenmeyen bir hata ile karşılaşıldı. Sayfayı yenilemeyi deneyin.
            </Typography>
            <Button variant="contained" onClick={this.handleReload}>Sayfayı Yenile</Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
