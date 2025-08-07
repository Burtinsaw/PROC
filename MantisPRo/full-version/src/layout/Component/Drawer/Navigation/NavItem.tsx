import { Link, matchPath, useLocation } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project imports
import { handlerComponentDrawer } from 'api/menu';

// third-party
import { FormattedMessage } from 'react-intl';

// types
import { LinkTarget, NavItemType } from 'types/menu';

// ==============================|| NAVIGATION - LIST ITEM ||============================== //

interface Props {
  item: NavItemType;
}

export default function NavItem({ item }: Props) {
  const { pathname } = useLocation();
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  let itemTarget: LinkTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  const itemHandler = (id: string) => {
    if (downMD) handlerComponentDrawer(false);
  };

  const isSelectedItem = !!matchPath({ path: item.url!, end: false }, pathname);

  return (
    <ListItemButton
      component={Link}
      to={item.url!}
      target={itemTarget}
      disabled={item.disabled}
      onClick={() => itemHandler(item.id!)}
      selected={isSelectedItem}
      sx={(theme) => ({
        pl: 4,
        py: 1,
        mb: 0.5,
        '&:hover': { bgcolor: 'primary.lighter', ...theme.applyStyles('dark', { bgcolor: 'divider' }) },
        '&.Mui-selected': {
          bgcolor: 'primary.lighter',
          borderRight: '2px solid',
          borderColor: 'primary.main',
          '&:hover': 'primary.lighter',
          ...theme.applyStyles('dark', {
            bgcolor: 'divider',
            '&:hover': { bgcolor: 'divider' }
          })
        }
      })}
    >
      <ListItemText
        primary={
          <Typography
            variant="h6"
            sx={(theme) => ({
              color: isSelectedItem ? 'primary.main' : 'text.primary',
              ...theme.applyStyles('dark', { color: isSelectedItem ? 'text.primary' : 'grey.400' })
            })}
          >
            <FormattedMessage id={item.title as string} />
          </Typography>
        }
      />
      {item.chip && (
        <Chip
          color={item.chip.color}
          variant={item.chip.variant}
          size={item.chip.size}
          label={item.chip.label}
          avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
        />
      )}
    </ListItemButton>
  );
}
