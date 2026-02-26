import { motion } from 'framer-motion';
import type { KpiData } from '../services/dataService';
import { useFilter } from '../contexts/FilterContext';
import { HiX, HiOutlineChartBar } from 'react-icons/hi';

interface DrillDownPanelProps {
    kpi: KpiData;
    onClose: () => void;
}

export default function DrillDownPanel({ kpi, onClose }: DrillDownPanelProps) {
    const { filteredData } = useFilter();

    // Get relevant records for this KPI
    const relevantRecords = filteredData
        .filter(r => {
            if (kpi.label === 'Compliance Alerts') return r.category === 'Compliance Violation';
            if (kpi.label === 'Negative Stock Alerts') return r.category === 'Negative Stock';
            if (kpi.label === 'GR/IR Pending') return r.category === 'GR/IR Mismatch';
            if (kpi.label === 'Forex Hedge Mismatch') return r.category === 'Forex Hedge Gap';
            if (kpi.label === 'Debt Maturity Risk') return r.category === 'Short-Term Debt';
            return false;
        })
        .slice(0, 10);

    const severityColor = {
        critical: 'text-red-600',
        high: 'text-amber-600',
        medium: 'text-blue-600',
        low: 'text-emerald-600',
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 h-screen w-[480px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{kpi.label}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{kpi.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-200/50 transition-colors group text-slate-400 hover:text-slate-600"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                {/* KPI Summary */}
                <div className="p-6 border-b border-slate-100">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-2xl font-bold tracking-tight text-slate-900">{kpi.value.toLocaleString()}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">Count</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className={`text-sm font-bold uppercase tracking-widest py-1 ${severityColor[kpi.severity]}`}>
                                {kpi.severity}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">Severity</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className={`text-2xl font-bold tracking-tight ${kpi.change < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {kpi.change > 0 ? '+' : ''}{kpi.change}%
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">24h Trend</p>
                        </div>
                    </div>
                </div>

                {/* Records List */}
                <div className="flex-1 overflow-auto p-6 bg-slate-50/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <HiOutlineChartBar className="w-5 h-5" />
                        </div>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">Top Priority Exceptions</h4>
                        <div className="flex-1 h-px bg-slate-100 ml-2" />
                    </div>

                    <div className="space-y-3">
                        {relevantRecords.map((record, i) => (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-800 leading-snug pr-4">{record.description}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${record.severity === 'critical' ? 'bg-red-50 text-red-600 border-red-100' :
                                        record.severity === 'high' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            record.severity === 'medium' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {record.severity}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{record.department}</span>
                                    <span className="text-slate-200">•</span>
                                    <span className="text-[10px] font-medium text-slate-500">{record.owner}</span>
                                    <span className="text-slate-200 ml-auto">•</span>
                                    <span className="text-[11px] font-bold text-slate-900">${record.amount.toLocaleString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {relevantRecords.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <HiOutlineChartBar className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No detailed records</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
                        Full Forensic Report
                    </button>
                </div>
            </motion.div>
        </>
    );
}
