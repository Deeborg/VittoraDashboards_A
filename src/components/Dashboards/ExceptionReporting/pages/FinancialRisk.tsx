import { useMemo, useState } from 'react';
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
    
    // ✅ State to control the toggle from the parent
    const [chartMode, setChartMode] = useState<'radar' | 'line'>('radar');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="exception-dashboard-content"
        >
            <h1 className="ed-page-title">Financial Exposure Analytics</h1>
            <p className="ed-page-subtitle">Capital buffers, liquidity exceptions and strategic risk profile monitoring</p>

            <div className="ed-kpi-row">
                {kpis.map((kpi, i) => (
                    <KpiCard key={kpi.label} kpi={kpi} index={i} />
                ))}
            </div>
            <div className="ed-grid-2">
                <div className="ed-chart-card">
                    <div className="ed-chart-header">Monthly Exception Trend</div>
                    <TrendLineChart />
                </div>
                <div className="ed-chart-card">
                    {/* --- PROFESSIONAL HEADER WITH TOGGLE --- */}
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                         <div className="ed-chart-header" style={{marginBottom:0}}>Risk Profile Analysis</div>
                         <div style={{display:'flex', gap:'5px', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                             <button 
                                onClick={() => setChartMode('radar')}
                                className={`ed-badge ${chartMode === 'radar' ? 'badge-medium' : ''}`} 
                                style={{cursor:'pointer', border: 'none', background: chartMode === 'radar' ? '#fff' : 'transparent', color: chartMode === 'radar' ? '#2563eb' : '#94a3b8', boxShadow: chartMode === 'radar' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', padding: '4px 12px', borderRadius: '6px'}}
                             >
                                RADAR
                             </button>
                             <button 
                                onClick={() => setChartMode('line')}
                                className={`ed-badge ${chartMode === 'line' ? 'badge-medium' : ''}`} 
                                style={{cursor:'pointer', border: 'none', background: chartMode === 'line' ? '#fff' : 'transparent', color: chartMode === 'line' ? '#2563eb' : '#94a3b8', boxShadow: chartMode === 'line' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', padding: '4px 12px', borderRadius: '6px'}}
                             >
                                LINE
                             </button>
                         </div>
                    </div>

                    {/* ✅ Send the state to the child component */}
                    <RiskProfileMorph type={chartMode} /> 
                </div>
            </div>

            <div style={{marginTop: '2rem'}}>
                <div className="ed-chart-card">
                    <div className="ed-chart-header">Risk Category Distribution</div>
                    <CategoryDonutChart />
                </div>
            </div>

            <ExceptionTable maxRows={20} />
        </motion.div>
    );
}