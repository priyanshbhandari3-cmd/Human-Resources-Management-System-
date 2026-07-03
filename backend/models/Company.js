const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    logo: {
      type: String,
    },

    plan: {
      type: String,
      enum: {
        values: ["free", "basic", "premium"],
        message: "{VALUE} is not a valid plan",
      },
      default: "free",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    settings: {
      workingHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
      },
      sickLeaves: { type: Number, default: 10 },
      casualLeaves: { type: Number, default: 12 },
      earnedLeaves: { type: Number, default: 15 },
      allowWeekendAttendance: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);
