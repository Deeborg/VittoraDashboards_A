import React from 'react';
import './Entities.scss';

const Entities: React.FC = () => {
  const entities = [
    { id: 'ENT-001', name: 'Entity A', location: 'New York, USA', manager: 'John Smith', revenue: '$4.2M', growth: '+12.5%' },
    { id: 'ENT-002', name: 'Entity B', location: 'London, UK', manager: 'Emma Johnson', revenue: '$3.8M', growth: '+8.7%' },
    { id: 'ENT-003', name: 'Entity C', location: 'Tokyo, Japan', manager: 'Kenji Tanaka', revenue: '$5.1M', growth: '+15.3%' },
    { id: 'ENT-004', name: 'Entity D', location: 'Singapore', manager: 'Wei Chen', revenue: '$2.9M', growth: '+5.2%' },
    { id: 'ENT-005', name: 'Entity E', location: 'Dubai, UAE', manager: 'Ahmed Hassan', revenue: '$1.8M', growth: '+21.4%' },
  ];

  return (
    <div className="entities">
      <div className="entities-header">
        <div>
          <h2>Business Entities</h2>
          <p>Manage and monitor business entities performance</p>
        </div>
        <button className="btn btn-primary">
          + Add Entity
        </button>
      </div>

      <div className="entities-stats">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Total Entities</h3>
            <div className="stat-value">5</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <div className="stat-value">$17.8M</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Avg Growth</h3>
            <div className="stat-value">12.6%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <h3>Countries</h3>
            <div className="stat-value">5</div>
          </div>
        </div>
      </div>

      <div className="entities-grid">
        {entities.map(entity => (
          <div key={entity.id} className="entity-card">
            <div className="entity-header">
              <div className="entity-avatar">
                {entity.name.charAt(0)}
              </div>
              <div className="entity-info">
                <h3>{entity.name}</h3>
                <p>{entity.location}</p>
              </div>
              <span className="entity-status active">Active</span>
            </div>

            <div className="entity-details">
              <div className="detail">
                <span className="label">Manager</span>
                <span className="value">{entity.manager}</span>
              </div>
              <div className="detail">
                <span className="label">Revenue</span>
                <span className="value">{entity.revenue}</span>
              </div>
              <div className="detail">
                <span className="label">Growth</span>
                <span className="value growth">{entity.growth}</span>
              </div>
            </div>

            <div className="entity-performance">
              <div className="performance-bar">
                <div 
                  className="performance-fill"
                  style={{ width: `${parseInt(entity.growth) * 5}%` }}
                ></div>
              </div>
              <div className="performance-label">
                Performance Index: {Math.floor(Math.random() * 30) + 70}/100
              </div>
            </div>

            <div className="entity-actions">
              <button className="btn-action">View Details</button>
              <button className="btn-action">Edit</button>
            </div>
          </div>
        ))}
      </div>

      <div className="entity-map">
        <h3>Global Presence</h3>
        <div className="map-placeholder">
          <div className="map-grid">
            <div className="map-region na">North America</div>
            <div className="map-region eu">Europe</div>
            <div className="map-region as">Asia</div>
            <div className="map-region me">Middle East</div>
            <div className="map-region sa">South America</div>
            <div className="map-region af">Africa</div>
          </div>
          <div className="map-legend">
            <div className="legend-item">
              <span className="dot primary"></span>
              <span>Entity Location</span>
            </div>
            <div className="legend-item">
              <span className="dot secondary"></span>
              <span>High Activity</span>
            </div>
            <div className="legend-item">
              <span className="dot accent"></span>
              <span>Medium Activity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entities;