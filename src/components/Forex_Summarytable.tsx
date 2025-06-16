import React from 'react';

interface SummaryTableProps {
  data: any[];
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data }) => {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const totals: any = {};
  const numericCols = columns.filter(col =>
    data.some(row => !isNaN(parseFloat(row[col])) && isFinite(row[col]))
  );

  columns.forEach(col => {
    if (numericCols.includes(col)) {
      totals[col] = data.reduce((sum, row) => sum + parseFloat(row[col] || 0), 0);
    } else {
      totals[col] = col === 'Date' ? 'Total' : '';
    }
  });

//   const renderColGroup = () => (
//     <colgroup>
//       {columns.map((_, index) => (
//         <col key={index} style={{ width: `${100 / columns.length}%` }} />
//       ))}
//     </colgroup>
//   );

//   const containerStyle: React.CSSProperties = {
//     width: '100%',
//     maxHeight: '500px',
//     border: '1px solid #ccc',
//     overflow: 'hidden',
//     display: 'flex',
//     flexDirection: 'column',
//     fontFamily: 'Arial, sans-serif',
//     fontSize: '14px',
//     marginTop: '30px',
//   };

//   const tableStyle: React.CSSProperties = {
//     width: '100%',
//     borderCollapse: 'collapse',
//     tableLayout: 'fixed',
//   };

//   const cellStyle: React.CSSProperties = {
//     border: '1px solid #ddd',
//     padding: '8px',
//     textAlign: 'center',
//     zIndex: 2,
//   };

//   const headerStyle: React.CSSProperties = {
//     ...cellStyle,
//     position: 'sticky',
//     top: 0,
//     zIndex: 2,
//   };

//   const footerStyle: React.CSSProperties = {
//     ...cellStyle,
//     fontWeight: 'bold',
//     position: 'sticky',
//     bottom: 0,
//     zIndex: 2,
//   };

//   const scrollContainerStyle: React.CSSProperties = {
//     overflowY: 'auto',
//     flex: 1,
//   };

  return (
    <div style={styles.container}>
      <div style={styles.scrollContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              {columns.map(col => (
                <th key={col} style={styles.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                {columns.map(col => (
                  <td key={col} style={styles.td}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              {columns.map(col => (
                <td key={col} style={styles.footer}>
                  {typeof totals[col] === 'number' ? totals[col].toFixed(2) : totals[col]}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '99%',
    maxHeight: '500px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff',
    color: '#000000',
    overflow: 'hidden',
    marginTop: '10px',
    marginLeft:'10px'
    // border: '1px solid #ccc',
    // overflow: 'hidden',
    // display: 'flex',
    // flexDirection: 'column',
    // fontFamily: 'Arial, sans-serif',
    // fontSize: '14px',
    // marginTop: '30px',
    },
    scrollContainer: {
        overflowY: 'auto',
        overflowX: 'auto',
        flex: 1,
        maxHeight: '500px',
        width: '100%',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'Segoe UI, sans-serif',
    fontSize: '13px',
    // tableLayout: 'auto',
    // minWidth: '1000px',
        tableLayout: 'fixed',
    },
    thead: {
        backgroundColor: '#f4f4f4',
    color: '#000000',
    position: 'sticky',
    top: 0,
    zIndex: 5,
    lineHeight: '1.4',
    },
    th: {
        // border: '1px solid #ddd',
        // padding: '8px',
        // textAlign: 'center',
        // position: 'sticky',
        // top: 0,
        // zIndex: 2,
    padding: '10px',
    textAlign: 'center',
    borderBottom: '1px solid #eee',
    // whiteSpace: 'nowrap',
    whiteSpace: 'normal',            // Allow wrapping
  wordWrap: 'break-word',          // Break long words
  maxWidth: '150px',               // Optional: Limit column width
  overflowWrap: 'break-word',
  fontWeight: 600,
  fontSize: '13px',
    },
    td: {
        // border: '1px solid #eee',
        // padding: '10px',
        // textAlign: 'center',
        padding: '10px',
    textAlign: 'center',
    borderBottom: '1px solid #333',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.3s ease',
    },
    rowEven: {
        backgroundColor: '#ffffff',
        transition: 'background-color 0.3s ease',
  cursor: 'pointer',
    },
    rowOdd: {
        backgroundColor: '#f9f9f9',
        transition: 'background-color 0.3s ease',
  cursor: 'pointer',
    },
    hoveredRow: {
  backgroundColor: '#e6f2ff',
},
    footer: {
        // borderTop: '2px solid #ddd',
        // fontWeight: 'bold',
        // textAlign: 'center',
    padding: '10px',
    fontWeight: 'bold',
    backgroundColor: '#f1f1f1',
    borderTop: '2px solid #ccc',
    textAlign: 'center',
    position: 'sticky',
    bottom: 0,
    zIndex: 4,
    whiteSpace: 'nowrap',
    },
    };
    

export default SummaryTable;
