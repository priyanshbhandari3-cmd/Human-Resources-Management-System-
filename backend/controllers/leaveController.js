const Leave = require("../models/Leave");
const User = require("../models/User");

// ---------- Apply Leave ----------
// POST /api/leave/apply
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide leaveType, startDate, endDate, and reason.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate startDate is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past.",
      });
    }

    // Validate endDate >= startDate
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    // Calculate total days
    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping leave
    const overlapping = await Leave.findOne({
      employeeId: req.user.id,
      status: { $ne: "rejected" },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: "You already have a leave request overlapping with these dates.",
      });
    }

    const leave = await Leave.create({
      employeeId: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Leave applied successfully.",
      leave,
    });
  } catch (error) {
    console.error("applyLeave error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while applying leave.",
    });
  }
};

// ---------- Get My Leaves ----------
// GET /api/leave/my
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id })
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("getMyLeaves error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching leaves.",
    });
  }
};

// ---------- Get Pending Leaves (Manager) ----------
// GET /api/leave/pending
const getPendingLeaves = async (req, res) => {
  try {
    // Find employees under this manager
    const teamMembers = await User.find({ managerId: req.user.id }).select("_id");
    const teamIds = teamMembers.map((member) => member._id);

    if (teamIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        leaves: [],
        message: "No team members found.",
      });
    }

    const leaves = await Leave.find({
      employeeId: { $in: teamIds },
      status: "pending",
    })
      .populate("employeeId", "name email department")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("getPendingLeaves error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending leaves.",
    });
  }
};

// ---------- Review Leave (Manager) ----------
// PATCH /api/leave/:id/review
const reviewLeave = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'rejected'.",
      });
    }

    // Find the leave
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    // Check if already reviewed
    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Leave has already been ${leave.status}.`,
      });
    }

    // Verify the employee belongs to this manager's team
    const employee = await User.findById(leave.employeeId);
    if (!employee || employee.managerId?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only review leaves of your own team members.",
      });
    }

    // Update leave
    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave ${status} successfully.`,
      leave,
    });
  } catch (error) {
    console.error("reviewLeave error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while reviewing leave.",
    });
  }
};

// ---------- Get All Leaves (Admin/Superadmin) ----------
// GET /api/leave/all
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employeeId", "name email role department")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("getAllLeaves error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching all leaves.",
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  reviewLeave,
  getAllLeaves,
};
