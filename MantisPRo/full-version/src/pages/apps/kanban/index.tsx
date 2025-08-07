import { useEffect, useState, SyntheticEvent } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

// project imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

// ==============================|| APPLICATION - KANBAN ||============================== //

export default function KanbanPage() {
  const { pathname } = useLocation();

  let selectedTab = 0;
  let breadcrumbTitle = '';
  let breadcrumbHeading = '';

  switch (pathname) {
    case '/apps/kanban/backlogs':
      breadcrumbTitle = 'backlogs';
      breadcrumbHeading = 'backlogs';
      selectedTab = 1;
      break;
    case '/apps/kanban/board':
    default:
      breadcrumbTitle = 'board';
      breadcrumbHeading = 'taskboard';
      selectedTab = 0;
  }

  const [value, setValue] = useState(selectedTab);
  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  let breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'kanban', to: '/apps/kanban/board' },
    { title: breadcrumbTitle }
  ];

  useEffect(() => {
    if (pathname === '/apps/kanban/board') {
      setValue(0);
    }
  }, [pathname]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <Stack direction="row">
        <Grid container spacing={1} sx={{ width: 1 }}>
          <Grid size={12}>
            <Tabs value={value} variant="scrollable" onChange={handleChange}>
              <Tab component={Link} to="/apps/kanban/board" label={value === 0 ? 'Board' : 'View as Board'} {...a11yProps(0)} />
              <Tab component={Link} to="/apps/kanban/backlogs" label={value === 1 ? 'Backlogs' : 'View as Backlog'} {...a11yProps(1)} />
            </Tabs>
          </Grid>
          <Grid size={12}>
            <Outlet />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}
