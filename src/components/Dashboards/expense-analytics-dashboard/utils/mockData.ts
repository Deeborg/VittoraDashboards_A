import { 
  ExpenseCategory, 
  ExpenseRecord, 
  TrendData, 
  ComparisonData, 
  DrillDownData, 
  DocumentDetail,
  BudgetData,
  CategoryData,
  EntityComparisonData 
} from '../types';

export const mockCategories: ExpenseCategory[] = [
  {
    id: '1',
    name: 'Raw Material Consumption',
    value: 18500000,
    budget: 17000000,
    variance: 8.82,
    color: '#059669',
    icon: 'Settings',
  },
  {
    id: '2',
    name: 'Employee Expenses',
    value: 12500000,
    budget: 12000000,
    variance: 4.17,
    color: '#d97706',
    icon: 'Users',
  },
  {
    id: '3',
    name: 'Finance Costs',
    value: 3200000,
    budget: 3500000,
    variance: -8.57,
    color: '#dc2626',
    icon: 'Percent',
  },
  {
    id: '4',
    name: 'Other Operating Expenses',
    value: 8500000,
    budget: 8000000,
    variance: 6.25,
    color: '#7c3aed',
    icon: 'AttachMoney',
  },
  {
    id: '5',
    name: 'Depreciation & Amortization',
    value: 4500000,
    budget: 4500000,
    variance: 0,
    color: '#0ea5e9',
    icon: 'TrendingDown',
  },
];

export const mockTrendData: TrendData[] = [
  { month: 'Jan', period: 'Jan', total: 42000000, rawMaterial: 17500000, employee: 11500000, finance: 3000000, other: 7500000, depreciation: 4500000, budget: 40000000 },
  { month: 'Feb', period: 'Feb', total: 43500000, rawMaterial: 18000000, employee: 12000000, finance: 3100000, other: 8000000, depreciation: 4500000, budget: 41000000 },
  { month: 'Mar', period: 'Mar', total: 45000000, rawMaterial: 18500000, employee: 12500000, finance: 3200000, other: 8500000, depreciation: 4500000, budget: 42000000 },
  { month: 'Apr', period: 'Apr', total: 46500000, rawMaterial: 19000000, employee: 13000000, finance: 3300000, other: 9000000, depreciation: 4500000, budget: 43000000 },
  { month: 'May', period: 'May', total: 45500000, rawMaterial: 18700000, employee: 12800000, finance: 3250000, other: 8700000, depreciation: 4500000, budget: 44000000 },
  { month: 'Jun', period: 'Jun', total: 47200000, rawMaterial: 19500000, employee: 13000000, finance: 3350000, other: 8800000, depreciation: 4500000, budget: 45000000 },
  { month: 'Jul', period: 'Jul', total: 48000000, rawMaterial: 20000000, employee: 13500000, finance: 3400000, other: 9000000, depreciation: 4500000, budget: 46000000 },
  { month: 'Aug', period: 'Aug', total: 49000000, rawMaterial: 20500000, employee: 14000000, finance: 3500000, other: 9200000, depreciation: 4500000, budget: 47000000 },
  { month: 'Sep', period: 'Sep', total: 48500000, rawMaterial: 20200000, employee: 13800000, finance: 3450000, other: 9100000, depreciation: 4500000, budget: 48000000 },
  { month: 'Oct', period: 'Oct', total: 49500000, rawMaterial: 20800000, employee: 14200000, finance: 3550000, other: 9300000, depreciation: 4500000, budget: 49000000 },
  { month: 'Nov', period: 'Nov', total: 50000000, rawMaterial: 21000000, employee: 14500000, finance: 3600000, other: 9500000, depreciation: 4500000, budget: 50000000 },
  { month: 'Dec', period: 'Dec', total: 52000000, rawMaterial: 22000000, employee: 15000000, finance: 3800000, other: 10000000, depreciation: 4500000, budget: 51000000 },
];

