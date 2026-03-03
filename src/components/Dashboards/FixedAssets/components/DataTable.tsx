import React from "react";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  format?: (value: any, row?: any) => string | number;
  className?: string;
}

interface DataTableProps {
  columns: TableColumn[];
  data: any[];
}

const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
  return (
    <div className="fa-table-wrapper">
      <table className="fa-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ textAlign: col.align || "left" }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => {
                const rawValue = row[col.key];

                const formattedValue = col.format
                  ? col.format(rawValue, row)
                  : rawValue;

                return (
                  <td
                    key={col.key}
                    className={col.className || ""}
                    style={{ textAlign: col.align || "left" }}
                    dangerouslySetInnerHTML={{
                      __html: String(formattedValue ?? ""),
                    }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;