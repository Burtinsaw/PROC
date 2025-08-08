const { Invoice, Payment, PurchaseOrder, Shipment, User } = require('../models');

const financeController = {
  // Yeni fatura oluştur
  createInvoice: async (req, res) => {
    try {
      const { 
        purchaseOrderId, 
        shipmentId, 
        supplierInvoiceNumber,
        invoiceDate,
        dueDate,
        subtotal,
        taxRate,
        paymentTerms 
      } = req.body;

      // PO kontrolü
      const purchaseOrder = await PurchaseOrder.findByPk(purchaseOrderId);
      if (!purchaseOrder) {
        return res.status(404).json({ error: 'Purchase order bulunamadı' });
      }

      // Fatura numarası oluştur
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const count = await Invoice.count() + 1;
      const invoiceNumber = `INV-${year}${month}-${String(count).padStart(4, '0')}`;

      // Vergi ve toplam hesapla
      const taxAmount = (subtotal * (taxRate || 0)) / 100;
      const totalAmount = subtotal + taxAmount;

      // Fatura oluştur
      const invoice = await Invoice.create({
        invoiceNumber,
        purchaseOrderId,
        shipmentId,
        supplierInvoiceNumber,
        invoiceDate,
        dueDate,
        subtotal,
        taxRate: taxRate || 0,
        taxAmount,
        totalAmount,
        remainingAmount: totalAmount,
        paymentTerms,
        createdById: req.user.id,
        status: 'draft'
      });

      res.status(201).json({
        message: 'Fatura başarıyla oluşturuldu',
        invoice: await Invoice.findByPk(invoice.id, {
          include: ['purchaseOrder', 'shipment']
        })
      });
    } catch (error) {
      console.error('Fatura oluşturma hatası:', error);
      res.status(500).json({ error: 'Fatura oluşturulurken hata oluştu' });
    }
  },

  // Tüm faturaları listele
  getAllInvoices: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, overdue } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (overdue === 'true') {
        where.dueDate = { [Op.lt]: new Date() };
        where.status = { [Op.notIn]: ['paid', 'cancelled'] };
      }

      const invoices = await Invoice.findAndCountAll({
        where,
        include: [
          { 
            model: PurchaseOrder, 
            as: 'purchaseOrder',
            include: ['talep', 'supplier']
          },
          { model: Shipment, as: 'shipment' },
          { model: User, as: 'createdBy' },
          { model: Payment, as: 'payments' }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        invoices: invoices.rows,
        totalCount: invoices.count,
        totalPages: Math.ceil(invoices.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Fatura listesi hatası:', error);
      res.status(500).json({ error: 'Fatura listesi alınamadı' });
    }
  },

  // Fatura detayı
  getInvoiceById: async (req, res) => {
    try {
      const invoice = await Invoice.findByPk(req.params.id, {
        include: [
          { 
            model: PurchaseOrder, 
            as: 'purchaseOrder',
            include: ['talep', 'supplier', 'items']
          },
          { model: Shipment, as: 'shipment' },
          { model: User, as: 'createdBy' },
          { model: Payment, as: 'payments' }
        ]
      });

      if (!invoice) {
        return res.status(404).json({ error: 'Fatura bulunamadı' });
      }

      res.json(invoice);
    } catch (error) {
      console.error('Fatura detay hatası:', error);
      res.status(500).json({ error: 'Fatura detayı alınamadı' });
    }
  },

  // Ödeme kaydet
  createPayment: async (req, res) => {
    try {
      const { invoiceId, amount, paymentMethod, paymentDate, transactionReference, bankDetails } = req.body;

      // Fatura kontrolü
      const invoice = await Invoice.findByPk(invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: 'Fatura bulunamadı' });
      }

      // Ödeme miktarı kontrolü
      if (amount > invoice.remainingAmount) {
        return res.status(400).json({ error: 'Ödeme miktarı kalan bakiyeden büyük olamaz' });
      }

      // Ödeme numarası oluştur
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const count = await Payment.count() + 1;
      const paymentNumber = `PAY-${year}${month}-${String(count).padStart(4, '0')}`;

      // Ödeme oluştur
      const payment = await Payment.create({
        invoiceId,
        paymentNumber,
        paymentDate: paymentDate || new Date(),
        amount,
        paymentMethod,
        transactionReference,
        bankDetails,
        createdById: req.user.id,
        status: 'completed'
      });

      // Fatura bakiyesini güncelle
      const newPaidAmount = parseFloat(invoice.paidAmount) + parseFloat(amount);
      const newRemainingAmount = parseFloat(invoice.totalAmount) - newPaidAmount;
      
      await invoice.update({
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount <= 0 ? 'paid' : 'approved'
      });

      res.status(201).json({
        message: 'Ödeme başarıyla kaydedildi',
        payment,
        invoice: await Invoice.findByPk(invoiceId)
      });
    } catch (error) {
      console.error('Ödeme kaydetme hatası:', error);
      res.status(500).json({ error: 'Ödeme kaydedilirken hata oluştu' });
    }
  },

  // Finans dashboard verileri
  getDashboard: async (req, res) => {
    try {
      const totalInvoices = await Invoice.count();
      const pendingInvoices = await Invoice.count({ where: { status: 'approved' } });
      const paidInvoices = await Invoice.count({ where: { status: 'paid' } });
      const overdueInvoices = await Invoice.count({
        where: {
          dueDate: { [Op.lt]: new Date() },
          status: { [Op.notIn]: ['paid', 'cancelled'] }
        }
      });

      // Toplam ödenmemiş miktar
      const unpaidSum = await Invoice.sum('remainingAmount', {
        where: { status: { [Op.notIn]: ['paid', 'cancelled'] } }
      });

      // Bu ay ödenen miktar
      const thisMonthPaid = await Payment.sum('amount', {
        where: {
          paymentDate: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          },
          status: 'completed'
        }
      });

      res.json({
        summary: {
          totalInvoices,
          pendingInvoices,
          paidInvoices,
          overdueInvoices,
          unpaidAmount: unpaidSum || 0,
          thisMonthPaid: thisMonthPaid || 0
        }
      });
    } catch (error) {
      console.error('Dashboard verileri hatası:', error);
      res.status(500).json({ error: 'Dashboard verileri alınamadı' });
    }
  }
};

module.exports = financeController;
