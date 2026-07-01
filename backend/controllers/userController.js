const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Role hierarchy: who can create whom
const CREATION_RULES = {
  superadmin: ["admin"],
  admin: ["manager"],
  manager: ["employee"],
};

// ---------- Create User ----------
// POST /api/users/create
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const creatorRole = req.user.role;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and role.",
      });
    }

    // Check if creator is allowed to create this role
    const allowedRoles = CREATION_RULES[creatorRole];
    if (!allowedRoles || !allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `${creatorRole} is not allowed to create ${role}.`,
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Build user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      department,
      createdBy: req.user.id,
    };

    // If creating an employee, set managerId to the creator (manager)
    if (role === "employee") {
      userData.managerId = req.user.id;
    }

    const newUser = await User.create(userData);

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: `${role} created successfully.`,
      user: userResponse,
    });
  } catch (error) {
    console.error("createUser error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while creating user.",
    });
  }
};

// ---------- Get My Team ----------
// GET /api/users/my-team
const getMyTeam = async (req, res) => {
  try {
    const { id, role } = req.user;
    let users;

    if (role === "superadmin") {
      // Superadmin sees all users
      users = await User.find().select("-password");
    } else if (role === "admin") {
      // Admin sees all managers and employees
      users = await User.find({
        role: { $in: ["manager", "employee"] },
      }).select("-password");
    } else if (role === "manager") {
      // Manager sees only employees under them
      users = await User.find({ managerId: id }).select("-password");
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("getMyTeam error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching team.",
    });
  }
};

// ---------- Get All Users ----------
// GET /api/users/all
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("getAllUsers error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
    });
  }
};

// ---------- Toggle User Status ----------
// PATCH /api/users/:id/toggle-status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent deactivating yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot toggle your own status.",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully.`,
      user,
    });
  } catch (error) {
    console.error("toggleUserStatus error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while toggling user status.",
    });
  }
};

// ---------- Delete User ----------
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent deleting superadmin
    if (user.role === "superadmin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a superadmin.",
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete yourself.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("deleteUser error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user.",
    });
  }
};

module.exports = { createUser, getMyTeam, getAllUsers, toggleUserStatus, deleteUser };
