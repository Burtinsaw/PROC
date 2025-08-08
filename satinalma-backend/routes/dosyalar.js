// routes/dosyalar.js
const express = require('express');
const router = express.Router();
const { TalepDosya, Talep } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Middleware - Authentication kontrolü
const authenticateToken = require('../middleware/authMiddleware');

// ===========================
// DOSYA CRUD İŞLEMLERİ
// ===========================

// 📋 Talebe ait dosyaları listele
router.get('/talep/:talepId', authenticateToken, async (req, res) => {
  try {
    const { talepId } = req.params;
    const { sortBy = 'siraNo', sortOrder = 'ASC' } = req.query;

    // Talep var mı kontrol et
    const talep = await Talep.findByPk(talepId);
    if (!talep) {
      return res.status(404).json({
        success: false,
        message: 'Talep bulunamadı'
      });
    }

    const dosyalar = await TalepDosya.findAll({
      where: { talepId },
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [
        {
          model: Talep,
          as: 'talep',
          attributes: ['id', 'talepNo', 'talepBasligi', 'durum']
        }
      ]
    });

    res.json({
      success: true,
      data: dosyalar,
      count: dosyalar.length
    });

  } catch (error) {
    console.error('Dosya listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya listesi alınırken hata oluştu',
      error: error.message
    });
  }
});

// 📄 Dosya detayı getir
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const dosya = await TalepDosya.findByPk(id, {
      include: [
        {
          model: Talep,
          as: 'talep',
          attributes: ['id', 'talepNo', 'talepBasligi', 'durum', 'firma']
        }
      ]
    });

    if (!dosya) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı'
      });
    }

    res.json({
      success: true,
      data: dosya
    });

  } catch (error) {
    console.error('Dosya detay hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya detayı alınırken hata oluştu',
      error: error.message
    });
  }
});

// ➕ Talebe dosya bilgisi ekle (dosya yükleme sonrası)
router.post('/talep/:talepId', authenticateToken, async (req, res) => {
  try {
    const { talepId } = req.params;
    const {
      dosyaAdi,
      dosyaYolu,
      dosyaTipi,
      dosyaBoyutu,
      kategori = 'genel',
      aciklama,
      ocrMetni,
      ceviriMetni,
      tespitEdilenDil,
      aiAnalizi,
      guvenilirlikSkoru,
      azureUrl,
      yandexUrl,
      etiketler
    } = req.body;

    // Talep var mı kontrol et
    const talep = await Talep.findByPk(talepId);
    if (!talep) {
      return res.status(404).json({
        success: false,
        message: 'Talep bulunamadı'
      });
    }

    // Sıra numarası hesapla
    const sonSiraNo = await TalepDosya.max('siraNo', { where: { talepId } }) || 0;
    const siraNo = sonSiraNo + 1;

    // Yeni dosya kaydı oluştur
    const yeniDosya = await TalepDosya.create({
      talepId,
      dosyaAdi,
      dosyaYolu,
      dosyaTipi,
      dosyaBoyutu,
      kategori,
      aciklama,
      ocrMetni,
      ceviriMetni,
      tespitEdilenDil,
      aiAnalizi,
      guvenilirlikSkoru,
      azureUrl,
      yandexUrl,
      etiketler,
      siraNo,
      ocrIslendi: !!ocrMetni,
      ceviriIslendi: !!ceviriMetni,
      aiIslendi: !!aiAnalizi
    });

    // Oluşturulan dosyayı ilişkilerle birlikte getir
    const dosyaDetay = await TalepDosya.findByPk(yeniDosya.id, {
      include: [
        {
          model: Talep,
          as: 'talep',
          attributes: ['id', 'talepNo', 'talepBasligi']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Dosya bilgisi başarıyla eklendi',
      data: dosyaDetay
    });

  } catch (error) {
    console.error('Dosya bilgisi ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya bilgisi eklenirken hata oluştu',
      error: error.message
    });
  }
});

// ✏️ Dosya bilgilerini güncelle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Dosya var mı kontrol et
    const dosya = await TalepDosya.findByPk(id);
    if (!dosya) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı'
      });
    }

    // Güncelleme yapılabilir alanları filtrele
    const allowedFields = [
      'dosyaAdi', 'kategori', 'aciklama', 'ocrMetni', 'ceviriMetni',
      'tespitEdilenDil', 'aiAnalizi', 'guvenilirlikSkoru',
      'azureUrl', 'yandexUrl', 'etiketler', 'durum'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // İşlem durumlarını güncelle
    if (filteredData.ocrMetni) filteredData.ocrIslendi = true;
    if (filteredData.ceviriMetni) filteredData.ceviriIslendi = true;
    if (filteredData.aiAnalizi) filteredData.aiIslendi = true;

    // Güncelle
    await dosya.update(filteredData);

    // Güncellenmiş dosyayı getir
    const guncellenmisDosy = await TalepDosya.findByPk(id, {
      include: [
        {
          model: Talep,
          as: 'talep',
          attributes: ['id', 'talepNo', 'talepBasligi']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Dosya bilgileri başarıyla güncellendi',
      data: guncellenmisDosy
    });

  } catch (error) {
    console.error('Dosya güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// 🗑️ Dosya sil (hem kayıt hem fiziksel dosya)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fizikselSil = false } = req.query;

    const dosya = await TalepDosya.findByPk(id);
    if (!dosya) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı'
      });
    }

    const talepId = dosya.talepId;
    const silinenSiraNo = dosya.siraNo;
    const dosyaYolu = dosya.dosyaYolu;

    // Fiziksel dosyayı sil (istenirse)
    if (fizikselSil && dosyaYolu && fs.existsSync(dosyaYolu)) {
      try {
        fs.unlinkSync(dosyaYolu);
        console.log(`Fiziksel dosya silindi: ${dosyaYolu}`);
      } catch (fsError) {
        console.error('Fiziksel dosya silme hatası:', fsError);
        // Fiziksel dosya silinemese bile kayıt silinebilir
      }
    }

    // Veritabanı kaydını sil
    await dosya.destroy();

    // Sonraki dosyaların sıra numaralarını güncelle
    await TalepDosya.update(
      { siraNo: require('sequelize').literal('siraNo - 1') },
      { 
        where: { 
          talepId,
          siraNo: { [Op.gt]: silinenSiraNo }
        }
      }
    );

    res.json({
      success: true,
      message: 'Dosya başarıyla silindi',
      fizikselSilindi: fizikselSil
    });

  } catch (error) {
    console.error('Dosya silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya silinirken hata oluştu',
      error: error.message
    });
  }
});

