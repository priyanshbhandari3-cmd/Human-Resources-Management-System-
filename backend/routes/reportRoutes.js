const express = require("express");
const router = express.Router();
const { getAttendanceReport, getLeaveReport, getPayrollReport, getDashboardStats } = require("../controllers/reportController");
const auth = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.use(auth);

router.get("/attendance", checkRole(["superadmin", "admin"]), getAttendanceReport);
router.get("/leave", checkRole(["superadmin", "admin"]), getLeaveReport);
router.get("/payroll", checkRole(["superadmin", "admin"]), getPayrollReport);
router.get("/dashboard", getDashboardStats);

module.exports = router;
