const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    title: String,
    description: String,
    imageUrl: String,
    public_id: String
}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema); 