import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        axiosInstance.get("/api/notifications"),
        axiosInstance.get("/api/notifications/unread-count"),
      ]);
      setNotifications(notifRes.data.notifications);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 1 minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "leave": return "🌴";
      case "attendance": return "⏰";
      case "payroll": return "💰";
      case "performance": return "⭐";
      default: return "🔔";
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-slate-500 hover:text-primary transition-colors focus:outline-none rounded-full hover:bg-slate-100"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 animate-fade-in-up origin-top-right">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="text-3xl mb-2 opacity-50">📭</div>
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.slice(0, 10).map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-primary/5'}`}
                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                  >
                    <div className="text-2xl mt-0.5">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-semibold truncate pr-2 ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</h4>
                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{formatTime(notif.createdAt)}</span>
                      </div>
                      <p className={`text-xs line-clamp-2 ${notif.isRead ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>{notif.message}</p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 shadow-sm shadow-primary/50"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 bg-white text-center">
              <span className="text-xs font-bold text-slate-400">Showing recent 10 notifications</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
