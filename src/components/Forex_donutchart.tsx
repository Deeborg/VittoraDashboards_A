// components/DonutChart.tsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  title: string;
  data: { [key: string]: number };
}

const DonutChart: React.FC<DonutChartProps> = ({ title, data }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const backgroundColors = labels.map(label => {
    const lower = label.toLowerCase();

    if (lower === 'hedged') return '#3b82f6';     // Blue
    if (lower === 'unhedged') return '#1e3a8a';   // Dark Blue
    if (lower === 'good') return '#22c55e';       // Green
    if (lower === 'bad') return '#ef4444';        // Red

    return '#a3a3a3'; // Default gray
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        borderWidth: 0,
      },
    ],
  };

  const options: any = {
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: { size: 12 },
        },
      },
      tooltip: {
        position: 'nearest',
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Extract primary color for glow effect (uses the first label's color or default)
  const glowColor = backgroundColors[0] || '#1f2937';

  return (
    <div
      style={{
        width: 320,
        height: 340,
        textAlign: 'center',
        backgroundColor: '#ffffff',
        padding: '1rem',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${glowColor}55`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      <div
        style={{
          marginTop: '0.1rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '8px',
          fontSize: '16px',
        }}
      >
        {title}
      </div>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DonutChart;