// 🔄 OCR işlemi başlat/güncelle
router.patch('/:id/ocr', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      ocrMetni, 
      tespitEdilenDil, 
      guvenilirlikSkoru,
      ocrServisi = 'google_vision',
      islemSuresi 
    } = req.body;

    const dosya = await TalepDosya.findByPk(id);
    if (!dosya) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı'
      });
    }

    const updateData = {
      ocrMetni,
      tespitEdilenDil,
      guvenilirlikSkoru,
      ocrServisi,
      ocrIslendi: true,
      ocrTarihi: new Date()
    };

    if (islemSuresi) updateData.ocrSuresi = islemSuresi;

    await dosya.update(updateData);

    res.json({
      success: true,
      message: 'OCR işlemi başarıyla güncellendi',
      data: {
        id,
        ocrIslendi: true,
        tespitEdilenDil,
        guvenilirlikSkoru
      }
    });

  } catch (error) {
    console.error('OCR güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'OCR işlemi güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// 🌍 Çeviri işlemi başlat/güncelle
router.patch('/:id/ceviri', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      ceviriMetni, 
      hedefDil = 'tr',
      ceviriServisi = 'gemini',
      islemSuresi 
    } = req.body;

    const dosya = await TalepDosya.findByPk(id);
    if (!dosya) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı'
      });
    }

    const updateData = {
      ceviriMetni,
      hedefDil,
      ceviriServisi,
      ceviriIslendi: true,
      ceviriTarihi: new Date()
    };

    if (islemSuresi) updateData.ceviriSuresi = islemSuresi;

    await dosya.update(updateData);

    res.json({
      success: true,
      message: 'Çeviri işlemi başarıyla güncellendi',
      data: {
        id,
        ceviriIslendi: true,
        hedefDil
      }
    });

  } catch (error) {
    console.error('Çeviri güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Çeviri işlemi güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// 🤖 AI analizi başlat/güncelle
router.patch('/:id/ai-analiz', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      aiAnalizi, 
      tespitEdilenUrunler,
      aiServisi = 'gemini',
      islemSuresi 
    } = req.body;

    const dosya = await TalepDosya.findByPk(id);
    if (!dosya) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı'
      });
    }

    const updateData = {
      aiAnalizi,
      tespitEdilenUrunler,
      aiServisi,
      aiIslendi: true,
      aiTarihi: new Date()
    };

    if (islemSuresi) updateData.aiSuresi = islemSuresi;

    await dosya.update(updateData);

    res.json({
      success: true,
      message: 'AI analizi başarıyla güncellendi',
      data: {
        id,
        aiIslendi: true,
        tespitEdilenUrunSayisi: tespitEdilenUrunler ? tespitEdilenUrunler.length : 0
      }
    });

  } catch (error) {
    console.error('AI analiz güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'AI analizi güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// 📊 Dosya işleme istatistikleri
router.get('/stats/islem', authenticateToken, async (req, res) => {
  try {
    const { talepId, tarihBaslangic, tarihBitis } = req.query;

    const whereClause = {};
    if (talepId) whereClause.talepId = talepId;
    if (tarihBaslangic && tarihBitis) {
      whereClause.createdAt = {
        [Op.between]: [new Date(tarihBaslangic), new Date(tarihBitis)]
      };
    }

    // Toplam dosya sayıları
    const toplamDosya = await TalepDosya.count({ where: whereClause });
    const ocrIslenen = await TalepDosya.count({ 
      where: { ...whereClause, ocrIslendi: true }
    });
    const ceviriIslenen = await TalepDosya.count({ 
      where: { ...whereClause, ceviriIslendi: true }
    });
    const aiIslenen = await TalepDosya.count({ 
      where: { ...whereClause, aiIslendi: true }
    });

    // Dosya tipi bazında sayılar
    const tipStats = await TalepDosya.findAll({
      where: whereClause,
      attributes: [
        'dosyaTipi',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'sayi']
      ],
      group: ['dosyaTipi']
    });

    // Kategori bazında sayılar
    const kategoriStats = await TalepDosya.findAll({
      where: whereClause,
      attributes: [
        'kategori',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'sayi']
      ],
      group: ['kategori']
    });

    res.json({
      success: true,
      data: {
        toplamDosya,
        islemIstatistikleri: {
          ocrIslenen,
          ceviriIslenen,
          aiIslenen,
          ocrOrani: toplamDosya > 0 ? Math.round((ocrIslenen / toplamDosya) * 100) : 0,
          ceviriOrani: toplamDosya > 0 ? Math.round((ceviriIslenen / toplamDosya) * 100) : 0,
          aiOrani: toplamDosya > 0 ? Math.round((aiIslenen / toplamDosya) * 100) : 0
        },
        tipStats: tipStats.map(item => ({
          tip: item.dosyaTipi,
          sayi: parseInt(item.dataValues.sayi)
        })),
        kategoriStats: kategoriStats.map(item => ({
          kategori: item.kategori,
          sayi: parseInt(item.dataValues.sayi)
        }))
      }
    });

  } catch (error) {
    console.error('Dosya istatistik hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya istatistikleri alınırken hata oluştu',
      error: error.message
    });
  }
});

