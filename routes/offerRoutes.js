const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const Offer = require("../models/Offer");
const cloudinary = require("../config/cloudinary"); // استدعاء ملف الإعدادات الخاص بكم

const Product = require("../models/Product");
// مسار إضافة عرض وظيفة جديدة -> POST /api/offers
router.post("/", upload.single("image"), async (req, res) => {
    try {
        // 1. التحقق من وجود الملف
        if (!req.file) {
            return res.status(400).json({ message: "Image required" });
        }

        console.log("Starting direct upload to Cloudinary...");

        // 2. الرفع المباشر إلى Cloudinary باستخدام الـ Buffer لتفادي الأخطاء المبهمة
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "uploads" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                // تمرير بيانات الصورة المقروءة من الذاكرة
                stream.end(req.file.buffer);
            });
        };

        // تنفيذ الرفع وانتظار النتيجة
        const cloudinaryResult = await uploadToCloudinary();
        console.log("Cloudinary Upload Success:", cloudinaryResult.secure_url);

        // 3. حفظ البيانات كاملة في MongoDB
        const offer = new Offer({
            title: req.body.title || "No Title",
            description: req.body.description || "No Description",
            imageUrl: cloudinaryResult.secure_url, // الرابط المباشر الآمن
            public_id: cloudinaryResult.public_id  // معرف الصورة للحذف لاحقاً
        });

        await offer.save();

        return res.status(201).json({
            message: "Offer created successfully",
            offer
     
        });

    } catch (error) {
        // طباعة تفاصيل الخطأ الحقيقي كاملة في الـ Terminal لفحصه
        console.error("CRITICAL ERROR:", error);
        
        return res.status(500).json({ 
            message: error.message || "Something went wrong during upload",
            error_details: error
        });
    }
});

// مسار جلب جميع العروض -> GET /api/offers
router.get("/", async (req, res) => {
    try {
        const offers = await Offer.find().sort({ createdAt: -1 });
        return res.json(offers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
/*
router.delete("/:id", async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) {
            return res.status(404).json({ message: "Offre introuvable" });
        }

        if (offer.public_id) {
            await cloudinary.uploader.destroy(offer.public_id);
        }

        await Offer.findByIdAndDelete(req.params.id);

        return res.status(200).json({ message: "L'offre a été supprimée avec succès !" });

    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({ message: "Erreur interne lors de la suppression" });
    }
});*/

// [DELETE] حذف العرض من قاعدة البيانات ومن كلووديناري
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. البحث عن العرض لجلب رابط الصورة
        const offer = await Offer.findById(id);
        if (!offer) {
            return res.status(404).json({ message: "Offre introuvable" });
        }

        // 2. حذف الصورة من Cloudinary
        if (offer.imageUrl && offer.imageUrl.includes('cloudinary.com')) {
            try {
                // استخراج الـ public_id بدقة:
                // روابط كلووديناري تكون على هيئة: .../upload/v1234567/offers/name.jpg
                const urlParts = offer.imageUrl.split('/');
                const uploadIndex = urlParts.indexOf('upload');
                
                // جلب المسار بعد كلمة 'upload' وتخطي رقم الـ version (الذي يبدأ بـ v)
                let pathParts = urlParts.slice(uploadIndex + 1);
                if (pathParts[0].startsWith('v')) {
                    pathParts = pathParts.slice(1); // تخطي الـ version
                }
                
                // دمج المسار المتبقي (مثال: offers/filename.jpg) ثم إزالة الامتداد
                const fullPathWithExt = pathParts.join('/');
                const publicId = fullPathWithExt.split('.')[0]; 

                console.log("جاري محاولة حذف الملف بالمعرّف:", publicId);

                // تنفيذ الحذف الفعلي من السحاب
                const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
                console.log("رد كلووديناري النهائي:", cloudinaryResult); 
                // إذا ظهر في الـ Terminal -> { result: 'ok' } فقد حذفت بنجاح!
                
            } catch (imgErr) {
                console.error("خطأ أثناء الاتصال بكلووديناري للحذف:", imgErr);
            }
        }

        // 3. حذف السجل من قاعدة البيانات
        await Offer.findByIdAndDelete(id);

        res.status(200).json({ message: "Offre et image supprimées مع تنظيف السحاب" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
});

/**/ 

module.exports = router;