const express = require('express');
const router = express.Router();
const proformaController = require('../controllers/proformaController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm route'lar authentication gerektirir
router.use(authMiddleware);

// Proforma fatura listesi
router.get('/', proformaController.getProformaInvoices);

// Para birimleri listesi
router.get('/currencies', proformaController.getCurrencies);

// Proforma fatura detayı
router.get('/:id', proformaController.getProformaInvoice);

// Teklife dayalı proforma fatura oluştur
router.post('/from-quote', proformaController.createProformaFromQuote);

// Proforma fatura güncelle
router.put('/:id', proformaController.updateProformaInvoice);

// Proforma fatura gönder
router.post('/:id/send', proformaController.sendProformaInvoice);

// Proforma fatura durumu güncelle
router.patch('/:id/status', proformaController.updateProformaStatus);

module.exports = router;
