const StatCard = ({ title, value, icon, color = "blue", subtitle }) => {
  const colors = {
    blue: "from-blue-500 to-blue-400 text-blue-500 bg-blue-50",
    green: "from-emerald-500 to-emerald-400 text-emerald-500 bg-emerald-50",
    purple: "from-purple-500 to-purple-400 text-purple-500 bg-purple-50",
    orange: "from-orange-500 to-orange-400 text-orange-500 bg-orange-50",
    red: "from-red-500 to-red-400 text-red-500 bg-red-50",
  };

  const selectedColor = colors[color] || colors.blue;
  const bgClass = selectedColor.split("bg-")[1] || "blue-50";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${bgClass} group-hover:scale-110 transition-transform duration-300`}>
          <span className={selectedColor.split(" ")[1]}>{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
      {subtitle && <p className="text-xs font-medium text-slate-400">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
