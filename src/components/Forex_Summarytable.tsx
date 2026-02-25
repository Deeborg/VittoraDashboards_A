import React from 'react';

interface SummaryTableProps {
  data: any[];
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  const formatCellValue = (val: any, colName: string) => {
    if (val === null || val === undefined || val === '') return '-';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'number') {
      if (colName.toLowerCase().includes('rate') || colName.toLowerCase().includes('price')) {
        return val.toFixed(2);
      }
      return val.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    }
    return String(val);
  };

  return (
    <div style={styles.container}>
      <div style={styles.scrollContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} style={styles.th}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} style={styles.row}>
                {columns.map(col => {
                  const val = row[col];
                  const isOutcome = col.toLowerCase().includes('outcome');
                  
                  let bg = 'inherit';
                  let textColor = '#000000'; // High contrast black text
                  
                  if (isOutcome) {
                    if (String(val).toLowerCase() === 'good') { bg = '#e8f5e9'; textColor = '#1b5e20'; }
                    if (String(val).toLowerCase() === 'bad') { bg = '#ffebee'; textColor = '#b71c1c'; }
                  }

                  return (
                    <td key={col} style={{
                      ...styles.td,
                      backgroundColor: bg,
                      color: textColor,
                      fontWeight: isOutcome ? 700 : 500,
                    }}>
                      {formatCellValue(val, col)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    marginTop: '20px',
    border: '2px solid #000000', // Solid outer border
  },
  scrollContainer: {
    overflowY: 'auto', // Vertical scroll
    overflowX: 'auto', // Horizontal scroll
    maxHeight: '500px', // Limits height and forces scroll
  },
  table: {
    width: '100%',
    borderCollapse: 'separate', // Necessary for sticky borders
    borderSpacing: 0,
    fontFamily: '"Segoe UI", Roboto, sans-serif',
  },
  th: {
    // STICKY HEADER LOGIC
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: '#000000', // Pure black background
    color: '#ffffff',           // White text
    
    padding: '16px 12px',
    textAlign: 'center',
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: '13px',
    letterSpacing: '1px',
    borderBottom: '2px solid #444',
    borderRight: '1px solid #333',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '14px 12px',
    textAlign: 'center',
    borderBottom: '1px solid #000000', // Black line between rows for clarity
    borderRight: '1px solid #f0f0f0',
    whiteSpace: 'normal',
    lineHeight: '1.4',
    fontSize: '14px',
    minWidth: '140px',
  },
  row: {
    backgroundColor: '#ffffff',
  },
};

export default SummaryTable;