// Synthetic Exception Dataset — 300 records for enterprise-scale filtering

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ExceptionCategory =
    | 'Compliance Violation'
    | 'Negative Stock'
    | 'GR/IR Mismatch'
    | 'Forex Hedge Gap'
    | 'Short-Term Debt'
    | 'Duplicate Payment'
    | 'Budget Overrun'
    | 'Unauthorized Transaction';

export type Department =
    | 'Finance'
    | 'Procurement'
    | 'Treasury'
    | 'Inventory'
    | 'Compliance'
    | 'Operations'
    | 'Risk Management';

export type AgeingBucket = '0-30 days' | '31-60 days' | '61-90 days' | '90+ days';
export type ActionStatus = 'Open' | 'In Progress' | 'Resolved' | 'Escalated';

export interface ExceptionRecord {
    id: number;
    category: ExceptionCategory;
    department: Department;
    severity: Severity;
    ageingBucket: AgeingBucket;
    owner: string;
    status: ActionStatus;
    amount: number;
    date: string; // YYYY-MM-DD
    complianceScore: number; // 0-100
    riskType: 'Financial' | 'Inventory' | 'Procurement' | 'Compliance';
    description: string;
}

const categories: ExceptionCategory[] = [
    'Compliance Violation', 'Negative Stock', 'GR/IR Mismatch',
    'Forex Hedge Gap', 'Short-Term Debt', 'Duplicate Payment',
    'Budget Overrun', 'Unauthorized Transaction',
];

const departments: Department[] = [
    'Finance', 'Procurement', 'Treasury', 'Inventory',
    'Compliance', 'Operations', 'Risk Management',
];

const ageingBuckets: AgeingBucket[] = ['0-30 days', '31-60 days', '61-90 days', '90+ days'];
const statuses: ActionStatus[] = ['Open', 'In Progress', 'Resolved', 'Escalated'];

const owners = [
    'Sarah Chen', 'Michael Torres', 'Priya Sharma', 'James Wilson',
    'Elena Volkov', 'David Park', 'Amanda Foster', 'Robert Kim',
    'Lisa Chang', 'Thomas Mueller', 'Nina Patel', 'Carlos Rivera',
];

const riskTypeMap: Record<ExceptionCategory, ExceptionRecord['riskType']> = {
    'Compliance Violation': 'Compliance',
    'Negative Stock': 'Inventory',
    'GR/IR Mismatch': 'Procurement',
    'Forex Hedge Gap': 'Financial',
    'Short-Term Debt': 'Financial',
    'Duplicate Payment': 'Financial',
    'Budget Overrun': 'Financial',
    'Unauthorized Transaction': 'Compliance',
};

const descriptions: Record<ExceptionCategory, string[]> = {
    'Compliance Violation': [
        'Missing SOX documentation for Q4 transactions',
        'KYC verification expired for vendor account',
        'Regulatory filing deadline breach detected',
        'Internal audit control failure reported',
    ],
    'Negative Stock': [
        'Warehouse WH-04 showing negative on-hand inventory',
        'Raw material stock count discrepancy identified',
        'Finished goods negative balance after adjustment',
        'Transit stock reconciliation mismatch',
    ],
    'GR/IR Mismatch': [
        'Goods receipt without invoice for PO-2847',
        'Invoice received without goods confirmation',
        'Quantity variance exceeds tolerance threshold',
        'Price discrepancy on three-way match',
    ],
    'Forex Hedge Gap': [
        'USD/EUR hedge coverage below 80% threshold',
        'Unhedged JPY exposure exceeding risk limit',
        'Forward contract maturity gap identified',
        'Cross-currency swap ineffectiveness detected',
    ],
    'Short-Term Debt': [
        'Commercial paper maturity within 30 days',
        'Revolving credit facility renewal pending',
        'Short-term borrowing limit approaching cap',
        'Debt covenant ratio near breach threshold',
    ],
    'Duplicate Payment': [
        'Potential duplicate invoice payment detected',
        'Same amount credited to vendor twice',
        'Duplicate remittance advice generated',
        'Payment batch contains duplicate entries',
    ],
    'Budget Overrun': [
        'Department spending exceeds quarterly allocation',
        'Capital expenditure over approved budget',
        'Travel expense category 40% over limit',
        'IT infrastructure costs exceeding forecast',
    ],
    'Unauthorized Transaction': [
        'Transaction processed without required approval',
        'Wire transfer initiated outside authority matrix',
        'Purchase order created above delegation limit',
        'Manual journal entry without dual authorization',
    ],
};

// Deterministic pseudo-random number generator (seeded)
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function generateRecords(): ExceptionRecord[] {
    const rand = seededRandom(42);
    const records: ExceptionRecord[] = [];

    for (let i = 1; i <= 300; i++) {
        const category = categories[Math.floor(rand() * categories.length)];
        const severity: Severity = (['low', 'medium', 'high', 'critical'] as Severity[])[
            Math.floor(rand() * 4)
        ];
        const dept = departments[Math.floor(rand() * departments.length)];
        const ageing = ageingBuckets[Math.floor(rand() * ageingBuckets.length)];
        const status = statuses[Math.floor(rand() * statuses.length)];
        const owner = owners[Math.floor(rand() * owners.length)];
        const descs = descriptions[category];
        const desc = descs[Math.floor(rand() * descs.length)];

        // Generate dates over the past 12 months
        const monthOffset = Math.floor(rand() * 12);
        const day = Math.floor(rand() * 28) + 1;
        const date = new Date(2025, 1 - monthOffset, day);
        const dateStr = date.toISOString().split('T')[0];

        const amount = Math.round((rand() * 500000 + 5000) * 100) / 100;
        const complianceScore = Math.round(rand() * 100);

        records.push({
            id: i,
            category,
            department: dept,
            severity,
            ageingBucket: ageing,
            owner,
            status,
            amount,
            date: dateStr,
            complianceScore,
            riskType: riskTypeMap[category],
            description: desc,
        });
    }

    return records;
}

export const mockExceptions: ExceptionRecord[] = generateRecords();
