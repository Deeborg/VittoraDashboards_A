import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { useFilter } from '../contexts/FilterContext';
import { getCategoryDistribution } from '../services/dataService';

export default function CategoryDonutChart() {
    const { filteredData } = useFilter();

    const option = useMemo(() => {
        const dist = getCategoryDistribution(filteredData);
        // Corporate palette: Teals, Purples, Blues, Slate
        const colors = ['#0d9488', '#2dd4bf', '#7e22ce', '#a855f7', '#1d4ed8', '#3b82f6', '#475569', '#94a3b8'];

        return {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255,255,255,0.98)',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: [10, 15],
                textStyle: { color: '#1e293b', fontSize: 12, fontWeight: 500 },
                formatter: '{b}: <b style="color:#1e293b">{c}</b> ({d}%)',
                shadowColor: 'rgba(0, 0, 0, 0.05)',
                shadowBlur: 10
            },
            legend: {
                orient: 'vertical',
                right: 10,
                top: 'center',
                textStyle: { color: '#64748b', fontSize: 11, fontWeight: 500 },
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 12,
                icon: 'circle'
            },
            series: [
                {
                    type: 'pie',
                    radius: ['50%', '75%'],
                    center: ['35%', '50%'],
                    avoidLabelOverlap: false,
                    padAngle: 5,
                    itemStyle: {
                        borderRadius: 8,
                        borderColor: '#fff',
                        borderWidth: 2,
                    },
                    label: { show: false },
                    emphasis: {
                        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
                        itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.08)' },
                    },
                    animationType: 'scale',
                    animationEasing: 'cubicInOut',
                    animationDuration: 1200,
                    data: dist.map((d, i) => ({
                        ...d,
                        itemStyle: { color: colors[i % colors.length] },
                    })),
                },
            ],
        };
    }, [filteredData]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
        >
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Category Distribution</h3>
            <ReactECharts option={option} style={{ height: 320 }} notMerge lazyUpdate />
        </motion.div>
    );
}
