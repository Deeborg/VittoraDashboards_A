import { motion } from 'framer-motion';
import KpiAlertStrip from '../components/KpiAlertStrip';
import KpiTabs from '../components/KpiTabs';
import TrendLineChart from '../charts/TrendLineChart';
import CategoryDonutChart from '../charts/CategoryDonutChart';
import DepartmentBarChart from '../charts/DepartmentBarChart';
import AgeingStackedBar from '../charts/AgeingStackedBar';
import ExceptionTable from '../components/ExceptionTable';

export default function Overview() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Headers */}
            <h1 style={{fontSize: '1.5rem', fontWeight: 700, color: '#0f172a'}}>Dashboard Overview</h1>
            <p style={{fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem'}}>Real-time exception monitoring and risk analytics</p>

            {/* Top Cards */}
            <KpiAlertStrip />
            
            {/* Middle Cards (Risk Tabs) */}
            <KpiTabs />

            {/* Charts Row 1 */}
            <div className="ed-grid-2">
                <div className="ed-chart-card">
                    <div className="ed-chart-header">Monthly Exception Trend</div>
                    <TrendLineChart />
                </div>
                <div className="ed-chart-card">
                    <div className="ed-chart-header">Category Distribution</div>
                    <CategoryDonutChart />
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="ed-grid-2">
                <div className="ed-chart-card">
                    <div className="ed-chart-header">Department Breakdown</div>
                    <DepartmentBarChart />
                </div>
                <div className="ed-chart-card">
                    <div className="ed-chart-header">Ageing Analysis</div>
                    <AgeingStackedBar />
                </div>
            </div>

            {/* Table */}
            <ExceptionTable maxRows={10} />
        </motion.div>
    );
}