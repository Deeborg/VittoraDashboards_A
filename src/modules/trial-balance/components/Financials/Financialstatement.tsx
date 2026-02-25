import React, { useState, useMemo, Fragment, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Tabs,
  Tab,
  Toolbar,
  Divider,
  CircularProgress,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Container,
} from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableView as TableViewIcon,
} from '@mui/icons-material';
import PeriodSelector from "../PeriodSelector";
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import NotesEditor from "./NotesEditor";
import { createPortal } from "react-dom";
import CashFlowEditor from "./CashflowEditor";
import { CalculatedRatio, EquityColumn, EquityRow, FinancialNote, FinancialStatementsProps, FinancialVarRow, HierarchicalItem, MappedRow, TableContent, TextVarRow, FinancialData } from "./types";
import { useDatabaseData } from "./hooks/useDatabaseData";
import { useManualData } from "./hooks/useManualData";
import { joinManualJEAndRenamedData } from "./ManualJEcalc";
import { useFinancialData } from "./useFinancialData";
import { ExcelConfirmDialog, handleExportExcel } from "./ExcelExport";
import { PdfModal } from "./PdfExport";
import { DrillDownTable } from "./DrillDownTable";
import { EquityMultiTable } from "./EquityTable";
import {RatiosModal} from "./RatiosTable";
import { checkBalanceSheetTally } from './helpers';
import EquityEditor from "./EquityEditor";
import { RatioDashboard } from '../Dashboard/RatioDashboard';
import SchedulesDashboard from './SchedulesDashboard';
import KPICard from "../../../../components/Forex_kpi";

