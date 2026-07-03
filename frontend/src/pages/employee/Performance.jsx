import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

const Performance = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get("/api/performance/my");
      setReviews(res.data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "text-emerald-500";
    if (rating >= 3.5) return "text-primary";
    if (rating >= 2.5) return "text-amber-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">My Performance Reviews</h1>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Reviews Yet</h3>
          <p className="text-slate-500">Your manager hasn't submitted any performance reviews yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Review for {new Date(review.reviewPeriod.year, review.reviewPeriod.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Reviewed by: <span className="text-slate-700">{review.reviewerId?.name}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overall</span>
                  <div className={`text-2xl font-black flex items-center gap-1 ${getRatingColor(review.overallRating)}`}>
                    {review.overallRating.toFixed(1)} <span className="text-lg">⭐</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {Object.entries(review.ratings).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-slate-600 capitalize">{key}</span>
                        <span className="text-sm font-bold text-slate-800">{value}/5</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(value / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {review.comments && (
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">Manager's Comments</h4>
                    <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl italic">
                      "{review.comments}"
                    </p>
                  </div>
                )}

                {review.goals && (
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Goals for Next Period
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {review.goals}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Performance;
