import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/api';
import { Customer } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Customers.scss';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = filterSegment === 'all' || customer.segment === filterSegment;
    const matchesRegion = filterRegion === 'all' || customer.region === filterRegion;
    
    return matchesSearch && matchesSegment && matchesRegion;
  });

  const segments = Array.from(new Set(customers.map(c => c.segment)));
  const regions = Array.from(new Set(customers.map(c => c.region)));

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="customers">
      <div className="customers-header">
        <div>
          <h2>Customer Management</h2>
          <p>Manage and analyze customer data</p>
        </div>
        <button className="btn btn-primary">
          + Add New Customer
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select 
            className="filter-select"
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
          >
            <option value="all">All Segments</option>
            {segments.map(segment => (
              <option key={segment} value={segment}>{segment}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
          >
            <option value="all">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="customers-grid">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="customer-card">
            <div className="customer-header">
              <div className="customer-avatar">
                {customer.name.charAt(0)}
              </div>
              <div className="customer-info">
                <h3>{customer.name}</h3>
                <p>{customer.email}</p>
              </div>
              <span className={`customer-status ₹{customer.status.toLowerCase()}`}>
                {customer.status}
              </span>
            </div>

            <div className="customer-details">
              <div className="detail-item">
                <span className="detail-label">Industry</span>
                <span className="detail-value">{customer.industry}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Segment</span>
                <span className="detail-value">{customer.segment}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Region</span>
                <span className="detail-value">{customer.region}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Customer Since</span>
                <span className="detail-value">{formatDate(customer.since)}</span>
              </div>
            </div>

            <div className="customer-metrics">
              <div className="metric">
                <span className="metric-label">Total Spent</span>
                <span className="metric-value">
                  {formatCurrency(customer.totalSpent)}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Margin</span>
                <span className="metric-value">
                  <span className={`margin-badge ₹{customer.margin > 30 ? 'high' : 'low'}`}>
                    {customer.margin}%
                  </span>
                </span>
              </div>
            </div>

            <div className="customer-actions">
              <button className="btn-action">View</button>
              <button className="btn-action">Edit</button>
              <button className="btn-action danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;