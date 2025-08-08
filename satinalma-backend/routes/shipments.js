const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm rotalar authentication gerektirir
router.use(authMiddleware);

// Shipment rotaları
router.post('/', shipmentController.create);
router.get('/', shipmentController.getAll);
router.get('/:id', shipmentController.getById);
router.patch('/:id/status', shipmentController.updateStatus);
router.get('/track/:trackingNumber', shipmentController.trackByNumber);

module.exports = router;
