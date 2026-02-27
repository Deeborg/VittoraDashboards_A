export type ApprovalStatus = 'approved' | 'pending' | 'not_approved';
export type DisclosureStatus = 'disclosed' | 'not_disclosed' | 'pending_disclosure';

export interface RPTTransaction {
  id: string;
  date: string;
  relatedParty: string;
  relationship: string;
  transactionType: 'Sale' | 'Purchase' | 'Service' | 'Loan';
  category: string;
  value: number;
  currency: string;
  approvalStatus: ApprovalStatus;
  disclosureStatus: DisclosureStatus;
  section188Compliant: boolean;
  sebiLodrCompliant: boolean;
  description: string;
}

export interface BalanceData {
  party: string;
  relationship: string;
  receivables: number;
  payables: number;
  netBalance: number;
  daysOutstanding: number;
}

export interface KpiData {
  totalTransactions: number;
  totalValue: number;
  pendingApprovals: number;
  nonCompliant: number;
  outstandingReceivables: number;
  outstandingPayables: number;
}

export interface MonthlyData {
  month: string;
  sales: number;
  purchases: number;
  services: number;
  loans: number;
  total: number;
}

export interface ComplianceData {
  category: string;
  compliant: number;
  nonCompliant: number;
  pending: number;
}

export interface QuarterData {
  quarter: string;
  sales: number;
  purchases: number;
  services: number;
  loans: number;
  total: number;
}

export interface YearData {
  year: string;
  sales: number;
  purchases: number;
  services: number;
  loans: number;
  total: number;
}

export interface SummaryStats {
  totalParties: number;
  avgTransactionValue: number;
  complianceRate: number;
  disclosureRate: number;
  approvalRate: number;
}