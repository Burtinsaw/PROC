const { Talep, ProformaInvoice, PurchaseOrder, Shipment, Invoice, Payment } = require('../models');

const trackingController = {
  // ID Takip Sistemi - Talep ID'den Proforma ID'ye geçiş
  
  /**
   * Talep sürecini proforma ile entegre et
   * Proforma onaylandığında artık proforma numarası ana takip ID'si olur
   */
  updateTrackingId: async (req, res) => {
    try {
      const { talepId, proformaNumber, newTrackingId } = req.body;

      // Talebi bul
      const talep = await Talep.findByPk(talepId);
      if (!talep) {
        return res.status(404).json({ error: 'Talep bulunamadı' });
      }

      // Proforma faturayı bul
      const proforma = await ProformaInvoice.findOne({
        where: { proformaNumber }
      });

      if (!proforma) {
        return res.status(404).json({ error: 'Proforma fatura bulunamadı' });
      }

      // Proforma onaylandıysa artık tracking ID olarak proforma numarasını kullan
      if (proforma.status === 'accepted') {
        // Talebe yeni tracking ID'yi ekle
        await talep.update({
          trackingId: proformaNumber,
          proformaNumber,
          trackingPhase: 'proforma_approved'
        });

        // İlgili tüm kayıtları güncelle
        await trackingController.updateRelatedRecords(talepId, proformaNumber);

        return res.json({
          success: true,
          message: 'Takip ID başarıyla proforma numarasına güncellendi',
          oldTrackingId: talep.talepNo,
          newTrackingId: proformaNumber,
          phase: 'proforma_approved'
        });
      }

      res.status(400).json({ 
        error: 'Proforma henüz onaylanmamış, ID güncellenmesi yapılamaz' 
      });

    } catch (error) {
      console.error('Takip ID güncelleme hatası:', error);
      res.status(500).json({ error: 'Takip ID güncellenemedi' });
    }
  },

  /**
   * İlgili tüm kayıtları yeni tracking ID ile güncelle
   */
  updateRelatedRecords: async (talepId, proformaNumber) => {
    try {
      // Purchase Orders'ı güncelle
      await PurchaseOrder.update(
        { trackingId: proformaNumber },
        { where: { talepId } }
      );

      // Shipments'ları güncelle  
      const purchaseOrders = await PurchaseOrder.findAll({ where: { talepId } });
      for (const po of purchaseOrders) {
        await Shipment.update(
          { trackingId: proformaNumber },
          { where: { purchaseOrderId: po.id } }
        );
      }

      // Invoices'ları güncelle
      for (const po of purchaseOrders) {
        await Invoice.update(
          { trackingId: proformaNumber },
          { where: { purchaseOrderId: po.id } }
        );
      }

      // Payments'ları güncelle
      for (const po of purchaseOrders) {
        const invoices = await Invoice.findAll({ where: { purchaseOrderId: po.id } });
        for (const invoice of invoices) {
          await Payment.update(
            { trackingId: proformaNumber },
            { where: { invoiceId: invoice.id } }
          );
        }
      }

    } catch (error) {
      console.error('İlgili kayıtları güncelleme hatası:', error);
      throw error;
    }
  },

  /**
   * Tracking geçmişini getir - Talep ID'den başlayıp proforma ID'ye geçişi göster
   */
  getTrackingHistory: async (req, res) => {
    try {
      const { trackingId } = req.params;

      // Önce talep ID'si ile aramaya çalış
      let talep = await Talep.findOne({
        where: { talepNo: trackingId }
      });

      // Bulunamadıysa proforma numarası ile ara
      if (!talep) {
        talep = await Talep.findOne({
          where: { trackingId: trackingId }
        });
      }

      if (!talep) {
        return res.status(404).json({ error: 'Takip ID bulunamadı' });
      }

      // Tüm süreci getir
      const trackingHistory = await trackingController.buildTrackingHistory(talep);

      res.json({
        success: true,
        originalRequestId: talep.talepNo,
        currentTrackingId: talep.trackingId || talep.talepNo,
        trackingPhase: talep.trackingPhase || 'request_phase',
        history: trackingHistory
      });

    } catch (error) {
      console.error('Takip geçmişi getirme hatası:', error);
      res.status(500).json({ error: 'Takip geçmişi getirilemedi' });
    }
  },

  /**
   * Takip geçmişini oluştur
   */
  buildTrackingHistory: async (talep) => {
    const history = [];
    const trackingId = talep.trackingId || talep.talepNo;

    // 1. Talep Aşaması
    history.push({
      phase: 'request',
      trackingId: talep.talepNo,
      title: 'Talep Oluşturuldu',
      status: talep.durum,
      date: talep.createdAt,
      description: `Talep ${talep.talepNo} ile süreç başlatıldı`
    });

    // 2. Proforma Aşaması (sadece proforma varsa)
    let proforma = null;
    if (talep.proformaNumber) {
      try {
        proforma = await ProformaInvoice.findOne({
          where: { proformaNumber: talep.proformaNumber }
        });
        
        if (proforma) {
          history.push({
            phase: 'proforma',
            trackingId: proforma.proformaNumber,
            title: 'Proforma Oluşturuldu',
            status: proforma.status,
            date: proforma.createdAt,
            description: `Proforma ${proforma.proformaNumber} oluşturuldu`
          });

          if (proforma.status === 'accepted') {
            history.push({
              phase: 'proforma_approved',
              trackingId: proforma.proformaNumber,
              title: 'Proforma Onaylandı - Takip ID Değişti',
              status: 'approved',
              date: proforma.sentAt,
              description: `Takip ID ${talep.talepNo} → ${proforma.proformaNumber} olarak güncellendi`
            });
          }
        }
      } catch (error) {
        console.log('Proforma sorgusu hatası (normal olabilir):', error.message);
      }
    }

    // Şimdilik sadece talep ve proforma aşamalarını döndür
    // İleride purchase_orders, shipments vs tablolar oluşturulduğunda genişletilebilir
    
    return history;
  },

  /**
   * Mevcut aktif tracking ID'yi getir
   */
  getCurrentTrackingId: async (req, res) => {
    try {
      const { originalRequestId } = req.params;

      // Önce ID ile ara, bulamazsa talepNo ile ara
      let talep = await Talep.findByPk(originalRequestId);
      
      if (!talep) {
        talep = await Talep.findOne({
          where: { talepNo: originalRequestId }
        });
      }

      if (!talep) {
        return res.status(404).json({ error: 'Talep bulunamadı' });
      }

      const currentTrackingId = talep.trackingId || talep.talepNo || talep.id;
      const phase = talep.trackingPhase || 'request_phase';

      res.json({
        success: true,
        originalRequestId: talep.talepNo || talep.id,
        currentTrackingId,
        trackingPhase: phase,
        proformaNumber: talep.proformaNumber,
        hasProformaTransition: !!talep.proformaNumber
      });

    } catch (error) {
      console.error('Mevcut takip ID getirme hatası:', error);
      res.status(500).json({ error: 'Takip ID getirilemedi' });
    }
  }
};

module.exports = trackingController;
