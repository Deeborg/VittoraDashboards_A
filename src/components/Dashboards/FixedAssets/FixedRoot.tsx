import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
import Pagination from "./components/Pagination";
import {
  getAssetTableColumns,
  getCWIPTableColumns,
  getReconciliationTableColumns,
} from "./components/TableConfigurations";

const ITEMS_PER_PAGE = 15;

const FixedAssets: React.FC = () => {
  const navigate = useNavigate();

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

  const [activeSection, setActiveSection] = useState("asset");

  // Pagination states
  const [assetPage, setAssetPage] = useState(1);
  const [cwipPage, setCwipPage] = useState(1);
  const [reconciliationPage, setReconciliationPage] = useState(1);

  // Calculate paginated data
  const paginatedAssets = assets.slice(
    (assetPage - 1) * ITEMS_PER_PAGE,
    assetPage * ITEMS_PER_PAGE
  );

  const paginatedCWIP = cwipProjects.slice(
    (cwipPage - 1) * ITEMS_PER_PAGE,
    cwipPage * ITEMS_PER_PAGE
  );

  const paginatedReconciliation = reconciliationData.slice(
    (reconciliationPage - 1) * ITEMS_PER_PAGE,
    reconciliationPage * ITEMS_PER_PAGE
  );

  return (
    <div className="fa-dashboard">
      {/* HEADER */}
      <div className="fa-header">
        <div className="header__brand">
          <div className="header__brand-icon">FA</div>
          <span className="header__brand-name">Fixed Assets</span>
        </div>

        <div className="header__title">
          <h1>Fixed Asset Management</h1>
        </div>
      </div>

      {/* LEFT INTERNAL SIDEBAR */}
      <div className="fa-sidebar">

        {/* BACK BUTTON */}
        <div className="fa-back-header">
           <button className="df-back-btn" onClick={() => navigate('/modules', {state: { scrollToModule: 'scm' }})}>← </button>
        </div>

        <div className="sidebar__nav">
          <div
            className={`sidebar__nav-item ${
              activeSection === "asset" ? "active" : ""
            }`}
            onClick={() => setActiveSection("asset")}
          >
            <span className="nav-icon">📊</span>
            Asset Base
          </div>

          <div
            className={`sidebar__nav-item ${
              activeSection === "cwip" ? "active" : ""
            }`}
            onClick={() => setActiveSection("cwip")}
          >
            <span className="nav-icon">🏗️</span>
            Capital Work & Costing
          </div>

          <div
            className={`sidebar__nav-item ${
              activeSection === "depreciation" ? "active" : ""
            }`}
            onClick={() => setActiveSection("depreciation")}
          >
            <span className="nav-icon">📉</span>
            Depreciation Control
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="fa-content">
        {/* ================= ASSET SECTION ================= */}
        {activeSection === "asset" && (
          <>
            <div className="section__header">
              <h1 className="section__title">Asset Base</h1>
              <p className="section__subtitle">
                Overview of fixed assets across all categories
              </p>
            </div>

            <div className="kpi-strip-fa">
              <div className="kpi-card-fa">
                <div className="kpi-card__label-fa">Gross Block</div>
                <div className="kpi-card__value-fa">
                  ₹{(totalGrossBlock / 10000000).toFixed(2)}Cr
                </div>
              </div>

              <div className="kpi-card-fa">
                <div className="kpi-card__label-fa">Net Block</div>
                <div className="kpi-card__value-fa">
                  ₹{(totalNetBlock / 10000000).toFixed(2)}Cr
                </div>
              </div>

              <div className="kpi-card-fa">
                <div className="kpi-card__label-fa">Total Assets</div>
                <div className="kpi-card__value-fa">{totalAssets}</div>
              </div>
            </div>

            <CategoryChart data={assets} />

            <DataTable
              columns={getAssetTableColumns()}
              data={paginatedAssets}
            />

            <Pagination
              currentPage={assetPage}
              totalItems={assets.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setAssetPage}
            />
          </>
        )}

        {/* ================= CWIP SECTION ================= */}
        {activeSection === "cwip" && (
          <>
            <div className="section__header">
              <h1 className="section__title">Capital Work In Progress</h1>
            </div>

            <div className="kpi-strip-fa">
              <div className="kpi-card-fa">
                <div className="kpi-card__label-fa">Total Projects</div>
                <div className="kpi-card__value-fa">{totalCWIP}</div>
              </div>

              <div className="kpi-card-fa">
                <div className="kpi-card__label-fa">Total Amount Spent</div>
                <div className="kpi-card__value-fa">
                  ₹{(totalSpent / 10000000).toFixed(2)}Cr
                </div>
              </div>
            </div>

            <DataTable
              columns={getCWIPTableColumns()}
              data={paginatedCWIP}
            />

            <Pagination
              currentPage={cwipPage}
              totalItems={cwipProjects.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCwipPage}
            />
          </>
        )}

        {/* ================= DEPRECIATION SECTION ================= */}
        {activeSection === "depreciation" && (
          <>
            <div className="section__header">
              <h1 className="section__title">Depreciation Control</h1>
            </div>

            <div className="kpi-strip-fa">
              <div className="kpi-card-fa">
                <div className="kpi-card__label-fa">
                  Reconciliation Items
                </div>
                <div className="kpi-card__value-fa">
                  {totalReconciliation}
                </div>
              </div>
            </div>

            <DataTable
              columns={getReconciliationTableColumns()}
              data={paginatedReconciliation}
            />

            <Pagination
              currentPage={reconciliationPage}
              totalItems={reconciliationData.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setReconciliationPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default FixedAssets;