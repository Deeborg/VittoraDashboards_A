import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import KpiCard from './KpiCard';
import DrillDownPanel from './DrillDownPanel';
import { useFilter } from '../contexts/FilterContext';
import { getCriticalKpis } from '../services/dataService';
import type { KpiData } from '../services/dataService';

export default function KpiAlertStrip() {
    const { filteredData } = useFilter();
    const [selectedKpi, setSelectedKpi] = useState<KpiData | null>(null);
    const kpis = useMemo(() => getCriticalKpis(filteredData), [filteredData]);

    return (
        <>
            <div style={{marginBottom: '2rem'}}>
                <div className="ed-section-header">
                    <div className="ed-section-bar"></div>
                    <span className="ed-section-title">Critical Alert Stream</span>
                </div>
                
                <div className="ed-kpi-row">
                {kpis.slice(0, 5).map((kpi, i) => (
                    <KpiCard
                        key={kpi.label}
                        kpi={kpi}
                        index={i}
                        onClick={() => setSelectedKpi(kpi)}
                    />
                ))}
            </div>
            </div>

            <AnimatePresence>
                {selectedKpi && (
                    <DrillDownPanel
                        kpi={selectedKpi}
                        onClose={() => setSelectedKpi(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}