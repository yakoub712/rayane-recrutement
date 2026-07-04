const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

// 1. تهيئة Cloudinary (استبدل القيم ببياناتك الحقيقية من لوحة تحكم Cloudinary)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // ضع الـ Cloud Name الخاص بك هنا
    api_key: process.env.CLOUDINARY_API_KEY,       // ضع الـ API Key الخاص بك هنا
    api_secret: process.env.CLOUDINARY_API_SECRET  // ضع الـ API Secret الخاص بك هنا
});

// 2. إعداد التخزين السحابي
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'RAYANE_TAPIS_CV',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    },
});
const upload = multer({ storage: storage });

// تعريف الـ Schema (داخل ملف الـ Route للاختصار، يفضل نقله لملف models)
const CandidatureSchema = new mongoose.Schema({
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    jobTitle: { type: String, required: true },
    cvUrl: { type: String, required: true }, // سيحفظ رابط Cloudinary هنا
    status: { type: String, default: 'En attente' },
    createdAt: { type: Date, default: Date.now }
});

const Candidature = mongoose.models.Candidature || mongoose.model('Candidature', CandidatureSchema);

// 3. مسار استقبال طلب توظيف جديد [POST]
router.post('/', upload.single('cvImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Veuillez télécharger votre CV." });

        // req.file.path يحتوي على الرابط السحابي القادم من Cloudinary
        const newCandidature = new Candidature({
            candidateName: req.body.name,
            candidateEmail: req.body.email,
            jobTitle: req.body.jobTitle,
            cvUrl: req.file.path 
        });

        await newCandidature.save();
        return res.status(201).json({ message: "Candidature envoyée avec succès !", cvUrl: req.file.path });
    } catch (error) {
        console.error("Erreur d'upload:", error);
        return res.status(500).json({ error: "Erreur serveur lors de l'envoi." });
    }
});

// 4. جلب كافة الطلبات للداشبورد [GET]
router.get('/', async (req, res) => {
    try {
        const list = await Candidature.find().sort({ createdAt: -1 });
        return res.json(list);
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la récupération." });
    }
});

// 5. تحديث حالة الطلب [PATCH]
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Candidature.findByIdAndUpdate(req.params.id, { status }, { new: true });
        return res.json(updated);
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la mise à jour." });
    }
});

// 6. الحذف [DELETE]
router.delete('/:id', async (req, res) => {
    try {
        await Candidature.findByIdAndDelete(req.params.id);
        return res.json({ message: "Supprimé avec succès." });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la suppression." });
    }
});

module.exports = router;