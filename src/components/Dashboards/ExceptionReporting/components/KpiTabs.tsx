import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KpiCard from './KpiCard';
import { useFilter } from '../contexts/FilterContext';
import { getCategoryKpis } from '../services/dataService';

const tabs = [
    { id: 'Financial', label: 'Financial Risk' },
    { id: 'Inventory', label: 'Inventory Risk' },
    { id: 'Procurement', label: 'Procurement' },
];

export default function KpiTabs() {
    const [activeTab, setActiveTab] = useState<string>('Financial');
    const { filteredData } = useFilter();

    const kpis = useMemo(
        () => getCategoryKpis(filteredData, activeTab),
        [filteredData, activeTab]
    );

    return (
        <div style={{marginBottom: '2rem'}}>
             <div className="ed-section-header">
                <div className="ed-section-bar" style={{background: '#64748b'}}></div>
                <span className="ed-section-title">Risk Categories</span>
            </div>

            <div className="ed-tabs-row">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`ed-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="ed-grid-4" // Use grid-4 for larger cards
                >
                    {kpis.map((kpi, i) => (
                        <KpiCard key={kpi.label} kpi={kpi} index={i} />
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}