// 🔍 Dosya arama
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const {
      q, // arama terimi
      kategori,
      dosyaTipi,
      ocrIslendi,
      ceviriIslendi,
      aiIslendi,
      tespitEdilenDil,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = {};

    // Arama terimi
    if (q) {
      whereClause[Op.or] = [
        { dosyaAdi: { [Op.iLike]: `%${q}%` } },
        { aciklama: { [Op.iLike]: `%${q}%` } },
        { ocrMetni: { [Op.iLike]: `%${q}%` } },
        { ceviriMetni: { [Op.iLike]: `%${q}%` } },
        { etiketler: { [Op.iLike]: `%${q}%` } }
      ];
    }

    // Filtreler
    if (kategori) whereClause.kategori = kategori;
    if (dosyaTipi) whereClause.dosyaTipi = dosyaTipi;
    if (tespitEdilenDil) whereClause.tespitEdilenDil = tespitEdilenDil;
    if (ocrIslendi !== undefined) whereClause.ocrIslendi = ocrIslendi === 'true';
    if (ceviriIslendi !== undefined) whereClause.ceviriIslendi = ceviriIslendi === 'true';
    if (aiIslendi !== undefined) whereClause.aiIslendi = aiIslendi === 'true';

    // Sayfalama
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await TalepDosya.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Talep,
          as: 'talep',
          attributes: ['id', 'talepNo', 'talepBasligi', 'firma', 'durum']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Dosya arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya arama işleminde hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;

