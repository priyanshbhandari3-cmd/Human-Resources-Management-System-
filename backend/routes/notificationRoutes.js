const express = require("express");
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount } = require("../controllers/notificationController");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.get("/unread-count", getUnreadCount);

module.exports = router;
