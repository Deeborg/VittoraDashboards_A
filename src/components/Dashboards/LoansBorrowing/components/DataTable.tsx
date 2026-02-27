import React, { ReactNode } from 'react';
import './DataTable.css';

interface Column<T = any> {
  key: string;
  header: string;
  render?: (value: any, row: T) => ReactNode;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  highlightRows?: (row: T) => boolean;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  title,
  highlightRows,
}: DataTableProps<T>) {
  return (
    <div className="section-content">
      {title && <h3>{title}</h3>}
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={highlightRows?.(row) ? 'highlight-row' : ''}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;