import { useState } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const features = [
  {
    title: "Attendance Tracking",
    description:
      "Effortless clock-in and clock-out with real-time tracking, geofencing support, and automated timesheets for your entire workforce.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "from-blue-500 to-cyan-400",
    bgGlow: "bg-blue-500/10",
  },
  {
    title: "Leave Management",
    description:
      "Streamlined leave applications, multi-level approvals, balance tracking, and customizable leave policies tailored to your organization.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "from-emerald-500 to-teal-400",
    bgGlow: "bg-emerald-500/10",
  },
  {
    title: "Team Management",
    description:
      "Build, organize and oversee teams with role-based hierarchies, department structuring, and task delegation across your organization.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "from-violet-500 to-purple-400",
    bgGlow: "bg-violet-500/10",
  },
  {
    title: "Reports & Analytics",
    description:
      "Powerful dashboards with visual insights into attendance trends, leave patterns, headcount analytics, and workforce productivity.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "from-amber-500 to-orange-400",
    bgGlow: "bg-amber-500/10",
  },
];

const stats = [
  { label: "Companies Trust Us", value: "500+" },
  { label: "Active Employees", value: "50K+" },
  { label: "Uptime Guaranteed", value: "99.9%" },
  { label: "Support Response", value: "<2hrs" },
];

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary text-white overflow-x-hidden" id="home">
      {/* ============ NAVBAR ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-secondary/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">HRMS</span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-accent after:transition-all after:duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="hidden md:inline-flex px-5 py-2.5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold rounded-xl transition-all duration-300"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="hidden md:inline-flex px-5 py-2.5 bg-gradient-to-r from-secondary to-secondary-light text-white text-sm font-semibold rounded-xl shadow-lg shadow-secondary/25 hover:shadow-secondary/40 hover:scale-105 transition-all duration-300"
              >
                Login
              </Link>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-primary-dark/95 backdrop-blur-xl border-t border-white/5 animate-slide-down">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                Register
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-secondary hover:bg-secondary/10 rounded-xl transition-colors"
              >
                Login →
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-light/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 border border-secondary/20 rounded-full text-sm text-secondary-light font-medium mb-8 animate-fade-in-up">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
              Trusted by 500+ companies worldwide
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight animate-fade-in-up" style={{animationDelay: "100ms"}}>
              Manage Your HR{" "}
              <br className="hidden sm:block" />
              Operations{" "}
              <span className="bg-gradient-to-r from-secondary via-accent to-secondary-light bg-clip-text text-transparent">
                Seamlessly
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: "200ms"}}>
              From attendance tracking to leave management, team oversight to powerful analytics — 
              everything your HR department needs in one unified, modern platform.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{animationDelay: "300ms"}}>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-secondary to-secondary-light text-white font-bold rounded-xl shadow-2xl shadow-secondary/30 hover:shadow-secondary/50 hover:scale-105 transition-all duration-300 text-center"
              >
                Get Started Free →
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 font-semibold rounded-xl transition-all duration-300 text-center"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: "400ms"}}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-5 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-sm"
              >
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section id="features" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-dark/50 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">
              What We Offer
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Manage HR
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Our comprehensive suite of tools empowers your HR team to work smarter, not harder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white/[0.03] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 ${feature.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white/90 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ABOUT SECTION ============ */}
      <section id="about" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-secondary/20 to-accent/10 border border-white/5 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent"></div>
                <div className="relative z-10 space-y-6">
                  {/* Mock dashboard card */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-white">Team Overview</span>
                      <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-1 rounded-lg">Live</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-secondary">24</p>
                        <p className="text-xs text-slate-400">Present</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-400">3</p>
                        <p className="text-xs text-slate-400">On Leave</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-accent">98%</p>
                        <p className="text-xs text-slate-400">Rate</p>
                      </div>
                    </div>
                  </div>
                  {/* Mock approval card */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center text-xs font-bold text-violet-300">JD</div>
                      <div>
                        <p className="text-sm font-medium text-white">Leave Request</p>
                        <p className="text-xs text-slate-400">John Doe — Casual Leave</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1.5 bg-accent/10 text-accent text-xs font-semibold rounded-lg">✓ Approve</span>
                      <span className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-semibold rounded-lg">✕ Reject</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl shadow-accent/30 animate-float">
                ✨ Real-time Updates
              </div>
            </div>

            {/* Right content */}
            <div>
              <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">About Us</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Built for Modern{" "}
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  HR Teams
                </span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                HRMS was born from a simple idea: managing people shouldn't be complicated. We've built a platform that combines powerful automation with an intuitive interface, so your HR team can focus on what truly matters — your people.
              </p>
              <div className="space-y-4">
                {[
                  "Role-based access for Superadmin, Admin, Manager & Employee",
                  "Real-time attendance tracking with automated calculations",
                  "Configurable leave policies with multi-level approval workflows",
                  "Comprehensive analytics dashboards for data-driven decisions",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT / CTA SECTION ============ */}
      <section id="contact" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Contact Us</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Ready to Transform Your{" "}
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              HR Operations?
            </span>
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Join hundreds of companies that have already streamlined their HR processes with HRMS. Get started in minutes.
          </p>

          {/* Contact form */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 max-w-xl mx-auto">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/30 transition-all text-sm"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/30 transition-all text-sm"
                />
              </div>
              <textarea
                rows={4}
                placeholder="Tell us about your organization..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/30 transition-all text-sm resize-none"
              ></textarea>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-secondary to-secondary-light text-white font-bold rounded-xl shadow-lg shadow-secondary/25 hover:shadow-secondary/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-primary-dark/60 border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">HRMS</span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                A comprehensive Human Resource Management System built to simplify workforce management for organizations of all sizes.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <div className="space-y-2.5">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
              <div className="space-y-2.5 text-sm text-slate-400">
                <p>📧 hr@hrmssolutions.com</p>
                <p>📞 +91 6354855919</p>
                <p>📍  Valsad, India</p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} HRMS Solutions. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
