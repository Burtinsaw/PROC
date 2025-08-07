// material-ui
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

// assets
import CaretUpOutlined from '@ant-design/icons/CaretUpOutlined';
import CaretDownOutlined from '@ant-design/icons/CaretDownOutlined';

interface Props {
  title: string;
  count: string;
  percentage?: number;
  isLoss?: boolean;
  color?: any;
  invoice: string;
  isActive: boolean;
}

// ==============================|| INVOICE - CARD ||============================== //

export default function TableWidgetCard({ color, title, count, percentage, isLoss, invoice, isActive }: Props) {
  return (
    <MainCard
      sx={(theme: Theme) => ({
        ...(isActive && {
          bgcolor: 'secondary.lighter',
          ...theme.applyStyles('dark', { bgcolor: 'background.default' }),
          borderColor: 'secondary.lighter'
        }),
        [theme.breakpoints.only('lg')]: { '& .MuiCardContent-root': { p: 1.5 } }
      })}
    >
      <Grid container spacing={1.25}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Typography variant="subtitle1">{title}</Typography>
            {percentage && (
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', ml: 1.25, pl: 1 }}>
                {!isLoss && <CaretUpOutlined style={{ fontSize: '0.75rem', color: color }} />}
                {isLoss && <CaretDownOutlined style={{ fontSize: '0.75rem', color: color }} />}
                <Typography color="secondary" variant="h5" sx={{ fontWeight: 500 }}>
                  {percentage}%
                </Typography>
              </Stack>
            )}
          </Stack>
        </Grid>
        <Grid size={12}>
          <Stack spacing={0.25}>
            <Typography variant="h5">{count}</Typography>
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
              <Typography variant="h5">{invoice}</Typography>
              <Typography color="secondary">invoices</Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
