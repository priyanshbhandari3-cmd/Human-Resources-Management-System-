const Notification = require("../models/Notification");

// GET /api/notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id, companyId: req.user.companyId })
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("getMyNotifications error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching notifications." });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id, companyId: req.user.companyId });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("markAsRead error:", error.message);
    res.status(500).json({ success: false, message: "Server error marking notification as read." });
  }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, companyId: req.user.companyId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    console.error("markAllAsRead error:", error.message);
    res.status(500).json({ success: false, message: "Server error marking all notifications as read." });
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, companyId: req.user.companyId, isRead: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("getUnreadCount error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching unread count." });
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount };
