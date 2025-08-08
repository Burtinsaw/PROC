const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfqController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm rotalar authentication gerektirir
router.use(authMiddleware);

// RFQ rotaları
router.post('/', rfqController.create);
router.post('/create-from-request', rfqController.createFromRequest);
router.get('/', rfqController.getAll);
router.get('/:id', rfqController.getById);
router.put('/:id', rfqController.update);
router.delete('/:id', rfqController.delete);
router.patch('/:id/send', rfqController.sendToSuppliers);
router.patch('/:id/settings', rfqController.updateSettings);
router.post('/:id/send-email', rfqController.sendToSuppliersWithEmail);
router.post('/:id/send-single', rfqController.sendToSingleSupplier);
router.get('/:id/comparison', rfqController.getComparisonReport);
router.get('/:id/quotes', rfqController.getQuotesByRFQ);

// Manuel tedarikçi ve teklif ekleme
router.post('/:rfqId/suppliers', rfqController.addSupplierToRFQ);
router.post('/:rfqId/manual-quote', rfqController.addManualQuote);

module.exports = router;
