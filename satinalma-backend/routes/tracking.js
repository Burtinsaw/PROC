const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm tracking route'ları authentication gerektiriyor
router.use(authMiddleware);

// ID Takip Sistemi Routes

/**
 * POST /api/tracking/update-id
 * Proforma onaylandığında tracking ID'yi güncelle
 */
router.post('/update-id', trackingController.updateTrackingId);

/**
 * GET /api/tracking/history/:trackingId
 * Tracking geçmişini getir (Talep ID veya Proforma ID ile)
 */
router.get('/history/:trackingId', trackingController.getTrackingHistory);

/**
 * GET /api/tracking/current/:originalRequestId
 * Mevcut aktif tracking ID'yi getir
 */
router.get('/current/:originalRequestId', trackingController.getCurrentTrackingId);

module.exports = router;
