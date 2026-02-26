import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { useFilter } from '../contexts/FilterContext';
import { getComplianceHeatmap } from '../services/dataService';

export default function ComplianceHeatmap() {
    const { filteredData } = useFilter();

    const option = useMemo(() => {
        const data = getComplianceHeatmap(filteredData);
        const departments = [...new Set(data.map(d => d.department))];
        const categories = [...new Set(data.map(d => d.category))];

        const heatmapData = data.map(d => [
            departments.indexOf(d.department),
            categories.indexOf(d.category),
            d.value,
        ]);

        const maxVal = Math.max(...data.map(d => d.value), 1);

        return {
            tooltip: {
                position: 'top',
                backgroundColor: 'rgba(255,255,255,0.98)',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: [10, 15],
                textStyle: { color: '#1e293b', fontSize: 12, fontWeight: 500 },
                formatter: (params: any) => {
                    const d = params.data;
                    return `<div style="margin-bottom:4px"><b style="color:#64748b">${departments[d[0]]}</b> × <b style="color:#64748b">${categories[d[1]]}</b></div>Count: <b style="color:#1e293b; font-size:14px">${d[2]}</b>`;
                },
                shadowColor: 'rgba(0, 0, 0, 0.05)',
                shadowBlur: 10
            },
            grid: { top: 20, right: 60, bottom: 80, left: 130 },
            xAxis: {
                type: 'category',
                data: departments,
                axisLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#64748b', fontSize: 10, rotate: 30, margin: 15 },
                splitArea: { show: true, areaStyle: { color: ['#f8fafc', '#fff'] } },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'category',
                data: categories,
                axisLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#64748b', fontSize: 10, width: 120, overflow: 'truncate', margin: 15 },
                axisTick: { show: false }
            },
            visualMap: {
                min: 0,
                max: maxVal,
                calculable: true,
                orient: 'vertical',
                right: 0,
                top: 'center',
                itemHeight: 120,
                itemWidth: 12,
                textStyle: { color: '#94a3b8', fontSize: 10 },
                inRange: {
                    // Teal gradient
                    color: ['#f0fdfa', '#ccfbf1', '#5eead4', '#0d9488', '#115e59'],
                },
            },
            series: [
                {
                    type: 'heatmap',
                    data: heatmapData,
                    label: {
                        show: true,
                        fontSize: 10,
                        color: '#64748b',
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 15,
                            shadowColor: 'rgba(0, 0, 0, 0.1)',
                        },
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 2,
                        borderRadius: 4,
                    },
                    animationDuration: 1200,
                    animationEasing: 'cubicInOut',
                },
            ],
        };
    }, [filteredData]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
        >
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Risk Concentration Heatmap</h3>
            <ReactECharts option={option} style={{ height: 350 }} notMerge lazyUpdate />
        </motion.div>
    );
}
