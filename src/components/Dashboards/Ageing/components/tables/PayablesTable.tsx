import React from 'react';

interface PayablesTableProps {
  vendors: any[];
}

const PayablesTable: React.FC<PayablesTableProps> = ({ vendors }) => {
  return (
    <div className="bg-[#0f172a] rounded-2xl shadow-lg overflow-hidden border border-[#334155]">
      <div className="px-6 py-4 border-b border-[#334155]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Vendor-wise Payables Ageing</h3>
            <p className="text-[#94a3b8] text-sm mt-1">Detailed payables analysis by vendor</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-[#60a5fa] font-medium hover:text-[#3b82f6]">
              View All Vendors
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#334155]">
          <thead className="bg-[#1e293b]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Total Payables
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Current
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                1-30 Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                31-60 Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                61-90 Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                90+ Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Last Payment
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#0f172a] divide-y divide-[#334155]">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-[#1e293b] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{vendor.name}</div>
                  <div className="text-sm text-[#94a3b8]">Vendor ID: {vendor.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-white">
                    {vendor.totalPayables?.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {vendor.ageing?.current?.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {vendor.ageing?.days30?.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {vendor.ageing?.days60?.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {vendor.ageing?.days90?.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {(vendor.ageing?.days120 + vendor.ageing?.daysOver120)?.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {new Date(vendor.lastPaymentDate).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-[#1e293b] border-t border-[#334155]">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#94a3b8]">
            Showing {vendors.length} vendors
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-[#334155] rounded text-sm font-medium text-[#94a3b8] hover:bg-[#334155] hover:text-white">
              Previous
            </button>
            <button className="px-3 py-1 border border-[#334155] bg-[#334155] rounded text-sm font-medium text-white">
              1
            </button>
            <button className="px-3 py-1 border border-[#334155] rounded text-sm font-medium text-[#94a3b8] hover:bg-[#334155] hover:text-white">
              2
            </button>
            <button className="px-3 py-1 border border-[#334155] rounded text-sm font-medium text-[#94a3b8] hover:bg-[#334155] hover:text-white">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayablesTable;