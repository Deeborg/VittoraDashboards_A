import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale
);

interface ChartProps {
  data: {
    Date: Date;
    [key: string]: any;
  }[];
  fields: { label: string; color: string }[];
  title: string;
  yMin?: number;
  yMax?: number;
}

const MultiLineChart: React.FC<ChartProps> = ({ data, fields, title, yMin, yMax }) => {
  const sortedData = [...data].sort((a, b) => a.Date.getTime() - b.Date.getTime());

  const chartData = {
    labels: sortedData.map(item => item.Date),
    datasets: fields.map(f => ({
      label: f.label,
      data: sortedData.map(item => item[f.label] ?? 0),
      borderColor: f.color,
      backgroundColor: f.color + '33',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 10,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 0,
        bottom: 40,
        left: 0,
        right: 10,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month' as const,
          tooltipFormat: 'MMM yyyy',
        },
        title: {
          display: true,
          text: 'Date',
        },
        grid: {
      display: false, // remove all x-axis grid lines
      drawBorder: true, // keep the axis line
    },
      },
      y: {
        min: yMin,
        max: yMax,
        title: {
          display: true,
          text: 'Amount (USD in Millions)',
        },
        grid: {
      display: false, // remove all x-axis grid lines
      drawBorder: true, // keep the axis line
    },
        ticks: {
          callback: function (value: number | string) {
            const numericValue = typeof value === 'string' ? parseFloat(value) : value;
            return `${(numericValue / 1_000_000).toFixed(1)}M`;
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        position: "nearest" as "nearest",
        callbacks: {
          title: (context: any) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: $${(value / 1_000_000).toFixed(2)}M`;
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        height: '520px',
        margin: '15px auto',
        backgroundColor: 'white',
        padding: '39px',
        color: 'black',
        textAlign: 'center',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '90%',
        maxWidth: '1100px',
        fontFamily: 'Segoe UI, sans-serif',
        position: 'relative',
      }}
    >
      <h2 style={{ marginTop: '0px' }}>{title}</h2>
      <div style={{ height: '100%', position: 'relative' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MultiLineChart;
