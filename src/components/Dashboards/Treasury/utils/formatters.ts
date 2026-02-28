/* ================= CURRENCY FORMATTER ================= */

export const formatCurrency = (
  value: number,
  compact: boolean = false
): string => {
  if (compact && value >= 10000000) {
    const crores: number = value / 10000000;
    return `₹${crores.toFixed(1)} Cr`;
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(value);
};

/* ================= PERCENTAGE FORMATTER ================= */

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

/* ================= DATE FORMATTER ================= */
/**
 * Converts YYYY-MM to MMM YYYY format
 * Example: "2024-03" → "Mar 2024"
 */
export const formatDate = (dateString: string): string => {
  const [year, month] = dateString.split('-');

  const parsedYear: number = Number(year);
  const parsedMonth: number = Number(month);

  const date = new Date(parsedYear, parsedMonth - 1);

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

/* ================= INTEREST CALCULATOR ================= */
/**
 * Calculates Monthly Interest
 */
export const calculateInterest = (
  principal: number,
  rate: number
): number => {
  return (principal * rate) / (12 * 100);
};