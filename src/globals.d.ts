// vittora/src/globals.d.ts

export {};

declare global {
  interface Window {
    // 1. Data & State
    CompanyData: any;
    AppState: {
        currentSection: string;
        selectedYear: number;
        selectedQuarter: string;
        selectedIndustry: string;
        searchTerm: string;
    };
    
    // 2. Utilities
    Formatters: any;
    Calculations: any;
    
    // 3. Components
    TableComponent: any;
    WaterfallChart: any;
    Filters: any;
    Navigation: any;
    
    // 4. Section Renderers (Must be exactly these names for 'keyof Window')
    BusinessOverview: { render: (container: HTMLElement) => void };
    FinancialSummary: { render: (container: HTMLElement) => void };
    BalanceSheet:     { render: (container: HTMLElement) => void };
    OperationalKPIs:  { render: (container: HTMLElement) => void };
  }
}