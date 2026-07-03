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
import Performance from "./Performance";
import Payroll from "../employee/Payroll";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  const [team, setTeam] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Task Management State
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("hrms_manager_tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [taskFilter, setTaskFilter] = useState("all");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "medium",
    dueDate: "",
  });

  // Persist tasks to localStorage
  useEffect(() => {
    localStorage.setItem("hrms_manager_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamRes, leavesRes, myAttRes] = await Promise.all([
        axiosInstance.get("/api/users/my-team"),
        axiosInstance.get("/api/leave/pending"),
        axiosInstance.get("/api/attendance/my")
      ]);
      setTeam(teamRes.data.users);
      setPendingLeaves(leavesRes.data.leaves);
      setMyAttendance(myAttRes.data.attendance || []);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to fetch data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    if (activeTab === "attendance") {
      fetchTeamAttendance();
    }
  }, [activeTab]);

  const fetchTeamAttendance = async () => {
    try {
      setLoadingAttendance(true);
      const res = await axiosInstance.get("/api/attendance/team");
      setTeamAttendance(res.data.attendance);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to fetch attendance", type: "error" });
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.post("/api/users/create", {
        ...formData,
        role: "employee",
      });
      setMessage({ text: "Employee created successfully!", type: "success" });
      setFormData({ name: "", email: "", password: "", department: "" });
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to create employee", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const reviewLeave = async (leaveId, status) => {
    try {
      await axiosInstance.patch(`/api/leave/${leaveId}/review`, { status });
      setMessage({ text: `Leave ${status} successfully!`, type: "success" });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to review leave", type: "error" });
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Task handlers
  const handleAddTask = (e) => {
    e.preventDefault();
    const newTask = {
      id: Date.now().toString(),
      ...taskForm,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    setTaskForm({ title: "", description: "", assignee: "", priority: "medium", dueDate: "" });
    setShowTaskForm(false);
    setMessage({ text: "Task created successfully!", type: "success" });
  };

  const toggleTaskComplete = (taskId) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === "all") return true;
    return t.status === taskFilter;
  });

  const priorityConfig = {
    high: { label: "High", bgClass: "bg-red-100 text-red-700 border-red-200" },
    medium: { label: "Medium", bgClass: "bg-amber-100 text-amber-700 border-amber-200" },
    low: { label: "Low", bgClass: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all text-sm";
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
            <h1 className="text-2xl font-bold text-slate-800">Manager Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Snapshot of your team and tasks requiring attention.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <button onClick={() => setActiveTab('team')} className="text-left w-full focus:outline-none focus:ring-4 focus:ring-emerald-500/20 rounded-2xl transition-all">
              <StatCard 
                title="Team Members" 
                value={team.length} 
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                color="green"
                subtitle="View team details →"
              />
            </button>
            <button onClick={() => setActiveTab('leaves')} className="text-left w-full focus:outline-none focus:ring-4 focus:ring-amber-500/20 rounded-2xl transition-all">
              <StatCard 
                title="Pending Leaves" 
                value={pendingLeaves.length} 
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                color="orange"
                subtitle="Review requests →"
              />
            </button>
            <button onClick={() => setActiveTab('tasks')} className="text-left w-full focus:outline-none focus:ring-4 focus:ring-blue-500/20 rounded-2xl transition-all">
              <StatCard 
                title="Active Tasks" 
                value={tasks.filter(t => t.status === 'pending').length} 
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                color="blue"
                subtitle="Manage tasks →"
              />
            </button>
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

      {/* --- MY TEAM TAB --- */}
      {activeTab === "team" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">My Team</h1>
              <p className="text-slate-500 mt-1 text-sm">Manage and expand your team members.</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Onboard Employee
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <Loader type="skeleton" />
            ) : team.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3 opacity-40">👥</div>
                <p className="text-slate-500 font-medium">No team members yet</p>
                <p className="text-sm text-slate-400 mt-1">Onboard your first employee to get started</p>
              </div>
            ) : (
              <Table headers={["Name", "Department", "Status"]}>
                {team.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center text-sm font-bold text-accent">
                          {emp.name?.charAt(0)?.toUpperCase() || "E"}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800">{emp.name}</span>
                          <span className="block text-xs font-medium text-slate-500">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {emp.department || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge type={emp.isActive ? "active" : "inactive"}>{emp.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>

          {/* Create Employee Modal */}
          <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Onboard Employee">
            <form onSubmit={handleCreateEmployee} className="space-y-4">
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
              <button type="submit" disabled={submitting} className="w-full mt-4 px-6 py-3 bg-accent hover:bg-accent-light disabled:bg-accent/50 text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all duration-200 cursor-pointer">
                {submitting ? "Onboarding..." : "Create Employee"}
              </button>
            </form>
          </Modal>
        </div>
      )}

      {/* --- TASKS TAB --- */}
      {activeTab === "tasks" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
              <p className="text-slate-500 mt-1 text-sm">Assign and track tasks for your team members.</p>
            </div>
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              {showTaskForm ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Task
                </>
              )}
            </button>
          </div>

          {/* Add Task Form */}
          {showTaskForm && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fade-in-up">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Create New Task</h3>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Task Title</label>
                    <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required placeholder="e.g. Complete Q3 report" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Description</label>
                    <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Add task details..." rows={3} className={`${inputClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>Assign To</label>
                    <select value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })} required className={inputClass}>
                      <option value="">Select team member</option>
                      {team.map(emp => <option key={emp._id} value={emp.name}>{emp.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Priority</label>
                    <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className={inputClass}>
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Due Date</label>
                    <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} required className={inputClass} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowTaskForm(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white text-sm font-bold rounded-xl shadow-lg shadow-accent/20 transition-all cursor-pointer">
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-slate-100 w-fit">
            {[
              { key: "all", label: "All", count: tasks.length },
              { key: "pending", label: "Pending", count: tasks.filter(t => t.status === "pending").length },
              { key: "completed", label: "Completed", count: tasks.filter(t => t.status === "completed").length },
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setTaskFilter(filter.key)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  taskFilter === filter.key ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {filter.label}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-md ${ taskFilter === filter.key ? "bg-white/20" : "bg-slate-100" }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          {/* Task Cards */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
              <div className="text-5xl mb-4 opacity-40">📋</div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">{taskFilter === "all" ? "No tasks yet" : `No ${taskFilter} tasks`}</h3>
              <p className="text-sm text-slate-400">{taskFilter === "all" ? 'Click "Add Task" to create your first task' : `You have no ${taskFilter} tasks at the moment`}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map(task => (
                <div key={task.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${task.status === "completed" ? "border-emerald-200 opacity-80" : "border-slate-100"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-slate-800 ${task.status === "completed" ? "line-through text-slate-400" : ""}`}>{task.title}</h4>
                      {task.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer ml-2" title="Delete task">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {task.assignee}
                    </span>
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider border ${priorityConfig[task.priority]?.bgClass}`}>
                      {priorityConfig[task.priority]?.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {formatDate(task.dueDate)}
                    </span>
                    {task.status === "completed" && (
                      <span className="text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                        ✓ Done
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer border ${
                      task.status === "completed" ? "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100" : "bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-white"
                    }`}
                  >
                    {task.status === "completed" ? "↩ Mark as Pending" : "✓ Mark Complete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- ATTENDANCE TAB --- */}
      {activeTab === "attendance" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Team Attendance</h1>
            <p className="text-slate-500 mt-1 text-sm">Monitor your team's check-in and check-out times.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loadingAttendance ? (
              <Loader type="skeleton" />
            ) : teamAttendance.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3 opacity-40">📅</div>
                <p className="text-slate-500 font-medium">No attendance records found</p>
                <p className="text-sm text-slate-400 mt-1">Your team's attendance will appear here once they start checking in.</p>
              </div>
            ) : (
              <Table headers={["Employee", "Date", "Check In", "Check Out", "Work Hours", "Status"]}>
                {teamAttendance.slice(0, 50).map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{a.userId?.name || "Unknown"}</div>
                      <div className="text-xs text-slate-500">{a.userId?.department || "—"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{formatDate(a.date)}</td>
                    <td className="px-6 py-4 text-sm text-primary font-bold">
                      {a.checkIn ? new Date(a.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-amber-500 font-bold">
                      {a.checkOut ? new Date(a.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-bold">
                      {a.workHours ? `${a.workHours}h` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {a.status === "present" ? <Badge type="active">Present</Badge> : 
                       a.status === "half-day" ? <Badge type="warning">Half Day</Badge> :
                       <Badge type="inactive">Absent</Badge>}
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </div>
      )}

      {/* --- LEAVE REQUESTS TAB --- */}
      {activeTab === "leaves" && (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Leave Requests</h1>
            <p className="text-slate-500 mt-1 text-sm">Approve or reject leave applications from your team.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Pending Action Required</h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">{pendingLeaves.length} pending</span>
            </div>
            
            {loading ? (
              <Loader type="skeleton" />
            ) : pendingLeaves.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4 opacity-40">🌴</div>
                <p className="text-slate-500 font-medium text-lg">No pending leave requests</p>
                <p className="text-sm text-slate-400 mt-2">Your team is fully available.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingLeaves.map((leave) => (
                  <div key={leave._id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                            {leave.employeeId?.name?.charAt(0)?.toUpperCase() || "E"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{leave.employeeId?.name || "Employee"}</p>
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">{leave.leaveType}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 mb-3">
                          <span className="flex items-center gap-1 font-medium">📅 {formatDate(leave.startDate)} → {formatDate(leave.endDate)}</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-xs font-bold">{leave.totalDays} day{leave.totalDays > 1 ? "s" : ""}</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 border border-slate-100">
                          <span className="text-slate-400 block mb-1 text-[10px] uppercase tracking-wider font-bold">Reason</span>
                          "{leave.reason}"
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button onClick={() => reviewLeave(leave._id, "approved")} className="flex-1 lg:flex-none px-6 py-2.5 bg-accent/10 text-accent hover:bg-accent border border-accent/20 hover:border-accent hover:text-white rounded-xl text-sm font-bold transition-all cursor-pointer">
                          ✓ Approve
                        </button>
                        <button onClick={() => reviewLeave(leave._id, "rejected")} className="flex-1 lg:flex-none px-6 py-2.5 bg-red-50 text-red-500 hover:bg-red-500 border border-red-200 hover:border-red-500 hover:text-white rounded-xl text-sm font-bold transition-all cursor-pointer">
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PERFORMANCE REVIEWS TAB --- */}
      {activeTab === "performance-reviews" && (
        <div className="animate-fade-in-up">
          <Performance setMessage={setMessage} />
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

    </MainLayout>
  );
};

export default Dashboard;
