import React from 'react';

interface PayablesTableProps {
  vendors: any[];
}

const PayablesTable: React.FC<PayablesTableProps> = ({ vendors }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Vendor-wise Payables Ageing</h3>
        <p>Detailed payables analysis by vendor</p>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Total Payables</th>
              <th>Current</th>
              <th>1-30 Days</th>
              <th>31-60 Days</th>
              <th>61-90 Days</th>
              <th>90+ Days</th>
              <th>Last Payment</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td style={{ fontWeight: '600' }}>{vendor.name}</td>
                <td className="amount">
                  {vendor.totalPayables?.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="amount">
                  {vendor.ageing?.current?.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="amount">
                  {vendor.ageing?.days30?.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="amount">
                  {vendor.ageing?.days60?.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="amount">
                  {vendor.ageing?.days90?.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="amount">
                  {(vendor.ageing?.days120 + vendor.ageing?.daysOver120)?.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td>{new Date(vendor.lastPaymentDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayablesTable;