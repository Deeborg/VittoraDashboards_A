import { mockExceptions } from '../data/mockExceptions';
import type { ExceptionRecord, Severity, ExceptionCategory, Department, AgeingBucket } from '../data/mockExceptions';

export interface FilterState {
    dateRange: { start: string; end: string };
    department: string;
    category: string;
}

export function getFilteredData(filters: FilterState): ExceptionRecord[] {
    return mockExceptions.filter((r) => {
        if (filters.department && filters.department !== 'All' && r.department !== filters.department) return false;
        if (filters.category && filters.category !== 'All' && r.category !== filters.category) return false;
        if (filters.dateRange.start && r.date < filters.dateRange.start) return false;
        if (filters.dateRange.end && r.date > filters.dateRange.end) return false;
        return true;
    });
}

export interface KpiData {
    label: string;
    value: number;
    severity: Severity;
    change: number; // percentage change
    description: string;
}

export function getCriticalKpis(data: ExceptionRecord[]): KpiData[] {
    const complianceAlerts = data.filter(r => r.category === 'Compliance Violation' && r.severity === 'critical').length;
    const negativeStock = data.filter(r => r.category === 'Negative Stock' && (r.severity === 'critical' || r.severity === 'high')).length;
    const grIrPending = data.filter(r => r.category === 'GR/IR Mismatch' && r.status !== 'Resolved').length;
    const forexMismatch = data.filter(r => r.category === 'Forex Hedge Gap').length;
    const debtMaturity = data.filter(r => r.category === 'Short-Term Debt' && r.ageingBucket === '0-30 days').length;

    const kpis: KpiData[] = [
        {
            label: 'Compliance Alerts',
            value: complianceAlerts,
            severity: complianceAlerts > 5 ? 'critical' : complianceAlerts > 2 ? 'high' : 'medium',
            change: -12.5,
            description: 'Active critical compliance violations',
        },
        {
            label: 'Negative Stock Alerts',
            value: negativeStock,
            severity: negativeStock > 8 ? 'critical' : negativeStock > 4 ? 'high' : 'medium',
            change: 8.3,
            description: 'High/critical negative stock exceptions',
        },
        {
            label: 'GR/IR Pending',
            value: grIrPending,
            severity: grIrPending > 15 ? 'critical' : grIrPending > 8 ? 'high' : 'low',
            change: -3.1,
            description: 'Unresolved goods receipt/invoice mismatch',
        },
        {
            label: 'Forex Hedge Mismatch',
            value: forexMismatch,
            severity: forexMismatch > 10 ? 'critical' : forexMismatch > 5 ? 'high' : 'medium',
            change: 15.7,
            description: 'Foreign exchange hedge gap items',
        },
        {
            label: 'Debt Maturity Risk',
            value: debtMaturity,
            severity: debtMaturity > 5 ? 'critical' : debtMaturity > 2 ? 'high' : 'low',
            change: -6.2,
            description: 'Short-term debt maturing within 30 days',
        },
    ];

    // Sort by severity priority: critical > high > medium > low
    const severityOrder: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return kpis.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export function getCategoryKpis(data: ExceptionRecord[], riskType: string): KpiData[] {
    const byCategory = data.filter(r => r.riskType === riskType);
    const categories = [...new Set(byCategory.map(r => r.category))];

    return categories.map(cat => {
        const items = byCategory.filter(r => r.category === cat);
        const criticalCount = items.filter(r => r.severity === 'critical' || r.severity === 'high').length;
        const sev: Severity = criticalCount > items.length * 0.5 ? 'critical' : criticalCount > items.length * 0.3 ? 'high' : criticalCount > 0 ? 'medium' : 'low';
        return {
            label: cat,
            value: items.length,
            severity: sev,
            change: Math.round((Math.random() * 30 - 15) * 10) / 10,
            description: `Total ${cat.toLowerCase()} exceptions`,
        };
    });
}

export function getMonthlyTrend(data: ExceptionRecord[]): { month: string; categories: Record<string, number> }[] {
    const months: Record<string, Record<string, number>> = {};

    data.forEach(r => {
        const month = r.date.substring(0, 7); // YYYY-MM
        if (!months[month]) months[month] = {};
        const cat = r.riskType;
        months[month][cat] = (months[month][cat] || 0) + 1;
    });

    return Object.entries(months)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, categories]) => ({ month, categories }));
}

export function getCategoryDistribution(data: ExceptionRecord[]): { name: string; value: number }[] {
    const dist: Record<string, number> = {};
    data.forEach(r => {
        dist[r.category] = (dist[r.category] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
}

export function getDepartmentComparison(data: ExceptionRecord[]): { department: string; severities: Record<Severity, number> }[] {
    const depts: Record<string, Record<Severity, number>> = {};
    data.forEach(r => {
        if (!depts[r.department]) depts[r.department] = { low: 0, medium: 0, high: 0, critical: 0 };
        depts[r.department][r.severity]++;
    });
    return Object.entries(depts).map(([department, severities]) => ({ department, severities }));
}

export function getAgeingAnalysis(data: ExceptionRecord[]): { bucket: AgeingBucket; categories: Record<string, number> }[] {
    const buckets: AgeingBucket[] = ['0-30 days', '31-60 days', '61-90 days', '90+ days'];
    return buckets.map(bucket => {
        const items = data.filter(r => r.ageingBucket === bucket);
        const categories: Record<string, number> = {};
        items.forEach(r => {
            categories[r.riskType] = (categories[r.riskType] || 0) + 1;
        });
        return { bucket, categories };
    });
}

export function getComplianceHeatmap(data: ExceptionRecord[]): { department: string; category: string; value: number }[] {
    const result: { department: string; category: string; value: number }[] = [];
    const depts = [...new Set(data.map(r => r.department))];
    const cats = [...new Set(data.map(r => r.category))];

    depts.forEach(dept => {
        cats.forEach(cat => {
            const count = data.filter(r => r.department === dept && r.category === cat).length;
            if (count > 0) {
                result.push({ department: dept, category: cat, value: count });
            }
        });
    });
    return result;
}

export function getRiskProfile(data: ExceptionRecord[]): { indicator: string; values: number[] }[] {
    const riskTypes = ['Financial', 'Inventory', 'Procurement', 'Compliance'];
    const indicators = ['Volume', 'Severity', 'Ageing', 'Resolution Rate', 'Impact'];

    return indicators.map(indicator => {
        const values = riskTypes.map(rt => {
            const items = data.filter(r => r.riskType === rt);
            switch (indicator) {
                case 'Volume': return items.length;
                case 'Severity': return items.filter(r => r.severity === 'critical' || r.severity === 'high').length;
                case 'Ageing': return items.filter(r => r.ageingBucket === '90+ days').length * 3;
                case 'Resolution Rate': return items.filter(r => r.status === 'Resolved').length;
                case 'Impact': return Math.round(items.reduce((s, r) => s + r.amount, 0) / 100000);
                default: return 0;
            }
        });
        return { indicator, values };
    });
}

export const allDepartments: Department[] = ['Finance', 'Procurement', 'Treasury', 'Inventory', 'Compliance', 'Operations', 'Risk Management'];
export const allCategories: ExceptionCategory[] = [
    'Compliance Violation', 'Negative Stock', 'GR/IR Mismatch',
    'Forex Hedge Gap', 'Short-Term Debt', 'Duplicate Payment',
    'Budget Overrun', 'Unauthorized Transaction',
];