// Helper component for Tab Panels
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`financial-statement-tabpanel-${index}`}
      aria-labelledby={`financial-statement-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3, pb: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const getAllExpandableKeys = (items: HierarchicalItem[]): string[] => {
  const keys: string[] = [];
  items.forEach((item) => {
    if (item.children && item.children.length > 0) {
      keys.push(item.key);
      keys.push(...getAllExpandableKeys(item.children));
    }
  });
  return keys;
};

const findValueByKey = (items: HierarchicalItem[], key: string): { current: number, previous: number } => {
    if (!items) return { current: 0, previous: 0 };
    for (const item of items) {
        if (item.key === key) {
            return { current: item.valueCurrent ?? 0, previous: item.valuePrevious ?? 0 };
        }
        if (item.children) {
            const found = findValueByKey(item.children, key);
            if (found.current !== 0 || found.previous !== 0) {
                return found;
            }
        }
    }
    return { current: 0, previous: 0 };
};

// Balance Tally Dialog
const BalanceTallyDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  message 
}: { 
  open: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  message: string 
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Balance Sheet Mismatch Warning</DialogTitle>
    <DialogContent>
      <DialogContentText sx={{ whiteSpace: 'pre-wrap' }}>
        {message}
      </DialogContentText>
      <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>
        Do you still want to proceed with the export?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} variant="contained" color="warning" autoFocus>
        Proceed Anyway
      </Button>
    </DialogActions>
  </Dialog>
);

// Columns for Part A (Equity Share Capital)
export const EQUITY_SHARE_COLUMNS: EquityColumn[] = [
  { key: "number", label: "Number" },
  { key: "amount", label: "Amount" },
];

export const EQUITY_SHARE_ROWS: EquityRow[] = [
  {
    key: "esc",
    label: "Equity shares of ₹ 10 each, fully paid-up",
  },
  {
    key: "esc-opening",
    label: "Balance as at End of previous year",
    values: { number: "85,05,469", amount: 850.55 },
  },
  {
    key: "esc-changes",
    label: "Changes in equity share capital during the year",
    values: { number: "-", amount: "-" },
  },
  {
    key: "esc-closing",
    label: "Balance as at beginning of current year",
    values: { number: "85,05,469", amount: 850.55 },
  },
  {
    key: "esc-apr2023",
    label: "Balance as at end of current year",
    values: { number: "85,05,469", amount: 850.55 },
  },
  {
    key: "esc-changes-1",
    label: "Changes in equity share capital during the year",
    values: { number: "-", amount: "-" },
  },
  {
    key: "esc-2024",
    label: "Balance as at beginning of next year",
    values: { number: "85,05,469", amount: 850.55 },
  },
];

// Columns for Part B (Other Equity)
export const OTHER_EQUITY_COLUMNS: EquityColumn[] = [
  { key: "genRes", label: "General reserve" },
  { key: "retEarn", label: "Retained earnings" },
  { key: "oci", label: "Remeasurement gains in defined benefit plans" },
  { key: "total", label: "Total" },
];

export const OTHER_EQUITY_ROWS: EquityRow[] = [
  {
    key: "oe-2022",
    label: "As at end of previous year",
    values: { genRes: 11911.35, retEarn: 24481.71, oci: 570.54, total: 36963.60 },
  },
  {
    key: "oe-profit2023",
    label: "Profit for the year",
    id: "pat",
    values: { genRes: "-", retEarn: 7458.01, oci: "-", total: 7458.01 },
  },
  {
    key: "oe-oci2023",
    label: "Other comprehensive income (net of tax)",
    id: "comp-income",
    values: { genRes: "-", retEarn: "-", oci: 7.00, total: 7.00 },
  },
  {
    key: "oe-2023",
    label: "As at beginning of current year",
    values: { genRes: 11911.35, retEarn: 31939.72, oci: 577.54, total: 44428.61 },
  },
  {
    key: "oe-profit2024",
    label: "Profit for the year",
    id: "pat2",
    values: { genRes: "-", retEarn: 22560.10, oci: "-", total: 22560.10 },
  },
  {
    key: "oe-oci2024",
    label: "Other comprehensive income (net of tax)",
    id: "comp-income2", 
    values: { genRes: "-", retEarn: "-", oci: -97.75, total: -97.75 },
  },
  {
    key: "oe-div2024",
    label: "Dividend Paid (Refer note 43)",
    values: { genRes: "-", retEarn: -3729.65, oci: "-", total: -3729.65 },
  },
  {
    key: "oe-2024",
    label: "As at beginning of next year",
    values: { genRes: 11911.35, retEarn: 50770.17, oci: 479.79, total: 63161.31 },
  },
];

const FinancialKPICard = ({ label, value, isPercent = false, isCurrency = false, color = "primary.main" }: any) => {
    // Check if value is a valid number. If not, default to 0.
    const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 0;

    return (
        <Paper elevation={2} sx={{ 
            p: 2, 
            minWidth: 160, 
            textAlign: 'center', 
            borderRadius: 2, 
            borderTop: `4px solid ${color}`,
            background: '#fff'
        }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                {label}
            </Typography>
            <Typography variant="h6" sx={{ color: color, fontWeight: 700, mt: 0.5 }}>
                {isPercent 
                    ? `${safeValue.toFixed(2)}%` 
                    : isCurrency 
                        ? safeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                        : safeValue.toFixed(2)
                }
            </Typography>
        </Paper>
    );
};

const FinancialStatements: React.FC<FinancialStatementsProps> = ({
  data,
  amountKeys,
  useDatabase = false,
}) => {
  // State hooks
  const [editedNoteKeys, setEditedNoteKeys] = useState<Set<string>>(new Set());
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [isPdfModalOpen, setPdfModalOpen] = useState(false);
  const [isExcelConfirmOpen, setExcelConfirmOpen] = useState(false);
  const [editedNotes, setEditedNotes] = useState<FinancialNote[]>([]);
  const [isNotesEditorOpen, setNotesEditorOpen] = useState(false);
  const [editorContainer, setEditorContainer] = useState<HTMLElement | null>(null);
  const [emotionCache, setEmotionCache] = useState<any | null>(null);
  const [cashFlowEmotionCache, setCashFlowEmotionCache] = useState<any | null>(null);
  const [isRatiosModalOpen, setRatiosModalOpen] = useState(false);
  const [isDashboardOpen, setDashboardOpen] = useState(false);
  const [isSchedulesDashboardOpen, setSchedulesDashboardOpen] = useState(false);
  const [isCashFlowEditorOpen, setCashFlowEditorOpen] = useState(false);
  const [cashFlowEditorContainer, setCashFlowEditorContainer] = useState<HTMLElement | null>(null);
  const [editedCashFlow, setEditedCashFlow] = useState<HierarchicalItem[] | null>(null);
  const [tallyError, setTallyError] = useState<{
    open: boolean;
    message: string;
    actionToConfirm: (() => void) | null;
  }>({
    open: false,
    message: '',
    actionToConfirm: null,
  });
  const [shareCapitalRows, setShareCapitalRows] = useState<EquityRow[]>(EQUITY_SHARE_ROWS);
  const [otherEquityRows, setOtherEquityRows] = useState<EquityRow[]>(OTHER_EQUITY_ROWS);
  const [isEquityEditorOpen, setEquityEditorOpen] = useState(false);
  const [equityEditorContainer, setEquityEditorContainer] = useState<HTMLElement | null>(null);
  const [equityEmotionCache, setEquityEmotionCache] = useState<any | null>(null);

  // --- UI State ---
  const [activeTab, setActiveTab] = useState(0);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isExportMenuOpen = Boolean(exportMenuAnchorEl);

  // Custom hooks
  const { manualJE, financialVar, textVar, loading } = useManualData();
  const { databaseData, financialVarData, textVarData, dbLoading, dbError, selectedPeriods, fetchDatabaseData ,dbEditedNoteKeys} = useDatabaseData();

    useEffect(() => {
    if (dbEditedNoteKeys && dbEditedNoteKeys.size > 0) {
      setEditedNoteKeys(dbEditedNoteKeys);
    }
  }, [dbEditedNoteKeys]);

  // Data preparation
  const currentData = useDatabase ? databaseData : data || [];
  const currentAmountKeys = useDatabase
    ? { amountCurrentKey: selectedPeriods?.period1 || "", amountPreviousKey: selectedPeriods?.period2 || "" }
    : amountKeys || { amountCurrentKey: "", amountPreviousKey: "" };
  const currentFinancialVar = useDatabase ? financialVarData : financialVar;
  const currentTextVar = useDatabase ? textVarData : textVar;

  // Period headers (moved before useFinancialData)
  const formatPeriodName = (periodName: string): string => {
    return periodName;
  };

  const getPeriodHeaders = () => {
    if (useDatabase && selectedPeriods) {
      return {
        currentPeriod: formatPeriodName(selectedPeriods.period1),
        previousPeriod: formatPeriodName(selectedPeriods.period2),
      };
    }
    return {
      currentPeriod: currentAmountKeys.amountCurrentKey,
      previousPeriod: currentAmountKeys.amountPreviousKey,
    };
  };

  const periodHeaders = getPeriodHeaders();

  const renamedData = currentData.map((row) => {
    if (useDatabase) {
      return row;
    }

    const currentValue = row[currentAmountKeys.amountCurrentKey];
    const previousValue = row[currentAmountKeys.amountPreviousKey];
    const amountCurrent =
      typeof currentValue === "string" || typeof currentValue === "number"
        ? parseFloat(currentValue as string)
        : 0;
    const amountPrevious =
      typeof previousValue === "string" || typeof previousValue === "number"
        ? parseFloat(previousValue as string)
        : 0;

    const {
      [currentAmountKeys.amountCurrentKey]: _,
      [currentAmountKeys.amountPreviousKey]: __,
      ...rest
    } = row;

    return {
      ...rest,
      amountCurrent: isNaN(amountCurrent) ? 0 : amountCurrent,
      amountPrevious: isNaN(amountPrevious) ? 0 : amountPrevious,
    };
  });

  const renamedData1 = useDatabase
    ? renamedData
    : joinManualJEAndRenamedData(renamedData, manualJE, currentAmountKeys);

  const columnsToKeep = useDatabase
    ? ["key", "amountCurrent", "amountPrevious"]
    : [
        "key",
        currentAmountKeys.amountCurrentKey,
        currentAmountKeys.amountPreviousKey,
      ];

  const financialVar1 = currentFinancialVar.map((item: Record<string, any>) => {
    const filteredItem: Record<string, any> = {};
    columnsToKeep.forEach((col) => {
      filteredItem[col] = item[col];
    });
    return filteredItem;
  });

  const financialVar2 = financialVar1.map((row) => {
    if (useDatabase) {
      return {
        key: row.key,
        amountCurrent: row.amountCurrent || 0,
        amountPrevious: row.amountPrevious || 0,
      };
    }

    const currentValue = row[currentAmountKeys.amountCurrentKey];
    const previousValue = row[currentAmountKeys.amountPreviousKey];
    const amountCurrent =
      typeof currentValue === "string" || typeof currentValue === "number"
        ? parseFloat(currentValue as string)
        : 0;
    const amountPrevious =
      typeof previousValue === "string" || typeof previousValue === "number"
        ? parseFloat(previousValue as string)
        : 0;

    const {
      [currentAmountKeys.amountCurrentKey]: _,
      [currentAmountKeys.amountPreviousKey]: __,
      key,
    } = row;

    return {
      key,
      amountCurrent: isNaN(amountCurrent) ? 0 : amountCurrent,
      amountPrevious: isNaN(amountPrevious) ? 0 : amountPrevious,
    };
  });

  const textVar2 = currentTextVar.map((row) => ({
    key: row.key,
    amountCurrent: (row as any)[currentAmountKeys.amountCurrentKey],
  }));

  const financialData = useFinancialData(
    renamedData1,
    financialVar2,
    textVar2,
    editedNotes,
    editedCashFlow,
    periodHeaders,
    shareCapitalRows,
    otherEquityRows,
    editedNoteKeys 
  );

  // useMemo hooks
  const calculatedRatios = useMemo<CalculatedRatio[]>(() => {
    if (!financialData || financialData.balanceSheet.length === 0 || financialData.incomeStatement.length === 0) {
        return [];
    }
     const bs = financialData.balanceSheet;
    const is = financialData.incomeStatement;

    const safeDiv = (num: number, den: number) => (den === 0 ? 0 : num / den);

    // --- 1. EXTRACT BASE VALUES ---
    const totalAssets = findValueByKey(bs, 'bs-assets');
    const currentAssets = findValueByKey(bs, 'bs-assets-c');
    const currentLiabilities = findValueByKey(bs, 'bs-liab-c');
    const totalEquity = findValueByKey(bs, 'bs-eq'); 
    const equityShareCapital = findValueByKey(bs, 'bs-eq-captial');
    const otherEquity = findValueByKey(bs, 'bs-eq-other');
    const revenue = findValueByKey(is, 'is-rev-ops');
    const totalExpenses = findValueByKey(is, 'is-expenses');
    const financeCost = findValueByKey(is, 'is-exp-fin');
    const depreciation = findValueByKey(is, 'is-exp-dep');
    const tax = findValueByKey(is, 'is-tax');
    const pbt = findValueByKey(is, 'is-pbt');
    const pat = findValueByKey(is, 'is-pat');

    const inventory = findValueByKey(bs, 'bs-assets-c-inv');
    const receivables = findValueByKey(bs, 'bs-assets-c-fin-tr');
    const payables = findValueByKey(bs, 'bs-liab-c-fin-enterprises'); // Sum of MSME and Others
    const cashAndBank = findValueByKey(bs, 'bs-assets-c-fin-cce');

    // --- 2. CALCULATE INTERMEDIATE VALUES ---
    const totalDebt = { 
        current: findValueByKey(bs, 'bs-liab-nc-fin-borrow').current + findValueByKey(bs, 'bs-liab-c-fin-liability').current,
        previous: findValueByKey(bs, 'bs-liab-nc-fin-borrow').previous + findValueByKey(bs, 'bs-liab-c-fin-liability').previous,
    };
    const capitalEmployed = { current: totalAssets.current - currentLiabilities.current, previous: totalAssets.previous - currentLiabilities.previous };
    const ebit = { current: pbt.current + financeCost.current, previous: pbt.previous + financeCost.previous };
    const ebitda = { current: ebit.current + depreciation.current, previous: ebit.previous + depreciation.previous };
    const cogs = { 
        current: findValueByKey(is, 'is-exp-mat').current + findValueByKey(is, 'is-exp-pur').current + findValueByKey(is, 'is-exp-inv').current,
        previous: findValueByKey(is, 'is-exp-mat').previous + findValueByKey(is, 'is-exp-pur').previous + findValueByKey(is, 'is-exp-inv').previous,
    };
    const grossProfit = { current: revenue.current - cogs.current, previous: revenue.previous - cogs.previous };
    const operatingProfit = { 
        current: revenue.current - cogs.current - (totalExpenses.current - cogs.current - depreciation.current - financeCost.current), 
        previous: revenue.previous - cogs.previous - (totalExpenses.previous - cogs.previous - depreciation.previous - financeCost.previous) 
    };
    
    // --- Per-share calculation values ---
    const faceValuePerShare = 10;
    const numberOfShares = { 
        current: safeDiv(equityShareCapital.current, faceValuePerShare), 
        previous: safeDiv(equityShareCapital.previous, faceValuePerShare) 
    };
       const marketPrice = { current: 1500, previous: 1200 }; 

    const marketCap = {
        current: marketPrice.current * numberOfShares.current,
        previous: marketPrice.previous * numberOfShares.previous
    };

    const enterpriseValue = {
        current: marketCap.current + totalDebt.current - cashAndBank.current,
        previous: marketCap.previous + totalDebt.previous - cashAndBank.previous
    };
    // --- 3. CALCULATE FINAL RATIOS ---
    // Liquidity
    const cashFromBS = findValueByKey(bs, 'bs-assets-c-fin-cce');
    const receivablesFromBS = findValueByKey(bs, 'bs-assets-c-fin-tr');
    const marketableSecuritiesFromBS = findValueByKey(bs, 'bs-assets-nc-fin-other');
    const operatingExpensesOnly = {
        current: totalExpenses.current - financeCost.current - tax.current,
        previous: totalExpenses.previous - financeCost.previous - tax.previous
    };
    const dailyOperatingExpenses = { 
        current: (operatingExpensesOnly.current + financeCost.current + tax.current) / 365, 
        previous: (operatingExpensesOnly.previous + financeCost.previous + tax.previous) / 365 
    };
    const basicDefenseRatio = { 
        current: safeDiv(cashFromBS.current + receivablesFromBS.current + marketableSecuritiesFromBS.current, dailyOperatingExpenses.current), 
        previous: safeDiv(cashFromBS.previous + receivablesFromBS.previous + marketableSecuritiesFromBS.previous, dailyOperatingExpenses.previous)
    };
    
    // Capital Structure
    const equityRatio = { current: safeDiv(totalEquity.current, capitalEmployed.current), previous: safeDiv(totalEquity.previous, capitalEmployed.previous) };
    const debtRatio = { current: safeDiv(totalDebt.current, capitalEmployed.current), previous: safeDiv(totalDebt.previous, capitalEmployed.previous) };
    const debtToEquityRatio = { current: safeDiv(totalDebt.current, totalEquity.current), previous: safeDiv(totalDebt.previous, totalEquity.previous) };
    
    // Coverage
    const interestCoverageRatio = { current: safeDiv(ebit.current, financeCost.current), previous: safeDiv(ebit.previous, financeCost.previous) };
    const earningsAvailableForDebtService = { 
        current: pat.current + depreciation.current + financeCost.current, 
        previous: pat.previous + depreciation.previous + financeCost.previous 
    };
    const debtService = { 
        current: financeCost.current + (totalDebt.current * 0.1), // Assuming 10% principal repayment
        previous: financeCost.previous + (totalDebt.previous * 0.1) 
    };
    const debtServiceCoverageRatio = { 
        current: safeDiv(earningsAvailableForDebtService.current, debtService.current), 
        previous: safeDiv(earningsAvailableForDebtService.previous, debtService.previous) 
    };
    const shareholdersFund = { current: equityShareCapital.current + otherEquity.current, previous: equityShareCapital.previous + otherEquity.previous };
    const capitalGearingRatio = { 
        current: safeDiv(totalDebt.current, shareholdersFund.current), 
        previous: safeDiv(totalDebt.previous, shareholdersFund.previous) 
    };

    // Profitability
    const grossProfitMargin = { current: safeDiv(grossProfit.current, revenue.current), previous: safeDiv(grossProfit.previous, revenue.previous) };
    const netProfitMargin = { current: safeDiv(pat.current, revenue.current), previous: safeDiv(pat.previous, revenue.previous) };
    const operatingProfitMargin = { current: safeDiv(operatingProfit.current, revenue.current), previous: safeDiv(operatingProfit.previous, revenue.previous) };
    const pretaxMargin = { current: safeDiv(ebitda.current, revenue.current), previous: safeDiv(ebitda.previous, revenue.previous) };

    // Returns
    const returnOnAssets = { current: safeDiv(pat.current, totalAssets.current), previous: safeDiv(pat.previous, totalAssets.previous) };
    const operatingReturnOnAsset = { current: safeDiv(operatingProfit.current, totalAssets.current), previous: safeDiv(operatingProfit.previous, totalAssets.previous) };
    const returnOnCapitalEmployed = { current: safeDiv(operatingProfit.current, capitalEmployed.current), previous: safeDiv(operatingProfit.previous, capitalEmployed.previous) };
    const returnOnEquity = { current: safeDiv(pat.current, totalEquity.current), previous: safeDiv(pat.previous, totalEquity.previous) };

    // Market Value
    const earningsPerShare = { current: safeDiv(pat.current, numberOfShares.current), previous: safeDiv(pat.previous, numberOfShares.previous) };
    const bookValuePerShare = { current: safeDiv(totalEquity.current, numberOfShares.current), previous: safeDiv(totalEquity.previous, numberOfShares.previous) };
    const marketValuePerShare = { current: bookValuePerShare.current * 1.5, previous: bookValuePerShare.previous * 1.5 }; // Proxy
    const marketBookRatio = { current: safeDiv(marketValuePerShare.current, bookValuePerShare.current), previous: safeDiv(marketValuePerShare.previous, bookValuePerShare.previous) };
    const priceEarningsRatio = { current: safeDiv(marketValuePerShare.current, earningsPerShare.current), previous: safeDiv(marketValuePerShare.previous, earningsPerShare.previous) };

    return [
      { sNo: '1', ratioMeasure: 'Current Ratio', valueCurrent: safeDiv(currentAssets.current, currentLiabilities.current), valuePrevious: safeDiv(currentAssets.previous, currentLiabilities.previous)},
      { sNo: '2', ratioMeasure: 'Quick Ratio', valueCurrent: safeDiv(currentAssets.current - inventory.current, currentLiabilities.current), valuePrevious: safeDiv(currentAssets.previous - inventory.previous, currentLiabilities.previous)},
      { sNo: '3', ratioMeasure: 'Cash Ratio', valueCurrent: safeDiv(cashAndBank.current, currentLiabilities.current), valuePrevious: safeDiv(cashAndBank.previous, currentLiabilities.previous)},
      { sNo: '4', ratioMeasure: 'Basic Defense Ratio', valueCurrent: basicDefenseRatio.current, valuePrevious: basicDefenseRatio.previous},

      { sNo: '5', ratioMeasure: 'Gross Profit Margin',  valueCurrent: grossProfitMargin.current, valuePrevious: grossProfitMargin.previous },
      { sNo: '6', ratioMeasure: 'EBITDA Margin',  valueCurrent: safeDiv(ebitda.current, revenue.current), valuePrevious: safeDiv(ebitda.previous, revenue.previous) },
      { sNo: '7', ratioMeasure: 'EBIT Margin',  valueCurrent: safeDiv(ebit.current, revenue.current), valuePrevious: safeDiv(ebit.previous, revenue.previous) },
      { sNo: '8', ratioMeasure: 'Return on Equity (ROE)',  valueCurrent: returnOnEquity.current, valuePrevious: returnOnEquity.previous},
      { sNo: '9', ratioMeasure: 'Return on Assets (ROA)',  valueCurrent: returnOnAssets.current, valuePrevious: returnOnAssets.previous },
      { sNo: '10', ratioMeasure: 'Return on Capital Employed (ROCE)',  valueCurrent: returnOnCapitalEmployed.current, valuePrevious: returnOnCapitalEmployed.previous },

      { sNo: '11', ratioMeasure: 'Inventory Days', valueCurrent: safeDiv(inventory.current, cogs.current) * 365, valuePrevious: safeDiv(inventory.previous, cogs.previous) * 365 },
      { sNo: '12', ratioMeasure: 'Receivable Days', valueCurrent: safeDiv(receivables.current, revenue.current) * 365, valuePrevious: safeDiv(receivables.previous, revenue.previous) * 365 },
      { sNo: '13', ratioMeasure: 'Payable Days', valueCurrent: safeDiv(payables.current, cogs.current) * 365, valuePrevious: safeDiv(payables.previous, cogs.previous) * 365 },
      { sNo: '14', ratioMeasure: 'Asset Turnover', valueCurrent: safeDiv(revenue.current, totalAssets.current), valuePrevious: safeDiv(revenue.previous, totalAssets.previous) },
      
      { sNo: '15', ratioMeasure: 'Debt to Equity Ratio',  valueCurrent: debtToEquityRatio.current, valuePrevious: debtToEquityRatio.previous },
      { sNo: '16', ratioMeasure: 'Interest Coverage Ratio',  valueCurrent: interestCoverageRatio.current, valuePrevious: interestCoverageRatio.previous },
      { sNo: '17', ratioMeasure: 'Net Debt/EBITDA', valueCurrent: safeDiv(totalDebt.current - cashAndBank.current, ebitda.current), valuePrevious: safeDiv(totalDebt.previous - cashAndBank.previous, ebitda.previous) },
      
      { sNo: '18', ratioMeasure: 'Earnings Per Share (EPS)',  valueCurrent: earningsPerShare.current, valuePrevious: earningsPerShare.previous },
      { sNo: '19', ratioMeasure: 'Book Value Per Share',  valueCurrent: bookValuePerShare.current, valuePrevious: bookValuePerShare.previous },
      { sNo: '20', ratioMeasure: 'Price-Earnings (P/E) Ratio',  valueCurrent: priceEarningsRatio.current, valuePrevious: priceEarningsRatio.previous},
      { sNo: '19', ratioMeasure: 'Market Cap', valueCurrent: marketCap.current, valuePrevious: marketCap.previous },
      { sNo: '20', ratioMeasure: 'EV/EBITDA', valueCurrent: safeDiv(enterpriseValue.current, ebitda.current), valuePrevious: safeDiv(enterpriseValue.previous, ebitda.previous) },

      // { sNo: '2', ratioMeasure: 'Equity Ratio',  valueCurrent: equityRatio.current, valuePrevious: equityRatio.previous},
      // { sNo: '3', ratioMeasure: 'Debt Ratio',  valueCurrent: debtRatio.current, valuePrevious: debtRatio.previous },
      // { sNo: '5', ratioMeasure: 'Debt Service Coverage Ratio',  valueCurrent: debtServiceCoverageRatio.current, valuePrevious: debtServiceCoverageRatio.previous },
      // { sNo: '7', ratioMeasure: 'Capital Gearing Ratio',  valueCurrent: capitalGearingRatio.current, valuePrevious: capitalGearingRatio.previous },
      // { sNo: '9', ratioMeasure: 'Net Profit Margin',  valueCurrent: netProfitMargin.current, valuePrevious: netProfitMargin.previous },
      // { sNo: '10', ratioMeasure: 'Operating Profit Margin', valueCurrent: operatingProfitMargin.current, valuePrevious: operatingProfitMargin.previous },
      // { sNo: '11', ratioMeasure: 'Pretax Margin',  valueCurrent: pretaxMargin.current, valuePrevious: pretaxMargin.previous },
      // { sNo: '13', ratioMeasure: 'Operating Return on Asset',  valueCurrent: operatingReturnOnAsset.current, valuePrevious: operatingReturnOnAsset.previous},
      // { sNo: '18', ratioMeasure: 'Market Value Per Share',  valueCurrent: marketValuePerShare.current, valuePrevious: marketValuePerShare.previous },
      // { sNo: '19', ratioMeasure: 'Market/Book (M/B) Ratio', valueCurrent: marketBookRatio.current, valuePrevious: marketBookRatio.previous },
    ];

  }, [financialData]);

  const incomeStatementPAT = financialData.incomeStatement.find(item => item.id === "pat");
  const rawPatCurrent = incomeStatementPAT?.valueCurrent ?? 0;
  const rawPatPrevious = incomeStatementPAT?.valuePrevious ?? 0;
  const patCurrent = Math.round(rawPatCurrent * 100) / 100;
  const patPrevious = Math.round(rawPatPrevious * 100) / 100;

  const comprehensiveIncomeItem = financialData.incomeStatement.find(item => item.id === "comp-income");
  const rawCompIncomeCurrent = comprehensiveIncomeItem?.valueCurrent ?? 0;
  const rawCompIncomePrevious = comprehensiveIncomeItem?.valuePrevious ?? 0;

  const compIncomeCurrent = Math.round(rawCompIncomeCurrent * 100) / 100;
  const compIncomePrevious = Math.round(rawCompIncomePrevious * 100) / 100;

  const allExpandableKeys = useMemo(() => {
    const bsKeys = getAllExpandableKeys(financialData.balanceSheet);
    const isKeys = getAllExpandableKeys(financialData.incomeStatement);
    const cfKeys = getAllExpandableKeys(financialData.cashFlow);
    return [...bsKeys, ...isKeys, ...cfKeys];
  }, [financialData]);

  const updatedOtherEquityRows = useMemo(() => {
    const parseValue = (val: any): number => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    };

    return OTHER_EQUITY_ROWS.map(row => {
      let newValues = { ...row.values };
      if (row.id === "pat") {
        newValues.retEarn = patPrevious;
      }
      if (row.id === "pat2") {
        newValues.retEarn = patCurrent;
      }
      if (row.id === "comp-income") {
        newValues.oci = compIncomePrevious;
      }
      if (row.id === "comp-income2") {
        newValues.oci = compIncomeCurrent;
      }

      const genRes = parseValue(newValues.genRes);
      const retEarn = parseValue(newValues.retEarn);
      const oci = parseValue(newValues.oci);
      const total = genRes + retEarn + oci;

      return {
        ...row,
        values: {
          ...newValues,
          total: parseFloat(total.toFixed(2)),
        },
      };
    });
  }, [patCurrent, patPrevious, compIncomeCurrent, compIncomePrevious]);

  const fullFinancialData: FinancialData = useMemo(() => ({
    ...financialData,
    equityShareCapital: { columns: EQUITY_SHARE_COLUMNS, rows: shareCapitalRows },
    otherEquity: { columns: OTHER_EQUITY_COLUMNS, rows: updatedOtherEquityRows },
  }), [financialData, shareCapitalRows, updatedOtherEquityRows]);
  // --- Handlers from here ---

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleExportMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchorEl(event.currentTarget);
  };
  
  const handleExportMenuClose = () => {
    setExportMenuAnchorEl(null);
  };
  
  const handleExcelExportClick = () => {
    handleExportClick();
    handleExportMenuClose();
  };
  
  const handlePdfExportClick = () => {
    handlePdfClick();
    handleExportMenuClose();
  };
  // Event handlers
  const handleToggleRow = (key: string) => {
    setExpandedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const handleExcelConfirm = () => {
    handleExportExcel(fullFinancialData, periodHeaders);
    setExcelConfirmOpen(false);
  };

  const handleToggleExpandAll = () => {
    if (expandedKeys.size === allExpandableKeys.length) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(new Set(allExpandableKeys));
    }
  };

  const handleShowCashFlow = () => {
    const newWindow = window.open(
      "",
      "_blank",
      "width=1400,height=800,scrollbars=yes,resizable=yes"
    );

    if (newWindow) {
      newWindow.document.title = "Edit Cash Flow Statement";
      const container = newWindow.document.createElement("div");
      newWindow.document.body.appendChild(container);
      newWindow.document.body.style.margin = "0";

      const newCache = createCache({
        key: 'mui-cashflow-popup',
        container: newWindow.document.head,
      });
      const links = Array.from(document.getElementsByTagName("link"));
      links.forEach((link) => {
        if (link.rel === "stylesheet") {
          newWindow.document.head.appendChild(link.cloneNode(true));
        }
      });

      setCashFlowEditorContainer(container);
      setCashFlowEmotionCache(newCache);
      setCashFlowEditorOpen(true);

      newWindow.addEventListener("beforeunload", () => {
        setCashFlowEditorOpen(false);
        setCashFlowEditorContainer(null);
        setCashFlowEmotionCache(null);
      });
    }
  };

  const handleEditNotes = (noteId?: number | string) => {
    const newWindow = window.open(
      "",
      "_blank",
      "width=1400,height=800,scrollbars=yes,resizable=yes"
    );

    if (newWindow) {
      newWindow.document.title = "Edit Financial Notes";
      const container = newWindow.document.createElement("div");
      container.id = 'notes-editor-root';
      newWindow.document.body.appendChild(container);
      newWindow.document.body.style.margin = "0";

      const newCache = createCache({
        key: 'mui-in-popup',
        container: newWindow.document.head,
      });

      const links = Array.from(document.getElementsByTagName("link"));
      links.forEach((link) => {
        if (link.rel === "stylesheet") {
          newWindow.document.head.appendChild(link.cloneNode(true));
        }
      });

      setEditorContainer(container);
      setEmotionCache(newCache);
      setNotesEditorOpen(true);

      if (noteId) {
        localStorage.setItem("selectedNoteId", noteId.toString());
      } else {
        localStorage.removeItem("selectedNoteId");
      }

      newWindow.addEventListener("beforeunload", () => {
        setNotesEditorOpen(false);
        setEditorContainer(null);
        setEmotionCache(null);
        localStorage.removeItem("selectedNoteId");
      });
    }
  };

  const handleCloseEditor = () => {
    if (editorContainer) {
      const editorWindow = editorContainer.ownerDocument.defaultView;
      editorWindow?.close();
    }
    setNotesEditorOpen(false);
    setEditorContainer(null);
  };

  const handleCloseCashFlowEditor = () => {
    if (cashFlowEditorContainer) {
      const cashFlowWindow = cashFlowEditorContainer.ownerDocument.defaultView;
      cashFlowWindow?.close();
    }
    setCashFlowEditorOpen(false);
    setCashFlowEditorContainer(null);
  };

  // This is the new, correct function
  const handleSaveChanges = (updatedNotesFromEditor: FinancialNote[]) => {
    
    // Part A: MERGE the newly edited notes with any previous edits to prevent data loss.
    setEditedNotes(prevEditedNotes => {
      const notesMap = new Map(prevEditedNotes.map(n => [String(n.noteNumber), n]));
      
      updatedNotesFromEditor.forEach(newNote => {
        notesMap.set(String(newNote.noteNumber), newNote);
      });
      
      return Array.from(notesMap.values());
    });
    
    // Part B: MERGE the newly edited note numbers to correctly track the "Edited" status.
    const justEditedKeys = updatedNotesFromEditor.map(note => String(note.noteNumber));
    setEditedNoteKeys(prevKeys => {
      const newKeys = new Set(prevKeys);
      justEditedKeys.forEach(key => newKeys.add(key));
      return newKeys;
    });

    if (useDatabase && selectedPeriods) {
        const periodKey = `${selectedPeriods.period1}_vs_${selectedPeriods.period2}`;
        
        fetch("http://localhost:5000/api/notes/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                noteNumbers: justEditedKeys,
                periodKey: periodKey
            }),
        })
        .then(response => {
            if (!response.ok) console.error("Failed to update note edit statuses.");
            else console.log("Successfully updated note edit statuses.");
        })
        .catch(error => console.error("Error updating note edit statuses:", error));
    }

    // --- The rest of your function to save to the backend is UNCHANGED ---
    // It correctly uses `updatedNotesFromEditor` (the function's parameter) for the backend update.
    const getEditedValueByKey = (
      key: string
    ): { valueCurrent: number | null; valuePrevious: number | null } => {
      if (!updatedNotesFromEditor) return { valueCurrent: null, valuePrevious: null };

      for (const note of updatedNotesFromEditor) {
        const result = findInContent(note.content, key);
        if (result) return result;
      }

      return { valueCurrent: null, valuePrevious: null };
    };

    const findInContent = (
      items: (HierarchicalItem | TableContent | string)[],
      key: string
    ): { valueCurrent: number | null; valuePrevious: number | null } | null => {
      for (const item of items) {
        if (typeof item !== "string" && "key" in item && item.key === key) {
          return {
            valueCurrent: item.valueCurrent ?? null,
            valuePrevious: item.valuePrevious ?? null,
          };
        }

        if (typeof item !== "string" && "children" in item && item.children) {
          const result = findInContent(item.children, key);
          if (result) return result;
        }
      }
      return null;
    };

    const updatedFinancialVar2 = financialVar2.map((row) => {
      const { key } = row;
      const edited = getEditedValueByKey(key);

      return {
        ...row,
        amountCurrent: edited.valueCurrent ?? row.amountCurrent,
        amountPrevious: edited.valuePrevious ?? row.amountPrevious,
      };
    });

    const renamedForServer = updatedFinancialVar2.map((row) => ({
      key: row.key,
      [currentAmountKeys.amountCurrentKey]: row.amountCurrent,
      [currentAmountKeys.amountPreviousKey]: row.amountPrevious,
    }));

    fetch("http://localhost:5000/api/update-financial-vars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(renamedForServer),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update financial vars");
        return response.json();
      })
      .then((data) => {
        console.log("✅ Financial variables updated:", data);
      })
      .catch((error) => {
        console.error("❌ Error updating financial variables:", error);
      });

    const getNarrativeTextByKey = (key: string): string | undefined => {
      for (const note of updatedNotesFromEditor) {
        for (const item of note.content) {
          if (typeof item !== "string" && "key" in item && item.key === key) {
            return item.narrativeText ?? undefined;
          }

          if (typeof item !== "string" && "children" in item && item.children) {
            const found = findInChildren(item.children, key);
            if (found) return found;
          }
        }
      }
      return undefined;
    };

    const findInChildren = (
      items: (HierarchicalItem | TableContent | string)[],
      key: string
    ): string | undefined => {
      for (const item of items) {
        if (typeof item !== "string" && "key" in item && item.key === key) {
          return item.narrativeText ?? undefined;
        }

        if (typeof item !== "string" && "children" in item && item.children) {
          const result = findInChildren(item.children, key);
          if (result) return result;
        }
      }
      return undefined;
    };

    const generateTextVarPayload = () => {
      const textVarUploadData = textVar2
        .filter((row) => row.key.includes("text"))
        .map((row) => {
          const { key } = row;
          const narrativeText =
            getNarrativeTextByKey(key) ?? `Default narrative for key: ${key}`;

          return {
            key,
            [currentAmountKeys.amountCurrentKey]: narrativeText,
          };
        });

      fetch("http://localhost:5000/api/update-text-vars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(textVarUploadData),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to update text vars");
          return response.json();
        })
        .then((data) => {
          console.log("✅ Text variables updated:", data);
        })
        .catch((error) => {
          console.error("❌ Error updating text variables:", error);
        });
    };

    generateTextVarPayload();

    const getTableContentByKey = (key: string): TableContent | null => {
      for (const note of updatedNotesFromEditor) {
        const result = findTableInContent(note.content, key);
        if (result) {
          return result;
        }
      }
      return null;
    };

    const findTableInContent = (
      items: (HierarchicalItem | TableContent | string)[],
      key: string
    ): TableContent | null => {
      for (const item of items) {
        if (typeof item !== "string" && "key" in item && item.key === key) {
          if (
            "type" in item &&
            item.type === "table" &&
            "headers" in item &&
            "rows" in item
          ) {
            return item as TableContent;
          }
        }

        if (typeof item !== "string" && "children" in item && item.children) {
          const result = findTableInContent(item.children, key);
          if (result) {
            return result;
          }
        }
      }
      return null;
    };

    const generateTablePayload = () => {
      const updatedTables = textVar2
        .filter((row) => row.key.includes("table"))
        .map((row) => {
          const { key } = row;
          const tableContent = getTableContentByKey(key);
          if (tableContent) {
            return {
              key,
              [currentAmountKeys.amountCurrentKey]: JSON.stringify(tableContent.rows),
            };
          }
          return null;
        })
        .filter(Boolean);

      fetch("http://localhost:5000/api/update-text-vars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTables),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to update text vars");
          return response.json();
        })
        .then((data) => {
          console.log("✅ Text variables updated:", data);
        })
        .catch((error) => {
          console.error("❌ Error updating text variables:", error);
        });
    };

    generateTablePayload();

    handleCloseEditor();
  };

  const handleSaveCashFlow = (updatedCashFlow: HierarchicalItem[]) => {
    setEditedCashFlow(updatedCashFlow);
    type KeyValueEntry = {
      key: string;
      valueCurrent: number | null;
      valuePrevious: number | null;
    };

    const extractKeyValuePairs = (
      items: HierarchicalItem[]
    ): KeyValueEntry[] => {
      const result: KeyValueEntry[] = [];

      const traverse = (itemList: HierarchicalItem[]) => {
        for (const item of itemList) {
          if ("key" in item && item.key) {
            result.push({
              key: item.key,
              valueCurrent: item.valueCurrent ?? null,
              valuePrevious: item.valuePrevious ?? null,
            });
          }

          if (item.children && item.children.length > 0) {
            traverse(item.children);
          }
        }
      };

      traverse(items);
      return result;
    };

    const extracted = extractKeyValuePairs(updatedCashFlow);
    const extractedMap = new Map<
      string,
      { valueCurrent: number | null; valuePrevious: number | null }
    >();
    extracted.forEach(({ key, valueCurrent, valuePrevious }) => {
      extractedMap.set(key, { valueCurrent, valuePrevious });
    });

    const updatedFinancialVar2 = financialVar2.map((row) => {
      const match = extractedMap.get(row.key);
      return {
        ...row,
        amountCurrent: match?.valueCurrent ?? row.amountCurrent,
        amountPrevious: match?.valuePrevious ?? row.amountPrevious,
      };
    });

    const renamedForServer = updatedFinancialVar2.map((row) => ({
      key: row.key,
      [currentAmountKeys.amountCurrentKey]: row.amountCurrent,
      [currentAmountKeys.amountPreviousKey]: row.amountPrevious,
    }));

    fetch("http://localhost:5000/api/update-financial-vars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(renamedForServer),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update financial vars");
        return response.json();
      })
      .then((data) => {
        console.log("✅ Financial variables updated:", data);
      })
      .catch((error) => {
        console.error("❌ Error updating financial variables:", error);
      });

    handleCloseCashFlowEditor();
  };

  const handleShowEquityEditor = () => {
    const newWindow = window.open("", "_blank", "width=1400,height=800,scrollbars=yes,resizable=yes");
    if (newWindow) {
      newWindow.document.title = "Edit Equity Statements";
      const container = newWindow.document.createElement("div");
      newWindow.document.body.appendChild(container);
      newWindow.document.body.style.margin = "0";

      const newCache = createCache({
        key: 'mui-equity-popup',
        container: newWindow.document.head,
      });
      
      const links = Array.from(document.getElementsByTagName("link"));
      links.forEach(link => {
        if (link.rel === "stylesheet") {
          newWindow.document.head.appendChild(link.cloneNode(true));
        }
      });
      
      setEquityEditorContainer(container);
      setEquityEmotionCache(newCache);
      setEquityEditorOpen(true);

      newWindow.addEventListener("beforeunload", () => {
        setEquityEditorOpen(false);
        setEquityEditorContainer(null);
        setEquityEmotionCache(null);
      });
    }
  };

  const handleCloseEquityEditor = () => {
    if (equityEditorContainer) {
      const equityWindow = equityEditorContainer.ownerDocument.defaultView;
      equityWindow?.close();
    }
    setEquityEditorOpen(false);
    setEquityEditorContainer(null);
  };

  const handleSaveEquity = (updatedShareRows: EquityRow[], updatedOtherRows: EquityRow[]) => {
    console.log("Saving Updated Share Capital Rows:", updatedShareRows);
    console.log("Saving Updated Other Equity Rows:", updatedOtherRows);
    
    setShareCapitalRows(updatedShareRows);
    setOtherEquityRows(updatedOtherRows);

    handleCloseEquityEditor();
  };

  const handleExportClick = () => {
    const { isTallying, message } = checkBalanceSheetTally(financialData);

    if (isTallying) {
      setExcelConfirmOpen(true);
    } else {
      setTallyError({ 
        open: true, 
        message, 
        actionToConfirm: () => setExcelConfirmOpen(true) 
      });
    }
  };

  const handlePdfClick = () => {
    const { isTallying, message } = checkBalanceSheetTally(financialData);

    if (isTallying) {
      setPdfModalOpen(true);
    } else {
      setTallyError({ 
        open: true, 
        message, 
        actionToConfirm: () => setPdfModalOpen(true) 
      });
    }
  };

  const handleTallyConfirm = () => {
    if (tallyError.actionToConfirm) {
      tallyError.actionToConfirm();
    }
    setTallyError({ open: false, message: '', actionToConfirm: null });
  };
  
  // Early returns after all hooks
  if (loading || (useDatabase && dbLoading)) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Loading Financial Data...</Typography>
        </Box>
    );
  }

if (useDatabase && (!selectedPeriods || databaseData.length === 0)) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: { xs: 4, sm: 8 } }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
          }}
        >
          {/* Main Header in the Outer Box */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <CalendarMonthIcon color="primary" sx={{ fontSize: { xs: 32, sm: 40 } }} />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'medium' }}>
              Generate Financial Report
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Please select the two financial periods you wish to compare.
          </Typography>

          {/* Inner Box for the Period Selector */}
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 2,
              width: '100%',
              bgcolor: 'background.default', // Ensures contrast against the outer paper
            }}
          >
            {/* 
              Your PeriodSelector component goes here. 
              It should contain its own title, dropdowns, and button as seen in the image.
            */}
            <PeriodSelector onPeriodsSelected={fetchDatabaseData} />
          </Paper>

          {/* Error message area */}
          {dbError && (
            <Box sx={{ width: '100%', mt: 3 }}>
              <Alert severity="error" variant="filled">
                {dbError}
              </Alert>
            </Box>
          )}
        </Paper>
      </Container>
    );
}

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Paper sx={{ p: { xs: 1, sm: 2 }, borderRadius: 2 }} elevation={3}>
            {/* <Box sx={{ p: 2 }}>
                <Typography variant="h4" component="h1" sx={{ textAlign: 'center' }}>
                    Financial Statements
                </Typography>
                <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                    For periods ending {periodHeaders.currentPeriod} and {periodHeaders.previousPeriod}
                </Typography>
            </Box> */}
{/* <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 2, overflowX: 'auto' }}>
    {[
        { label: 'EBITDA %', value: `${financialData.dashboardKPIs.ebitdaPercentage.toFixed(1)}%`, color: 'primary.main' },
        { label: 'Net Worth', value: financialData.dashboardKPIs.netWorth.toLocaleString(), color: 'success.main' },
        { label: 'Free Cash Flow', value: financialData.dashboardKPIs.freeCashFlow.toLocaleString(), color: 'secondary.main' },
        { label: 'Rev. Growth', value: `${financialData.dashboardKPIs.revenueGrowth.toFixed(1)}%`, color: 'warning.main' }
    ].map((kpi) => (
        <Paper key={kpi.label} elevation={2} sx={{ p: 2, minWidth: 180, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
            <Typography variant="h6" sx={{ color: kpi.color, fontWeight: 'bold' }}>{kpi.value}</Typography>
        </Paper>
    ))}
</Stack> */}
            <Toolbar
                variant="dense"
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    backgroundColor: 'action.hover',
                    borderRadius: 1,
                    p: 1,
                    mb: 2,
                }}
            >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={expandedKeys.size === allExpandableKeys.length ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={handleToggleExpandAll}
                    >
                        {expandedKeys.size === allExpandableKeys.length ? "Collapse All" : "Expand All"}
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditNotes()}
                    >
                        Edit Notes
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AssessmentIcon />}
                        onClick={() => setRatiosModalOpen(true)}
                    >
                        View Ratios
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<DashboardIcon />}
                        onClick={() => setDashboardOpen(true)}
                    >
                        Dashboard
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AssessmentIcon />}
                        onClick={() => setSchedulesDashboardOpen(true)}
                    >
                        Schedules
                    </Button>
                    <Button
                        id="export-button"
                        variant="contained"
                        color="secondary"
                        size="small"
                        aria-controls={isExportMenuOpen ? 'export-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={isExportMenuOpen ? 'true' : undefined}
                        onClick={handleExportMenuClick}
                        startIcon={<DownloadIcon />}
                    >
                        Export
                    </Button>
                    <Menu
                        id="export-menu"
                        anchorEl={exportMenuAnchorEl}
                        open={isExportMenuOpen}
                        onClose={handleExportMenuClose}
                    >
                        <MenuItem onClick={handleExcelExportClick}>
                            <ListItemIcon><TableViewIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Export to Excel</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handlePdfExportClick}>
                            <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>View Full PDF</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>

            <Divider />
            {/* --- ADD THIS IN Financialstatement.tsx ABOVE THE TABS --- */}
<Box sx={{ mb: 2 }}>
  {/* This loop shows all alerts at the same time */}
  {fullFinancialData.dashboardKPIs.alerts.map((alert :any, i:number) => (
    <Alert key={i} severity={alert.severity} variant="filled">
      {alert.message}
    </Alert>
  ))}
</Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="financial statements tabs" variant="fullWidth">
                    <Tab label="Balance Sheet" id="tab-0" />
                    <Tab label="Profit & Loss" id="tab-1" />
                    <Tab label="Cash Flow" id="tab-2" />
                    <Tab label="SOCIE" id="tab-3" />
                    <Tab label="Funds Flow" id="tab-4" />
                </Tabs>
            </Box>
            
            <TabPanel value={activeTab} index={0}>
              <Stack
  direction="row"
  justifyContent="center"
  alignItems="stretch"
  spacing={3}
  sx={{
    mb: 3,
    flexWrap: 'wrap',
    maxWidth: 900,
    mx: 'auto',
  }}
>
  <FinancialKPICard
    label="Net Worth"
    value={financialData.dashboardKPIs.netWorth}
    isCurrency
    color="#2e7d32"
  />
  <FinancialKPICard
    label="Total Debt"
    value={financialData.dashboardKPIs.totalDebt}
    isCurrency
    color="#d32f2f"
  />
  <FinancialKPICard
    label="Capital Employed"
    value={financialData.dashboardKPIs.capitalEmployed}
    isCurrency
    color="#1976d2"
  />
</Stack>

                <DrillDownTable
                    title="Balance Sheet"
                    data={financialData.balanceSheet}
                    expandedKeys={expandedKeys}
                    onToggleRow={handleToggleRow}
                    handleEditNotes={handleEditNotes}
                    periodHeaders={periodHeaders}
                />
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              <Stack
  direction="row"
  justifyContent="center"
  alignItems="stretch"
  spacing={3}
  sx={{
    mb: 3,
    flexWrap: 'wrap',
    maxWidth: 900,
    mx: 'auto',
  }}
>
                <FinancialKPICard  label="Rev Growth" value={financialData.dashboardKPIs.revenueGrowth} isPercent color="#ed6c02" />
                <FinancialKPICard  label="GM %" value={financialData.dashboardKPIs.gmPercentage} isPercent color="#1976d2" />
                <FinancialKPICard  label="EBITDA %" value={financialData.dashboardKPIs.ebitdaPercentage} isPercent color="#1976d2" />
                <FinancialKPICard  label="EBIT %" value={financialData.dashboardKPIs.ebitPercentage} isPercent color="#1976d2" />
                <FinancialKPICard  label="PAT %" value={financialData.dashboardKPIs.patPercentage} isPercent color="#2e7d32" />
                <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    marginTop: "20px"
  }}
>
  <FinancialKPICard  label="EPS (₹)" value={financialData.dashboardKPIs.eps} color="#9c27b0" />
</div>
                
             </Stack>
                <DrillDownTable
                    title="Statement of Profit and Loss"
                    data={financialData.incomeStatement}
                    expandedKeys={expandedKeys}
                    onToggleRow={handleToggleRow}
                    handleEditNotes={handleEditNotes}
                    periodHeaders={periodHeaders}
                />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Stack
  direction="row"
  justifyContent="center"
  alignItems="stretch"
  spacing={3}
  sx={{
    mb: 3,
    flexWrap: 'wrap',
    maxWidth: 900,
    mx: 'auto',
  }}
>
                <FinancialKPICard  label="Free Cash Flow (FCF)" value={financialData.dashboardKPIs.freeCashFlow} isCurrency color="#9c27b0" />
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleShowCashFlow}
                        startIcon={<EditIcon />}
                    >
                        Edit Cash Flow
                    </Button>
                </Box>
                <DrillDownTable
                    title="Cash Flow Statement"
                    data={financialData.cashFlow}
                    expandedKeys={expandedKeys}
                    onToggleRow={handleToggleRow}
                    handleEditNotes={handleEditNotes}
                    periodHeaders={periodHeaders}
                />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleShowEquityEditor} startIcon={<EditIcon />}>
                      Edit Equity
                    </Button>
                </Box>
                <EquityMultiTable
                    title="A. Equity Share Capital"
                    columns={EQUITY_SHARE_COLUMNS}
                    rows={shareCapitalRows}
                />
                <Box sx={{ mt: 4 }}>
                    <EquityMultiTable
                        title="B. Other Equity"
                        columns={OTHER_EQUITY_COLUMNS}
                        rows={updatedOtherEquityRows}
                    />
                </Box>
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
             <Stack
  direction="row"
  justifyContent="center"
  alignItems="stretch"
  spacing={3}
  sx={{
    mb: 3,
    flexWrap: 'wrap',
    maxWidth: 900,
    mx: 'auto',
  }}
>
        <FinancialKPICard  
            label="Working Capital Movement" 
            value={financialData.dashboardKPIs.workingCapitalChange} 
            isCurrency 
            color={financialData.dashboardKPIs.workingCapitalChange >= 0 ? "#2e7d32" : "#d32f2f"} 
        />
    </Stack>
  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: '#fcfcfc' }}>
    <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, textAlign: 'center', color: 'primary.dark' }}>
      Funds Flow Statement
    </Typography>

    {/* Main Flex Container for Side-by-Side View */}
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile, side-by-side on desktop
      gap: 0, 
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      
      {/* LEFT SIDE: SOURCES */}
      <Box sx={{ flex: 1, p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#2e7d32' }}></span>
          Sources of Funds
        </Typography>
        <Stack spacing={1.5}>
          {financialData.fundsFlow.sources.map((item: { label: any; amount: { toLocaleString: (arg0: undefined, arg1: { minimumFractionDigits: number; }) => string }; }, idx: number) => (
            <Box key={typeof item.label === 'string' || typeof item.label === 'number' ? String(item.label) : `source-${idx}`} sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed #eee' }}>
              <Typography variant="body2" color="text.secondary">{item.label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '2px solid #2e7d32' }}>
            <Typography sx={{ fontWeight: 'bold' }}>Total Sources</Typography>
            <Typography sx={{ fontWeight: 'bold' }}>
              {financialData.fundsFlow.sources.reduce((sum: any, s: { amount: any; }) => sum + s.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* VERTICAL DIVIDER (Visible only on desktop) */}
      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderRightWidth: 2 }} />
      <Divider orientation="horizontal" sx={{ display: { xs: 'block', md: 'none' } }} />

      {/* RIGHT SIDE: USES / APPLICATION */}
      <Box sx={{ flex: 1, p: 2, bgcolor: '#fff' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#d32f2f' }}></span>
          Application (Uses) of Funds
        </Typography>
        <Stack spacing={1.5}>
          {financialData.fundsFlow.uses.map((item: { label: any; amount: { toLocaleString: (arg0: undefined, arg1: { minimumFractionDigits: number; }) => string }; }, idx: number) => (
            <Box key={typeof item.label === 'string' || typeof item.label === 'number' ? String(item.label) : `use-${idx}`} sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed #eee' }}>
              <Typography variant="body2" color="text.secondary">{item.label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '2px solid #d32f2f' }}>
            <Typography sx={{ fontWeight: 'bold' }}>Total Applications</Typography>
            <Typography sx={{ fontWeight: 'bold' }}>
              {financialData.fundsFlow.uses.reduce((sum: any, u: { amount: any; }) => sum + u.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>

    <Typography variant="caption" sx={{ mt: 2, display: 'block', fontStyle: 'italic', color: 'text.disabled', textAlign: 'center' }}>
      * This statement shows the movement of working capital and non-current financial activities.
    </Typography>
  </Paper>
</TabPanel>
      </Paper>
      
      {/* --- Portals for Editors --- */}
      {isCashFlowEditorOpen && cashFlowEditorContainer && cashFlowEmotionCache && createPortal(
          <CacheProvider value={cashFlowEmotionCache}> 
            <CashFlowEditor
              cashFlowData={financialData.cashFlow}
              periodHeaders={periodHeaders}
              onSave={handleSaveCashFlow}
              onClose={handleCloseCashFlowEditor}
            />
          </CacheProvider>,
          cashFlowEditorContainer
      )}
      {isEquityEditorOpen && equityEditorContainer && equityEmotionCache && createPortal(
        <CacheProvider value={equityEmotionCache}>
          <EquityEditor
            shareCapitalData={{ columns: EQUITY_SHARE_COLUMNS, rows: shareCapitalRows }}
            otherEquityData={{ columns: OTHER_EQUITY_COLUMNS, rows: otherEquityRows }}
            onSave={handleSaveEquity}
            onClose={handleCloseEquityEditor}
          />
        </CacheProvider>,
        equityEditorContainer
      )}
      {isNotesEditorOpen && editorContainer && emotionCache && createPortal(
          <CacheProvider value={emotionCache}> 
            <NotesEditor
              financialVariable={financialVar2}
              amountKeys={currentAmountKeys}
              notes={financialData.notes}
              onSave={handleSaveChanges}
              onClose={handleCloseEditor}
            />
          </CacheProvider>,
          editorContainer
      )}

      {/* --- Modals and Dialogs --- */}
       <BalanceTallyDialog
        open={tallyError.open}
        onClose={() => setTallyError({ open: false, message: '', actionToConfirm: null })}
        onConfirm={handleTallyConfirm}
        message={tallyError.message}
      />
       <RatiosModal
        open={isRatiosModalOpen}
        onClose={() => setRatiosModalOpen(false)}
        ratios={calculatedRatios}
        periodHeaders={periodHeaders}
      />
      <RatioDashboard
        open={isDashboardOpen}
        onClose={() => setDashboardOpen(false)}
        ratios={calculatedRatios}
        periodHeaders={periodHeaders}
      />
      
      <SchedulesDashboard
        open={isSchedulesDashboardOpen}
        onClose={() => setSchedulesDashboardOpen(false)}
        data={[...financialData.balanceSheet, ...financialData.incomeStatement, ...financialData.cashFlow]}
        allNotes={financialData.notes} // <-- ADD THIS PROP
      />
      <ExcelConfirmDialog
        open={isExcelConfirmOpen}
        onClose={() => setExcelConfirmOpen(false)}
        onConfirm={handleExcelConfirm}
      />
      <PdfModal
        open={isPdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        data={fullFinancialData}
        periodHeaders={periodHeaders}
      />
    </Box>
  );
};

export default FinancialStatements;
