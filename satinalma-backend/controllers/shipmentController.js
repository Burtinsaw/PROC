const { Shipment, ShipmentItem, PurchaseOrder, PurchaseOrderItem, User } = require('../models');

const shipmentController = {
  // Yeni sevkiyat oluştur
  create: async (req, res) => {
    try {
      const { purchaseOrderId, trackingNumber, carrier, items } = req.body;

      // PO'nun var olduğunu kontrol et
      const purchaseOrder = await PurchaseOrder.findByPk(purchaseOrderId);
      if (!purchaseOrder) {
        return res.status(404).json({ error: 'Purchase order bulunamadı' });
      }

      // Sevkiyat numarası oluştur
      const year = new Date().getFullYear();
      const count = await Shipment.count() + 1;
      const shipmentNumber = `SHP-${year}-${String(count).padStart(4, '0')}`;

      // Sevkiyat oluştur
      const shipment = await Shipment.create({
        shipmentNumber,
        purchaseOrderId,
        trackingNumber,
        carrier,
        createdById: req.user.id,
        status: 'preparing'
      });

      // Sevkiyat item'larını ekle
      if (items && items.length > 0) {
        for (const item of items) {
          await ShipmentItem.create({
            shipmentId: shipment.id,
            purchaseOrderItemId: item.purchaseOrderItemId,
            quantity: item.quantity,
            condition: item.condition || 'good'
          });
        }
      }

      res.status(201).json({
        message: 'Sevkiyat başarıyla oluşturuldu',
        shipment: await Shipment.findByPk(shipment.id, {
          include: ['items', 'purchaseOrder']
        })
      });
    } catch (error) {
      console.error('Sevkiyat oluşturma hatası:', error);
      res.status(500).json({ error: 'Sevkiyat oluşturulurken hata oluştu' });
    }
  },

  // Tüm sevkiyatları listele
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, carrier } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (carrier) where.carrier = carrier;

      const shipments = await Shipment.findAndCountAll({
        where,
        include: [
          { model: PurchaseOrder, as: 'purchaseOrder' },
          { model: User, as: 'createdBy' },
          { model: ShipmentItem, as: 'items' }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        shipments: shipments.rows,
        totalCount: shipments.count,
        totalPages: Math.ceil(shipments.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Sevkiyat listesi hatası:', error);
      res.status(500).json({ error: 'Sevkiyat listesi alınamadı' });
    }
  },

  // Sevkiyat detayı
  getById: async (req, res) => {
    try {
      const shipment = await Shipment.findByPk(req.params.id, {
        include: [
          { 
            model: PurchaseOrder, 
            as: 'purchaseOrder',
            include: ['talep', 'supplier']
          },
          { model: User, as: 'createdBy' },
          { 
            model: ShipmentItem, 
            as: 'items',
            include: ['purchaseOrderItem']
          }
        ]
      });

      if (!shipment) {
        return res.status(404).json({ error: 'Sevkiyat bulunamadı' });
      }

      res.json(shipment);
    } catch (error) {
      console.error('Sevkiyat detay hatası:', error);
      res.status(500).json({ error: 'Sevkiyat detayı alınamadı' });
    }
  },

  // Sevkiyat durumunu güncelle
  updateStatus: async (req, res) => {
    try {
      const { status, notes, actualDeliveryDate } = req.body;
      const shipment = await Shipment.findByPk(req.params.id);

      if (!shipment) {
        return res.status(404).json({ error: 'Sevkiyat bulunamadı' });
      }

      const updateData = { status };
      if (notes) updateData.notes = notes;
      if (status === 'delivered' && actualDeliveryDate) {
        updateData.actualDeliveryDate = actualDeliveryDate;
      }

      await shipment.update(updateData);

      // Eğer teslim edildiyse, PO durumunu güncelle
      if (status === 'delivered') {
        const purchaseOrder = await PurchaseOrder.findByPk(shipment.purchaseOrderId);
        if (purchaseOrder) {
          await purchaseOrder.update({ status: 'delivered' });
        }
      }

      res.json({ 
        message: `Sevkiyat durumu ${status} olarak güncellendi`,
        shipment: await Shipment.findByPk(req.params.id)
      });
    } catch (error) {
      console.error('Sevkiyat durum güncelleme hatası:', error);
      res.status(500).json({ error: 'Sevkiyat durumu güncellenemedi' });
    }
  },

  // Takip numarası ile sevkiyat sorgula
  trackByNumber: async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      
      const shipment = await Shipment.findOne({
        where: { trackingNumber },
        include: [
          { model: PurchaseOrder, as: 'purchaseOrder' },
          { model: ShipmentItem, as: 'items' }
        ]
      });

      if (!shipment) {
        return res.status(404).json({ error: 'Bu takip numarasına ait sevkiyat bulunamadı' });
      }

      res.json({
        shipment,
        trackingInfo: {
          status: shipment.status,
          carrier: shipment.carrier,
          origin: shipment.origin,
          destination: shipment.destination,
          shipDate: shipment.shipDate,
          estimatedDelivery: shipment.estimatedDeliveryDate,
          actualDelivery: shipment.actualDeliveryDate
        }
      });
    } catch (error) {
      console.error('Takip sorgu hatası:', error);
      res.status(500).json({ error: 'Takip bilgisi alınamadı' });
    }
  }
};

module.exports = shipmentController;
