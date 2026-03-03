import React from "react";

import {
  assets,
  cwipProjects,
  reconciliationData,
  rouAssets,
} from "./data/mockData";

import "./css/reset.css";
import "./css/variables.css";
import "./css/layout.css";
import "./css/components.css";

import FinancialControlPanel from "./components/FinancialControlPanel";
import ExceptionWidget from "./components/ExceptionWidget";
import DataTable from "./components/DataTable";
import ROUAssetRenderer from "./components/ROUAssetRenderer";
import CategoryChart from "./components/ChartRenderer";
import {
  getAssetTableColumns,
  getCWIPTableColumns,
  getReconciliationTableColumns,
} from "./components/TableConfigurations";

const FixedAssets: React.FC = () => {
  const totalAssets = assets.length;
  const totalGrossBlock = assets.reduce((sum, a) => sum + a.grossValue, 0);
  const totalDepreciation = assets.reduce(
    (sum, a) => sum + a.accumulatedDepreciation,
    0
  );
  const totalNetBlock = totalGrossBlock - totalDepreciation;

  const totalCWIP = cwipProjects.length;
  const totalSpent = cwipProjects.reduce(
    (sum, p) => sum + p.amountSpent,
    0
  );

  const totalReconciliation = reconciliationData.length;
  const [activeSection, setActiveSection] = React.useState("asset");
  return (
    <div className="fa-dashboard">

      {/* LEFT INTERNAL SIDEBAR */}
      <div className="fa-sidebar">
        <div
          className={`fa-menu-item ${activeSection === "asset" ? "fa-menu-item--active" : ""}`}
          onClick={() => setActiveSection("asset")}
        >
          Asset Base
        </div>

        <div
          className={`fa-menu-item ${activeSection === "cwip" ? "fa-menu-item--active" : ""}`}
          onClick={() => setActiveSection("cwip")}
        >
          Capital Work & Costing
        </div>

        <div
          className={`fa-menu-item ${activeSection === "depreciation" ? "fa-menu-item--active" : ""}`}
          onClick={() => setActiveSection("depreciation")}
        >
          Depreciation Control
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="fa-content">

        <FinancialControlPanel
          assets={assets}
          cwipProjects={cwipProjects}
          reconciliationData={reconciliationData}
        />

        {/* ================= ASSET SECTION ================= */}
        {activeSection === "asset" && (
          <>
            <div className="fa-section__header">
              <h1 className="fa-section__title">Asset Base</h1>
              <p className="fa-section__subtitle">
                Overview of fixed assets across all categories
              </p>
            </div>

            <div className="fa-kpi-strip">
              <div className="fa-kpi-card">
                <div className="fa-kpi-card__label">Gross Block</div>
                <div className="fa-kpi-card__value">
                  ₹{(totalGrossBlock / 10000000).toFixed(2)}Cr
                </div>
              </div>

              <div className="fa-kpi-card">
                <div className="fa-kpi-card__label">Net Block</div>
                <div className="fa-kpi-card__value">
                  ₹{(totalNetBlock / 10000000).toFixed(2)}Cr
                </div>
              </div>

              <div className="fa-kpi-card">
                <div className="fa-kpi-card__label">Total Assets</div>
                <div className="fa-kpi-card__value">{totalAssets}</div>
              </div>
            </div>

            <CategoryChart data={assets} />

            <DataTable
              columns={getAssetTableColumns()}
              data={assets}
            />
          </>
        )}

        {/* ================= CWIP SECTION ================= */}
        {activeSection === "cwip" && (
          <>
            <div className="fa-section__header">
              <h1 className="fa-section__title">Capital Work In Progress</h1>
            </div>

            <div className="fa-kpi-strip">
              <div className="fa-kpi-card">
                <div className="fa-kpi-card__label">Total Projects</div>
                <div className="fa-kpi-card__value">{totalCWIP}</div>
              </div>

              <div className="fa-kpi-card">
                <div className="fa-kpi-card__label">Total Amount Spent</div>
                <div className="fa-kpi-card__value">
                  ₹{(totalSpent / 10000000).toFixed(2)}Cr
                </div>
              </div>
            </div>

            <DataTable
              columns={getCWIPTableColumns()}
              data={cwipProjects}
            />
          </>
        )}

        {/* ================= DEPRECIATION SECTION ================= */}
        {activeSection === "depreciation" && (
          <>
            <div className="fa-section__header">
              <h1 className="fa-section__title">Depreciation Control</h1>
            </div>

            <div className="fa-kpi-strip">
              <div className="fa-kpi-card">
                <div className="fa-kpi-card__label">Reconciliation Items</div>
                <div className="fa-kpi-card__value">
                  {totalReconciliation}
                </div>
              </div>
            </div>

            <DataTable
              columns={getReconciliationTableColumns()}
              data={reconciliationData}
            />
          </>
        )}

      </div>
    </div>
  );
};

export default FixedAssets;