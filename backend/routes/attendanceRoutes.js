const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
} = require("../controllers/attendanceController");

// POST /api/attendance/checkin — employee only
router.post("/checkin", auth, checkRole(["employee"]), checkIn);

// POST /api/attendance/checkout — employee only
router.post("/checkout", auth, checkRole(["employee"]), checkOut);

// GET /api/attendance/my — employee only
router.get("/my", auth, checkRole(["employee"]), getMyAttendance);

// GET /api/attendance/team — manager only
router.get("/team", auth, checkRole(["manager"]), getTeamAttendance);

// GET /api/attendance/all — admin and superadmin only
router.get("/all", auth, checkRole(["superadmin", "admin"]), getAllAttendance);

module.exports = router;
