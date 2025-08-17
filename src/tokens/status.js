// Central status token map for semantic status rendering across the app.
// Key -> { color: MUI palette key or 'default', label: localized label }
export const STATUS_TOKENS = {
  draft: { color: 'default', label: 'Taslak' },
  pending: { color: 'info', label: 'Beklemede' },
  approved: { color: 'success', label: 'Onaylandı' },
  rejected: { color: 'error', label: 'Reddedildi' },
  converted: { color: 'secondary', label: 'Dönüştürüldü' },
  quoted: { color: 'info', label: 'Teklif Alındı' },
  receiving: { color: 'info', label: 'Teslim Alınıyor' },
  'Onay Bekliyor': { color: 'info', label: 'Onay Bekliyor' },
  'Onaylandı': { color: 'success', label: 'Onaylandı' },
  'Reddedildi': { color: 'error', label: 'Reddedildi' },
  // Finance / sync
  paid: { color: 'success', label: 'Ödendi' },
  overdue: { color: 'error', label: 'Gecikti' },
  cancelled: { color: 'error', label: 'İptal' },
  synced: { color: 'success', label: 'Synced' },
  failed: { color: 'error', label: 'Failed' },
  pending_sync: { color: 'warning', label: 'Bekleyen Sync' },
  pending_local: { color: 'warning', label: 'Yerel Bekliyor' }
};

// RFQ specific (mapped for summary & detail views)
STATUS_TOKENS.sent = { color: 'info', label: 'Gönderildi' };
STATUS_TOKENS.open = { color: 'info', label: 'Açık' };
STATUS_TOKENS.awaiting = { color: 'warning', label: 'Bekleniyor' };
STATUS_TOKENS.waiting = { color: 'warning', label: 'Bekleniyor' };
STATUS_TOKENS.closed = { color: 'success', label: 'Kapandı' };
STATUS_TOKENS.completed = { color: 'success', label: 'Tamamlandı' };
STATUS_TOKENS.done = { color: 'success', label: 'Tamamlandı' };

// Logistics channels (optional chips)
STATUS_TOKENS.passengerDutyFree = { color: 'warning', label: 'Yolcu Beraberi' };

export function resolveStatus(status) {
  return STATUS_TOKENS[status] || { color: 'default', label: status };
}
