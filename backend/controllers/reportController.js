const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Payroll = require("../models/Payroll");
const User = require("../models/User");

// GET /api/reports/attendance
const getAttendanceReport = async (req, res) => {
  try {
    const { month, year, department } = req.query;
    const companyId = req.user.companyId;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month and year are required." });
    }

    // Build filter for users
    const userFilter = { companyId, role: { $in: ["employee", "manager"] } };
    if (department) userFilter.department = department;

    const users = await User.find(userFilter).select("_id name department");
    const userIds = users.map(u => u._id);

    // Build filter for attendance
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const attendances = await Attendance.find({
      userId: { $in: userIds },
      companyId,
      date: { $gte: startDate, $lte: endDate }
    });

    const report = users.map(user => {
      const userAtts = attendances.filter(a => a.userId.toString() === user._id.toString());
      const present = userAtts.filter(a => a.status === "present").length;
      const halfDay = userAtts.filter(a => a.status === "half-day").length;
      return {
        _id: user._id,
        name: user.name,
        department: user.department,
        presentDays: present,
        halfDays: halfDay,
        totalRecords: userAtts.length
      };
    });

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error("getAttendanceReport error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching attendance report." });
  }
};

// GET /api/reports/leave
const getLeaveReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const companyId = req.user.companyId;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month and year are required." });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const leaves = await Leave.find({
      companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate("employeeId", "name department");

    let approved = 0, rejected = 0, pending = 0;
    const employeeData = {};

    leaves.forEach(leave => {
      if (leave.status === "approved") approved++;
      else if (leave.status === "rejected") rejected++;
      else pending++;

      const empId = leave.employeeId._id.toString();
      if (!employeeData[empId]) {
        employeeData[empId] = {
          name: leave.employeeId.name,
          department: leave.employeeId.department,
          approved: 0,
          rejected: 0,
          pending: 0,
          totalDays: 0
        };
      }
      employeeData[empId][leave.status]++;
      if (leave.status === "approved") {
        employeeData[empId].totalDays += leave.totalDays;
      }
    });

    res.status(200).json({
      success: true,
      summary: { approved, rejected, pending },
      employees: Object.values(employeeData)
    });
  } catch (error) {
    console.error("getLeaveReport error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching leave report." });
  }
};

// GET /api/reports/payroll
const getPayrollReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const companyId = req.user.companyId;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month and year are required." });
    }

    const payrolls = await Payroll.find({ month, year, companyId })
      .populate("employeeId", "department");

    const deptStats = {};
    let totalPaid = 0, totalPending = 0;

    payrolls.forEach(p => {
      const dept = p.employeeId?.department || "Unassigned";
      if (!deptStats[dept]) {
        deptStats[dept] = { amount: 0, count: 0 };
      }
      deptStats[dept].amount += p.netSalary;
      deptStats[dept].count++;

      if (p.status === "paid") totalPaid += p.netSalary;
      else totalPending += p.netSalary;
    });

    res.status(200).json({
      success: true,
      summary: { totalPaid, totalPending },
      departments: Object.keys(deptStats).map(k => ({ department: k, ...deptStats[k] }))
    });
  } catch (error) {
    console.error("getPayrollReport error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching payroll report." });
  }
};

// GET /api/reports/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    // Total employees
    const totalEmployees = await User.countDocuments({ companyId, role: "employee" });

    // Present today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
    
    const presentToday = await Attendance.countDocuments({
      companyId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // On leave today (approved leave spanning today)
    const onLeaveToday = await Leave.countDocuments({
      companyId,
      status: "approved",
      startDate: { $lte: today },
      endDate: { $gte: startOfDay }
    });

    // Pending leaves
    const pendingLeaves = await Leave.countDocuments({ companyId, status: "pending" });

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        presentToday,
        onLeaveToday,
        pendingLeaves
      }
    });
  } catch (error) {
    console.error("getDashboardStats error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching dashboard stats." });
  }
};

module.exports = { getAttendanceReport, getLeaveReport, getPayrollReport, getDashboardStats };
