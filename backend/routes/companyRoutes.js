const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const {
  getCompanyProfile,
  updateCompanyProfile,
  updateCompanySettings,
  getCompanyStats,
} = require("../controllers/companyController");

// GET /api/company/profile — any authenticated user
router.get("/profile", auth, getCompanyProfile);

// PUT /api/company/profile — only superadmin
router.put("/profile", auth, checkRole(["superadmin"]), updateCompanyProfile);

// PUT /api/company/settings — only superadmin
router.put("/settings", auth, checkRole(["superadmin"]), updateCompanySettings);

// GET /api/company/stats — any authenticated user
router.get("/stats", auth, getCompanyStats);

module.exports = router;
