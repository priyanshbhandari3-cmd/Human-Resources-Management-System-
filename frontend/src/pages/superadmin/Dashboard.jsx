import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import MainLayout from "../../components/layout/MainLayout";

const defaultSettings = {
  companyName: "HRMS Solutions Inc.",
  workStartTime: "09:00",
  workEndTime: "18:00",
  sickLeaves: 10,
  casualLeaves: 12,
  earnedLeaves: 15,
};

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [settingsSaved, setSettingsSaved] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Global Settings state
  const [globalSettings, setGlobalSettings] = useState(() => {
    const saved = localStorage.getItem("hrms_global_settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

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

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      await axiosInstance.post("/api/users/create", {
        ...formData,
        role: "admin",
      });
      setMessage({ text: "Admin created successfully!", type: "success" });
      setFormData({ name: "", email: "", password: "", department: "" });
      fetchUsers();
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
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to delete user", type: "error" });
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem("hrms_global_settings", JSON.stringify(globalSettings));
    setSettingsSaved(true);
    setMessage({ text: "Global settings saved successfully!", type: "success" });
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const updateSetting = (key, value) => {
    setGlobalSettings(prev => ({ ...prev, [key]: value }));
  };

  const roleColors = {
    superadmin: "bg-purple-100 text-purple-700 border border-purple-200",
    admin: "bg-blue-100 text-blue-700 border border-blue-200",
    manager: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    employee: "bg-amber-100 text-amber-700 border border-amber-200",
  };

  // Derived Stats
  const admins = users.filter(u => u.role === "admin");
  const managers = users.filter(u => u.role === "manager");
  const employees = users.filter(u => u.role === "employee");

  const inputClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* Toast Message */}
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

      {/* --- OVERVIEW TAB --- */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
            <p className="text-slate-500 mt-1 text-sm">System-wide metrics and user counts.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{users.length}</p>
              <p className="text-xs text-slate-400 mt-1">Across all roles</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">Admins</p>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600">{admins.length}</p>
              <p className="text-xs text-slate-400 mt-1">Active administrators</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">Managers</p>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{managers.length}</p>
              <p className="text-xs text-slate-400 mt-1">Team leaders</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">Employees</p>
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-7 8a3 3 0 106 0 3 3 0 00-6 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-amber-600">{employees.length}</p>
              <p className="text-xs text-slate-400 mt-1">Workforce members</p>
            </div>
          </div>
        </div>
      )}

      {/* --- MANAGE USERS TAB --- */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
            <p className="text-slate-500 mt-1 text-sm">Create admins and manage system access.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Admin Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
                <h2 className="text-lg font-semibold text-slate-800 mb-5">Create New Admin</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="John Doe"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="john@company.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Engineering"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 px-6 py-3 bg-secondary hover:bg-secondary-light disabled:bg-secondary/50 text-white font-semibold rounded-xl shadow-lg shadow-secondary/20 transition-all duration-200 cursor-pointer"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating...
                      </span>
                    ) : "Create Admin"}
                  </button>
                </form>
              </div>
            </div>

            {/* Users Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-800">All Users Directory</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">{users.length} users</span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-400 mt-3">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-3 opacity-40">👥</div>
                    <p className="text-slate-500 font-medium">No users found</p>
                    <p className="text-sm text-slate-400 mt-1">Create your first admin to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/80">
                          <th className="px-6 py-3.5">User</th>
                          <th className="px-6 py-3.5">Role</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                                  {u.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-slate-800">{u.name}</span>
                                  <span className="block text-xs text-slate-400">{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${roleColors[u.role]}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-red-400"}`}></div>
                                <span className={`text-xs font-medium ${u.isActive ? "text-emerald-600" : "text-red-500"}`}>
                                  {u.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {u.role !== "superadmin" && (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => toggleStatus(u._id)}
                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
                                      u.isActive
                                        ? "text-red-500 border-red-200 hover:bg-red-50"
                                        : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                    }`}
                                  >
                                    {u.isActive ? "Deactivate" : "Activate"}
                                  </button>
                                  <button
                                    onClick={() => deleteUser(u._id)}
                                    className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 rounded-lg font-medium transition-all cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
              <h1 className="text-2xl font-bold text-slate-800">Global Settings</h1>
              <p className="text-slate-500 mt-1 text-sm">Configure company-wide policies and working hours.</p>
            </div>
            <button 
              onClick={handleSaveSettings}
              className={`px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                settingsSaved
                  ? "bg-accent text-white shadow-accent/20"
                  : "bg-secondary hover:bg-secondary-light text-white shadow-secondary/20"
              }`}
            >
              {settingsSaved ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Saved!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Settings
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Company Details</h2>
              </div>
              <div>
                <label className={labelClass}>Organization Name</label>
                <input 
                  type="text" 
                  value={globalSettings.companyName}
                  onChange={(e) => updateSetting("companyName", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Working Hours</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Start Time</label>
                  <input 
                    type="time" 
                    value={globalSettings.workStartTime}
                    onChange={(e) => updateSetting("workStartTime", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>End Time</label>
                  <input 
                    type="time" 
                    value={globalSettings.workEndTime}
                    onChange={(e) => updateSetting("workEndTime", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Working schedule: {globalSettings.workStartTime} — {globalSettings.workEndTime}
              </div>
            </div>

            {/* Leave Policy */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Leave Policy</h2>
                  <p className="text-xs text-slate-400">Annual leave quotas per employee (in days)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🏥</span>
                    <span className="text-sm font-semibold text-slate-700">Sick Leaves</span>
                  </div>
                  <input 
                    type="number" 
                    min="0"
                    value={globalSettings.sickLeaves}
                    onChange={(e) => updateSetting("sickLeaves", parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl text-slate-800 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-slate-400 text-center mt-2">days per year</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🌴</span>
                    <span className="text-sm font-semibold text-slate-700">Casual Leaves</span>
                  </div>
                  <input 
                    type="number" 
                    min="0"
                    value={globalSettings.casualLeaves}
                    onChange={(e) => updateSetting("casualLeaves", parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-slate-800 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-slate-400 text-center mt-2">days per year</p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">⭐</span>
                    <span className="text-sm font-semibold text-slate-700">Earned Leaves</span>
                  </div>
                  <input 
                    type="number" 
                    min="0"
                    value={globalSettings.earnedLeaves}
                    onChange={(e) => updateSetting("earnedLeaves", parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-slate-800 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-slate-400 text-center mt-2">days per year</p>
                </div>
              </div>
              <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Total annual leave entitlement: <strong className="text-slate-700">{globalSettings.sickLeaves + globalSettings.casualLeaves + globalSettings.earnedLeaves} days</strong> per employee
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
};

export default Dashboard;
