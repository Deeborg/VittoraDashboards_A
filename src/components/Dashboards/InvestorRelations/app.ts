/* ============================================
   MAIN APPLICATION CONTROLLER
   investor-dashboard/src/app.ts
   ============================================ */

import { CompanyData }    from './data/mockData';
import { Formatters }     from './utils/formatters';
import { Calculations }   from './utils/calculations';
import { Navigation }     from './components/navigation';
import { Filters }        from './components/filters';

// Import section renderers so webpack bundles them
// and they register themselves on window
import './sections/businessOverview';
import './sections/financialSummary';
import './sections/balanceSheet';
import './sections/operationalKPIs';

// Import components so they register on window
import { TableComponent } from './components/tables';
import { WaterfallChart } from './components/waterfallChart';

import type { DashboardState } from './types/index';

/* ============================================
   GLOBAL APPLICATION STATE
   ============================================
   Single source of truth for the entire dashboard.
   Every filter change updates this object.
   Every section render reads from this object.
*/
export const AppState: DashboardState = {
    currentSection:   'business-overview',
    selectedYear:     2024,
    selectedQuarter:  'Q4',
    selectedIndustry: 'all',
    searchTerm:       '',
};

/* ============================================
   REGISTER GLOBALS ON WINDOW
   ============================================
   Makes these available to inline HTML onclick
   handlers and section files that need them.
   
   TypeScript now knows about these via globals.d.ts
   so no more red squiggles.
*/
window.CompanyData    = CompanyData;
window.AppState       = AppState;
window.Formatters     = Formatters;
window.Calculations   = Calculations;
window.TableComponent = TableComponent;
window.WaterfallChart = WaterfallChart;

/* ============================================
   APPLICATION OBJECT
============================================ */
const App = {

    init(): void {
        console.log('🚀 Investor Relations Dashboard — TypeScript Edition');
        console.log(`Company: ${CompanyData.companyInfo.name}`);
        console.log(`Ticker:  ${CompanyData.companyInfo.ticker}`);

        try {
            Filters.init();
            console.log('✅ Filters initialized');

            Navigation.init();
            console.log('✅ Navigation initialized');

            this.setupExportButton();
            console.log('✅ Export button ready');

            console.log('✅ Dashboard ready');

        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showError(
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    },

    setupExportButton(): void {
        const btn = document.querySelector<HTMLButtonElement>('.export-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                const period = `${AppState.selectedQuarter} ${AppState.selectedYear}`;
                alert(
                    `Export Report — ${period}\n\n` +
                    `In production this generates a formatted PDF\n` +
                    `for board and investor distribution.\n\n` +
                    `Sections included:\n` +
                    `• Business Overview\n` +
                    `• Financial Summary\n` +
                    `• Balance Sheet\n` +
                    `• Operational KPIs`
                );
            });
        }
    },

    showError(message: string): void {
        const container = document.getElementById('content-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px;color:var(--text-soft);">
                    <div style="font-size:32px;margin-bottom:16px;">⚠️</div>
                    <div style="font-size:14px;font-weight:600;
                        color:var(--navy-800);margin-bottom:8px;">
                        Dashboard failed to load
                    </div>
                    <div style="font-size:12px;color:var(--red);">${message}</div>
                </div>
            `;
        }
    },
};

// Start when DOM is ready
export default App;