import React from "react";

interface Props {
  assets: any[];
  cwipProjects: any[];
  reconciliationData: any[];
}

const FinancialControlPanel: React.FC<Props> = ({
  assets,
  cwipProjects,
  reconciliationData,
}) => {
  return (
    <div className="financial-control-panel">
      <div>Total Assets: {assets.length}</div>
      <div>Total CWIP: {cwipProjects.length}</div>
      <div>Reconciliation Items: {reconciliationData.length}</div>
    </div>
  );
};

export default FinancialControlPanel;