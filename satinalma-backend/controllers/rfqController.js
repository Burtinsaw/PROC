const { RFQ, RFQItem, Quote, QuoteItem, Talep, TalepUrun, Company, User } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

const rfqController = {
  // Genel RFQ oluştur
  create: async (req, res) => {
    try {
      console.log('🔍 RFQ Create - Received data:', JSON.stringify(req.body, null, 2));
      const { title, description, deadline, suppliers, items, paymentTerms, deliveryTerms, talepId } = req.body;

      // RFQ numarası oluştur
      const year = new Date().getFullYear();
      const count = await RFQ.count() + 1;
      const rfqNumber = `RFQ-${year}-${String(count).padStart(3, '0')}`;

      // RFQ oluştur
      const rfqData = {
        rfqNumber,
        title: title || 'Yeni Teklif Talebi',
        description,
        talepId: talepId || null,
        deadline: deadline ? new Date(deadline) : null,
        paymentTerms,
        deliveryTerms,
        createdById: req.user?.id || 1,
        status: 'draft'
      };
      
      console.log('🔍 RFQ Create - Data to insert:', JSON.stringify(rfqData, null, 2));
      const rfq = await RFQ.create(rfqData);
      console.log('✅ RFQ Created:', rfq.id);

      // Items varsa kaydet
      if (items && Array.isArray(items) && items.length > 0) {
        console.log('📦 Saving RFQ Items:', items.length);
        const rfqItems = items.map(item => ({
          rfqId: rfq.id,
          talepUrunId: item.id || item.talepUrunId,
          urunAdi: item.urunAdi || item.name || item.productName,
          miktar: item.miktar || item.quantity || 1,
          birim: item.birim || item.unit || 'adet',
          unit: item.birim || item.unit || 'adet', // Model unit kolonunu bekliyor
          teknikOzellikler: item.ozellikler || item.specifications,
          marka: item.marka || item.brand,
          model: item.model
        }));
        
        console.log('🔍 Mapped RFQ Items:', JSON.stringify(rfqItems, null, 2));
        await RFQItem.bulkCreate(rfqItems);
        console.log('✅ RFQ Items saved successfully');
      }

      // RFQ'yu tam data ile tekrar çek (includes ile)
      const fullRfq = await RFQ.findByPk(rfq.id, {
        include: [
          {
            model: Talep,
            as: 'talep',
            include: [{ model: TalepUrun, as: 'urunler' }]
          },
          {
            model: RFQItem,
            as: 'items'
          }
        ]
      });

      console.log('🔍 Full RFQ Response:', {
        id: fullRfq.id,
        hasItems: fullRfq.items && fullRfq.items.length > 0,
        itemsCount: fullRfq.items?.length || 0,
        hasTalep: !!fullRfq.talep,
        talepUrunlerCount: fullRfq.talep?.urunler?.length || 0,
        fullRfqKeys: Object.keys(fullRfq),
        itemsDetail: fullRfq.items?.map(item => ({
          id: item.id,
          urunAdi: item.urunAdi,
          miktar: item.miktar,
          birim: item.birim,
          unit: item.unit
        }))
      });

      res.json({ 
        rfq: fullRfq, 
        message: 'RFQ başarıyla oluşturuldu',
        debug: {
          itemsCount: fullRfq.items?.length || 0,
          talepUrunlerCount: fullRfq.talep?.urunler?.length || 0
        }
      });
    } catch (error) {
      console.error('RFQ oluşturma hatası:', error);
      res.status(500).json({ error: 'RFQ oluşturulamadı', details: error.message });
    }
  },

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

      // Enhanced RFQ debug logging
      console.log('🔍 RFQ BACKEND DEBUG - Full RFQ object:', {
        id: rfq.id,
        title: rfq.title,
        talepId: rfq.talepId,
        hasItems: rfq.items && rfq.items.length > 0,
        itemsCount: rfq.items?.length || 0,
        hasTalep: !!rfq.talep,
        talepUrunlerCount: rfq.talep?.urunler?.length || 0,
        fullRfqKeys: Object.keys(rfq.dataValues || rfq),
        talepKeys: rfq.talep ? Object.keys(rfq.talep.dataValues || rfq.talep) : null,
        firstTalepUrun: rfq.talep?.urunler?.[0] ? Object.keys(rfq.talep.urunler[0].dataValues || rfq.talep.urunler[0]) : null
      });

      // Log first few products for verification
      if (rfq.talep?.urunler?.length > 0) {
        console.log('📦 BACKEND - First 3 products from talep.urunler:');
        rfq.talep.urunler.slice(0, 3).forEach((urun, index) => {
          console.log(`  ${index + 1}. ${JSON.stringify(urun.dataValues || urun, null, 2)}`);
        });
      }

      if (rfq.items?.length > 0) {
        console.log('📦 BACKEND - First 3 items from rfq.items:');
        rfq.items.slice(0, 3).forEach((item, index) => {
          console.log(`  ${index + 1}. ${JSON.stringify(item.dataValues || item, null, 2)}`);
        });
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
  },

  // RFQ ayarlarını güncelle
  updateSettings: async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentTerms, deliveryTerms, validityPeriod, currency, additionalNotes } = req.body;

      const rfq = await RFQ.findByPk(id);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ bulunamadı' });
      }

      await rfq.update({
        paymentTerms,
        deliveryTerms,
        validityPeriod,
        currency,
        additionalNotes
      });

      res.json({ 
        message: 'RFQ ayarları güncellendi',
        rfq: await RFQ.findByPk(id)
      });
    } catch (error) {
      console.error('RFQ ayarları güncellenirken hata:', error);
      res.status(500).json({ error: 'RFQ ayarları güncellenemedi' });
    }
  },

  // RFQ'yu tedarikçilere e-posta ile gönder
  sendToSuppliersWithEmail: async (req, res) => {
    try {
      const { id } = req.params;
      const { suppliers, emailTemplate, language = 'tr' } = req.body;

      // RFQ ve ilgili verileri getir
      const rfq = await RFQ.findByPk(id, {
        include: [
          { 
            model: Talep, 
            as: 'talep',
            include: [{ model: TalepUrun, as: 'urunler' }]
          },
          { model: RFQItem, as: 'items' }
        ]
      });

      if (!rfq) {
        return res.status(404).json({ error: 'RFQ bulunamadı' });
      }

      // E-posta için RFQ verilerini hazırla
      const rfqEmailData = {
        title: rfq.title,
        description: rfq.description,
        rfqNumber: rfq.rfqNumber,
        deadline: rfq.deadline,
        paymentTerms: rfq.paymentTerms,
        deliveryTerms: rfq.deliveryTerms,
        validityPeriod: rfq.validityPeriod,
        currency: rfq.currency,
        items: rfq.talep?.urunler || rfq.items || []
      };

      // Toplu e-posta gönder
      const emailResults = await emailService.sendBulkRFQEmails(
        suppliers, 
        rfqEmailData, 
        emailTemplate, 
        language
      );

      // RFQ durumunu güncelle
      await rfq.update({ 
        status: 'sent',
        sentAt: new Date()
      });

      res.json({
        message: 'RFQ başarıyla gönderildi',
        emailResults,
        rfq: await RFQ.findByPk(id)
      });

    } catch (error) {
      console.error('RFQ e-posta gönderme hatası:', error);
      res.status(500).json({ error: 'RFQ gönderilemedi' });
    }
  },

  // Tek tedarikçiye RFQ gönder
  sendToSingleSupplier: async (req, res) => {
    try {
      const { id } = req.params;
      const { supplierEmail, emailTemplate, language = 'tr' } = req.body;

      const rfq = await RFQ.findByPk(id, {
        include: [
          { 
            model: Talep, 
            as: 'talep',
            include: [{ model: TalepUrun, as: 'urunler' }]
          }
        ]
      });

      if (!rfq) {
        return res.status(404).json({ error: 'RFQ bulunamadı' });
      }

      const rfqEmailData = {
        title: rfq.title,
        description: rfq.description,
        rfqNumber: rfq.rfqNumber,
        deadline: rfq.deadline,
        paymentTerms: rfq.paymentTerms,
        deliveryTerms: rfq.deliveryTerms,
        validityPeriod: rfq.validityPeriod,
        currency: rfq.currency,
        items: rfq.talep?.urunler || []
      };

      const result = await emailService.sendRFQEmail(
        supplierEmail,
        rfqEmailData,
        emailTemplate,
        language
      );

      res.json({
        message: result.success ? 'RFQ başarıyla gönderildi' : 'RFQ gönderilemedi',
        result
      });

    } catch (error) {
      console.error('RFQ e-posta gönderme hatası:', error);
      res.status(500).json({ error: 'RFQ gönderilemedi' });
    }
  },

  // RFQ güncelle
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const rfq = await RFQ.findByPk(id);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ bulunamadı' });
      }

      // Sadece draft durumundaki RFQ'lar güncellenebilir
      if (rfq.status !== 'draft') {
        return res.status(400).json({ error: 'Sadece taslak durumundaki RFQ\'lar güncellenebilir' });
      }

      await rfq.update(updateData);
      
      res.json({
        message: 'RFQ başarıyla güncellendi',
        rfq
      });
    } catch (error) {
      console.error('RFQ güncelleme hatası:', error);
      res.status(500).json({ error: 'RFQ güncellenemedi' });
    }
  },

  // RFQ sil
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const rfq = await RFQ.findByPk(id);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ bulunamadı' });
      }

      // Sadece draft durumundaki RFQ'lar silinebilir
      if (rfq.status !== 'draft') {
        return res.status(400).json({ error: 'Sadece taslak durumundaki RFQ\'lar silinebilir' });
      }

      await rfq.destroy();
      
      res.json({
        message: 'RFQ başarıyla silindi'
      });
    } catch (error) {
      console.error('RFQ silme hatası:', error);
      res.status(500).json({ error: 'RFQ silinemedi' });
    }
  }
};

module.exports = rfqController;
