import React from 'react';
// This one is already correct:
import './loanPaymentSchedule.css';
const PaymentSchedule: React.FC = () => {
  const paymentData = [
    { facility: 'ECB-2023-001', currency: 'USD', principal: '$50M', interest: '$2.1M', total: '$52.1M', dueDate: '2024-03-15', status: 'Upcoming', daysLeft: 15 },
    { facility: 'ECB-2023-002', currency: 'EUR', principal: '€30M', interest: '€1.2M', total: '€31.2M', dueDate: '2024-03-20', status: 'Upcoming', daysLeft: 20 },
    { facility: 'ECB-2023-003', currency: 'GBP', principal: '£20M', interest: '£1.1M', total: '£21.1M', dueDate: '2024-04-05', status: 'Upcoming', daysLeft: 36 },
    { facility: 'ECB-2022-001', currency: 'USD', principal: '$30M', interest: '$1.3M', total: '$31.3M', dueDate: '2024-04-15', status: 'Upcoming', daysLeft: 46 },
    { facility: 'ECB-2022-002', currency: 'JPY', principal: '¥15M', interest: '¥0.4M', total: '¥15.4M', dueDate: '2024-05-01', status: 'Upcoming', daysLeft: 62 },
    { facility: 'ECB-2021-001', currency: 'AUD', principal: 'A$10M', interest: 'A$0.5M', total: 'A$10.5M', dueDate: '2024-05-20', status: 'Upcoming', daysLeft: 81 },
  ];

  // Calculate totals
  const next30Days = paymentData.filter(p => p.daysLeft <= 30).reduce((sum, p) => {
    const amount = parseFloat(p.total.replace(/[^0-9.]/g, ''));
    return sum + amount;
  }, 0);

  const next60Days = paymentData.filter(p => p.daysLeft <= 60).reduce((sum, p) => {
    const amount = parseFloat(p.total.replace(/[^0-9.]/g, ''));
    return sum + amount;
  }, 0);

  const next90Days = paymentData.filter(p => p.daysLeft <= 90).reduce((sum, p) => {
    const amount = parseFloat(p.total.replace(/[^0-9.]/g, ''));
    return sum + amount;
  }, 0);

  return (
    <div className="payment-schedule-container">
      <div className="page-header">
        <h2>Payment Schedule</h2>
        <p className="subtitle">Upcoming principal and interest payments</p>
      </div>

      {/* Timeline Stats */}
      <div className="timeline-stats">
        <div className="timeline-card urgent">
          <span className="timeline-icon">🔴</span>
          <div>
            <div className="timeline-label">Next 30 Days</div>
            <div className="timeline-value">${next30Days.toFixed(1)}M</div>
            <div className="timeline-detail">{paymentData.filter(p => p.daysLeft <= 30).length} payments</div>
          </div>
        </div>
        <div className="timeline-card warning">
          <span className="timeline-icon">🟡</span>
          <div>
            <div className="timeline-label">Next 60 Days</div>
            <div className="timeline-value">${next60Days.toFixed(1)}M</div>
            <div className="timeline-detail">{paymentData.filter(p => p.daysLeft <= 60).length} payments</div>
          </div>
        </div>
        <div className="timeline-card normal">
          <span className="timeline-icon">🔵</span>
          <div>
            <div className="timeline-label">Next 90 Days</div>
            <div className="timeline-value">${next90Days.toFixed(1)}M</div>
            <div className="timeline-detail">{paymentData.length} payments</div>
          </div>
        </div>
      </div>

      {/* Payment Calendar Preview */}
      <div className="calendar-section">
        <h3>Payment Timeline</h3>
        <div className="timeline">
          {paymentData.map((payment, index) => (
            <div key={index} className="timeline-item" style={{ left: `${(100 - (payment.daysLeft / 90) * 100)}%` }}>
              <div className={`timeline-marker ${payment.daysLeft <= 30 ? 'urgent' : payment.daysLeft <= 60 ? 'warning' : 'normal'}`}>
                <span className="marker-tooltip">
                  {payment.facility}<br />
                  {payment.total}<br />
                  Due: {payment.dueDate}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="timeline-labels">
          <span>Today</span>
          <span>30 Days</span>
          <span>60 Days</span>
          <span>90 Days</span>
        </div>
      </div>

      {/* Payment Table */}
      <div className="table-card">
        <h3>Upcoming Payments</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Facility ID</th>
              <th>Currency</th>
              <th>Principal</th>
              <th>Interest</th>
              <th>Total Payment</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Days Left</th>
            </tr>
          </thead>
          <tbody>
            {paymentData.map((payment, index) => (
              <tr key={index}>
                <td className="facility-id">{payment.facility}</td>
                <td className="currency">{payment.currency}</td>
                <td>{payment.principal}</td>
                <td>{payment.interest}</td>
                <td className="total">{payment.total}</td>
                <td>{payment.dueDate}</td>
                <td>
                  <span className={`status-badge ${payment.daysLeft <= 30 ? 'urgent' : payment.daysLeft <= 60 ? 'warning' : 'normal'}`}>
                    {payment.status}
                  </span>
                </td>
                <td className={`days-left ${payment.daysLeft <= 30 ? 'urgent' : ''}`}>
                  {payment.daysLeft}d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="payment-summary">
        <h3>Payment Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span>Total Principal Due</span>
            <strong>$155M</strong>
          </div>
          <div className="summary-item">
            <span>Total Interest Due</span>
            <strong>$6.6M</strong>
          </div>
          <div className="summary-item">
            <span>Average Payment</span>
            <strong>$26.9M</strong>
          </div>
          <div className="summary-item">
            <span>Next Payment</span>
            <strong>15 days</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSchedule;