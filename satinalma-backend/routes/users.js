// backend/routes/userRoutes.js - BASİT VERSİYON (WebAuthn YOK)
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// PUBLIC ROUTES (Authentication not required)
router.post('/register', [
  body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, userController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
  body('password').notEmpty().withMessage('Şifre gereklidir'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, userController.login);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, userController.forgotPassword);

router.post('/verify-reset-token', [
  body('token').notEmpty().withMessage('Reset token gereklidir'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, userController.verifyResetToken);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token gereklidir'),
  body('newPassword').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, userController.resetPassword);

router.get('/count', userController.getUserCount);

// PROTECTED ROUTES (Authentication required)
router.put('/change-password', authMiddleware, userController.changePassword);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

// ADMIN ROUTES
router.get('/all', authMiddleware, userController.getAllUsers);
router.put('/status/:userId', authMiddleware, userController.updateUserStatus);

module.exports = router;

