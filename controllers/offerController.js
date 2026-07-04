const Offer = require("../models/Offer");
const cloudinary = require("../config/cloudinary");

// =====================
// 1. UPLOAD & CREATE OFFER
// =====================
exports.createOffer = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // إنشاء عرض الوظيفة مع الحقول القادمة من الـ Form
    const offer = await Offer.create({
      title: req.body.title || "No title",
      description: req.body.description || "No description", // الحقل الذي كان ناقصاً
      imageUrl: req.file.path, // الرابط المباشر من Cloudinary
      public_id: req.file.filename, // معرف الصورة على Cloudinary
    });

    res.status(201).json({
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =====================
// 2. GET ALL OFFERS
// =====================
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// 3. DELETE OFFER
// =====================
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // الحذف من حساب Cloudinary أولاً باستخدام الـ public_id
    if (offer.public_id) {
      await cloudinary.uploader.destroy(offer.public_id);
    }

    // الحذف من قاعدة بيانات MongoDB
    await Offer.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};