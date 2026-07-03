import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import MainLayout from "../../components/layout/MainLayout";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Toast from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import Payroll from "./Payroll";
import Performance from "./Performance";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [submitting, setSubmitting] = useState(false);
  const [leaveData, setLeaveData] = useState({
    leaveType: "casual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attRes, leaveRes] = await Promise.all([
        axiosInstance.get("/api/attendance/my"),
        axiosInstance.get("/api/leave/my"),
      ]);
      setAttendance(attRes.data.attendance);
      setLeaves(leaveRes.data.leaves);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to fetch data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setMessage({ text: "", type: "" });
      await axiosInstance.post("/api/attendance/checkin");
      setMessage({ text: "Checked in successfully!", type: "success" });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Check-in failed", type: "error" });
    }
  };

  const handleCheckOut = async () => {
    try {
      setMessage({ text: "", type: "" });
      await axiosInstance.post("/api/attendance/checkout");
      setMessage({ text: "Checked out successfully!", type: "success" });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Check-out failed", type: "error" });
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      await axiosInstance.post("/api/leave/apply", leaveData);
      setMessage({ text: "Leave applied successfully!", type: "success" });
      setLeaveData({ leaveType: "casual", startDate: "", endDate: "", reason: "" });
      setActiveTab("leaves");
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to apply leave", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const today = new Date().toDateString();
  const todayRecord = attendance.find(
    (a) => new Date(a.date).toDateString() === today
  );

  const getAttendanceStatusBadge = (status) => {
    switch (status) {
      case "present":
        return <Badge type="active">Present</Badge>;
      case "half-day":
        return <Badge type="warning">Half Day</Badge>;
      case "absent":
        return <Badge type="inactive">Absent</Badge>;
      default:
        return <Badge type="neutral">{status}</Badge>;
    }
  };

  const getLeaveStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge type="active">Approved</Badge>;
      case "pending":
        return <Badge type="warning">Pending</Badge>;
      case "rejected":
        return <Badge type="inactive">Rejected</Badge>;
      default:
        return <Badge type="neutral">{status}</Badge>;
    }
  };

  const getLeaveTypeBadge = (type) => {
    switch (type) {
      case "sick":
        return <Badge type="inactive">Sick</Badge>;
      case "casual":
        return <Badge type="active">Casual</Badge>;
      case "earned":
        return <Badge type="primary">Earned</Badge>;
      default:
        return <Badge type="neutral">{type}</Badge>;
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm";

  // Determine greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* Toast */}
      <Toast 
        message={message.text} 
        type={message.type} 
        onClose={() => setMessage({ text: "", type: "" })} 
      />

      {/* --- HOME TAB --- */}
      {activeTab === "home" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{greeting}, {user?.name?.split(' ')[0] || "Employee"}!</h1>
            <p className="text-slate-500 mt-1 text-sm">Ready for a productive day? Don't forget to check in.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Today's Timesheet
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {!todayRecord ? (
                <div className="w-full text-center sm:text-left">
                  <p className="text-slate-500 mb-4 font-medium">You haven't checked in yet today.</p>
                  <button
                    onClick={handleCheckIn}
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 cursor-pointer text-lg"
                  >
                    ☀️ Check In Now
                  </button>
                </div>
              ) : !todayRecord.checkOut ? (
                <div className="w-full">
                  <div className="flex items-center gap-3 text-primary mb-5 bg-primary/10 p-4 rounded-xl border border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="font-bold text-sm">Currently clocked in since {formatTime(todayRecord.checkIn)}</span>
                  </div>
                  <button
                    onClick={handleCheckOut}
                    className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 cursor-pointer text-lg"
                  >
                    🌙 Check Out
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Check In</p>
                      <p className="text-primary font-bold">{formatTime(todayRecord.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Check Out</p>
                      <p className="text-amber-500 font-bold">{formatTime(todayRecord.checkOut)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Hours</p>
                      <p className="text-2xl font-bold text-slate-800">{todayRecord.workHours} hrs</p>
                    </div>
                    {getAttendanceStatusBadge(todayRecord.status)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MY ATTENDANCE TAB --- */}
      {activeTab === "attendance" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Attendance Log</h1>
            <p className="text-slate-500 mt-1 text-sm">Your recent check-in and check-out history.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <Loader type="skeleton" />
            ) : attendance.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3 opacity-40">📅</div>
                <p className="text-slate-500 font-medium">No attendance records yet</p>
                <p className="text-sm text-slate-400 mt-1">Your records will appear once you start checking in</p>
              </div>
            ) : (
              <Table headers={["Date", "Check In", "Check Out", "Work Hours", "Status"]}>
                {attendance.slice(0, 30).map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{formatDate(a.date)}</td>
                    <td className="px-6 py-4 text-sm text-primary font-bold">{formatTime(a.checkIn)}</td>
                    <td className="px-6 py-4 text-sm text-amber-500 font-bold">{formatTime(a.checkOut)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-bold">{a.workHours ? `${a.workHours}h` : "—"}</td>
                    <td className="px-6 py-4">
                      {getAttendanceStatusBadge(a.status)}
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </div>
      )}

      {/* --- APPLY LEAVE TAB --- */}
      {activeTab === "apply-leave" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Apply for Leave</h1>
            <p className="text-slate-500 mt-1 text-sm">Submit a new time-off request to your manager.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 max-w-3xl">
            <form onSubmit={handleLeaveSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2.5 uppercase tracking-wider">Leave Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['casual', 'sick', 'earned'].map((type) => (
                    <div 
                      key={type}
                      onClick={() => setLeaveData({ ...leaveData, leaveType: type })}
                      className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                        leaveData.leaveType === type 
                          ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-bold capitalize tracking-wide text-sm">{type}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={leaveData.startDate}
                    onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={leaveData.endDate}
                    onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Reason for Leave</label>
                <textarea
                  placeholder="Please provide details..."
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                  required
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Submit Leave Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MY LEAVES TAB --- */}
      {activeTab === "leaves" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Leave History</h1>
            <p className="text-slate-500 mt-1 text-sm">Track the status of your past and present leave requests.</p>
          </div>

          {loading ? (
            <Loader type="skeleton" />
          ) : leaves.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
              <div className="text-5xl mb-4 opacity-40">🏝️</div>
              <p className="text-slate-500 font-medium text-lg">No leave requests yet</p>
              <p className="text-sm text-slate-400 mt-1">Apply for leave to see your history here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {leaves.map((leave) => (
                <div key={leave._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    {getLeaveTypeBadge(leave.leaveType)}
                    {getLeaveStatusBadge(leave.status)}
                  </div>
                  
                  <div className="mb-4 flex-1">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-slate-800 font-bold text-lg">
                      {leave.totalDays} Day{leave.totalDays > 1 ? "s" : ""}
                    </p>
                    <p className="text-primary text-sm mt-1 font-bold">
                      {formatDate(leave.startDate)} <span className="mx-1 text-slate-300">→</span> {formatDate(leave.endDate)}
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Reason</p>
                    <p className="text-slate-600 text-sm line-clamp-2" title={leave.reason}>{leave.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- PROFILE TAB --- */}
      {activeTab === "profile" && (
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 max-w-2xl">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
                <p className="text-primary font-bold capitalize mt-0.5">{user?.role}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Full Name</p>
                  <p className="text-slate-800 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-sm font-bold">{user?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Role</p>
                  <p className="text-slate-800 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-sm font-bold capitalize">{user?.role || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Email</p>
                  <p className="text-slate-800 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-sm font-bold">{user?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Department</p>
                  <p className="text-slate-800 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-sm font-bold">{user?.department || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Joined</p>
                  <p className="text-slate-800 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-sm font-bold">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MY PAYROLL TAB --- */}
      {activeTab === "my-payroll" && (
        <div className="animate-fade-in-up">
          <Payroll />
        </div>
      )}

      {/* --- MY PERFORMANCE TAB --- */}
      {activeTab === "my-performance" && (
        <div className="animate-fade-in-up">
          <Performance />
        </div>
      )}

      {/* --- MY TASKS TAB --- */}
      {activeTab === "my-tasks" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
            <p className="text-slate-500 mt-1 text-sm">Tasks assigned to you by your manager.</p>
          </div>

          <MyTasksSection userName={user?.name} />
        </div>
      )}

    </MainLayout>
  );
};

/* ── My Tasks Section (reads from manager's localStorage) ── */
const MyTasksSection = ({ userName }) => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadTasks = () => {
      try {
        const saved = localStorage.getItem("hrms_manager_tasks");
        if (saved) {
          const allTasks = JSON.parse(saved);
          // Filter tasks assigned to current user
          const myTasks = allTasks.filter(
            (t) => t.assignee?.toLowerCase() === userName?.toLowerCase()
          );
          setTasks(myTasks);
        }
      } catch (e) {
        console.error("Error loading tasks:", e);
      }
    };
    loadTasks();

    // Re-check periodically in case manager assigns new tasks
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, [userName]);

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const priorityConfig = {
    high: { label: "High", bgClass: "bg-red-100 text-red-700 border-red-200" },
    medium: { label: "Medium", bgClass: "bg-amber-100 text-amber-700 border-amber-200" },
    low: { label: "Low", bgClass: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
        <div className="text-5xl mb-4 opacity-40">📋</div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No tasks assigned</h3>
        <p className="text-sm text-slate-400">When your manager assigns tasks to you, they will appear here.</p>
      </div>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 font-bold text-sm">Total Tasks</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{tasks.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-amber-600 font-bold text-sm">Pending</p>
          <p className="text-3xl font-black text-amber-500 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-emerald-600 font-bold text-sm">Completed</p>
          <p className="text-3xl font-black text-emerald-500 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-slate-100 w-fit">
        {[
          { key: "all", label: "All", count: tasks.length },
          { key: "pending", label: "Pending", count: pendingCount },
          { key: "completed", label: "Completed", count: completedCount },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              filter === f.key
                ? "bg-primary text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {f.label}
            <span
              className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-md ${
                filter === f.key ? "bg-white/20" : "bg-slate-100"
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
          <div className="text-5xl mb-4 opacity-40">✅</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No {filter} tasks</h3>
          <p className="text-sm text-slate-400">You have no {filter} tasks at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${
                task.status === "completed"
                  ? "border-emerald-200 opacity-80"
                  : "border-slate-100"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-semibold text-slate-800 ${
                      task.status === "completed" ? "line-through text-slate-400" : ""
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                  )}
                </div>
                {task.status === "completed" && (
                  <span className="ml-2 text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 flex-shrink-0">
                    ✓ Done
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider border ${
                    priorityConfig[task.priority]?.bgClass || priorityConfig.medium.bgClass
                  }`}
                >
                  {priorityConfig[task.priority]?.label || "Medium"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Due: {formatDate(task.dueDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Dashboard;
