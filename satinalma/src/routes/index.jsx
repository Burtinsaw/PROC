import { createBrowserRouter } from 'react-router-dom';

// project imports
import DashboardLayout from '../layout/DashboardLayout';
import ProcurementDashboard from '../pages/ProcurementDashboard';
import SupplierManagement from '../pages/SupplierManagement';
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
      // Diğer route'ları buraya ekleyebilirsiniz
    ],
  },
]);

export default router;