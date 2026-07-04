const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();

// =====================
// 1. MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// =====================
// 2. ROUTES
// =====================
const offerRoutes = require("./routes/offerRoutes");
app.use("/api/offers", offerRoutes);
const candidatureRoutes = require("./routes/candidatureRoutes");
app.use("/api/candidatures", candidatureRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));

const productRoutes = require('./routes/productRoutes');

// 2. ابحث عن السطر الخاص بـ offers وقم بإضافة هذا السطر تحته:
app.use('/api/offers', offerRoutes); 
app.use('/api/products', productRoutes);

// =====================
// 3. STATIC FILES
// =====================
app.use(express.static("public"));
app.use("/admin", express.static("admin"));
// 👈 السطر الجديد المطلوب لعرض صور الـ CV في الداشبورد بنجاح
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// =====================
// 4. PAGES
// =====================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin", "login.html"));
});

// =====================
// 5. DATABASE
// =====================
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.error("MongoDB Error:", err);
});



// ❌ تم حذف دالة /api/applications القديمة المسببة للمشاكل هنا لأن العمل سينتقل لملف Routes المخصص لها

// =====================
// 6. SERVER START
// =====================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});