export const mockExpenseData: ExpenseRecord[] = Array.from({ length: 50 }, (_, i) => {
  const categories = ['Raw Material Consumption', 'Employee Expenses', 'Finance Costs', 'Other Operating Expenses', 'Depreciation & Amortization'];
  const subCategories: Record<string, string[]> = {
    'Raw Material Consumption': ['Steel', 'Plastic', 'Chemicals', 'Packaging'],
    'Employee Expenses': ['Salaries', 'Benefits', 'Training', 'Travel'],
    'Finance Costs': ['Interest', 'Bank Charges', 'Loan Fees'],
    'Other Operating Expenses': ['Utilities', 'Maintenance', 'Marketing', 'Legal'],
    'Depreciation & Amortization': ['Equipment', 'Vehicles', 'Software', 'Building'],
  };
  const factories = ['Factory A', 'Factory B', 'Factory C', 'Factory D', 'Office'];
  const entities = ['HQ', 'Factory A', 'Factory B', 'Warehouse X', 'Office Y'];
  const statuses: Array<'Approved' | 'Pending' | 'Rejected'> = ['Approved', 'Pending', 'Rejected'];
  
  const category = categories[i % categories.length];
  const subCategory = subCategories[category]?.[i % (subCategories[category]?.length || 1)] || 'General';
  
  return {
    id: `EXP-${1000 + i}`,
    date: new Date(2024, i % 12, (i % 28) + 1),
    category,
    subCategory,
    amount: Math.floor(Math.random() * 1000000) + 50000,
    budget: Math.floor(Math.random() * 900000) + 100000,
    variance: (Math.random() * 20) - 10,
    entity: entities[i % entities.length],
    factory: factories[i % factories.length],
    unit: `Unit ${String.fromCharCode(65 + (i % 5))}`,
    costCenter: `CC-${1000 + (i % 20)}`,
    glAccount: `GL-${5000 + (i % 50)}`,
    documentNo: `DOC-${2000 + i}`,
    poNumber: i % 3 === 0 ? `PO-${3000 + i}` : undefined,
    grnNumber: i % 3 === 0 ? `GRN-${4000 + i}` : undefined,
    invoiceNumber: i % 3 === 0 ? `INV-${5000 + i}` : undefined,
    description: `${subCategory} expenses for ${category.toLowerCase()}`,
    status: statuses[i % statuses.length],
  };
});

export const mockComparisonData: ComparisonData[] = [
  { factory: 'Factory A', unit: 'Production A', totalExpense: 18500000, rawMaterial: 2000000, employee: 12000000, finance: 1500000, other: 2500000, depreciation: 500000, budget: 18000000, variance: 2.78 },
  { factory: 'Factory B', unit: 'Production B', totalExpense: 28500000, rawMaterial: 15000000, employee: 8000000, finance: 1000000, other: 4000000, depreciation: 2000000, budget: 27000000, variance: 5.56 },
  { factory: 'Factory C', unit: 'Production C', totalExpense: 19500000, rawMaterial: 8000000, employee: 7000000, finance: 800000, other: 3000000, depreciation: 1000000, budget: 20000000, variance: -2.5 },
  { factory: 'Factory D', unit: 'Production D', totalExpense: 8500000, rawMaterial: 1000000, employee: 4000000, finance: 500000, other: 2500000, depreciation: 500000, budget: 9000000, variance: -5.56 },
  { factory: 'Office', unit: 'Sales', totalExpense: 12500000, rawMaterial: 500000, employee: 9000000, finance: 500000, other: 2000000, depreciation: 500000, budget: 12000000, variance: 4.17 },
];

export const mockDrillDownData: DrillDownData[] = [
  {
    level: 'costCenter',
    costCenter: 'CC-1001',
    amount: 12500000,
    budget: 12000000,
    variance: 4.17,
    children: [
      {
        level: 'glAccount',
        costCenter: 'CC-1001',
        glAccount: 'GL-5001',
        glDescription: 'Raw Material Purchase',
        amount: 8000000,
        budget: 7500000,
        variance: 6.67,
        children: [
          {
            level: 'document',
            documentNo: 'DOC-2001',
            amount: 2000000,
            budget: 1800000,
            variance: 11.11,
          },
          {
            level: 'document',
            documentNo: 'DOC-2002',
            amount: 3000000,
            budget: 2900000,
            variance: 3.45,
          },
        ],
      },
      {
        level: 'glAccount',
        costCenter: 'CC-1001',
        glAccount: 'GL-5002',
        glDescription: 'Employee Salaries',
        amount: 4500000,
        budget: 4500000,
        variance: 0,
      },
    ],
  },
  {
    level: 'costCenter',
    costCenter: 'CC-1002',
    amount: 8500000,
    budget: 9000000,
    variance: -5.56,
    children: [
      {
        level: 'glAccount',
        costCenter: 'CC-1002',
        glAccount: 'GL-5003',
        glDescription: 'Utilities',
        amount: 2500000,
        budget: 3000000,
        variance: -16.67,
        children: [
          {
            level: 'document',
            documentNo: 'DOC-2003',
            amount: 1500000,
            budget: 1800000,
            variance: -16.67,
          },
        ],
      },
    ],
  },
];

