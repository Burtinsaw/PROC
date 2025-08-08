'use strict';
const { Offer, Talep } = require('../models');

exports.getOffersByTalepId = async (req, res) => {
    try {
        const offers = await Offer.findAll({ where: { talepId: req.params.talepId }, order: [['createdAt', 'DESC']] });
        res.status(200).json(offers);
    } catch (error) {
        res.status(500).json({ message: "Teklifler alınamadı.", error: error.message });
    }
};

exports.addOfferToTalep = async (req, res) => {
    try {
        const { supplierName, price, currency, deliveryTime, notes } = req.body;
        if (!supplierName || !price) return res.status(400).json({ message: "Tedarikçi ve Fiyat zorunludur." });
        const newOffer = await Offer.create({ talepId: req.params.talepId, supplierName, price, currency, deliveryTime, notes });
        res.status(201).json(newOffer);
    } catch (error) {
        res.status(400).json({ message: "Teklif oluşturulamadı.", error: error.message });
    }
};

exports.selectOffer = async (req, res) => {
    try {
        const offer = await Offer.findByPk(req.params.offerId);
        if (!offer) return res.status(404).json({ message: "Teklif bulunamadı." });
        
        await Offer.update({ status: 'rejected' }, { where: { talepId: offer.talepId } });
        
        offer.status = 'selected';
        await offer.save();
        
        await Talep.update({ status: 'offer_selected' }, { where: { id: offer.talepId } });
        
        res.status(200).json({ message: "Teklif başarıyla seçildi." });
    } catch (error) {
        res.status(500).json({ message: "İşlem hatası.", error: error.message });
    }
};