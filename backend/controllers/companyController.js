const Company = require("../models/Company");
const User = require("../models/User");

// ---------- Get Company Profile ----------
// GET /api/company/profile
const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("getCompanyProfile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching company profile.",
    });
  }
};

// ---------- Update Company Profile ----------
// PUT /api/company/profile
const updateCompanyProfile = async (req, res) => {
  try {
    const { name, phone, address, logo } = req.body;

    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    // Update only provided fields
    if (name !== undefined) company.name = name;
    if (phone !== undefined) company.phone = phone;
    if (address !== undefined) company.address = address;
    if (logo !== undefined) company.logo = logo;

    await company.save();

    res.status(200).json({
      success: true,
      message: "Company profile updated successfully.",
      company,
    });
  } catch (error) {
    console.error("updateCompanyProfile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating company profile.",
    });
  }
};

// ---------- Update Company Settings ----------
// PUT /api/company/settings
const updateCompanySettings = async (req, res) => {
  try {
    const { workingHours, sickLeaves, casualLeaves, earnedLeaves, allowWeekendAttendance } = req.body;

    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    // Update settings
    if (workingHours) {
      if (workingHours.start !== undefined) company.settings.workingHours.start = workingHours.start;
      if (workingHours.end !== undefined) company.settings.workingHours.end = workingHours.end;
    }
    if (sickLeaves !== undefined) company.settings.sickLeaves = sickLeaves;
    if (casualLeaves !== undefined) company.settings.casualLeaves = casualLeaves;
    if (earnedLeaves !== undefined) company.settings.earnedLeaves = earnedLeaves;
    if (allowWeekendAttendance !== undefined) company.settings.allowWeekendAttendance = allowWeekendAttendance;

    await company.save();

    res.status(200).json({
      success: true,
      message: "Company settings updated successfully.",
      company,
    });
  } catch (error) {
    console.error("updateCompanySettings error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating company settings.",
    });
  }
};

// ---------- Get Company Stats ----------
// GET /api/company/stats
const getCompanyStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const [totalAdmins, totalManagers, totalEmployees, activeUsers, inactiveUsers] = await Promise.all([
      User.countDocuments({ companyId, role: "admin" }),
      User.countDocuments({ companyId, role: "manager" }),
      User.countDocuments({ companyId, role: "employee" }),
      User.countDocuments({ companyId, isActive: true }),
      User.countDocuments({ companyId, isActive: false }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalAdmins,
        totalManagers,
        totalEmployees,
        totalUsers: totalAdmins + totalManagers + totalEmployees + 1, // +1 for superadmin
        activeUsers,
        inactiveUsers,
      },
    });
  } catch (error) {
    console.error("getCompanyStats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching company stats.",
    });
  }
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  updateCompanySettings,
  getCompanyStats,
};
