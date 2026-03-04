import { motion } from 'framer-motion';
import type { KpiData } from '../services/dataService';
import { useFilter } from '../contexts/FilterContext';
import { HiX, HiOutlineChartBar } from 'react-icons/hi';

interface DrillDownPanelProps {
    kpi: KpiData;
    onClose: () => void;
}

export default function DrillDownPanel({ kpi, onClose }: DrillDownPanelProps) {
    const { filteredData } = useFilter();

    // Filter data specifically for this KPI
    const relevantRecords = filteredData
        .filter(r => {
            if (kpi.label.includes('Compliance')) return r.category === 'Compliance Violation';
            if (kpi.label.includes('Negative Stock')) return r.category === 'Negative Stock';
            if (kpi.label.includes('GR/IR')) return r.category === 'GR/IR Mismatch';
            if (kpi.label.includes('Forex')) return r.category === 'Forex Hedge Gap';
            if (kpi.label.includes('Debt')) return r.category === 'Short-Term Debt';
            return false;
        })
        .slice(0, 5); // Show top 5

    return (
        <>
            {/* 1. BLUR BACKDROP */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="ed-drill-backdrop"
            />

            {/* 2. SIDE PANEL */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="ed-drill-panel"
            >
                {/* Header */}
                <div className="ed-drill-header">
                    <div className="ed-header-info">
                        <h3>{kpi.label}</h3>
                        <p>{kpi.description}</p>
                    </div>
                    <button onClick={onClose} className="ed-close-btn"><HiX size={20} /></button>
                </div>

                {/* Summary Metrics Row */}
                <div className="ed-drill-metrics">
                    <div className="ed-metric-box">
                        <span className="val">{kpi.value}</span>
                        <span className="lbl">COUNT</span>
                    </div>
                    <div className="ed-metric-box">
                        <span className={`val severity-${kpi.severity}`}>{kpi.severity}</span>
                        <span className="lbl">SEVERITY</span>
                    </div>
                    <div className="ed-metric-box">
                        <span className={`val ${kpi.change > 0 ? 'text-red' : 'text-green'}`}>
                            {kpi.change > 0 ? '+' : ''}{kpi.change}%
                        </span>
                        <span className="lbl">24H TREND</span>
                    </div>
                </div>

                {/* Exception List Section */}
                <div className="ed-drill-content">
                    <div className="ed-content-title">
                        <HiOutlineChartBar size={18} />
                        <span>TOP PRIORITY EXCEPTIONS</span>
                    </div>

                    <div className="ed-exception-list">
                        {relevantRecords.map((record) => (
                            <div key={record.id} className="ed-exception-item">
                                <div className="item-header">
                                    <span className="item-desc">{record.description}</span>
                                    <span className={`ed-badge badge-${record.severity}`}>{record.severity}</span>
                                </div>
                                <div className="item-footer">
                                    <span className="item-dept">{record.department}</span>
                                    <span className="dot">•</span>
                                    <span className="item-owner">{record.owner}</span>
                                    <span className="item-amount">${record.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Action */}
                <div className="ed-drill-footer">
                    <button className="ed-full-report-btn">FULL FORENSIC REPORT</button>
                </div>
            </motion.div>
        </>
    );
}
