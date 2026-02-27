import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { formatCurrency } from '../../utils/formatters';
import { netDebtData } from '../../data/financialData';

const KPICard = ({ title, value, subtitle, trend, isNegative = false }) => {
  const TrendIcon = trend > 0 ? TrendingUpIcon : TrendingDownIcon;
  const trendColor = trend > 0 ? '#2e7d32' : '#d32f2f';

  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: '#546e7a', mb: 1 }}>
          {title}
        </Typography>
        
        <Typography variant="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {formatCurrency(value, true)}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
          <Typography variant="body2" sx={{ color: trendColor }}>
            {Math.abs(trend).toFixed(1)}% from last month
          </Typography>
        </Box>
        
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#90a4ae', display: 'block', mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const KPICards = () => {
  const totalInterestMonthly = 13780000;
  
  const kpis = [
    {
      title: 'Total Borrowings',
      value: netDebtData.totalBorrowings,
      subtitle: `Short-term: ${formatCurrency(netDebtData.shortTermBorrowings, true)} • Long-term: ${formatCurrency(netDebtData.longTermBorrowings, true)}`,
      trend: 2.3,
    },
    {
      title: 'Net Debt',
      value: netDebtData.netDebt,
      subtitle: 'Borrowings minus Cash Equivalents',
      trend: -1.5,
      isNegative: true,
    },
    {
      title: 'Cash & Equivalents',
      value: netDebtData.cashEquivalents,
      subtitle: `Includes FDs: ${formatCurrency(netDebtData.fixedDeposits - netDebtData.lienMarkedFDs, true)}`,
      trend: 4.2,
    },
    {
      title: 'Monthly Interest',
      value: totalInterestMonthly,
      subtitle: `Annual: ${formatCurrency(totalInterestMonthly * 12, true)}`,
      trend: 0.8,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {kpis.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <KPICard {...kpi} />
        </Grid>
      ))}
    </Grid>
  );
};

export default KPICards;