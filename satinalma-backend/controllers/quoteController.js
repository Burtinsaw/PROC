const { Quote, QuoteItem, RFQ, RFQItem, Company, User } = require('../models');
const { Op } = require('sequelize');

const quoteController = {
  // Yeni teklif oluştur/kaydet
  create: async (req, res) => {
    try {
      const { 
        rfqId, 
        supplierId, 
        supplierQuoteNumber,
        paymentTerms,
        deliveryTerms,
        deliveryTime,
        warranty,
        incoterms,
        validUntil,
        notes,
        items 
      } = req.body;

      // RFQ kontrolü
      const rfq = await RFQ.findByPk(rfqId);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ bulunamadı' });
      }

      // Aynı tedarikçiden aynı RFQ için teklif var mı kontrol et
      const existingQuote = await Quote.findOne({
        where: { rfqId, supplierId }
      });

      if (existingQuote) {
        return res.status(400).json({ error: 'Bu tedarikçiden bu RFQ için zaten teklif mevcut' });
      }

      // Teklif numarası oluştur
      const year = new Date().getFullYear();
      const count = await Quote.count() + 1;
      const supplier = await Company.findByPk(supplierId);
      const supplierCode = supplier.name.substring(0, 3).toUpperCase();
      const quoteNumber = `QT-${year}-${String(count).padStart(3, '0')}-${supplierCode}`;

      // Toplam tutarı hesapla
      const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);

      // Teklif oluştur
      const quote = await Quote.create({
        quoteNumber,
        rfqId,
        supplierId,
        supplierQuoteNumber,
        totalAmount,
        paymentTerms,
        deliveryTerms,
        deliveryTime,
        warranty,
        incoterms,
        validUntil: validUntil ? new Date(validUntil) : null,
        notes,
        receivedById: req.user.id,
        status: 'received'
      });

      // Teklif item'larını oluştur
      for (const item of items) {
        await QuoteItem.create({
          quoteId: quote.id,
          rfqItemId: item.rfqItemId,
          productName: item.productName,
          productDescription: item.productDescription,
          brand: item.brand,
          model: item.model,
          articleNumber: item.articleNumber,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          currency: item.currency,
          deliveryTime: item.deliveryTime,
          warranty: item.warranty,
          technicalSpecification: item.technicalSpecification,
          countryOfOrigin: item.countryOfOrigin,
          isAlternative: item.isAlternative || false,
          alternativeReason: item.alternativeReason,
          notes: item.notes
        });
      }

      // RFQ durumunu güncelle
      await rfq.update({ status: 'responses_received' });

      res.status(201).json({
        message: 'Teklif başarıyla kaydedildi',
        quote: await Quote.findByPk(quote.id, {
          include: ['supplier', 'items', 'rfq']
        })
      });
    } catch (error) {
      console.error('Teklif oluşturma hatası:', error);
      res.status(500).json({ error: 'Teklif kaydedilirken hata oluştu' });
    }
  },

  // Teklifi güncelle
  update: async (req, res) => {
    try {
      const quote = await Quote.findByPk(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: 'Teklif bulunamadı' });
      }

      await quote.update(req.body);
      
      res.json({
        message: 'Teklif güncellendi',
        quote: await Quote.findByPk(quote.id, {
          include: ['supplier', 'items', 'rfq']
        })
      });
    } catch (error) {
      console.error('Teklif güncelleme hatası:', error);
      res.status(500).json({ error: 'Teklif güncellenemedi' });
    }
  },

  // Teklif değerlendirmesi yap
  evaluate: async (req, res) => {
    try {
      const { 
        priceScore, 
        qualityScore, 
        deliveryScore, 
        serviceScore, 
        evaluationNotes,
        itemEvaluations 
      } = req.body;

      const quote = await Quote.findByPk(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: 'Teklif bulunamadı' });
      }

      // Genel skorları hesapla
      const overallScore = (
        parseFloat(priceScore) + 
        parseFloat(qualityScore) + 
        parseFloat(deliveryScore) + 
        parseFloat(serviceScore)
      ) / 4;

      // Teklifi güncelle
      await quote.update({
        priceScore,
        qualityScore,
        deliveryScore,
        serviceScore,
        overallScore: overallScore.toFixed(1),
        evaluationNotes,
        status: 'under_review'
      });

      // Item değerlendirmelerini güncelle
      if (itemEvaluations && itemEvaluations.length > 0) {
        for (const itemEval of itemEvaluations) {
          await QuoteItem.update({
            technicalCompliance: itemEval.technicalCompliance,
            complianceNotes: itemEval.complianceNotes
          }, {
            where: { id: itemEval.quoteItemId }
          });
        }
      }

      res.json({
        message: 'Teklif değerlendirmesi tamamlandı',
        quote: await Quote.findByPk(quote.id, {
          include: ['supplier', 'items']
        })
      });
    } catch (error) {
      console.error('Teklif değerlendirme hatası:', error);
      res.status(500).json({ error: 'Teklif değerlendirilemedi' });
    }
  },

  // Teklifi seç/onayla
  select: async (req, res) => {
    try {
      const { selectedItems } = req.body; // Hangi item'ların seçildiği
      
      const quote = await Quote.findByPk(req.params.id, {
        include: ['rfq', 'items']
      });
      
      if (!quote) {
        return res.status(404).json({ error: 'Teklif bulunamadı' });
      }

      // Teklifi seçili olarak işaretle
      await quote.update({ status: 'selected' });

      // Seçilen item'ları işaretle (eğer varsa)
      if (selectedItems && selectedItems.length > 0) {
        // Bu kısım, karışık tedarikçi seçimi için kullanılabilir
        // Şimdilik tüm item'ları seçili kabul ediyoruz
      }

      // RFQ'yu tamamlandı olarak işaretle
      await quote.rfq.update({ 
        status: 'completed',
        evaluationCompleted: new Date()
      });

      res.json({
        message: 'Teklif seçildi ve onaylandı',
        quote: await Quote.findByPk(quote.id, {
          include: ['supplier', 'items', 'rfq']
        })
      });
    } catch (error) {
      console.error('Teklif seçme hatası:', error);
      res.status(500).json({ error: 'Teklif seçilemedi' });
    }
  },

  // RFQ'ya ait tüm teklifleri listele
  getByRFQ: async (req, res) => {
    try {
      const { rfqId } = req.params;
      
      const quotes = await Quote.findAll({
        where: { rfqId },
        include: [
          { model: Company, as: 'supplier' },
          { model: QuoteItem, as: 'items' },
          { model: User, as: 'receivedBy' }
        ],
        order: [['receivedDate', 'DESC']]
      });

      res.json({ quotes });
    } catch (error) {
      console.error('RFQ teklifleri listesi hatası:', error);
      res.status(500).json({ error: 'Teklifler listelenemedi' });
    }
  },

  // Teklif detayı
  getById: async (req, res) => {
    try {
      const quote = await Quote.findByPk(req.params.id, {
        include: [
          { model: Company, as: 'supplier' },
          { 
            model: QuoteItem, 
            as: 'items',
            include: [{ model: RFQItem, as: 'rfqItem' }]
          },
          { model: RFQ, as: 'rfq' },
          { model: User, as: 'receivedBy' }
        ]
      });

      if (!quote) {
        return res.status(404).json({ error: 'Teklif bulunamadı' });
      }

      res.json(quote);
    } catch (error) {
      console.error('Teklif detay hatası:', error);
      res.status(500).json({ error: 'Teklif detayı alınamadı' });
    }
  },

  // Teklif değerlendir
  evaluateQuote: async (req, res) => {
    try {
      const { id } = req.params;
      const { priceScore, qualityScore, deliveryScore, serviceScore, evaluationNotes } = req.body;

      const quote = await Quote.findByPk(id);
      if (!quote) {
        return res.status(404).json({ error: 'Teklif bulunamadı' });
      }

      await quote.update({
        priceScore,
        qualityScore,
        deliveryScore,
        serviceScore,
        evaluationNotes,
        evaluatedAt: new Date(),
        evaluatedById: req.user?.id || 1
      });

      res.json({ message: 'Teklif değerlendirmesi kaydedildi' });
    } catch (error) {
      console.error('Teklif değerlendirme hatası:', error);
      res.status(500).json({ error: 'Teklif değerlendirilemedi' });
    }
  },

  // Teklif seç
  selectQuote: async (req, res) => {
    try {
      const { id } = req.params;

      const quote = await Quote.findByPk(id);
      if (!quote) {
        return res.status(404).json({ error: 'Teklif bulunamadı' });
      }

      // Aynı RFQ'daki diğer teklifleri reddet
      await Quote.update(
        { status: 'rejected' },
        { where: { rfqId: quote.rfqId, id: { [Op.ne]: id } } }
      );

      // Bu teklifi seç
      await quote.update({
        status: 'selected',
        selectedAt: new Date(),
        selectedById: req.user?.id || 1
      });

      res.json({ message: 'Teklif seçildi ve onaylandı' });
    } catch (error) {
      console.error('Teklif seçme hatası:', error);
      res.status(500).json({ error: 'Teklif seçilemedi' });
    }
  }
};

module.exports = quoteController;
