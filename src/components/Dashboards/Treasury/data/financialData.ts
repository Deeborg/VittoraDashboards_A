/* ================= TYPES ================= */

export type Month =
  | 'Apr 2023'
  | 'May 2023'
  | 'Jun 2023'
  | 'Jul 2023'
  | 'Aug 2023'
  | 'Sep 2023'
  | 'Oct 2023'
  | 'Nov 2023'
  | 'Dec 2023'
  | 'Jan 2024'
  | 'Feb 2024'
  | 'Mar 2024';

export interface NetDebtData {
  totalBorrowings: number;
  shortTermBorrowings: number;
  longTermBorrowings: number;
  cashBankBalances: number;
  fixedDeposits: number;
  lienMarkedFDs: number;
  readonly cashEquivalents: number;
  readonly netDebt: number;
}

export interface NetDebtMovementItem {
  month: Month;
  openingBalance: number;
  additions: number;
  repayments: number;
  closingBalance(): number;
}

export interface BorrowingItem {
  id: number;
  facility: string;
  bank?: string;
  lessor?: string;
  accountNumber: string;
  sanctionedLimit: number;
  utilizedAmount: number;
  interestRate: number;
  tenure: string;
  dueDate: string;
  interestMonthly: number;
  interestAnnual: number;
  category: string;
}

export interface InvestmentItem {
  id: number;
  instrument: string;
  issuer: string;
  folioNumber: string;
  amount: number;
  yield: number;
  maturity: string;
  category: string;
  creditRating: 'AAA' | 'AA+' | 'AA' | 'Sovereign';
}

/* ================= DATA ================= */

export const currentMonth: Month = 'Mar 2024';

export const months: Month[] = [
  'Apr 2023',
  'May 2023',
  'Jun 2023',
  'Jul 2023',
  'Aug 2023',
  'Sep 2023',
  'Oct 2023',
  'Nov 2023',
  'Dec 2023',
  'Jan 2024',
  'Feb 2024',
  'Mar 2024',
];

export const netDebtData: NetDebtData = {
  totalBorrowings: 2450000000,
  shortTermBorrowings: 850000000,
  longTermBorrowings: 1600000000,
  cashBankBalances: 680000000,
  fixedDeposits: 320000000,
  lienMarkedFDs: 75000000,

  get cashEquivalents() {
    return (
      this.cashBankBalances +
      (this.fixedDeposits - this.lienMarkedFDs)
    );
  },

  get netDebt() {
    return this.totalBorrowings - this.cashEquivalents;
  },
};

export const netDebtMovement: NetDebtMovementItem[] =
  months.map((month: Month) => ({
    month,
    openingBalance:
      Math.floor(Math.random() * 1200000000) +
      800000000,
    additions:
      Math.floor(Math.random() * 300000000) +
      50000000,
    repayments:
      Math.floor(Math.random() * 250000000) +
      30000000,
    closingBalance: function () {
      return (
        this.openingBalance +
        this.additions -
        this.repayments
      );
    },
  }));

export const borrowingsData: BorrowingItem[] = [
  {
    id: 1,
    facility: 'Cash Credit',
    bank: 'State Bank of India',
    accountNumber: 'CC-2001-4532',
    sanctionedLimit: 500000000,
    utilizedAmount: 320000000,
    interestRate: 8.25,
    tenure: 'Revolving',
    dueDate: 'Mar 2025',
    interestMonthly: 2200000,
    interestAnnual: 26400000,
    category: 'Working Capital',
  },
  {
    id: 2,
    facility: 'Term Loan',
    bank: 'HDFC Bank',
    accountNumber: 'TL-1805-7890',
    sanctionedLimit: 750000000,
    utilizedAmount: 750000000,
    interestRate: 7.85,
    tenure: '60 Months',
    dueDate: 'Jun 2027',
    interestMonthly: 4906250,
    interestAnnual: 58875000,
    category: 'Capital Expenditure',
  },
  {
    id: 3,
    facility: 'Overdraft',
    bank: 'ICICI Bank',
    accountNumber: 'OD-2203-1125',
    sanctionedLimit: 300000000,
    utilizedAmount: 185000000,
    interestRate: 8.75,
    tenure: '364 Days',
    dueDate: 'Feb 2025',
    interestMonthly: 1348958,
    interestAnnual: 16187500,
    category: 'Working Capital',
  },
  {
    id: 4,
    facility: "Buyer's Credit",
    bank: 'Axis Bank',
    accountNumber: 'BC-2308-3341',
    sanctionedLimit: 400000000,
    utilizedAmount: 400000000,
    interestRate: 6.95,
    tenure: '180 Days',
    dueDate: 'Aug 2024',
    interestMonthly: 2316667,
    interestAnnual: 27800000,
    category: 'Trade Finance',
  },
  {
    id: 5,
    facility: 'Lease Liability',
    lessor: 'Shapoorji Pallonji Real Estate',
    accountNumber: 'LL-2101-5567',
    sanctionedLimit: 450000000,
    utilizedAmount: 380000000,
    interestRate: 9.2,
    tenure: '84 Months',
    dueDate: 'Dec 2030',
    interestMonthly: 2913333,
    interestAnnual: 34960000,
    category: 'Operating Lease',
  },
];

export const maturityProfile: Record<string, number> = {
  'Within 3 months': 280000000,
  '3-6 months': 320000000,
  '6-12 months': 250000000,
  '1-3 years': 850000000,
  '3-5 years': 600000000,
  'Beyond 5 years': 200000000,
};

export const investmentsData: InvestmentItem[] = [
  {
    id: 1,
    instrument: 'Liquid Mutual Fund',
    issuer: 'HDFC AMC',
    folioNumber: 'MF-1001-7890',
    amount: 185000000,
    yield: 6.8,
    maturity: 'Open Ended',
    category: 'Liquid',
    creditRating: 'AAA',
  },
  {
    id: 2,
    instrument: 'Corporate Bond',
    issuer: 'Reliance Industries',
    folioNumber: 'CB-2002-4567',
    amount: 75000000,
    yield: 7.9,
    maturity: 'Mar 2026',
    category: 'Debt',
    creditRating: 'AA+',
  },
  {
    id: 3,
    instrument: 'Inter-Corporate Deposit',
    issuer: 'Tata Motors',
    folioNumber: 'ICD-3003-1234',
    amount: 120000000,
    yield: 8.5,
    maturity: 'Sep 2024',
    category: 'ICD',
    creditRating: 'AA',
  },
  {
    id: 4,
    instrument: 'Treasury Bill',
    issuer: 'Government of India',
    folioNumber: 'TB-4004-5678',
    amount: 95000000,
    yield: 6.2,
    maturity: 'Jun 2024',
    category: 'Government',
    creditRating: 'Sovereign',
  },
];