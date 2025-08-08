const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm rotalar authentication gerektirir
router.use(authMiddleware);

// Purchase Order rotaları
router.post('/create-from-request', purchaseOrderController.createFromRequest);
router.get('/', purchaseOrderController.getAll);
router.get('/:id', purchaseOrderController.getById);
router.put('/:id', purchaseOrderController.update);
router.patch('/:id/status', purchaseOrderController.updateStatus);

module.exports = router;
