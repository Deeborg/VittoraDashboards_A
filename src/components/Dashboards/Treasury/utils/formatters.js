// Professional financial formatting utilities
export const formatCurrency = (value, compact = false) => {
  if (compact && value >= 10000000) {
    const crores = value / 10000000;
    return `₹${crores.toFixed(1)} Cr`;
  }
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(value);
};

export const formatPercentage = (value) => {
  return `${value.toFixed(2)}%`;
};

export const formatDate = (dateString) => {
  // Converts YYYY-MM to MMM YYYY format
  const [year, month] = dateString.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

export const calculateInterest = (principal, rate) => {
  return (principal * rate) / (12 * 100); // Monthly interest
};