const { PurchaseOrder, PurchaseOrderItem, Talep, User, Company, Shipment, Invoice } = require('../models');

const purchaseOrderController = {
  // Onaylanan talepleri satınalma siparişine dönüştür
  createFromRequest: async (req, res) => {
    try {
      const { talepId, supplierId, items, deliveryDate, terms } = req.body;
      
      // Talebin onaylanmış olduğunu kontrol et
      const talep = await Talep.findByPk(talepId);
      if (!talep || talep.durum !== 'onaylandi') {
        return res.status(400).json({ error: 'Sadece onaylanmış talepler sipariş edilebilir' });
      }

      // PO numarası oluştur
      const year = new Date().getFullYear();
      const count = await PurchaseOrder.count() + 1;
      const poNumber = `PO-${year}-${String(count).padStart(3, '0')}`;

      // Purchase Order oluştur
      const purchaseOrder = await PurchaseOrder.create({
        poNumber,
        talepId,
        supplierId,
        deliveryDate,
        terms,
        createdById: req.user.id,
        status: 'draft'
      });

      // Items ekle
      let totalAmount = 0;
      for (const item of items) {
        const poItem = await PurchaseOrderItem.create({
          purchaseOrderId: purchaseOrder.id,
          ...item
        });
        totalAmount += parseFloat(item.totalPrice || 0);
      }

      // Total amount güncelle
      await purchaseOrder.update({ totalAmount });

      // Talebin durumunu güncelle
      await talep.update({ durum: 'siparis_olusturuldu' });

      res.status(201).json({ 
        message: 'Satınalma siparişi başarıyla oluşturuldu',
        purchaseOrder: await PurchaseOrder.findByPk(purchaseOrder.id, {
          include: ['items', 'talep', 'supplier']
        })
      });
    } catch (error) {
      console.error('PO oluşturma hatası:', error);
      res.status(500).json({ error: 'Sipariş oluşturulurken hata oluştu' });
    }
  },

  // Tüm purchase order'ları listele
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (search) where.poNumber = { [Op.like]: `%${search}%` };

      const purchaseOrders = await PurchaseOrder.findAndCountAll({
        where,
        include: [
          { model: Talep, as: 'talep' },
          { model: Company, as: 'supplier' },
          { model: User, as: 'createdBy' },
          { model: PurchaseOrderItem, as: 'items' }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        purchaseOrders: purchaseOrders.rows,
        totalCount: purchaseOrders.count,
        totalPages: Math.ceil(purchaseOrders.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('PO listesi hatası:', error);
      res.status(500).json({ error: 'Purchase order listesi alınamadı' });
    }
  },

  // Purchase order detayı
  getById: async (req, res) => {
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(req.params.id, {
        include: [
          { model: Talep, as: 'talep' },
          { model: Company, as: 'supplier' },
          { model: User, as: 'createdBy' },
          { model: PurchaseOrderItem, as: 'items' },
          { model: Shipment, as: 'shipments' },
          { model: Invoice, as: 'invoices' }
        ]
      });

      if (!purchaseOrder) {
        return res.status(404).json({ error: 'Purchase order bulunamadı' });
      }

      res.json(purchaseOrder);
    } catch (error) {
      console.error('PO detay hatası:', error);
      res.status(500).json({ error: 'Purchase order detayı alınamadı' });
    }
  },

  // Purchase order'ı güncelle
  update: async (req, res) => {
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(req.params.id);
      if (!purchaseOrder) {
        return res.status(404).json({ error: 'Purchase order bulunamadı' });
      }

      await purchaseOrder.update(req.body);
      res.json({ message: 'Purchase order güncellendi', purchaseOrder });
    } catch (error) {
      console.error('PO güncelleme hatası:', error);
      res.status(500).json({ error: 'Purchase order güncellenemedi' });
    }
  },

  // Purchase order durumunu değiştir
  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const purchaseOrder = await PurchaseOrder.findByPk(req.params.id);
      
      if (!purchaseOrder) {
        return res.status(404).json({ error: 'Purchase order bulunamadı' });
      }

      await purchaseOrder.update({ 
        status,
        ...(status === 'sent' && { sentDate: new Date() }),
        ...(status === 'confirmed' && { confirmedDate: new Date() })
      });

      res.json({ message: `Purchase order durumu ${status} olarak güncellendi` });
    } catch (error) {
      console.error('PO durum güncelleme hatası:', error);
      res.status(500).json({ error: 'Durum güncellenemedi' });
    }
  }
};

module.exports = purchaseOrderController;
