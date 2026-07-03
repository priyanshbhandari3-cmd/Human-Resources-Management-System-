const Table = ({ headers, children }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {headers.map((header, idx) => (
              <th 
                key={idx} 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
