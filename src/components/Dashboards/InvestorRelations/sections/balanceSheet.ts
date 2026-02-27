/* ============================================
   BALANCE SHEET SECTION
   investor-dashboard/src/sections/balanceSheet.ts
   ============================================ */

import { CompanyData }  from '../data/mockData';
import { Formatters }   from '../utils/formatters';
import { Calculations } from '../utils/calculations';
import { AppState }     from '../app';
import type { BalanceSheetRecord } from '../types/index';

export const BalanceSheet = {

    render(container: HTMLElement): void {
        const period = `${AppState.selectedYear}-${AppState.selectedQuarter}`;
        const d      = CompanyData.balanceSheet.find(x => x.period === period);

        if (!d) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px;color:var(--text-soft);">
                    No balance sheet data for ${Formatters.formatPeriod(period)}
                </div>`;
            return;
        }

        const ttmEBITDA    = Calculations.calculateTTM(CompanyData.financialSummary, 'ebitda');
        const debtToEBITDA = Calculations.calculateDebtToEBITDA(d.netDebt, ttmEBITDA);
        const currentRatio = d.currentAssets / d.currentLiabilities;
        const debtToEquity = d.totalDebt / d.equity;

        container.innerHTML = `
            <div class="section-header">
                <div>
                    <h2 class="section-title">Balance Sheet Highlights</h2>
                    <p class="section-subtitle">
                        Financial position &nbsp;·&nbsp; ${Formatters.formatPeriod(period)}
                    </p>
                </div>
                <div class="section-meta">
                    <span>Total Assets: ${Formatters.formatCurrency(d.totalAssets)}</span>
                </div>
            </div>

            ${this.renderKPIStrip(d)}
            ${this.renderRatiosAndTrend(d, debtToEBITDA, currentRatio, debtToEquity)}
            ${this.renderIndustryComposition()}
        `;
    },

    renderKPIStrip(d: BalanceSheetRecord): string {
        const metrics = [
            { label: 'Total Equity', value: d.equity,      accent: 'accent-blue'  },
            { label: 'Total Debt',   value: d.totalDebt,   accent: ''             },
            { label: 'Net Debt',     value: d.netDebt,     accent: 'accent-green' },
            { label: 'Cash & Bank',  value: d.cashAndBank, accent: ''             },
            { label: 'Investments',  value: d.investments, accent: ''             },
            { label: 'Total Assets', value: d.totalAssets, accent: ''             },
        ];

        const cards = metrics.map(m => `
            <div class="kpi-card ${m.accent}">
                <div class="kpi-label">${m.label}</div>
                <div class="kpi-value">${Formatters.formatCurrency(m.value)}</div>
            </div>
        `).join('');

        return `
            <div class="kpi-grid"
                style="grid-template-columns:repeat(6,1fr);margin-bottom:22px;">
                ${cards}
            </div>
        `;
    },

    renderRatiosAndTrend(
        d:            BalanceSheetRecord,
        debtToEBITDA: number | null,
        currentRatio: number,
        debtToEquity: number
    ): string {

        const de = debtToEBITDA ?? 99;

        const ratios = [
            {
                label:  'Net Debt / EBITDA',
                value:  Formatters.formatRatio(debtToEBITDA),
                status: de < 1 ? 'Low Leverage' : de < 3 ? 'Moderate' : 'High Risk',
                badge:  de < 1 ? 'pos' : de < 3 ? 'neu' : 'neg',
                tip:    'Net Debt / TTM EBITDA. <1x = conservative.',
            },
            {
                label:  'Current Ratio',
                value:  Formatters.formatRatio(currentRatio),
                status: currentRatio > 1.5 ? 'Healthy' : currentRatio > 1 ? 'Adequate' : 'Watch',
                badge:  currentRatio > 1.5 ? 'pos'     : currentRatio > 1 ? 'neu'      : 'neg',
                tip:    'Current Assets / Current Liabilities.',
            },
            {
                label:  'Debt to Equity',
                value:  Formatters.formatRatio(debtToEquity),
                status: debtToEquity < 0.5 ? 'Conservative' : debtToEquity < 1 ? 'Moderate' : 'Leveraged',
                badge:  debtToEquity < 0.5 ? 'pos'          : debtToEquity < 1 ? 'neu'       : 'neg',
                tip:    'Total Debt / Total Equity.',
            },
            {
                label:  'Short-term Debt',
                value:  Formatters.formatCurrency(d.shortTermDebt),
                status: 'Due < 12 months',
                badge:  'neu',
                tip:    'Obligations maturing within 12 months.',
            },
            {
                label:  'Long-term Debt',
                value:  Formatters.formatCurrency(d.longTermDebt),
                status: 'Due > 12 months',
                badge:  'neu',
                tip:    'Obligations maturing beyond 12 months.',
            },
        ] as const;

        const ratioRows = ratios.map(r => `
            <div style="display:flex;justify-content:space-between;align-items:center;
                padding:11px 0;border-bottom:1px solid var(--border);">
                <span style="font-size:12px;color:var(--text-mid);" title="${r.tip}">
                    ${r.label}
                </span>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-family:var(--mono);font-size:14px;
                        font-weight:700;color:var(--navy-800);">
                        ${r.value}
                    </span>
                    <span class="kpi-badge ${r.badge}">${r.status}</span>
                </div>
            </div>
        `).join('');

        return `
            <div class="grid-2" style="margin-bottom:20px;">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Key Financial Ratios</span>
                    </div>
                    <div class="card-body">${ratioRows}</div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Equity vs Debt Trend</span>
                        <span style="font-size:11px;color:var(--text-soft);">$M · quarterly</span>
                    </div>
                    <div class="card-body" style="padding-top:8px;">
                        ${this.renderUnifiedTrendChart()}
                    </div>
                </div>
            </div>
        `;
    },

    renderUnifiedTrendChart(): string {
        // Sort balance sheet data chronologically
        const bsTrend = [...CompanyData.balanceSheet]
            .sort((a, b) => a.period.localeCompare(b.period));

        if (bsTrend.length < 2) return '<p style="color:var(--text-soft);">Insufficient data</p>';

        // Data series in $M
        const eqVals   = bsTrend.map(x => x.equity   / 1e6);
        const debtVals = bsTrend.map(x => x.totalDebt / 1e6);
        const labels   = bsTrend.map(x => Formatters.formatPeriod(x.period));
        const n        = bsTrend.length;

        // SVG dimensions
        const W    = 520;
        const H    = 200;
        const padL = 52;   // Y-axis labels
        const padR = 16;
        const padT = 16;
        const padB = 32;   // X-axis labels
        const cW   = W - padL - padR;
        const cH   = H - padT - padB;

        // Unified Y scale across BOTH series
        const allVals = [...eqVals, ...debtVals];
        const minY    = Math.floor(Math.min(...allVals) * 0.92);
        const maxY    = Math.ceil( Math.max(...allVals) * 1.06);
        const rangeY  = maxY - minY;

        const toX = (i: number): number =>
            padL + (i / (n - 1)) * cW;

        const toY = (val: number): number =>
            padT + cH - ((val - minY) / rangeY) * cH;

        // Build SVG point arrays
        const eqPts   = eqVals.map((v, i)   => ({ x: toX(i), y: toY(v), v }));
        const debtPts = debtVals.map((v, i)  => ({ x: toX(i), y: toY(v), v }));

        const polyEq   = eqPts.map(p   => `${p.x},${p.y}`).join(' ');
        const polyDebt = debtPts.map(p  => `${p.x},${p.y}`).join(' ');

        // Area fills (polygon closed to bottom)
        const areaEq = [
            ...eqPts.map(p => `${p.x},${p.y}`),
            `${eqPts[n-1].x},${padT + cH}`,
            `${eqPts[0].x},${padT + cH}`,
        ].join(' ');

        const areaDebt = [
            ...debtPts.map(p => `${p.x},${p.y}`),
            `${debtPts[n-1].x},${padT + cH}`,
            `${debtPts[0].x},${padT + cH}`,
        ].join(' ');

        // Y-axis gridlines — 4 evenly spaced ticks
        const yTicks = 4;
        const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
            const val = minY + (i / yTicks) * rangeY;
            const y   = toY(val);
            return `
                <line x1="${padL}" y1="${y}" x2="${padL + cW}" y2="${y}"
                    stroke="#eaecf0" stroke-width="1"
                    stroke-dasharray="${i === 0 ? 'none' : '3,3'}"/>
                <text x="${padL - 6}" y="${y + 4}" text-anchor="end"
                    font-size="10" fill="#9aa3b0"
                    font-family="Courier New, monospace">
                    $${Math.round(val)}M
                </text>
            `;
        }).join('');

        // X-axis labels — only first and last to avoid crowding
        const xLabels = `
            <text x="${toX(0)}" y="${padT + cH + 20}"
                text-anchor="middle" font-size="10" fill="#9aa3b0"
                font-family="Segoe UI, sans-serif">
                ${labels[0]}
            </text>
            <text x="${toX(n - 1)}" y="${padT + cH + 20}"
                text-anchor="middle" font-size="10" fill="#9aa3b0"
                font-family="Segoe UI, sans-serif">
                ${labels[n - 1]}
            </text>
        `;

        // Value labels — only on first and last point of each series
        const eqEndLabel = `
            <text x="${eqPts[n-1].x + 6}" y="${eqPts[n-1].y + 4}"
                text-anchor="start" font-size="11" font-weight="700"
                fill="#3a86c8" font-family="Courier New, monospace">
                $${eqVals[n-1].toFixed(0)}M
            </text>
        `;
        const debtEndLabel = `
            <text x="${debtPts[n-1].x + 6}" y="${debtPts[n-1].y + 4}"
                text-anchor="start" font-size="11" font-weight="700"
                fill="#c0392b" font-family="Courier New, monospace">
                $${debtVals[n-1].toFixed(0)}M
            </text>
        `;

        // Dots on every data point
        const eqDots = eqPts.map((p, i) => `
            <circle cx="${p.x}" cy="${p.y}" r="${i === n-1 ? 5 : 3.5}"
                fill="#3a86c8" stroke="white"
                stroke-width="${i === n-1 ? 2 : 1.5}">
                <title>${labels[i]}: $${p.v.toFixed(1)}M equity</title>
            </circle>
        `).join('');

        const debtDots = debtPts.map((p, i) => `
            <circle cx="${p.x}" cy="${p.y}" r="${i === n-1 ? 5 : 3.5}"
                fill="#c0392b" stroke="white"
                stroke-width="${i === n-1 ? 2 : 1.5}">
                <title>${labels[i]}: $${p.v.toFixed(1)}M debt</title>
            </circle>
        `).join('');

        // Delta annotation — gap between equity and debt at latest point
        const latestEqY   = eqPts[n-1].y;
        const latestDebtY = debtPts[n-1].y;
        const gapMid      = (latestEqY + latestDebtY) / 2;
        const gapVal      = (eqVals[n-1] - debtVals[n-1]).toFixed(0);
        const gapX        = toX(n-1) - 60;

        const gapAnnotation = `
            <line x1="${toX(n-1) - 8}" y1="${latestEqY}"
                  x2="${toX(n-1) - 8}" y2="${latestDebtY}"
                stroke="#cbd2db" stroke-width="1"
                stroke-dasharray="2,2"/>
            <text x="${gapX}" y="${gapMid + 4}"
                text-anchor="middle" font-size="10" font-weight="700"
                fill="#5a6478" font-family="Courier New, monospace">
                Δ $${gapVal}M
            </text>
        `;

        // Legend
        const legend = `
            <div style="display:flex;gap:20px;margin-bottom:10px;
                font-size:11px;color:var(--text-mid);">
                <span style="display:flex;align-items:center;gap:6px;">
                    <svg width="24" height="10" style="overflow:visible;">
                        <line x1="0" y1="5" x2="18" y2="5"
                            stroke="#3a86c8" stroke-width="2.5"
                            stroke-linecap="round"/>
                        <circle cx="22" cy="5" r="3.5"
                            fill="#3a86c8" stroke="white" stroke-width="1.5"/>
                    </svg>
                    Equity
                </span>
                <span style="display:flex;align-items:center;gap:6px;">
                    <svg width="24" height="10" style="overflow:visible;">
                        <line x1="0" y1="5" x2="18" y2="5"
                            stroke="#c0392b" stroke-width="2.5"
                            stroke-linecap="round"/>
                        <circle cx="22" cy="5" r="3.5"
                            fill="#c0392b" stroke="white" stroke-width="1.5"/>
                    </svg>
                    Total Debt
                </span>
                <span style="margin-left:auto;font-size:10px;
                    color:var(--text-soft);font-style:italic;">
                    Diverging spread = deleveraging ✓
                </span>
            </div>
        `;

        const svg = `
            <svg width="100%" viewBox="0 0 ${W} ${H}"
                xmlns="http://www.w3.org/2000/svg"
                style="display:block;overflow:visible;">
                <defs>
                    <linearGradient id="gradEq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stop-color="#3a86c8" stop-opacity="0.12"/>
                        <stop offset="100%" stop-color="#3a86c8" stop-opacity="0.01"/>
                    </linearGradient>
                    <linearGradient id="gradDebt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stop-color="#c0392b" stop-opacity="0.10"/>
                        <stop offset="100%" stop-color="#c0392b" stop-opacity="0.01"/>
                    </linearGradient>
                </defs>

                <!-- Grid -->
                ${gridLines}

                <!-- Area fills -->
                <polygon points="${areaEq}"
                    fill="url(#gradEq)"/>
                <polygon points="${areaDebt}"
                    fill="url(#gradDebt)"/>

                <!-- Lines -->
                <polyline points="${polyEq}"
                    fill="none" stroke="#3a86c8" stroke-width="2.5"
                    stroke-linejoin="round" stroke-linecap="round"/>
                <polyline points="${polyDebt}"
                    fill="none" stroke="#c0392b" stroke-width="2.5"
                    stroke-linejoin="round" stroke-linecap="round"/>

                <!-- Gap annotation -->
                ${gapAnnotation}

                <!-- Dots -->
                ${eqDots}
                ${debtDots}

                <!-- End-point value labels -->
                ${eqEndLabel}
                ${debtEndLabel}

                <!-- X axis labels -->
                ${xLabels}

                <!-- Baseline -->
                <line x1="${padL}" y1="${padT + cH}"
                    x2="${padL + cW}" y2="${padT + cH}"
                    stroke="#dde1e8" stroke-width="1"/>
            </svg>
        `;

        return `${legend}${svg}`;
    },

    renderIndustryComposition(): string {
        const colors = ['#3a86c8','#1daa72','#e04a4a','#e0943a','#9b59b6'];
        const items  = CompanyData.salesByIndustry;
        const total  = items.reduce((s, x) => s + x.revenue, 0);

        const legendItems = items.map((x, i) => `
            <div style="display:flex;align-items:center;gap:8px;
                padding:7px 8px;border-radius:4px;cursor:default;
                transition:background 0.15s;"
                onmouseover="this.style.background='var(--border)'"
                onmouseout="this.style.background='transparent'">
                <div style="width:10px;height:10px;border-radius:2px;
                    background:${colors[i]};flex-shrink:0;"></div>
                <span style="flex:1;font-size:12px;">${x.industry}</span>
                <span style="font-family:var(--mono);font-size:12px;
                    font-weight:700;color:var(--navy-800);">
                    ${Formatters.formatCurrency(x.revenue)}
                </span>
                <span style="font-size:11px;color:var(--text-soft);
                    min-width:38px;text-align:right;">
                    ${x.percentOfTotal.toFixed(1)}%
                </span>
            </div>
        `).join('');

        let offset = 0;
        const segs = items.map((x, i) => {
            const pct = (x.revenue / total) * 100;
            const seg = `
                <div title="${x.industry}: ${Formatters.formatCurrency(x.revenue)}"
                    style="position:absolute;left:${offset.toFixed(2)}%;
                    width:${pct.toFixed(2)}%;height:100%;
                    background:${colors[i]};
                    border-right:2px solid white;
                    transition:opacity 0.15s;"
                    onmouseover="this.style.opacity='0.75'"
                    onmouseout="this.style.opacity='1'">
                </div>
            `;
            offset += pct;
            return seg;
        }).join('');

        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Revenue Composition by Industry</span>
                </div>
                <div class="card-body">
                    <div style="position:relative;height:24px;
                        border-radius:4px;overflow:hidden;margin-bottom:20px;">
                        ${segs}
                    </div>
                    ${legendItems}
                </div>
            </div>
        `;
    },
};

// ✅ Clean — globals.d.ts declares window.BalanceSheet
window.BalanceSheet = BalanceSheet;