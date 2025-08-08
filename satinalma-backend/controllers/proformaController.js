const { ProformaInvoice, ProformaInvoiceItem, Quote, QuoteItem, RFQItem, Company, RFQ, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Proforma fatura listesi
exports.getProformaInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, currency, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (currency) whereClause.currency = currency;
    if (search) {
      whereClause[Op.or] = [
        { proformaNumber: { [Op.iLike]: `%${search}%` } },
        { '$Company.name$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const proformas = await ProformaInvoice.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Company,
          attributes: ['name', 'email', 'phone']
        },
        {
          model: Quote,
          include: [
            {
              model: RFQ,
              attributes: ['title', 'rfqNumber']
            }
          ]
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      proformas: proformas.rows,
      total: proformas.count,
      totalPages: Math.ceil(proformas.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Proforma fatura listesi hatası:', error);
    res.status(500).json({ error: 'Proforma faturalar getirilemedi' });
  }
};

// Teklife dayalı proforma fatura oluştur
exports.createProformaFromQuote = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      quoteId,
      companyId,
      currency,
      profitMargin,
      taxRate = 0,
      validUntil,
      notes,
      paymentTerms,
      deliveryTerms
    } = req.body;

    // Kar oranı kontrolü
    if (profitMargin < 2.5) {
      return res.status(400).json({ error: 'Kar oranı minimum %2.5 olmalıdır' });
    }

    // Teklifi ve kalemlerini getir
    const quote = await Quote.findByPk(quoteId, {
      include: [
        {
          model: QuoteItem,
          include: [
            {
              model: RFQItem,
              attributes: ['productName', 'description', 'quantity', 'unit', 'brand']
            }
          ]
        },
        {
          model: RFQ,
          attributes: ['title']
        }
      ],
      transaction
    });

    if (!quote) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Teklif bulunamadı' });
    }

    if (quote.status !== 'accepted') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Sadece onaylanmış tekliflerden proforma oluşturulabilir' });
    }

    // Proforma fatura oluştur
    let subtotal = 0;
    const profitMultiplier = 1 + (profitMargin / 100);

    const proforma = await ProformaInvoice.create({
      quoteId,
      companyId,
      currency,
      profitMargin,
      taxRate,
      validUntil: new Date(validUntil),
      notes,
      paymentTerms,
      deliveryTerms,
      createdBy: req.user.id,
      subtotal: 0, // Hesaplanacak
      taxAmount: 0, // Hesaplanacak
      totalAmount: 0 // Hesaplanacak
    }, { transaction });

    // Proforma kalemlerini oluştur
    const proformaItems = [];
    for (const quoteItem of quote.QuoteItems) {
      const originalUnitPrice = parseFloat(quoteItem.unitPrice);
      const unitPriceWithProfit = originalUnitPrice * profitMultiplier;
      const lineTotal = unitPriceWithProfit * parseFloat(quoteItem.quantity);
      
      subtotal += lineTotal;

      const proformaItem = await ProformaInvoiceItem.create({
        proformaInvoiceId: proforma.id,
        quoteItemId: quoteItem.id,
        productName: quoteItem.RFQItem.productName,
        description: quoteItem.RFQItem.description,
        quantity: quoteItem.quantity,
        unit: quoteItem.unit,
        unitPrice: unitPriceWithProfit,
        originalUnitPrice: originalUnitPrice,
        lineTotal: lineTotal,
        brand: quoteItem.RFQItem.brand,
        model: quoteItem.model,
        specifications: quoteItem.specifications
      }, { transaction });

      proformaItems.push(proformaItem);
    }

    // Toplam tutarları hesapla ve güncelle
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    await proforma.update({
      subtotal,
      taxAmount,
      totalAmount
    }, { transaction });

    await transaction.commit();

    // Tam veriyi getir
    const fullProforma = await ProformaInvoice.findByPk(proforma.id, {
      include: [
        {
          model: ProformaInvoiceItem
        },
        {
          model: Company,
          attributes: ['name', 'email', 'phone', 'address']
        },
        {
          model: Quote,
          include: [
            {
              model: RFQ,
              attributes: ['title', 'rfqNumber']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      message: 'Proforma fatura başarıyla oluşturuldu',
      proforma: fullProforma
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Proforma fatura oluşturma hatası:', error);
    res.status(500).json({ error: 'Proforma fatura oluşturulamadı' });
  }
};

// Proforma fatura detayı
exports.getProformaInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const proforma = await ProformaInvoice.findByPk(id, {
      include: [
        {
          model: ProformaInvoiceItem,
          order: [['id', 'ASC']]
        },
        {
          model: Company,
          attributes: ['name', 'email', 'phone', 'address', 'taxNumber']
        },
        {
          model: Quote,
          include: [
            {
              model: RFQ,
              attributes: ['title', 'rfqNumber']
            },
            {
              model: Company,
              as: 'Supplier',
              attributes: ['name']
            }
          ]
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['name', 'email']
        }
      ]
    });

    if (!proforma) {
      return res.status(404).json({ error: 'Proforma fatura bulunamadı' });
    }

    res.json(proforma);
  } catch (error) {
    console.error('Proforma fatura detayı hatası:', error);
    res.status(500).json({ error: 'Proforma fatura detayı getirilemedi' });
  }
};

// Proforma fatura güncelle
exports.updateProformaInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      currency,
      profitMargin,
      taxRate,
      validUntil,
      notes,
      paymentTerms,
      deliveryTerms,
      items
    } = req.body;

    const proforma = await ProformaInvoice.findByPk(id, { transaction });
    if (!proforma) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Proforma fatura bulunamadı' });
    }

    if (proforma.status === 'sent') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Gönderilmiş proforma düzenlenemez' });
    }

    // Kar oranı kontrolü
    if (profitMargin < 2.5) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Kar oranı minimum %2.5 olmalıdır' });
    }

    // Proforma güncelle
    await proforma.update({
      currency,
      profitMargin,
      taxRate,
      validUntil: new Date(validUntil),
      notes,
      paymentTerms,
      deliveryTerms
    }, { transaction });

    // Kalemleri güncelle
    let subtotal = 0;
    if (items && items.length > 0) {
      for (const item of items) {
        const lineTotal = parseFloat(item.unitPrice) * parseFloat(item.quantity);
        subtotal += lineTotal;

        await ProformaInvoiceItem.update({
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: lineTotal,
          specifications: item.specifications
        }, {
          where: { id: item.id },
          transaction
        });
      }

      // Toplam tutarları yeniden hesapla
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      await proforma.update({
        subtotal,
        taxAmount,
        totalAmount
      }, { transaction });
    }

    await transaction.commit();
    res.json({ message: 'Proforma fatura güncellendi' });

  } catch (error) {
    await transaction.rollback();
    console.error('Proforma fatura güncelleme hatası:', error);
    res.status(500).json({ error: 'Proforma fatura güncellenemedi' });
  }
};

