/* ============================================
   FILTER CONTROLLER
   investor-dashboard/src/components/filters.ts
   ============================================ */

import { AppState }   from '../app';
import { Navigation } from './navigation';

export const Filters = {

    init(): void {
        const yearEl     = document.getElementById('year-filter')     as HTMLSelectElement | null;
        const quarterEl  = document.getElementById('quarter-filter')  as HTMLSelectElement | null;
        const industryEl = document.getElementById('industry-filter') as HTMLSelectElement | null;
        const searchEl   = document.getElementById('global-search')   as HTMLInputElement  | null;

        yearEl?.addEventListener('change', () => {
            AppState.selectedYear = parseInt(yearEl.value, 10);
            this.updatePeriodBadge();
            this.refresh();
        });

        quarterEl?.addEventListener('change', () => {
            AppState.selectedQuarter = quarterEl.value;
            this.updatePeriodBadge();
            this.refresh();
        });

        industryEl?.addEventListener('change', () => {
            AppState.selectedIndustry = industryEl.value;
            this.refresh();
        });

        // Debounce: waits 300ms after user stops typing
        let debounceTimer: ReturnType<typeof setTimeout>;
        searchEl?.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                AppState.searchTerm = searchEl.value.toLowerCase().trim();
                this.refresh();
            }, 300);
        });
    },

    updatePeriodBadge(): void {
        const text     = `${AppState.selectedQuarter} ${AppState.selectedYear}`;
        const badge    = document.getElementById('header-period');
        const sidebar  = document.getElementById('sidebar-period');
        if (badge)   badge.textContent   = text;
        if (sidebar) sidebar.textContent = text;
    },

    refresh(): void {
        Navigation.refresh();
    },

    getCurrentPeriod(): string {
        return `${AppState.selectedYear}-${AppState.selectedQuarter}`;
    },
};

// Register on window
window.Filters = Filters;