/* ============================================
   TABLE COMPONENT
   investor-dashboard/src/components/tables.ts
   ============================================
   
   FIX: Changed generic constraint from
     T extends Record<string, unknown>
   to
     T extends object
   
   This allows typed interfaces (Client, ProductSales,
   IndustrySales etc.) to be passed directly without
   TypeScript complaining about missing index signatures.
============================================ */

import type { TableColumn } from '../types/index';

export const TableComponent = {

    create<T extends object>(
        data:    T[],
        columns: TableColumn<T>[],
        options: { title?: string; id?: string } = {}
    ): string {
        const tableId = options.id ?? `tbl-${Date.now()}`;
        const title   = options.title ?? '';

        // Build header row
        const headerCells = columns.map(col => {
            const alignCls    = col.align === 'right' ? 'num' : '';
            const sortableCls = col.sortable !== false ? 'sortable' : '';
            return `
                <th class="${alignCls} ${sortableCls}"
                    data-field="${String(col.field)}">
                    ${col.label}
                </th>
            `;
        }).join('');

        // Build body rows
        const bodyRows = data.length === 0
            ? `<tr>
                <td colspan="${columns.length}"
                    style="text-align:center;padding:24px;
                    color:var(--text-soft);">
                    No results found
                </td>
               </tr>`
            : data.map(row => {
                const cells = columns.map(col => {
                    // Access value safely with type assertion
                    const raw       = (row as Record<string, unknown>)[col.field as string];
                    const formatted = col.formatter
                        ? col.formatter(raw, row)
                        : String(raw ?? '');
                    const cls = col.align === 'right' ? 'num' : '';
                    return `<td class="${cls}">${formatted}</td>`;
                }).join('');
                return `<tr>${cells}</tr>`;
            }).join('');

        return `
            <div class="card">
                ${title ? `
                    <div class="card-header">
                        <span class="card-title">${title}</span>
                        <button class="tbl-btn"
                            onclick="window.TableComponent.exportCSV(
                                '${tableId}',
                                '${title.replace(/'/g, "\\'")}')">
                            Export CSV
                        </button>
                    </div>
                ` : ''}
                <div class="tbl-wrap">
                    <table class="data-tbl" id="${tableId}">
                        <thead><tr>${headerCells}</tr></thead>
                        <tbody>${bodyRows}</tbody>
                    </table>
                </div>
            </div>
        `;
    },

    exportCSV(tableId: string, filename: string = 'export'): void {
        const table = document.getElementById(tableId) as HTMLTableElement | null;
        if (!table) {
            console.warn(`TableComponent.exportCSV: table #${tableId} not found`);
            return;
        }

        const rows = Array.from(table.querySelectorAll('tr'));
        const csv  = rows.map(row => {
            const cells = Array.from(row.querySelectorAll('th, td'));
            return cells
                .map(cell =>
                    `"${(cell.textContent ?? '').replace(/"/g, '""').trim()}"`)
                .join(',');
        });

        const blob   = new Blob([csv.join('\n')], { type: 'text/csv' });
        const url    = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href     = url;
        anchor.download = `${filename.replace(/\s+/g, '_').toLowerCase()}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    },
};

// Register on window
window.TableComponent = TableComponent;