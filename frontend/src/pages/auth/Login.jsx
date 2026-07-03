import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const roleRedirects = {
  superadmin: "/superadmin/dashboard",
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/employee/dashboard",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const role = await login(email, password);
      navigate(roleRedirects[role] || "/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800">
      {/* Left side: Branding / Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-secondary p-12 flex-col justify-between relative overflow-hidden text-white">
        {/* Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">HRMS</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md animate-fade-in-up">
          <h2 className="text-4xl font-extrabold mb-6 leading-tight">
            Manage your workforce with confidence.
          </h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            A complete HR operating system that helps you scale your team, automate attendance, and simplify leave management.
          </p>
          <div className="flex items-center gap-4 text-white/90 font-medium">
            <svg className="w-6 h-6 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Loved by 10,000+ growing enterprises
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          &copy; {new Date().getFullYear()} HRMS Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg shadow-primary/20 mb-4">
              <span className="text-white font-bold text-xl">H</span>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 mt-2 font-medium">Sign in to your HRMS account</p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Dev Demo credentials */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-widest mb-4 text-center">Quick Login (Dev Only)</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <button
                onClick={() => { setEmail("superadmin@hrms.com"); setPassword("password123"); }}
                className="py-2.5 bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-200 rounded-xl transition-all cursor-pointer font-semibold shadow-sm"
              >
                Superadmin
              </button>
              <button
                onClick={() => { setEmail("admin@hrms.com"); setPassword("password123"); }}
                className="py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl transition-all cursor-pointer font-semibold shadow-sm"
              >
                Admin
              </button>
              <button
                onClick={() => { setEmail("manager@hrms.com"); setPassword("password123"); }}
                className="py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all cursor-pointer font-semibold shadow-sm"
              >
                Manager
              </button>
              <button
                onClick={() => { setEmail("employee@hrms.com"); setPassword("password123"); }}
                className="py-2.5 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200 hover:border-amber-200 rounded-xl transition-all cursor-pointer font-semibold shadow-sm"
              >
                Employee
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-8 font-medium">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:text-primary-dark font-bold transition-colors"
            >
              Register your company
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
