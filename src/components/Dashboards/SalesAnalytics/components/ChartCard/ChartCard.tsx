import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ComposedChart,LabelList
} from 'recharts';
import { ChartCardProps } from '../../types/index';
import { CHART_COLORS, CHART_COLOR_PALETTE } from '../../utils/chartConfigs';
import './ChartCard.scss';

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  type,
  data,
  height = 300,
  colors = CHART_COLOR_PALETTE,
  showToolbar = true,
}) => {
  const [activeView, setActiveView] = useState<'chart' | 'table'>('chart');

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart layout="vertical" data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" />
            <YAxis dataKey="name" 
        type="category" 
        width={90} 
        tick={{ fontSize: 11, fill: '#374151' }}/>
            <Tooltip cursor={{ fill: '#f3f4f6' }}
              contentStyle={{ 
                background: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              fill={colors[0]}
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
            <LabelList dataKey="value" position="right" formatter={(val: number) => `$${val.toLocaleString()}`} />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="value" 
              fill={colors[0]}
              fillOpacity={0.3}
              stroke={colors[0]}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case 'donut':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case 'composed':
        return (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="quantity" 
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="value" 
              stroke={colors[1]}
              strokeWidth={3}
            />
          </ComposedChart>
        );

      default:
        return (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Chart type not supported.
          </div>
        );
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        
        {showToolbar && (
          <div className="chart-toolbar">
            <div className="view-toggle">
              <button
                className={`view-btn ${activeView === 'chart' ? 'active' : ''}`}
                onClick={() => setActiveView('chart')}
              >
                📊
              </button>
              <button
                className={`view-btn ${activeView === 'table' ? 'active' : ''}`}
                onClick={() => setActiveView('table')}
              >
                📋
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="chart-container" style={{ height }}>
        {activeView === 'chart' ? (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        ) : (
          <div className="chart-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                  {data[0]?.sales && <th>Sales</th>}
                  {data[0]?.margin && <th>Margin</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>
                      <span className="data-value">
                        ${item.value?.toLocaleString()}
                      </span>
                    </td>
                    {item.sales && (
                      <td>${item.sales.toLocaleString()}</td>
                    )}
                    {item.margin && (
                      <td>
                        <span className="margin-badge">
                          {item.margin}%
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;