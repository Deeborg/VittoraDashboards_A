import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Error as AlertCircle,
  Warning as AlertTriangle,
  Info as InfoIcon,
  CheckCircle,
} from '@mui/icons-material';

interface AlertCardProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  severity?: 'high' | 'medium' | 'low';
}

const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  description,
  severity = 'medium',
}) => {
  const typeConfig = {
    error: { icon: AlertCircle, color: '#dc2626', bg: '#fee2e2' },
    warning: { icon: AlertTriangle, color: '#d97706', bg: '#fef3c7' },
    info: { icon: InfoIcon, color: '#2563eb', bg: '#dbeafe' },
    success: { icon: CheckCircle, color: '#059669', bg: '#d1fae5' },
  };

  const severityConfig = {
    high: { label: 'High', color: '#dc2626' },
    medium: { label: 'Medium', color: '#d97706' },
    low: { label: 'Low', color: '#059669' },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Card sx={{ borderLeft: `4px solid ${config.color}`, backgroundColor: config.bg }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Icon sx={{ color: config.color }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {title}
              </Typography>
              <Chip
                label={severityConfig[severity].label}
                size="small"
                sx={{
                  backgroundColor: severityConfig[severity].color + '20',
                  color: severityConfig[severity].color,
                  fontWeight: 600,
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AlertCard;