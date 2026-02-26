import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { useFilter } from '../contexts/FilterContext';
import { getMonthlyTrend } from '../services/dataService';

export default function TrendLineChart() {
    const { filteredData } = useFilter();

    const option = useMemo(() => {
        const trend = getMonthlyTrend(filteredData);
        const riskTypes = ['Financial', 'Inventory', 'Procurement', 'Compliance'];
        const colors = ['#2dd4bf', '#a855f7', '#3b82f6', '#6366f1'];

        return {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255,255,255,0.98)',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: [10, 15],
                textStyle: { color: '#1e293b', fontSize: 12, fontWeight: 500 },
                axisPointer: { type: 'line', lineStyle: { color: '#e2e8f0', width: 2 } },
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
            grid: { top: 30, right: 30, bottom: 50, left: 50 },
            xAxis: {
                type: 'category',
                data: trend.map(t => t.month),
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
                type: 'line',
                smooth: 0.3,
                symbol: 'circle',
                symbolSize: 8,
                showSymbol: false,
                lineStyle: { width: 3, color: colors[i] },
                itemStyle: { color: colors[i], borderWidth: 2, borderColor: '#fff' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: colors[i] + '15' },
                            { offset: 1, color: colors[i] + '00' },
                        ],
                    },
                },
                emphasis: {
                    showSymbol: true,
                    scale: true,
                    lineStyle: { width: 4 }
                },
                animationDuration: 1500,
                animationEasing: 'cubicInOut',
                data: trend.map(t => t.categories[rt] || 0),
            })),
        };
    }, [filteredData]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
        >
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Monthly Exception Trend</h3>
            <ReactECharts option={option} style={{ height: 320 }} notMerge lazyUpdate />
        </motion.div>
    );
}
