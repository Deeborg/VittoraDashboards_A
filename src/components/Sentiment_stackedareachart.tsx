// components/charts/StackedAreaChart.tsx
import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Chart } from 'react-chartjs-2';

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

// Define types
interface DashboardData {
  sources: string[];
  authors: string[];
  dates: Date[];
  rowCount: number;
  sentimentData: { source: string; sentiment: string; authorCount: number }[];
}

interface StackedAreaChartProps {
  data: DashboardData;
}

// Define the data point type
interface ChartDataPoint {
  x: Date;
  y: number;
}

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ data }) => {
  const chartRef = useRef<ChartJS<'line', ChartDataPoint[], unknown>>(null);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Process dates to maintain chronological order
  const validDates = data.dates
    .map(date => new Date(date))
    .filter(date => !isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  // Group counts by month-year to avoid too many data points
  const monthYearCountMap = new Map<string, number>();
  
  validDates.forEach(date => {
    const monthYearKey = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    monthYearCountMap.set(monthYearKey, (monthYearCountMap.get(monthYearKey) || 0) + 1);
  });

  // Prepare chart data in chronological order
  const chartData = Array.from(monthYearCountMap.entries())
    .map(([label, count]) => ({
      // Create a date in the middle of the month for proper time scale positioning
      date: new Date(Date.parse(label)),
      count,
      label
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const chartDataset = {
    datasets: [
      {
        label: 'Articles/Posts',
        data: chartData.map(item => ({
          x: item.date,
          y: item.count
        })) as ChartDataPoint[],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (context: any) => {
            const date = new Date(context[0].raw.x);
            return date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long'
            });
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '#Articles/Posts',
          font: {
            size: 16
          }
        },
        grid: {
          display: true,
          drawOnChartArea: false,
          drawTicks: true,
          color: (context: any) => {
            return context.tick?.value === 0 ? 'rgba(0, 0, 0, 0.8)' : 'transparent';
          },
          lineWidth: (context: any) => {
            return context.tick?.value === 0 ? 2 : 0;
          },
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        type: 'time' as const,
        time: {
          unit: 'month' as const,
          displayFormats: {
            month: 'MMM yyyy'
          },
          tooltipFormat: 'MMMM yyyy'
        },
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 16
          }
        },
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: true,
          drawOnChartArea: false,
          drawTicks: true,
          color: 'transparent',
          lineWidth: 0,
          drawBorder: true,
          borderColor: 'rgba(0, 0, 0, 0.8)',
          borderWidth: 2,
        }
      }
    }
  };

  return (
    <Box sx={{
      height: 400,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      border: '1px solid #E0E0E0',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <Box sx={{ flexGrow: 1, width: '100%', p: 2 }}>
        <Chart 
          type='line' 
          data={chartDataset} 
          options={options} 
          ref={chartRef}
        />
      </Box>
    </Box>
  );
};

export default StackedAreaChart;