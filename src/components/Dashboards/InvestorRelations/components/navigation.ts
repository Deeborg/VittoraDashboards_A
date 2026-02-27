/* ============================================
   NAVIGATION CONTROLLER
   investor-dashboard/src/components/navigation.ts
   ============================================ */

import { AppState } from '../app';
import type { SectionName } from '../types/';

export const Navigation = {

    init(): void {
        const navItems = document.querySelectorAll<HTMLElement>('#navigation-container .nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e: Event) => {
                e.preventDefault();
                const section = item.getAttribute('data-section') as SectionName | null;
                if (section) {
                    this.switchSection(section);
                    this.setActiveNav(item);
                }
            });
        });

        // Load the initial section on page load
        this.switchSection(AppState.currentSection);
    },

    switchSection(sectionName: SectionName): void {
        AppState.currentSection = sectionName;

        const container = document.getElementById('content-container');
        if (!container) return;

        // Fade out animation
        container.style.opacity    = '0';
        container.style.transform  = 'translateY(4px)';
        container.style.transition = 'opacity 0.15s ease, transform 0.15s ease';

        setTimeout(() => {
            this.renderSection(sectionName, container);

            // Fade in animation
            requestAnimationFrame(() => {
                container.style.opacity   = '1';
                container.style.transform = 'translateY(0)';
            });
        }, 150);
    },

    renderSection(sectionName: SectionName, container: HTMLElement): void {
        // Map section names to window-registered renderer keys
        const rendererMap: Record<SectionName, keyof Window> = {
            'business-overview': 'BusinessOverview',
            'financial-summary': 'FinancialSummary',
            'balance-sheet':     'BalanceSheet',
            'operational-kpis':  'OperationalKPIs',
        };

        const key      = rendererMap[sectionName];
        const renderer = window[key] as { render: (c: HTMLElement) => void } | undefined;

        if (renderer && typeof renderer.render === 'function') {
            renderer.render(container);
        } else {
            container.innerHTML = `
                <div style="text-align:center;padding:60px;color:var(--text-soft);">
                    Section not found: ${sectionName}
                </div>
            `;
        }
    },

    setActiveNav(activeItem: HTMLElement): void {
        document.querySelectorAll<HTMLElement>('.nav-item')
            .forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    },

    // Called externally after filter changes
    refresh(): void {
        this.switchSection(AppState.currentSection);
    },
};

// Register on window
window.Navigation = Navigation;