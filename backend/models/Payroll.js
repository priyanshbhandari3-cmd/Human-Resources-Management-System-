const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    allowances: {
      hra: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: {
      tax: { type: Number, default: 0 },
      pf: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    totalAllowances: {
      type: Number,
      required: true,
    },
    totalDeductions: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one payroll per employee per month per year
payrollSchema.index({ employeeId: 1, month: 1, year: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);
