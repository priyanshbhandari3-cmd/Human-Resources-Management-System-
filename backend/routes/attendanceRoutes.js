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

// POST /api/attendance/checkin — employee, manager, admin
router.post("/checkin", auth, checkRole(["employee", "manager", "admin"]), checkIn);

// POST /api/attendance/checkout — employee, manager, admin
router.post("/checkout", auth, checkRole(["employee", "manager", "admin"]), checkOut);

// GET /api/attendance/my — employee, manager, admin
router.get("/my", auth, checkRole(["employee", "manager", "admin"]), getMyAttendance);

// GET /api/attendance/team — manager only
router.get("/team", auth, checkRole(["manager"]), getTeamAttendance);

// GET /api/attendance/all — admin and superadmin only
router.get("/all", auth, checkRole(["superadmin", "admin"]), getAllAttendance);

module.exports = router;
