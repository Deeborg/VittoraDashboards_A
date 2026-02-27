/* ============================================
   WATERFALL CHART COMPONENT
   investor-dashboard/src/components/waterfallChart.ts
   ============================================
   
   VITTORA DARK THEME FIX:
   - All text labels now white (#ffffff) for visibility
   - Value labels positioned above/inside bars with white text
   - Margin annotations in white
============================================ */

import type { WaterfallStep, FinancialRecord } from '../types/index';
import { Formatters } from '../utils/formatters';

export const WaterfallChart = {

    buildSteps(data: FinancialRecord): WaterfallStep[] {
        return [
            { label: 'Revenue',   value: data.totalRevenue,  type: 'total'    },
            { label: 'COGS',      value: data.cogs,          type: 'subtract' },
            { label: 'Gross\nProfit', value: data.grossProfit, type: 'total' },
            { label: 'Emp. Cost', value: data.employeeCost,  type: 'subtract' },
            { label: 'Other Exp', value: data.otherExpenses, type: 'subtract' },
            { label: 'EBITDA',    value: data.ebitda,        type: 'total'    },
            { label: 'Deprec.',   value: data.depreciation,  type: 'subtract' },
            { label: 'EBIT',      value: data.ebit,          type: 'total'    },
            { label: 'Interest',  value: data.interest,      type: 'subtract' },
            { label: 'PBT',       value: data.pbt,           type: 'total'    },
            { label: 'Tax',       value: data.tax,           type: 'subtract' },
            { label: 'PAT',       value: data.pat,           type: 'total'    },
        ];
    },

    render(steps: WaterfallStep[]): string {
        const W = 1120, H = 380;
        const padL = 60, padR = 40, padT = 40, padB = 80;
        const chartW = W - padL - padR;
        const chartH = H - padT - padB;

        const maxVal = Math.max(...steps.map(s => s.value));
        const scale  = chartH / (maxVal * 1.15);
        const barW   = chartW / steps.length;

        let runningTotal = 0;
        const bars = steps.map((step, i) => {
            const isSubtract = step.type === 'subtract';
            const x = padL + i * barW + barW * 0.15;
            const w = barW * 0.7;

            let y: number, h: number, barBase: number;

            if (isSubtract) {
                h = step.value * scale;
                y = padT + chartH - (runningTotal * scale);
                barBase = runningTotal;
                runningTotal -= step.value;
            } else {
                h = step.value * scale;
                y = padT + chartH - h;
                barBase = step.value;
                runningTotal = step.value;
            }

            const fill = isSubtract ? '#ff1744' : '#00d4ff';
            const formatted = Formatters.formatCurrency(step.value, { decimals: 1 });

            // WHITE text for dark theme visibility
            const labelY = h > 40 ? y + h / 2 + 4 : y - 8;
            const labelColor = '#ffffff';  // ✅ WHITE instead of dark

            return { step, x, y, w, h, fill, formatted, labelY, labelColor, barBase };
        });

        // Y-axis gridlines
        const gridLines = [0, 0.25, 0.5, 0.75, 1].map(t => {
            const val = maxVal * 1.15 * t;
            const yPos = padT + chartH - (val * scale);
            return `
                <line x1="${padL}" y1="${yPos}" x2="${padL + chartW}" y2="${yPos}"
                    stroke="rgba(255,255,255,0.05)" stroke-dasharray="3,3"/>
                <text x="${padL - 8}" y="${yPos + 4}" text-anchor="end"
                    font-size="10" fill="#8b9aac" font-family="JetBrains Mono, monospace">
                    ${Formatters.formatCurrency(val, { decimals: 0 })}
                </text>
            `;
        }).join('');

        // Connector lines
        const connectors = bars.slice(0, -1).map((bar, i) => {
            const nextBar = bars[i + 1];
            const x1 = bar.x + bar.w;
            const y1 = bar.y + (bar.step.type === 'subtract' ? 0 : bar.h);
            const x2 = nextBar.x;
            const y2 = nextBar.y + (nextBar.step.type === 'subtract' ? nextBar.h : 0);
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                stroke="rgba(139,154,172,0.3)" stroke-dasharray="3,2"/>`;
        }).join('');

        // Bar rectangles with WHITE value labels
        const barRects = bars.map(bar => `
            <rect x="${bar.x}" y="${bar.y}" width="${bar.w}" height="${bar.h}"
                fill="${bar.fill}" opacity="0.9" rx="2"/>
            <text x="${bar.x + bar.w / 2}" y="${bar.labelY}"
                text-anchor="middle" font-size="11" font-weight="700"
                fill="${bar.labelColor}" font-family="JetBrains Mono, monospace">
                ${bar.formatted}
            </text>
        `).join('');

        // X-axis labels (WHITE text)
        const xLabels = bars.map(bar => `
            <text x="${bar.x + bar.w / 2}" y="${padT + chartH + 20}"
                text-anchor="middle" font-size="11" font-weight="600"
                fill="#ffffff" font-family="Inter, sans-serif">
                ${bar.step.label.split('\n')[0]}
            </text>
            ${bar.step.label.includes('\n') ? `
                <text x="${bar.x + bar.w / 2}" y="${padT + chartH + 35}"
                    text-anchor="middle" font-size="11" font-weight="600"
                    fill="#ffffff" font-family="Inter, sans-serif">
                    ${bar.step.label.split('\n')[1]}
                </text>
            ` : ''}
        `).join('');

        // Margin annotations (WHITE text on dark theme)
        const gpIdx = bars.findIndex(b => b.step.label.includes('Gross'));
        const ebitdaIdx = bars.findIndex(b => b.step.label === 'EBITDA');
        const patIdx = bars.findIndex(b => b.step.label === 'PAT');

        const revenue = steps[0].value;
        const gm = ((bars[gpIdx]?.barBase ?? 0) / revenue) * 100;
        const em = ((bars[ebitdaIdx]?.barBase ?? 0) / revenue) * 100;
        const nm = ((bars[patIdx]?.barBase ?? 0) / revenue) * 100;

        const annotations = `
            <text x="${bars[gpIdx]?.x + bars[gpIdx]?.w / 2}" y="${bars[gpIdx]?.y - 18}"
                text-anchor="middle" font-size="10" font-weight="700"
                fill="#00e676" font-family="JetBrains Mono, monospace">
                GM: ${gm.toFixed(1)}%
            </text>
            <text x="${bars[ebitdaIdx]?.x + bars[ebitdaIdx]?.w / 2}"
                y="${bars[ebitdaIdx]?.y - 18}"
                text-anchor="middle" font-size="10" font-weight="700"
                fill="#00d4ff" font-family="JetBrains Mono, monospace">
                EM: ${em.toFixed(1)}%
            </text>
            <text x="${bars[patIdx]?.x + bars[patIdx]?.w / 2}"
                y="${bars[patIdx]?.y - 18}"
                text-anchor="middle" font-size="10" font-weight="700"
                fill="#00e676" font-family="JetBrains Mono, monospace">
                NM: ${nm.toFixed(1)}%
            </text>
        `;

        // PAT highlight zone
        const patBar = bars[patIdx];
        const patHighlight = `
            <rect x="${patBar.x - 4}" y="${patBar.y - 4}"
                width="${patBar.w + 8}" height="${patBar.h + 8}"
                fill="none" stroke="#00e676" stroke-width="2"
                stroke-dasharray="4,2" rx="4" opacity="0.6"/>
        `;

        return `
            <div class="card" style="margin-bottom:20px;">
                <div class="card-header">
                    <span class="card-title">Profit Bridge</span>
                    <span style="font-size:11px;color:var(--text-soft);">
                        Revenue to Net Income Walk · Explains margin structure
                    </span>
                </div>
                <div class="card-body" style="padding-top:16px;">
                    <div style="display:flex;gap:16px;margin-bottom:12px;
                        font-size:11px;color:var(--text-soft);">
                        <span style="display:flex;align-items:center;gap:6px;">
                            <span style="width:12px;height:12px;
                                background:#00d4ff;border-radius:2px;"></span>
                            Totals
                        </span>
                        <span style="display:flex;align-items:center;gap:6px;">
                            <span style="width:12px;height:12px;
                                background:#ff1744;border-radius:2px;"></span>
                            Deductions
                        </span>
                    </div>
                    <svg width="100%" viewBox="0 0 ${W} ${H}"
                        xmlns="http://www.w3.org/2000/svg"
                        style="display:block;overflow:visible;">
                        ${gridLines}
                        ${connectors}
                        ${barRects}
                        ${annotations}
                        ${patHighlight}
                        ${xLabels}
                        <line x1="${padL}" y1="${padT + chartH}"
                            x2="${padL + chartW}" y2="${padT + chartH}"
                            stroke="#1e2d40" stroke-width="2"/>
                    </svg>
                </div>
            </div>
        `;
    },
};

window.WaterfallChart = WaterfallChart;
