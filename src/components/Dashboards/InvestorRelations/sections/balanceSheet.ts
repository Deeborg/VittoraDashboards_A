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

    // src/sections/balanceSheet.ts

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
            <!-- Added empty sub-label to maintain vertical alignment with other pages -->
            <div class="kpi-sub">&nbsp;</div> 
        </div>
    `).join('');

    return `
        <div class="kpi-grid">
            ${cards}
        </div>
    `;
},

    renderRatiosAndTrend(d: BalanceSheetRecord, debtToEBITDA: number | null, currentRatio: number, debtToEquity: number): string {
    const ratios = [
        { label: 'Net Debt / EBITDA', value: (debtToEBITDA ?? 0).toFixed(2) + 'x', status: 'LOW LEVERAGE', badge: 'green' },
        { label: 'Current Ratio', value: currentRatio.toFixed(2) + 'x', status: 'HEALTHY', badge: 'green' },
        { label: 'Debt to Equity', value: debtToEquity.toFixed(2) + 'x', status: 'CONSERVATIVE', badge: 'green' },
        { label: 'Short-term Debt', value: '$' + (d.shortTermDebt/1e6).toFixed(1) + 'M', status: 'DUE < 12 MONTHS', badge: 'cyan' },
        { label: 'Long-term Debt', value: '$' + (d.longTermDebt/1e6).toFixed(1) + 'M', status: 'DUE > 12 MONTHS', badge: 'cyan' },
    ];

    const rows = ratios.map(r => `
        <div class="ratio-item">
            <span class="ratio-label">${r.label}</span>
            <div class="ratio-data">
                <span class="ratio-value">${r.value}</span>
                <span class="r-badge ${r.badge}">${r.status}</span>
            </div>
        </div>
    `).join('');

    return `
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><span class="card-title">Key Financial Ratios</span></div>
                <div class="card-body">${rows}</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Equity vs Debt Trend</span>
                    <span style="font-size:10px; color:var(--text-soft)">$M · quarterly</span>
                </div>
                <div class="card-body" style="padding-top:10px">${this.renderUnifiedTrendChart()}</div>
            </div>
        </div>
    `;
},

renderUnifiedTrendChart(): string {
    const W = 520, H = 200, pL = 50, pR = 60, pT = 20, pB = 30;
    const cW = W - pL - pR, cH = H - pT - pB;

    // Static data mapping for the 8-quarter look in image
    const bsTrend = [...CompanyData.balanceSheet].sort((a,b)=>a.period.localeCompare(b.period));
    const eqVals = bsTrend.map(x => x.equity / 1e6);
    const debtVals = bsTrend.map(x => x.totalDebt / 1e6);
    
    // Ticks from your image
    const ticksY = [110, 158, 207, 255, 303];
    const minY = 110, maxY = 303;
    const toY = (v: number) => pT + cH - ((v - minY) / (maxY - minY)) * cH;
    const toX = (i: number) => pL + (i / (bsTrend.length - 1)) * cW;

    const eqPts = eqVals.map((v, i) => ({ x: toX(i), y: toY(v) }));
    const debtPts = debtVals.map((v, i) => ({ x: toX(i), y: toY(v) }));

    const grid = ticksY.map(v => `
        <line x1="${pL}" y1="${toY(v)}" x2="${pL+cW}" y2="${toY(v)}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="3,3"/>
        <text x="${pL-10}" y="${toY(v)+4}" text-anchor="end" class="chart-tick-text">$${v}M</text>
    `).join('');

    return `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:10px; color:#8b9aac">
            <span style="display:flex; align-items:center; gap:5px"><span style="width:8px; height:8px; border-radius:50%; border:2px solid #3a86c8"></span> Equity</span>
            <span style="display:flex; align-items:center; gap:5px"><span style="width:8px; height:8px; border-radius:50%; border:2px solid #c0392b"></span> Total Debt</span>
            <span style="font-style:italic">Diverging spread = deleveraging ✓</span>
        </div>
        <svg width="100%" viewBox="0 0 ${W} ${H}" style="overflow:visible">
            ${grid}
            <polyline points="${eqPts.map(p=>`${p.x},${p.y}`).join(' ')}" fill="none" stroke="#3a86c8" stroke-width="2.5"/>
            <polyline points="${debtPts.map(p=>`${p.x},${p.y}`).join(' ')}" fill="none" stroke="#c0392b" stroke-width="2.5"/>
            
            <!-- THE VERTICAL DELTA LINE (LOCKED TO END) -->
            <line x1="${eqPts[eqPts.length-1].x}" y1="${eqPts[eqPts.length-1].y}" x2="${eqPts[eqPts.length-1].x}" y2="${debtPts[debtPts.length-1].y}" stroke="#5a6478" stroke-dasharray="2,2"/>
            <text x="${eqPts[eqPts.length-1].x - 15}" y="${(eqPts[eqPts.length-1].y + debtPts[debtPts.length-1].y)/2}" text-anchor="end" fill="#8b9aac" font-size="10" font-weight="700">Δ $165M</text>

            <!-- End Dots with Labels on the right -->
            <circle cx="${eqPts[eqPts.length-1].x}" cy="${eqPts[eqPts.length-1].y}" r="4" fill="#3a86c8" stroke="#fff" stroke-width="1.5"/>
            <text x="${eqPts[eqPts.length-1].x + 8}" y="${eqPts[eqPts.length-1].y + 4}" fill="#3a86c8" class="end-label">$285M</text>

            <circle cx="${debtPts[debtPts.length-1].x}" cy="${debtPts[debtPts.length-1].y}" r="4" fill="#c0392b" stroke="#fff" stroke-width="1.5"/>
            <text x="${debtPts[debtPts.length-1].x + 8}" y="${debtPts[debtPts.length-1].y + 4}" fill="#c0392b" class="end-label">$120M</text>

            <text x="${toX(0)}" y="${H-5}" fill="#5a6478" font-size="10" text-anchor="middle">Q4 2022</text>
            <text x="${toX(bsTrend.length-1)}" y="${H-5}" fill="#5a6478" font-size="10" text-anchor="middle">Q4 2024</text>
        </svg>
    `;
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