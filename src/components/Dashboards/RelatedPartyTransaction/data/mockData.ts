import { 
  RPTTransaction, 
  BalanceData, 
  KpiData, 
  MonthlyData, 
  ComplianceData,
  ApprovalStatus,
  DisclosureStatus 
} from '../types';

// Realistic Indian company names for related parties
const relatedParties = {
  holdingCompanies: [
    'Ambani Holdings Ltd',
    'Tata Strategic Holdings',
    'Aditya Birla Capital Ltd',
    'Mahindra Investment Ltd',
    'Bajaj Holdings & Investment'
  ],
  subsidiaries: [
    'Reliance Retail Ventures',
    'TCS Global Solutions',
    'UltraTech Cement Ltd',
    'Infosys BPO Ltd',
    'HDFC Securities Ltd'
  ],
  associates: [
    'Jio Platforms Ltd',
    'Tata Motors Finance',
    'ICICI Lombard General Insurance',
    'Axis Bank Ltd',
    'Sun Pharmaceutical Industries'
  ],
  directors: [
    'Mr. Mukesh Ambani',
    'Mr. Ratan Tata',
    'Mrs. Kiran Mazumdar-Shaw',
    'Mr. Kumar Mangalam Birla',
    'Mr. N. Chandrasekaran'
  ],
  keyPersonnel: [
    'Mr. Shashi Kiran (CFO)',
    'Ms. Priya Sharma (Company Secretary)',
    'Mr. Rajesh Mehta (Head of Legal)',
    'Mr. Anil Verma (Head of Procurement)',
    'Ms. Sunita Patel (Head of Sales)'
  ]
};

// Transaction categories - Fixed with proper typing
const transactionCategories: Record<string, string[]> = {
  sales: ['Finished Goods', 'Raw Materials', 'Scrap', 'By-products', 'Traded Goods'],
  purchases: ['Raw Materials', 'Capital Goods', 'Consumables', 'Services', 'Software Licenses'],
  services: ['Management Services', 'Technical Consultancy', 'Marketing Services', 'IT Support', 'Legal Services'],
  loans: ['Working Capital Loan', 'Term Loan', 'Inter-corporate Deposit', 'Bridge Loan', 'Housing Loan']
};

// Generate realistic dates for the current year
const generateDates = (): string[] => {
  const currentYear = new Date().getFullYear();
  const dates: string[] = [];
  
  for (let month = 0; month < 12; month++) {
    for (let i = 0; i < 8; i++) { // 8 transactions per month
      const day = Math.floor(Math.random() * 28) + 1;
      dates.push(new Date(currentYear, month, day).toISOString().split('T')[0]);
    }
  }
  
  return dates.sort();
};

// Generate realistic transaction values based on type
const generateTransactionValue = (type: string): number => {
  const baseValues: Record<string, number> = {
    Sale: Math.random() * 5000000 + 1000000, // 1M to 6M
    Purchase: Math.random() * 3000000 + 500000, // 500K to 3.5M
    Service: Math.random() * 2000000 + 100000, // 100K to 2.1M
    Loan: Math.random() * 10000000 + 2000000 // 2M to 12M
  };
  
  return Math.round(baseValues[type] / 1000) * 1000; // Round to nearest 1000
};

// Generate compliance status with realistic probabilities
const generateComplianceStatus = (): { 
  approvalStatus: ApprovalStatus; 
  disclosureStatus: DisclosureStatus; 
  section188Compliant: boolean; 
  sebiLodrCompliant: boolean; 
} => {
  const random = Math.random();
  
  let approvalStatus: ApprovalStatus;
  if (random < 0.7) {
    approvalStatus = 'approved';
  } else if (random < 0.9) {
    approvalStatus = 'pending';
  } else {
    approvalStatus = 'not_approved';
  }
  
  let disclosureStatus: DisclosureStatus;
  if (random < 0.8) {
    disclosureStatus = 'disclosed';
  } else if (random < 0.95) {
    disclosureStatus = 'pending_disclosure';
  } else {
    disclosureStatus = 'not_disclosed';
  }
  
  return {
    approvalStatus,
    disclosureStatus,
    section188Compliant: random < 0.85,
    sebiLodrCompliant: random < 0.9
  };
};

// Generate related party and relationship
const generatePartyAndRelationship = (): { party: string; relationship: string } => {
  const partyTypes = Object.keys(relatedParties);
  const randomType = partyTypes[Math.floor(Math.random() * partyTypes.length)] as keyof typeof relatedParties;
  const partyList = relatedParties[randomType];
  const party = partyList[Math.floor(Math.random() * partyList.length)];
  
  const relationships: Record<string, string> = {
    holdingCompanies: 'Holding Company',
    subsidiaries: 'Subsidiary',
    associates: 'Associate Company',
    directors: 'Director',
    keyPersonnel: 'Key Managerial Personnel'
  };
  
  return {
    party,
    relationship: relationships[randomType] || 'Related Party'
  };
};

