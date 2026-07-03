import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const features = [
  { title: "Attendance Tracking", desc: "Real-time clock in/out with automated timesheets.", icon: "⏰" },
  { title: "Leave Management", desc: "Multi-level approvals and automated leave balances.", icon: "🏖️" },
  { title: "Team Hierarchies", desc: "Manage departments, managers, and employees easily.", icon: "👥" },
  { title: "Analytics & Reports", desc: "Visual dashboards for deep workforce insights.", icon: "📊" },
];

const steps = [
  { step: "1", title: "Register Company", desc: "Sign up and create your workspace in seconds." },
  { step: "2", title: "Invite Team", desc: "Add managers and employees to your departments." },
  { step: "3", title: "Automate HR", desc: "Let our system handle attendance, leaves, and tracking." },
];

const pricing = [
  { name: "Free", price: "$0", desc: "For small teams just getting started.", features: ["Up to 10 employees", "Basic Attendance", "Leave Management"] },
  { name: "Basic", price: "$49", desc: "Perfect for growing businesses.", features: ["Up to 50 employees", "Advanced Reports", "Priority Support"], popular: true, comingSoon: true },
  { name: "Premium", price: "$99", desc: "Everything you need for a large enterprise.", features: ["Unlimited employees", "Custom Policies", "24/7 Dedicated Support"], comingSoon: true },
];

const faqs = [
  { q: "Is there a free trial?", a: "Yes! You can start with our Free plan which is free forever for up to 10 employees." },
  { q: "Can I upgrade my plan later?", a: "Absolutely. You can upgrade or downgrade your plan at any time from the billing dashboard." },
  { q: "Is my data secure?", a: "We use enterprise-grade encryption to ensure your data is always safe and secure." },
  { q: "Do you offer customer support?", a: "Yes, Basic and Premium plans include priority and 24/7 support respectively." },
  { q: "Can managers approve leaves?", a: "Yes, our hierarchical system routes leave requests to the direct manager for approval." },
];

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300" id="home">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">HRMS</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light transition-colors">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                )}
              </button>

              <Link to="/login" className="hidden md:block text-sm font-bold text-primary dark:text-primary-light hover:text-primary-dark transition-colors">Log In</Link>
              <Link to="/register" className="hidden md:block px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                Get Started
              </Link>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 dark:text-slate-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 absolute w-full shadow-xl">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-300 font-semibold">{link.label}</a>
              ))}
              <hr className="border-slate-100 dark:border-slate-800" />
              <Link to="/login" className="text-primary dark:text-primary-light font-bold">Log In</Link>
              <Link to="/register" className="text-center px-6 py-3 bg-primary text-white font-bold rounded-xl">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-900">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-8 animate-fade-in-up">
            Modern HR Management, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Simplified.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Empower your team with our all-in-one platform for attendance, leaves, and workforce analytics. Designed for growing enterprises.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Link to="/register" className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all text-lg">
              Start for Free
            </Link>
            <a href="#how-it-works" className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 dark:hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-lg">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Everything You Need</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">A complete suite of tools to manage your workforce efficiently.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform origin-left">{f.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-slate-900 dark:bg-slate-950 text-white px-4 relative overflow-hidden border-y border-slate-800">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Get up and running in minutes, not days.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-primary/20">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-900 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Choose the plan that fits your business needs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((p, i) => (
              <div key={i} className={`bg-white dark:bg-slate-800 rounded-3xl p-8 border ${p.popular ? 'border-primary dark:border-primary ring-4 ring-primary/10 dark:ring-primary/20 scale-105 shadow-2xl' : 'border-slate-200 dark:border-slate-700 shadow-lg'} relative flex flex-col ${p.comingSoon ? 'opacity-80' : ''}`}>
                {p.popular && !p.comingSoon && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</span>}
                {p.comingSoon && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Coming Soon</span>}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{p.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{p.desc}</p>
                <div className="mb-8"><span className="text-5xl font-extrabold text-slate-900 dark:text-white">{p.price}</span><span className="text-slate-500 dark:text-slate-400">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  {p.features.map((feat, j) => (
                    <li key={j} className={`flex items-center gap-3 font-medium ${p.comingSoon ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                      <svg className={`w-5 h-5 flex-shrink-0 ${p.comingSoon ? 'text-slate-300 dark:text-slate-600' : 'text-accent'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                {p.comingSoon ? (
                  <button disabled className="w-full py-4 rounded-xl font-bold text-center transition-all bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed">
                    Coming Soon
                  </button>
                ) : (
                  <Link to="/register" className={`w-full py-4 rounded-xl font-bold text-center transition-all ${p.popular ? 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                    Choose Plan
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white dark:bg-slate-900 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-slate-600 dark:text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8 border-b border-slate-800 pb-8">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><span className="text-white font-bold">H</span></div>
              <span className="text-xl font-extrabold text-white">HRMS</span>
            </div>
            <p className="max-w-sm">The modern HR operating system for your entire workforce. Built for scale, designed for humans.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} HRMS Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-white">Twitter</span>
            <span className="cursor-pointer hover:text-white">LinkedIn</span>
            <span className="cursor-pointer hover:text-white">GitHub</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
