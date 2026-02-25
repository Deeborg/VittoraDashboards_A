// src/Components/Dashboard/RatioDescriptions.ts

export type RatioInterpretation = 'higher-is-better' | 'lower-is-better' | 'neutral';

export interface RatioInfo {
  description: string;
  interpretation: RatioInterpretation;
}

export const RATIO_DESCRIPTIONS: Record<string, RatioInfo> = {
  // --- LIQUIDITY RATIOS ---
  'Current Ratio': {
    description: 'Measures the ability to pay off short-term liabilities with current assets.',
    interpretation: 'higher-is-better',
  },
  'Quick Ratio': {
    description: 'Measures the ability to meet short-term obligations with most liquid assets.',
    interpretation: 'higher-is-better',
  },
  'Cash Ratio': {
    description: 'The ratio of total cash and cash equivalents to current liabilities.',
    interpretation: 'higher-is-better',
  },
  'Basic Defense Ratio': {
    description: 'Indicates the number of days a company can cover cash expenses without new revenue.',
    interpretation: 'higher-is-better',
  },

  // --- PROFITABILITY RATIOS ---
  'Gross Profit Margin': {
    description: 'Percentage of revenue exceeding the cost of goods sold.',
    interpretation: 'higher-is-better',
  },
  'EBITDA Margin': {
    description: 'Measures earnings before interest, taxes, depreciation, and amortization as a percentage of revenue.',
    interpretation: 'higher-is-better',
  },
  'EBIT Margin': {
    description: 'Profitability ratio measuring earnings before interest and taxes as a percentage of revenue.',
    interpretation: 'higher-is-better',
  },
  'Return on Equity (ROE)': {
    description: 'Financial performance relative to shareholders\' equity.',
    interpretation: 'higher-is-better',
  },
  'Return on Capital Employed (ROCE)': {
    description: 'Efficiency with which capital is used to generate profit.',
    interpretation: 'higher-is-better',
  },
  'Return on Assets (ROA)': {
    description: 'Indicates how profitable a company is relative to its total assets.',
    interpretation: 'higher-is-better',
  },

  // --- EFFICIENCY RATIOS ---
  'Inventory Days': {
    description: 'Average number of days it takes to turn inventory into sales.',
    interpretation: 'lower-is-better',
  },
  'Receivable Days': {
    description: 'Average number of days it takes to collect payments from customers.',
    interpretation: 'lower-is-better',
  },
  'Payable Days': {
    description: 'Average number of days it takes a company to pay its suppliers.',
    interpretation: 'neutral', // Can be lower-is-better or higher depending on cash strategy
  },
  'Asset Turnover': {
    description: 'Measures the efficiency of a company’s use of its assets to generate sales.',
    interpretation: 'higher-is-better',
  },

  // --- LEVERAGE RATIOS ---
  'Debt to Equity Ratio': {
    description: 'Compares total liabilities to shareholder equity.',
    interpretation: 'lower-is-better',
  },
  'Interest Coverage Ratio': {
    description: 'How many times a company can cover interest payments with its earnings.',
    interpretation: 'higher-is-better',
  },
  'Net Debt/EBITDA': {
    description: 'A leverage ratio that shows how many years it would take for a company to pay back its debt.',
    interpretation: 'lower-is-better',
  },

  // --- MARKET VALUATION ---
  'Earnings Per Share (EPS)': {
    description: 'Profit allocated to each outstanding share of common stock.',
    interpretation: 'higher-is-better',
  },
  'Price-Earnings (P/E) Ratio': {
    description: 'Market value of a stock compared to its earnings.',
    interpretation: 'neutral',
  },
  'Book Value Per Share': {
    description: 'Per-share value based on equity available to shareholders.',
    interpretation: 'higher-is-better',
  },
  'Market Cap': {
    description: 'Total market value of a company’s outstanding shares.',
    interpretation: 'higher-is-better',
  },
  'EV/EBITDA': {
    description: 'Enterprise Value to EBITDA; used to determine the value of a company.',
    interpretation: 'neutral',
  },
};