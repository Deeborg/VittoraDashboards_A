import type { CompanyDataType } from '../types/index';

export const CompanyData: CompanyDataType = {

    companyInfo: {
        name:              'ACME Manufacturing Corp',
        ticker:            'ACME',
        industry:          'Industrial Manufacturing',
        fiscalYearEnd:     'December 31',
        currency:          'USD',
        sharesOutstanding: 50_000_000,
    },

    financialSummary: [
        { year:2024, quarter:'Q4', period:'2024-Q4', netSales:156000000, otherIncome:3200000, totalRevenue:159200000, cogs:89000000, grossProfit:70200000, employeeCost:28000000, otherExpenses:15000000, depreciation:5200000, ebitda:27200000, ebit:22000000, interest:2500000, pbt:19500000, tax:4875000, pat:14625000, eps:0.29 },
        { year:2024, quarter:'Q3', period:'2024-Q3', netSales:148000000, otherIncome:2800000, totalRevenue:150800000, cogs:84000000, grossProfit:66800000, employeeCost:27000000, otherExpenses:14500000, depreciation:5000000, ebitda:25300000, ebit:20300000, interest:2400000, pbt:17900000, tax:4475000, pat:13425000, eps:0.27 },
        { year:2024, quarter:'Q2', period:'2024-Q2', netSales:142000000, otherIncome:2500000, totalRevenue:144500000, cogs:80000000, grossProfit:64500000, employeeCost:26500000, otherExpenses:14000000, depreciation:4800000, ebitda:24000000, ebit:19200000, interest:2300000, pbt:16900000, tax:4225000, pat:12675000, eps:0.25 },
        { year:2024, quarter:'Q1', period:'2024-Q1', netSales:138000000, otherIncome:2400000, totalRevenue:140400000, cogs:78000000, grossProfit:62400000, employeeCost:26000000, otherExpenses:13500000, depreciation:4600000, ebitda:22900000, ebit:18300000, interest:2200000, pbt:16100000, tax:4025000, pat:12075000, eps:0.24 },
        { year:2023, quarter:'Q4', period:'2023-Q4', netSales:145000000, otherIncome:2900000, totalRevenue:147900000, cogs:83000000, grossProfit:64900000, employeeCost:25500000, otherExpenses:14200000, depreciation:4900000, ebitda:25200000, ebit:20300000, interest:2100000, pbt:18200000, tax:4550000, pat:13650000, eps:0.27 },
        { year:2023, quarter:'Q3', period:'2023-Q3', netSales:138000000, otherIncome:2600000, totalRevenue:140600000, cogs:79000000, grossProfit:61600000, employeeCost:24800000, otherExpenses:13800000, depreciation:4700000, ebitda:23000000, ebit:18300000, interest:2000000, pbt:16300000, tax:4075000, pat:12225000, eps:0.24 },
        { year:2023, quarter:'Q2', period:'2023-Q2', netSales:132000000, otherIncome:2400000, totalRevenue:134400000, cogs:76000000, grossProfit:58400000, employeeCost:24200000, otherExpenses:13200000, depreciation:4500000, ebitda:21000000, ebit:16500000, interest:1900000, pbt:14600000, tax:3650000, pat:10950000, eps:0.22 },
        { year:2023, quarter:'Q1', period:'2023-Q1', netSales:128000000, otherIncome:2200000, totalRevenue:130200000, cogs:74000000, grossProfit:56200000, employeeCost:23800000, otherExpenses:12800000, depreciation:4400000, ebitda:19600000, ebit:15200000, interest:1800000, pbt:13400000, tax:3350000, pat:10050000, eps:0.20 },
        { year:2022, quarter:'Q4', period:'2022-Q4', netSales:135000000, otherIncome:2500000, totalRevenue:137500000, cogs:78000000, grossProfit:59500000, employeeCost:23500000, otherExpenses:13500000, depreciation:4600000, ebitda:22500000, ebit:17900000, interest:1700000, pbt:16200000, tax:4050000, pat:12150000, eps:0.24 },
        { year:2022, quarter:'Q3', period:'2022-Q3', netSales:128000000, otherIncome:2300000, totalRevenue:130300000, cogs:74000000, grossProfit:56300000, employeeCost:22800000, otherExpenses:13000000, depreciation:4400000, ebitda:20500000, ebit:16100000, interest:1600000, pbt:14500000, tax:3625000, pat:10875000, eps:0.22 },
        { year:2022, quarter:'Q2', period:'2022-Q2', netSales:122000000, otherIncome:2100000, totalRevenue:124100000, cogs:71000000, grossProfit:53100000, employeeCost:22200000, otherExpenses:12500000, depreciation:4200000, ebitda:18400000, ebit:14200000, interest:1500000, pbt:12700000, tax:3175000, pat:9525000,  eps:0.19 },
        { year:2022, quarter:'Q1', period:'2022-Q1', netSales:118000000, otherIncome:1900000, totalRevenue:119900000, cogs:68000000, grossProfit:51900000, employeeCost:21800000, otherExpenses:12000000, depreciation:4000000, ebitda:18100000, ebit:14100000, interest:1400000, pbt:12700000, tax:3175000, pat:9525000,  eps:0.19 },
    ],

    balanceSheet: [
        { year:2024, quarter:'Q4', period:'2024-Q4', equity:285000000, totalDebt:120000000, longTermDebt:95000000,  shortTermDebt:25000000, cashAndBank:42000000, investments:18000000, netDebt:78000000,  currentAssets:125000000, currentLiabilities:68000000, totalAssets:485000000 },
        { year:2024, quarter:'Q3', period:'2024-Q3', equity:272000000, totalDebt:125000000, longTermDebt:98000000,  shortTermDebt:27000000, cashAndBank:38000000, investments:16000000, netDebt:87000000,  currentAssets:118000000, currentLiabilities:65000000, totalAssets:472000000 },
        { year:2024, quarter:'Q2', period:'2024-Q2', equity:260000000, totalDebt:128000000, longTermDebt:100000000, shortTermDebt:28000000, cashAndBank:35000000, investments:15000000, netDebt:93000000,  currentAssets:112000000, currentLiabilities:62000000, totalAssets:460000000 },
        { year:2024, quarter:'Q1', period:'2024-Q1', equity:248000000, totalDebt:130000000, longTermDebt:102000000, shortTermDebt:28000000, cashAndBank:32000000, investments:14000000, netDebt:98000000,  currentAssets:108000000, currentLiabilities:60000000, totalAssets:450000000 },
        { year:2023, quarter:'Q4', period:'2023-Q4', equity:238000000, totalDebt:132000000, longTermDebt:104000000, shortTermDebt:28000000, cashAndBank:30000000, investments:13000000, netDebt:102000000, currentAssets:105000000, currentLiabilities:58000000, totalAssets:445000000 },
        { year:2022, quarter:'Q4', period:'2022-Q4', equity:215000000, totalDebt:135000000, longTermDebt:108000000, shortTermDebt:27000000, cashAndBank:28000000, investments:12000000, netDebt:107000000, currentAssets:98000000,  currentLiabilities:55000000, totalAssets:425000000 },
    ],

    operationalMetrics: [
        { year:2024, quarter:'Q4', period:'2024-Q4', capacityUtilization:87, salesQuantity:45600, salesValue:156000000, employeeCount:3420, revenuePerEmployee:45614 },
        { year:2024, quarter:'Q3', period:'2024-Q3', capacityUtilization:84, salesQuantity:43200, salesValue:148000000, employeeCount:3380, revenuePerEmployee:43787 },
        { year:2024, quarter:'Q2', period:'2024-Q2', capacityUtilization:82, salesQuantity:41500, salesValue:142000000, employeeCount:3350, revenuePerEmployee:42388 },
        { year:2024, quarter:'Q1', period:'2024-Q1', capacityUtilization:80, salesQuantity:40200, salesValue:138000000, employeeCount:3320, revenuePerEmployee:41566 },
        { year:2023, quarter:'Q4', period:'2023-Q4', capacityUtilization:83, salesQuantity:42300, salesValue:145000000, employeeCount:3280, revenuePerEmployee:44207 },
        { year:2022, quarter:'Q4', period:'2022-Q4', capacityUtilization:78, salesQuantity:39400, salesValue:135000000, employeeCount:3180, revenuePerEmployee:42453 },
    ],

    products: [
        { id:'P001', name:'Industrial Automation Systems', category:'Equipment', launchDate:'2019-Q2', status:'Mature', revenueContribution:0.42 },
        { id:'P002', name:'Smart Manufacturing Solutions',  category:'Software',  launchDate:'2021-Q3', status:'Growth', revenueContribution:0.28 },
        { id:'P003', name:'Precision Tooling Equipment',    category:'Equipment', launchDate:'2018-Q1', status:'Mature', revenueContribution:0.18 },
        { id:'P004', name:'AI-Powered Quality Control',     category:'Software',  launchDate:'2024-Q1', status:'New',    revenueContribution:0.08 },
        { id:'P005', name:'Maintenance & Support Services', category:'Services',  launchDate:'2017-Q3', status:'Mature', revenueContribution:0.04 },
    ],

    salesByProduct: [
        { productId:'P001', productName:'Industrial Automation Systems', quantity:19200, revenue:65520000, percentOfTotal:42 },
        { productId:'P002', productName:'Smart Manufacturing Solutions',  quantity:14800, revenue:43680000, percentOfTotal:28 },
        { productId:'P003', productName:'Precision Tooling Equipment',    quantity:8200,  revenue:28080000, percentOfTotal:18 },
        { productId:'P004', productName:'AI-Powered Quality Control',     quantity:2800,  revenue:12480000, percentOfTotal:8  },
        { productId:'P005', productName:'Maintenance & Support Services', quantity:600,   revenue:6240000,  percentOfTotal:4  },
    ],

    salesByIndustry: [
        { industry:'Automotive',          revenue:54600000, percentOfTotal:35, clientCount:142 },
        { industry:'Aerospace & Defense', revenue:40560000, percentOfTotal:26, clientCount:87  },
        { industry:'Electronics',         revenue:31200000, percentOfTotal:20, clientCount:156 },
        { industry:'Heavy Machinery',     revenue:18720000, percentOfTotal:12, clientCount:68  },
        { industry:'Other',               revenue:10920000, percentOfTotal:7,  clientCount:93  },
    ],

    salesByGeography: [
        { region:'Domestic', revenue:108680000, percentOfTotal:69.65 },
        {
            region:'Export', revenue:47320000, percentOfTotal:30.35,
            breakdown:[
                { country:'Germany',        revenue:14196000 },
                { country:'Japan',          revenue:11829000 },
                { country:'United Kingdom', revenue:9464000  },
                { country:'South Korea',    revenue:7098000  },
                { country:'Other',          revenue:4733000  },
            ],
        },
    ],

    clients: [
        { id:'C001', name:'AutoTech Manufacturing Inc.',  industry:'Automotive',          relationship:'Strategic',   since:'2018', annualRevenue:18500000, status:'Active' },
        { id:'C002', name:'Aero Dynamics Corp',           industry:'Aerospace & Defense', relationship:'Key Account', since:'2019', annualRevenue:15200000, status:'Active' },
        { id:'C003', name:'Precision Electronics Ltd',   industry:'Electronics',         relationship:'Key Account', since:'2020', annualRevenue:12800000, status:'Active' },
        { id:'C004', name:'Global Heavy Industries',      industry:'Heavy Machinery',     relationship:'Standard',    since:'2021', annualRevenue:9200000,  status:'Active' },
        { id:'C005', name:'TechForward Systems',          industry:'Electronics',         relationship:'New',         since:'2024', annualRevenue:3400000,  status:'Active', isNew:true },
        { id:'C006', name:'Continental Auto Group',       industry:'Automotive',          relationship:'Strategic',   since:'2017', annualRevenue:16900000, status:'Active' },
        { id:'C007', name:'Defense Tech Solutions',       industry:'Aerospace & Defense', relationship:'Key Account', since:'2022', annualRevenue:11500000, status:'Active' },
        { id:'C008', name:'Smart Factory Innovations',   industry:'Electronics',         relationship:'New',         since:'2024', annualRevenue:2800000,  status:'Active', isNew:true },
    ],

    newClients2024: [
        { id:'C005', name:'TechForward Systems',        industry:'Electronics',         joinedQuarter:'2024-Q1', initialContract:3400000 },
        { id:'C008', name:'Smart Factory Innovations',  industry:'Electronics',         joinedQuarter:'2024-Q2', initialContract:2800000 },
        { id:'C009', name:'NextGen Automotive',         industry:'Automotive',          joinedQuarter:'2024-Q3', initialContract:4200000 },
        { id:'C010', name:'Quantum Aerospace',          industry:'Aerospace & Defense', joinedQuarter:'2024-Q4', initialContract:5600000 },
    ],
};