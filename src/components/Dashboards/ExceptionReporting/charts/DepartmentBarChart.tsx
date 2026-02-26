import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { useFilter } from '../contexts/FilterContext';
import { getDepartmentComparison } from '../services/dataService';

export default function DepartmentBarChart() {
    const { filteredData } = useFilter();

    const option = useMemo(() => {
        const data = getDepartmentComparison(filteredData);
        const severities = ['low', 'medium', 'high', 'critical'] as const;
        // Refined severity colors: Emerald, Blue, Amber, Red/Crimson
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
        const labels = ['Low', 'Medium', 'High', 'Critical'];

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(255,255,255,0.98)',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: [10, 15],
                textStyle: { color: '#1e293b', fontSize: 12, fontWeight: 500 },
                shadowColor: 'rgba(0, 0, 0, 0.05)',
                shadowBlur: 10
            },
            legend: {
                data: labels,
                bottom: 0,
                textStyle: { color: '#64748b', fontSize: 11, fontWeight: 500 },
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 25,
                icon: 'circle'
            },
            grid: { top: 30, right: 30, bottom: 50, left: 100 },
            xAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f8fafc' } },
                axisLabel: { color: '#94a3b8', fontSize: 10, margin: 15 },
            },
            yAxis: {
                type: 'category',
                data: data.map(d => d.department),
                axisLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#64748b', fontSize: 11, fontWeight: 500, margin: 15 },
                axisTick: { show: false }
            },
            series: severities.map((sev, i) => ({
                name: labels[i],
                type: 'bar',
                stack: 'total',
                barWidth: 18,
                itemStyle: {
                    color: colors[i],
                    borderRadius: i === severities.length - 1 ? [0, 4, 4, 0] : 0,
                },
                animationDuration: 1200,
                animationDelay: i * 150,
                animationEasing: 'cubicInOut',
                data: data.map(d => d.severities[sev]),
            })),
        };
    }, [filteredData]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
        >
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Department Comparison</h3>
            <ReactECharts option={option} style={{ height: 320 }} notMerge lazyUpdate />
        </motion.div>
    );
}