// Generate transaction description
const generateDescription = (type: string, category: string, party: string): string => {
  const descriptions: Record<string, string> = {
    Sale: `Sale of ${category.toLowerCase()} to ${party}`,
    Purchase: `Purchase of ${category.toLowerCase()} from ${party}`,
    Service: `${category} services provided by ${party}`,
    Loan: `${category} provided to ${party}`
  };
  
  return descriptions[type] || `Transaction with ${party}`;
};

// Helper function to get category list
const getCategoryList = (type: string): string[] => {
  const typeLower = type.toLowerCase();
  if (typeLower === 'sale') return transactionCategories.sales;
  if (typeLower === 'purchase') return transactionCategories.purchases;
  if (typeLower === 'service') return transactionCategories.services;
  if (typeLower === 'loan') return transactionCategories.loans;
  return [type]; // fallback
};

// Generate transactions - Fixed with safe category access
export const generateTransactions = (): RPTTransaction[] => {
  const dates = generateDates();
  const transactions: RPTTransaction[] = [];
  const transactionTypes: Array<'Sale' | 'Purchase' | 'Service' | 'Loan'> = ['Sale', 'Purchase', 'Service', 'Loan'];
  
  dates.forEach((date, index) => {
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const categoryList = getCategoryList(type);
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    
    const { party, relationship } = generatePartyAndRelationship();
    const value = generateTransactionValue(type);
    const compliance = generateComplianceStatus();
    const description = generateDescription(type, category, party);
    
    transactions.push({
      id: `RPT${String(index + 1).padStart(4, '0')}`,
      date,
      relatedParty: party,
      relationship,
      transactionType: type,
      category,
      value,
      currency: 'INR',
      approvalStatus: compliance.approvalStatus,
      disclosureStatus: compliance.disclosureStatus,
      section188Compliant: compliance.section188Compliant,
      sebiLodrCompliant: compliance.sebiLodrCompliant,
      description
    });
  });
  
  return transactions;
};

// Generate monthly data with realistic trends
export const generateMonthlyData = (): MonthlyData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((month, index) => {
    // Realistic seasonal patterns
    const seasonalFactor = 1 + 0.3 * Math.sin((index * Math.PI) / 6); // Sine wave for seasonality
    const randomFactor = 0.8 + Math.random() * 0.4; // Random variation
    
    const baseSales = 1500000 * seasonalFactor * randomFactor;
    const basePurchases = 1200000 * seasonalFactor * randomFactor;
    const baseServices = 800000 * seasonalFactor * randomFactor;
    const baseLoans = index % 3 === 0 ? 2500000 : 0; // Loans only every 3 months
    
    return {
      month,
      sales: Math.round(baseSales),
      purchases: Math.round(basePurchases),
      services: Math.round(baseServices),
      loans: Math.round(baseLoans),
      total: Math.round(baseSales + basePurchases + baseServices + baseLoans)
    };
  });
};

// Generate balance data with realistic outstanding amounts
export const generateBalanceData = (transactions: RPTTransaction[]): BalanceData[] => {
  // Group by party
  const partyMap = new Map<string, { receivables: number, payables: number, relationship: string }>();
  
  transactions.forEach(transaction => {
    if (!partyMap.has(transaction.relatedParty)) {
      partyMap.set(transaction.relatedParty, { 
        receivables: 0, 
        payables: 0, 
        relationship: transaction.relationship 
      });
    }
    
    const partyData = partyMap.get(transaction.relatedParty)!;
    
    if (transaction.transactionType === 'Sale' || transaction.transactionType === 'Service') {
      // Company is owed money
      partyData.receivables += transaction.value * (Math.random() > 0.3 ? 1 : 0); // 70% are outstanding
    } else if (transaction.transactionType === 'Purchase' || transaction.transactionType === 'Loan') {
      // Company owes money
      partyData.payables += transaction.value * (Math.random() > 0.4 ? 1 : 0); // 60% are outstanding
    }
  });
  
  return Array.from(partyMap.entries()).map(([party, data], index) => ({
    party,
    relationship: data.relationship,
    receivables: Math.round(data.receivables),
    payables: Math.round(data.payables),
    netBalance: Math.round(data.receivables - data.payables),
    daysOutstanding: Math.round(30 + Math.random() * 90) // 30-120 days
  })).filter(item => item.receivables > 0 || item.payables > 0); // Only include parties with balances
};

