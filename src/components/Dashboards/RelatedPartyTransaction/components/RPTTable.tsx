import React from 'react';
import { RPTTransaction } from '../types';
import StatusBadge from './StatusBadge';

interface RPTTableProps {
  transactions: RPTTransaction[];
}

const RPTTable: React.FC<RPTTableProps> = ({ transactions }) => {
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="table-container">
      <div className="table-title">Related Party Transactions</div>
      <table className="rpt-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Related Party</th>
            <th>Type</th>
            <th>Value</th>
            <th>Approval</th>
            <th>Section 188</th>
            <th>SEBI LODR</th>
            <th>Disclosure</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{transaction.id}</td>
              <td>{formatDate(transaction.date)}</td>
              <td>
                <div style={{ fontWeight: '500' }}>{transaction.relatedParty}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{transaction.relationship}</div>
              </td>
              <td>
                <div>{transaction.transactionType}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{transaction.category}</div>
              </td>
              <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                {formatCurrency(transaction.value)}
              </td>
              <td>
                <StatusBadge status={transaction.approvalStatus} />
              </td>
              <td>
                <StatusBadge
                  status={transaction.section188Compliant ? 'approved' : 'not_approved'}
                  label={transaction.section188Compliant ? 'Compliant' : 'Non-Compliant'}
                />
              </td>
              <td>
                <StatusBadge
                  status={transaction.sebiLodrCompliant ? 'approved' : 'not_approved'}
                  label={transaction.sebiLodrCompliant ? 'Compliant' : 'Non-Compliant'}
                />
              </td>
              <td>
                <StatusBadge
                  status={transaction.disclosureStatus === 'disclosed' ? 'approved' :
                    transaction.disclosureStatus === 'pending_disclosure' ? 'pending' : 'not_approved'}
                  label={transaction.disclosureStatus.replace('_', ' ')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RPTTable;