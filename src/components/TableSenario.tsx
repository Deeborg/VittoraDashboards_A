import React, { useState } from "react";

interface TableComponentProps {
  data: Array<Record<string, any>>; // Array of dynamic objects
  visibleColumns: string[]; // List of column names to display
}

const TableComponent: React.FC<TableComponentProps> = ({ data, visibleColumns }) => {
  const [rowsPerPage, setRowsPerPage] = useState<number>(50); // Default rows per page
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedData = data.slice(startIdx, endIdx);

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div style={{
      overflow: "auto", 
      maxHeight: "600px",
      width: "100%",
      // border: "5px solid #ddd,
    }}>
      {/* Rows per page selector */}
      <div style={{ marginBottom: "10px", width:"100%", }}>
        <label>
          
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            <option value={50}>Rows per page : 50</option>
            <option value={100}>Rows per page : 100</option>
            <option value={200}>Rows per page : 200</option>
            <option value={500}>Rows per page : 500</option>
          </select>
        </label>
      </div>

      {/* Scrollable table */}
      {/* <div
        style={{
          // overflowX: "auto", 
          overflow: "auto", 
          // overflowX:'hidden',
          maxHeight: "550px",
          width: "100%",
          
          border: "1px solid #ddd",
        }}
      > */}
        <table style={{ border: "2px solid #0f0f0f", width: "100%", borderCollapse: "collapse" }} >
          <thead >
                         
              {visibleColumns.map((key) => (
                <th key={key} style={{ border: "2px solid #0f0f0f", borderCollapse: "collapse" }}>
                  {key}
                </th>
              ))}
            
          </thead>
          <tbody >
            {paginatedData.map((row, index) => (
              <tr key={index} >
                {visibleColumns.map((key, idx) => (
                  <td key={idx} style={{ border: "2px solid #0f0f0f", borderCollapse: "collapse" }}>
                    {typeof row[key] === 'object' && row[key] instanceof Date ? row[key].toISOString() : row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      {/* </div> */}

      {/* Pagination controls */}
      <div style={{ marginTop: "2px", display: "flex",justifyContent: "space-between" }}>
        <button
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}
          style={{
            // padding: "5px 10px",
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
            // padding: "5px 10px",
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
