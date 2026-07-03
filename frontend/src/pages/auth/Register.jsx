import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const Register = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required.";
    }

    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = "Company email is required.";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!validate()) return;

    setLoading(true);
    try {
      await axiosInstance.post("/api/auth/register-superadmin", {
        companyName: formData.companyName.trim(),
        companyEmail: formData.companyEmail.trim(),
        companyPhone: formData.companyPhone.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setMessage({
        text: "Company registered! Redirecting to login...",
        type: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const serverMsg = err.response?.data?.message || "";

      if (serverMsg.toLowerCase().includes("already exists")) {
        setMessage({
          text: "A company with this email already exists. Please login.",
          type: "error",
        });
      } else {
        setMessage({
          text: serverMsg || "Registration failed. Please try again.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full px-4 py-3 bg-slate-50 border ${
      errors[fieldName] ? "border-danger ring-1 ring-danger/50" : "border-slate-200"
    } rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm`;

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800">
      {/* Left side: Branding / Illustration */}
      <div className="hidden lg:flex w-[40%] bg-gradient-to-br from-primary to-secondary p-12 flex-col justify-between relative overflow-hidden text-white fixed h-screen">
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
            Start your journey with us today.
          </h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            Create your workspace in seconds. Invite your team, set up your policies, and streamline your entire HR process.
          </p>
          <div className="space-y-4 text-white/90 font-medium">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                1
              </div>
              <span>Register your company profile</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                2
              </div>
              <span>Create your admin account</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                3
              </div>
              <span>Start automating your HR workflow</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          &copy; {new Date().getFullYear()} HRMS Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: Registration Form */}
      <div className="w-full lg:w-[60%] lg:ml-[40%] flex items-center justify-center p-6 sm:p-12 min-h-screen">
        <div className="w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg shadow-primary/20 mb-4">
              <span className="text-white font-bold text-xl">H</span>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your workspace</h1>
            <p className="text-slate-500 mt-2 font-medium">Set up your company and super admin account</p>
          </div>

          {message.text && (
            <div className={`px-4 py-4 rounded-xl mb-8 text-sm font-medium flex items-start gap-3 shadow-sm ${
              message.type === "success" ? "bg-accent/10 border border-accent/20 text-emerald-800" : "bg-danger/10 border border-danger/20 text-red-800"
            }`}>
              {message.type === "success" ? (
                <svg className="w-5 h-5 flex-shrink-0 text-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0 text-danger" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Details */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">1</div>
                <h3 className="text-lg font-bold text-slate-800">Company Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name</label>
                  <input id="companyName" name="companyName" type="text" value={formData.companyName} onChange={handleChange} placeholder="Acme Corporation" className={inputClass("companyName")} />
                  {errors.companyName && <p className="mt-1.5 text-xs font-medium text-danger">{errors.companyName}</p>}
                </div>
                <div>
                  <label htmlFor="companyEmail" className="block text-sm font-semibold text-slate-700 mb-1.5">Company Email</label>
                  <input id="companyEmail" name="companyEmail" type="email" value={formData.companyEmail} onChange={handleChange} placeholder="contact@acme.com" className={inputClass("companyEmail")} />
                  {errors.companyEmail && <p className="mt-1.5 text-xs font-medium text-danger">{errors.companyEmail}</p>}
                </div>
                <div>
                  <label htmlFor="companyPhone" className="block text-sm font-semibold text-slate-700 mb-1.5">Company Phone <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input id="companyPhone" name="companyPhone" type="text" value={formData.companyPhone} onChange={handleChange} placeholder="+1 (555) 000-0000" className={inputClass("companyPhone")} />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Admin Details */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">2</div>
                <h3 className="text-lg font-bold text-slate-800">Super Admin Account</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="John Doe" className={inputClass("name")} />
                  {errors.name && <p className="mt-1.5 text-xs font-medium text-danger">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Email</label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@acme.com" className={inputClass("email")} />
                  {errors.email && <p className="mt-1.5 text-xs font-medium text-danger">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="••••••••" className={`${inputClass("password")} pr-12`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showPassword ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />}
                      </svg>
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs font-medium text-danger">{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputClass("confirmPassword")} />
                  {errors.confirmPassword && <p className="mt-1.5 text-xs font-medium text-danger">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 mt-4 text-lg"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Setting up workspace...
                </span>
              ) : (
                "Complete Registration"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-10 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary-dark font-bold transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
