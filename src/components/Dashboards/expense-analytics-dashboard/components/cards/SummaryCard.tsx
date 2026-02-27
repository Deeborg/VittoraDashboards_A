import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning as AlertCircle,
  PieChart as PieChartIcon,
  AttachMoney as DollarSign,
} from '@mui/icons-material';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  color = 'primary',
}) => {
  const colorMap = {
    primary: { bg: '#2563eb10', color: '#2563eb' },
    secondary: { bg: '#05966910', color: '#059669' },
    error: { bg: '#dc262610', color: '#dc2626' },
    warning: { bg: '#d9770610', color: '#d97706' },
    success: { bg: '#05966910', color: '#059669' },
  };

  const defaultIcons = {
    'Total Expense': <DollarSign />,
    'Budget Variance': <TrendingDown />,
    'High Cost Areas': <AlertCircle />,
    'Categories': <PieChartIcon />,
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}
            >
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: colorMap[color].bg,
              color: colorMap[color].color,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
            }}
          >
            {icon || defaultIcons[title as keyof typeof defaultIcons]}
          </Box>
        </Box>
        
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {change > 0 ? (
              <TrendingUp sx={{ fontSize: 16, color: 'error.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: 'success.main' }} />
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: change > 0 ? 'error.main' : 'success.main',
              }}
            >
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs budget
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;