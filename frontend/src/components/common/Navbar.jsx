import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="h-16 bg-navbar/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile menu button + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:block">
          <p className="text-sm text-slate-400">
            Welcome back, <span className="text-white font-medium">{user?.name || "User"}</span>
          </p>
        </div>
      </div>

      {/* Right: User info + Logout */}
      <div className="flex items-center gap-3">
        {/* Notifications bell placeholder */}
        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
        </button>

        <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

        {/* User avatar + name on desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center text-sm font-bold text-secondary-light">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-white leading-tight">{user?.name || "User"}</p>
            <p className="text-[11px] text-slate-500 capitalize">{user?.role || "employee"}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="px-3 py-2 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all duration-200 text-sm font-medium flex items-center gap-2 cursor-pointer"
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
