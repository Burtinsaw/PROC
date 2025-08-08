const { 
  PurchaseOrder, 
  PurchaseOrderItem, 
  Shipment, 
  ShipmentItem, 
  Payment, 
  Company, 
  User, 
  Talep,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');

const logisticsController = {
  // Lojistik takvim olaylarını getir
  getCalendarEvents: async (req, res) => {
    try {
      const { startDate, endDate, type, priority, status } = req.query;

      // Tarih filtreleri
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Purchase Orders'dan üretim olayları
      const purchaseOrders = await PurchaseOrder.findAll({
        where: {
          ...dateFilter,
          ...(status && { status })
        },
        include: [
          { model: Company, as: 'supplier' },
          { model: PurchaseOrderItem, as: 'items' },
          { model: Talep, as: 'talep' }
        ],
        order: [['deliveryDate', 'ASC']]
      });

      // Sevkiyat olayları
      const shipments = await Shipment.findAll({
        where: {
          ...dateFilter,
          ...(status && { status })
        },
        include: [
          { 
            model: PurchaseOrder, 
            as: 'purchaseOrder',
            include: [
              { model: Company, as: 'supplier' },
              { model: Talep, as: 'talep' }
            ]
          }
        ],
        order: [['estimatedDeliveryDate', 'ASC']]
      });

      // Ödemeler
      const payments = await Payment.findAll({
        where: {
          ...dateFilter,
          ...(status && { status })
        },
        include: [
          {
            model: PurchaseOrder,
            as: 'purchaseOrder',
            include: [
              { model: Company, as: 'supplier' },
              { model: Talep, as: 'talep' }
            ]
          }
        ],
        order: [['paymentDate', 'ASC']]
      });

      // Olayları takvim formatına dönüştür
      const events = [];

      // Üretim/Sipariş olayları
      purchaseOrders.forEach(po => {
        const prepaymentPercentage = po.prepaymentPercentage || 30;
        const prepaymentAmount = (po.totalAmount * prepaymentPercentage) / 100;
        
        events.push({
          id: `po-${po.id}`,
          title: `${po.supplier?.name} - ${po.talep?.talepBasligi || 'Sipariş'}`,
          start: po.deliveryDate || po.createdAt,
          end: po.deliveryDate || po.createdAt,
          type: po.status === 'production' ? 'production' : 'order',
          status: po.status,
          poNumber: po.poNumber,
          supplier: po.supplier?.name,
          totalAmount: po.totalAmount,
          prepaymentAmount,
          prepaymentPercentage,
          priority: this.calculatePriority(po.deliveryDate, po.totalAmount),
          items: po.items?.map(item => item.productName) || [],
          productionDuration: po.productionDuration || '30-45 gün',
          category: 'purchase_order'
        });
      });

      // Sevkiyat olayları
      shipments.forEach(shipment => {
        events.push({
          id: `ship-${shipment.id}`,
          title: `${shipment.purchaseOrder?.supplier?.name} - Sevkiyat`,
          start: shipment.estimatedDeliveryDate || shipment.shippedDate,
          end: shipment.estimatedDeliveryDate || shipment.shippedDate,
          type: 'shipping',
          status: shipment.status,
          shipmentNumber: shipment.shipmentNumber,
          trackingNumber: shipment.trackingNumber,
          carrier: shipment.carrier,
          destination: shipment.destination,
          supplier: shipment.purchaseOrder?.supplier?.name,
          priority: this.calculateShipmentPriority(shipment.estimatedDeliveryDate, shipment.status),
          category: 'shipment'
        });
      });

      // Ödeme olayları
      payments.forEach(payment => {
        events.push({
          id: `pay-${payment.id}`,
          title: `${payment.purchaseOrder?.supplier?.name} - Ödeme`,
          start: payment.paymentDate,
          end: payment.paymentDate,
          type: 'payment',
          status: payment.status,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          supplier: payment.purchaseOrder?.supplier?.name,
          priority: this.calculatePaymentPriority(payment.paymentDate, payment.amount),
          category: 'payment'
        });
      });

      // Filtreleme
      let filteredEvents = events;
      if (type && type !== 'all') {
        filteredEvents = events.filter(event => event.type === type);
      }
      if (priority) {
        filteredEvents = filteredEvents.filter(event => event.priority === priority);
      }

      res.json({
        success: true,
        events: filteredEvents,
        totalCount: filteredEvents.length
      });

    } catch (error) {
      console.error('Lojistik takvim olayları hatası:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Lojistik olayları getirilemedi' 
      });
    }
  },

  // Yaklaşan kritik olayları getir
  getUpcomingCriticalEvents: async (req, res) => {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Kritik tarihlerdeki siparişler
      const criticalOrders = await PurchaseOrder.findAll({
        where: {
          deliveryDate: {
            [Op.between]: [today, nextWeek]
          },
          status: {
            [Op.in]: ['production', 'pending_payment', 'preparing']
          }
        },
        include: [
          { model: Company, as: 'supplier' },
          { model: Talep, as: 'talep' }
        ]
      });

      // Kritik sevkiyatlar
      const criticalShipments = await Shipment.findAll({
        where: {
          estimatedDeliveryDate: {
            [Op.between]: [today, nextWeek]
          },
          status: {
            [Op.in]: ['preparing', 'shipped', 'in_transit']
          }
        },
        include: [
          { 
            model: PurchaseOrder, 
            as: 'purchaseOrder',
            include: [{ model: Company, as: 'supplier' }]
          }
        ]
      });

      // Vadesi gelen ödemeler
      const criticalPayments = await Payment.findAll({
        where: {
          paymentDate: {
            [Op.between]: [today, nextWeek]
          },
          status: 'pending'
        },
        include: [
          {
            model: PurchaseOrder,
            as: 'purchaseOrder',
            include: [{ model: Company, as: 'supplier' }]
          }
        ]
      });

      const notifications = [];

      // Kritik sipariş uyarıları
      criticalOrders.forEach(order => {
        const daysDiff = Math.ceil((new Date(order.deliveryDate) - today) / (1000 * 60 * 60 * 24));
        notifications.push({
          id: `order-${order.id}`,
          type: 'production',
          priority: daysDiff <= 1 ? 'kritik' : 'yüksek',
          title: `${order.supplier?.name} - Üretim/Teslimat`,
          message: daysDiff <= 1 
            ? `BUGÜN: ${order.supplier?.name} teslimat tarihi!`
            : `${daysDiff} gün sonra: ${order.supplier?.name} teslimat`,
          date: order.deliveryDate,
          orderId: order.id,
          orderNumber: order.poNumber
        });
      });

      // Kritik sevkiyat uyarıları
      criticalShipments.forEach(shipment => {
        const daysDiff = Math.ceil((new Date(shipment.estimatedDeliveryDate) - today) / (1000 * 60 * 60 * 24));
        notifications.push({
          id: `shipment-${shipment.id}`,
          type: 'shipping',
          priority: daysDiff <= 1 ? 'kritik' : 'yüksek',
          title: `${shipment.purchaseOrder?.supplier?.name} - Sevkiyat`,
          message: daysDiff <= 1 
            ? `BUGÜN: ${shipment.shipmentNumber} sevkiyat teslimi!`
            : `${daysDiff} gün sonra: ${shipment.shipmentNumber} teslim`,
          date: shipment.estimatedDeliveryDate,
          shipmentId: shipment.id,
          trackingNumber: shipment.trackingNumber
        });
      });

      // Kritik ödeme uyarıları
      criticalPayments.forEach(payment => {
        const daysDiff = Math.ceil((new Date(payment.paymentDate) - today) / (1000 * 60 * 60 * 24));
        notifications.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          priority: daysDiff <= 1 ? 'kritik' : 'yüksek',
          title: `${payment.purchaseOrder?.supplier?.name} - Ödeme`,
          message: daysDiff <= 1 
            ? `BUGÜN: ${payment.amount} TL ödeme vadesi!`
            : `${daysDiff} gün sonra: ${payment.amount} TL ödeme`,
          date: payment.paymentDate,
          paymentId: payment.id,
          amount: payment.amount
        });
      });

      // Öncelik sırasına göre sırala
      notifications.sort((a, b) => {
        const priorityOrder = { 'kritik': 3, 'yüksek': 2, 'orta': 1, 'düşük': 0 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      res.json({
        success: true,
        notifications,
        count: notifications.length
      });

    } catch (error) {
      console.error('Kritik olaylar hatası:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Kritik olaylar getirilemedi' 
      });
    }
  },

  // Dashboard istatistikleri
  getDashboardStats: async (req, res) => {
    try {
      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const [
        totalOrders,
        productionOrders,
        shippedOrders,
        deliveredOrders,
        pendingPayments,
        completedPayments,
        activeShipments
      ] = await Promise.all([
        PurchaseOrder.count(),
        PurchaseOrder.count({ where: { status: 'production' } }),
        PurchaseOrder.count({ where: { status: 'shipped' } }),
        PurchaseOrder.count({ where: { status: 'delivered' } }),
        Payment.count({ where: { status: 'pending' } }),
        Payment.count({ where: { status: 'completed' } }),
        Shipment.count({ where: { status: { [Op.in]: ['preparing', 'shipped', 'in_transit'] } } })
      ]);

      res.json({
        success: true,
        stats: {
          orders: {
            total: totalOrders,
            production: productionOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders
          },
          payments: {
            pending: pendingPayments,
            completed: completedPayments
          },
          shipments: {
            active: activeShipments
          }
        }
      });

    } catch (error) {
      console.error('Lojistik istatistik hatası:', error);
      res.status(500).json({ 
        success: false, 
        error: 'İstatistikler getirilemedi' 
      });
    }
  },

  // Yardımcı fonksiyonlar
  calculatePriority: function(deliveryDate, totalAmount) {
    const today = new Date();
    const daysDiff = Math.ceil((new Date(deliveryDate) - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) return 'kritik';
    if (daysDiff <= 7 || totalAmount > 100000) return 'yüksek';
    if (daysDiff <= 30) return 'orta';
    return 'düşük';
  },

  calculateShipmentPriority: function(deliveryDate, status) {
    const today = new Date();
    const daysDiff = Math.ceil((new Date(deliveryDate) - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1 && status !== 'delivered') return 'kritik';
    if (daysDiff <= 3) return 'yüksek';
    if (daysDiff <= 7) return 'orta';
    return 'düşük';
  },

  calculatePaymentPriority: function(paymentDate, amount) {
    const today = new Date();
    const daysDiff = Math.ceil((new Date(paymentDate) - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) return 'kritik';
    if (daysDiff <= 3 || amount > 50000) return 'yüksek';
    if (daysDiff <= 7) return 'orta';
    return 'düşük';
  }
};

module.exports = logisticsController;
