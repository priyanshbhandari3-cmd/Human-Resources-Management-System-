const Payroll = require("../models/Payroll");
const Notification = require("../models/Notification");

// POST /api/payroll/generate
const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances = {}, deductions = {} } = req.body;
    const companyId = req.user.companyId;

    if (!employeeId || !month || !year || !basicSalary) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // Check duplicate
    const existing = await Payroll.findOne({ employeeId, month, year, companyId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Payroll already generated for this month and year." });
    }

    const hra = Number(allowances.hra || 0);
    const transport = Number(allowances.transport || 0);
    const medical = Number(allowances.medical || 0);
    const otherAllow = Number(allowances.other || 0);
    const totalAllowances = hra + transport + medical + otherAllow;

    const tax = Number(deductions.tax || 0);
    const pf = Number(deductions.pf || 0);
    const otherDed = Number(deductions.other || 0);
    const totalDeductions = tax + pf + otherDed;

    const netSalary = Number(basicSalary) + totalAllowances - totalDeductions;

    const payroll = await Payroll.create({
      employeeId,
      companyId,
      month,
      year,
      basicSalary,
      allowances: { hra, transport, medical, other: otherAllow },
      deductions: { tax, pf, other: otherDed },
      totalAllowances,
      totalDeductions,
      netSalary,
    });

    // Create Notification
    await Notification.create({
      userId: employeeId,
      companyId,
      title: "Payroll Generated",
      message: `Your payslip for ${month}/${year} has been generated.`,
      type: "payroll",
    });

    res.status(201).json({ success: true, message: "Payroll generated successfully.", payroll });
  } catch (error) {
    console.error("generatePayroll error:", error.message);
    res.status(500).json({ success: false, message: "Server error generating payroll." });
  }
};

// GET /api/payroll/my
const getMyPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employeeId: req.user.id, companyId: req.user.companyId })
      .sort({ year: -1, month: -1 });

    res.status(200).json({ success: true, payrolls });
  } catch (error) {
    console.error("getMyPayroll error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching your payrolls." });
  }
};

// GET /api/payroll/all
const getAllPayroll = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { companyId: req.user.companyId };
    
    if (month) filter.month = month;
    if (year) filter.year = year;

    const payrolls = await Payroll.find(filter)
      .populate("employeeId", "name email department")
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({ success: true, payrolls });
  } catch (error) {
    console.error("getAllPayroll error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching all payrolls." });
  }
};

// PATCH /api/payroll/:id/pay
const markAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findOne({ _id: req.params.id, companyId: req.user.companyId });
    
    if (!payroll) {
      return res.status(404).json({ success: false, message: "Payroll record not found." });
    }

    if (payroll.status === "paid") {
      return res.status(400).json({ success: false, message: "Already marked as paid." });
    }

    payroll.status = "paid";
    payroll.paidAt = new Date();
    await payroll.save();

    // Create Notification
    await Notification.create({
      userId: payroll.employeeId,
      companyId: req.user.companyId,
      title: "Salary Paid",
      message: `Your salary for ${payroll.month}/${payroll.year} has been marked as paid.`,
      type: "payroll",
    });

    res.status(200).json({ success: true, message: "Payroll marked as paid.", payroll });
  } catch (error) {
    console.error("markAsPaid error:", error.message);
    res.status(500).json({ success: false, message: "Server error marking payroll as paid." });
  }
};

// GET /api/payroll/stats
const getPayrollStats = async (req, res) => {
  try {
    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();

    const payrolls = await Payroll.find({ companyId: req.user.companyId, month: currentMonth, year: currentYear });

    const totalAmount = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const paidCount = payrolls.filter(p => p.status === "paid").length;
    const pendingCount = payrolls.filter(p => p.status === "pending").length;

    res.status(200).json({
      success: true,
      stats: {
        totalAmount,
        paidCount,
        pendingCount,
        totalGenerated: payrolls.length,
      }
    });
  } catch (error) {
    console.error("getPayrollStats error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching payroll stats." });
  }
};

module.exports = { generatePayroll, getMyPayroll, getAllPayroll, markAsPaid, getPayrollStats };
