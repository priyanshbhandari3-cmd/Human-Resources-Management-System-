const Loader = ({ type = "skeleton" }) => {
  if (type === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium animate-pulse">Loading data...</p>
      </div>
    );
  }

  // Skeleton
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-8 bg-slate-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
};

export default Loader;
