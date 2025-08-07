import { useState, ChangeEvent } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';
import { handlerDrawerOpen } from 'api/menu';

// assets
import defaultLayout from 'assets/images/customization/default.svg';
import horizontalLayout from 'assets/images/customization/horizontal.svg';
import miniMenu from 'assets/images/customization/mini-menu.svg';

const layouts = [
  { value: MenuOrientation.VERTICAL, label: 'Default', img: defaultLayout },
  { value: MenuOrientation.HORIZONTAL, label: 'Horizontal', img: horizontalLayout },
  { value: 'mini', label: 'Mini Drawer', img: miniMenu }
];

// ==============================|| CUSTOMIZATION - THEME LAYOUT/ORIENTATION ||============================== //

export default function ThemeLayout() {
  const { miniDrawer, menuOrientation, onChangeMenuOrientation, onChangeMiniDrawer } = useConfig();

  const determineInitialTheme = () => (miniDrawer ? 'mini' : menuOrientation);
  const [value, setValue] = useState(determineInitialTheme());

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);

    if (newValue === 'mini') {
      onChangeMiniDrawer(true);
    }
    if (newValue === MenuOrientation.VERTICAL || newValue === MenuOrientation.HORIZONTAL) {
      onChangeMenuOrientation(newValue);
    }
    handlerDrawerOpen(newValue === 'mini' ? false : true);
  };

  const activeCardStyle = (theme: Theme) => ({
    bgcolor: 'primary.lighter',
    boxShadow: theme.customShadows.primary,
    '&:hover': { boxShadow: theme.customShadows.primary }
  });

  const renderLayoutCard = ({ value: layoutValue, label, img }: any) => (
    <Grid key={layoutValue}>
      <FormControlLabel
        value={layoutValue}
        control={<Radio sx={{ display: 'none' }} />}
        label={
          <MainCard
            content={false}
            border={false}
            boxShadow
            sx={(theme: Theme) => ({
              bgcolor: 'secondary.lighter',
              p: 1,
              ...(value === layoutValue && { ...activeCardStyle(theme) })
            })}
          >
            <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
              <CardMedia component="img" src={img} alt={label} sx={{ borderRadius: 1, width: 60, height: 60 }} />
              <Typography variant="caption">{label}</Typography>
            </Stack>
          </MainCard>
        }
      />
    </Grid>
  );

  return (
    <RadioGroup row aria-label="theme-layout" name="theme-layout" value={value} onChange={handleRadioChange} sx={{ px: 1.5 }}>
      <Grid container spacing={2}>
        {layouts.map((layout) => renderLayoutCard(layout))}
      </Grid>
    </RadioGroup>
  );
}
