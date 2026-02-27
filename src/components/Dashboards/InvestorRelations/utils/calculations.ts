import type {
    FinancialRecord,
    YoYResult
} from '../types/index';

export const Calculations = {

    calculateYoY(current: number | null, previous: number | null): number | null {
        if (previous == null || previous === 0 || current == null) return null;
        return (current - previous) / previous;
    },

    calculateQoQ(current: number | null, previous: number | null): number | null {
        if (previous == null || previous === 0 || current == null) return null;
        return (current - previous) / previous;
    },

    getYoYComparison(
        data: FinancialRecord[],
        currentPeriod: string,
        metric: keyof FinancialRecord
    ): YoYResult {
        const current = data.find(item => item.period === currentPeriod);
        if (!current) return { current: null, previous: null, growth: null };

        const [year, quarter] = currentPeriod.split('-');
        const previousPeriod  = `${parseInt(year) - 1}-${quarter}`;
        const previous        = data.find(item => item.period === previousPeriod);

        const currentValue  = current[metric]  as number;
        const previousValue = previous ? previous[metric] as number : null;
        const growth        = this.calculateYoY(currentValue, previousValue);

        return { current: currentValue, previous: previousValue, growth };
    },

    getQoQComparison(
        data: FinancialRecord[],
        currentPeriod: string,
        metric: keyof FinancialRecord
    ): YoYResult {
        const current = data.find(item => item.period === currentPeriod);
        if (!current) return { current: null, previous: null, growth: null };

        const [year, quarter] = currentPeriod.split('-');
        const qNum            = parseInt(quarter.replace('Q', ''));
        const prevPeriod      = qNum === 1
            ? `${parseInt(year) - 1}-Q4`
            : `${year}-Q${qNum - 1}`;

        const previous      = data.find(item => item.period === prevPeriod);
        const currentValue  = current[metric]  as number;
        const previousValue = previous ? previous[metric] as number : null;
        const growth        = this.calculateQoQ(currentValue, previousValue);

        return { current: currentValue, previous: previousValue, growth };
    },

    calculateDebtToEBITDA(netDebt: number | null, ebitda: number | null): number | null {
        if (ebitda == null || ebitda === 0 || netDebt == null) return null;
        return netDebt / ebitda;
    },

    calculateGrossMargin(grossProfit: number | null, revenue: number | null): number | null {
        if (revenue == null || revenue === 0 || grossProfit == null) return null;
        return grossProfit / revenue;
    },

    calculateEBITDAMargin(ebitda: number | null, revenue: number | null): number | null {
        if (revenue == null || revenue === 0 || ebitda == null) return null;
        return ebitda / revenue;
    },

    calculateTTM(data: FinancialRecord[], metric: keyof FinancialRecord): number | null {
        if (!data || data.length < 4) return null;
        const recent4 = [...data]
            .sort((a, b) => b.period.localeCompare(a.period))
            .slice(0, 4);
        return recent4.reduce((sum, item) => sum + (item[metric] as number || 0), 0);
    },

    getMostRecent<T extends { period: string }>(data: T[]): T | null {
        if (!data || data.length === 0) return null;
        return [...data].sort((a, b) => b.period.localeCompare(a.period))[0];
    },

    filterByYear<T extends { year: number }>(data: T[], year: number): T[] {
        return data.filter(item => item.year === year);
    },

    filterByQuarter<T extends { quarter: string }>(data: T[], quarter: string): T[] {
        return data.filter(item => item.quarter === quarter);
    },

    sortByField<T>(data: T[], field: keyof T, order: 'asc' | 'desc' = 'desc'): T[] {
        return [...data].sort((a, b) => {
            const aVal = (a[field] as number) || 0;
            const bVal = (b[field] as number) || 0;
            return order === 'asc' ? aVal - bVal : bVal - aVal;
        });
    },
};