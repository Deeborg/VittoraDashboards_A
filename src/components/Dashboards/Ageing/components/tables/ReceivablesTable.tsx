import React from 'react';
import { User, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

interface ReceivablesTableProps {
  customers: any[];
}

const ReceivablesTable: React.FC<ReceivablesTableProps> = ({ customers }) => {
  const getRiskLevel = (ageing: any) => {
    const overdue = ageing.days60 + ageing.days90 + ageing.days120 + ageing.daysOver120;
    const total = ageing.total;
    const percentage = (overdue / total) * 100;
    
    if (percentage > 30) return { level: 'High', color: 'bg-red-500/20 text-white', icon: AlertTriangle };
    if (percentage > 15) return { level: 'Medium', color: 'bg-yellow-500/20 text-white', icon: AlertTriangle };
    return { level: 'Low', color: 'bg-green-500/20 text-white', icon: CheckCircle };
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl shadow-lg overflow-hidden border border-[#334155]">
      <div className="px-6 py-4 border-b border-[#334155]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Customer-wise Receivables Ageing</h3>
            <p className="text-[#94a3b8] text-sm mt-1">Detailed analysis with risk assessment</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-[#60a5fa] font-medium hover:text-[#3b82f6]">
              View All Customers
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#334155]">
          <thead className="bg-[#1e293b]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Ageing Distribution
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Last Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#0f172a] divide-y divide-[#334155]">
            {customers.map((customer) => {
              const risk = getRiskLevel(customer.ageing);
              const RiskIcon = risk.icon;
              
              return (
                <tr key={customer.id} className="hover:bg-[#1e293b] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-[#60a5fa]" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{customer.name}</div>
                        <div className="text-sm text-[#94a3b8]">Customer ID: {customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-white">
                      {customer.totalReceivables.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#94a3b8]">Current</span>
                        <span className="font-semibold text-white">
                          {(customer.ageing.current / customer.ageing.total * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#10b981]"
                          style={{ width: `${(customer.ageing.current / customer.ageing.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${risk.color}`}>
                      <RiskIcon className="w-3 h-3 mr-1" />
                      {risk.level} Risk
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-white">
                      <Calendar className="w-4 h-4 mr-2 text-[#94a3b8]" />
                      {new Date(customer.lastInvoiceDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-[#60a5fa] hover:text-[#3b82f6] text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-[#1e293b] border-t border-[#334155]">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#94a3b8]">
            Showing {customers.length} customers
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

export default ReceivablesTable;