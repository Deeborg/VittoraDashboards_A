/**
 * TABLECONFIGURATIONS.TS
 * 
 * Table configurations for each section.
 * Defines columns, formatting, and styling for:
 * - Asset Register
 * - CWIP Register
 * - Reconciliation Table
 */

import { TableColumn } from './DataTable';
import { Asset } from '../models/Asset';
import { CWIP } from '../models/CWIP';
import { ReconciliationItem } from '../models/Reconciliation';

/**
 * Format currency (Indian Rupees)
 */
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format large numbers in Crores/Lakhs
 */
function formatLargeNumber(amount: number): string {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)}L`;
    } else {
        return formatCurrency(amount);
    }
}

/* ========================================
   ASSET TABLE CONFIGURATION
   ======================================== */

export function getAssetTableColumns(): TableColumn[] {
    return [
        {
            key: 'id',
            label: 'Asset ID',
            sortable: true,
            align: 'left'
        },
        {
            key: 'name',
            label: 'Asset Name',
            sortable: true,
            align: 'left'
        },
        {
            key: 'category',
            label: 'Category',
            sortable: true,
            align: 'left'
        },
        {
            key: 'vendor',
            label: 'Vendor',
            sortable: true,
            align: 'left',
            format: (value: string) => value || '—'
        },
        {
            key: 'purchaseDate',
            label: 'Purchase Date',
            sortable: true,
            align: 'left',
            format: formatDate
        },
        {
            key: 'grossValue',
            label: 'Gross Value',
            sortable: true,
            align: 'right',
            format: formatLargeNumber,
            className: 'table__cell--numeric'
        },
        {
            key: 'accumulatedDepreciation',
            label: 'Accumulated Dep.',
            sortable: true,
            align: 'right',
            format: formatLargeNumber,
            className: 'table__cell--numeric'
        },
        {
            key: 'netValue',
            label: 'Net Value',
            sortable: true,
            align: 'right',
            format: formatLargeNumber,
            className: 'table__cell--numeric'
        },
        {
            key: 'location',
            label: 'Location',
            sortable: true,
            align: 'left'
        }
    ];
}

/**
 * Row styling for assets with missing data
 */
export function getAssetRowClassName(asset: Asset): string {
    if (!asset.vendor || asset.vendor === '') {
        return 'table__row--highlighted';
    }
    return '';
}

/* ========================================
   CWIP TABLE CONFIGURATION
   ======================================== */

export function getCWIPTableColumns(): TableColumn[] {
    return [
        {
            key: 'id',
            label: 'Project ID',
            sortable: true,
            align: 'left'
        },
        {
            key: 'projectName',
            label: 'Project Name',
            sortable: true,
            align: 'left'
        },
        {
            key: 'startDate',
            label: 'Start Date',
            sortable: true,
            align: 'left',
            format: formatDate
        },
        {
            key: 'amountSpent',
            label: 'Amount Spent',
            sortable: true,
            align: 'right',
            format: formatLargeNumber,
            className: 'table__cell--numeric'
        },
        {
            key: 'ageingDays',
            label: 'Days Old',
            sortable: true,
            align: 'right',
            className: 'table__cell--numeric'
        },
        {
            key: 'ageingBucket',
            label: 'Ageing Bucket',
            sortable: true,
            align: 'center',
            format: (value: string) => {
                // Add badge styling
                const badgeClass = value === '>365 days' ? 'badge--danger' : 
                                   value === '181-365 days' ? 'badge--warning' : 'badge--success';
                return `<span class="badge ${badgeClass}">${value}</span>`;
            }
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            align: 'center',
            format: (value: string) => {
                const badgeClass = value === 'Active' ? 'badge--success' : 
                                   value === 'On Hold' ? 'badge--warning' : 'badge--neutral';
                return `<span class="badge ${badgeClass}">${value}</span>`;
            }
        }
    ];
}

/**
 * Row styling for aged CWIP projects
 */
export function getCWIPRowClassName(project: CWIP): string {
    if (project.ageingDays > 365) {
        return 'table__row--highlighted';
    }
    return '';
}

/* ========================================
   RECONCILIATION TABLE CONFIGURATION
   ======================================== */

export function getReconciliationTableColumns(): TableColumn[] {
    return [
        {
            key: 'assetId',
            label: 'Asset ID',
            sortable: true,
            align: 'left'
        },
        {
            key: 'assetName',
            label: 'Asset Name',
            sortable: true,
            align: 'left'
        },
        {
            key: 'systemDepreciation',
            label: 'System Depreciation',
            sortable: true,
            align: 'right',
            format: formatCurrency,
            className: 'table__cell--numeric'
        },
        {
            key: 'glDepreciation',
            label: 'GL Depreciation',
            sortable: true,
            align: 'right',
            format: formatCurrency,
            className: 'table__cell--numeric'
        },
        {
            key: 'difference',
            label: 'Difference',
            sortable: true,
            align: 'right',
            format: (value: number) => {
                const formatted = formatCurrency(value);
                if (value === 0) return formatted;
                return `<span class="${value > 0 ? 'text-success' : 'text-danger'}">${formatted}</span>`;
            },
            className: 'table__cell--numeric'
        },
        {
            key: 'differencePercent',
            label: 'Variance %',
            sortable: true,
            align: 'right',
            format: (value: number) => {
                const formatted = `${value.toFixed(1)}%`;
                if (value === 0) return formatted;
                return `<span class="${Math.abs(value) < 5 ? 'text-warning' : 'text-danger'}">${formatted}</span>`;
            },
            className: 'table__cell--numeric'
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            align: 'center',
            format: (value: string) => {
                let badgeClass = 'badge--neutral';
                let dotClass = 'status-dot--success';
                
                if (value === 'Matched') {
                    badgeClass = 'badge--success';
                    dotClass = 'status-dot--success';
                } else if (value === 'Minor Variance') {
                    badgeClass = 'badge--warning';
                    dotClass = 'status-dot--warning';
                } else if (value === 'Investigate') {
                    badgeClass = 'badge--danger';
                    dotClass = 'status-dot--danger';
                } else if (value === 'Informational') {
                    badgeClass = 'badge--info';
                    dotClass = 'status-dot--success';
                }
                
                return `
                    <span class="badge ${badgeClass}">
                        <span class="status-dot ${dotClass}"></span>
                        ${value}
                    </span>
                `;
            }
        },
        {
            key: 'statusReason',
            label: 'Reason',
            sortable: false,
            align: 'left',
            format: (value: string) => {
                // Truncate long reasons for display, full text in title
                const truncated = value.length > 60 ? value.substring(0, 57) + '...' : value;
                return `<span title="${value}" style="cursor: help; text-decoration: dotted underline;">${truncated}</span>`;
            }
        }
    ];
}

/**
 * Row styling for reconciliation items
 */
export function getReconciliationRowClassName(item: ReconciliationItem): string {
    if (item.status === 'Investigate') {
        return 'table__row--highlighted';
    }
    return '';
}