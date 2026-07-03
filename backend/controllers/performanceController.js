const Performance = require("../models/Performance");
const Notification = require("../models/Notification");
const User = require("../models/User");

// POST /api/performance/review
const createReview = async (req, res) => {
  try {
    const { employeeId, reviewPeriod, ratings, comments, goals } = req.body;
    const companyId = req.user.companyId;
    const reviewerId = req.user.id;

    if (!employeeId || !reviewPeriod || !ratings) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // Verify employee reports to this manager
    const employee = await User.findOne({ _id: employeeId, companyId });
    if (!employee || employee.managerId?.toString() !== reviewerId) {
      return res.status(403).json({ success: false, message: "You can only review your own team members." });
    }

    const { productivity, teamwork, communication, punctuality, quality } = ratings;
    const overallRating = (productivity + teamwork + communication + punctuality + quality) / 5;

    const review = await Performance.create({
      employeeId,
      reviewerId,
      companyId,
      reviewPeriod,
      ratings,
      overallRating,
      comments,
      goals,
      status: "submitted",
    });

    await Notification.create({
      userId: employeeId,
      companyId,
      title: "New Performance Review",
      message: `Your manager has submitted a performance review for ${reviewPeriod.month}/${reviewPeriod.year}.`,
      type: "performance",
    });

    res.status(201).json({ success: true, message: "Review submitted successfully.", review });
  } catch (error) {
    console.error("createReview error:", error.message);
    res.status(500).json({ success: false, message: "Server error submitting review." });
  }
};

// GET /api/performance/my
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Performance.find({ employeeId: req.user.id, companyId: req.user.companyId })
      .populate("reviewerId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("getMyReviews error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching your reviews." });
  }
};

// GET /api/performance/team
const getTeamReviews = async (req, res) => {
  try {
    const reviews = await Performance.find({ reviewerId: req.user.id, companyId: req.user.companyId })
      .populate("employeeId", "name department")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("getTeamReviews error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching team reviews." });
  }
};

// GET /api/performance/all
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Performance.find({ companyId: req.user.companyId })
      .populate("employeeId", "name department")
      .populate("reviewerId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("getAllReviews error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching all reviews." });
  }
};

// PUT /api/performance/:id
const updateReview = async (req, res) => {
  try {
    const { ratings, comments, goals, status } = req.body;
    const review = await Performance.findOne({ _id: req.params.id, reviewerId: req.user.id, companyId: req.user.companyId });
    
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    if (review.status === "submitted") {
      return res.status(400).json({ success: false, message: "Cannot edit a submitted review." });
    }

    if (ratings) {
      review.ratings = { ...review.ratings, ...ratings };
      const { productivity, teamwork, communication, punctuality, quality } = review.ratings;
      review.overallRating = (productivity + teamwork + communication + punctuality + quality) / 5;
    }
    
    if (comments !== undefined) review.comments = comments;
    if (goals !== undefined) review.goals = goals;
    if (status) review.status = status;

    await review.save();

    if (status === "submitted") {
      await Notification.create({
        userId: review.employeeId,
        companyId: req.user.companyId,
        title: "New Performance Review",
        message: `Your manager has submitted a performance review for ${review.reviewPeriod.month}/${review.reviewPeriod.year}.`,
        type: "performance",
      });
    }

    res.status(200).json({ success: true, message: "Review updated successfully.", review });
  } catch (error) {
    console.error("updateReview error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating review." });
  }
};

module.exports = { createReview, getMyReviews, getTeamReviews, getAllReviews, updateReview };
