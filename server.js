const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

// إضافات أمنية
const helmet = require("helmet"); 
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const app = express();

// =====================
// 1. إجراءات أمنية (Security Middleware)
// =====================

// حماية الـ HTTP Headers (إخفاء نوع السيرفر، حماية من XSS)
app.use(helmet());

// تقييد عدد الطلبات من نفس الـ IP (حماية من DDoS و Brute Force)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // الحد الأقصى 100 طلب لكل IP في الـ 15 دقيقة
    message: "Too many requests, please try again later."
});
app.use("/api/", limiter); 

// حماية ضد NoSQL Injection (تنظيف البيانات من رموز MongoDB الخبيثة)
app.use(mongoSanitize());

// إعداد CORS (قيدها بنطاق موقعك فقط مستقبلاً)
app.use(cors());

// تحديد حجم الطلبات (حماية من إغراق الذاكرة بطلبات ضخمة)
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// =====================
// 2. ROUTES
// =====================
const offerRoutes = require("./routes/offerRoutes");
const candidatureRoutes = require("./routes/candidatureRoutes");
const productRoutes = require('./routes/productRoutes');

app.use("/api/offers", offerRoutes);
app.use("/api/candidatures", candidatureRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));

// =====================
// 3. STATIC FILES
// =====================
app.use(express.static("public"));
app.use("/admin", express.static("admin"));

// ملاحظة: إذا انتقلت كلياً لـ Cloudinary، يمكنك حذف هذا السطر لاحقاً
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// =====================
// 4. DATABASE
// =====================
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Error:", err));

// =====================
// 5. SERVER START
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});