const mongoose = require("mongoose");

const candidatureSchema = new mongoose.Schema({
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: "Offer", required: true }, // ربط الطلب بالوظيفة
    cvUrl: { type: String, required: true }, // رابط الـ CV المرفوع
    status: { type: String, default: "En attente" }, // حالة الطلب: En attente, Accepté, Refusé
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Candidature", candidatureSchema);