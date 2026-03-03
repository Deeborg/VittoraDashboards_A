import React from "react";

// Define interfaces based on actual usage in FixedRoot
interface Asset {
  grossValue: number;
  accumulatedDepreciation: number;
  [key: string]: any; // For other properties
}

interface CWIP {
  amountSpent: number;
  [key: string]: any; // For other properties like project name, status, etc.
}

interface ReconciliationItem {
  [key: string]: any; // For reconciliation properties
}

interface FinancialControlPanelProps {
  assets: Asset[];
  cwipProjects: CWIP[];
  reconciliationData: ReconciliationItem[];
}

const FinancialControlPanel: React.FC<FinancialControlPanelProps> = ({ 
  assets, 
  cwipProjects, 
  reconciliationData 
}) => {
  // Calculate KPIs
  const totalCWIP = cwipProjects?.length || 0;
  const totalAssets = assets?.length || 0;
  const totalReconciliation = reconciliationData?.length || 0;

  // Calculate financial KPIs (similar to FixedRoot)
  const totalGrossBlock = assets?.reduce((sum, a) => sum + (a.grossValue || 0), 0) || 0;
  const totalDepreciation = assets?.reduce((sum, a) => sum + (a.accumulatedDepreciation || 0), 0) || 0;
  const totalNetBlock = totalGrossBlock - totalDepreciation;
  const totalSpent = cwipProjects?.reduce((sum, p) => sum + (p.amountSpent || 0), 0) || 0;

  return (
    <div className="financial-control-panel">
      <div>Total Assets: {assets.length}</div>
      <div>Total CWIP: {cwipProjects.length}</div>
      <div>Reconciliation Items: {reconciliationData.length}</div>
    </div>
  );
};

export default FinancialControlPanel;