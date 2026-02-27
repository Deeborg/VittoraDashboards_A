import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableIcon,
  Download,
  FilterList as FilterIcon,
  CompareArrows,
  Warning as AlertIcon,
} from '@mui/icons-material';
import ComparisonTable from '../components/tables/ComparisonTable'; // Correct path
import { mockComparisonData, mockCategories, mockTrendData, mockBudgetData, mockCategoryData, mockEntityComparisonData } from '../utils/mockData';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import BudgetVsActualChart from '../components/charts/BudgetVsActualChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import ExpenseTrendChart from '../components/charts/ExpenseTrendChart';
import ComparisonChart from '../components/charts/ComparisonChart';

// Define types for the metrics
interface FactoryMetric {
  factory: string;
  total: number;
  variance: number;
  efficiency: string;
}

interface CategoryMetric {
  category: string;
  total: number;
  variance: number;
  efficiency: string;
}

interface TimeMetric {
  period: string;
  total: number;
  variance: number;
  budget: number;
}

const Comparison: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'summary'>('table');
  const [comparisonType, setComparisonType] = useState<'factories' | 'category' | 'time'>('factories');
  const [timePeriod, setTimePeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedMetric, setSelectedMetric] = useState<'total' | 'variance'>('total');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFactories, setSelectedFactories] = useState<string[]>(['all']);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'table' | 'chart' | 'summary' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Format variance with + sign only for positive values
  const formatVariance = (variance: number): string => {
    const percentage = formatPercentage(variance);
    const cleanPercentage = percentage.replace(/^\+/, '');
    return `${variance > 0 ? '+' : ''}${cleanPercentage}`;
  };

  // Calculate comparison metrics with proper typing
  const factoryMetrics: FactoryMetric[] = mockComparisonData.map(factory => ({
    factory: factory.factory,
    total: factory.totalExpense,
    variance: factory.variance,
    efficiency: factory.variance < 0 ? 'High' : factory.variance < 5 ? 'Medium' : 'Low',
  }));

  const categoryMetrics: CategoryMetric[] = mockCategories.map(category => ({
    category: category.name,
    total: category.value,
    variance: category.variance,
    efficiency: category.variance < 0 ? 'Favorable' : 'Unfavorable',
  }));

  const timeMetrics: TimeMetric[] = mockTrendData.map(period => ({
    period: period.period || period.month || '',
    total: period.total,
    variance: ((period.total - period.budget) / period.budget) * 100,
    budget: period.budget,
  }));

  const getBestPerformer = (): { entity: string; variance: number } | null => {
    if (comparisonType === 'factories') {
      const factoryEntities = factoryMetrics.filter(item => 
        item.factory.toLowerCase().includes('factory')
      );
      
      if (factoryEntities.length === 0) return null;
      
      const best = factoryEntities.reduce((prev, current) => 
        current.variance < prev.variance ? current : prev
      );
      return { entity: best.factory, variance: best.variance };
    }
    if (comparisonType === 'category') {
      const best = categoryMetrics.reduce((prev, current) => 
        current.variance < prev.variance ? current : prev
      );
      return { entity: best.category, variance: best.variance };
    }
    if (comparisonType === 'time') {
      const best = timeMetrics.reduce((prev, current) =>
        current.variance < prev.variance ? current : prev
      );
      return { entity: best.period, variance: best.variance };
    }
    return null;
  };

  const getWorstPerformer = (): { entity: string; variance: number } | null => {
    if (comparisonType === 'factories') {
      const factoryEntities = factoryMetrics.filter(item => 
        item.factory.toLowerCase().includes('factory')
      );
      
      if (factoryEntities.length === 0) return null;
      
      const worst = factoryEntities.reduce((prev, current) => 
        current.variance > prev.variance ? current : prev
      );
      return { entity: worst.factory, variance: worst.variance };
    }
    if (comparisonType === 'category') {
      const worst = categoryMetrics.reduce((prev, current) => 
        current.variance > prev.variance ? current : prev
      );
      return { entity: worst.category, variance: worst.variance };
    }
    if (comparisonType === 'time') {
      const worst = timeMetrics.reduce((prev, current) =>
        current.variance > prev.variance ? current : prev
      );
      return { entity: worst.period, variance: worst.variance };
    }
    return null;
  };

  const bestPerformer = getBestPerformer();
  const worstPerformer = getWorstPerformer();

  return (
    <Box sx={{ backgroundColor: '#0a1929', minHeight: '100vh', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff' }}>
              Expense Comparison Analysis
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Compare expenses across factories, categories, and time periods
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilter(!showFilter)}
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
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              sx={{ 
                textTransform: 'none',
                backgroundColor: '#2563eb',
                '&:hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Export Report
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Filter Panel */}
      {showFilter && (
        <Paper sx={{ 
          p: 2, 
          mb: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff',
        }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
                Filter Options
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Factories</InputLabel>
                <Select
                  multiple
                  value={selectedFactories}
                  label="Factories"
                  onChange={(e) => setSelectedFactories(e.target.value as string[])}
                >
                  <MenuItem value="all">All Factories</MenuItem>
                  <MenuItem value="factory_a">Factory A</MenuItem>
                  <MenuItem value="factory_b">Factory B</MenuItem>
                  <MenuItem value="factory_c">Factory C</MenuItem>
                  <MenuItem value="factory_d">Factory D</MenuItem>
                  <MenuItem value="office">Office</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Variance Range</InputLabel>
                <Select defaultValue="all" label="Variance Range">
                  <MenuItem value="all">All Variances</MenuItem>
                  <MenuItem value="positive">Positive Only (+)</MenuItem>
                  <MenuItem value="negative">Negative Only (-)</MenuItem>
                  <MenuItem value="critical">Critical (&gt;10%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedFactories(['all'])}
                  sx={{ flex: 1 }}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setShowFilter(false)}
                  sx={{ flex: 1 }}
                >
                  Apply
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Controls */}
      <Paper sx={{ 
        p: 2, 
        mb: 3,
        borderRadius: 2,
        backgroundColor: '#ffffff',
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Comparison Type</InputLabel>
              <Select
                value={comparisonType}
                label="Comparison Type"
                onChange={(e) => setComparisonType(e.target.value as 'factories' | 'category' | 'time')}
              >
                <MenuItem value="factories">Across Factories</MenuItem>
                <MenuItem value="category">Across Categories</MenuItem>
                <MenuItem value="time">Over Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Period</InputLabel>
              <Select
                value={timePeriod}
                label="Time Period"
                onChange={(e) => setTimePeriod(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Primary Metric</InputLabel>
              <Select
                value={selectedMetric}
                label="Primary Metric"
                onChange={(e) => setSelectedMetric(e.target.value as 'total' | 'variance')}
              >
                <MenuItem value="total">Total Expense</MenuItem>
                <MenuItem value="variance">Budget Variance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              fullWidth
              sx={{ 
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  '&.Mui-selected': {
                    backgroundColor: '#2563eb',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1d4ed8',
                    }
                  }
                }
              }}
            >
              <ToggleButton value="table">
                <TableIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="chart">
                <BarChartIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="summary">
                <PieChartIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Performance Highlights */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            borderTop: '4px solid #059669',
            borderRadius: 2,
            backgroundColor: '#ffffff',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingDown sx={{ color: '#059669' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {comparisonType === 'factories' ? 'Best Performing Factory' : 'Best Performer'}
                </Typography>
              </Box>
              {bestPerformer && (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000', mb: 2 }}>
                    {bestPerformer.entity}
                  </Typography>
                  <Chip
                    label={formatVariance(bestPerformer.variance)}
                    size="small"
                    sx={{
                      backgroundColor: '#d1fae5',
                      color: '#059669',
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                    {comparisonType === 'factories' 
                      ? 'Lowest budget variance among factories' 
                      : 'Lowest budget variance'}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            borderTop: '4px solid #dc2626',
            borderRadius: 2,
            backgroundColor: '#ffffff',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUp sx={{ color: '#dc2626' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {comparisonType === 'factories' ? 'Factory Needs Attention' : 'Needs Attention'}
                </Typography>
              </Box>
              {worstPerformer && (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000', mb: 2 }}>
                    {worstPerformer.entity}
                  </Typography>
                  <Chip
                    label={formatVariance(worstPerformer.variance)}
                    size="small"
                    sx={{
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                    {comparisonType === 'factories' 
                      ? 'Highest budget variance among factories' 
                      : 'Highest budget variance'}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            borderTop: '4px solid #2563eb',
            borderRadius: 2,
            backgroundColor: '#ffffff',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CompareArrows sx={{ color: '#2563eb' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Comparison Summary
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000', mb: 2 }}>
                {comparisonType === 'factories' ? '5 Factories' : 
                 comparisonType === 'category' ? '5 Categories' : '12 Months'}
              </Typography>
              <Chip
                label={viewMode === 'table' ? 'Table View' : 
                       viewMode === 'chart' ? 'Chart View' : 'Summary View'}
                size="small"
                sx={{
                  backgroundColor: '#dbeafe',
                  color: '#2563eb',
                  fontWeight: 600,
                }}
              />
              <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                {comparisonType === 'factories' ? 'Comparing across factories' :
                 comparisonType === 'category' ? 'Comparing expense categories' :
                 'Analyzing trends over time'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      {viewMode === 'table' && (
        <Paper sx={{ 
          p: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
              {comparisonType === 'factories' ? 'Factory Comparison' :
               comparisonType === 'category' ? 'Category Comparison' :
               'Time Period Comparison'}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
            >
              Export Table
            </Button>
          </Box>
          {comparisonType === 'factories' ? (
            <ComparisonTable data={mockComparisonData} />
          ) : (
            <Box sx={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Actual</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Budget</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Variance</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryMetrics.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{item.category}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(item.total)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>
                        {formatCurrency(mockCategories[index].budget)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Chip
                          label={formatVariance(item.variance)}
                          size="small"
                          sx={{
                            backgroundColor: item.variance > 0 ? '#fee2e2' : '#d1fae5',
                            color: item.variance > 0 ? '#dc2626' : '#059669',
                            fontWeight: 600,
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Chip
                          label={item.efficiency}
                          size="small"
                          sx={{
                            backgroundColor: item.variance < 0 ? '#d1fae5' : '#fee2e2',
                            color: item.variance < 0 ? '#059669' : '#dc2626',
                            fontWeight: 600,
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Paper>
      )}

      {/* Chart View */}
      {viewMode === 'chart' && (
        <Paper sx={{ 
          p: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          height: 500
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 3 }}>
            {comparisonType === 'factories' ? 'Factory Performance Chart' :
             comparisonType === 'category' ? 'Category Comparison Chart' :
             'Trend Analysis Chart'}
          </Typography>
          <Box sx={{ height: 'calc(100% - 48px)' }}>
            {comparisonType === 'factories' && (
              <BudgetVsActualChart data={mockBudgetData} />
            )}
            {comparisonType === 'category' && (
              <CategoryPieChart data={mockCategoryData} />
            )}
            {comparisonType === 'time' && (
              <ExpenseTrendChart data={mockTrendData} timeRange={timePeriod} />
            )}
          </Box>
        </Paper>
      )}

      {/* Summary View */}
      {viewMode === 'summary' && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ 
              p: 3, 
              height: 300,
              borderRadius: 2,
              backgroundColor: '#ffffff',
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 2 }}>
                Key Insights
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                    Budget Performance
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {factoryMetrics.filter(e => e.variance < 0).length} out of {factoryMetrics.length} factories are under budget
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                    Cost Efficiency
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {categoryMetrics.filter(c => c.variance < 0).length} expense categories show favorable variance
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                    Trend Analysis
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Expenses have increased by 12.4% compared to last {timePeriod}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ 
              p: 3, 
              height: 300,
              borderRadius: 2,
              backgroundColor: '#ffffff',
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 2 }}>
                Recommendations
              </Typography>
              <Stack spacing={1.5}>
                {worstPerformer && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <AlertIcon sx={{ color: '#dc2626', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      Review expenses in <strong>{worstPerformer.entity}</strong> to identify cost-saving opportunities
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <TrendingDown sx={{ color: '#059669', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: '#475569' }}>
                    Implement best practices from <strong>{bestPerformer?.entity}</strong> across all units
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <BarChartIcon sx={{ color: '#2563eb', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: '#475569' }}>
                    Set up monthly review meetings for high-variance categories
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Footer Summary */}
      <Paper sx={{ 
        p: 3, 
        mt: 3, 
        backgroundColor: '#ffffff',
        borderRadius: 2,
      }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
              Total Compared
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000000' }}>
              {comparisonType === 'factories' ? '5 Factories' : 
               comparisonType === 'category' ? '5 Categories' : '12 Months'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
              Average Variance
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000000' }}>
              {formatVariance(
                comparisonType === 'factories' 
                  ? factoryMetrics.reduce((sum, e) => sum + e.variance, 0) / factoryMetrics.length
                  : categoryMetrics.reduce((sum, c) => sum + c.variance, 0) / categoryMetrics.length
              )}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
              Analysis Period
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000000' }}>
              {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Comparison;