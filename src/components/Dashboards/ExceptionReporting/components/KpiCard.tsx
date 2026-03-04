import { motion } from 'framer-motion';
import type { KpiData } from '../services/dataService';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi';

interface KpiCardProps {
    kpi: KpiData;
    index: number;
    onClick?: () => void;
}

export default function KpiCard({ kpi, index, onClick }: KpiCardProps) {
    // Determine classes based on severity
    const accentClass = 
        kpi.severity === 'critical' ? 'accent-red' :
        kpi.severity === 'high' ? 'accent-amber' :
        'accent-blue';

    const trendClass = kpi.change < 0 ? 'trend-good' : 'trend-bad'; 
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className={`ed-card ${accentClass}`}
        >
            {/* 1. The Red Notification Dot in the top right corner */}
            <div className="ed-card-dot" />

            <div className="ed-card-main-content">
                <div className="ed-card-label">{kpi.label}</div>
                
                <div className="ed-metric-row">
                    <span className="ed-metric-val">{kpi.value}</span>
                    <span className={`ed-trend-badge ${trendClass}`}>
                        {kpi.change < 0 ? <HiArrowDown /> : <HiArrowUp />}
                        {Math.abs(kpi.change)}%
                    </span>
                </div>

                <div className="ed-card-desc">{kpi.description}</div>
            </div>
            
            {/* 2. The Bottom Footer with Badge and View Details */}
            <div className="ed-card-footer">
                <span className={`ed-badge badge-${kpi.severity}`}>
                    {kpi.severity}
                </span>
                
                <span className="ed-view-details">
                    View Details →
                </span>
            </div>
        </motion.div>
    );
}
