export const mockData = {
  receivables: {
    summary: {
      days30: 850000,
      days60: 450000,
      days90: 250000,
      days120: 150000,
      days180: 80000,
      days360: 40000,
      total: 3280000
    },
    customers: [
      { id: '1', name: 'ABC Corp', totalReceivables: 450000, ageing: { days30: 200000, days60: 150000, days90: 75000, days120: 25000, days180: 0, days360: 0, total: 450000 }, lastInvoiceDate: '2024-01-15' },
      { id: '2', name: 'XYZ Ltd', totalReceivables: 380000, ageing: { days30: 180000, days60: 120000, days90: 50000, days120: 30000, days180: 0, days360: 0, total: 380000 }, lastInvoiceDate: '2024-01-10' },
    ],
    overduePercentage: 32.5,
    averageCollectionPeriod: 45
  },
  payables: {
    summary: {
      days30: 600000,
      days60: 300000,
      days90: 150000,
      days120: 80000,
      days180: 50000,
      days360: 20000,
      total: 2380000
    },
    vendors: [
      { id: '1', name: 'Raw Material Suppliers', totalPayables: 680000, ageing: { days30: 300000, days60: 250000, days90: 100000, days120: 30000, days180: 0, days360: 0, total: 680000 }, lastPaymentDate: '2024-01-12' },
      { id: '2', name: 'Logistics Partners', totalPayables: 420000, ageing: { days30: 200000, days60: 150000, days90: 50000, days120: 20000, days180: 0, days360: 0, total: 420000 }, lastPaymentDate: '2024-01-08' },
    ],
    overduePercentage: 18.7,
    averagePaymentPeriod: 35
  },
  inventory: {
    summary: {
      days30: 1450000,
      days60: 800000,
      days90: 350000,
      days120: 80000,
      days180: 15000,
      days360: 5000,
      total: 2700000
    },
    rm: [
      { id: '1', type: 'RM', description: 'Steel Coils', quantity: 100, value: 500000, ageingDays: 25, warehouse: 'Main' },
      { id: '2', type: 'RM', description: 'Copper Wires', quantity: 500, value: 250000, ageingDays: 45, warehouse: 'Main' },
    ],
    wip: [
      { id: '3', type: 'WIP', description: 'Transformer Assembly', quantity: 50, value: 750000, ageingDays: 15, warehouse: 'Assembly' },
    ],
    fg: [
      { id: '4', type: 'FG', description: 'Finished Transformers', quantity: 30, value: 1200000, ageingDays: 60, warehouse: 'Finished Goods' },
    ],
    ageingAnalysis: {
      days30: 1450000,
      days60: 800000,
      days90: 350000,
      days120: 80000,
      days180: 15000,
      days360: 5000
    }
  },
  liabilities: {
    summary: {
      days30: 5000000,
      days60: 2000000,
      days90: 500000,
      days120: 300000,
      days180: 150000,
      days360: 50000,
      total: 8000000
    },
    loans: [
      { id: '1', type: 'PCFC', amount: 5000000, dueDate: '2024-12-31', interestRate: 8.5, overdueDays: 0 },
      { id: '2', type: 'FBD', amount: 3000000, dueDate: '2024-06-30', interestRate: 9.2, overdueDays: 0 },
    ],
    totalLoans: 8000000,
    overdueLoans: 0
  },
  advances: {
    summary: {
      days30: 1000000,
      days60: 300000,
      days90: 150000,
      days120: 40000,
      days180: 8000,
      days360: 2000,
      total: 1500000
    },
    customerAdvances: [
      { id: '1', type: 'customer', partyName: 'Power Grid Corp', amount: 1000000, advanceDate: '2024-01-02', utilization: 600000, balance: 400000 },
    ],
    vendorAdvances: [
      { id: '2', type: 'vendor', partyName: 'Mining Corp', amount: 500000, advanceDate: '2024-01-05', utilization: 300000, balance: 200000 },
    ],
    totalAdvances: 1500000
  },
  workingCapital: {
    currentAssets: 8560000,
    currentLiabilities: 4760000,
    workingCapital: 3800000,
    workingCapitalRatio: 1.8
  }
};