import React from 'react';
import './Regions.scss';

const Regions: React.FC = () => {
  const regions = [
    { name: 'North America', revenue: '$8.2M', growth: '+12.5%', customers: 245, orders: 1240 },
    { name: 'Asia Pacific', revenue: '$7.8M', growth: '+15.3%', customers: 312, orders: 1560 },
    { name: 'Europe', revenue: '$6.5M', growth: '+8.7%', customers: 187, orders: 980 },
    { name: 'Middle East', revenue: '$3.2M', growth: '+21.4%', customers: 89, orders: 420 },
    { name: 'Latin America', revenue: '$2.1M', growth: '+5.2%', customers: 76, orders: 310 },
    { name: 'Africa', revenue: '$1.4M', growth: '+18.9%', customers: 45, orders: 190 },
  ];

  return (
    <div className="regions">
      <div className="regions-header">
        <div>
          <h2>Regional Analysis</h2>
          <p>Performance metrics by geographic region</p>
        </div>
      </div>

      <div className="regions-stats">
        {regions.map(region => (
          <div key={region.name} className="region-card">
            <div className="region-header">
              <h3>{region.name}</h3>
              <span className="growth-badge">{region.growth}</span>
            </div>
            
            <div className="region-metrics">
              <div className="metric">
                <span className="metric-label">Revenue</span>
                <span className="metric-value">{region.revenue}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Customers</span>
                <span className="metric-value">{region.customers}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Orders</span>
                <span className="metric-value">{region.orders}</span>
              </div>
            </div>

            <div className="region-performance">
              <div className="performance-bar">
                <div 
                  className="performance-fill"
                  style={{ 
                    width: `${(parseInt(region.revenue.replace('$', '').replace('M', '')) / 10) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="performance-label">
                Market Share: {Math.floor((parseInt(region.revenue.replace('$', '').replace('M', '')) / 30) * 100)}%
              </div>
            </div>

            <div className="region-trend">
              <div className="trend-line">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="trend-dot"
                    style={{
                      height: `${20 + Math.sin(i * 0.5) * 15}px`,
                      backgroundColor: '#3b82f6',
                      opacity: 0.3 + (Math.sin(i * 0.5 + 1) * 0.3),
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="regions-comparison">
        <h3>Regional Comparison</h3>
        <div className="comparison-chart">
          <div className="chart-bars">
            {regions.map(region => (
              <div key={region.name} className="chart-bar">
                <div className="bar-label">{region.name}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${(parseInt(region.revenue.replace('$', '').replace('M', '')) / 10) * 100}%`,
                      background: `linear-gradient(180deg, var(--color-primary), var(--color-accent))`
                    }}
                  ></div>
                </div>
                <div className="bar-value">{region.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="region-insights">
        <h3>Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🚀</div>
            <h4>Fastest Growing</h4>
            <p>Middle East region showing 21.4% growth quarter over quarter</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <h4>Highest Revenue</h4>
            <p>North America contributes 32% of total company revenue</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">👥</div>
            <h4>Customer Density</h4>
            <p>Asia Pacific has the highest customer count with 312 active accounts</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <h4>Emerging Market</h4>
            <p>Africa showing strong potential with 18.9% growth rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Regions;