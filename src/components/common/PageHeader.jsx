import { Box, Paper, Stack, Typography } from '@mui/material';
import BreadcrumbsNav from '../navigation/BreadcrumbsNav';

export default function PageHeader({ title, description, right }) {
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
      <BreadcrumbsNav />
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography>
          )}
        </Box>
        {right}
      </Stack>
    </Paper>
  );
}
