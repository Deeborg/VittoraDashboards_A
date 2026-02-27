/* ============================================
   BUSINESS OVERVIEW SECTION
   investor-dashboard/src/sections/businessOverview.ts
   ============================================
   
   VITTORA DARK THEME FIX:
   - Product names now white (#ffffff) for visibility
   - All text labels explicitly white on dark cards
============================================ */

import { CompanyData }    from '../data/mockData';
import { Formatters }     from '../utils/formatters';
import { Calculations }   from '../utils/calculations';
import { TableComponent } from '../components/tables';
import { AppState }       from '../app';
import type { Client, TableColumn } from '../types/index';

export const BusinessOverview = {

    render(container: HTMLElement): void {
        const period     = `${AppState.selectedYear}-${AppState.selectedQuarter}`;
        const fin        = CompanyData.financialSummary.find(x => x.period === period);
        const yoyRev     = fin ? Calculations.getYoYComparison(CompanyData.financialSummary, period, 'totalRevenue') : null;
        const revGrowth  = Formatters.formatGrowth(yoyRev?.growth ?? null);
        const newClients = CompanyData.clients.filter(c => c.isNew === true);

        container.innerHTML = `
            <div class="section-header">
                <div>
                    <h2 class="section-title">Business Overview</h2>
                    <p class="section-subtitle">
                        Commercial momentum &nbsp;·&nbsp;
                        ${Formatters.formatPeriod(period)}
                    </p>
                </div>
                <div class="section-meta">
                    <span>${CompanyData.clients.length} total clients</span>
                    <span>${newClients.length} new in ${AppState.selectedYear}</span>
                </div>
            </div>

            ${this.renderKPIStrip(fin?.totalRevenue ?? null, revGrowth, newClients.length)}
            ${this.renderProductPortfolio()}
            ${this.renderClientsAndGeo()}
        `;
    },

    renderKPIStrip(
        revenue:    number | null,
        revGrowth:  ReturnType<typeof Formatters.formatGrowth>,
        newCount:   number
    ): string {
        const geo         = CompanyData.salesByGeography;
        const exportShare = geo.find(g => g.region === 'Export')?.percentOfTotal ?? 0;
        const newContractVal = CompanyData.newClients2024.reduce((s, c) => s + c.initialContract, 0);

        return `
            <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:22px;">
                <div class="kpi-card accent-blue">
                    <div class="kpi-label">Total Revenue</div>
                    <div class="kpi-value">${revenue ? Formatters.formatCurrency(revenue) : '—'}</div>
                    <span class="kpi-badge ${revGrowth.class}">${revGrowth.text} YoY</span>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Total Clients</div>
                    <div class="kpi-value">${CompanyData.clients.length}</div>
                    <div class="kpi-sub">Active accounts</div>
                </div>
                <div class="kpi-card accent-green">
                    <div class="kpi-label">New Clients (${AppState.selectedYear})</div>
                    <div class="kpi-value">${newCount}</div>
                    <div class="kpi-sub">${Formatters.formatCurrency(newContractVal)} new value</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Export Share</div>
                    <div class="kpi-value">${exportShare.toFixed(1)}%</div>
                    <div class="kpi-sub">of total revenue</div>
                </div>
            </div>
        `;
    },

    renderProductPortfolio(): string {
        const cards = CompanyData.products.map(p => {
            const badgeCls = p.status === 'New'    ? 'badge-new'
                           : p.status === 'Growth' ? 'badge-growth'
                           :                         'badge-mature';
            return `
                <div class="kpi-card">
                    <div style="display:flex;justify-content:space-between;
                        align-items:flex-start;margin-bottom:10px;">
                        <span class="badge ${badgeCls}">${p.status}</span>
                        <span class="badge badge-mature">${p.category}</span>
                    </div>
                    <div style="font-size:12px;font-weight:600;
                        color:#ffffff;margin-bottom:6px;line-height:1.4;">
                        ${p.name}
                    </div>
                    <div class="kpi-value" style="font-size:22px;">
                        ${Formatters.formatPercent(p.revenueContribution)}
                    </div>
                    <div class="kpi-sub">
                        of revenue &nbsp;·&nbsp;
                        Launched ${Formatters.formatPeriod(p.launchDate)}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="card" style="margin-bottom:20px;">
                <div class="card-header">
                    <span class="card-title">Product Portfolio</span>
                </div>
                <div class="card-body">
                    <div class="kpi-grid">${cards}</div>
                </div>
            </div>
        `;
    },

    renderClientsAndGeo(): string {
        let clients = [...CompanyData.clients];

        if (AppState.selectedIndustry !== 'all') {
            clients = clients.filter(c => c.industry === AppState.selectedIndustry);
        }
        if (AppState.searchTerm) {
            const term = AppState.searchTerm;
            clients = clients.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.industry.toLowerCase().includes(term)
            );
        }

        const columns: TableColumn<Client>[] = [
            {
                field: 'name',
                label: 'Client Name',
                formatter: (val, row) => `
                    <span style="font-weight:600;color:var(--navy-800);">
                        ${val}
                    </span>
                    ${row.isNew
                        ? '<span class="badge badge-new" style="margin-left:6px;">New</span>'
                        : ''}
                `,
            },
            { field: 'industry', label: 'Industry' },
            { field: 'since',    label: 'Client Since' },
            {
                field: 'annualRevenue',
                label: 'Annual Revenue',
                align: 'right',
                formatter: val => Formatters.formatCurrency(val as number),
            },
            {
                field: 'relationship',
                label: 'Relationship',
                formatter: val => {
                    const v   = val as string;
                    const cls = v === 'Strategic'   ? 'badge-key'
                              : v === 'New'         ? 'badge-new'
                              : v === 'Key Account' ? 'badge-growth'
                              :                       'badge-mature';
                    return `<span class="badge ${cls}">${v}</span>`;
                },
            },
        ];

        const tableHTML = TableComponent.create(clients, columns, {
            title: `Client Portfolio (${clients.length} showing)`,
            id:    'clients-table',
        });

        return `
            <div class="grid-2-1">
                <div>${tableHTML}</div>
                <div>${this.renderGeography()}</div>
            </div>
        `;
    },

    renderGeography(): string {
        const geo    = CompanyData.salesByGeography;
        const colors = ['#00d4ff', '#00e676'];
        const exp    = geo.find(g => g.region === 'Export');

        const countryRows = exp?.breakdown?.map(c => {
            const pct = ((c.revenue / (exp.revenue)) * 100).toFixed(0);
            return `
                <div style="display:flex;align-items:center;gap:10px;
                    padding:6px 0;border-bottom:1px solid var(--border);">
                    <div style="font-size:12px;color:var(--text-mid);flex:1;">
                        ${c.country}
                    </div>
                    <div style="width:80px;height:5px;background:var(--border);
                        border-radius:3px;overflow:hidden;">
                        <div style="width:${pct}%;height:100%;
                            background:var(--blue-400);border-radius:3px;"></div>
                    </div>
                    <div style="font-family:var(--mono);font-size:11px;
                        font-weight:700;min-width:52px;text-align:right;">
                        ${Formatters.formatCurrency(c.revenue)}
                    </div>
                </div>
            `;
        }).join('') ?? '';

        const legendItems = geo.map((g, i) => `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;">
                <div style="width:10px;height:10px;border-radius:2px;
                    background:${colors[i]};flex-shrink:0;"></div>
                <span style="flex:1;font-size:12px;">${g.region}</span>
                <span style="font-family:var(--mono);font-size:12px;font-weight:700;">
                    ${Formatters.formatCurrency(g.revenue)}
                </span>
                <span style="font-size:11px;color:var(--text-soft);
                    min-width:40px;text-align:right;">
                    ${g.percentOfTotal.toFixed(1)}%
                </span>
            </div>
        `).join('');

        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Revenue by Geography</span>
                </div>
                <div class="card-body">
                    ${legendItems}
                    <div style="margin-top:16px;padding-top:16px;
                        border-top:1px solid var(--border);">
                        <div style="font-size:10px;font-weight:700;
                            text-transform:uppercase;letter-spacing:0.5px;
                            color:var(--text-soft);margin-bottom:10px;">
                            Export Breakdown
                        </div>
                        ${countryRows}
                    </div>
                </div>
            </div>
        `;
    },
};

window.BusinessOverview = BusinessOverview;