import { createBrowserRouter } from 'react-router-dom';

// project imports
import ProcurementLayout from '../layout/ProcurementLayout';
import DashboardLayout from '../layout/DashboardLayout';
import ProcurementDashboard from '../pages/ProcurementDashboard';
import SupplierManagement from '../pages/SupplierManagement';
import Forbidden403 from '../pages/Forbidden403';
import PermissionGuard from '../components/rbac/PermissionGuard';
import UserManagement from '../components/rbac/UserManagement';
import ChangePassword from '../pages/ChangePassword';
import AuthLogin from '../sections/auth/jwt/AuthLogin';
import ForgotPassword from '../pages/authentication/ForgotPassword';
import ResetPassword from '../pages/authentication/ResetPassword';
import GuestRoute from './GuestRoute';
import NotFound from '../pages/NotFound';
import PrivateRoute from './PrivateRoute';
import Profile from '../pages/Profile';
import Requests from '../pages/Requests';
import RequestDetail from '../pages/RequestDetail';
import RequestNew from '../pages/RequestNew';
import RFQs from '../pages/RFQs';
import RFQDetail from '../pages/RFQDetail';
import PurchaseOrders from '../pages/PurchaseOrders';
import PurchaseOrderDetail from '../pages/PurchaseOrderDetail';
import Shipments from '../pages/Shipments';
import Finance from '../pages/Finance';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <AuthLogin />
      </GuestRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <GuestRoute>
        <ForgotPassword />
      </GuestRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <GuestRoute>
        <ResetPassword />
      </GuestRoute>
    ),
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
        path: 'requests',
        element: <Requests />,
      },
      {
        path: 'requests/new',
        element: <RequestNew />,
      },
      {
        path: 'requests/:id',
        element: <RequestDetail />,
      },
      {
        path: 'rfqs',
        element: <RFQs />,
      },
      {
        path: 'rfqs/:id',
        element: <RFQDetail />,
      },
      {
        path: 'purchase-orders',
        element: <PurchaseOrders />,
      },
      {
        path: 'purchase-orders/:id',
        element: <PurchaseOrderDetail />,
      },
      {
        path: 'shipments',
        element: <Shipments />,
      },
      {
        path: 'finance',
        element: <Finance />,
      },
      {
        path: 'change-password',
        element: <ChangePassword />,
      },
      {
        path: 'profile',
        element: <Profile />,
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
  { path: '*', element: <NotFound /> },
]);

export default router;