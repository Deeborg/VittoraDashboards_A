import { useMemo } from 'react';
import { motion } from 'framer-motion';
import KpiCard from '../components/KpiCard';
import TrendLineChart from '../charts/TrendLineChart';
import RiskProfileMorph from '../charts/RiskProfileMorph';
import CategoryDonutChart from '../charts/CategoryDonutChart';
import ExceptionTable from '../components/ExceptionTable';
import { useFilter } from '../contexts/FilterContext';
import { getCategoryKpis } from '../services/dataService';

export default function FinancialRisk() {
    const { filteredData } = useFilter();
    const kpis = useMemo(() => getCategoryKpis(filteredData, 'Financial'), [filteredData]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <h1 className="ed-page-title">Financial Exposure Analytics</h1>
            <p className="ed-page-subtitle">Capital buffers, liquidity exceptions and strategic risk profile monitoring</p>

            {/* KPIs */}
            <div className="ed-auto-grid">
                {kpis.map((kpi, i) => (
                    <KpiCard key={kpi.label} kpi={kpi} index={i} />
                ))}
            </div>

            {/* Charts Grid: Line Chart Left, Radar Right */}
            <div className="ed-grid-2">
                <div className="ed-chart-card">
                    <div className="ed-chart-header">Monthly Exception Trend</div>
                    <TrendLineChart />
                </div>
                
                <div className="ed-chart-card">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                         <div className="ed-chart-header" style={{marginBottom:0}}>Risk Profile Analysis</div>
                         <div style={{display:'flex', gap:'5px'}}>
                             <button className="ed-badge badge-medium" style={{cursor:'pointer'}}>RADAR</button>
                             <button className="ed-badge badge-low" style={{cursor:'pointer', background:'transparent', border:'1px solid #e2e8f0', color:'#64748b'}}>LINE</button>
                         </div>
                    </div>
                    <RiskProfileMorph />
                </div>
            </div>

            <div style={{marginTop: '1.5rem'}}>
                <div className="ed-chart-card">
                    <div className="ed-chart-header">Category Distribution</div>
                    <CategoryDonutChart />
                </div>
            </div>

            <ExceptionTable maxRows={20} />
        </motion.div>
    );
}