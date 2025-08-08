const { RFQ, RFQItem, Quote, QuoteItem, Talep, TalepUrun, Company, User } = require('../models');
const { Op } = require('sequelize');

const rfqController = {
  // Talepten RFQ oluştur
  createFromRequest: async (req, res) => {
    try {
      const { talepId, title, description, deadline, suppliers, items, paymentTerms, deliveryTerms } = req.body;

      // Talebin onaylanmış olduğunu kontrol et
      const talep = await Talep.findByPk(talepId, {
        include: [{ model: TalepUrun, as: 'urunler' }]
      });
      
      if (!talep || talep.durum !== 'Onaylandı') {
        return res.status(400).json({ error: 'Sadece onaylanmış talepler için RFQ oluşturulabilir' });
      }

      // RFQ numarası oluştur
      const year = new Date().getFullYear();
      const count = await RFQ.count() + 1;
      const rfqNumber = `RFQ-${year}-${String(count).padStart(3, '0')}`;

      // RFQ oluştur
      const rfq = await RFQ.create({
        rfqNumber,
        title: title || `${talep.talepBasligi} - Teklif Talebi`,
        description,
        talepId,
        deadline: new Date(deadline),
        paymentTerms,
        deliveryTerms,
        createdById: req.user?.id || 1,
        status: 'draft'
      });

      res.json({ rfq, message: 'RFQ başarıyla oluşturuldu' });
    } catch (error) {
      console.error('RFQ oluşturma hatası:', error);
      res.status(500).json({ error: 'RFQ oluşturulamadı' });
    }
  },

  // Tüm RFQ'ları getir
  getAll: async (req, res) => {
    try {
      const rfqs = await RFQ.findAll({
        include: [
          {
            model: Talep,
            as: 'talep',
            attributes: ['id', 'talepNo', 'talepBasligi', 'firma']
          },
          {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({ rfqs });
    } catch (error) {
      console.error('RFQ listesi hatası:', error);
      res.status(500).json({ error: 'RFQ listesi getirilemedi' });
    }
  },

  // RFQ detayını getir
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const rfq = await RFQ.findByPk(id, {
        include: [
          {
            model: Talep,
            as: 'talep',
            include: [{ model: TalepUrun, as: 'urunler' }]
          },
          {
            model: RFQItem,
            as: 'items'
          },
          {
            model: Quote,
            as: 'quotes',
            include: [
              {
                model: Company,
                as: 'supplier',
                attributes: ['id', 'name', 'email', 'phone']
              },
              {
                model: QuoteItem,
                as: 'items'
              }
            ]
          }
        ]
      });

      if (!rfq) {
        return res.status(404).json({ error: 'RFQ bulunamadı' });
      }

      res.json(rfq);
    } catch (error) {
      console.error('RFQ detay hatası:', error);
      res.status(500).json({ error: 'RFQ detayı getirilemedi' });
    }
  },

  // RFQ'ya ait teklifleri getir
  getQuotesByRFQ: async (req, res) => {
    try {
      const { id } = req.params;

      const quotes = await Quote.findAll({
        where: { rfqId: id },
        include: [
          {
            model: Company,
            as: 'supplier',
            attributes: ['id', 'name', 'email', 'phone', 'contactPerson']
          },
          {
            model: QuoteItem,
            as: 'items',
            include: [
              {
                model: RFQItem,
                as: 'rfqItem',
                attributes: ['id', 'itemNumber', 'productName', 'quantity', 'unit']
              }
            ]
          }
        ],
        order: [['submittedAt', 'DESC']]
      });

      res.json({ quotes });
    } catch (error) {
      console.error('RFQ teklifleri getirme hatası:', error);
      res.status(500).json({ error: 'Teklifler getirilemedi' });
    }
  },

  // RFQ gönder
  sendToSuppliers: async (req, res) => {
    try {
      const { id } = req.params;

      const rfq = await RFQ.findByPk(id);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ bulunamadı' });
      }

      await rfq.update({ 
        status: 'sent',
        sentAt: new Date()
      });

      res.json({ message: 'RFQ tedarikçilere gönderildi' });
    } catch (error) {
      console.error('RFQ gönderme hatası:', error);
      res.status(500).json({ error: 'RFQ gönderilemedi' });
    }
  },

  // Karşılaştırma raporu
  getComparisonReport: async (req, res) => {
    try {
      const { id } = req.params;

      const rfq = await RFQ.findByPk(id, {
        include: [
          {
            model: RFQItem,
            as: 'items'
          },
          {
            model: Quote,
            as: 'quotes',
            include: [
              {
                model: Company,
                as: 'supplier'
              },
              {
                model: QuoteItem,
                as: 'items'
              }
            ]
          }
        ]
      });

      if (!rfq) {
        return res.status(404).json({ error: 'RFQ bulunamadı' });
      }

      // Mock comparison data
      const comparison = {
        rfqInfo: {
          rfqNumber: rfq.rfqNumber,
          totalItems: rfq.items?.length || 0,
          totalQuotes: rfq.quotes?.length || 0,
          deadline: rfq.deadline
        },
        itemComparisons: rfq.items?.map(item => ({
          itemNumber: item.itemNumber,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          quotes: rfq.quotes?.map(quote => {
            const quoteItem = quote.items?.find(qi => qi.rfqItemId === item.id);
            return {
              supplier: quote.supplier?.name,
              unitPrice: quoteItem?.unitPrice || 0,
              totalPrice: quoteItem?.totalPrice || 0,
              currency: quoteItem?.currency || 'TRY',
              deliveryTime: quoteItem?.deliveryTime,
              brand: quoteItem?.brand,
              model: quoteItem?.model,
              warranty: quoteItem?.warranty,
              technicalCompliance: quoteItem?.technicalCompliance || 'fully_compliant'
            };
          }) || []
        })) || [],
        supplierSummary: rfq.quotes?.map(quote => ({
          supplier: quote.supplier?.name,
          totalAmount: quote.totalAmount,
          currency: quote.currency,
          overallScore: Math.random() * 10, // Mock score
          itemCount: quote.items?.length || 0,
          validUntil: quote.validUntil
        })) || [],
        bestPrices: rfq.items?.map(item => {
          const quotes = rfq.quotes?.map(quote => {
            const quoteItem = quote.items?.find(qi => qi.rfqItemId === item.id);
            return {
              supplier: quote.supplier?.name,
              price: quoteItem?.unitPrice || 0,
              currency: quoteItem?.currency
            };
          }).filter(q => q.price > 0) || [];
          
          const bestQuote = quotes.reduce((best, current) => 
            current.price < best.price ? current : best, 
            quotes[0] || { price: 0, supplier: 'N/A', currency: 'TRY' }
          );

          return {
            itemNumber: item.itemNumber,
            productName: item.productName,
            bestSupplier: bestQuote.supplier,
            bestPrice: bestQuote.price,
            currency: bestQuote.currency
          };
        }) || []
      };

      res.json(comparison);
    } catch (error) {
      console.error('Karşılaştırma raporu hatası:', error);
      res.status(500).json({ error: 'Karşılaştırma raporu oluşturulamadı' });
    }
  },

  // Manuel tedarikçi ekle
  addSupplierToRFQ: async (req, res) => {
    try {
      const { rfqId } = req.params;
      const { name, email, phone, contactPerson } = req.body;

      // RFQ'yu kontrol et
      const rfq = await RFQ.findByPk(rfqId);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ bulunamadı' });
      }

      // Tedarikçi var mı kontrol et
      let supplier = await Company.findOne({ where: { name, type: 'supplier' } });
      
      if (!supplier) {
        // Yeni tedarikçi oluştur
        supplier = await Company.create({
          name,
          email,
          phone,
          contactPerson,
          type: 'supplier'
        });
      }

      res.json({ 
        message: 'Tedarikçi başarıyla eklendi', 
        supplier 
      });
    } catch (error) {
      console.error('Tedarikçi ekleme hatası:', error);
      res.status(500).json({ error: 'Tedarikçi eklenemedi' });
    }
  },

  // Manuel teklif ekle
  addManualQuote: async (req, res) => {
    try {
      const { rfqId } = req.params;
      const { supplier, totalAmount, currency, validUntil, notes } = req.body;

      // RFQ'yu kontrol et
      const rfq = await RFQ.findByPk(rfqId, {
        include: [{ model: RFQItem, as: 'items' }]
      });
      
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ bulunamadı' });
      }

      // Tedarikçi var mı kontrol et
      let supplierCompany = await Company.findOne({ 
        where: { name: supplier, type: 'supplier' } 
      });
      
      if (!supplierCompany) {
        // Yeni tedarikçi oluştur
        supplierCompany = await Company.create({
          name: supplier,
          type: 'supplier'
        });
      }

      // Teklif numarası oluştur
      const year = new Date().getFullYear();
      const count = await Quote.count() + 1;
      const quoteNumber = `QT-${year}-${String(count).padStart(3, '0')}`;

      // Teklif oluştur
      const quote = await Quote.create({
        quoteNumber,
        rfqId,
        supplierId: supplierCompany.id,
        totalAmount: parseFloat(totalAmount),
        currency: currency || 'TRY',
        validUntil: validUntil ? new Date(validUntil) : null,
        notes,
        status: 'received',
        submittedAt: new Date()
      });

      res.json({ 
        message: 'Manuel teklif başarıyla eklendi', 
        quote 
      });
    } catch (error) {
      console.error('Manuel teklif ekleme hatası:', error);
      res.status(500).json({ error: 'Manuel teklif eklenemedi' });
    }
  }
};

module.exports = rfqController;
