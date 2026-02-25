/** A row from the raw, mapped CSV/Excel data. */
export interface MappedRow {
  [key: string]: string | number | undefined;
  "Level 1 Desc"?: string;
  "Level 2 Desc"?: string;
  "Level 3 Desc"?: string;
  amountCurrent?: number;
  amountPrevious?: number;
}
export interface FinancialVarRow {
  key: string; // ← a dynamic key (like 'sales', 'inventory', etc.)
  amountCurrent?: number;
  amountPrevious?: number;
}

export interface TextVarRow {
  key: string;
  amountCurrent: string;
}

// Represents a table within a policy note.
export interface TableContent {
  type: "table";
  headers: string[];
  rows: string[][];
  isEditable?: boolean;
  isTextTable?: boolean;
}
// Represents a single accounting policy, which can contain text and tables.
export interface AccountingPolicy {
  title: string;
  text: (string | TableContent)[];
}
// Represents the raw structure of an item in the templates.
export interface TemplateItem {
  key: string;
  label: string;
  note?: string | number;
  noteLink?: number;   
  isGrandTotal?: boolean;
  isSubtotal?: boolean;
  children?: TemplateItem[];
  keywords?: string[];
  formula?: (string | number)[];
  id?: string;
  isEditableRow?: boolean;
}
// Represents the final, processed item with calculated values.
export interface HierarchicalItem extends TemplateItem {
  valueCurrent: number | null;
  valuePrevious: number | null;
  isEditableRow?: boolean;
  footer?: string;
  children?: HierarchicalItem[];
  narrativeText?: string;
  isNarrative?: boolean;
  isEditableText?: boolean;
  isEditableNote?: boolean;
  isEdited?: boolean;
}

export type CashFlowItem = {
  key?: string;
  id?: string;
  valueCurrent?: number | null;
  valuePrevious?: number | null;
  children?: CashFlowItem[];
};

export interface FinancialNote {
  noteNumber: number;
  title: string;
  subtitle?: string;
  content: (HierarchicalItem | TableContent | string)[];
  footer?: string;
  totalCurrent: number | null;
  totalPrevious: number | null;
  nonCurrentTotal?: { current: number; previous: number };
  currentTotal?: { current: number; previous: number };
  cceTotal?: { current: number; previous: number };
  otherBankBalancesTotal?: { current: number; previous: number };
}
// The final, consolidated data object.
export interface FinancialData {
  fundsFlow: any;
  dashboardKPIs: any;
  balanceSheet: HierarchicalItem[];
  incomeStatement: HierarchicalItem[];
  cashFlow: HierarchicalItem[];
  notes: FinancialNote[];
  accountingPolicies: AccountingPolicy[];
  equityShareCapital: { columns: EquityColumn[]; rows: EquityRow[] };
  otherEquity: { columns: EquityColumn[]; rows: EquityRow[] };
}

export interface ManualJE {
  glAccount: string;
  [key: string]: string | number;
}

export interface FinancialStatementsProps {
  data?: MappedRow[];
  amountKeys?: { amountCurrentKey: string; amountPreviousKey: string };
  useDatabase?: boolean;
}

export interface EquityColumn {
  key: string;
  label: string;
}

export interface EquityRow {
  key: string;
  label: string;
  values?: Record<string, number | string>; // one value per column
  children?: EquityRow[];
}

// ADD THIS NEW INTERFACE AT THE END OF THE FILE
export interface CalculatedRatio {
  sNo: string;
  ratioMeasure: string;
  methodology?: string;
  valueCurrent: number | string;
  valuePrevious: number | string;
  percentageChange?: string;
}

export interface EquityColumn {
  key: string;
  label: string;
  subColumns?: EquityColumn[];
}

export interface EquityRow {
  key: string;
  label: string;
  id?: string;
  values?: Record<string, number | string>; // one value per column
  children?: EquityRow[];
}