// Generate compliance data based on actual transactions
export const generateComplianceData = (transactions: RPTTransaction[]): ComplianceData[] => {
  let section188Compliant = 0;
  let section188NonCompliant = 0;
  let sebiLodrCompliant = 0;
  let sebiLodrNonCompliant = 0;
  let boardApproved = 0;
  let boardNotApproved = 0;
  let boardPending = 0;
  let disclosed = 0;
  let notDisclosed = 0;
  let pendingDisclosure = 0;
  
  transactions.forEach(transaction => {
    if (transaction.section188Compliant) section188Compliant++;
    else section188NonCompliant++;
    
    if (transaction.sebiLodrCompliant) sebiLodrCompliant++;
    else sebiLodrNonCompliant++;
    
    if (transaction.approvalStatus === 'approved') boardApproved++;
    else if (transaction.approvalStatus === 'pending') boardPending++;
    else boardNotApproved++;
    
    if (transaction.disclosureStatus === 'disclosed') disclosed++;
    else if (transaction.disclosureStatus === 'pending_disclosure') pendingDisclosure++;
    else notDisclosed++;
  });
  
  return [
    { 
      category: 'Section 188', 
      compliant: section188Compliant, 
      nonCompliant: section188NonCompliant, 
      pending: 0 
    },
    { 
      category: 'SEBI LODR 23', 
      compliant: sebiLodrCompliant, 
      nonCompliant: sebiLodrNonCompliant, 
      pending: 0 
    },
    { 
      category: 'Board Approval', 
      compliant: boardApproved, 
      nonCompliant: boardNotApproved, 
      pending: boardPending 
    },
    { 
      category: 'Disclosure', 
      compliant: disclosed, 
      nonCompliant: notDisclosed, 
      pending: pendingDisclosure 
    }
  ];
};

// Calculate KPIs from transactions and balances
export const generateKpiData = (transactions: RPTTransaction[], balanceData: BalanceData[]): KpiData => {
  const totalValue = transactions.reduce((sum, t) => sum + t.value, 0);
  const pendingApprovals = transactions.filter(t => t.approvalStatus === 'pending').length;
  const nonCompliant = transactions.filter(t => !t.section188Compliant || !t.sebiLodrCompliant).length;
  const outstandingReceivables = balanceData.reduce((sum, b) => sum + b.receivables, 0);
  const outstandingPayables = balanceData.reduce((sum, b) => sum + b.payables, 0);
  
  return {
    totalTransactions: transactions.length,
    totalValue,
    pendingApprovals,
    nonCompliant,
    outstandingReceivables,
    outstandingPayables
  };
};

// Safe data generation with fallbacks
const generateSafeData = () => {
  try {
    const generatedTransactions = generateTransactions();
    const generatedMonthlyData = generateMonthlyData();
    const generatedBalanceData = generateBalanceData(generatedTransactions);
    const generatedComplianceData = generateComplianceData(generatedTransactions);
    const generatedKpiData = generateKpiData(generatedTransactions, generatedBalanceData);
    
    return {
      transactions: generatedTransactions,
      monthlyData: generatedMonthlyData,
      balanceData: generatedBalanceData,
      complianceData: generatedComplianceData,
      kpiData: generatedKpiData
    };
  } catch (error) {
    console.error('Error generating data, using fallback data:', error);
    
    // Fallback data in case of generation failure
    const fallbackTransactions: RPTTransaction[] = [
      {
        id: 'RPT0001',
        date: '2024-01-15',
        relatedParty: 'ABC Holdings Ltd',
        relationship: 'Holding Company',
        transactionType: 'Sale',
        category: 'Finished Goods',
        value: 1250000,
        currency: 'INR',
        approvalStatus: 'approved',
        disclosureStatus: 'disclosed',
        section188Compliant: true,
        sebiLodrCompliant: true,
        description: 'Sale of finished goods'
      },
      {
        id: 'RPT0002',
        date: '2024-01-20',
        relatedParty: 'XYZ Technologies Pvt Ltd',
        relationship: 'Subsidiary',
        transactionType: 'Purchase',
        category: 'Raw Materials',
        value: 850000,
        currency: 'INR',
        approvalStatus: 'pending',
        disclosureStatus: 'pending_disclosure',
        section188Compliant: false,
        sebiLodrCompliant: true,
        description: 'Purchase of raw materials'
      }
    ];
    
    const fallbackMonthlyData: MonthlyData[] = [
      { month: 'Jan', sales: 1250000, purchases: 850000, services: 0, loans: 0, total: 2100000 },
      { month: 'Feb', sales: 0, purchases: 0, services: 350000, loans: 500000, total: 850000 }
    ];
    
    const fallbackBalanceData: BalanceData[] = [
      {
        party: 'ABC Holdings Ltd',
        relationship: 'Holding Company',
        receivables: 1250000,
        payables: 0,
        netBalance: 1250000,
        daysOutstanding: 45
      }
    ];
    
    const fallbackComplianceData: ComplianceData[] = [
      { category: 'Section 188', compliant: 1, nonCompliant: 1, pending: 0 },
      { category: 'SEBI LODR 23', compliant: 2, nonCompliant: 0, pending: 0 },
      { category: 'Board Approval', compliant: 1, nonCompliant: 0, pending: 1 },
      { category: 'Disclosure', compliant: 1, nonCompliant: 0, pending: 1 }
    ];
    
    const fallbackKpiData: KpiData = {
      totalTransactions: 2,
      totalValue: 2100000,
      pendingApprovals: 1,
      nonCompliant: 1,
      outstandingReceivables: 1250000,
      outstandingPayables: 0
    };
    
    return {
      transactions: fallbackTransactions,
      monthlyData: fallbackMonthlyData,
      balanceData: fallbackBalanceData,
      complianceData: fallbackComplianceData,
      kpiData: fallbackKpiData
    };
  }
};

