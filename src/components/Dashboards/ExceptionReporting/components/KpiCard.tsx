import { motion } from 'framer-motion';
import type { KpiData } from '../services/dataService';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi';

interface KpiCardProps {
    kpi: KpiData;
    index: number;
    onClick?: () => void;
}

export default function KpiCard({ kpi, index, onClick }: KpiCardProps) {
    // Map severity to our CSS accent classes
    const accentClass = 
        kpi.severity === 'critical' ? 'accent-red' :
        kpi.severity === 'high' ? 'accent-amber' :
        kpi.severity === 'medium' ? 'accent-blue' : 'accent-emerald';

    const trendClass = kpi.change < 0 ? 'trend-good' : 'trend-bad'; // Negative change usually good in risk
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className={`ed-card ${accentClass}`}
        >
            <div>
                <div className="ed-card-label">{kpi.label}</div>
                <div style={{display:'flex', alignItems:'baseline', gap:'10px'}}>
                    <span className="ed-metric-val">{kpi.value}</span>
                    <span className={`ed-trend-badge ${trendClass}`}>
                        {kpi.change < 0 ? <HiArrowDown /> : <HiArrowUp />}
                        {Math.abs(kpi.change)}%
                    </span>
                </div>
            </div>
            
            <div className="ed-card-desc">{kpi.description}</div>
            
            <div style={{marginTop:'10px'}}>
                <span className={`ed-badge badge-${kpi.severity}`}>
                    {kpi.severity}
                </span>
            </div>
        </motion.div>
    );
}