// Proforma fatura gönder
exports.sendProformaInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const proforma = await ProformaInvoice.findByPk(id);
    if (!proforma) {
      return res.status(404).json({ error: 'Proforma fatura bulunamadı' });
    }

    if (proforma.status !== 'draft') {
      return res.status(400).json({ error: 'Sadece taslak durumundaki proformalar gönderilebilir' });
    }

    await proforma.update({
      status: 'sent',
      sentAt: new Date()
    });

    res.json({ message: 'Proforma fatura gönderildi' });

  } catch (error) {
    console.error('Proforma fatura gönderme hatası:', error);
    res.status(500).json({ error: 'Proforma fatura gönderilemedi' });
  }
};

// Proforma fatura durumu güncelle
exports.updateProformaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }

    const proforma = await ProformaInvoice.findByPk(id);
    if (!proforma) {
      return res.status(404).json({ error: 'Proforma fatura bulunamadı' });
    }

    await proforma.update({ status });
    res.json({ message: 'Proforma fatura durumu güncellendi' });

  } catch (error) {
    console.error('Proforma durum güncelleme hatası:', error);
    res.status(500).json({ error: 'Proforma durumu güncellenemedi' });
  }
};

// Para birimleri listesi
exports.getCurrencies = async (req, res) => {
  try {
    const currencies = [
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'TRY', name: 'Turkish Lira', symbol: '₺' }
    ];
    
    res.json(currencies);
  } catch (error) {
    console.error('Para birimleri hatası:', error);
    res.status(500).json({ error: 'Para birimleri getirilemedi' });
  }
};

module.exports = exports;
