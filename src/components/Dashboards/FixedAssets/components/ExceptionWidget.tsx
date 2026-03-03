import React from "react";

interface Props {
  assets: any[];
  cwipProjects: any[];
  reconciliationData: any[];
}

const ExceptionWidget: React.FC<Props> = ({
  assets,
  cwipProjects,
  reconciliationData,
}) => {
  const issues = reconciliationData.filter(
    (r) => r.status === "Investigate"
  ).length;

  return (
    <div className="fa-exception-widget">
      <h4>Exceptions</h4>
      <p>Assets: {assets.length}</p>
      <p>CWIP: {cwipProjects.length}</p>
      <p>Issues: {issues}</p>
    </div>
  );
};

export default ExceptionWidget;