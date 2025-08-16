// Basit hover-prefetch yardımcıları
// Amaç: Kullanıcı menüde linkin üzerine geldiğinde ilgili lazy chunk'ları arka planda indirmek

const prefetched = new Set();

function idle(cb) {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(cb, { timeout: 1500 });
  } else {
    setTimeout(cb, 200);
  }
}

export function prefetchRoute(pathname) {
  try {
    if (typeof window === 'undefined') return;
    const path = String(pathname || '/');
    if (prefetched.has(path)) return;
    prefetched.add(path);

    idle(async () => {
      try {
        // Email
        if (path.startsWith('/email/compose')) {
          await import('../pages/EmailCompose');
          // Editor chunk’ını da önceden al
          await Promise.allSettled([
            import('../components/RichTextEditor'),
            import('../components/email/TemplateEditorPanel')
          ]);
        }
        else if (path.startsWith('/email/drafts')) await import('../pages/EmailDrafts');
        else if (path.startsWith('/email/scheduled')) await import('../pages/EmailScheduled');
        else if (path.startsWith('/email')) await import('../pages/EmailInbox');

        // Settings > Email hub ve alt sayfalar
        if (path.startsWith('/settings/email')) {
          await Promise.allSettled([
            import('../pages/email-settings/EmailSettingsHub'),
            import('../pages/email-settings/EmailSettingsPersonal'),
            import('../pages/email-settings/EmailSettingsRules'),
            import('../pages/email-settings/EmailSettingsImporter'),
            import('../pages/email-settings/EmailSettingsClients'),
            import('../pages/email-settings/EmailAutoReply'),
            import('../pages/email-settings/EmailTemplates')
          ]);
        }

        // Talep
        if (path.startsWith('/talep/yeni')) await import('../pages/talep/TalepYeni');
        else if (path.startsWith('/talep/bekleyen')) await import('../pages/talep/TalepBekleyen');
        else if (path.startsWith('/talep/takip')) await import('../pages/talep/TalepTakip');
        else if (path === '/talep') await import('../pages/talep/TalepOverview');

        // RFQ
        if (path.startsWith('/satinalma/rfq/olustur')) await import('../pages/rfq/RFQWizard');
        else if (path.startsWith('/satinalma/rfq')) await import('../pages/rfq/RFQOverview');
        else if (path.startsWith('/rfqs/')) await import('../pages/RFQDetail');
        else if (path.startsWith('/rfqs')) {
          await import('../pages/RFQs');
          await Promise.allSettled([
            import('../tables/RFQsGrid')
          ]);
        }

        // Purchase Orders
        if (path.startsWith('/purchase-orders/')) await import('../pages/PurchaseOrderDetail');
  else if (path.startsWith('/purchase-orders')) await import('../pages/PurchaseOrders');
        if (path.startsWith('/purchase-orders')) {
          await Promise.allSettled([
            import('../tables/PurchaseOrdersGrid')
          ]);
        }
        if (path.startsWith('/purchase-orders/')) {
          await Promise.allSettled([
            import('../tables/PurchaseOrderItemsGrid')
          ]);
        }
        if (path.startsWith('/talep')) {
          await Promise.allSettled([
            import('../pages/Requests').catch(() => {}),
            import('../tables/RequestsGrid')
          ]);
        }

        // Diğer sık kullanılanlar
        if (path.startsWith('/shipments')) {
          await import('../pages/Shipments');
          await Promise.allSettled([
            import('../tables/ShipmentsGrid')
          ]);
        }
        if (path.startsWith('/finance')) {
          await import('../pages/Finance');
          await Promise.allSettled([
            import('../tables/FinanceGrid')
          ]);
        }
        if (path.startsWith('/raporlar')) await import('../pages/Reports');
        if (path.startsWith('/profile')) await import('../pages/Profile');
        if (path.startsWith('/change-password')) await import('../pages/ChangePassword');
        if (path.startsWith('/settings/theme-preview')) await import('../pages/ThemePreview');
  if (path.startsWith('/suppliers')) await import('../pages/SupplierManagement');
  if (path.startsWith('/messages')) await import('../pages/Messages');
  if (path.startsWith('/proforma/')) await import('../pages/proforma/ProformaDetail');
  if (path.startsWith('/admin/users')) {
    await import('../components/rbac/UserManagement');
    await Promise.allSettled([
      import('../components/rbac/UsersGrid')
    ]);
  }
  if (path.startsWith('/admin/companies')) await import('../pages/admin/Companies');

        // Dashboard grafikleri (Recharts) - sayfa hover'ında ısıt
        if (path === '/' || path.startsWith('/dashboard') || path.startsWith('/kontrol') || path.startsWith('/panel')) {
          await Promise.allSettled([
            import('../components/charts/MonthlyTrendsChart'),
            import('../components/charts/CategoryDistributionPie'),
          ]);
        }
      } catch {
        // Prefetch best-effort; hataları yutuyoruz
      }
    });
  } catch {
    // ignore
  }
}
