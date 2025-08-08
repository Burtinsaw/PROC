const express = require('express');
const workflowController = require('../controllers/workflowController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Tüm workflow endpoint'leri authentication gerektirir
router.use(authMiddleware);

// 1. REQUEST → PURCHASING
router.post('/create-rfq-from-request', workflowController.createRFQFromApprovedRequest);

// 2. PURCHASING → LOGISTICS 
router.post('/create-po-from-quote', workflowController.createPurchaseOrderFromQuote);

// 3. LOGISTICS → FINANCE
router.post('/create-invoice-from-delivery', workflowController.createInvoiceFromDelivery);

// 4. FINANCE Payment Processing
router.post('/process-payment', workflowController.processPayment);

// 5. Workflow Status Tracking
router.get('/status/:requestId', workflowController.getWorkflowStatus);

// 6. Dashboard Summary
router.get('/dashboard-summary', workflowController.getDashboardSummary);

module.exports = router;
