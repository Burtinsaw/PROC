'use strict';
const { Company } = require('../models');

/**
 * Tüm firmaları veritabanından listeler.
 */
exports.getAllCompanies = async (req, res) => {
    try {
        const { type } = req.query;
        
        let whereClause = {};
        if (type) {
            whereClause.type = type;
        }
        
        const companies = await Company.findAll({ 
            where: whereClause,
            order: [['name', 'ASC']] 
        });
        
        console.log(`📊 ${companies.length} firma listelendi${type ? ` (type: ${type})` : ''}`);
        res.status(200).json(companies);
        
    } catch (error) {
        console.error("Firmalar alınamadı:", error);
        
        // Eğer type kolonu yoksa, filtering olmadan dene
        if (error.message && error.message.includes('no such column: type')) {
            console.log('⚠️ Type kolonu bulunamadı, filtering olmadan tüm firmalar döndürülüyor');
            try {
                const companies = await Company.findAll({ 
                    order: [['name', 'ASC']] 
                });
                return res.status(200).json(companies);
            } catch (fallbackError) {
                console.error("Fallback sorgu da başarısız:", fallbackError);
                return res.status(500).json({ 
                    message: "Firmalar alınamadı.", 
                    error: fallbackError.message 
                });
            }
        }
        
        res.status(500).json({ message: "Firmalar alınamadı.", error: error.message });
    }
};

/**
 * Yeni bir firma oluşturur ve veritabanına kaydeder.
 */
exports.createCompany = async (req, res) => {
    try {
        const newCompany = await Company.create(req.body);
        res.status(201).json(newCompany);
    } catch (error) {
        console.error("Firma oluşturma hatası:", error);
        res.status(400).json({ message: "Firma oluşturulamadı.", error: error.message });
    }
};

/**
 * Bir firmanın bilgilerini günceller.
 */
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    // Mevcut şirketi bul
    const existing = await Company.findByPk(id);
    if (!existing) {
      return res.status(404).json({ message: "Firma bulunamadı." });
    }
    // Gelen verileri kopyala
    const updateData = { ...req.body };
    // Eğer code alanı gönderilmemişse veya boşsa, mevcut kodu koru
    if (!updateData.code || updateData.code.trim() === '') {
      delete updateData.code; // DB'de değiştirmeme için kaldır
    }
    // Güncelleme işlemini yap
    const [updated] = await Company.update(updateData, {
      where: { id }
    });
    if (updated) {
      const updatedCompany = await Company.findByPk(id);
      return res.status(200).json(updatedCompany);
    }
    res.status(400).json({ message: "Güncelleme başarısız." });
  } catch (error) {
    console.error("Firma güncellenirken hata:", error);
    // Özel hata mesajı
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: "Bu firma kodu zaten kullanılıyor. Lütfen farklı bir kod girin."
      });
    }
    res.status(500).json({
      message: "Firma güncellenemedi.",
      error: error.message
    });
  }
};

/**
 * Bir firmayı veritabanından siler.
 */
exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Company.destroy({
            where: { id: id }
        });

        if (deleted) {
            return res.status(204).send("Firma başarıyla silindi.");
        }
        
        throw new Error("Firma bulunamadı.");
    } catch (error) {
        res.status(500).json({ message: "Firma silinemedi.", error: error.message });
    }
};
