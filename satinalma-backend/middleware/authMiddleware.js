// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

// JWT_SECRET kontrolü
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const authMiddleware = async (req, res, next) => {
  try {
    // Token'ı header'dan al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Authorization header required' 
      });
    }

    const token = authHeader.substring(7); // "Bearer " kısmını çıkar

    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ 
        success: false,
        message: 'Token is required' 
      });
    }

    // Token'ı doğrula
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token has expired' 
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token' 
        });
      }
      throw jwtError;
    }
    
    // Token'da id veya userId olabilir, ikisini de kontrol et
    const userId = decoded.id || decoded.userId;
    
    if (!userId || typeof userId !== 'number') {
      console.error('❌ Auth middleware - Invalid user ID in token:', decoded);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token payload' 
      });
    }
    
    // Kullanıcıyı veritabanından al
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] }
    });

    if (!user) {
      console.error('❌ Auth middleware - User not found, userId:', userId);
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Status kontrolü
    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    // Kullanıcı bilgilerini req'e ekle
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token süresi dolmuş' });
    }

    return res.status(500).json({ message: 'Yetkilendirme hatası' });
  }
};

module.exports = authMiddleware;

