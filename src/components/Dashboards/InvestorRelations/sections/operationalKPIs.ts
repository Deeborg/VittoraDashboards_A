/* ============================================
   OPERATIONAL KPIs SECTION
   investor-dashboard/src/sections/operationalKPIs.ts
   ============================================
   
   VITTORA DARK THEME FIX:
   - Product/Industry names always white (#ffffff)
   - No color inheritance from bar gradients
============================================ */

import { CompanyData }    from '../data/mockData';
import { Formatters }     from '../utils/formatters';
import { Calculations }   from '../utils/calculations';
import { TableComponent } from '../components/tables';
import { AppState }       from '../app';
import type {
    ProductSales,
    IndustrySales,
    TableColumn,
    OperationalRecord,
} from '../types/index';

export const OperationalKPIs = {

    render(container: HTMLElement): void {
        const period = `${AppState.selectedYear}-${AppState.selectedQuarter}`;
        const d      = CompanyData.operationalMetrics.find(x => x.period === period);

        if (!d) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px;color:var(--text-soft);">
                    No operational data for ${Formatters.formatPeriod(period)}
                </div>`;
            return;
        }

        const [y, q] = period.split('-');
        const qn     = parseInt(q.replace('Q', ''), 10);
        const prevP  = qn === 1 ? `${parseInt(y, 10) - 1}-Q4` : `${y}-Q${qn - 1}`;
        const prev   = CompanyData.operationalMetrics.find(x => x.period === prevP);

        const capGrowth = prev
            ? Formatters.formatGrowth(
                (d.capacityUtilization - prev.capacityUtilization) / prev.capacityUtilization)
            : null;

        const capStatus = d.capacityUtilization >= 85 ? { label: 'Excellent',    badge: 'pos' as const }
                        : d.capacityUtilization >= 75 ? { label: 'Good',         badge: 'neu' as const }
                        :                               { label: 'Below Target', badge: 'neg' as const };

        container.innerHTML = `
            <div class="section-header">
                <div>
                    <h2 class="section-title">Operational KPIs</h2>
                    <p class="section-subtitle">
                        Efficiency & production metrics &nbsp;·&nbsp;
                        ${Formatters.formatPeriod(period)}
                    </p>
                </div>
            </div>

            ${this.renderKPIStrip(d, capStatus, capGrowth)}
            ${this.renderCapacitySection(d, capStatus, period)}
            ${this.renderSalesTables()}
        `;
    },

    renderKPIStrip(
        d:         OperationalRecord,
        capStatus: { label: string; badge: 'pos' | 'neg' | 'neu' },
        capGrowth: ReturnType<typeof Formatters.formatGrowth> | null
    ): string {
        return `
            <div class="kpi-grid"
                style="grid-template-columns:repeat(4,1fr);margin-bottom:22px;">
                <div class="kpi-card accent-blue">
                    <div class="kpi-label">Capacity Utilization</div>
                    <div class="kpi-value">${d.capacityUtilization}%</div>
                    <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                        <span class="kpi-badge ${capStatus.badge}">${capStatus.label}</span>
                        ${capGrowth ? `<span class="kpi-badge ${capGrowth.class}">${capGrowth.text} QoQ</span>` : ''}
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Sales Quantity</div>
                    <div class="kpi-value">${Formatters.formatCompactNumber(d.salesQuantity)}</div>
                    <div class="kpi-sub">units shipped</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Sales Value</div>
                    <div class="kpi-value">${Formatters.formatCurrency(d.salesValue)}</div>
                    <div class="kpi-sub">gross revenue</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Revenue / Employee</div>
                    <div class="kpi-value">
                        ${Formatters.formatCurrency(d.revenuePerEmployee, { decimals: 0 })}
                    </div>
                    <div class="kpi-sub">${Formatters.formatNumber(d.employeeCount)} employees</div>
                </div>
            </div>
        `;
    },

    renderCapacitySection(d: OperationalRecord, capStatus: any, period: string): string {
    const opTrend = [...CompanyData.operationalMetrics].sort((a, b) => a.period.localeCompare(b.period));
    const capVals = opTrend.map(x => x.capacityUtilization);
    
    // SVG Scaling Logic (Optimized for visibility)
    const W = 400, H = 150;
    const pL = 10, pR = 10, pT = 20, pB = 30;
    const cW = W - pL - pR, cH = H - pT - pB;

    const mn = 60, mx = 100;
    const toX = (i: number) => pL + (i / (capVals.length - 1)) * cW;
    const toY = (v: number) => pT + cH - ((v - mn) / (mx - mn)) * cH;

    const pts = capVals.map((v, i) => ({ x: toX(i), y: toY(v) }));
    const poly = pts.map(p => `${p.x},${p.y}`).join(' ');
    const targetY = toY(80);

    const sparkSVG = `
        <svg width="100%" height="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="overflow:visible;">
            <!-- 80% Dashed Target Line -->
            <line x1="${pL}" y1="${targetY}" x2="${pL + cW}" y2="${targetY}" class="target-line" />
            <text x="${pL + cW}" y="${targetY - 8}" text-anchor="end" class="target-text">80% target</text>
            
            <!-- Main Trend Line -->
            <polyline points="${poly}" fill="none" stroke="#00d4ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            
            <!-- Data Points (Rings) -->
            ${pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#00d4ff" stroke="#fff" stroke-width="2" />`).join('')}
            
            <!-- X-Axis Date Labels (Locked to corners) -->
            <text x="${pL}" y="${H - 5}" fill="#5a6478" font-size="11">Q4 2022</text>
            <text x="${pL + cW}" y="${H - 5}" fill="#5a6478" font-size="11" text-anchor="end">Q4 2024</text>
        </svg>
    `;

    return `
        <div class="grid-2">
            <!-- Left Card: Capacity Utilization -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">CAPACITY UTILIZATION · ${period}</span>
                </div>
                <div class="card-body">
                    <div class="util-bar-track">
                        <div class="util-bar-fill" style="width: ${d.capacityUtilization}%">
                            <span style="color:white; font-weight:800; font-family:monospace;">${d.capacityUtilization}%</span>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <span style="font-weight:800; color:white; font-size:13px; text-transform:uppercase;">${capStatus.label}</span>
                        <span style="color:#5a6478; font-size:11px; font-weight:600;">Target: 80%+</span>
                    </div>
                    <p style="color:#8b9aac; font-size:12px; margin:0; line-height:1.6;">
                        At ${d.capacityUtilization}%, the plant is running near peak efficiency, indicating strong order flow.
                    </p>
                </div>
            </div>

            <!-- Right Card: Utilization Trend -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">UTILIZATION TREND</span>
                </div>
                <div class="card-body">
                    <div class="trend-svg-container">
                        ${sparkSVG}
                    </div>
                    <p style="color:#5a6478; font-size:12px; font-style:italic; margin-top:20px; line-height:1.6;">
                        Consistent improvement reflects disciplined capacity planning and growing demand.
                    </p>
                </div>
            </div>
        </div>
    `;
},

    renderSalesTables(): string {
        const term = AppState.searchTerm;
        let products   = [...CompanyData.salesByProduct];
        let industries = [...CompanyData.salesByIndustry];

        if (term) {
            products   = products.filter(x => x.productName.toLowerCase().includes(term));
            industries = industries.filter(x => x.industry.toLowerCase().includes(term));
        }

        const maxProdRev = Math.max(...products.map(x => x.revenue));
        const maxIndRev  = Math.max(...industries.map(x => x.revenue));

        const barColors = ['#8aaed0', '#8aaed0', '#8aaed0', '#8aaed0', '#8aaed0'];
        const rankCls   = ['gold', 'silver', 'bronze', '', ''];

        const hdr = `
            <div style="display:grid;grid-template-columns:220px 1fr 100px 80px;gap:16px;
                padding:0 0 10px;border-bottom:2px solid var(--cyan);margin-bottom:2px;">
                <span style="font-size:9px;font-weight:800;text-transform:uppercase;
                    letter-spacing:1px;color:var(--text-soft);">Name</span>
                <span></span>
                <span style="font-size:9px;font-weight:800;text-transform:uppercase;
                    letter-spacing:1px;color:var(--text-soft);text-align:right;">Revenue</span>
                <span style="font-size:9px;font-weight:800;text-transform:uppercase;
                    letter-spacing:1px;color:var(--text-soft);text-align:right;">Share</span>
            </div>
        `;

        const productRows = products.map((p, i) => {
            const barW  = p.percentOfTotal;
            const color = barColors[i] ?? '#8aaed0';
            const rCls  = rankCls[i]  ?? '';
            return `
                <div style="display:grid;grid-template-columns:220px 1fr 100px 80px;gap:16px;
                    align-items:center;padding:11px 0;border-bottom:1px solid var(--border);
                    transition:background 0.12s;"
                    onmouseover="this.style.background='rgba(0,212,255,0.05)'"
                    onmouseout="this.style.background='transparent'">
                    <div style="display:flex;align-items:center;">
                        <span style="display:inline-flex;align-items:center;justify-content:center;
                            width:22px;height:22px;background:${rCls === 'gold' ? 'linear-gradient(135deg,#ffd700,#ffed4e)' : rCls === 'silver' ? 'linear-gradient(135deg,#c0c0c0,#e8e8e8)' : rCls === 'bronze' ? 'linear-gradient(135deg,#cd7f32,#d4af77)' : 'var(--cyan)'};
                            color:#1a1a1a;font-size:10px;font-weight:800;border-radius:4px;
                            flex-shrink:0;margin-right:10px;box-shadow:0 2px 8px rgba(0,212,255,0.4);">
                            ${i + 1}
                        </span>
                        <span style="font-size:13px;font-weight:600;color:#ffffff;white-space:nowrap;
                            overflow:hidden;text-overflow:ellipsis;">
                            ${Formatters.abbreviate(p.productName, 22)}
                        </span>
                    </div>
                    <div style="display:flex;align-items:center;">
                        <div style="flex:1;height:16px;background:var(--border);border-radius:8px;
                            overflow:hidden;box-shadow:inset 0 2px 4px rgba(0,0,0,0.5);">
                            <div style="width:${barW}%;height:100%;background:linear-gradient(90deg,${color},${color}88);
                                border-radius:8px;box-shadow:0 0 14px ${color}, inset 0 1px 3px rgba(255,255,255,0.2);"></div>
                        </div>
                    </div>
                    <div style="font-family:var(--mono);font-size:12px;font-weight:700;
                        color:#ffffff;text-align:right;">
                        ${Formatters.formatCurrency(p.revenue)}
                    </div>
                    <div style="font-family:var(--mono);font-size:12px;font-weight:700;
                        color:#ffffff;text-align:right;">
                        ${p.percentOfTotal.toFixed(1)}%
                    </div>
                </div>
            `;
        }).join('');

        const industryRows = industries.map((x, i) => {
            const barW  = x.percentOfTotal;
            const color = barColors[i] ?? '#8aaed0';
            const rCls  = rankCls[i]  ?? '';
            return `
                <div style="display:grid;grid-template-columns:220px 1fr 100px 80px;gap:16px;
                    align-items:center;padding:11px 0;border-bottom:1px solid var(--border);
                    transition:background 0.12s;"
                    onmouseover="this.style.background='rgba(0,212,255,0.05)'"
                    onmouseout="this.style.background='transparent'">
                    <div>
                        <div style="display:flex;align-items:center;">
                            <span style="display:inline-flex;align-items:center;justify-content:center;
                                width:22px;height:22px;background:${rCls === 'gold' ? 'linear-gradient(135deg,#ffd700,#ffed4e)' : rCls === 'silver' ? 'linear-gradient(135deg,#c0c0c0,#e8e8e8)' : rCls === 'bronze' ? 'linear-gradient(135deg,#cd7f32,#d4af77)' : 'var(--cyan)'};
                                color:#1a1a1a;font-size:10px;font-weight:800;border-radius:4px;
                                flex-shrink:0;margin-right:10px;box-shadow:0 2px 8px rgba(0,212,255,0.4);">
                                ${i + 1}
                            </span>
                            <div>
                                <div style="font-size:13px;font-weight:600;color:#ffffff;">${x.industry}</div>
                                <div style="font-size:10px;color:var(--text-soft);margin-top:1px;">
                                    ${x.clientCount} clients
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;">
                        <div style="flex:1;height:16px;background:var(--border);border-radius:8px;
                            overflow:hidden;box-shadow:inset 0 2px 4px rgba(0,0,0,0.5);">
                            <div style="width:${barW}%;height:100%;background:linear-gradient(90deg,${color},${color}88);
                                border-radius:8px;box-shadow:0 0 14px ${color}, inset 0 1px 3px rgba(255,255,255,0.2);"></div>
                        </div>
                    </div>
                    <div style="font-family:var(--mono);font-size:12px;font-weight:700;
                        color:#ffffff;text-align:right;">
                        ${Formatters.formatCurrency(x.revenue)}}
                    </div>
                    <div style="font-family:var(--mono);font-size:12px;font-weight:700;
                        color:#ffffff;text-align:right;">
                        ${x.percentOfTotal.toFixed(1)}%
                    </div>
                </div>
            `;
        }).join('');

        const emptyMsg = `<div style="text-align:center;padding:28px;color:var(--text-soft);font-size:12px;">No results match your search</div>`;

        return `
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Sales by Product</span>
                        <button class="tbl-btn" onclick="window.TableComponent.exportCSV('prod-csv','sales_by_product')">Export CSV</button>
                    </div>
                    <div class="card-body">${hdr}${productRows || emptyMsg}</div>
                    <table style="display:none" id="prod-csv">
                        <thead><tr><th>Rank</th><th>Product</th><th>Quantity</th><th>Revenue</th><th>% of Total</th></tr></thead>
                        <tbody>${products.map((p, i) => `<tr><td>${i + 1}</td><td>${p.productName}</td><td>${p.quantity}</td><td>${p.revenue}</td><td>${p.percentOfTotal}%</td></tr>`).join('')}</tbody>
                    </table>
                </div>
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Sales by Industry</span>
                        <button class="tbl-btn" onclick="window.TableComponent.exportCSV('ind-csv','sales_by_industry')">Export CSV</button>
                    </div>
                    <div class="card-body">${hdr}${industryRows || emptyMsg}</div>
                    <table style="display:none" id="ind-csv">
                        <thead><tr><th>Rank</th><th>Industry</th><th>Clients</th><th>Revenue</th><th>% of Total</th></tr></thead>
                        <tbody>${industries.map((x, i) => `<tr><td>${i + 1}</td><td>${x.industry}</td><td>${x.clientCount}</td><td>${x.revenue}</td><td>${x.percentOfTotal}%</td></tr>`).join('')}</tbody>
                    </table>
                </div>
            </div>
        `;
    },
};

window.OperationalKPIs = OperationalKPIs;
