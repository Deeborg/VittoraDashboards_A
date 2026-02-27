// src/components/Dashboards/LoansBorrowing/components/types.ts

// Props types
export interface MiniCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  color?: string;
}

export interface ChartCardProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export interface DataTableProps {
  title: string;
  columns: Array<{
    key: string;
    header: string;
    render?: (value: any) => React.ReactNode;
  }>;
  data: any[];
  highlightRows?: (row: any) => boolean;
}

// Data row types
export interface CurrencyExposureRow {
  currency: string;
  amount: string;
  percentage: number;
  hedgedAmount: string;
  exposedAmount: string;
  riskLevel: string;
}

export interface InterestRateRow {
  facilityId: string;
  currency: string;
  principalAmount: string;
  interestRate: string;
  benchmark: string;
  spread: string;
  nextResetDate: string;
  status: string;
}

export interface HedgingRow {
  currency: string;
  totalExposure: string;
  hedgedAmount: string;
  hedgingRatio: string;
  instruments: string;
  counterparty: string;
  maturityProfile: string;
}

export interface CovenantRow {
  covenant: string;
  metric: string;
  threshold: string;
  status: string;
  facilityId: string;
  nextTestDate: string;
}

export interface RiskRow {
  riskCategory: string;
  exposure: string;
  probability: string;
  impact: string;
  mitigation: string;
  owner: string;
}

export interface PaymentRow {
  facilityId: string;
  currency: string;
  principalAmount: string;
  interestAmount: string;
  totalPayment: string;
  dueDate: string;
  status: string;
  daysRemaining: number;
}