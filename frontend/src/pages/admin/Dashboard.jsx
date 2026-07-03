import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import MainLayout from "../../components/layout/MainLayout";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Toast from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import Payroll from "./Payroll";
import Reports from "./Reports";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceFilter, setAttendanceFilter] = useState("");

  // My own attendance (for check-in/check-out)
  const [myAttendance, setMyAttendance] = useState([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/users/all");
      const filtered = res.data.users.filter(
        (u) => u.role === "manager" || u.role === "employee"
      );
      setUsers(filtered);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to fetch users", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true);
      const res = await axiosInstance.get("/api/attendance/all");
      setAttendanceRecords(res.data.attendance || []);
    } catch (err) {
      console.error("Failed to fetch attendance:", err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchMyAttendance = async () => {
    try {
      const res = await axiosInstance.get("/api/attendance/my");
      setMyAttendance(res.data.attendance || []);
    } catch (err) {
      console.error("Failed to fetch my attendance:", err.message);
    }
  };

  const handleCheckIn = async () => {
    try {
      await axiosInstance.post("/api/attendance/checkin");
      setMessage({ text: "Checked in successfully!", type: "success" });
      fetchMyAttendance();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Check-in failed", type: "error" });
    }
  };

  const handleCheckOut = async () => {
    try {
      await axiosInstance.post("/api/attendance/checkout");
      setMessage({ text: "Checked out successfully!", type: "success" });
      fetchMyAttendance();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Check-out failed", type: "error" });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMyAttendance();
  }, []);

  // Fetch attendance when switching to that tab
  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    }
  }, [activeTab]);

  const handleCreateManager = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.post("/api/users/create", {
        ...formData,
        role: "manager",
      });
      setMessage({ text: "Manager created successfully!", type: "success" });
      setFormData({ name: "", email: "", password: "", department: "" });
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to create manager", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const managers = users.filter((u) => u.role === "manager");
  const employees = users.filter((u) => u.role === "employee");

  // Build department data from users
  const departmentMap = {};
  users.forEach((u) => {
    const dept = u.department || "Unassigned";
    if (!departmentMap[dept]) {
      departmentMap[dept] = { name: dept, managers: 0, employees: 0, active: 0, inactive: 0 };
    }
    if (u.role === "manager") departmentMap[dept].managers++;
    if (u.role === "employee") departmentMap[dept].employees++;
    if (u.isActive) departmentMap[dept].active++;
    else departmentMap[dept].inactive++;
  });
  const departments = Object.values(departmentMap).sort((a, b) => 
    (b.managers + b.employees) - (a.managers + a.employees)
  );

  // Filter attendance records
  const filteredAttendance = attendanceFilter
    ? attendanceRecords.filter((r) => {
        const name = r.userId?.name?.toLowerCase() || "";
        const dept = r.userId?.department?.toLowerCase() || "";
        const q = attendanceFilter.toLowerCase();
        return name.includes(q) || dept.includes(q);
      })
    : attendanceRecords;

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* Toast */}
      <Toast 
        message={message.text} 
        type={message.type} 
        onClose={() => setMessage({ text: "", type: "" })} 
      />

      {/* --- OVERVIEW TAB --- */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Overview of organization structure.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard 
              title="Total Managers" 
              value={managers.length} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              color="green"
              subtitle="Team leaders"
            />
            <StatCard 
              title="Total Employees" 
              value={employees.length} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-7 8a3 3 0 106 0 3 3 0 00-6 0z" /></svg>}
              color="orange"
              subtitle="Workforce members"
            />
            <StatCard 
              title="Departments" 
              value={departments.filter(d => d.name !== "Unassigned").length} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              color="blue"
              subtitle="Active departments"
            />
          </div>

          {/* My Timesheet Card */}
          {(() => {
            const today = new Date().toDateString();
            const todayRecord = myAttendance.find(a => new Date(a.date).toDateString() === today);
            const formatTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
            return (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 max-w-2xl">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  My Timesheet
                </h2>
                {!todayRecord ? (
                  <div>
                    <p className="text-slate-500 mb-4 font-medium">You haven't checked in yet today.</p>
                    <button onClick={handleCheckIn} className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all cursor-pointer">☀️ Check In Now</button>
                  </div>
                ) : !todayRecord.checkOut ? (
                  <div>
                    <div className="flex items-center gap-3 text-primary mb-4 bg-primary/10 p-4 rounded-xl border border-primary/20">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="font-bold text-sm">Clocked in since {formatTime(todayRecord.checkIn)}</span>
                    </div>
                    <button onClick={handleCheckOut} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer">🌙 Check Out</button>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Check In</p>
                        <p className="text-primary font-bold">{formatTime(todayRecord.checkIn)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Check Out</p>
                        <p className="text-amber-500 font-bold">{formatTime(todayRecord.checkOut)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Hours</p>
                        <p className="text-slate-800 font-bold">{todayRecord.workHours}h</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* --- MANAGE MANAGERS TAB --- */}
      {activeTab === "managers" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Manage Managers</h1>
              <p className="text-slate-500 mt-1 text-sm">Appoint new managers and oversee departments.</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Appoint Manager
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <Loader type="skeleton" />
            ) : managers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3 opacity-40">👤</div>
                <p className="text-slate-500 font-medium">No managers found</p>
                <p className="text-sm text-slate-400 mt-1">Appoint your first manager to get started</p>
              </div>
            ) : (
              <Table headers={["Manager", "Department", "Role"]}>
                {managers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-sm font-bold text-emerald-600">
                          {u.name?.charAt(0)?.toUpperCase() || "M"}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800">{u.name}</span>
                          <span className="block text-xs font-medium text-slate-500">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 font-medium">{u.department || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge type="manager">{u.role}</Badge>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>

          {/* Create Manager Modal */}
          <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Appoint New Manager">
            <form onSubmit={handleCreateManager} className="space-y-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="John Doe" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="john@company.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="••••••••" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="Engineering" className={inputClass} />
              </div>
              <button type="submit" disabled={submitting} className="w-full mt-4 px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer">
                {submitting ? "Appointing..." : "Appoint Manager"}
              </button>
            </form>
          </Modal>
        </div>
      )}

      {/* --- MANAGE EMPLOYEES TAB --- */}
      {activeTab === "employees" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Employee Roster</h1>
            <p className="text-slate-500 mt-1 text-sm">View all employees across all departments.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <Loader type="skeleton" />
            ) : employees.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3 opacity-40">👥</div>
                <p className="text-slate-500 font-medium">No employees found</p>
                <p className="text-sm text-slate-400 mt-1">Employees will appear here once created by managers</p>
              </div>
            ) : (
              <Table headers={["Name", "Email", "Department", "Status"]}>
                {employees.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center text-sm font-bold text-amber-600">
                          {u.name?.charAt(0)?.toUpperCase() || "E"}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{u.department || "—"}</td>
                    <td className="px-6 py-4">
                      <Badge type={u.isActive ? "active" : "inactive"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </div>
      )}

      {/* --- DEPARTMENTS TAB --- */}
      {activeTab === "departments" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
            <p className="text-slate-500 mt-1 text-sm">Organization structure by department.</p>
          </div>

          {loading ? (
            <Loader type="skeleton" />
          ) : departments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
              <div className="text-5xl mb-4 opacity-40">🏢</div>
              <p className="text-slate-500 font-medium">No departments found</p>
              <p className="text-sm text-slate-400 mt-1">Assign departments to managers and employees to see them here.</p>
            </div>
          ) : (
            <>
              {/* Department Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {departments.map((dept) => (
                  <div key={dept.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <span className="text-lg">🏢</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{dept.name}</h3>
                        <p className="text-xs text-slate-400">{dept.managers + dept.employees} members</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-emerald-600">{dept.managers}</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">Managers</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-amber-600">{dept.employees}</p>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-0.5">Employees</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-xs font-medium text-slate-500">{dept.active} Active</span>
                      </div>
                      {dept.inactive > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-400"></span>
                          <span className="text-xs font-medium text-slate-500">{dept.inactive} Inactive</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Department Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800">Department Breakdown</h2>
                </div>
                <Table headers={["Department", "Managers", "Employees", "Total", "Status"]}>
                  {departments.map((dept) => (
                    <tr key={dept.name} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-sm">🏢</div>
                          <span className="text-sm font-bold text-slate-800">{dept.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600">{dept.managers}</td>
                      <td className="px-6 py-4 text-sm font-bold text-amber-600">{dept.employees}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-800">{dept.managers + dept.employees}</td>
                      <td className="px-6 py-4">
                        <Badge type="active">{dept.active} active</Badge>
                      </td>
                    </tr>
                  ))}
                </Table>
              </div>
            </>
          )}
        </div>
      )}

      {/* --- ATTENDANCE TAB --- */}
      {activeTab === "attendance" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Attendance Records</h1>
              <p className="text-slate-500 mt-1 text-sm">Company-wide attendance tracking.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search by name or department..."
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm w-64"
              />
              <button
                onClick={fetchAttendance}
                className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Total Records"
              value={attendanceRecords.length}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              color="blue"
              subtitle="All time"
            />
            <StatCard
              title="Present"
              value={attendanceRecords.filter(r => r.status === "present").length}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              color="green"
              subtitle="Full day"
            />
            <StatCard
              title="Half Day"
              value={attendanceRecords.filter(r => r.status === "half-day").length}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="orange"
              subtitle="Partial day"
            />
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {attendanceLoading ? (
              <Loader type="skeleton" />
            ) : filteredAttendance.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3 opacity-40">📅</div>
                <p className="text-slate-500 font-medium">No attendance records found</p>
                <p className="text-sm text-slate-400 mt-1">Records will appear when employees check in.</p>
              </div>
            ) : (
              <Table headers={["Employee", "Department", "Date", "Check In", "Check Out", "Hours", "Status"]}>
                {filteredAttendance.slice(0, 50).map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                          {record.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800">{record.userId?.name || "Unknown"}</span>
                          <span className="block text-xs font-medium text-slate-500">{record.userId?.email || ""}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{record.userId?.department || "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {record.date ? new Date(record.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-red-500">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                      {record.workHours ? `${record.workHours}h` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge type={record.status === "present" ? "active" : record.status === "half-day" ? "warning" : "inactive"}>
                        {record.status || "—"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
            {filteredAttendance.length > 50 && (
              <div className="px-6 py-3 bg-slate-50 text-xs text-slate-500 text-center font-medium border-t border-slate-100">
                Showing 50 of {filteredAttendance.length} records. Use the search filter to narrow results.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PAYROLL TAB --- */}
      {activeTab === "payroll-management" && (
        <div className="animate-fade-in-up">
          <Payroll />
        </div>
      )}

      {/* --- REPORTS TAB --- */}
      {activeTab === "reports" && (
        <div className="animate-fade-in-up">
          <Reports />
        </div>
      )}

      {/* --- ANALYTICS TAB --- */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
            <p className="text-slate-500 mt-1 text-sm">Workforce insights and organization metrics.</p>
          </div>

          {/* Workforce Distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Workforce"
              value={users.length}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>}
              color="blue"
              subtitle="Managers + Employees"
            />
            <StatCard
              title="Active Users"
              value={users.filter(u => u.isActive).length}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              color="green"
              subtitle="Currently active"
            />
            <StatCard
              title="Inactive Users"
              value={users.filter(u => !u.isActive).length}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
              color="red"
              subtitle="Deactivated accounts"
            />
            <StatCard
              title="Departments"
              value={departments.filter(d => d.name !== "Unassigned").length}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              color="purple"
              subtitle="Active departments"
            />
          </div>

          {/* Department Headcount Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">Department Headcount</h2>
            {departments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No department data available.</p>
            ) : (
              <div className="space-y-4">
                {departments.map((dept) => {
                  const total = dept.managers + dept.employees;
                  const maxTotal = Math.max(...departments.map(d => d.managers + d.employees), 1);
                  const widthPercent = Math.max((total / maxTotal) * 100, 8);
                  return (
                    <div key={dept.name} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-bold text-slate-700 truncate flex-shrink-0">{dept.name}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        >
                          <span className="text-xs font-bold text-white">{total}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-3 text-xs">
                        <span className="text-emerald-600 font-bold">{dept.managers} mgr</span>
                        <span className="text-amber-600 font-bold">{dept.employees} emp</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Role Distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-5">Role Distribution</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-slate-600">Managers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-800">{managers.length}</span>
                    <span className="text-xs text-slate-400">
                      ({users.length > 0 ? Math.round((managers.length / users.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium text-slate-600">Employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-800">{employees.length}</span>
                    <span className="text-xs text-slate-400">
                      ({users.length > 0 ? Math.round((employees.length / users.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
              {/* Visual bar */}
              {users.length > 0 && (
                <div className="mt-5 flex rounded-full h-4 overflow-hidden bg-slate-100">
                  <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(managers.length / users.length) * 100}%` }}></div>
                  <div className="bg-amber-500 transition-all duration-500" style={{ width: `${(employees.length / users.length) * 100}%` }}></div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-5">Activity Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-slate-600">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-800">{users.filter(u => u.isActive).length}</span>
                    <span className="text-xs text-slate-400">
                      ({users.length > 0 ? Math.round((users.filter(u => u.isActive).length / users.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-slate-600">Inactive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-800">{users.filter(u => !u.isActive).length}</span>
                    <span className="text-xs text-slate-400">
                      ({users.length > 0 ? Math.round((users.filter(u => !u.isActive).length / users.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
              {/* Visual bar */}
              {users.length > 0 && (
                <div className="mt-5 flex rounded-full h-4 overflow-hidden bg-slate-100">
                  <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(users.filter(u => u.isActive).length / users.length) * 100}%` }}></div>
                  <div className="bg-red-500 transition-all duration-500" style={{ width: `${(users.filter(u => !u.isActive).length / users.length) * 100}%` }}></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
};

export default Dashboard;
