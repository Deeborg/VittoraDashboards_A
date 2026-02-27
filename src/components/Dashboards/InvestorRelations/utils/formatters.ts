import type {
    CurrencyOptions,
    PercentOptions,
    GrowthResult
} from '../types/index';

export const Formatters = {

    formatCurrency(value: number | null, options: CurrencyOptions = {}): string {
        if (value == null || isNaN(value)) return options.fallback ?? '$0';

        const abs = Math.abs(value);
        const decimals = options.decimals ?? 1;
        const symbol   = options.symbol   ?? '$';

        let scaled: number;
        let suffix: string;

        if (abs >= 1_000_000_000) {
            scaled = value / 1_000_000_000; suffix = 'B';
        } else if (abs >= 1_000_000) {
            scaled = value / 1_000_000; suffix = 'M';
        } else if (abs >= 1_000) {
            scaled = value / 1_000; suffix = 'K';
        } else {
            scaled = value; suffix = '';
        }

        const formatted = scaled.toLocaleString('en-US', {
            minimumFractionDigits: suffix ? decimals : 0,
            maximumFractionDigits: suffix ? decimals : 0,
        });

        return `${symbol}${formatted}${suffix}`;
    },

    formatPercent(value: number | null, options: PercentOptions = {}): string {
        if (value == null || isNaN(value)) return options.fallback ?? '0.0%';
        const decimals = options.decimals ?? 1;
        return `${(value * 100).toFixed(decimals)}%`;
    },

    formatGrowth(value: number | null): GrowthResult {
        if (value == null || isNaN(value)) {
            return { text: 'N/A', class: 'neutral' };
        }
        const pct      = value * 100;
        const sign     = pct >= 0 ? '+' : '';
        const cssClass = pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral';
        return {
            text:  `${sign}${pct.toFixed(1)}%`,
            class: cssClass,
        };
    },

    formatNumber(value: number | null, decimals = 0): string {
        if (value == null || isNaN(value)) return '0';
        return value.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    },

    formatCompactNumber(value: number | null): string {
        if (value == null || isNaN(value)) return '0';
        const abs = Math.abs(value);
        if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
        if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
        if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
        return `${value}`;
    },

    formatPeriod(period: string | null): string {
        if (!period) return 'N/A';
        const parts = period.split('-');
        if (parts.length !== 2) return period;
        const [year, quarter] = parts;
        return `${quarter} ${year}`;
    },

    formatRatio(value: number | null, decimals = 2): string {
        if (value == null || isNaN(value)) return 'N/A';
        return `${value.toFixed(decimals)}x`;
    },

    abbreviate(text: string, maxLength = 30): string {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },
};