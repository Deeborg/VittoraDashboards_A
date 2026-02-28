/* ============================================
   FINANCIAL SUMMARY SECTION
   investor-dashboard/src/sections/financialSummary.ts
   ============================================ */

import { CompanyData }    from '../data/mockData';
import { Formatters }     from '../utils/formatters';
import { Calculations }   from '../utils/calculations';
import { WaterfallChart } from '../components/waterfallChart';
import { TableComponent } from '../components/tables';
import { AppState }       from '../app';
import type { FinancialRecord } from '../types/index';

type FinancialMetricKey = keyof Pick<FinancialRecord,
    | 'netSales' | 'otherIncome' | 'totalRevenue'
    | 'cogs' | 'grossProfit' | 'employeeCost'
    | 'otherExpenses' | 'depreciation'
    | 'ebitda' | 'ebit' | 'pbt' | 'pat'
>;

interface MetricDef {
    label:   string;
    key:     FinancialMetricKey;
    accent?: string;
}

export const FinancialSummary = {

    render(container: HTMLElement): void {
        const period = `${AppState.selectedYear}-${AppState.selectedQuarter}`;
        const d      = CompanyData.financialSummary.find(x => x.period === period);

        if (!d) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px;color:var(--text-soft);">
                    No financial data for ${Formatters.formatPeriod(period)}
                </div>`;
            return;
        }

        const ttmRevenue = Calculations.calculateTTM(
            CompanyData.financialSummary, 'totalRevenue');
        const ttmPAT = Calculations.calculateTTM(
            CompanyData.financialSummary, 'pat');

        container.innerHTML = `
            <div class="section-header">
                <div>
                    <h2 class="section-title">Financial Summary</h2>
                    <p class="section-subtitle">
                        Income Statement &nbsp;·&nbsp;
                        ${Formatters.formatPeriod(period)}
                    </p>
                </div>
                <div class="section-meta">
                    <span>TTM Revenue: ${Formatters.formatCurrency(ttmRevenue)}</span>
                    <span>TTM PAT: ${Formatters.formatCurrency(ttmPAT)}</span>
                </div>
            </div>

            ${this.renderKPIStrip(d, period)}
            ${this.renderWaterfall(d)}
            ${this.renderGrowthAndMargins(d, period)}
            ${this.renderEPSTrend()}
            ${this.renderIncomeTable(d, period)}
        `;
    },

    renderKPIStrip(d: FinancialRecord, period: string): string {
    const metrics: MetricDef[] = [
        { label: 'Net Sales',      key: 'netSales'       },
        { label: 'Other Income',   key: 'otherIncome'    },
        { label: 'Total Revenue',  key: 'totalRevenue'   },
        { label: 'COGS',           key: 'cogs'           },
        { label: 'Gross Profit',   key: 'grossProfit'    },
        { label: 'Employee Cost',  key: 'employeeCost'   },
        { label: 'Other Expenses', key: 'otherExpenses'  },
        { label: 'Depreciation',   key: 'depreciation'   },
        { label: 'EBITDA',         key: 'ebitda'         },
        { label: 'EBIT',           key: 'ebit'           },
        { label: 'PBT',            key: 'pbt'            },
        { label: 'PAT',            key: 'pat'            },
    ];

    const cards = metrics.map(m => {
        const yoy = Calculations.getYoYComparison(CompanyData.financialSummary, period, m.key);
        const qoq = Calculations.getQoQComparison(CompanyData.financialSummary, period, m.key);
        
        // Helper to determine if growth is positive or negative for CSS class
        const getCls = (val: number | null) => (val && val >= 0) ? 'pos' : 'neg';
        const formatG = (val: number | null) => val !== null ? (val >= 0 ? `+${(val * 100).toFixed(1)}%` : `${(val * 100).toFixed(1)}%`) : null;

        const yoyText = formatG(yoy.growth);
        const qoqText = formatG(qoq.growth);

        return `
            <div class="kpi-card">
                <div class="kpi-label">${m.label}</div>
                <div class="kpi-value">
                    ${Formatters.formatCurrency(d[m.key] as number)}
                </div>
                <div class="kpi-badge-row">
                    ${yoyText ? `<span class="kpi-badge ${getCls(yoy.growth)}">${yoyText} YOY</span>` : ''}
                    ${qoqText ? `<span class="kpi-badge ${getCls(qoq.growth)}">${qoqText} QOQ</span>` : ''}
                </div>
            </div>
        `;
    }).join('');

    return `<div class="kpi-grid">${cards}</div>`;
},

    renderWaterfall(d: FinancialRecord): string {
        const steps = WaterfallChart.buildSteps(d);
        return WaterfallChart.render(steps);
    },

    renderGrowthAndMargins(d: FinancialRecord, period: string): string {
    const gm = Calculations.calculateGrossMargin(d.grossProfit, d.totalRevenue) ?? 0;
    const em = Calculations.calculateEBITDAMargin(d.ebitda, d.totalRevenue) ?? 0;
    const nm = d.pat / d.totalRevenue;

    const yoyRev = Calculations.getYoYComparison(CompanyData.financialSummary, period, 'totalRevenue');
    const qoqRev = Calculations.getQoQComparison(CompanyData.financialSummary, period, 'totalRevenue');
    const yoyPAT = Calculations.getYoYComparison(CompanyData.financialSummary, period, 'pat');
    const qoqPAT = Calculations.getQoQComparison(CompanyData.financialSummary, period, 'pat');

    const g = (v: number | null) => Formatters.formatGrowth(v);

    // Right Card: Profitability Margins Data
    const margins = [
        { label: 'Gross Margin', formula: '(Revenue - COGS) ÷ Revenue', val: gm * 100, bench: 45, fill: 'fill-gm' },
        { label: 'EBITDA Margin', formula: 'EBITDA ÷ Revenue', val: em * 100, bench: 17.5, fill: 'fill-em' },
        { label: 'Net Margin', formula: 'PAT ÷ Revenue', val: nm * 100, bench: 10, fill: 'fill-nm' },
    ];

    const marginRows = margins.map(m => {
        const diff = (m.val - m.bench).toFixed(1);
        const isPos = m.val >= m.bench;
        return `
            <div class="margin-row">
                <div class="margin-info">
                    <div class="margin-label">${m.label}</div>
                    <div class="margin-formula">${m.formula}</div>
                </div>
                <div class="margin-gauge-wrap">
                    <div class="margin-gauge-track">
                        <div class="margin-gauge-fill ${m.fill}" style="width: ${m.val}%"></div>
                        <div class="benchmark-marker" style="left: ${m.bench}%"></div>
                    </div>
                    <div class="gauge-labels">
                        <span>0%</span>
                        <span>Benchmark ${m.bench}%</span>
                        <span>100%</span>
                    </div>
                    <div class="vs-industry" style="color: ${isPos ? 'var(--green)' : 'var(--red)'}">
                        ${isPos ? '+' : ''}${diff}pp vs industry
                    </div>
                </div>
                <div class="margin-big-value">${m.val.toFixed(1)}%</div>
            </div>
        `;
    }).join('');

    return `
        <div class="grid-2">
            <!-- Left Card: Growth -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Growth Indicators</span>
                </div>
                <div class="card-body">
                    <div class="growth-grid">
                        <div class="growth-item"><div class="growth-label">Revenue YOY</div><div class="growth-value">${g(yoyRev.growth).text}</div></div>
                        <div class="growth-item"><div class="growth-label">Revenue QOQ</div><div class="growth-value">${g(qoqRev.growth).text}</div></div>
                        <div class="growth-item"><div class="growth-label">Profit YOY</div><div class="growth-value">${g(yoyPAT.growth).text}</div></div>
                        <div class="growth-item"><div class="growth-label">Profit QOQ</div><div class="growth-value">${g(qoqPAT.growth).text}</div></div>
                    </div>
                </div>
            </div>

            <!-- Right Card: Margins -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Profitability Margins</span>
                    <span style="font-size: 10px; color: var(--text-soft)">vs industry avg</span>
                </div>
                <div class="card-body">
                    ${marginRows}
                </div>
            </div>
        </div>
    `;
},

    renderEPSTrend(): string {
    const epsData = [...CompanyData.financialSummary]
        .sort((a, b) => a.period.localeCompare(b.period))
        .slice(-8); // Last 8 quarters

    const values = epsData.map(x => x.eps);
    const labels = epsData.map(x => Formatters.formatPeriod(x.period));

    // SVG Dimensions
    const W = 1000, H = 240;
    const pL = 60, pR = 40, pT = 40, pB = 40;
    const cW = W - pL - pR;
    const cH = H - pT - pB;

    // Scaling logic
    const minV = Math.min(...values) * 0.85;
    const maxV = Math.max(...values) * 1.15;
    const rng  = maxV - minV;

    const pts = values.map((v, i) => ({
        x: pL + (i / (values.length - 1)) * cW,
        y: pT + cH - ((v - minV) / rng) * cH,
        v,
        label: labels[i],
    }));

    // Create paths
    const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
    const areaPath = `
        M ${pts[0].x},${pT + cH}
        L ${pts[0].x},${pts[0].y}
        ${pts.map(p => `L ${p.x},${p.y}`).join(' ')}
        L ${pts[pts.length - 1].x},${pT + cH} Z
    `;

    // Horizontal Grid Lines (Dashed)
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map(t => {
        const val = minV + t * rng;
        const y   = pT + cH - t * cH;
        return `
            <line x1="${pL}" y1="${y}" x2="${pL + cW}" y2="${y}" 
                stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="4,4"/>
            <text x="${pL - 10}" y="${y + 4}" text-anchor="end" 
                font-size="12" fill="#5a6478" font-family="JetBrains Mono, monospace">
                $${val.toFixed(2)}
            </text>
        `;
    }).join('');

    // Data Points (Circles) and Labels (sitting above dots)
    const dotsAndLabels = pts.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="5" fill="#3a86c8" stroke="#ffffff" stroke-width="2"/>
        <text x="${p.x}" y="${p.y - 15}" text-anchor="middle" 
            font-size="12" font-weight="700" fill="#ffffff" font-family="JetBrains Mono, monospace">
            $${p.v.toFixed(2)}
        </text>
    `).join('');

    // X-Axis Labels
    const xLabels = pts.map(p => `
        <text x="${p.x}" y="${pT + cH + 25}" text-anchor="middle" 
            font-size="11" fill="#5a6478" font-family="Inter, sans-serif">
            ${p.label}
        </text>
    `).join('');

    // Calculate Growth for the Badge
    const first = values[0];
    const last  = values[values.length - 1];
    const growthVal = ((last - first) / first) * 100;

    return `
        <div class="card">
            <div class="card-header">
                <span class="card-title">Earnings Per Share Trend</span>
                <span class="kpi-badge pos">+${growthVal.toFixed(1)}% OVER 8 QUARTERS</span>
            </div>
            <div class="card-body" style="padding-top:20px;">
                <svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">
                    <defs>
                        <linearGradient id="epsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#3a86c8" stop-opacity="0.2"/>
                            <stop offset="100%" stop-color="#3a86c8" stop-opacity="0"/>
                        </linearGradient>
                    </defs>
                    ${gridLines}
                    <path d="${areaPath}" fill="url(#epsGrad)"/>
                    <polyline points="${polyline}" fill="none" stroke="#3a86c8" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
                    ${dotsAndLabels}
                    ${xLabels}
                    <line x1="${pL}" y1="${pT + cH}" x2="${pL + cW}" y2="${pT + cH}" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                </svg>
            </div>
        </div>
    `;
},

    renderIncomeTable(d: FinancialRecord, period: string): string {
    const [y, q]     = period.split('-');
    const prevPeriod = `${parseInt(y) - 1}-${q}`;
    const prev       = CompanyData.financialSummary.find(x => x.period === prevPeriod);

    interface ISRow {
        label:   string;
        key:     keyof FinancialRecord;
        type:    'normal' | 'subtotal' | 'grandtotal';
        indent?: boolean;
    }

    const rows: ISRow[] = [
        { label: 'Net Sales',      key: 'netSales',      type: 'normal',    indent: true  },
        { label: 'Other Income',   key: 'otherIncome',   type: 'normal',    indent: true  },
        { label: 'Total Revenue',  key: 'totalRevenue',  type: 'subtotal'                 },
        { label: 'COGS',           key: 'cogs',          type: 'normal',    indent: true  },
        { label: 'Gross Profit',   key: 'grossProfit',   type: 'subtotal'                 },
        { label: 'Employee Cost',  key: 'employeeCost',  type: 'normal',    indent: true  },
        { label: 'Other Expenses', key: 'otherExpenses', type: 'normal',    indent: true  },
        { label: 'Depreciation',   key: 'depreciation',  type: 'normal',    indent: true  },
        { label: 'EBITDA',         key: 'ebitda',        type: 'subtotal'                 },
        { label: 'EBIT',           key: 'ebit',          type: 'normal',    indent: true  },
        { label: 'Interest',       key: 'interest',      type: 'normal',    indent: true  },
        { label: 'PBT',            key: 'pbt',           type: 'subtotal'                 },
        { label: 'Tax',            key: 'tax',           type: 'normal',    indent: true  },
        { label: 'PAT',            key: 'pat',           type: 'grandtotal'               },
    ];

    const bodyRows = rows.map(row => {
        const val     = d[row.key]    as number;
        const prevVal = prev ? prev[row.key] as number : null;
        const yoy     = Calculations.getYoYComparison(CompanyData.financialSummary, period, row.key);
        const g       = Formatters.formatGrowth(yoy.growth);
        const pctRev  = (val / d.totalRevenue) * 100;

        const rowCls = row.type === 'subtotal'   ? 'is-row subtotal' 
                     : row.type === 'grandtotal' ? 'is-row grandtotal' 
                     :                             'is-row';

        const labelPrefix = row.indent ? '— ' : '';

        return `
            <tr class="${rowCls}">
                <td class="is-label-cell">${labelPrefix}${row.label}</td>
                <td class="r">${Formatters.formatCurrency(val)}</td>
                <td class="r text-dim">${prevVal !== null ? Formatters.formatCurrency(prevVal) : '—'}</td>
                <td class="r"><span class="${g.class}">${g.text}</span></td>
                <td class="r">
                    <div class="is-pct-container">
                        <div class="is-pct-track">
                            <div class="is-pct-fill" style="width: ${Math.min(pctRev, 100)}%"></div>
                        </div>
                        <span class="is-pct-text">${pctRev.toFixed(1)}%</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    return `
        <div class="card">
            <div class="card-header">
                <span class="card-title">Income Statement Detail</span>
                <button class="tbl-btn" onclick="window.TableComponent.exportCSV('is-tbl','income_statement')">
                    Export CSV
                </button>
            </div>
            <div class="tbl-wrap">
                <table class="is-table" id="is-tbl">
                    <thead>
                        <tr>
                            <th>Line Item</th>
                            <th class="r">${Formatters.formatPeriod(period)}</th>
                            <th class="r">Prior Year</th>
                            <th class="r">YoY Growth</th>
                            <th class="r">% of Revenue</th>
                        </tr>
                    </thead>
                    <tbody>${bodyRows}</tbody>
                </table>
            </div>
        </div>
    `;
}
};

// ✅ Clean — globals.d.ts declares window.FinancialSummary
window.FinancialSummary = FinancialSummary;