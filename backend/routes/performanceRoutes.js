const express = require("express");
const router = express.Router();
const { createReview, getMyReviews, getTeamReviews, getAllReviews, updateReview } = require("../controllers/performanceController");
const auth = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.use(auth);

router.post("/review", checkRole(["manager"]), createReview);
router.get("/my", checkRole(["employee", "manager", "admin", "superadmin"]), getMyReviews);
router.get("/team", checkRole(["manager"]), getTeamReviews);
router.get("/all", checkRole(["superadmin", "admin"]), getAllReviews);
router.put("/:id", checkRole(["manager"]), updateReview);

module.exports = router;
