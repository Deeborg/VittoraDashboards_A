import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning as AlertCircle,
  PieChart as PieChartIcon,
  Download,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  AttachMoney as DollarSign,
  People as Users,
  Percent,
  Settings,
  TrendingDown as DepreciationIcon,
  ZoomIn,
  BarChart as BarChartIcon,
  CompareArrows,
  Info,
} from '@mui/icons-material';
import DateFilter from '../components/filters/DateFilter';
import EntityFilter from '../components/filters/EntityFilter';
import CategoryFilter from '../components/filters/CategoryFilter';
import ExpenseTrendChart from '../components/charts/ExpenseTrendChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import BudgetVsActualChart from '../components/charts/BudgetVsActualChart';
import ComparisonChart from '../components/charts/ComparisonChart';
import { TrendData, CategoryData, BudgetData, EntityComparisonData } from '../types';

const Dashboard: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<string | string[]>(['all']);
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>(['all']);
  const [timeRange, setTimeRange] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const formatCurrency = (value: number): string => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(2)} K`;
    return `₹${value.toFixed(2)}`;
  };

  // Mock data for charts - FIXED: Added month property
  const trendData: TrendData[] = [
    { month: 'Jan', period: 'Jan', total: 8500000, budget: 8000000, rawMaterial: 3500000, employee: 2800000, finance: 1200000, other: 800000, depreciation: 200000 },
    { month: 'Feb', period: 'Feb', total: 9200000, budget: 8500000, rawMaterial: 3800000, employee: 3000000, finance: 1400000, other: 900000, depreciation: 200000 },
    { month: 'Mar', period: 'Mar', total: 10500000, budget: 9000000, rawMaterial: 4200000, employee: 3200000, finance: 1500000, other: 1100000, depreciation: 250000 },
    { month: 'Apr', period: 'Apr', total: 8800000, budget: 8500000, rawMaterial: 3600000, employee: 2900000, finance: 1300000, other: 850000, depreciation: 200000 },
    { month: 'May', period: 'May', total: 9500000, budget: 8800000, rawMaterial: 4000000, employee: 3100000, finance: 1450000, other: 950000, depreciation: 220000 },
    { month: 'Jun', period: 'Jun', total: 10200000, budget: 9000000, rawMaterial: 4300000, employee: 3300000, finance: 1550000, other: 1050000, depreciation: 250000 },
  ];

  const budgetData: BudgetData[] = [
    { name: 'Factory A', actual: 12000000, budget: 10000000, variance: 20, color: '#2563eb' },
    { name: 'Factory B', actual: 8500000, budget: 9000000, variance: -5.6, color: '#059669' },
    { name: 'Factory C', actual: 6500000, budget: 7000000, variance: -7.1, color: '#d97706' },
    { name: 'Factory D', actual: 9500000, budget: 8500000, variance: 11.8, color: '#7c3aed' },
    { name: 'Office', actual: 4200000, budget: 4000000, variance: 5, color: '#0ea5e9' },
  ];

  const categoryData: CategoryData[] = [
    { name: 'Raw Material', value: 15000000, color: '#2563eb', budget: 14000000, variance: 7.1 },
    { name: 'Employee', value: 12000000, color: '#059669', budget: 12500000, variance: -4 },
    { name: 'Finance', value: 4000000, color: '#d97706', budget: 4500000, variance: -11.1 },
    { name: 'Other', value: 2000000, color: '#7c3aed', budget: 1800000, variance: 11.1 },
    { name: 'Depreciation', value: 1200000, color: '#0ea5e9', budget: 1000000, variance: 20 },
  ];

  const comparisonData: EntityComparisonData[] = [
    { 
      entity: 'Factory A', 
      efficiency: 85, 
      costControl: 78, 
      budgetAdherence: 65, 
      trend: 72, 
      variance: 20,
      color: '#2563eb',
      fill: 'rgba(37, 99, 235, 0.2)'
    },
    { 
      entity: 'Factory B', 
      efficiency: 72, 
      costControl: 88, 
      budgetAdherence: 92, 
      trend: 80, 
      variance: -5.6,
      color: '#059669',
      fill: 'rgba(5, 150, 105, 0.2)'
    },
    { 
      entity: 'Factory C', 
      efficiency: 90, 
      costControl: 75, 
      budgetAdherence: 85, 
      trend: 65, 
      variance: -7.1,
      color: '#d97706',
      fill: 'rgba(217, 119, 6, 0.2)'
    },
    { 
      entity: 'Factory D', 
      efficiency: 95, 
      costControl: 85, 
      budgetAdherence: 75, 
      trend: 75, 
      variance: 11.8,
      color: '#7c3aed',
      fill: 'rgba(124, 58, 237, 0.2)'
    },
    { 
      entity: 'Office', 
      efficiency: 78, 
      costControl: 82, 
      budgetAdherence: 88, 
      trend: 85, 
      variance: 5,
      color: '#0ea5e9',
      fill: 'rgba(14, 165, 233, 0.2)'
    },
  ];

  const totalExpense = categoryData.reduce((sum, cat) => sum + cat.value, 0);
  const totalBudget = categoryData.reduce((sum, cat) => sum + cat.budget, 0);
  const totalVariance = ((totalExpense - totalBudget) / totalBudget) * 100;
  const highCostAreas = categoryData.filter(cat => cat.variance > 5).length;

  const handleClearFilters = () => {
    setSelectedEntity(['all']);
    setSelectedCategory(['all']);
    setStartDate(null);
    setEndDate(null);
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    console.log('Date range:', start, end);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#0a1929', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#ffffff' }}>
              Expense Analytics Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Track where money is spent and control costs
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
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
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
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
              Export
            </Button>
          </Stack>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3,
              borderRadius: 2,
              backgroundColor: '#ffffff',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <DateFilter onDateChange={handleDateChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <EntityFilter value={selectedEntity} onChange={setSelectedEntity} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  Clear All Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            title: 'Total Expense', 
            value: formatCurrency(totalExpense), 
            icon: <TrendingUp />, 
            color: '#2563eb',
            change: totalVariance,
          },
          { 
            title: 'Budget Variance', 
            value: `${totalVariance > 0 ? '+' : ''}${totalVariance.toFixed(2)}%`, 
            icon: <TrendingDown />, 
            color: totalVariance > 0 ? '#dc2626' : '#059669',
            change: totalVariance,
          },
          { 
            title: 'High Cost Areas', 
            value: highCostAreas.toString(), 
            icon: <AlertCircle />, 
            color: '#d97706',
          },
          { 
            title: 'Categories', 
            value: categoryData.length.toString(), 
            icon: <PieChartIcon />, 
            color: '#7c3aed',
          },
        ].map((kpi, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ 
              borderRadius: 2,
              backgroundColor: '#ffffff',
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                  }}>
                    <Box sx={{ color: kpi.color }}>
                      {kpi.icon}
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b', 
                      fontWeight: 500,
                    }}>
                      {kpi.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: '#000000',
                  mb: 1,
                }}>
                  {kpi.value}
                </Typography>
                {kpi.change !== undefined && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: kpi.change > 0 ? '#dc2626' : '#059669',
                      fontWeight: 600,
                    }}
                  >
                    {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(2)}% vs budget
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Expense Trend Chart */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ 
            p: 2.5, 
            height: 450,
            backgroundColor: '#ffffff',
            borderRadius: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                Expense Trend Analysis
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small">
                  <ZoomIn fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <Info fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ height: 'calc(100% - 48px)', width: '100%' }}>
              <ExpenseTrendChart data={trendData} timeRange={timeRange} />
            </Box>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ 
            p: 2.5, 
            height: 450,
            backgroundColor: '#ffffff',
            borderRadius: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                Category Distribution
              </Typography>
              <PieChartIcon sx={{ color: '#64748b' }} />
            </Box>
            <Box sx={{ height: 'calc(100% - 48px)', width: '100%' }}>
              <CategoryPieChart data={categoryData} />
            </Box>
          </Paper>
        </Grid>

        {/* Budget vs Actual */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ 
            p: 2.5, 
            height: 450,
            backgroundColor: '#ffffff',
            borderRadius: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                Budget vs Actual
              </Typography>
              <BarChartIcon sx={{ color: '#64748b' }} />
            </Box>
            <Box sx={{ height: 'calc(100% - 48px)', width: '100%' }}>
              <BudgetVsActualChart data={budgetData} />
            </Box>
          </Paper>
        </Grid>

        {/* Comparison Chart */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ 
            p: 2.5, 
            height: 450,
            backgroundColor: '#ffffff',
            borderRadius: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                Entity Comparison
              </Typography>
              <CompareArrows sx={{ color: '#64748b' }} />
            </Box>
            <Box sx={{ height: 'calc(100% - 48px)', width: '100%' }}>
              <ComparisonChart data={comparisonData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ 
            p: 2.5,
            backgroundColor: '#ffffff',
            borderRadius: 2,
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 2 }}>
              Top Variances
            </Typography>
            <Stack spacing={1.5}>
              {budgetData.map((item, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  py: 1.5,
                  px: 1,
                  borderRadius: 1,
                  backgroundColor: index % 2 === 0 ? '#f8fafc' : 'transparent'
                }}>
                  <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${item.variance > 0 ? '+' : ''}${item.variance.toFixed(1)}%`}
                    sx={{
                      backgroundColor: item.variance > 0 ? '#fee2e2' : '#d1fae5',
                      color: item.variance > 0 ? '#dc2626' : '#059669',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 24
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ 
            p: 2.5,
            backgroundColor: '#ffffff',
            borderRadius: 2,
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 2 }}>
              Quick Actions
            </Typography>
            <Stack spacing={1.5}>
              <Button 
                variant="outlined" 
                startIcon={<TrendingUp />} 
                fullWidth
                sx={{ 
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderColor: '#e2e8f0',
                  color: '#1e293b',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                Analyze Trends
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<FilterIcon />} 
                fullWidth
                onClick={() => setShowFilters(true)}
                sx={{ 
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderColor: '#e2e8f0',
                  color: '#1e293b',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                Apply Advanced Filters
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Download />} 
                fullWidth
                onClick={handleExport}
                sx={{ 
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderColor: '#e2e8f0',
                  color: '#1e293b',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                Download Detailed Report
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Settings />} 
                fullWidth
                sx={{ 
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderColor: '#e2e8f0',
                  color: '#1e293b',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                Configure Alerts
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;