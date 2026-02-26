import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { useFilter } from '../contexts/FilterContext';
import { getRiskProfile } from '../services/dataService';

export default function RiskProfileMorph() {
    const [chartType, setChartType] = useState<'line' | 'radar'>('radar');
    const { filteredData } = useFilter();

    const riskTypes = ['Financial', 'Inventory', 'Procurement', 'Compliance'];
    const colors = ['#0d9488', '#2dd4bf', '#7e22ce', '#a855f7'];

    const profileData = useMemo(() => getRiskProfile(filteredData), [filteredData]);

    const radarOption = useMemo(() => ({
        tooltip: {
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
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 25,
            icon: 'circle'
        },
        radar: {
            indicator: profileData.map(p => ({
                name: p.indicator,
                max: Math.max(...p.values) * 1.3 || 10,
            })),
            shape: 'polygon',
            splitNumber: 4,
            axisName: { color: '#64748b', fontSize: 10, fontWeight: 500 },
            splitLine: { lineStyle: { color: '#f1f5f9' } },
            splitArea: { areaStyle: { color: ['#fff', '#f8fafc'] } },
            axisLine: { lineStyle: { color: '#f1f5f9' } },
        },
        series: [
            {
                type: 'radar',
                animationDuration: 1200,
                animationEasing: 'cubicInOut',
                data: riskTypes.map((rt, i) => ({
                    value: profileData.map(p => p.values[i]),
                    name: rt,
                    lineStyle: { width: 3, color: colors[i] },
                    itemStyle: { color: colors[i] },
                    areaStyle: { color: colors[i] + '10' },
                    symbol: 'circle',
                    symbolSize: 6,
                })),
            },
        ],
    }), [profileData]);

    const lineOption = useMemo(() => ({
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
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 25,
            icon: 'circle'
        },
        grid: { top: 30, right: 30, bottom: 50, left: 50 },
        xAxis: {
            type: 'category',
            data: profileData.map(p => p.indicator),
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
            animationDuration: 1200,
            animationEasing: 'cubicInOut',
            data: profileData.map(p => p.values[i]),
            emphasis: { showSymbol: true, scale: true, lineStyle: { width: 4 } }
        })),
    }), [profileData]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Risk Profile Analysis</h3>
                <div className="flex gap-1 bg-slate-50 rounded-lg p-1 border border-slate-200">
                    {(['radar', 'line'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setChartType(type)}
                            className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${chartType === type
                                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {type === 'radar' ? 'Radar' : 'Line'}
                        </button>
                    ))}
                </div>
            </div>
            <motion.div
                key={chartType}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <ReactECharts
                    option={chartType === 'radar' ? radarOption : lineOption}
                    style={{ height: 320 }}
                    notMerge
                    lazyUpdate
                />
            </motion.div>
        </motion.div>
    );
}
