import { ClipboardList, ShoppingCart, Truck, Wallet, Settings, HelpCircle, BarChart3, Shield, Building2, Users } from 'lucide-react';

// Yeni menü yapısı:
// 1- TALEP: Yeni Talep, Bekleyen Talep, Talep Takip
// 2- SATINALMA: RFQ Oluştur, RFQ Takip
// 3- LOJİSTİK: (örnek alt kalemler - Takip, Sevkiyat)
// 4- FİNANS: (örnek alt kalemler - Ödemeler, Raporlar)

const navConfig = [
  {
    id: 'talep',
    label: 'Talep',
    icon: ClipboardList,
    groups: [
      {
        id: 'talep-links',
        label: 'İşlemler',
        links: [
          { id: 'talep-yeni', label: 'Yeni Talep Oluştur', path: '/talep/yeni', permsAny: ['requests:create'] },
          { id: 'talep-bekleyen', label: 'Bekleyen Talepler', path: '/talep/bekleyen', permsAny: ['requests:read'] },
          { id: 'talep-takip', label: 'Talep Takip', path: '/talep/takip', permsAny: ['requests:read'] }
        ]
      }
    ]
  },
  {
    id: 'satinalma',
    label: 'Satınalma',
    icon: ShoppingCart,
    groups: [
      {
        id: 'rfq',
        label: 'RFQ',
        links: [
          { id: 'rfq-olustur', label: 'Yeni RFQ Oluştur', path: '/satinalma/rfq/olustur', permsAny: ['requests:create'] },
          { id: 'rfq-takip', label: 'RFQ Takip', path: '/satinalma/rfq', permsAny: ['requests:read'] }
        ]
      }
    ]
  },
  {
    id: 'lojistik',
    label: 'Lojistik',
    icon: Truck,
    groups: [
      {
        id: 'lojistik-op',
        label: 'Operasyon',
        links: [
          { id: 'lojistik-panel', label: 'Lojistik Paneli', path: '/lojistik', permsAny: ['requests:read'] },
          { id: 'lojistik-sevkiyat', label: 'Sevkiyat', path: '/shipments', permsAny: ['requests:read'] }
        ]
      }
    ]
  },
  {
    id: 'finans',
    label: 'Finans',
    icon: Wallet,
    groups: [
      {
        id: 'finans-islem',
        label: 'İşlemler',
        links: [
          { id: 'finans-anasayfa', label: 'Finans Paneli', path: '/finance', permsAny: ['requests:read'] }
        ]
      }
    ]
  },
  { id: 'email', label: 'E-posta', icon: Users, path: '/email' },
  { id: 'raporlar', label: 'Raporlar', icon: BarChart3, path: '/raporlar' },
  {
    id: 'admin',
    label: 'Yönetim',
    icon: Shield,
    groups: [
      {
        id: 'admin-core',
        label: 'Yönetim',
        links: [
          { id: 'admin-home', label: 'Yönetim Ana Sayfa', path: '/admin', permsAny: ['users:read','settings:write'] },
          { id: 'admin-users', label: 'Kullanıcılar', path: '/admin/users', permsAny: ['users:read'] },
          { id: 'admin-companies', label: 'Şirketler', path: '/admin/companies', permsAny: ['users:read','settings:write'] },
      { id: 'admin-modules', label: 'Modüller', path: '/admin/modules', permsAny: ['settings:write'] },
      { id: 'admin-audit', label: 'Ayar Değişiklikleri', path: '/admin/audit', permsAny: ['admin:users'] }
        ]
      }
    ]
  },
  {
    id: 'maestro',
    label: 'Maestro Sistem',
    icon: Shield,
    path: '/admin/maestro',
    permsAny: ['settings:write']
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    icon: Settings,
    groups: [
      {
        id: 'settings-core',
        label: 'Ayarlar',
        links: [
          { id: 'settings-general', label: 'Genel', path: '/settings' },
          { id: 'settings-email', label: 'E-Posta Ayarları', path: '/settings/email' }
        ]
      }
    ]
  },
  { id: 'help', label: 'Yardım', icon: HelpCircle, path: '/help' }
];

export default navConfig;
