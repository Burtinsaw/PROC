const { Talep, PurchaseOrder, PurchaseOrderItem, Shipment, Invoice, Payment, RFQ, RFQItem, Quote, User, Company } = require('../models');
const { Sequelize, Op } = require('sequelize');

const workflowController = {
  // 1. REQUEST → PURCHASING (Onaylanan talepten otomatik RFQ oluşturma)
  createRFQFromApprovedRequest: async (req, res) => {
    try {
      const { requestId, suppliers, deadline } = req.body;
      
      // Talebin onaylı olduğunu kontrol et
      const request = await Talep.findByPk(requestId, {
        include: ['urunler']
      });
      
      if (!request || request.durum !== 'onaylandi') {
        return res.status(400).json({ error: 'Sadece onaylanmış talepler RFQ\'ya dönüştürülebilir' });
      }

      // RFQ oluştur
      const rfqNumber = `RFQ-${new Date().getFullYear()}-${String(await RFQ.count() + 1).padStart(3, '0')}`;
      
      const rfq = await RFQ.create({
        rfqNumber,
        requestId,
        title: `${request.talepBasligi} - RFQ`,
        description: request.aciklama,
        deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün
        status: 'active',
        createdById: req.user.id
      });

      // RFQ items ekle
      for (const urun of request.urunler) {
        await RFQItem.create({
          rfqId: rfq.id,
          itemNumber: urun.id,
          productName: urun.urunAdi,
          quantity: urun.miktar,
          unit: urun.birim,
          specifications: `Marka: ${urun.marka || '-'}, Model: ${urun.model || '-'}`
        });
      }

      // Tedarikçilere RFQ gönder
      for (const supplierId of suppliers) {
        const supplier = await Company.findByPk(supplierId);
        if (supplier) {
          // Email gönderme işlemi burada yapılacak
          console.log(`RFQ ${rfqNumber} sent to ${supplier.name}`);
        }
      }

      // Talebin durumunu güncelle
      await request.update({ durum: 'rfq_olusturuldu' });

      res.json({
        success: true,
        message: 'RFQ başarıyla oluşturuldu ve tedarikçilere gönderildi',
        rfq: await RFQ.findByPk(rfq.id, { include: ['items'] })
      });
    } catch (error) {
      console.error('RFQ oluşturma hatası:', error);
      res.status(500).json({ error: 'RFQ oluşturulamadı' });
    }
  },

  // 2. PURCHASING → LOGISTICS (Seçilen tekliften sipariş ve sevkiyat oluşturma)
  createPurchaseOrderFromQuote: async (req, res) => {
    try {
      const { quoteId, deliveryAddress, deliveryDate, terms } = req.body;
      
      const quote = await Quote.findByPk(quoteId, {
        include: ['rfq', 'supplier', 'items']
      });
      
      if (!quote || quote.status !== 'selected') {
        return res.status(400).json({ error: 'Sadece seçilmiş teklifler sipariş edilebilir' });
      }

      // Purchase Order oluştur
      const poNumber = `PO-${new Date().getFullYear()}-${String(await PurchaseOrder.count() + 1).padStart(3, '0')}`;
      
      const purchaseOrder = await PurchaseOrder.create({
        poNumber,
        talepId: quote.rfq.requestId,
        supplierId: quote.supplierId,
        totalAmount: quote.totalAmount,
        currency: quote.currency,
        deliveryDate,
        deliveryAddress,
        terms,
        status: 'sent',
        sentDate: new Date(),
        createdById: req.user.id
      });

      // PO Items ekle
      for (const item of quote.items) {
        await PurchaseOrderItem.create({
          purchaseOrderId: purchaseOrder.id,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          currency: item.currency
        });
      }

      // Otomatik sevkiyat kaydı oluştur
      const shipmentNumber = `SH-${new Date().getFullYear()}-${String(await Shipment.count() + 1).padStart(3, '0')}`;
      
      const shipment = await Shipment.create({
        shipmentNumber,
        purchaseOrderId: purchaseOrder.id,
        status: 'preparing',
        estimatedDeliveryDate: deliveryDate,
        destination: deliveryAddress,
        createdById: req.user.id
      });

      // RFQ ve talebin durumunu güncelle
      await quote.rfq.update({ status: 'completed' });
      const request = await Talep.findByPk(quote.rfq.requestId);
      await request.update({ durum: 'siparis_verildi' });

      res.json({
        success: true,
        message: 'Sipariş oluşturuldu ve sevkiyat kaydı başlatıldı',
        purchaseOrder: await PurchaseOrder.findByPk(purchaseOrder.id, { include: ['items', 'supplier'] }),
        shipment
      });
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      res.status(500).json({ error: 'Sipariş oluşturulamadı' });
    }
  },

  // 3. LOGISTICS → FINANCE (Sevkiyat tamamlandığında fatura oluşturma)
  createInvoiceFromDelivery: async (req, res) => {
    try {
      const { shipmentId, supplierInvoiceNumber, invoiceDate, paymentTerms } = req.body;
      
      const shipment = await Shipment.findByPk(shipmentId, {
        include: ['purchaseOrder']
      });
      
      if (!shipment || shipment.status !== 'delivered') {
        return res.status(400).json({ error: 'Sadece teslim edilmiş sevkiyatlar faturalandırılabilir' });
      }

      // Fatura oluştur
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(await Invoice.count() + 1).padStart(3, '0')}`;
      
      const invoice = await Invoice.create({
        invoiceNumber,
        purchaseOrderId: shipment.purchaseOrderId,
        shipmentId: shipment.id,
        supplierInvoiceNumber,
        invoiceDate: invoiceDate || new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
        subtotal: shipment.purchaseOrder.totalAmount,
        taxRate: 18, // KDV %18
        taxAmount: shipment.purchaseOrder.totalAmount * 0.18,
        totalAmount: shipment.purchaseOrder.totalAmount * 1.18,
        remainingAmount: shipment.purchaseOrder.totalAmount * 1.18,
        currency: shipment.purchaseOrder.currency,
        paymentTerms,
        status: 'approved',
        createdById: req.user.id
      });

      // Purchase order durumunu güncelle
      await shipment.purchaseOrder.update({ status: 'delivered' });

      res.json({
        success: true,
        message: 'Fatura başarıyla oluşturuldu',
        invoice: await Invoice.findByPk(invoice.id, { 
          include: ['purchaseOrder', 'shipment'] 
        })
      });
    } catch (error) {
      console.error('Fatura oluşturma hatası:', error);
      res.status(500).json({ error: 'Fatura oluşturulamadı' });
    }
  },

  // 4. FINANCE → Ödeme işlemi ve süreç kapatma
  processPayment: async (req, res) => {
    try {
      const { invoiceId, amount, paymentMethod, transactionReference, paymentDate } = req.body;
      
      const invoice = await Invoice.findByPk(invoiceId, {
        include: ['purchaseOrder']
      });
      
      if (!invoice || invoice.status !== 'approved') {
        return res.status(400).json({ error: 'Sadece onaylanmış faturalar ödenebilir' });
      }

      // Ödeme kaydı oluştur
      const paymentNumber = `PAY-${new Date().getFullYear()}-${String(await Payment.count() + 1).padStart(3, '0')}`;
      
      const payment = await Payment.create({
        invoiceNumber,
        invoiceId,
        paymentDate: paymentDate || new Date(),
        amount,
        currency: invoice.currency,
        paymentMethod,
        transactionReference,
        status: 'completed',
        createdById: req.user.id
      });

      // Fatura ödeme bilgilerini güncelle
      const newPaidAmount = parseFloat(invoice.paidAmount) + parseFloat(amount);
      const newRemainingAmount = parseFloat(invoice.totalAmount) - newPaidAmount;
      
      await invoice.update({
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount <= 0 ? 'paid' : 'approved'
      });

      // Eğer tam ödeme yapıldıysa, talebin durumunu tamamlandı yap
      if (newRemainingAmount <= 0) {
        const request = await Talep.findByPk(invoice.purchaseOrder.talepId);
        await request.update({ durum: 'tamamlandi' });
      }

      res.json({
        success: true,
        message: 'Ödeme başarıyla işlendi',
        payment,
        invoice: await Invoice.findByPk(invoiceId, { include: ['payments'] })
      });
    } catch (error) {
      console.error('Ödeme işleme hatası:', error);
      res.status(500).json({ error: 'Ödeme işlenemedi' });
    }
  },

  // 5. Workflow durum takibi
  getWorkflowStatus: async (req, res) => {
    try {
      const { requestId } = req.params;
      
      const request = await Talep.findByPk(requestId, {
        include: ['urunler']
      });
      
      if (!request) {
        return res.status(404).json({ error: 'Talep bulunamadı' });
      }

      // İlgili RFQ'yu bul
      const rfq = await RFQ.findOne({
        where: { requestId },
        include: ['quotes']
      });

      // Purchase order'ı bul
      const purchaseOrder = await PurchaseOrder.findOne({
        where: { talepId: requestId },
        include: ['items', 'supplier']
      });

      // Sevkiyatları bul
      const shipments = purchaseOrder ? await Shipment.findAll({
        where: { purchaseOrderId: purchaseOrder.id },
        order: [['createdAt', 'DESC']]
      }) : [];

      // Faturaları bul
      const invoices = purchaseOrder ? await Invoice.findAll({
        where: { purchaseOrderId: purchaseOrder.id },
        include: ['payments'],
        order: [['createdAt', 'DESC']]
      }) : [];

      res.json({
        request: {
          id: request.id,
          title: request.talepBasligi,
          status: request.durum,
          createdAt: request.createdAt
        },
        rfq: rfq ? {
          id: rfq.id,
          rfqNumber: rfq.rfqNumber,
          status: rfq.status,
          quotesCount: rfq.quotes?.length || 0
        } : null,
        purchaseOrder: purchaseOrder ? {
          id: purchaseOrder.id,
          poNumber: purchaseOrder.poNumber,
          status: purchaseOrder.status,
          totalAmount: purchaseOrder.totalAmount,
          supplier: purchaseOrder.supplier?.name
        } : null,
        shipments: shipments.map(s => ({
          id: s.id,
          shipmentNumber: s.shipmentNumber,
          status: s.status,
          estimatedDeliveryDate: s.estimatedDeliveryDate,
          actualDeliveryDate: s.actualDeliveryDate
        })),
        invoices: invoices.map(i => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          status: i.status,
          totalAmount: i.totalAmount,
          paidAmount: i.paidAmount,
          remainingAmount: i.remainingAmount,
          paymentsCount: i.payments?.length || 0
        }))
      });
    } catch (error) {
      console.error('Workflow durum hatası:', error);
      res.status(500).json({ error: 'Workflow durumu alınamadı' });
    }
  },

  // 6. Dashboard özet bilgileri
  getDashboardSummary: async (req, res) => {
    try {
      const [
        totalRequests,
        pendingRequests,
        approvedRequests,
        activeRFQs,
        activePOs,
        pendingShipments,
        pendingInvoices,
        completedPayments
      ] = await Promise.all([
        Talep.count(),
        Talep.count({ where: { durum: 'Onay Bekliyor' } }),
        Talep.count({ where: { durum: 'onaylandi' } }),
        RFQ.count({ where: { status: 'active' } }),
        PurchaseOrder.count({ where: { status: ['sent', 'confirmed'] } }),
        Shipment.count({ where: { status: ['preparing', 'shipped', 'in_transit'] } }),
        Invoice.count({ where: { status: ['approved'] } }),
        Payment.count({ where: { status: 'completed' } })
      ]);

      res.json({
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests
        },
        purchasing: {
          activeRFQs,
          activePOs
        },
        logistics: {
          pendingShipments
        },
        finance: {
          pendingInvoices,
          completedPayments
        }
      });
    } catch (error) {
      console.error('Dashboard özet hatası:', error);
      res.status(500).json({ error: 'Dashboard özeti alınamadı' });
    }
  }
};

module.exports = workflowController;
