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
  Filler,
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
  Filler // For shaded area between lines
);

interface LineChartProps {
  data: {
    Date: Date;
    'Actual Price': number;
    'Forecast Price': number;
    'Lower CI': number;
    'Upper CI': number;
  }[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.Date.getTime() - b.Date.getTime());

  const chartData = {
    labels: sortedData.map(item => item.Date),
    datasets: [
      {
        label: 'Lower',
        data: sortedData.map(item => item['Lower CI']),
        fill: '+1',
        borderWidth: 0,
        pointRadius: 0,
        backgroundColor: 'rgba(173, 216, 230, 0.3)', // light blue fill
      },
      {
        label: 'Upper',
        data: sortedData.map(item => item['Upper CI']),
        fill: false,
        borderWidth: 0,
        pointRadius: 0,
      },
      {
        label: 'Forecast Price',
        data: sortedData.map(item => item['Forecast Price']),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 10,
      },
      {
        label: 'Actual Price',
        data: sortedData.map(item => item['Actual Price']),
        borderColor: 'rgb(183, 194, 25)',
        backgroundColor: 'rgba(235, 221, 37, 0.5)',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month' as 'month',
          tooltipFormat: 'MMM yyyy' as const,
          displayFormats: {
            day: 'MMM yyyy',
          },
        },
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 12,
            family: 'Segoe UI',
          },
        },
        grid: {
          display: false,
          drawBorder: true,
        },
        ticks: {
          callback: (value: any) => {
            const date = new Date(value);
            return date.toLocaleString('en-GB', {
              month: 'short',
              year: 'numeric',
            }).replace(' ', '');
          },
        },
      },
      y: {
        min: 83,
        max: 88,
        ticks: {
          stepSize: 1,
          font: {
            size: 10,
          },
        },
        title: {
          display: true,
          text: 'Price',
          font: {
            size: 12,
            family: 'Segoe UI',
          },
        },
        grid: {
          display: false,
          drawBorder: true,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Segoe UI',
            size: 12,
          },
          color: '#333',
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        position: "nearest" as "nearest",
        callbacks: {
          title: (context: any) => {
            if (context.length > 0) {
              const date = new Date(context[0].parsed.x);
              return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
            }
            return '';
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${value.toFixed(4)}`;
          },
        },
      },
    },
  };

  return (
    <div style={{
      backgroundColor: 'rgb(255, 255, 255)',
      padding: '10px',
      borderRadius: '10px',
      margin: '10px 0',
      color: 'black',
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Segoe UI, sans-serif',
      cursor: 'pointer',
    }}>
      <h2>Actual Price Vs Forecast Price</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
