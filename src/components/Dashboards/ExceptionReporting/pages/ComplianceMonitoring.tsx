import { useMemo } from 'react';
import { motion } from 'framer-motion';
import KpiCard from '../components/KpiCard';
import ComplianceHeatmap from '../charts/ComplianceHeatmap';
import ExceptionTable from '../components/ExceptionTable';
import { useFilter } from '../contexts/FilterContext';
import { getCategoryKpis } from '../services/dataService';

export default function ComplianceMonitoring() {
    const { filteredData } = useFilter();
    // Getting KPIs specifically for this section
    const kpis = useMemo(() => getCategoryKpis(filteredData, 'Compliance'), [filteredData]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="exception-dashboard-content"
        >
            {/* 1. SECTION HEADER */}
            <div className="ed-section-header" style={{ marginTop: 0 }}>
                <div className="ed-section-bar"></div>
                <span className="ed-section-title">Critical Compliance Stream</span>
            </div>

            {/* 2. KPI GRID (Lined up 6 in a row) */}
            <div className="ed-kpi-row">
                {kpis.map((kpi, i) => (
                    <KpiCard key={kpi.label} kpi={kpi} index={i} />
                ))}
            </div>

            {/* 3. RISK HEATMAP IN DISTINCT CONTAINER */}
            <div className="ed-card-container">
                <div className="ed-card-header">
                    <span className="ed-card-title">Risk Concentration Heatmap</span>
                    <span className="ed-card-meta">By Department vs Category</span>
                </div>
                <div className="ed-card-body">
                    <ComplianceHeatmap />
                </div>
            </div>

            {/* 4. EXCEPTION LISTING */}
            <div className="ed-section-header">
                <div className="ed-section-bar" style={{ background: '#3b82f6' }}></div>
                <span className="ed-section-title">Detailed Audit Trail</span>
            </div>
            <ExceptionTable maxRows={20} />
        </motion.div>
    );
}
