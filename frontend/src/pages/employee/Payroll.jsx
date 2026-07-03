import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await axiosInstance.get("/api/payroll/my");
      setPayrolls(res.data.payrolls);
    } catch (error) {
      console.error("Error fetching payrolls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.print();
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
        <h1 className="text-2xl font-bold text-slate-800">My Payslips</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Month/Year</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Basic</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Allowances</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No payslips generated yet.
                  </td>
                </tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {new Date(p.year, p.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-slate-600">${p.basicSalary}</td>
                    <td className="px-6 py-4 text-emerald-600">+${p.totalAllowances}</td>
                    <td className="px-6 py-4 text-red-600">-${p.totalDeductions}</td>
                    <td className="px-6 py-4 font-bold text-primary">${p.netSalary}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedPayslip(p)}
                        className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                Payslip: {new Date(selectedPayslip.year, selectedPayslip.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                onClick={() => setSelectedPayslip(null)}
                className="text-slate-400 hover:text-slate-600 print:hidden"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto print:block flex-1 print-content">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">SALARY SLIP</h1>
                <p className="text-slate-500 font-medium">For the month of {new Date(selectedPayslip.year, selectedPayslip.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Earnings</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-600"><span className="font-medium">Basic Salary</span><span>${selectedPayslip.basicSalary}</span></div>
                    <div className="flex justify-between text-slate-600"><span className="font-medium">HRA</span><span>${selectedPayslip.allowances.hra}</span></div>
                    <div className="flex justify-between text-slate-600"><span className="font-medium">Transport</span><span>${selectedPayslip.allowances.transport}</span></div>
                    <div className="flex justify-between text-slate-600"><span className="font-medium">Medical</span><span>${selectedPayslip.allowances.medical}</span></div>
                    <div className="flex justify-between text-slate-600"><span className="font-medium">Other</span><span>${selectedPayslip.allowances.other}</span></div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Deductions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-600"><span className="font-medium">Tax</span><span>${selectedPayslip.deductions.tax}</span></div>
                    <div className="flex justify-between text-slate-600"><span className="font-medium">PF</span><span>${selectedPayslip.deductions.pf}</span></div>
                    <div className="flex justify-between text-slate-600"><span className="font-medium">Other</span><span>${selectedPayslip.deductions.other}</span></div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-bold text-slate-800">Net Salary</span>
                  <span className="font-black text-primary text-2xl">${selectedPayslip.netSalary}</span>
                </div>
                {selectedPayslip.status === "paid" && (
                  <p className="text-emerald-600 text-sm font-bold mt-2">Paid on: {new Date(selectedPayslip.paidAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 print:hidden">
              <button 
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={handleDownload}
                className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Payroll;
