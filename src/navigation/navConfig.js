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
          { id: 'talep-yeni', label: 'Yeni Talep', path: '/talep/yeni', permsAny: ['requests:create'] },
          { id: 'talep-bekleyen', label: 'Bekleyen Talep', path: '/talep/bekleyen', permsAny: ['requests:read'] },
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
          { id: 'rfq-olustur', label: 'RFQ Oluştur', path: '/satinalma/rfq/olustur', permsAny: ['requests:create'] },
          { id: 'rfq-takip', label: 'RFQ Takip', path: '/satinalma/rfq/takip', permsAny: ['requests:read'] }
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
          { id: 'lojistik-takip', label: 'Takip', path: '/lojistik/takip', permsAny: ['requests:read'] },
          { id: 'lojistik-sevkiyat', label: 'Sevkiyat', path: '/lojistik/sevkiyat', permsAny: ['requests:read'] }
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
          { id: 'finans-odemeler', label: 'Ödemeler', path: '/finans/odemeler', permsAny: ['requests:read'] },
          { id: 'finans-raporlar', label: 'Raporlar', path: '/finans/raporlar', permsAny: ['requests:read'] }
        ]
      }
    ]
  },
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
          { id: 'admin-companies', label: 'Şirketler', path: '/admin/companies', permsAny: ['users:read','settings:write'] }
        ]
      }
    ]
  },
  { id: 'settings', label: 'Ayarlar', icon: Settings, path: '/settings' },
  { id: 'help', label: 'Yardım', icon: HelpCircle, path: '/help' }
];

export default navConfig;
