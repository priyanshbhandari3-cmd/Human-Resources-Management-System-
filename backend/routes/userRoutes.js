const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const {
  createUser,
  getMyTeam,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/userController");

// POST /api/users/create — superadmin, admin, manager can create (hierarchy enforced in controller)
router.post(
  "/create",
  auth,
  checkRole(["superadmin", "admin", "manager"]),
  createUser
);

// GET /api/users/my-team — superadmin, admin, manager can view their team
router.get(
  "/my-team",
  auth,
  checkRole(["superadmin", "admin", "manager"]),
  getMyTeam
);

// GET /api/users/all — only superadmin and admin
router.get(
  "/all",
  auth,
  checkRole(["superadmin", "admin"]),
  getAllUsers
);

// PATCH /api/users/:id/toggle-status — only superadmin and admin
router.patch(
  "/:id/toggle-status",
  auth,
  checkRole(["superadmin", "admin"]),
  toggleUserStatus
);

// DELETE /api/users/:id — only superadmin and admin
router.delete(
  "/:id",
  auth,
  checkRole(["superadmin", "admin"]),
  deleteUser
);

module.exports = router;
