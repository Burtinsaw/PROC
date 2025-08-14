// Mantis-like menu configuration
// Converted to lucide-react icon name strings; resolution handled in Sidebar.

const menuItems = [
  {
    id: 'dashboard',
    title: 'Kontrol Paneli',
    type: 'group',
    children: [
  { id: 'home', title: 'Ana Sayfa', type: 'item', url: '/', icon: 'home' }
    ]
  },
  {
    id: 'procurement',
    title: 'Satın Alma',
    type: 'group',
    children: [
	{ id: 'requests', title: 'Talepler', type: 'item', url: '/requests', icon: 'file-text', permsAny: ['requests:read','requests:create'] },
	{ id: 'request-new', title: 'Yeni Talep', type: 'item', url: '/requests/new', icon: 'plus-circle', permsAny: ['requests:create'] },
	{ id: 'rfqs', title: 'RFQ', type: 'item', url: '/rfqs', icon: 'file-text' },
  { id: 'suppliers', title: 'Tedarikçiler', type: 'item', url: '/suppliers', icon: 'users' },
  { id: 'purchase-orders', title: 'Siparişler', type: 'item', url: '/purchase-orders', icon: 'shopping-cart' },
  { id: 'shipments', title: 'Sevkiyatlar', type: 'item', url: '/shipments', icon: 'truck' },
  { id: 'finance', title: 'Finans', type: 'item', url: '/finance', icon: 'line-chart' },
  { id: 'reports', title: 'Raporlar', type: 'item', url: '/reports', icon: 'bar-chart-3' }
    ]
  },
  {
    id: 'admin',
    title: 'Yönetim',
    type: 'group',
    children: [
  { id: 'users', title: 'Kullanıcılar', type: 'item', url: '/admin', icon: 'shield', permsAny: ['users:read'] },
  { id: 'settings', title: 'Ayarlar', type: 'item', url: '/settings', icon: 'settings', permsAny: ['settings:write'] }
    ]
  }
];

export default menuItems;
