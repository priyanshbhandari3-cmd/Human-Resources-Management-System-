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
import Payroll from "../admin/Payroll";
import Reports from "../admin/Reports";

const Dashboard = () => {
  const { user, company, setCompany } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Stats from API
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalManagers: 0,
    totalEmployees: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  // Company profile form state
  const [companyProfile, setCompanyProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Company settings form state
  const [companySettings, setCompanySettings] = useState({
    workingHours: { start: "09:00", end: "18:00" },
    sickLeaves: 10,
    casualLeaves: 12,
    earnedLeaves: 15,
    allowWeekendAttendance: false,
  });
  
  // Form State for creating admin
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

  // ── Fetch functions ──

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/users/all");
      setUsers(res.data.users);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to fetch users", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/api/company/stats");
      setStats(res.data.stats);
    } catch (err) {
      console.error("Failed to fetch stats:", err.message);
    }
  };

  const fetchCompanyProfile = async () => {
    try {
      const res = await axiosInstance.get("/api/company/profile");
      const c = res.data.company;
      setCompanyProfile({
        name: c.name || "",
        email: c.email || "",
        phone: c.phone || "",
        address: c.address || "",
      });
      setCompanySettings({
        workingHours: c.settings?.workingHours || { start: "09:00", end: "18:00" },
        sickLeaves: c.settings?.sickLeaves ?? 10,
        casualLeaves: c.settings?.casualLeaves ?? 12,
        earnedLeaves: c.settings?.earnedLeaves ?? 15,
        allowWeekendAttendance: c.settings?.allowWeekendAttendance ?? false,
      });
    } catch (err) {
      console.error("Failed to fetch company profile:", err.message);
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

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchCompanyProfile();
  }, []);

  // Fetch attendance when switching to that tab
  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    }
  }, [activeTab]);

  // ── Handlers ──

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.post("/api/users/create", {
        ...formData,
        role: "admin",
      });
      setMessage({ text: "Admin created successfully!", type: "success" });
      setFormData({ name: "", email: "", password: "", department: "" });
      setShowCreateModal(false);
      fetchUsers();
      fetchStats();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to create admin", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axiosInstance.patch(`/api/users/${id}/toggle-status`);
      setMessage({ text: "User status updated!", type: "success" });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to toggle status", type: "error" });
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/api/users/${id}`);
      setMessage({ text: "User deleted successfully!", type: "success" });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to delete user", type: "error" });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.put("/api/company/profile", {
        name: companyProfile.name,
        phone: companyProfile.phone,
        address: companyProfile.address,
      });
      setProfileSaved(true);
      setMessage({ text: "Company profile updated successfully!", type: "success" });
      if (res.data.company) {
        setCompany(res.data.company);
        localStorage.setItem("company", JSON.stringify(res.data.company));
      }
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to update profile", type: "error" });
    }
  };

  const handleSaveSettings = async () => {
    try {
      await axiosInstance.put("/api/company/settings", {
        workingHours: companySettings.workingHours,
        sickLeaves: companySettings.sickLeaves,
        casualLeaves: companySettings.casualLeaves,
        earnedLeaves: companySettings.earnedLeaves,
        allowWeekendAttendance: companySettings.allowWeekendAttendance,
      });
      setSettingsSaved(true);
      setMessage({ text: "Company settings saved successfully!", type: "success" });
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to save settings", type: "error" });
    }
  };

  // ── Analytics helpers ──
  const admins = users.filter(u => u.role === "admin");
  const managers = users.filter(u => u.role === "manager");
  const employees = users.filter(u => u.role === "employee");
  const allStaff = users.filter(u => u.role !== "superadmin");
  const activeCount = allStaff.filter(u => u.isActive).length;
  const inactiveCount = allStaff.filter(u => !u.isActive).length;

  // Build department data
  const departmentMap = {};
  allStaff.forEach((u) => {
    const dept = u.department || "Unassigned";
    if (!departmentMap[dept]) {
      departmentMap[dept] = { name: dept, admins: 0, managers: 0, employees: 0, active: 0, inactive: 0 };
    }
    if (u.role === "admin") departmentMap[dept].admins++;
    if (u.role === "manager") departmentMap[dept].managers++;
    if (u.role === "employee") departmentMap[dept].employees++;
    if (u.isActive) departmentMap[dept].active++;
    else departmentMap[dept].inactive++;
  });
  const departments = Object.values(departmentMap).sort((a, b) =>
    (b.admins + b.managers + b.employees) - (a.admins + a.managers + a.employees)
  );

  // Filter attendance records
  const filteredAttendance = attendanceFilter
    ? attendanceRecords.filter((r) => {
        const name = r.userId?.name?.toLowerCase() || "";
        const dept = r.userId?.department?.toLowerCase() || "";
        const role = r.userId?.role?.toLowerCase() || "";
        const q = attendanceFilter.toLowerCase();
        return name.includes(q) || dept.includes(q) || role.includes(q);
      })
    : attendanceRecords;

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* Toast Message */}
      <Toast 
        message={message.text} 
        type={message.type} 
        onClose={() => setMessage({ text: "", type: "" })} 
      />

      {/* --- OVERVIEW TAB --- */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {companyProfile.name ? `${companyProfile.name} — ` : ""}Company-wide metrics and user counts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>}
              color="blue"
              subtitle="Across all roles"
            />
            <StatCard 
              title="Admins" 
              value={stats.totalAdmins} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
              color="purple"
              subtitle="Active administrators"
            />
            <StatCard 
              title="Managers" 
              value={stats.totalManagers} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              color="green"
              subtitle="Team leaders"
            />
            <StatCard 
              title="Employees" 
              value={stats.totalEmployees} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-7 8a3 3 0 106 0 3 3 0 00-6 0z" /></svg>}
              color="orange"
              subtitle="Workforce members"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <StatCard 
              title="Active Users" 
              value={stats.activeUsers} 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              color="green"
            />
            <StatCard 
              title="Inactive Users" 
              value={stats.inactiveUsers} 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
              color="red"
            />
          </div>
        </div>
      )}

      {/* --- MANAGE USERS TAB --- */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
              <p className="text-slate-500 mt-1 text-sm">Create admins and manage system access.</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create Admin
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <Loader type="skeleton" />
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3 opacity-40">👥</div>
                <p className="text-slate-500 font-medium">No users found</p>
                <p className="text-sm text-slate-400 mt-1">Create your first admin to get started</p>
              </div>
            ) : (
              <Table headers={["User", "Role", "Status", "Actions"]}>
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                          {u.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800">{u.name}</span>
                          <span className="block text-xs font-medium text-slate-500">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge type={u.role}>{u.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge type={u.isActive ? "active" : "inactive"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {u.role !== "superadmin" && (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleStatus(u._id)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer border ${
                              u.isActive
                                ? "text-red-500 border-red-200 hover:bg-red-50"
                                : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            }`}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg font-bold transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>

          {/* Create Admin Modal */}
          <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Admin">
            <form onSubmit={handleCreate} className="space-y-4">
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
                {submitting ? "Creating..." : "Create Admin"}
              </button>
            </form>
          </Modal>
        </div>
      )}

      {/* --- COMPANY PROFILE TAB --- */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Company Profile</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage your company details and contact information.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Company Details</h2>
              </div>
              <button 
                onClick={handleSaveProfile} 
                disabled={profileSaved}
                className={`px-5 py-2.5 ${profileSaved ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary hover:bg-primary-dark"} text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-sm`}
              >
                {profileSaved ? "Saved!" : "Save Profile"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Company Name</label>
                <input type="text" value={companyProfile.name} onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Company Email</label>
                <input type="email" value={companyProfile.email} disabled className={`${inputClass} bg-slate-100 cursor-not-allowed text-slate-500`} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="text" value={companyProfile.phone} onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input type="text" value={companyProfile.address} onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- GLOBAL SETTINGS TAB --- */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Company Settings</h1>
              <p className="text-slate-500 mt-1 text-sm">Configure company-wide policies and working hours.</p>
            </div>
            <button 
              onClick={handleSaveSettings} 
              disabled={settingsSaved}
              className={`px-5 py-2.5 ${settingsSaved ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary hover:bg-primary-dark"} text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-sm`}
            >
              {settingsSaved ? "Saved!" : "Save Settings"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-semibold text-slate-800">Working Hours</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Start Time</label>
                  <input type="time" value={companySettings.workingHours.start} onChange={(e) => setCompanySettings({ ...companySettings, workingHours: { ...companySettings.workingHours, start: e.target.value }})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Time</label>
                  <input type="time" value={companySettings.workingHours.end} onChange={(e) => setCompanySettings({ ...companySettings, workingHours: { ...companySettings.workingHours, end: e.target.value }})} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Allow Weekend Attendance</p>
                <p className="text-sm text-slate-500">Enable check ins on weekends</p>
              </div>
              <button
                type="button"
                onClick={() => setCompanySettings({ ...companySettings, allowWeekendAttendance: !companySettings.allowWeekendAttendance })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${ companySettings.allowWeekendAttendance ? "bg-accent" : "bg-slate-300" }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${ companySettings.allowWeekendAttendance ? "translate-x-5" : "translate-x-0" }`} />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-800 mb-5">Leave Policy (Annual Quotas)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-sm font-bold text-slate-700 mb-3">Sick Leaves</p>
                  <input type="number" min="0" value={companySettings.sickLeaves} onChange={(e) => setCompanySettings({ ...companySettings, sickLeaves: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-sm font-bold text-slate-700 mb-3">Casual Leaves</p>
                  <input type="number" min="0" value={companySettings.casualLeaves} onChange={(e) => setCompanySettings({ ...companySettings, casualLeaves: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-sm font-bold text-slate-700 mb-3">Earned Leaves</p>
                  <input type="number" min="0" value={companySettings.earnedLeaves} onChange={(e) => setCompanySettings({ ...companySettings, earnedLeaves: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ATTENDANCE TAB --- */}
      {activeTab === "attendance" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Attendance Records</h1>
              <p className="text-slate-500 mt-1 text-sm">Company-wide attendance for admins, managers, and employees.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search by name, department, or role..."
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm w-72"
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
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
            <StatCard
              title="Unique Users"
              value={new Set(attendanceRecords.map(r => r.userId?._id)).size}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>}
              color="purple"
              subtitle="Tracked users"
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
                <p className="text-sm text-slate-400 mt-1">Records will appear when users check in.</p>
              </div>
            ) : (
              <Table headers={["Employee", "Role", "Department", "Date", "Check In", "Check Out", "Hours", "Status"]}>
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
                    <td className="px-6 py-4">
                      <Badge type={record.userId?.role || "employee"}>{record.userId?.role || "—"}</Badge>
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
            <p className="text-slate-500 mt-1 text-sm">Company-wide workforce insights, role distribution, and department metrics.</p>
          </div>

          {/* Workforce Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Workforce"
              value={allStaff.length}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>}
              color="blue"
              subtitle="Admins + Managers + Employees"
            />
            <StatCard
              title="Active Users"
              value={activeCount}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              color="green"
              subtitle="Currently active"
            />
            <StatCard
              title="Inactive Users"
              value={inactiveCount}
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

          {/* Department Headcount */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">Department Headcount</h2>
            {departments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No department data available.</p>
            ) : (
              <div className="space-y-4">
                {departments.map((dept) => {
                  const total = dept.admins + dept.managers + dept.employees;
                  const maxTotal = Math.max(...departments.map(d => d.admins + d.managers + d.employees), 1);
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
                        <span className="text-purple-600 font-bold">{dept.admins} adm</span>
                        <span className="text-emerald-600 font-bold">{dept.managers} mgr</span>
                        <span className="text-amber-600 font-bold">{dept.employees} emp</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Role Distribution + Activity Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-5">Role Distribution</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-slate-600">Admins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-800">{admins.length}</span>
                    <span className="text-xs text-slate-400">
                      ({allStaff.length > 0 ? Math.round((admins.length / allStaff.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-slate-600">Managers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-800">{managers.length}</span>
                    <span className="text-xs text-slate-400">
                      ({allStaff.length > 0 ? Math.round((managers.length / allStaff.length) * 100) : 0}%)
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
                      ({allStaff.length > 0 ? Math.round((employees.length / allStaff.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
              {/* Visual bar */}
              {allStaff.length > 0 && (
                <div className="mt-5 flex rounded-full h-4 overflow-hidden bg-slate-100">
                  <div className="bg-purple-500 transition-all duration-500" style={{ width: `${(admins.length / allStaff.length) * 100}%` }}></div>
                  <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(managers.length / allStaff.length) * 100}%` }}></div>
                  <div className="bg-amber-500 transition-all duration-500" style={{ width: `${(employees.length / allStaff.length) * 100}%` }}></div>
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
                    <span className="text-lg font-black text-slate-800">{activeCount}</span>
                    <span className="text-xs text-slate-400">
                      ({allStaff.length > 0 ? Math.round((activeCount / allStaff.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-slate-600">Inactive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-800">{inactiveCount}</span>
                    <span className="text-xs text-slate-400">
                      ({allStaff.length > 0 ? Math.round((inactiveCount / allStaff.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
              {/* Visual bar */}
              {allStaff.length > 0 && (
                <div className="mt-5 flex rounded-full h-4 overflow-hidden bg-slate-100">
                  <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(activeCount / allStaff.length) * 100}%` }}></div>
                  <div className="bg-red-500 transition-all duration-500" style={{ width: `${(inactiveCount / allStaff.length) * 100}%` }}></div>
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
