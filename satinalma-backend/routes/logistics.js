const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm rotalar authentication gerektirir
router.use(authMiddleware);

// Lojistik takvim ve olaylar
router.get('/calendar-events', logisticsController.getCalendarEvents);
router.get('/upcoming-critical', logisticsController.getUpcomingCriticalEvents);
router.get('/dashboard-stats', logisticsController.getDashboardStats);

// Bildirim yönetimi
router.get('/notifications', async (req, res) => {
  try {
    // Simulated notifications - gerçek uygulamada veritabanından gelecek
    const notifications = [
      {
        id: 1,
        type: 'payment',
        priority: 'kritik',
        title: 'Ön Ödeme Vadesi',
        message: 'BUGÜN: RMB Yapı - 15.000 TL ön ödeme vadesi!',
        date: new Date(),
        isRead: false,
        createdAt: new Date()
      },
      {
        id: 2,
        type: 'shipping',
        priority: 'yüksek',
        title: 'Sevkiyat Hazırlığı',
        message: 'YARIN: Elektrik malzemeleri yükleme günü',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isRead: false,
        createdAt: new Date()
      }
    ];

    res.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('Bildirimler hatası:', error);
    res.status(500).json({ success: false, error: 'Bildirimler getirilemedi' });
  }
});

// Bildirimi okundu işaretle
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Gerçek uygulamada veritabanında güncelleme yapılacak
    res.json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi',
      notificationId: id
    });
  } catch (error) {
    console.error('Bildirim güncelleme hatası:', error);
    res.status(500).json({ success: false, error: 'Bildirim güncellenemedi' });
  }
});

// Üretim durumu güncelle
router.patch('/production/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, productionProgress, estimatedCompletion, notes } = req.body;

    // Gerçek uygulamada veritabanında güncelleme yapılacak
    res.json({
      success: true,
      message: 'Üretim durumu güncellendi',
      orderId,
      status,
      productionProgress,
      estimatedCompletion,
      notes,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Üretim durumu güncelleme hatası:', error);
    res.status(500).json({ success: false, error: 'Üretim durumu güncellenemedi' });
  }
});

// Ön ödeme durumu güncelle
router.patch('/prepayment/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, paymentDate, paymentMethod, reference, status } = req.body;

    // Gerçek uygulamada veritabanında güncelleme yapılacak
    res.json({
      success: true,
      message: 'Ön ödeme durumu güncellendi',
      orderId,
      prepayment: {
        amount,
        paymentDate,
        paymentMethod,
        reference,
        status,
        processedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Ön ödeme güncelleme hatası:', error);
    res.status(500).json({ success: false, error: 'Ön ödeme güncellenemedi' });
  }
});

module.exports = router;
