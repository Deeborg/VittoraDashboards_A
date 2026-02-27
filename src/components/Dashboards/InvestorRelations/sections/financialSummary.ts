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
            { label: 'Net Sales',      key: 'netSales'                             },
            { label: 'Other Income',   key: 'otherIncome'                          },
            { label: 'Total Revenue',  key: 'totalRevenue', accent: 'accent-blue'  },
            { label: 'COGS',           key: 'cogs'                                 },
            { label: 'Gross Profit',   key: 'grossProfit',  accent: 'accent-green' },
            { label: 'Employee Cost',  key: 'employeeCost'                         },
            { label: 'Other Expenses', key: 'otherExpenses'                        },
            { label: 'Depreciation',   key: 'depreciation'                         },
            { label: 'EBITDA',         key: 'ebitda',       accent: 'accent-blue'  },
            { label: 'EBIT',           key: 'ebit'                                 },
            { label: 'PBT',            key: 'pbt'                                  },
            { label: 'PAT',            key: 'pat',          accent: 'accent-green' },
        ];

        const cards = metrics.map(m => {
            const yoy = Calculations.getYoYComparison(
                CompanyData.financialSummary, period, m.key);
            const qoq = Calculations.getQoQComparison(
                CompanyData.financialSummary, period, m.key);
            const gy  = Formatters.formatGrowth(yoy.growth);
            const gq  = Formatters.formatGrowth(qoq.growth);

            return `
                <div class="kpi-card ${m.accent ?? ''}">
                    <div class="kpi-label">${m.label}</div>
                    <div class="kpi-value">
                        ${Formatters.formatCurrency(d[m.key] as number)}
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                        ${yoy.growth !== null
                            ? `<span class="kpi-badge ${gy.class}">${gy.text} YoY</span>`
                            : ''}
                        ${qoq.growth !== null
                            ? `<span class="kpi-badge ${gq.class}">${gq.text} QoQ</span>`
                            : ''}
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
        const em = Calculations.calculateEBITDAMargin(d.ebitda,     d.totalRevenue) ?? 0;
        const nm = d.pat / d.totalRevenue;

        const yoyRev = Calculations.getYoYComparison(
            CompanyData.financialSummary, period, 'totalRevenue');
        const qoqRev = Calculations.getQoQComparison(
            CompanyData.financialSummary, period, 'totalRevenue');
        const yoyPAT = Calculations.getYoYComparison(
            CompanyData.financialSummary, period, 'pat');
        const qoqPAT = Calculations.getQoQComparison(
            CompanyData.financialSummary, period, 'pat');

        const g = (v: number | null) => Formatters.formatGrowth(v);

        const growthCards = [
            { label: 'Revenue YoY', val: g(yoyRev.growth) },
            { label: 'Revenue QoQ', val: g(qoqRev.growth) },
            { label: 'Profit YoY',  val: g(yoyPAT.growth) },
            { label: 'Profit QoQ',  val: g(qoqPAT.growth) },
        ].map(item => `
            <div class="kpi-card">
                <div class="kpi-label">${item.label}</div>
                <div class="kpi-value ${item.val.class}" style="font-size:24px;">
                    ${item.val.text}
                </div>
            </div>
        `).join('');

        // Industry benchmarks
        const benchmarks = { gm: 45, em: 17.5, nm: 10 };

        const marginRows = [
            {
                label:   'Gross Margin',
                formula: '(Revenue − COGS) ÷ Revenue',
                val:     gm * 100,
                bench:   benchmarks.gm,
                cls:     'gm',
            },
            {
                label:   'EBITDA Margin',
                formula: 'EBITDA ÷ Revenue',
                val:     em * 100,
                bench:   benchmarks.em,
                cls:     'em',
            },
            {
                label:   'Net Margin',
                formula: 'PAT ÷ Revenue',
                val:     nm * 100,
                bench:   benchmarks.nm,
                cls:     'nm',
            },
        ].map(m => {
            const vsBench  = m.val - m.bench;
            const benchClr = vsBench >= 0 ? 'color:#1a7a52' : 'color:#8b2020';
            const benchTxt = vsBench >= 0
                ? `+${vsBench.toFixed(1)}pp vs industry`
                : `${vsBench.toFixed(1)}pp vs industry`;

            return `
                <div class="margin-row">
                    <div>
                        <div class="margin-row-label">${m.label}</div>
                        <div class="margin-row-formula">${m.formula}</div>
                    </div>
                    <div class="margin-gauge-wrap">
                        <div class="margin-gauge-track">
                            <div class="margin-gauge-fill ${m.cls}"
                                style="width:${Math.min(m.val, 100).toFixed(1)}%">
                            </div>
                        </div>
                        <div class="margin-gauge-labels">
                            <span>0%</span>
                            <span>Benchmark ${m.bench}%</span>
                            <span>100%</span>
                        </div>
                        <div class="margin-vs-industry" style="${benchClr}">
                            ${benchTxt}
                        </div>
                    </div>
                    <div class="margin-big-value">
                        ${m.val.toFixed(1)}%
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="grid-2" style="margin-bottom:20px;">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Growth Indicators</span>
                    </div>
                    <div class="card-body">
                        <div class="kpi-grid"
                            style="grid-template-columns:repeat(2,1fr);">
                            ${growthCards}
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Profitability Margins</span>
                        <span style="font-size:11px;color:var(--text-soft);">
                            vs industry avg
                        </span>
                    </div>
                    <div class="card-body">
                        <div class="margin-display">
                            ${marginRows}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderEPSTrend(): string {
        const epsData = [...CompanyData.financialSummary]
            .sort((a, b) => a.period.localeCompare(b.period))
            .slice(-8);

        const values = epsData.map(x => x.eps);
        const labels = epsData.map(x => Formatters.formatPeriod(x.period));

        const W = 860, H = 160;
        const pL = 48, pR = 20, pT = 20, pB = 36;
        const cW = W - pL - pR;
        const cH = H - pT - pB;

        const minV = Math.min(...values) * 0.9;
        const maxV = Math.max(...values) * 1.1;
        const rng  = maxV - minV;

        const pts = values.map((v, i) => ({
            x: pL + (i / (values.length - 1)) * cW,
            y: pT + cH - ((v - minV) / rng) * cH,
            v,
            label: labels[i],
        }));

        const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
        const areaPath = `
            M ${pts[0].x},${pT + cH}
            L ${pts[0].x},${pts[0].y}
            ${pts.map(p => `L ${p.x},${p.y}`).join(' ')}
            L ${pts[pts.length - 1].x},${pT + cH} Z
        `;

        const gridLines = [0, 0.33, 0.66, 1].map(t => {
            const val = minV + t * rng;
            const y   = pT + cH - t * cH;
            return `
                <line x1="${pL}" y1="${y}" x2="${pL + cW}" y2="${y}"
                    stroke="#eaecf0" stroke-width="1" stroke-dasharray="3,3"/>
                <text x="${pL - 6}" y="${y + 4}" text-anchor="end"
                    font-size="10" fill="#8d96a8"
                    font-family="Courier New, monospace">
                    $${val.toFixed(2)}
                </text>
            `;
        }).join('');

        const dots = pts.map(p => `
            <circle cx="${p.x}" cy="${p.y}" r="4"
                fill="#3a86c8" stroke="white" stroke-width="2"/>
            <text x="${p.x}" y="${p.y - 10}" text-anchor="middle"
                font-size="10" fill="#5a6478" font-weight="700"
                font-family="Courier New, monospace">
                $${p.v.toFixed(2)}
            </text>
        `).join('');

        const xLabels = pts.map(p => `
            <text x="${p.x}" y="${pT + cH + 20}" text-anchor="middle"
                font-size="10" fill="#8d96a8"
                font-family="Segoe UI, sans-serif">
                ${p.label}
            </text>
        `).join('');

        const first  = values[0];
        const last   = values[values.length - 1];
        const growth = Formatters.formatGrowth((last - first) / first);

        return `
            <div class="card" style="margin-bottom:20px;">
                <div class="card-header">
                    <span class="card-title">Earnings Per Share Trend</span>
                    <span class="kpi-badge ${growth.class}">
                        ${growth.text} over 8 quarters
                    </span>
                </div>
                <div class="card-body" style="padding-top:12px;">
                    <svg width="100%" viewBox="0 0 ${W} ${H}"
                        xmlns="http://www.w3.org/2000/svg"
                        style="display:block;overflow:visible;">
                        <defs>
                            <linearGradient id="epsGrad"
                                x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"
                                    stop-color="#3a86c8" stop-opacity="0.15"/>
                                <stop offset="100%"
                                    stop-color="#3a86c8" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                        ${gridLines}
                        <path d="${areaPath}" fill="url(#epsGrad)"/>
                        <polyline points="${polyline}" fill="none"
                            stroke="#3a86c8" stroke-width="2.5"
                            stroke-linejoin="round" stroke-linecap="round"/>
                        ${dots}
                        ${xLabels}
                        <line x1="${pL}" y1="${pT + cH}"
                            x2="${pL + cW}" y2="${pT + cH}"
                            stroke="#e4e8ee" stroke-width="1"/>
                    </svg>
                </div>
            </div>
        `;
    },

    renderIncomeTable(d: FinancialRecord, period: string): string {
        const [y, q]     = period.split('-');
        const prevPeriod = `${parseInt(y) - 1}-${q}`;
        const prev       = CompanyData.financialSummary
            .find(x => x.period === prevPeriod);

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
            const yoy     = Calculations.getYoYComparison(
                CompanyData.financialSummary, period, row.key);
            const g       = Formatters.formatGrowth(yoy.growth);
            const pctRev  = (val / d.totalRevenue) * 100;

            const rowCls = row.type === 'subtotal'   ? 'is-row subtotal'
                         : row.type === 'grandtotal' ? 'is-row grandtotal'
                         :                             'is-row';

            const labelCls = row.indent ? 'is-indent' : '';

            const growthBadge = row.type !== 'grandtotal'
                ? `<span class="is-growth ${g.class}">${g.text}</span>`
                : `<span style="font-size:11px;color:rgba(255,255,255,0.7);
                    font-family:var(--mono);">${g.text}</span>`;

            const pctCell = row.type !== 'grandtotal'
                ? `<div class="is-pct-bar">
                    <div class="is-pct-track">
                        <div class="is-pct-fill"
                            style="width:${Math.min(pctRev, 100).toFixed(1)}%">
                        </div>
                    </div>
                    <span class="is-pct-text">${pctRev.toFixed(1)}%</span>
                   </div>`
                : `<span style="font-family:var(--mono);font-size:11px;
                    color:rgba(255,255,255,0.7);">
                    ${pctRev.toFixed(1)}%
                   </span>`;

            return `
                <tr class="${rowCls}">
                    <td class="${labelCls}">
                        <div class="is-row-label">${row.label}</div>
                    </td>
                    <td class="r"
                        style="font-weight:${row.type !== 'normal' ? '700' : '500'}">
                        ${Formatters.formatCurrency(val)}
                    </td>
                    <td class="r"
                        style="color:${row.type === 'grandtotal'
                            ? 'rgba(255,255,255,0.6)'
                            : 'var(--text-soft)'}">
                        ${prevVal !== null ? Formatters.formatCurrency(prevVal) : '—'}
                    </td>
                    <td class="r">${growthBadge}</td>
                    <td class="r">${pctCell}</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Income Statement Detail</span>
                    <button class="tbl-btn"
                        onclick="window.TableComponent.exportCSV(
                            'is-tbl','income_statement')">
                        Export CSV
                    </button>
                </div>
                <div class="tbl-wrap">
                    <table class="is-table" id="is-tbl">
                        <thead class="is-table-head">
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
    },
};

// ✅ Clean — globals.d.ts declares window.FinancialSummary
window.FinancialSummary = FinancialSummary;