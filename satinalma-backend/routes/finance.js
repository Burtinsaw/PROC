const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm rotalar authentication gerektirir
router.use(authMiddleware);

// Invoice rotaları
router.post('/invoices', financeController.createInvoice);
router.get('/invoices', financeController.getAllInvoices);
router.get('/invoices/:id', financeController.getInvoiceById);

// Payment rotaları
router.post('/payments', financeController.createPayment);

// Dashboard
router.get('/dashboard', financeController.getDashboard);

module.exports = router;
