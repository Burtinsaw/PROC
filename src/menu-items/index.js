// Mantis-like menu configuration
import { Dashboard, ShoppingCart, People, BarChart, Settings, SupervisorAccount } from '@mui/icons-material';

// icon registry for convenience
export const icons = { Dashboard, ShoppingCart, People, BarChart, Settings, SupervisorAccount };

const menuItems = [
  {
    id: 'dashboard',
    title: 'Kontrol Paneli',
    type: 'group',
    children: [
      { id: 'home', title: 'Ana Sayfa', type: 'item', url: '/', icon: 'Dashboard' }
    ]
  },
  {
    id: 'procurement',
    title: 'Satın Alma',
    type: 'group',
    children: [
  { id: 'requests', title: 'Talepler', type: 'item', url: '/requests', icon: 'ShoppingCart', permsAny: ['requests:read','requests:create'] },
  { id: 'request-new', title: 'Yeni Talep', type: 'item', url: '/requests/new', icon: 'ShoppingCart', permsAny: ['requests:create'] },
  { id: 'rfqs', title: 'RFQ', type: 'item', url: '/rfqs', icon: 'ShoppingCart' },
      { id: 'suppliers', title: 'Tedarikçiler', type: 'item', url: '/suppliers', icon: 'People' },
      { id: 'reports', title: 'Raporlar', type: 'item', url: '/reports', icon: 'BarChart' }
    ]
  },
  {
    id: 'admin',
    title: 'Yönetim',
    type: 'group',
    children: [
      { id: 'users', title: 'Kullanıcılar', type: 'item', url: '/admin', icon: 'SupervisorAccount', permsAny: ['users:read'] },
      { id: 'settings', title: 'Ayarlar', type: 'item', url: '/settings', icon: 'Settings', permsAny: ['settings:write'] }
    ]
  }
];

export default menuItems;
