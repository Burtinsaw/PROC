const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm rotalar authentication gerektirir
router.use(authMiddleware);

// Quote rotaları
router.post('/', quoteController.create);
router.get('/rfq/:rfqId', quoteController.getByRFQ);
router.get('/:id', quoteController.getById);
router.put('/:id', quoteController.update);
router.patch('/:id/evaluate', quoteController.evaluate);
router.patch('/:id/select', quoteController.select);
router.post('/:id/evaluate', quoteController.evaluateQuote);
router.post('/:id/select', quoteController.selectQuote);

module.exports = router;
