const { Document, User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Multer konfigürasyonu - dosya yükleme
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', req.body.entityType);
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // İzin verilen dosya türleri
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya türü'), false);
    }
  }
});

const documentController = {
  // Dosya yükle
  uploadDocument: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Dosya yüklenmedi' });
      }

      const { entityType, entityId, documentType, description, tags } = req.body;

      // Entity varlığını kontrol et (opsiyonel - entity modellerine göre)
      // Bu kısım entity type'a göre özelleştirilebilir

      const document = await Document.create({
        entityType,
        entityId: parseInt(entityId),
        documentType,
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        description,
        tags: tags ? JSON.parse(tags) : [],
        uploadedById: req.user.id
      });

      res.status(201).json({
        message: 'Doküman başarıyla yüklendi',
        document: await Document.findByPk(document.id, {
          include: [{ model: User, as: 'uploadedBy' }]
        })
      });
    } catch (error) {
      console.error('Doküman yükleme hatası:', error);
      res.status(500).json({ error: 'Doküman yüklenirken hata oluştu' });
    }
  },

  // Entity'ye ait dokümanları listele
  getDocumentsByEntity: async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const { documentType } = req.query;

      const where = { entityType, entityId, isActive: true };
      if (documentType) where.documentType = documentType;

      const documents = await Document.findAll({
        where,
        include: [{ model: User, as: 'uploadedBy' }],
        order: [['createdAt', 'DESC']]
      });

      res.json({ documents });
    } catch (error) {
      console.error('Doküman listesi hatası:', error);
      res.status(500).json({ error: 'Doküman listesi alınamadı' });
    }
  },

  // Doküman indir
  downloadDocument: async (req, res) => {
    try {
      const document = await Document.findByPk(req.params.id);
      
      if (!document || !document.isActive) {
        return res.status(404).json({ error: 'Doküman bulunamadı' });
      }

      // Dosya varlığını kontrol et
      try {
        await fs.access(document.filePath);
      } catch {
        return res.status(404).json({ error: 'Dosya sistemde bulunamadı' });
      }

      res.download(document.filePath, document.originalFileName, (err) => {
        if (err) {
          console.error('Dosya indirme hatası:', err);
          res.status(500).json({ error: 'Dosya indirilemedi' });
        }
      });
    } catch (error) {
      console.error('Doküman indirme hatası:', error);
      res.status(500).json({ error: 'Doküman indirilemedi' });
    }
  },

  // Doküman sil (soft delete)
  deleteDocument: async (req, res) => {
    try {
      const document = await Document.findByPk(req.params.id);
      
      if (!document) {
        return res.status(404).json({ error: 'Doküman bulunamadı' });
      }

      await document.update({ isActive: false });
      
      res.json({ message: 'Doküman başarıyla silindi' });
    } catch (error) {
      console.error('Doküman silme hatası:', error);
      res.status(500).json({ error: 'Doküman silinemedi' });
    }
  },

  // Doküman detaylarını güncelle
  updateDocument: async (req, res) => {
    try {
      const { description, tags, documentType } = req.body;
      const document = await Document.findByPk(req.params.id);
      
      if (!document) {
        return res.status(404).json({ error: 'Doküman bulunamadı' });
      }

      await document.update({
        description,
        tags: tags ? JSON.parse(tags) : document.tags,
        documentType: documentType || document.documentType
      });

      res.json({
        message: 'Doküman bilgileri güncellendi',
        document: await Document.findByPk(document.id, {
          include: [{ model: User, as: 'uploadedBy' }]
        })
      });
    } catch (error) {
      console.error('Doküman güncelleme hatası:', error);
      res.status(500).json({ error: 'Doküman güncellenemedi' });
    }
  },

  // Tüm dokümanları ara
  searchDocuments: async (req, res) => {
    try {
      const { 
        search, 
        entityType, 
        documentType, 
        dateFrom, 
        dateTo, 
        page = 1, 
        limit = 20 
      } = req.query;
      
      const offset = (page - 1) * limit;
      const where = { isActive: true };

      if (entityType) where.entityType = entityType;
      if (documentType) where.documentType = documentType;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
      }

      // Text search
      if (search) {
        where[Op.or] = [
          { originalFileName: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const documents = await Document.findAndCountAll({
        where,
        include: [{ model: User, as: 'uploadedBy' }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        documents: documents.rows,
        totalCount: documents.count,
        totalPages: Math.ceil(documents.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Doküman arama hatası:', error);
      res.status(500).json({ error: 'Doküman araması yapılamadı' });
    }
  }
};

// Multer middleware'ini export et
documentController.uploadMiddleware = upload.single('document');

module.exports = documentController;
