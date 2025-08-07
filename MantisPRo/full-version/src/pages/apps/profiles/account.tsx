import { useEffect, useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';

// material-ui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

// assets
import ContainerOutlined from '@ant-design/icons/ContainerOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// ==============================|| PROFILE - ACCOUNT ||============================== //

export default function AccountProfile() {
  const { pathname } = useLocation();

  let selectedTab = 0;
  let breadcrumbTitle = '';
  let breadcrumbHeading = '';

  switch (pathname) {
    case '/apps/profiles/account/personal':
      breadcrumbTitle = 'personal';
      breadcrumbHeading = 'personal';
      selectedTab = 1;
      break;
    case '/apps/profiles/account/my-account':
      breadcrumbTitle = 'my-account';
      breadcrumbHeading = 'my-account';
      selectedTab = 2;
      break;
    case '/apps/profiles/account/password':
      breadcrumbTitle = 'change-password';
      breadcrumbHeading = 'change-password';
      selectedTab = 3;
      break;
    case '/apps/profiles/account/role':
      breadcrumbTitle = 'role';
      breadcrumbHeading = 'accountant';
      selectedTab = 4;
      break;
    case '/apps/profiles/account/settings':
      breadcrumbTitle = 'settings';
      breadcrumbHeading = 'account-settings';
      selectedTab = 5;
      break;
    case '/apps/profiles/account/basic':
    default:
      breadcrumbTitle = 'basic';
      breadcrumbHeading = 'basic-profile';
      selectedTab = 0;
  }

  const [value, setValue] = useState(selectedTab);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  let breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'account-profile', to: '/apps/profiles/account/basic' },
    { title: breadcrumbTitle }
  ];

  if (selectedTab === 0) {
    breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'account-profile' }];
  }

  useEffect(() => {
    if (pathname === '/apps/profiles/account/basic') {
      setValue(0);
    }
  }, [pathname]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
            <Tab label="Profile" component={Link} to="/apps/profiles/account/basic" icon={<UserOutlined />} iconPosition="start" />
            <Tab label="Personal" component={Link} to="/apps/profiles/account/personal" icon={<FileTextOutlined />} iconPosition="start" />
            <Tab
              label="My Account"
              component={Link}
              to="/apps/profiles/account/my-account"
              icon={<ContainerOutlined />}
              iconPosition="start"
            />
            <Tab
              label="Change Password"
              component={Link}
              to="/apps/profiles/account/password"
              icon={<LockOutlined />}
              iconPosition="start"
            />
            <Tab label="Role" component={Link} to="/apps/profiles/account/role" icon={<TeamOutlined />} iconPosition="start" />
            <Tab label="Settings" component={Link} to="/apps/profiles/account/settings" icon={<SettingOutlined />} iconPosition="start" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <Outlet />
        </Box>
      </MainCard>
    </>
  );
}
