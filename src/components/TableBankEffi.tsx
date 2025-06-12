import React, { useState } from "react";

interface TableComponentProps {
  data: Array<Record<string, any>>;
  visibleColumns: string[];               // Actual data keys
  visibleColumnNames: string[];           // Display names for the headers
}

const TableComponent: React.FC<TableComponentProps> = ({
  data,
  visibleColumns,
  visibleColumnNames,
}) => {
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedData = data.slice(startIdx, endIdx);

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div style={{ overflow: "auto", maxHeight: "600px", width: "100%" }}>
      {/* Rows per page selector */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            <option value={50}>Rows per page: 50</option>
            <option value={100}>Rows per page: 100</option>
            <option value={200}>Rows per page: 200</option>
            <option value={500}>Rows per page: 500</option>
          </select>
        </label>
      </div>

      {/* Table */}
      <table style={{ border: "2px solid #0f0f0f", width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {visibleColumnNames.map((header, index) => (
              <th key={index} style={{ border: "2px solid #0f0f0f", padding: "8px", background: "#f0f0f0" }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {visibleColumns.map((colKey, colIndex) => (
                <td key={colIndex} style={{ border: "2px solid #0f0f0f", padding: "8px" }}>
                  {typeof row[colKey] === 'object' && row[colKey] instanceof Date
                    ? row[colKey].toISOString()
                    : row[colKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}
          style={{
            padding: "5px 10px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange("next")}
          disabled={currentPage === totalPages}
          style={{
            padding: "5px 10px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableComponent;
