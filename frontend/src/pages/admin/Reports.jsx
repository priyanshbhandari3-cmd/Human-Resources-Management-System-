import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const Reports = () => {
  const [reportData, setReportData] = useState({
    attendance: null,
    leave: null,
    payroll: null
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const query = `?month=${filters.month}&year=${filters.year}`;
      const [attRes, leaveRes, payRes] = await Promise.all([
        axiosInstance.get(`/api/reports/attendance${query}`),
        axiosInstance.get(`/api/reports/leave${query}`),
        axiosInstance.get(`/api/reports/payroll${query}`)
      ]);
      setReportData({
        attendance: attRes.data.report,
        leave: leaveRes.data,
        payroll: payRes.data
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const leavePieData = reportData.leave ? [
    { name: 'Approved', value: reportData.leave.summary.approved },
    { name: 'Rejected', value: reportData.leave.summary.rejected },
    { name: 'Pending', value: reportData.leave.summary.pending },
  ].filter(d => d.value > 0) : [];

  if (loading && !reportData.attendance) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Company Reports</h1>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
          <select 
            value={filters.month} 
            onChange={(e) => setFilters({...filters, month: e.target.value})}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700 text-sm"
          >
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
            ))}
          </select>
          <select 
            value={filters.year} 
            onChange={(e) => setFilters({...filters, year: e.target.value})}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700 text-sm"
          >
            {Array.from({length: 5}, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Leave Report Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Leave Distribution</h3>
          {leavePieData.length > 0 ? (
            <div className="h-64 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leavePieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leavePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium h-64">
              No leave data for this period
            </div>
          )}
        </div>

        {/* Payroll Expense Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Payroll by Department</h3>
          {reportData.payroll?.departments.length > 0 ? (
            <div className="h-64 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.payroll.departments}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium h-64">
              No payroll data for this period
            </div>
          )}
        </div>

      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Employee Attendance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Present Days</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Half Days</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.attendance?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No attendance records found for this period.
                  </td>
                </tr>
              ) : (
                reportData.attendance?.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{row.name}</td>
                    <td className="px-6 py-4 text-slate-600">{row.department || 'N/A'}</td>
                    <td className="px-6 py-4 font-black text-emerald-600">{row.presentDays}</td>
                    <td className="px-6 py-4 font-bold text-amber-500">{row.halfDays}</td>
                    <td className="px-6 py-4 font-bold text-slate-500">{row.totalRecords}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
