const multer = require("multer");

// تخزين الملف مؤقتاً في الذاكرة لتمريره برمجياً إلى Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // حد أقصى 5 ميجا للصورة
});

module.exports = upload;