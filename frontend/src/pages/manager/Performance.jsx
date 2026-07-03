import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axiosInstance from "../../api/axiosInstance";

const Performance = ({ setMessage }) => {
  const [team, setTeam] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    reviewPeriod: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    ratings: { productivity: 3, teamwork: 3, communication: 3, punctuality: 3, quality: 3 },
    comments: "",
    goals: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamRes, reviewsRes] = await Promise.all([
        axiosInstance.get("/api/users/my-team"),
        axiosInstance.get("/api/performance/team")
      ]);
      setTeam(teamRes.data.users || teamRes.data.team || []);
      setReviews(reviewsRes.data.reviews);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (category, value) => {
    setFormData({
      ...formData,
      ratings: {
        ...formData.ratings,
        [category]: Number(value)
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/api/performance/review", formData);
      if(setMessage) setMessage({ text: "Review submitted successfully", type: "success" });
      setIsModalOpen(false);
      fetchData();
      // Reset form
      setFormData({
        employeeId: "",
        reviewPeriod: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
        ratings: { productivity: 3, teamwork: 3, communication: 3, punctuality: 3, quality: 3 },
        comments: "",
        goals: ""
      });
    } catch (error) {
      if(setMessage) setMessage({ text: error.response?.data?.message || "Failed to submit review", type: "error" });
    }
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
        <h1 className="text-2xl font-bold text-slate-800">Team Performance Reviews</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Review
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No reviews given yet.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{r.employeeId?.name}</div>
                      <div className="text-xs text-slate-500">{r.employeeId?.department}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {r.reviewPeriod.month}/{r.reviewPeriod.year}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{r.overallRating.toFixed(1)}</span>
                        <span className="text-amber-400 text-lg">⭐</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Review Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] my-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-800">New Performance Review</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="reviewForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Employee</label>
                    <select
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    >
                      <option value="">Select Team Member</option>
                      {team.map(member => (
                        <option key={member._id} value={member._id}>{member.name} ({member.department})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Month (1-12)</label>
                      <input
                        type="number"
                        min="1" max="12" required
                        value={formData.reviewPeriod.month}
                        onChange={(e) => setFormData({...formData, reviewPeriod: {...formData.reviewPeriod, month: e.target.value}})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Year</label>
                      <input
                        type="number"
                        required
                        value={formData.reviewPeriod.year}
                        onChange={(e) => setFormData({...formData, reviewPeriod: {...formData.reviewPeriod, year: e.target.value}})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Ratings (1-5)</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {Object.keys(formData.ratings).map((category) => (
                      <div key={category} className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-600 capitalize">{category}</span>
                        <input
                          type="number"
                          min="1" max="5" required
                          value={formData.ratings[category]}
                          onChange={(e) => handleRatingChange(category, e.target.value)}
                          className="w-16 px-2 py-1 text-center font-bold bg-white border border-slate-200 rounded-lg outline-none focus:border-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Comments & Feedback</label>
                  <textarea
                    required
                    rows="3"
                    value={formData.comments}
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                    placeholder="Provide detailed feedback on their performance..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Goals for Next Period</label>
                  <textarea
                    required
                    rows="3"
                    value={formData.goals}
                    onChange={(e) => setFormData({...formData, goals: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                    placeholder="Set actionable goals for the next review cycle..."
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="reviewForm"
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Performance;
