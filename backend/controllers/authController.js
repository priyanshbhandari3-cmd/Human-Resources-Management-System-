const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");

// ────────────── Register Super Admin ──────────────
const registerSuperAdmin = async (req, res) => {
  try {
    const { companyName, companyEmail, companyPhone, name, email, password } = req.body;

    // Validate required fields
    if (!companyName || !companyEmail || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide companyName, companyEmail, name, email and password",
      });
    }

    // Check if a company with this email already exists
    const existingCompany = await Company.findOne({ email: companyEmail });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "A company with this email already exists. Please login instead.",
      });
    }

    // Create Company document first
    const company = await Company.create({
      name: companyName,
      email: companyEmail,
      phone: companyPhone || "",
    });

    // Check if user email already exists within this company
    const existingUser = await User.findOne({ email, companyId: company._id });
    if (existingUser) {
      // Rollback company creation
      await Company.findByIdAndDelete(company._id);
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists in this company.",
      });
    }

    // Hash password in controller (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create superadmin user linked to the company
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "superadmin",
      companyId: company._id,
    });

    // Generate JWT (includes companyId for multi-tenancy)
    const token = jwt.sign(
      { id: user._id, role: user.role, companyId: company._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return response without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      token,
      user: userResponse,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        plan: company.plan,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ────────────── Login ──────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    // Find user by email — explicitly select password (excluded by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user's company is active
    const company = await Company.findById(user.companyId);
    if (!company || !company.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your company account is inactive. Please contact support.",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT (includes companyId for multi-tenancy)
    const token = jwt.sign(
      { id: user._id, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return response without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      token,
      user: userResponse,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        plan: company.plan,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerSuperAdmin, login };
