const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ["present", "absent", "half-day"],
        message: "{VALUE} is not a valid status",
      },
      default: "present",
    },

    workHours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
