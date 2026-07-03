const Badge = ({ children, type = "default", className = "" }) => {
  const styles = {
    superadmin: "bg-purple-100 text-purple-700 border-purple-200",
    admin: "bg-blue-100 text-blue-700 border-blue-200",
    manager: "bg-emerald-100 text-emerald-700 border-emerald-200",
    employee: "bg-slate-100 text-slate-700 border-slate-200",
    active: "bg-accent/10 text-accent border-accent/20",
    inactive: "bg-danger/10 text-danger border-danger/20",
    approved: "bg-accent/10 text-accent border-accent/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    rejected: "bg-danger/10 text-danger border-danger/20",
    primary: "bg-primary/10 text-primary border-primary/20",
    default: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const styleClass = styles[type] || styles.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
