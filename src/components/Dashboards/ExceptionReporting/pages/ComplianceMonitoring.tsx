import { useMemo } from 'react';
import { motion } from 'framer-motion';
import KpiCard from '../components/KpiCard';
import ComplianceHeatmap from '../charts/ComplianceHeatmap';
import ExceptionTable from '../components/ExceptionTable';
import { useFilter } from '../contexts/FilterContext';
import { getCategoryKpis } from '../services/dataService';

export default function ComplianceMonitoring() {
    const { filteredData } = useFilter();
    const kpis = useMemo(() => getCategoryKpis(filteredData, 'Compliance'), [filteredData]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Compliance & Regulatory Oversight</h1>
                <p className="text-xs font-medium text-slate-500 mt-1">Policy violations, audit tracking and risk concentration heatmapping</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <KpiCard key={kpi.label} kpi={kpi} index={i} />
                ))}
            </div>

            <ComplianceHeatmap />
            <ExceptionTable maxRows={20} />
        </motion.div>
    );
}
