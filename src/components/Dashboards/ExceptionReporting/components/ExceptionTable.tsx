import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFilter } from '../contexts/FilterContext';

interface ExceptionTableProps { maxRows?: number; }

export default function ExceptionTable({ maxRows }: ExceptionTableProps) {
    const { filteredData } = useFilter();

    // Limit rows for overview
    const displayData = maxRows ? filteredData.slice(0, maxRows) : filteredData;

    return (
        <motion.div 
            className="ed-table-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="ed-table-header">
                <span className="ed-section-title" style={{marginBottom: 0}}>Exception Details</span>
                <span className="ed-badge badge-medium">{displayData.length} Records</span>
            </div>

            <div className="ed-table-container">
                <table className="ed-table">
                    <thead>
                        <tr>
                            <th className="ed-th">Category</th>
                            <th className="ed-th">Dept</th>
                            <th className="ed-th">Owner</th>
                            <th className="ed-th">Severity</th>
                            <th className="ed-th">Status</th>
                            <th className="ed-th">Amount</th>
                            <th className="ed-th">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((row, i) => (
                            <tr key={i} className="ed-tr">
                                <td className="ed-td" style={{fontWeight: 600}}>{row.category}</td>
                                <td className="ed-td">{row.department}</td>
                                <td className="ed-td">
                                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <div className="ed-user-avatar">{row.owner.charAt(0)}</div>
                                        {row.owner}
                                    </div>
                                </td>
                                <td className="ed-td">
                                    <span className={`ed-badge badge-${row.severity}`}>{row.severity}</span>
                                </td>
                                <td className="ed-td">{row.status}</td>
                                <td className="ed-td" style={{fontWeight: 700}}>${row.amount.toLocaleString()}</td>
                                <td className="ed-td" style={{color:'#94a3b8', fontSize: '0.75rem'}}>{row.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}