const express = require("express");
const router = express.Router();
const { registerSuperAdmin, login } = require("../controllers/authController");

// POST /api/auth/register-superadmin 
router.post("/register-superadmin", registerSuperAdmin);

// POST /api/auth/login
router.post("/login", login);

module.exports = router;
