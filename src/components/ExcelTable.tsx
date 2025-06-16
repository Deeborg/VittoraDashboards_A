import React from "react";
import ReactMarkdown from "react-markdown";

interface DataPorts {
  EXdata: Record<string, any>[]; // Array of objects
  EXdata1: Record<string, any>[]; // Array of objects
  visibleColumns: string[]; // Columns to be displayed
  category: string; // Columns to be displayed

}

const ExcelTable: React.FC<DataPorts> = ({ EXdata,EXdata1, visibleColumns,category }) => {
  return (
    <>
    <h1>{category}</h1>
    <div style={{ padding: "10px", display:'flex',backgroundColor:"white",borderRadius:"10px",border:"2px solid black" }}>
      

      <table style={{ width: "15%", borderCollapse: "collapse", border:"2px",borderColor:"black"}}>

      <thead>
          <tr>
            {EXdata1.length > 0 &&
              Object.keys(EXdata1[0]).map((key) => (
                <th key={key} style={{ padding: "8px", backgroundColor: "#f2f2f2" }}>
                  {key}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
        {EXdata1.map((row, index) => (
            <tr key={index}>
              {Object.entries(row).map(([key, value], i) => (
                <td key={i} style={{ padding: "8px", textAlign: "left",verticalAlign: "top"  }}>
                  
                  {row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

      </table>






      <table style={{ width: "70%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {EXdata.length > 0 &&
              visibleColumns.map((key) => (
                <th key={key} style={{ padding: "8px", backgroundColor: "#f2f2f2" }}>
                  {key}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {EXdata.map((row, index) => (
            <tr key={index}>
              {visibleColumns.map((key, i) => (
                <td key={i} style={{ padding: "8px", textAlign: "left" ,verticalAlign: "top" }}>
                  {key === "Flux Analysis" ? (
                    <ReactMarkdown>{String(row[key]).replace(/\n/g, "  \n")}</ReactMarkdown>
                  ) : (
                    String(row[key])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
};

export default ExcelTable;
