import { useMemo } from 'react';
import { motion } from 'framer-motion';
import KpiCard from '../components/KpiCard';
import AgeingStackedBar from '../charts/AgeingStackedBar';
import DepartmentBarChart from '../charts/DepartmentBarChart';
import ExceptionTable from '../components/ExceptionTable';
import { useFilter } from '../contexts/FilterContext';
import { getCategoryKpis } from '../services/dataService';

export default function InventoryRisk() {
    const { filteredData } = useFilter();
    const kpis = useMemo(() => getCategoryKpis(filteredData, 'Inventory'), [filteredData]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <h1 className="ed-page-title">Inventory Risk Distribution</h1>
            <p className="ed-page-subtitle">Stock exceptions, ageing analysis and warehouse risk stratification</p>

            {/* KPI Section: Using ed-auto-grid forces the single card to stretch */}
            <div className="ed-kpi-row">
                {kpis.map((kpi, i) => (
                    <KpiCard key={kpi.label} kpi={kpi} index={i} />
                ))}
            </div>

            {/* Charts Section: 50/50 Split */}
            <div className="ed-grid-2">
                <div className="ed-chart-card">
                    <div className="ed-chart-header">Ageing Analysis</div>
                    <AgeingStackedBar />
                </div>
                <div className="ed-chart-card">
                    <div className="ed-chart-header">Department Comparison</div>
                    <DepartmentBarChart />
                </div>
            </div>

            <ExceptionTable maxRows={20} />
        </motion.div>
    );
}