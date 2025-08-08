'use strict';
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// GET /api/companies -> Tüm firmaları listeler
router.get('/', companyController.getAllCompanies);

// POST /api/companies -> Yeni bir firma oluşturur
router.post('/', companyController.createCompany);

// PUT /api/companies/:id -> Belirli bir firmanın bilgilerini günceller
router.put('/:id', companyController.updateCompany);

// DELETE /api/companies/:id -> Belirli bir firmayı siler
router.delete('/:id', companyController.deleteCompany);

module.exports = router;
