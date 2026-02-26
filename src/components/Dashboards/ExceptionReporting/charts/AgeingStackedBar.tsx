import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { useFilter } from '../contexts/FilterContext';
import { getAgeingAnalysis } from '../services/dataService';

export default function AgeingStackedBar() {
    const { filteredData } = useFilter();

    const option = useMemo(() => {
        const data = getAgeingAnalysis(filteredData);
        const riskTypes = ['Financial', 'Inventory', 'Procurement', 'Compliance'];
        const colors = ['#0d9488', '#2dd4bf', '#7e22ce', '#a855f7'];

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
                data: riskTypes,
                bottom: 0,
                textStyle: { color: '#64748b', fontSize: 11, fontWeight: 500 },
                itemWidth: 12,
                itemHeight: 4,
                itemGap: 25,
                icon: 'roundRect'
            },
            grid: { top: 30, right: 30, bottom: 50, left: 60 },
            xAxis: {
                type: 'category',
                data: data.map(d => d.bucket),
                axisLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#94a3b8', fontSize: 10, margin: 15 },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f8fafc' } },
                axisLabel: { color: '#94a3b8', fontSize: 10, margin: 15 },
            },
            series: riskTypes.map((rt, i) => ({
                name: rt,
                type: 'bar',
                stack: 'ageing',
                barWidth: 32,
                itemStyle: {
                    color: colors[i],
                    borderRadius: i === riskTypes.length - 1 ? [4, 4, 0, 0] : 0,
                },
                animationDuration: 1200,
                animationDelay: i * 150,
                animationEasing: 'cubicInOut',
                data: data.map(d => d.categories[rt] || 0),
            })),
        };
    }, [filteredData]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
        >
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Ageing Analysis</h3>
            <ReactECharts option={option} style={{ height: 320 }} notMerge lazyUpdate />
        </motion.div>
    );
}
