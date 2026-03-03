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
    revenue: number | null,
    revGrowth: any,
    newCount: number
): string {
    const geo = CompanyData.salesByGeography;
    const exportShare = geo.find(g => g.region === 'Export')?.percentOfTotal ?? 0;
    const newContractVal = CompanyData.newClients2024.reduce((s, c) => s + c.initialContract, 0);

    return `
        <div class="kpi-grid">
            <!-- Total Revenue -->
            <div class="kpi-card accent-blue">
                <div class="kpi-label">Total Revenue</div>
                <div class="kpi-value">$159.2M</div>
                <div class="kpi-badge">+7.6% YOY</div>
            </div>

            <!-- Total Clients -->
            <div class="kpi-card">
                <div class="kpi-label">Total Clients</div>
                <div class="kpi-value">8</div>
                <div class="kpi-sub">Active accounts</div>
            </div>

            <!-- New Clients -->
            <div class="kpi-card accent-green">
                <div class="kpi-label">New Clients (2024)</div>
                <div class="kpi-value">${newCount}</div>
                <div class="kpi-sub">$${(newContractVal / 1e6).toFixed(1)}M new value</div>
            </div>

            <!-- Export Share -->
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
                <div class="kpi-card product-card">
                    <div style="display:flex; justify-content:space-between; width:100%;">
                        <span class="badge ${badgeCls}">${p.status}</span>
                        <span class="badge badge-mature">${p.category}</span>
                    </div>
                    <div class="product-name">${p.name}</div>
                    <div class="kpi-value" style="font-size: 24px; margin-bottom: 4px;">
                        ${Formatters.formatPercent(p.revenueContribution)}
                    </div>
                    <div class="kpi-sub" style="font-size: 10px;">
                        of revenue · Launched ${Formatters.formatPeriod(p.launchDate)}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Product Portfolio</span>
                </div>
                <div class="card-body">
                    <div class="product-grid">${cards}</div>
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
        const geo = CompanyData.salesByGeography;
        const exp = geo.find(g => g.region === 'Export');

        const countryRows = exp?.breakdown?.map(c => {
            const pct = ((c.revenue / (exp.revenue)) * 100);
            return `
                <div class="geo-row">
                    <span class="geo-label" style="color: #8b9aac">${c.country}</span>
                    <div class="geo-track">
                        <div class="geo-fill" style="width: ${pct}%"></div>
                    </div>
                    <span class="geo-value">$${(c.revenue / 1e6).toFixed(1)}M</span>
                </div>
            `;
        }).join('') ?? '';

        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Revenue by Geography</span>
                </div>
                <div class="card-body">
                    <!-- Domestic Row -->
                    <div class="geo-row">
                        <span class="geo-label"><span class="geo-dot" style="background: var(--cyan)"></span>Domestic</span>
                        <span class="geo-value">$108.7M <small style="color:var(--text-soft)">69.7%</small></span>
                    </div>
                    <!-- Export Row -->
                    <div class="geo-row">
                        <span class="geo-label"><span class="geo-dot" style="background: var(--green)"></span>Export</span>
                        <span class="geo-value">$47.3M <small style="color:var(--text-soft)">30.4%</small></span>
                    </div>

                    <div class="geo-sub-header">Export Breakdown</div>
                    <div class="geo-breakdown-container">
                        ${countryRows}
                    </div>
                </div>
            </div>
        `;
    },
};

window.BusinessOverview = BusinessOverview;