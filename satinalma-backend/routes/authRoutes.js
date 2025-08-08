// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models'); // User model'ini import et

const router = express.Router();

// JWT Secret (production'da environment variable kullanın)
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-this';

// Login endpoint
router.post('/login', [
  body('username').notEmpty().withMessage('Kullanıcı adı gereklidir'),
  body('password').notEmpty().withMessage('Şifre gereklidir'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔐 Login attempt:', { 
      username, 
      hasPassword: typeof password === 'string', 
      passwordLength: typeof password === 'string' ? password.length : null 
    });

    // Database'den kullanıcıyı bul
    const user = await User.findOne({ 
      where: { username: username } 
    });

    console.log('👤 User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match:', isMatch ? 'YES' : 'NO');
    
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const responseData = {
      success: true,
      message: 'Giriş başarılı',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department
      }
    };

    console.log('✅ Login successful, sending response:', {
      hasToken: !!responseData.token,
      hasUser: !!responseData.user,
      userId: responseData.user.id
    });

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('🚨 Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Çıkış başarılı'
  });
});

// Profile endpoint (token gerekli)
router.get('/profile', (req, res) => {
  // Token kontrolü burada yapılacak
  res.status(200).json({
    success: true,
    data: {
      id: 1,
      username: 'admin',
      role: 'admin',
      name: 'Sistem Yöneticisi'
    }
  });
});

module.exports = router;
