import React, { useState } from 'react';
import './Orders.scss';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState([
    { id: 'ORD-001', customer: 'Global Motors', amount: '₹25,000', date: '2024-01-15', status: 'Completed', payment: 'Paid' },
    { id: 'ORD-002', customer: 'TechNova Solutions', amount: '₹18,500', date: '2024-01-18', status: 'Processing', payment: 'Paid' },
    { id: 'ORD-003', customer: 'MediCare Group', amount: '₹42,000', date: '2024-01-20', status: 'Pending', payment: 'Pending' },
    { id: 'ORD-004', customer: 'Green Energy Corp', amount: '₹12,300', date: '2024-01-22', status: 'Completed', payment: 'Paid' },
    { id: 'ORD-005', customer: 'Urban Builders', amount: '₹31,500', date: '2024-01-25', status: 'Shipped', payment: 'Paid' },
    { id: 'ORD-006', customer: 'FoodPlus Retail', amount: '₹8,750', date: '2024-01-26', status: 'Processing', payment: 'Partial' },
    { id: 'ORD-007', customer: 'Sky Airlines', amount: '₹67,800', date: '2024-01-28', status: 'Pending', payment: 'Pending' },
    { id: 'ORD-008', customer: 'DataFlow Systems', amount: '₹23,400', date: '2024-01-29', status: 'Completed', payment: 'Paid' },
  ]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment === paymentFilter;
    return matchesStatus && matchesPayment;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#10b981';
      case 'processing': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'shipped': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getPaymentColor = (payment: string) => {
    switch (payment.toLowerCase()) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'partial': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="orders">
      <div className="orders-header">
        <div>
          <h2>Order Management</h2>
          <p>Track and manage customer orders</p>
        </div>
        <button className="btn btn-primary">
          + Create New Order
        </button>
      </div>

      <div className="orders-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Payment:</label>
          <select 
            className="filter-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
          </select>
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td>{order.customer}</td>
                <td>{order.amount}</td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: `₹{getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status)
                    }}
                  >
                    {order.status}
                  </span>
                </td>
                <td>
                  <span 
                    className="payment-badge"
                    style={{ 
                      backgroundColor: `₹{getPaymentColor(order.payment)}20`,
                      color: getPaymentColor(order.payment)
                    }}
                  >
                    {order.payment}
                  </span>
                </td>
                <td>
                  <div className="order-actions">
                    <button className="action-btn" title="View Details">👁️</button>
                    <button className="action-btn" title="Edit Order">✏️</button>
                    <button className="action-btn" title="Print Invoice">🖨️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="orders-summary">
        <div className="summary-card">
          <h3>Revenue Summary</h3>
          <div className="summary-value">₹228,250</div>
          <div className="summary-details">
            <div className="detail">
              <span className="label">Completed Orders</span>
              <span className="value">4</span>
            </div>
            <div className="detail">
              <span className="label">Pending Orders</span>
              <span className="value">2</span>
            </div>
            <div className="detail">
              <span className="label">Avg Order Value</span>
              <span className="value">₹28,531</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3>Order Status Distribution</h3>
          <div className="status-distribution">
            <div className="status-item">
              <div className="status-bar" style={{ width: '50%', background: '#10b981' }}></div>
              <span>Completed (50%)</span>
            </div>
            <div className="status-item">
              <div className="status-bar" style={{ width: '25%', background: '#3b82f6' }}></div>
              <span>Processing (25%)</span>
            </div>
            <div className="status-item">
              <div className="status-bar" style={{ width: '25%', background: '#f59e0b' }}></div>
              <span>Pending (25%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;