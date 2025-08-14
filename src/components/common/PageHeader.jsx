import { Box, Paper, Stack, Typography, Avatar } from '@mui/material';

/* PageHeader Enhanced
   Props:
   - title
   - description
   - right (actions)
   - icon: React component (lucide / mui) optional
   - compact: boolean (reduced padding)
*/
export default function PageHeader({ title, description, right, icon: Icon, compact = false }) {
  return (
    <Paper
      elevation={0}
      sx={(t) => ({
        position: 'relative',
        overflow: 'hidden',
        p: compact ? 1.5 : 2.5,
        mb: compact ? 1.5 : 3,
        borderRadius: 3,
        border: `1px solid ${t.palette.divider}`,
        background:
          t.palette.mode === 'dark'
            ? `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)), radial-gradient(circle at 20% 0%, rgba(255,255,255,0.15), transparent 60%)`
            : `linear-gradient(135deg, ${t.palette.primary.light}15, ${t.palette.primary.main}08), radial-gradient(circle at 18% 0%, ${t.palette.primary.light}33, transparent 55%)`,
        backdropFilter: 'blur(4px)'
      })}
    >
  {/* Breadcrumbs removed; global header now renders trail */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={3}
      >
        <Stack direction="row" alignItems="center" gap={2} sx={{ width: '100%' }}>
          {Icon && (
            <Avatar
              variant="rounded"
              sx={(t) => ({
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: t.palette.mode === 'dark' ? t.palette.primary.dark : t.palette.primary.light,
                color: t.palette.primary.contrastText,
                boxShadow: t.palette.mode === 'dark'
                  ? '0 4px 14px -2px rgba(0,0,0,0.6)'
                  : '0 4px 14px -2px rgba(0,0,0,0.15)'
              })}
            >
              <Icon size={28} />
            </Avatar>
          )}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>{title}</Typography>
            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, maxWidth: 680 }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
        {right && (
          <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            {right}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
