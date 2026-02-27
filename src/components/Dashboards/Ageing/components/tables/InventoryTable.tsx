import React from 'react';

interface InventoryTableProps {
  rm: any[];
  wip: any[];
  fg: any[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ rm, wip, fg }) => {
  const renderTable = (title: string, items: any[], type: string) => {
    const typeColors: Record<string, string> = {
      RM: 'badge-info',
      WIP: 'badge-warning',
      FG: 'badge-success'
    };

    return (
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3>{title}</h3>
          <span className={`badge ${typeColors[type]}`} style={{ marginLeft: '0.5rem' }}>
            {type}
          </span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Value</th>
                <th>Age (Days)</th>
                <th>Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '600' }}>{item.description}</td>
                  <td>{item.quantity?.toLocaleString()}</td>
                  <td className="amount">
                    {item.value?.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td>{item.ageingDays}</td>
                  <td>{item.warehouse}</td>
                </tr>
              ))}
            </tbody>
          </table>
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