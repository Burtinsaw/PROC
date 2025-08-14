// project imports
import AuthGuard from '../utils/route-guard/AuthGuard';
import LayoutSelector from '../layout/LayoutSelector';
import ProcurementDashboard from '../pages/ProcurementDashboard';
import SupplierManagement from '../pages/SupplierManagement';
import RequestForm from '../views/Requests/UnifiedRequestSystem';
import RequestList from '../views/Requests/RequestList';
import RequestDetail from '../views/Requests/RequestDetail';

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <LayoutSelector title="Satın Alma Sistemi" />
    </AuthGuard>
  ),
  children: [
    {
      path: '',
      element: <ProcurementDashboard />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: '',
          element: <ProcurementDashboard />
        },
        {
          path: 'default',
          element: <ProcurementDashboard />
        }
      ]
    },
    {
      path: 'requests',
      children: [
        {
          path: 'new',
          element: <RequestForm />
        },
        {
          path: 'pending',
          element: <RequestList />
        },
        {
          path: 'approved',
          element: <RequestList />
        },
        {
          path: 'rejected',
          element: <RequestList />
        },
        {
          path: 'all',
          element: <RequestList />
        },
        {
          path: 'list',
          element: <RequestList />
        }
        ,{
          path: ':id',
          element: <RequestDetail />
        }
      ]
    },
    {
      path: 'procurement',
      children: [
        {
          path: 'suppliers',
          element: <div>Tedarikçi Arama Sayfası</div>
        },
        {
          path: 'quotations',
          element: <div>Teklifler Sayfası</div>
        },
        {
          path: 'comparison',
          element: <div>Teklif Karşılaştırma Sayfası</div>
        },
        {
          path: 'proforma',
          element: <div>Proforma Yönetimi Sayfası</div>
        },
        {
          path: 'requests',
          children: [
            {
              path: 'new',
              element: <RequestForm />
            },
            {
              path: 'list',
              element: <RequestList />
            }
          ]
        }
      ]
    },
    {
      path: 'logistics',
      children: [
        {
          path: 'quotes',
          element: <div>Nakliye Teklifleri Sayfası</div>
        },
        {
          path: 'tracking',
          element: <div>Kargo Takibi Sayfası</div>
        },
        {
          path: 'delivery',
          element: <div>Teslimat Planı Sayfası</div>
        }
      ]
    },
    {
      path: 'suppliers',
      element: <SupplierManagement />
    },
    {
      path: 'translation',
      element: <div>Çeviri Merkezi Sayfası</div>
    },
    {
      path: 'reports',
      children: [
        {
          path: 'financial',
          element: <div>Mali Raporlar Sayfası</div>
        },
        {
          path: 'performance',
          element: <div>Performans Raporları Sayfası</div>
        },
        {
          path: 'suppliers',
          element: <div>Tedarikçi Raporları Sayfası</div>
        }
      ]
    },
    {
      path: 'settings',
      element: <div>Ayarlar Sayfası</div>
    },
    {
      path: 'help',
      element: <div>Yardım Sayfası</div>
    }
  ]
};

export default MainRoutes;