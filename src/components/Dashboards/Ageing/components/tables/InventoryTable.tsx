import React from 'react';

interface InventoryTableProps {
  rm: any[];
  wip: any[];
  fg: any[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ rm, wip, fg }) => {
  const renderTable = (title: string, items: any[], type: string) => {
    const typeColors: Record<string, string> = {
      RM: 'bg-blue-500/20 text-blue-300',
      WIP: 'bg-yellow-500/20 text-yellow-300',
      FG: 'bg-green-500/20 text-green-300'
    };

    return (
      <div className="bg-[#0f172a] rounded-2xl shadow-lg overflow-hidden border border-[#334155] mb-6">
        <div className="px-6 py-4 border-b border-[#334155]">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${typeColors[type]}`}>
                {type}
              </span>
            </div>
            <button className="text-sm text-[#60a5fa] font-medium hover:text-[#3b82f6]">
              View Details
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#334155]">
            <thead className="bg-[#1e293b]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                  Age (Days)
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                  Warehouse
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#0f172a] divide-y divide-[#334155]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#1e293b] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{item.description}</div>
                    <div className="text-sm text-[#94a3b8]">SKU: {item.sku || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{item.quantity?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-white">
                      {item.value?.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{item.ageingDays} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{item.warehouse}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-[#1e293b] border-t border-[#334155]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#94a3b8]">
              Showing {items.length} items
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

  return (
    <div>
      {renderTable('Raw Material (RM) Ageing', rm, 'RM')}
      {renderTable('Work in Progress (WIP) Ageing', wip, 'WIP')}
      {renderTable('Finished Goods (FG) Ageing', fg, 'FG')}
    </div>
  );
};

export default InventoryTable;