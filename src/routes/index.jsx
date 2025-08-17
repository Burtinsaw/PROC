import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import FeatureGuard from '../components/feature/FeatureGuard';
const ProcurementDashboard = lazy(() => import('../pages/ProcurementDashboard'));

// project imports
import Settings from '../pages/Settings';
const ThemePreview = lazy(() => import('../pages/ThemePreview'));
import AppShellLayout from '../layout/AppShellLayout';
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
const ShipmentDetail = lazy(() => import('../pages/ShipmentDetail'));
const Finance = lazy(() => import('../pages/Finance'));
const Reports = lazy(() => import('../pages/Reports'));
const EmailInbox = lazy(() => import('../pages/EmailInbox'));
const EmailSettings = lazy(() => import('../pages/EmailSettings'));
const EmailSettingsHub = lazy(() => import('../pages/email-settings/EmailSettingsHub'));
const EmailSettingsPersonal = lazy(() => import('../pages/email-settings/EmailSettingsPersonal'));
const EmailSettingsRules = lazy(() => import('../pages/email-settings/EmailSettingsRules'));
const EmailSettingsImporter = lazy(() => import('../pages/email-settings/EmailSettingsImporter'));
const EmailSettingsClients = lazy(() => import('../pages/email-settings/EmailSettingsClients'));
const EmailAutoReply = lazy(() => import('../pages/email-settings/EmailAutoReply'));
const EmailTemplates = lazy(() => import('../pages/email-settings/EmailTemplates'));
import Loader from '../components/Loader';
import AdminHome from '../pages/admin/AdminHome';
const Companies = lazy(() => import('../pages/admin/Companies'));
const Messages = lazy(() => import('../pages/Messages'));
import { ChatProvider } from '../contexts/ChatContext';
const EmailCompose = lazy(() => import('../pages/EmailCompose'));
const EmailDrafts = lazy(() => import('../pages/EmailDrafts'));
const EmailScheduled = lazy(() => import('../pages/EmailScheduled'));
const LogisticsDashboard = lazy(() => import('../pages/LogisticsDashboard'));
const LogisticsCalculators = lazy(() => import('../pages/LogisticsCalculators'));
const AdminModules = lazy(() => import('../pages/admin/AdminModules'));
const AuditChanges = lazy(() => import('../pages/admin/AuditChanges'));
const Maestro = lazy(() => import('../pages/admin/Maestro'));

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
  element: <Suspense fallback={<Loader />}><ProcurementDashboard /></Suspense>,
      },
  { path: 'settings', element: <Settings /> },
  { path: 'settings/theme-preview', element: <Suspense fallback={<Loader />}><ThemePreview /></Suspense> },
  { path: 'settings/email', element: <Suspense fallback={<Loader />}><EmailSettingsHub /></Suspense> },
  { path: 'settings/email/legacy', element: <Suspense fallback={<Loader />}><EmailSettings /></Suspense> },
  { path: 'settings/email/personal', element: <Suspense fallback={<Loader />}><EmailSettingsPersonal /></Suspense> },
  { path: 'settings/email/rules', element: <Suspense fallback={<Loader />}><EmailSettingsRules /></Suspense> },
  { path: 'settings/email/importer', element: <Suspense fallback={<Loader />}><EmailSettingsImporter /></Suspense> },
  { path: 'settings/email/clients', element: <Suspense fallback={<Loader />}><EmailSettingsClients /></Suspense> },
  { path: 'settings/email/templates', element: <Suspense fallback={<Loader />}><EmailTemplates /></Suspense> },
  { path: 'settings/email/auto-reply', element: <Suspense fallback={<Loader />}><EmailAutoReply /></Suspense> },
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
        element: (
          <FeatureGuard module="procurement">
            <Suspense fallback={<Loader />}><PurchaseOrders /></Suspense>
          </FeatureGuard>
        ),
      },
      {
        path: 'purchase-orders/:id',
  element: <Suspense fallback={<Loader />}><PurchaseOrderDetail /></Suspense>,
      },
      {
        path: 'shipments',
        element: (
          <FeatureGuard module="logistics">
            <Suspense fallback={<Loader />}><Shipments /></Suspense>
          </FeatureGuard>
        ),
      },
      {
        path: 'shipments/:id',
        element: (
          <FeatureGuard module="logistics">
            <Suspense fallback={<Loader />}><ShipmentDetail /></Suspense>
          </FeatureGuard>
        ),
      },
      {
        path: 'logistics/calculators',
        element: (
          <FeatureGuard module="logistics">
            <Suspense fallback={<Loader />}><LogisticsCalculators /></Suspense>
          </FeatureGuard>
        ),
      },
  { path: 'lojistik', element: <Suspense fallback={<Loader />}><LogisticsDashboard /></Suspense> },
      {
        path: 'finance',
        element: (
          <FeatureGuard module="finance">
            <Suspense fallback={<Loader />}><Finance /></Suspense>
          </FeatureGuard>
        ),
      },
  { path: 'raporlar', element: (
    <FeatureGuard module="reporting">
      <Suspense fallback={<Loader />}><Reports /></Suspense>
    </FeatureGuard>
  ) },
  { path: 'email', loader: () => { window.location.replace('/email/inbox'); return null; } },
  { path: 'email/compose', element: <Suspense fallback={<Loader />}><EmailCompose /></Suspense> },
  { path: 'email/drafts', element: <Suspense fallback={<Loader />}><EmailDrafts /></Suspense> },
  { path: 'email/scheduled', element: <Suspense fallback={<Loader />}><EmailScheduled /></Suspense> },
  { path: 'email/:folder', element: <Suspense fallback={<Loader />}><EmailInbox /></Suspense> },
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
        path: 'admin/modules',
        element: (
          <PermissionGuard anyOf={["settings:write"]}>
            <Suspense fallback={<Loader />}><AdminModules /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'admin/audit',
        element: (
          <PermissionGuard anyOf={["admin:users","users:read","settings:write"]}>
            <Suspense fallback={<Loader />}><AuditChanges /></Suspense>
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
        path: 'admin/maestro',
        element: (
          <PermissionGuard anyOf={["settings:write"]}>
            <Suspense fallback={<Loader />}><Maestro /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'admin/companies',
        element: (
          <PermissionGuard anyOf={["users:read","settings:write"]}>
            <Suspense fallback={<Loader />}><Companies /></Suspense>
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