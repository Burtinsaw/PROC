import { createBrowserRouter } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';

// project imports
import Settings from '../pages/Settings';
const ThemePreview = React.lazy(() => import('../pages/ThemePreview'));
import AppShellLayout from '../layout/AppShellLayout';
import ProcurementDashboard from '../pages/ProcurementDashboard';
const SupplierManagement = lazy(() => import('../pages/SupplierManagement'));
import Forbidden403 from '../pages/Forbidden403';
import PermissionGuard from '../components/rbac/PermissionGuard';
const UserManagement = lazy(() => import('../components/rbac/UserManagement'));
const ChangePassword = lazy(() => import('../pages/ChangePassword'));
import AuthLogin from '../sections/auth/jwt/AuthLogin';
const ForgotPassword = lazy(() => import('../pages/authentication/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/authentication/ResetPassword'));
const Register = lazy(() => import('../pages/authentication/Register'));
import GuestRoute from './GuestRoute';
const NotFound = lazy(() => import('../pages/NotFound'));
import PrivateRoute from './PrivateRoute';
const Profile = lazy(() => import('../pages/Profile'));
const TalepOverview = lazy(() => import('../pages/talep/TalepOverview'));
const TalepYeni = lazy(() => import('../pages/talep/TalepYeni'));
const TalepBekleyen = lazy(() => import('../pages/talep/TalepBekleyen'));
const TalepTakip = lazy(() => import('../pages/talep/TalepTakip'));
const RFQs = lazy(() => import('../pages/RFQs'));
const RFQDetail = lazy(() => import('../pages/RFQDetail'));
const RFQOverview = lazy(() => import('../pages/rfq/RFQOverview'));
const RFQWizard = lazy(() => import('../pages/rfq/RFQWizard'));
const ProformaDetail = lazy(() => import('../pages/proforma/ProformaDetail'));
const PurchaseOrders = lazy(() => import('../pages/PurchaseOrders'));
const PurchaseOrderDetail = lazy(() => import('../pages/PurchaseOrderDetail'));
const Shipments = lazy(() => import('../pages/Shipments'));
const Finance = lazy(() => import('../pages/Finance'));
const Reports = lazy(() => import('../pages/Reports'));
const EmailInbox = lazy(() => import('../pages/EmailInbox'));
import Loader from '../components/Loader';
import AdminHome from '../pages/admin/AdminHome';
import Companies from '../pages/admin/Companies';
const Messages = lazy(() => import('../pages/Messages'));
import { ChatProvider } from '../contexts/ChatContext';

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
        <Suspense fallback={<Loader />}> 
          <ForgotPassword />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <GuestRoute>
        <Suspense fallback={<Loader />}> 
          <ResetPassword />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <Suspense fallback={<Loader />}> 
          <Register />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/',
  element: (
    <PrivateRoute>
      {/* Varsayılan olarak userId'i localStorage'dan okuyalım (backend login sonrası set ediliyor varsayımı) */}
      <ChatProvider userId={Number(localStorage.getItem('userId') || 0)}>
        <AppShellLayout />
      </ChatProvider>
    </PrivateRoute>
  ),
    children: [
      {
        path: '/',
        loader: () => {
          try {
            const v = localStorage.getItem('defaultLanding');
            if (v && typeof v === 'string' && v !== '/') {
              window.location.replace(v);
              return null;
            }
          } catch { /* ignore */ }
          return null;
        },
        element: <ProcurementDashboard />,
      },
  { path: 'settings', element: <Settings /> },
  { path: 'settings/theme-preview', element: <Suspense fallback={<Loader />}><ThemePreview /></Suspense> },
  // Legacy redirects from eski /requests yapısı
  { path: 'requests', loader: () => { window.location.replace('/talep'); return null; } },
  { path: 'requests/new', loader: () => { window.location.replace('/talep/yeni'); return null; } },
  { path: 'requests/pending', loader: () => { window.location.replace('/talep/bekleyen'); return null; } },
  { path: 'requests/:id', loader: ({ params }) => { window.location.replace(`/talep/takip?id=${params.id}`); return null; } },
      {
        path: 'suppliers',
  element: <Suspense fallback={<Loader />}><SupplierManagement /></Suspense>,
      },
  { path: 'talep', element: <Suspense fallback={<Loader />}><TalepOverview /></Suspense> },
  { path: 'talep/yeni', element: <Suspense fallback={<Loader />}><TalepYeni /></Suspense> },
  { path: 'talep/bekleyen', element: <Suspense fallback={<Loader />}><TalepBekleyen /></Suspense> },
  { path: 'talep/takip', element: <Suspense fallback={<Loader />}><TalepTakip /></Suspense> },
  // RFQ modern sayfalar
  { path: 'satinalma/rfq', element: <Suspense fallback={<Loader />}><RFQOverview /></Suspense> },
  { path: 'satinalma/rfq/olustur', element: <Suspense fallback={<Loader />}><RFQWizard /></Suspense> },
      {
        path: 'rfqs',
  element: <Suspense fallback={<Loader />}><RFQs /></Suspense>,
      },
      {
        path: 'rfqs/:id',
  element: <Suspense fallback={<Loader />}><RFQDetail /></Suspense>,
      },
      {
        path: 'purchase-orders',
  element: <Suspense fallback={<Loader />}><PurchaseOrders /></Suspense>,
      },
      {
        path: 'purchase-orders/:id',
  element: <Suspense fallback={<Loader />}><PurchaseOrderDetail /></Suspense>,
      },
      {
        path: 'shipments',
  element: <Suspense fallback={<Loader />}><Shipments /></Suspense>,
      },
      {
        path: 'finance',
  element: <Suspense fallback={<Loader />}><Finance /></Suspense>,
      },
  { path: 'raporlar', element: <Suspense fallback={<Loader />}><Reports /></Suspense> },
  { path: 'email', element: <Suspense fallback={<Loader />}><EmailInbox /></Suspense> },
  { path: 'messages', element: <Suspense fallback={<Loader />}><Messages /></Suspense> },
  { path: 'proforma/:number', element: <Suspense fallback={<Loader />}><ProformaDetail /></Suspense> },
      {
        path: 'change-password',
  element: <Suspense fallback={<Loader />}><ChangePassword /></Suspense>,
      },
      {
        path: 'profile',
  element: <Suspense fallback={<Loader />}><Profile /></Suspense>,
      },
      {
        path: 'admin',
        element: (
          <PermissionGuard anyOf={["users:read","settings:write"]}>
            <AdminHome />
          </PermissionGuard>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <PermissionGuard anyOf={["users:read"]}>
            <UserManagement />
          </PermissionGuard>
        ),
      },
      {
        path: 'admin/companies',
        element: (
          <PermissionGuard anyOf={["users:read","settings:write"]}>
            <Companies />
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
  { path: '*', element: <Suspense fallback={<Loader />}><NotFound /></Suspense> },
]);

export default router;