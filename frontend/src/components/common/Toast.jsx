import { useEffect, useState } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-[60]">
      <div 
        className={`px-6 py-4 rounded-xl text-sm font-semibold shadow-xl border flex items-center gap-3 transition-all duration-300 ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
        } ${
          type === "success"
            ? "bg-white border-accent/20 text-slate-800"
            : "bg-white border-danger/20 text-slate-800"
        }`}
      >
        {type === "success" ? (
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-danger">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        {message}
      </div>
    </div>
  );
};

export default Toast;
