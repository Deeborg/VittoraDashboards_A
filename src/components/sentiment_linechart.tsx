import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Box, Typography } from '@mui/material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface LineChartProps {
  dates: Date[];
  sentimentScores: number[];
  stockPrices: number[];
}

const LineChart = ({ dates, sentimentScores, stockPrices }: LineChartProps) => {
  // Process data to maintain chronological order
  const processedData = dates.map((date, index) => ({
    date: new Date(date),
    sentiment: sentimentScores[index],
    stockPrice: stockPrices[index]
  }));

  // Sort data by date to ensure chronological order
  processedData.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by month-year to calculate averages
  const monthlyAverages: {
    [key: string]: {
      date: Date;
      sentimentSum: number;
      sentimentCount: number;
      stockPriceSum: number;
      stockPriceCount: number;
    }
  } = {};

  processedData.forEach(({ date, sentiment, stockPrice }) => {
    const monthYearKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`;
    
    if (!monthlyAverages[monthYearKey]) {
      monthlyAverages[monthYearKey] = {
        date: new Date(date.getFullYear(), date.getMonth(), date.getDay()), // First day of month
        sentimentSum: 0,
        sentimentCount: 0,
        stockPriceSum: 0,
        stockPriceCount: 0
      };
    }
    
    monthlyAverages[monthYearKey].sentimentSum += sentiment;
    monthlyAverages[monthYearKey].sentimentCount++;
    monthlyAverages[monthYearKey].stockPriceSum += stockPrice;
    monthlyAverages[monthYearKey].stockPriceCount++;
  });

  // Convert to arrays and sort chronologically
  const sortedMonthlyData = Object.values(monthlyAverages).sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );

  // Prepare chart data
  const chartData = {
    labels: sortedMonthlyData.map(item => 
      item.date.toLocaleDateString('default', { day:'numeric',month: 'short', year: 'numeric' })
    ),
    datasets: [
      {
        label: 'Sentiment Score',
        data: sortedMonthlyData.map(item => (item.sentimentSum / item.sentimentCount)*100),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        borderWidth: 2
      },
      {
        label: 'Stock Price',
        data: sortedMonthlyData.map(item => item.stockPriceSum / item.stockPriceCount),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
        tension: 0.1,
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'category' as const,
        title: {
          display: true,
          text: 'Date',
          color: '#666',
          font: {
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Sentiment Score',
          color: '#666',
          font: {
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Stock Price',
          color: '#666',
          font: {
            weight: 'bold' as const
          }
        }
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const label = context.dataset.label || '';
            if (context.parsed.y !== null && !isNaN(context.parsed.y)) {
              return `${label}: ${context.parsed.y.toFixed(2)}`;
            }
            return `${label}: No data`;
          }
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
      overflow: 'hidden',
      backgroundColor: '#FFFFFF'
    }}>
      {dates.length > 0 && sentimentScores.length > 0 && stockPrices.length > 0 ? (
        <Box sx={{ width: '100%', height: '100%', p: 2 }}>
          <Chart type="line" data={chartData} options={options} />
        </Box>
      ) : (
        <Typography sx={{ textAlign: 'center', my: 2 }}>
          No data available to display the chart. Please check the input.
        </Typography>
      )}
    </Box>
  );
};

export default LineChart;