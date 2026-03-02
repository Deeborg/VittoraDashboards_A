import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Button,
  Grid,
} from '@mui/material';
import {
  TrendingUp,
  Download,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import ExpenseTrendChart from '../components/charts/ExpenseTrendChart';
import { mockTrendData } from '../utils/mockData';

const Expenses: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  const formatCurrency = (value: number): string => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(2)} K`;
    return `₹${value.toFixed(2)}`;
  };

  const handleRefresh = () => {
    console.log('Refreshing expense data...');
  };

  const handleExport = () => {
    console.log('Exporting expense data...');
  };

  // Calculate statistics
  const totalExpense = mockTrendData.reduce((sum, item) => sum + item.total, 0);
  const totalBudget = mockTrendData.reduce((sum, item) => sum + item.budget, 0);
  const avgVariance = ((totalExpense - totalBudget) / totalBudget) * 100;

 return (
      <Box sx={{ 
   
    width: '90%',
    
  }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff', mb: 1 }}>
              Expense Trends Analysis
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Track expense patterns and budget adherence over time
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ 
                textTransform: 'none',
                borderColor: '#334155',
                color: '#ffffff',
                '&:hover': {
                  borderColor: '#475569',
                  backgroundColor: '#1e293b',
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExport}
              sx={{ 
                textTransform: 'none',
                backgroundColor: '#2563eb',
                '&:hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Export Data
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Time Range Selector */}
      <Paper sx={{ 
        p: 2, 
        mb: 3,
        borderRadius: 2,
        backgroundColor: '#ffffff',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Time Range:
          </Typography>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(_, value) => value && setTimeRange(value)}
            size="small"
          >
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="quarterly">Quarterly</ToggleButton>
            <ToggleButton value="yearly">Yearly</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Chart */}
      <Paper sx={{ 
        p: 3,
        borderRadius: 2,
        backgroundColor: '#ffffff',
        height: 500,
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <TrendingUp sx={{ color: '#2563eb' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
            Expense Trend Overview
          </Typography>
        </Box>
        <Box sx={{ height: 'calc(100% - 48px)' }}>
          <ExpenseTrendChart data={mockTrendData} timeRange={timeRange} />
        </Box>
      </Paper>

      {/* Footer Stats */}
      <Paper sx={{ 
        p: 2.5,
        borderRadius: 2,
        backgroundColor: '#ffffff',
      }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 0.5 }}>
              Average Monthly Expense
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000000' }}>
              {formatCurrency(totalExpense / mockTrendData.length)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 0.5 }}>
              Total YTD Expense
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000000' }}>
              {formatCurrency(totalExpense)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 0.5 }}>
              Average Variance
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: avgVariance > 0 ? '#dc2626' : '#059669' }}>
              {avgVariance > 0 ? '+' : ''}{avgVariance.toFixed(2)}%
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Expenses;