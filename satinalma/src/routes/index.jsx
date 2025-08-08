import { createBrowserRouter } from 'react-router-dom';

// project imports
import DashboardLayout from '../layout/DashboardLayout';
import ProcurementDashboard from '../pages/ProcurementDashboard';
import SupplierManagement from '../pages/SupplierManagement';
import Forbidden403 from '../pages/Forbidden403';
import PermissionGuard from '../components/rbac/PermissionGuard';
import UserManagement from '../components/rbac/UserManagement';
import ModernLoginScreen from '../pages/ModernLoginScreen';
import PrivateRoute from './PrivateRoute';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([
  {
    path: '/login',
    element: <ModernLoginScreen />,
  },
  {
    path: '/',
    element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
    children: [
      {
        path: '/',
        element: <ProcurementDashboard />,
      },
      {
        path: 'suppliers',
        element: <SupplierManagement />,
      },
      {
        path: 'admin',
        element: (
          <PermissionGuard anyOf={["users:read"]}>
            <UserManagement />
          </PermissionGuard>
        ),
      },
      // Diğer route'ları buraya ekleyebilirsiniz
    ],
  },
  {
    path: '/forbidden',
    element: <Forbidden403 />,
  },
]);

export default router;