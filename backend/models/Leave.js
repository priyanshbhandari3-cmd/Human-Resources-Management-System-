const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee ID is required"],
    },

    leaveType: {
      type: String,
      enum: {
        values: ["sick", "casual", "earned"],
        message: "{VALUE} is not a valid leave type",
      },
      required: [true, "Leave type is required"],
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    totalDays: {
      type: Number,
      required: [true, "Total days is required"],
    },

    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Leave", leaveSchema);
