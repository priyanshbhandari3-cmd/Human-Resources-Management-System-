import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Navbar = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="h-16 bg-white shadow-sm border-b border-slate-100 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile menu button + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:block">
          <p className="text-sm text-slate-500">
            Welcome back, <span className="text-slate-800 font-bold">{user?.name || "User"}</span>
          </p>
        </div>
      </div>

      {/* Right: User info + Logout */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

        {/* User avatar + name on desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name || "User"}</p>
            <p className="text-[11px] text-slate-500 capitalize font-medium">{user?.role || "employee"}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="px-3 py-2 bg-slate-50 hover:bg-red-50 border border-slate-100 hover:border-red-100 text-slate-500 hover:text-red-500 rounded-xl transition-all duration-200 text-sm font-semibold flex items-center gap-2 cursor-pointer ml-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
