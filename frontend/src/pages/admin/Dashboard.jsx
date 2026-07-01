import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import MainLayout from "../../components/layout/MainLayout";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateManager = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      await axiosInstance.post("/api/users/create", {
        ...formData,
        role: "manager",
      });
      setMessage({ text: "Manager created successfully!", type: "success" });
      setFormData({ name: "", email: "", password: "", department: "" });
      fetchUsers();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to create manager", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const roleColors = {
    manager: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    employee: "bg-amber-100 text-amber-700 border border-amber-200",
  };

  const managers = users.filter((u) => u.role === "manager");
  const employees = users.filter((u) => u.role === "employee");

  const inputClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

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

      {/* --- OVERVIEW TAB --- */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Overview of organization structure.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">Total Managers</p>
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
                <p className="text-sm font-medium text-slate-500">Total Employees</p>
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

      {/* --- MANAGE MANAGERS TAB --- */}
      {activeTab === "managers" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manage Managers</h1>
            <p className="text-slate-500 mt-1 text-sm">Appoint new managers and oversee departments.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
                <h2 className="text-lg font-semibold text-slate-800 mb-5">Appoint Manager</h2>
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
                  <button type="submit" disabled={submitting} className="w-full mt-2 px-6 py-3 bg-secondary hover:bg-secondary-light disabled:bg-secondary/50 text-white font-semibold rounded-xl shadow-lg shadow-secondary/20 transition-all duration-200 cursor-pointer">
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Appointing...
                      </span>
                    ) : "Appoint Manager"}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-800">Current Managers</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">{managers.length} managers</span>
                </div>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-400 mt-3">Loading managers...</p>
                  </div>
                ) : managers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-3 opacity-40">👤</div>
                    <p className="text-slate-500 font-medium">No managers found</p>
                    <p className="text-sm text-slate-400 mt-1">Appoint your first manager to get started</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {managers.map(u => (
                      <div key={u._id} className="p-5 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-sm font-bold text-emerald-600">
                            {u.name?.charAt(0)?.toUpperCase() || "M"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                            {u.department && <p className="text-xs text-slate-400 mt-0.5">Dept: {u.department}</p>}
                          </div>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${roleColors[u.role]}`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">All Employees</h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">{employees.length} employees</span>
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400 mt-3">Loading employees...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3 opacity-40">👥</div>
                <p className="text-slate-500 font-medium">No employees found</p>
                <p className="text-sm text-slate-400 mt-1">Employees will appear here once created by managers</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/80">
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Email</th>
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-xs font-bold text-amber-600">
                              {u.name?.charAt(0)?.toUpperCase() || "E"}
                            </div>
                            <span className="text-sm font-medium text-slate-800">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{u.department || "—"}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-red-400"}`}></div>
                            <span className={`text-xs font-medium ${u.isActive ? "text-emerald-600" : "text-red-500"}`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
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

      {/* --- DEPARTMENTS TAB --- */}
      {activeTab === "departments" && (
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Departments</h1>
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
            <div className="text-5xl mb-4 opacity-40">🏢</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Department Architecture</h3>
            <p className="text-sm text-slate-400">Future implementation for org charts and department budgets.</p>
          </div>
        </div>
      )}

    </MainLayout>
  );
};

export default Dashboard;
