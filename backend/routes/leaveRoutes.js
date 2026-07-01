const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  reviewLeave,
  getAllLeaves,
} = require("../controllers/leaveController");

// POST /api/leave/apply — employee only
router.post("/apply", auth, checkRole(["employee"]), applyLeave);

// GET /api/leave/my — employee only
router.get("/my", auth, checkRole(["employee"]), getMyLeaves);

// GET /api/leave/pending — manager only
router.get("/pending", auth, checkRole(["manager"]), getPendingLeaves);

// PATCH /api/leave/:id/review — manager only
router.patch("/:id/review", auth, checkRole(["manager"]), reviewLeave);

// GET /api/leave/all — admin and superadmin only
router.get("/all", auth, checkRole(["superadmin", "admin"]), getAllLeaves);

module.exports = router;
