import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useFilter } from '../contexts/FilterContext';
import { getRiskProfile } from '../services/dataService';

// ✅ 1. Tell TypeScript that this component accepts a "type" prop
interface RiskProfileMorphProps {
    type: 'radar' | 'line';
}

export default function RiskProfileMorph({ type }: RiskProfileMorphProps) {
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
        },
        legend: {
            data: riskTypes,
            bottom: 0,
            textStyle: { color: '#64748b', fontSize: 11, fontWeight: 500 },
            itemWidth: 10,
            itemHeight: 10,
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
        },
        series: [
            {
                type: 'radar',
                animationDuration: 1200,
                data: riskTypes.map((rt, i) => ({
                    value: profileData.map(p => p.values[i]),
                    name: rt,
                    lineStyle: { width: 3, color: colors[i] },
                    itemStyle: { color: colors[i] },
                    areaStyle: { color: colors[i] + '10' },
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
        },
        legend: {
            data: riskTypes,
            bottom: 0,
            textStyle: { color: '#64748b', fontSize: 11 },
            itemWidth: 10,
            icon: 'circle'
        },
        grid: { top: 30, right: 30, bottom: 50, left: 50 },
        xAxis: {
            type: 'category',
            data: profileData.map(p => p.indicator),
            axisLabel: { color: '#94a3b8', fontSize: 10 },
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#94a3b8', fontSize: 10 },
        },
        series: riskTypes.map((rt, i) => ({
            name: rt,
            type: 'line',
            smooth: 0.3,
            lineStyle: { width: 3, color: colors[i] },
            itemStyle: { color: colors[i] },
            data: profileData.map(p => p.values[i]),
        })),
    }), [profileData]);

    return (
        <ReactECharts
            // ✅ 2. Logic to switch based on the parent's button
            option={type === 'radar' ? radarOption : lineOption}
            style={{ height: 320 }}
            notMerge
            lazyUpdate
        />
    );
}