const Attendance = require("../models/Attendance");
const User = require("../models/User");

// ---------- Check In ----------
// POST /api/attendance/checkin
const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.companyId;

    // Start and end of today for duplicate check
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    // Check if already checked in today (scoped to company)
    const existing = await Attendance.findOne({
      userId,
      companyId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already checked in today.",
      });
    }

    const attendance = await Attendance.create({
      userId,
      companyId,
      date: startOfDay,
      checkIn: new Date(),
      status: "present",
    });

    res.status(201).json({
      success: true,
      message: "Checked in successfully.",
      attendance,
    });
  } catch (error) {
    console.error("checkIn error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during check-in.",
    });
  }
};

// ---------- Check Out ----------
// POST /api/attendance/checkout
const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.companyId;

    // Start and end of today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    // Find today's attendance record (scoped to company)
    const attendance = await Attendance.findOne({
      userId,
      companyId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "You have not checked in today.",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "You have already checked out today.",
      });
    }

    // Set checkout time and calculate work hours
    attendance.checkOut = new Date();
    const diffMs = attendance.checkOut - attendance.checkIn;
    attendance.workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    // Mark half-day if worked less than 4 hours
    if (attendance.workHours < 4) {
      attendance.status = "half-day";
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Checked out successfully.",
      attendance,
    });
  } catch (error) {
    console.error("checkOut error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during check-out.",
    });
  }
};

// ---------- Get My Attendance ----------
// GET /api/attendance/my
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      userId: req.user.id,
      companyId: req.user.companyId,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("getMyAttendance error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attendance.",
    });
  }
};

// ---------- Get Team Attendance (Manager) ----------
// GET /api/attendance/team
const getTeamAttendance = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    // Find all employees under this manager within the same company
    const teamMembers = await User.find({
      managerId: req.user.id,
      companyId,
    }).select("_id");
    const teamIds = teamMembers.map((member) => member._id);

    if (teamIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        attendance: [],
        message: "No team members found.",
      });
    }

    const attendance = await Attendance.find({
      userId: { $in: teamIds },
      companyId,
    })
      .populate("userId", "name email department")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("getTeamAttendance error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching team attendance.",
    });
  }
};

// ---------- Get All Attendance (Admin/Superadmin) ----------
// GET /api/attendance/all
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ companyId: req.user.companyId })
      .populate("userId", "name email role department")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("getAllAttendance error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching all attendance.",
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
};