export const mockDocumentDetails: DocumentDetail[] = [
  {
    id: '1',
    documentNo: 'DOC-2001',
    date: new Date('2024-01-15'),
    amount: 2000000,
    poNumber: 'PO-3001',
    grnNumber: 'GRN-4001',
    invoiceNumber: 'INV-5001',
    vendor: 'Steel Suppliers Ltd',
    status: 'Posted',
    category: 'Raw Material Consumption',
    glAccount: 'GL-5001',
    costCenter: 'CC-1001',
    description: 'Steel purchase for Q1 production',
    documentChain: {
      poNumber: 'PO-3001',
      grnNumber: 'GRN-4001',
      invoiceNumber: 'INV-5001',
      status: 'Posted',
      linkedDocuments: ['PO-3001', 'GRN-4001', 'INV-5001']
    }
  },
  {
    id: '2',
    documentNo: 'DOC-2002',
    date: new Date('2024-01-20'),
    amount: 3000000,
    poNumber: 'PO-3002',
    grnNumber: 'GRN-4002',
    invoiceNumber: 'INV-5002',
    vendor: 'Chemical Corp',
    status: 'Pending',
    category: 'Raw Material Consumption',
    glAccount: 'GL-5001',
    costCenter: 'CC-1001',
    description: 'Chemical supplies',
    documentChain: {
      poNumber: 'PO-3002',
      grnNumber: 'GRN-4002',
      invoiceNumber: 'INV-5002',
      status: 'Pending',
      linkedDocuments: ['PO-3002', 'GRN-4002', 'INV-5002']
    }
  },
  {
    id: '3',
    documentNo: 'DOC-2003',
    date: new Date('2024-01-25'),
    amount: 1500000,
    poNumber: 'PO-3003',
    grnNumber: 'GRN-4003',
    invoiceNumber: 'INV-5003',
    vendor: 'Packaging Solutions',
    status: 'Posted',
    category: 'Raw Material Consumption',
    glAccount: 'GL-5001',
    costCenter: 'CC-1002',
    description: 'Packaging materials',
    documentChain: {
      poNumber: 'PO-3003',
      grnNumber: 'GRN-4003',
      invoiceNumber: 'INV-5003',
      status: 'Posted',
      linkedDocuments: ['PO-3003', 'GRN-4003', 'INV-5003']
    }
  },
];

// Chart data mocks
export const mockBudgetData: BudgetData[] = [
  { name: 'Factory A', actual: 12000000, budget: 10000000, variance: 20, color: '#2563eb' },
  { name: 'Factory B', actual: 8500000, budget: 9000000, variance: -5.6, color: '#059669' },
  { name: 'Factory C', actual: 6500000, budget: 7000000, variance: -7.1, color: '#d97706' },
  { name: 'Factory D', actual: 9500000, budget: 8500000, variance: 11.8, color: '#7c3aed' },
  { name: 'Office', actual: 4200000, budget: 4000000, variance: 5, color: '#0ea5e9' },
];

export const mockCategoryData: CategoryData[] = [
  { name: 'Raw Material', value: 15000000, color: '#2563eb', budget: 14000000, variance: 7.1 },
  { name: 'Employee', value: 12000000, color: '#059669', budget: 12500000, variance: -4 },
  { name: 'Finance', value: 4000000, color: '#d97706', budget: 4500000, variance: -11.1 },
  { name: 'Other', value: 2000000, color: '#7c3aed', budget: 1800000, variance: 11.1 },
  { name: 'Depreciation', value: 1200000, color: '#0ea5e9', budget: 1000000, variance: 20 },
];

export const mockEntityComparisonData: EntityComparisonData[] = [
  { 
    entity: 'Factory A', 
    efficiency: 85, 
    costControl: 78, 
    budgetAdherence: 65, 
    trend: 72, 
    variance: 20,
    color: '#2563eb',
    fill: 'rgba(37, 99, 235, 0.2)'
  },
  { 
    entity: 'Factory B', 
    efficiency: 72, 
    costControl: 88, 
    budgetAdherence: 92, 
    trend: 80, 
    variance: -5.6,
    color: '#059669',
    fill: 'rgba(5, 150, 105, 0.2)'
  },
  { 
    entity: 'Factory C', 
    efficiency: 90, 
    costControl: 75, 
    budgetAdherence: 85, 
    trend: 65, 
    variance: -7.1,
    color: '#d97706',
    fill: 'rgba(217, 119, 6, 0.2)'
  },
  { 
    entity: 'Factory D', 
    efficiency: 95, 
    costControl: 85, 
    budgetAdherence: 75, 
    trend: 75, 
    variance: 11.8,
    color: '#7c3aed',
    fill: 'rgba(124, 58, 237, 0.2)'
  },
  { 
    entity: 'Office', 
    efficiency: 78, 
    costControl: 82, 
    budgetAdherence: 88, 
    trend: 85, 
    variance: 5,
    color: '#0ea5e9',
    fill: 'rgba(14, 165, 233, 0.2)'
  },
];