export interface ExpenseCategory {
  id: string;
  name: string;
  value: number;
  budget: number;
  variance: number;
  color: string;
  icon?: string;
}

export interface ExpenseRecord {
  id: string;
  date: Date;
  category: string;
  subCategory: string;
  amount: number;
  budget: number;
  variance: number;
  entity?: string;
  factory?: string;
  unit: string;
  costCenter: string;
  glAccount: string;
  documentNo: string;
  poNumber?: string;
  grnNumber?: string;
  invoiceNumber?: string;
  description: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface TrendData {
  month: string;
  period: string;
  total: number;
  rawMaterial: number;
  employee: number;
  finance: number;
  other: number;
  depreciation: number;
  budget: number;
}

export interface ComparisonData {
  factory: string;
  entity?: string; // Add entity as optional for backward compatibility
  unit: string;
  totalExpense: number;
  rawMaterial: number;
  employee: number;
  finance: number;
  other: number;
  depreciation: number;
  budget: number;
  variance: number;
}

export interface DrillDownData {
  level: 'costCenter' | 'glAccount' | 'document';
  costCenter?: string;
  glAccount?: string;
  glDescription?: string;
  documentNo?: string;
  amount: number;
  budget: number;
  variance: number;
  children?: DrillDownData[];
}

export interface DocumentDetail {
  id: string;
  documentNo: string;
  date: Date;
  amount: number;
  poNumber?: string;
  grnNumber?: string;
  invoiceNumber?: string;
  vendor: string;
  status: 'Posted' | 'Pending' | 'Rejected';
  category: string;
  glAccount: string;
  costCenter: string;
  description?: string;
  documentChain?: DocumentChain;
}

export interface KPI {
  title: string;
  value: string;
  change: number;
  subtitle: string;
  icon: string;
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
}

export interface DocumentChain {
  poNumber?: string;
  grnNumber?: string;
  invoiceNumber?: string;
  status: 'Posted' | 'Pending' | 'Draft';
  linkedDocuments: string[];
}

export interface ExpenseDocument {
  id: string;
  documentNo: string;
  date: Date;
  amount: number;
  budget: number;
  variance: number;
  poNumber?: string;
  grnNumber?: string;
  invoiceNumber?: string;
  vendor: string;
  status: 'Posted' | 'Pending' | 'Draft' | 'Rejected';
  category: string;
  glAccount: string;
  costCenter: string;
  description?: string;
  documentChain?: DocumentChain;
}

// Chart specific types
export interface BudgetData {
  name: string;
  actual: number;
  budget: number;
  variance: number;
  color: string;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  budget: number;
  variance: number;
}

export interface EntityComparisonData {
  entity: string;
  efficiency: number;
  costControl: number;
  budgetAdherence: number;
  trend: number;
  variance: number;
  color: string;
  fill: string;
}