'use strict';
const { Talep, TalepUrun, Company, User, sequelize } = require('../models');

exports.createTalep = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { products, ...talepData } = req.body;

        // Akıllı Firma Yönetimi:
        // Gelen firma adıyla bir müşteri arar, eğer yoksa 'customer' tipinde yeni bir tane oluşturur.
        // Bu yapı, 'code' kolonunun NULL olmasına izin verildiği ve 'type' kolonunun eklendiği
        // veritabanı migration'ı ile uyumlu çalışır.
        const [company] = await Company.findOrCreate({
            where: { name: talepData.externalCompanyName },
            defaults: {
                type: 'customer' // Yeni oluşturulan firmalar otomatik olarak müşteri olur
            },
            transaction
        });

        // User kontrolü
        const userId = talepData.internalRequester.id || 1;
        const userExists = await sequelize.models.User.findByPk(userId);
        if (!userExists) {
            await transaction.rollback();
            return res.status(400).json({ message: `Kullanıcı (userId: ${userId}) bulunamadı. Lütfen geçerli bir kullanıcı ile giriş yapın.` });
        }

        const mappedTalepData = {
            talepNo: talepData.customTalepId,
            talepBasligi: talepData.title,
            aciklama: talepData.description,
            firma: company.name,
            talepSahibiAd: talepData.externalRequesterName,
            isEmriAcanDepartman: talepData.internalRequester.department,
            userId,
            durum: 'Onay Bekliyor',
            oncelik: 'orta'
        };

        const newTalep = await Talep.create(mappedTalepData, { transaction });

        if (products && products.length > 0) {
            const productPayload = products.map(p => ({
                urunAdi: p.name,
                miktar: p.quantity,
                birim: p.unit,
                marka: p.brand,
                model: p.articleNumber,
                talepId: newTalep.id
            }));
            await TalepUrun.bulkCreate(productPayload, { transaction });
        }

        await transaction.commit();
        res.status(201).json(newTalep);
    } catch (error) {
        await transaction.rollback();
        console.error("Talep oluşturma hatası:", error);
        res.status(500).json({ message: "Talep oluşturulamadı.", error: error.message });
    }
};


exports.getAllCompanies = async (req, res) => {
    try {
        // Sadece müşteri ve tedarikçileri listelemek için filtreleme
        const companies = await Company.findAll({
            where: {
                type: ['customer', 'supplier']
            },
            order: [['name', 'ASC']]
        });
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: "Firmalar alınamadı.", error: error.message });
    }
};

// ... Mevcut diğer controller fonksiyonlarınız (getAllTalepler, getTalepById vb.) ...
exports.getAllTalepler = async (req, res) => {
    try {
        const { durum } = req.query;
        const whereClause = durum ? { durum: durum } : {};
        
        const talepler = await Talep.findAll({
            where: whereClause,
            include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }],
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json(talepler);
    } catch (error) {
        console.error("Talepler alınırken hata:", error);
        res.status(500).json({ message: "Talepler alınamadı.", error: error.message });
    }
};

exports.getTalepById = async (req, res) => {
    try {
        const talep = await Talep.findByPk(req.params.id, {
            include: [
                { model: TalepUrun, as: 'urunler' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'department'] }
            ]
        });
        if (!talep) return res.status(404).json({ message: "Talep bulunamadı." });
        res.status(200).json(talep);
    } catch (error) {
        console.error("Talep detayı alınırken hata:", error);
        res.status(500).json({ message: "Talep detayı alınamadı.", error: error.message });
    }
};

exports.updateTalepStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const [updated] = await Talep.update({ durum: status }, { where: { id: req.params.id } });
        if (updated) {
            const updatedTalep = await Talep.findByPk(req.params.id);
            return res.status(200).json(updatedTalep);
        }
        throw new Error('Talep bulunamadı veya güncelleme başarısız.');
    } catch (error) {
        console.error("Talep durumu güncellenirken hata:", error);
        res.status(500).json({ message: "Talep durumu güncellenemedi.", error: error.message });
    }
};

exports.updateRequestProducts = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { products } = req.body;
        const { id: talepId } = req.params;

        // Mevcut ürünleri sil
        await TalepUrun.destroy({ where: { talepId }, transaction });

        // Yeni ürünleri ekle
        const productPayload = products.map(p => ({
            urunAdi: p.name,
            miktar: p.quantity,
            birim: p.unit,
            marka: p.brand,
            model: p.articleNumber,
            talepId
        }));
        await TalepUrun.bulkCreate(productPayload, { transaction });

        await transaction.commit();
        res.status(200).json({ message: 'Ürünler başarıyla güncellendi.' });
    } catch (error) {
        await transaction.rollback();
        console.error("Ürünler güncellenirken hata:", error);
        res.status(500).json({ message: "Ürünler güncellenemedi.", error: error.message });
    }
};

// Talep silme fonksiyonu
exports.deleteTalep = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        
        // Önce talep ürünlerini sil
        await TalepUrun.destroy({ where: { talepId: id }, transaction });
        
        // Sonra talebi sil
        const deleted = await Talep.destroy({ where: { id }, transaction });
        
        if (deleted) {
            await transaction.commit();
            res.status(200).json({ message: 'Talep başarıyla silindi.' });
        } else {
            await transaction.rollback();
            res.status(404).json({ message: 'Talep bulunamadı.' });
        }
    } catch (error) {
        await transaction.rollback();
        console.error("Talep silinirken hata:", error);
        res.status(500).json({ message: "Talep silinemedi.", error: error.message });
    }
};

// Toplu onaylama
exports.bulkApprove = async (req, res) => {
    try {
        const { requestIds } = req.body;
        await Talep.update(
            { durum: 'Onaylandı' },
            { where: { id: requestIds } }
        );
        res.status(200).json({ message: `${requestIds.length} talep onaylandı.` });
    } catch (error) {
        console.error("Toplu onaylama hatası:", error);
        res.status(500).json({ message: "Toplu onaylama işlemi başarısız.", error: error.message });
    }
};

// Toplu reddetme
exports.bulkReject = async (req, res) => {
    try {
        const { requestIds } = req.body;
        await Talep.update(
            { durum: 'Reddedildi' },
            { where: { id: requestIds } }
        );
        res.status(200).json({ message: `${requestIds.length} talep reddedildi.` });
    } catch (error) {
        console.error("Toplu reddetme hatası:", error);
        res.status(500).json({ message: "Toplu reddetme işlemi başarısız.", error: error.message });
    }
};

// Toplu silme
exports.bulkDelete = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { requestIds } = req.body;
        
        // Önce talep ürünlerini sil
        await TalepUrun.destroy({ where: { talepId: requestIds }, transaction });
        
        // Sonra talepleri sil
        const deleted = await Talep.destroy({ where: { id: requestIds }, transaction });
        
        await transaction.commit();
        res.status(200).json({ message: `${deleted} talep silindi.` });
    } catch (error) {
        await transaction.rollback();
        console.error("Toplu silme hatası:", error);
        res.status(500).json({ message: "Toplu silme işlemi başarısız.", error: error.message });
    }
};
