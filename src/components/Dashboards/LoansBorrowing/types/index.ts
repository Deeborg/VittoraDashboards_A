// src/types/index.ts
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