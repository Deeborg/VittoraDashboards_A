export const formatCurrency = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)} K`;
  }
  return `₹${value.toFixed(2)}`;
};

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getVarianceColor = (variance: number): string => {
  if (variance > 10) return '#dc2626';
  if (variance > 5) return '#d97706';
  if (variance > 0) return '#f59e0b';
  if (variance < -5) return '#059669';
  return '#6b7280';
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'posted':
      return '#059669';
    case 'pending':
      return '#d97706';
    case 'rejected':
      return '#dc2626';
    default:
      return '#6b7280';
  }
};