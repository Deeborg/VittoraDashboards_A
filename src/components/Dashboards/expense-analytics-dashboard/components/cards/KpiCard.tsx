import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface KpiCardProps {
  title: string;
  currentValue: number;
  targetValue: number;
  period: string;
  trend: number;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  currentValue,
  targetValue,
  period,
  trend,
}) => {
  const achievement = (currentValue / targetValue) * 100;
  const isPositive = trend < 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {formatCurrency(currentValue)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {period}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend > 0 ? (
              <TrendingUp sx={{ fontSize: 16, color: isPositive ? 'success.main' : 'error.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: isPositive ? 'success.main' : 'error.main' }} />
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: isPositive ? 'success.main' : 'error.main',
              }}
            >
              {formatPercentage(trend)}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Target: {formatCurrency(targetValue)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: achievement >= 100 ? 'success.main' : 'warning.main' }}
            >
              {achievement.toFixed(1)}% Achieved
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(achievement, 100)}
            color={achievement >= 100 ? 'success' : 'warning'}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default KpiCard;