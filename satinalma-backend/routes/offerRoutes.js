'use strict';
const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');

// GET /api/offers/talep/123 -> 123 ID'li talebe ait teklifleri getirir
router.get('/talep/:talepId', offerController.getOffersByTalepId);

// POST /api/offers/talep/123 -> 123 ID'li talebe yeni teklif ekler
router.post('/talep/:talepId', offerController.addOfferToTalep);

// PUT /api/offers/select/45 -> 45 ID'li teklifi seçilmiş olarak işaretler
router.put('/select/:offerId', offerController.selectOffer);

module.exports = router;
