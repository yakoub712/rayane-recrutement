const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require('../models/Product');

// إعداد التخزين السحابي المستقل للمنتجات
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'products', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});

const upload = multer({ storage: storage });

// [GET] جلب جميع المنتجات
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération" });
    }
});

// [POST] إضافة منتج جديد
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title } = req.body;
        const imageUrl = req.file ? (req.file.path || req.file.secure_url) : '';

        if (!title || !imageUrl) {
            return res.status(400).json({ message: "Champs requis manquants" });
        }

        const newProduct = new Product({ title, imageUrl });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'ajout" });
    }
});

// [DELETE] حذف المنتج نهائياً من قاعدة البيانات ومن Cloudinary
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Produit introuvable" });
        }

        if (product.imageUrl && product.imageUrl.includes('cloudinary.com')) {
            try {
                const urlParts = product.imageUrl.split('/');
                const uploadIndex = urlParts.indexOf('upload');
                let pathParts = urlParts.slice(uploadIndex + 1);
                if (pathParts[0].startsWith('v')) {
                    pathParts = pathParts.slice(1);
                }
                const publicId = pathParts.join('/').split('.')[0];
                
                await cloudinary.uploader.destroy(publicId);
                console.log("Image produit supprimée de Cloudinary:", publicId);
            } catch (imgErr) {
                console.error("Erreur Cloudinary:", imgErr);
            }
        }

        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: "Produit et image supprimés" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
});

module.exports = router;