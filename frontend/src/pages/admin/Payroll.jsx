import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axiosInstance from "../../api/axiosInstance";
import Toast from "../../components/common/Toast";

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [formData, setFormData] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: "",
    allowances: { hra: 0, transport: 0, medical: 0, other: 0 },
    deductions: { tax: 0, pf: 0, other: 0 }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, payRes, statRes] = await Promise.all([
        axiosInstance.get("/api/users/all"),
        axiosInstance.get("/api/payroll/all"),
        axiosInstance.get("/api/payroll/stats")
      ]);
      setEmployees(empRes.data.users.filter(u => u.role === "employee" || u.role === "manager"));
      setPayrolls(payRes.data.payrolls);
      setStats(statRes.data.stats);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateNet = () => {
    const basic = Number(formData.basicSalary) || 0;
    const allow = Object.values(formData.allowances).reduce((sum, val) => sum + Number(val), 0);
    const ded = Object.values(formData.deductions).reduce((sum, val) => sum + Number(val), 0);
    return basic + allow - ded;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/api/payroll/generate", formData);
      setMessage({ text: "Payroll generated successfully", type: "success" });
      setIsModalOpen(false);
      fetchData();
      // Reset
      setFormData({
        employeeId: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: "",
        allowances: { hra: 0, transport: 0, medical: 0, other: 0 },
        deductions: { tax: 0, pf: 0, other: 0 }
      });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to generate payroll", type: "error" });
    }
  };

  const markAsPaid = async (id) => {
    if (!window.confirm("Are you sure you want to mark this as paid?")) return;
    try {
      await axiosInstance.patch(`/api/payroll/${id}/pay`);
      setMessage({ text: "Marked as paid", type: "success" });
      fetchData();
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to update status", type: "error" });
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
      <Toast message={message.text} type={message.type} onClose={() => setMessage({ text: "", type: "" })} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Payroll Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Generate Payroll
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-slate-500 font-bold text-sm">Total Disbursed This Month</span>
            <span className="text-2xl font-black text-slate-800">${stats.totalAmount.toLocaleString()}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-slate-500 font-bold text-sm">Total Payslips Generated</span>
            <span className="text-2xl font-black text-primary">{stats.totalGenerated}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-slate-500 font-bold text-sm">Paid Payslips</span>
            <span className="text-2xl font-black text-emerald-500">{stats.paidCount}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-slate-500 font-bold text-sm">Pending Payslips</span>
            <span className="text-2xl font-black text-amber-500">{stats.pendingCount}</span>
          </div>
        </div>
      )}

      {/* Payrolls List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No payrolls generated yet.
                  </td>
                </tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{p.employeeId?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{p.employeeId?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {p.month}/{p.year}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800">
                      ${p.netSalary}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        p.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === "pending" && (
                        <button 
                          onClick={() => markAsPaid(p._id)}
                          className="text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] my-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-800">Generate Payslip</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="payrollForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Employee</label>
                    <select
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Month (1-12)</label>
                      <input
                        type="number" min="1" max="12" required
                        value={formData.month}
                        onChange={(e) => setFormData({...formData, month: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Year</label>
                      <input
                        type="number" required
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <label className="block text-sm font-black text-primary mb-2">Basic Salary ($)</label>
                  <input
                    type="number" required min="0"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-primary/30 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">Allowances (+)</h3>
                    {Object.keys(formData.allowances).map(key => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-600 capitalize">{key}</span>
                        <input
                          type="number" min="0"
                          value={formData.allowances[key]}
                          onChange={(e) => setFormData({...formData, allowances: {...formData.allowances, [key]: e.target.value}})}
                          className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-right font-medium outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">Deductions (-)</h3>
                    {Object.keys(formData.deductions).map(key => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-600 capitalize">{key}</span>
                        <input
                          type="number" min="0"
                          value={formData.deductions[key]}
                          onChange={(e) => setFormData({...formData, deductions: {...formData.deductions, [key]: e.target.value}})}
                          className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-right font-medium outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800 text-white p-5 rounded-xl flex items-center justify-between">
                  <span className="font-bold">Calculated Net Salary</span>
                  <span className="text-3xl font-black text-emerald-400">${handleCalculateNet()}</span>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button" onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" form="payrollForm"
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 cursor-pointer"
              >
                Generate Payslip
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Payroll;
