
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {

    const email = "admin@gmail.com";

    // 1. تحقق إذا موجود
    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log("Admin already exists");
      
      return mongoose.disconnect();
    }

    // 2. تشفير كلمة السر
    const hash = await bcrypt.hash("123456", 10);

    // 3. إنشاء admin
    await Admin.create({
      email,
      password: hash
    });

    console.log("Admin created");

    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
  });