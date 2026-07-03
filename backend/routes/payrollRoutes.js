const express = require("express");
const router = express.Router();
const { generatePayroll, getMyPayroll, getAllPayroll, markAsPaid, getPayrollStats } = require("../controllers/payrollController");
const auth = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.use(auth);

router.post("/generate", checkRole(["superadmin", "admin"]), generatePayroll);
router.get("/my", checkRole(["employee", "manager", "admin", "superadmin"]), getMyPayroll);
router.get("/all", checkRole(["superadmin", "admin"]), getAllPayroll);
router.patch("/:id/pay", checkRole(["superadmin", "admin"]), markAsPaid);
router.get("/stats", checkRole(["superadmin", "admin"]), getPayrollStats);

module.exports = router;
