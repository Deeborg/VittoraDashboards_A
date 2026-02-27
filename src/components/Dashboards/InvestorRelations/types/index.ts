/* ============================================
   TYPE DEFINITIONS
   investor-dashboard/src/types/index.ts
   ============================================
   
   All interfaces and types for the entire project.
   This is the single source of truth for data shapes.
   
   Benefits:
   - TypeScript catches typos at compile time
   - VS Code autocompletes every field name
   - Self-documenting — types explain the data
   - Impossible to pass wrong data to functions
============================================ */

// ── Company Info ──────────────────────────────
export interface CompanyInfo {
    name:              string;
    ticker:            string;
    industry:          string;
    fiscalYearEnd:     string;
    currency:          string;
    sharesOutstanding: number;
}

// ── Financial Record (Income Statement) ──────
export interface FinancialRecord {
    year:          number;
    quarter:       string;
    period:        string;
    netSales:      number;
    otherIncome:   number;
    totalRevenue:  number;
    cogs:          number;
    grossProfit:   number;
    employeeCost:  number;
    otherExpenses: number;
    depreciation:  number;
    ebitda:        number;
    ebit:          number;
    interest:      number;
    pbt:           number;
    tax:           number;
    pat:           number;
    eps:           number;
}

// ── Balance Sheet Record ──────────────────────
export interface BalanceSheetRecord {
    year:                number;
    quarter:             string;
    period:              string;
    equity:              number;
    totalDebt:           number;
    longTermDebt:        number;
    shortTermDebt:       number;
    cashAndBank:         number;
    investments:         number;
    netDebt:             number;
    currentAssets:       number;
    currentLiabilities:  number;
    totalAssets:         number;
}

// ── Operational Metrics ───────────────────────
export interface OperationalRecord {
    year:                number;
    quarter:             string;
    period:              string;
    capacityUtilization: number;
    salesQuantity:       number;
    salesValue:          number;
    employeeCount:       number;
    revenuePerEmployee:  number;
}

// ── Product ───────────────────────────────────
export interface Product {
    id:                  string;
    name:                string;
    category:            string;
    launchDate:          string;
    status:              'New' | 'Growth' | 'Mature';
    revenueContribution: number;
}

// ── Sales by Product ──────────────────────────
export interface ProductSales {
    productId:      string;
    productName:    string;
    quantity:       number;
    revenue:        number;
    percentOfTotal: number;
}

// ── Sales by Industry ─────────────────────────
export interface IndustrySales {
    industry:       string;
    revenue:        number;
    percentOfTotal: number;
    clientCount:    number;
}

// ── Geography ─────────────────────────────────
export interface CountryBreakdown {
    country: string;
    revenue: number;
}

export interface GeographyRecord {
    region:         string;
    revenue:        number;
    percentOfTotal: number;
    breakdown?:     CountryBreakdown[];
}

// ── Client ────────────────────────────────────
export type ClientRelationship =
    | 'Strategic'
    | 'Key Account'
    | 'Standard'
    | 'New';

export type ClientStatus = 'Active' | 'Inactive';

export interface Client {
    id:            string;
    name:          string;
    industry:      string;
    relationship:  ClientRelationship;
    since:         string;
    annualRevenue: number;
    status:        ClientStatus;
    isNew?:        boolean;
}

// ── New Client ────────────────────────────────
export interface NewClient {
    id:              string;
    name:            string;
    industry:        string;
    joinedQuarter:   string;
    initialContract: number;
}

// ── Full Company Data Object ──────────────────
export interface CompanyDataType {
    companyInfo:        CompanyInfo;
    financialSummary:   FinancialRecord[];
    balanceSheet:       BalanceSheetRecord[];
    operationalMetrics: OperationalRecord[];
    products:           Product[];
    salesByProduct:     ProductSales[];
    salesByIndustry:    IndustrySales[];
    salesByGeography:   GeographyRecord[];
    clients:            Client[];
    newClients2024:     NewClient[];
}

// ── Dashboard State ───────────────────────────
export interface DashboardState {
    currentSection:   SectionName;
    selectedYear:     number;
    selectedQuarter:  string;
    selectedIndustry: string;
    searchTerm:       string;
}

export type SectionName =
    | 'business-overview'
    | 'financial-summary'
    | 'balance-sheet'
    | 'operational-kpis';

// ── Growth Result ─────────────────────────────
export interface GrowthResult {
    text:  string;
    class: 'positive' | 'negative' | 'neutral';
}

// ── YoY / QoQ Comparison Result ───────────────
export interface YoYResult {
    current:  number | null;
    previous: number | null;
    growth:   number | null;
}

// ── Waterfall Step ────────────────────────────
export type WaterfallStepType = 'total' | 'subtract';

export interface WaterfallStep {
    label: string;
    value: number;
    type:  WaterfallStepType;
}

// ── Table Column Definition ───────────────────
/*
   FIX: Changed from T = Record<string, unknown>
   to   T extends object = Record<string, unknown>

   This allows typed interfaces (Client, ProductSales,
   IndustrySales etc.) to be passed to TableComponent.create()
   without TypeScript complaining about missing index signatures.

   The constraint T extends object means "any object type"
   which correctly accepts named interfaces like Client.
*/
export interface TableColumn<T extends object = Record<string, unknown>> {
    field:      keyof T | string;
    label:      string;
    align?:     'left' | 'right';
    sortable?:  boolean;
    formatter?: (value: unknown, row: T) => string;
}

// ── Formatter Options ─────────────────────────
export interface CurrencyOptions {
    decimals?: number;
    symbol?:   string;
    fallback?: string;
}

export interface PercentOptions {
    decimals?: number;
    fallback?: string;
}