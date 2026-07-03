import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const icons = {
  overview: "📊",
  users: "👥",
  profile: "🏢",
  settings: "⚙️",
  managers: "👔",
  employees: "👨💼",
  departments: "🏢",
  team: "👥",
  attendance: "📅",
  leaves: "🏖️",
  home: "🏠",
  "apply-leave": "📝",
  "my-leaves": "📋",
  "my-attendance": "⏰",
  tasks: "✅",
  "my-payroll": "💰",
  "my-performance": "⭐",
  "my-tasks": "📋",
  "performance-reviews": "🎯",
  "payroll-management": "💸",
  reports: "📈",
  analytics: "📉",
};

const menuItems = {
  superadmin: [
    { id: "overview", label: "Dashboard", iconKey: "overview" },
    { id: "users", label: "Manage Users", iconKey: "users" },
    { id: "profile", label: "Company Profile", iconKey: "profile" },
    { id: "settings", label: "Settings", iconKey: "settings" },
    { id: "attendance", label: "Attendance", iconKey: "attendance" },
    { id: "payroll-management", label: "Payroll", iconKey: "payroll-management" },
    { id: "reports", label: "Reports", iconKey: "reports" },
    { id: "analytics", label: "Analytics", iconKey: "analytics" },
  ],
  admin: [
    { id: "overview", label: "Dashboard", iconKey: "overview" },
    { id: "managers", label: "Managers", iconKey: "managers" },
    { id: "employees", label: "Employees", iconKey: "employees" },
    { id: "departments", label: "Departments", iconKey: "departments" },
    { id: "attendance", label: "Attendance", iconKey: "attendance" },
    { id: "payroll-management", label: "Payroll Management", iconKey: "payroll-management" },
    { id: "reports", label: "Reports", iconKey: "reports" },
    { id: "analytics", label: "Analytics", iconKey: "analytics" },
  ],
  manager: [
    { id: "overview", label: "Dashboard", iconKey: "overview" },
    { id: "team", label: "My Team", iconKey: "team" },
    { id: "attendance", label: "Attendance", iconKey: "attendance" },
    { id: "leaves", label: "Leave Requests", iconKey: "leaves" },
    { id: "performance-reviews", label: "Performance Reviews", iconKey: "performance-reviews" },
    { id: "my-payroll", label: "My Payroll", iconKey: "my-payroll" },
    { id: "profile", label: "Profile", iconKey: "profile" },
  ],
  employee: [
    { id: "home", label: "Home", iconKey: "home" },
    { id: "attendance", label: "My Attendance", iconKey: "my-attendance" },
    { id: "my-tasks", label: "My Tasks", iconKey: "my-tasks" },
    { id: "apply-leave", label: "Apply Leave", iconKey: "apply-leave" },
    { id: "leaves", label: "My Leaves", iconKey: "my-leaves" },
    { id: "my-payroll", label: "My Payroll", iconKey: "my-payroll" },
    { id: "my-performance", label: "My Performance", iconKey: "my-performance" },
  ],
};

const roleLabels = {
  superadmin: { label: "Super Admin", color: "bg-purple-500/20 text-purple-300 border-purple-500/20" },
  admin: { label: "Administrator", color: "bg-blue-500/20 text-blue-300 border-blue-500/20" },
  manager: { label: "Manager", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/20" },
  employee: { label: "Employee", color: "bg-amber-500/20 text-amber-300 border-amber-500/20" },
};

const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine which sidebar menu to render based on URL route
  let activeRole = "employee";
  if (location.pathname.startsWith("/superadmin")) {
    activeRole = "superadmin";
  } else if (location.pathname.startsWith("/admin")) {
    activeRole = "admin";
  } else if (location.pathname.startsWith("/manager")) {
    activeRole = "manager";
  } else if (location.pathname.startsWith("/employee")) {
    activeRole = "employee";
  } else {
    activeRole = user?.role || "employee";
  }

  const items = menuItems[activeRole] || menuItems.employee;
  const roleInfo = roleLabels[activeRole] || roleLabels.employee;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar flex flex-col transition-transform duration-300 shadow-2xl shadow-black/50 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-5 border-b border-white/5">
          <div className="w-9 h-9 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">HRMS</span>
        </div>

        {/* Role Badge */}
        <div className="px-5 pt-5 pb-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${roleInfo.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
            {roleInfo.label}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-0.5">
          <div className="px-3 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Navigation
          </div>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group cursor-pointer ${
                activeTab === item.id
                  ? "bg-secondary/15 text-secondary-light border border-secondary/20 shadow-sm shadow-secondary/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <span className={`text-lg transition-transform duration-200 ${
                activeTab === item.id ? "scale-110" : "group-hover:scale-110"
              }`}>
                {icons[item.iconKey]}
              </span>
              {item.label}
              {activeTab === item.id && (
                <span className="ml-auto w-1.5 h-1.5 bg-secondary-light rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom user info */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center text-sm font-bold text-secondary-light">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500 capitalize">{activeRole}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
