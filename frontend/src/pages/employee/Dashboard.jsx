import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import MainLayout from "../../components/layout/MainLayout";

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

  // Auto-dismiss messages
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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

  const statusColors = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };

  const leaveTypeColors = {
    sick: "bg-red-50 text-red-600 border-red-200",
    casual: "bg-blue-50 text-blue-600 border-blue-200",
    earned: "bg-purple-50 text-purple-600 border-purple-200",
  };

  const inputClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all text-sm";

  // Determine greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* Toast */}
      {message.text && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium border animate-fade-in-up ${
          message.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* --- HOME TAB --- */}
      {activeTab === "home" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{greeting}, {user?.name?.split(' ')[0] || "Employee"}!</h1>
            <p className="text-slate-500 mt-1 text-sm">Ready for a productive day? Don't forget to check in.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Today's Timesheet
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {!todayRecord ? (
                <div className="w-full text-center sm:text-left">
                  <p className="text-slate-500 mb-4">You haven't checked in yet today.</p>
                  <button
                    onClick={handleCheckIn}
                    className="w-full sm:w-auto px-8 py-3.5 bg-accent hover:bg-accent-light text-white font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-200 cursor-pointer text-lg"
                  >
                    ☀️ Check In Now
                  </button>
                </div>
              ) : !todayRecord.checkOut ? (
                <div className="w-full">
                  <div className="flex items-center gap-3 text-accent mb-5 bg-accent/10 p-4 rounded-xl border border-accent/20">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                    <span className="font-medium text-sm">Currently clocked in since {formatTime(todayRecord.checkIn)}</span>
                  </div>
                  <button
                    onClick={handleCheckOut}
                    className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 cursor-pointer text-lg"
                  >
                    🌙 Check Out
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Check In</p>
                      <p className="text-accent font-semibold">{formatTime(todayRecord.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Check Out</p>
                      <p className="text-amber-500 font-semibold">{formatTime(todayRecord.checkOut)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Hours</p>
                      <p className="text-2xl font-bold text-secondary">{todayRecord.workHours} hrs</p>
                    </div>
                    <span className={`text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider border ${
                      todayRecord.status === "present" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : todayRecord.status === "half-day" ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}>
                      {todayRecord.status}
                    </span>
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
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Recent Records</h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">{attendance.length} records</span>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400 mt-3">Loading records...</p>
              </div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3 opacity-40">📅</div>
                <p className="text-slate-500 font-medium">No attendance records yet</p>
                <p className="text-sm text-slate-400 mt-1">Your records will appear once you start checking in</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/80">
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Check In</th>
                      <th className="px-6 py-3.5">Check Out</th>
                      <th className="px-6 py-3.5">Work Hours</th>
                      <th className="px-6 py-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.slice(0, 30).map((a) => (
                      <tr key={a._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{formatDate(a.date)}</td>
                        <td className="px-6 py-4 text-sm text-accent font-medium">{formatTime(a.checkIn)}</td>
                        <td className="px-6 py-4 text-sm text-amber-500 font-medium">{formatTime(a.checkOut)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{a.workHours ? `${a.workHours}h` : "—"}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border ${
                            a.status === "present" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : a.status === "half-day" ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                          ? 'bg-secondary/10 border-secondary text-secondary shadow-sm' 
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
                  className="w-full sm:w-auto px-8 py-3 bg-secondary hover:bg-secondary-light disabled:bg-secondary/50 text-white font-bold rounded-xl shadow-lg shadow-secondary/25 hover:shadow-secondary/40 transition-all duration-200 cursor-pointer"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Submitting...
                    </span>
                  ) : "Submit Leave Request"}
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
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400 mt-3">Loading leaves...</p>
            </div>
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
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border ${leaveTypeColors[leave.leaveType]}`}>
                      {leave.leaveType}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border ${statusColors[leave.status]}`}>
                      {leave.status}
                    </span>
                  </div>
                  
                  <div className="mb-4 flex-1">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-slate-800 font-bold text-lg">
                      {leave.totalDays} Day{leave.totalDays > 1 ? "s" : ""}
                    </p>
                    <p className="text-secondary text-sm mt-1 font-medium">
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
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-secondary/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
                <p className="text-secondary font-medium capitalize mt-0.5">{user?.role}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Full Name</p>
                  <p className="text-slate-800 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-sm">{user?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Role</p>
                  <p className="text-slate-800 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-sm capitalize">{user?.role || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
};

export default Dashboard;
