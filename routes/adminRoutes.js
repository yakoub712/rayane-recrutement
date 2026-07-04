const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// مسار تسجيل دخول الآدمن -> POST /api/admin/login
router.post("/login", adminController.loginAdmin);

module.exports = router;