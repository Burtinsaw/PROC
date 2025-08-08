const express = require('express');
const router = express.Router();
const { Message, User, Company } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

// Auth middleware for all routes
router.use(authMiddleware);

// Multer konfigürasyonu - dosya yükleme için
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/messages';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya türü!'));
    }
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Messages API çalışıyor!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Şirket kullanıcılarını listele
router.get('/users', async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user?.id || 1);
    if (currentUser) {
      const users = await User.findAll({
        where: {
          companyId: currentUser.companyId || 1,
          id: { [Op.ne]: currentUser.id }
        },
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role'],
        include: [{
          model: Company,
          attributes: ['name']
        }]
      });
      return res.json(users);
    }
    res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı listesi yüklenemedi' });
  }
});

// Metin mesajı gönder
router.post('/send', async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user?.id || 1;
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Alıcı ve mesaj içeriği gerekli' });
    }
    const message = await Message.create({
      senderId,
      receiverId,
      content,
      messageType: 'text',
      isRead: false
    });
    res.json({ success: true, message: 'Mesaj gönderildi', messageId: message.id });
  } catch (error) {
    res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
});

// Dosya mesajı gönder
router.post('/send-file', upload.single('file'), async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user?.id || 1;
    const file = req.file;
    if (!receiverId || !file) {
      return res.status(400).json({ error: 'Alıcı ve dosya gerekli' });
    }
    const message = await Message.create({
      senderId,
      receiverId,
      content: `Dosya: ${file.originalname}`,
      messageType: 'file',
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      isRead: false
    });
    res.json({ success: true, message: 'Dosya gönderildi', messageId: message.id, fileName: file.originalname });
  } catch (error) {
    res.status(500).json({ error: 'Dosya gönderilemedi' });
  }
});

// Sohbet geçmişi
router.get('/chat/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id || 1;
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'firstName', 'lastName'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'ASC']]
    });
    await Message.update(
      { isRead: true, readAt: new Date() },
      { where: { senderId: userId, receiverId: currentUserId, isRead: false } }
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Sohbet geçmişi yüklenemedi' });
  }
});

// Okunmamış mesaj sayısı
router.get('/unread-count', async (req, res) => {
  try {
    const currentUserId = req.user?.id || 1;
    const count = await Message.count({
      where: {
        receiverId: currentUserId,
        isRead: false
      }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Okunmamış mesaj sayısı alınamadı', count: 0 });
  }
});

// Mesajı okundu olarak işaretle
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id || 1;
    const message = await Message.findOne({
      where: { id, receiverId: currentUserId }
    });
    if (!message) {
      return res.status(404).json({ error: 'Mesaj bulunamadı' });
    }
    await message.update({ isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'Mesaj okundu işaretlendi' });
  } catch (error) {
    res.status(500).json({ error: 'Mesaj okundu işaretlenemedi' });
  }
});

// Dosya indirme
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id || 1;
    const message = await Message.findOne({
      where: {
        id,
        [Op.or]: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ],
        messageType: 'file'
      }
    });
    if (!message || !message.filePath) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }
    const filePath = path.resolve(message.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Dosya sistemde bulunamadı' });
    }
    res.download(filePath, message.fileName);
  } catch (error) {
    res.status(500).json({ error: 'Dosya indirilemedi' });
  }
});

// Son sohbetler (inbox)
router.get('/inbox', async (req, res) => {
  try {
    const currentUserId = req.user?.id || 1;
    const lastMessages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'firstName', 'lastName'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    const conversations = {};
    lastMessages.forEach(message => {
      const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          user: message.senderId === currentUserId ? message.receiver : message.sender,
          lastMessage: message,
          unreadCount: 0
        };
      }
    });
    for (const userId in conversations) {
      const unreadCount = await Message.count({
        where: {
          senderId: userId,
          receiverId: currentUserId,
          isRead: false
        }
      });
      conversations[userId].unreadCount = unreadCount;
    }
    const result = Object.values(conversations);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Son sohbetler yüklenemedi' });
  }
});

module.exports = router;
