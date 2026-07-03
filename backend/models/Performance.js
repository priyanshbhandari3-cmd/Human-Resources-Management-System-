const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    reviewPeriod: {
      month: { type: Number, required: true },
      year: { type: Number, required: true },
    },
    ratings: {
      productivity: { type: Number, required: true, min: 1, max: 5 },
      teamwork: { type: Number, required: true, min: 1, max: 5 },
      communication: { type: Number, required: true, min: 1, max: 5 },
      punctuality: { type: Number, required: true, min: 1, max: 5 },
      quality: { type: Number, required: true, min: 1, max: 5 },
    },
    overallRating: {
      type: Number,
      required: true,
    },
    comments: {
      type: String,
      default: "",
    },
    goals: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Performance", performanceSchema);
