'use strict';
const express = require('express');
const router = express.Router();
const talepController = require('../controllers/talepController');

// POST /api/talepler -> Yeni talep oluşturur
router.post('/', talepController.createTalep);

// GET /api/talepler -> Tüm talepleri listeler
router.get('/', talepController.getAllTalepler);

// GET /api/talepler/companies -> Tüm firmaları/müşterileri listeler (YENİ ROUTE)
router.get('/companies', talepController.getAllCompanies);

// GET /api/talepler/123 -> 123 ID'li talebin detayını getirir
router.get('/:id', talepController.getTalepById);

// PUT /api/talepler/123/status -> 123 ID'li talebin durumunu günceller
router.put('/:id/status', talepController.updateTalepStatus);

// PUT /api/talepler/123/products -> 123 ID'li talebin ürünlerini günceller
router.put('/:id/products', talepController.updateRequestProducts);

// DELETE /api/talepler/123 -> 123 ID'li talebi siler
router.delete('/:id', talepController.deleteTalep);

// POST /api/talepler/bulk-approve -> Toplu onaylama
router.post('/bulk-approve', talepController.bulkApprove);

// POST /api/talepler/bulk-reject -> Toplu reddetme
router.post('/bulk-reject', talepController.bulkReject);

// POST /api/talepler/bulk-delete -> Toplu silme
router.post('/bulk-delete', talepController.bulkDelete);

module.exports = router;
