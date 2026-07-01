import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
        <p className="text-slate-400 mb-8 max-w-md text-sm leading-relaxed">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 font-medium rounded-xl transition-all duration-200 cursor-pointer text-sm"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2.5 bg-secondary hover:bg-secondary-light text-white font-semibold rounded-xl shadow-lg shadow-secondary/25 transition-all duration-200 cursor-pointer text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