// Generate all data
const { 
  transactions: generatedTransactions,
  monthlyData: generatedMonthlyData,
  balanceData: generatedBalanceData,
  complianceData: generatedComplianceData,
  kpiData: generatedKpiData
} = generateSafeData();

// Export the generated data
export const transactions: RPTTransaction[] = generatedTransactions;
export const monthlyData: MonthlyData[] = generatedMonthlyData;
export const balanceData: BalanceData[] = generatedBalanceData;
export const complianceData: ComplianceData[] = generatedComplianceData;
export const kpiData: KpiData = generatedKpiData;

// Additional helper data for realistic scenarios
export const getQuarterlySummary = (): Array<{quarter: string; sales: number; purchases: number; services: number; loans: number; total: number}> => {
  const quarterly = [];
  const months = monthlyData;
  
  for (let i = 0; i < months.length; i += 3) {
    const quarter = months.slice(i, i + 3);
    quarterly.push({
      quarter: `Q${i/3 + 1}`,
      sales: quarter.reduce((sum, m) => sum + m.sales, 0),
      purchases: quarter.reduce((sum, m) => sum + m.purchases, 0),
      services: quarter.reduce((sum, m) => sum + m.services, 0),
      loans: quarter.reduce((sum, m) => sum + m.loans, 0),
      total: quarter.reduce((sum, m) => sum + m.total, 0)
    });
  }
  
  return quarterly;
};

export const getYearlySummary = (): Array<{year: string; sales: number; purchases: number; services: number; loans: number; total: number}> => {
  const total = monthlyData.reduce((acc, month) => ({
    sales: acc.sales + month.sales,
    purchases: acc.purchases + month.purchases,
    services: acc.services + month.services,
    loans: acc.loans + month.loans,
    total: acc.total + month.total
  }), { sales: 0, purchases: 0, services: 0, loans: 0, total: 0 });
  
  return [{
    year: '2024',
    ...total
  }];
};

// High-risk transactions that need attention
export const highRiskTransactions = generatedTransactions.filter(t => 
  !t.section188Compliant || 
  !t.sebiLodrCompliant || 
  t.approvalStatus === 'not_approved' ||
  t.disclosureStatus === 'not_disclosed'
);

// Transactions requiring board approval
export const pendingBoardApproval = generatedTransactions.filter(t => 
  t.approvalStatus === 'pending'
);

// Large value transactions (> ₹5M)
export const largeValueTransactions = generatedTransactions.filter(t => 
  t.value > 5000000
);

// Export summary statistics
export const summaryStats = {
  totalParties: new Set(generatedTransactions.map(t => t.relatedParty)).size,
  avgTransactionValue: Math.round(generatedKpiData.totalValue / generatedKpiData.totalTransactions),
  complianceRate: Math.round((generatedTransactions.filter(t => t.section188Compliant && t.sebiLodrCompliant).length / generatedKpiData.totalTransactions) * 100),
  disclosureRate: Math.round((generatedTransactions.filter(t => t.disclosureStatus === 'disclosed').length / generatedKpiData.totalTransactions) * 100),
  approvalRate: Math.round((generatedTransactions.filter(t => t.approvalStatus === 'approved').length / generatedKpiData.totalTransactions) * 100)
};