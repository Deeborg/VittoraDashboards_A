import { StyleSheet} from "@react-pdf/renderer";
import { FinancialData } from "./types";
// --- 2. STYLING & FORMATTING HELPERS ---
export const formatCurrency = (amount: number | null) => {
  if (amount === null || typeof amount === "undefined" || isNaN(amount)) {
    return "";
  }
  const value = amount;
  if (value < 0) {
    return `(${new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value))})`;
  }
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
// --- NEW: Type definition for a single calculated ratio ---
export interface CalculatedRatio {
    sNo: string;
    ratioMeasure: string;
    methodology: string;
    valueCurrent: number | string;
    valuePrevious: number | string;
    percentageChange: string;
}

// --- NEW: Formatting helpers for the Ratios Table ---
export const formatRatioValue = (value: number | string) => {
    if (typeof value !== 'number' || isNaN(value)) {
        return value; // Return strings like 'Not Applicable' as is
    }
    return value.toFixed(2);
};

export const formatPercentageValue = (value: string) => {
    if (value === 'N/A') return value;
    return `${value}%`;
};

//Tally
export const checkBalanceSheetTally = (data: FinancialData): { 
  isTallying: boolean; 
  message: string;
} => {
  // Find the main asset and liability rows using their unique keys from structures.ts
  const assets = data.balanceSheet.find(item => item.key === 'bs-assets');
  const liabilities = data.balanceSheet.find(item => item.key === 'bs-eq-liab');

  if (!assets || !liabilities) {
    // This is a safeguard in case the structure is missing.
    return { isTallying: false, message: 'Could not find Total Assets or Total Liabilities in the data structure.' }; 
  }

  // Round the values to 2 decimal places to avoid floating-point errors
  const currentAssets = parseFloat((assets.valueCurrent ?? 0).toFixed(2));
  const currentLiabilities = parseFloat((liabilities.valueCurrent ?? 0).toFixed(2));
  
  const previousAssets = parseFloat((assets.valuePrevious ?? 0).toFixed(2));
  const previousLiabilities = parseFloat((liabilities.valuePrevious ?? 0).toFixed(2));

  const currentDiff = currentAssets - currentLiabilities;
  const previousDiff = previousAssets - previousLiabilities;
  
  // Check if the absolute differences are negligible (less than a cent)
  const isTallying = Math.abs(currentDiff) < 0.01 && Math.abs(previousDiff) < 0.01;

  let message = '';
  if (!isTallying) {
    message = `The Balance Sheet totals do not match.\n\n- Current Period Difference: ${currentDiff.toFixed(2)}\n- Previous Period Difference: ${previousDiff.toFixed(2)}\n\nPlease review the data before proceeding.`;
  }

  return { isTallying, message };
};
//End


export const PDF_STYLES = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: "Helvetica" },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Helvetica-Bold",
  },
  section: { marginBottom: 15 },
  sectionHeader: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#f0f0f0",
    padding: 5,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#f0f0f0",
    padding: 4,
    fontFamily: "Helvetica-Bold",
  },
  colParticulars: { width: "55%", textAlign: "left" },
  colNote: { width: "10%", textAlign: "center" },
  colAmount: { width: "17.5%", textAlign: "right" },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: "center",
  },
  rowText: { fontFamily: "Helvetica" },
  rowTextBold: { fontFamily: "Helvetica-Bold" },
  grandTotalRow: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#333",
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginTop: 5,
    backgroundColor: "#f0f0f0",
  },
  subTotalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginTop: 2,
  },
  topLevelRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  policyBlock: { marginBottom: 12 },
  policyTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 4 },
  policyText: {
    fontFamily: "Helvetica",
    lineHeight: 1,
    textAlign: "justify",
    marginBottom: 2,
  },
  policyTable: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 8,
  },
  policyTableRow: { flexDirection: "row" },
  policyTableCell: {
    flex: 1,
    padding: 4,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#bfbfbf",
  },
  policyTableHeaderCell: {
    flex: 1,
    padding: 4,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#f0f0f0",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#bfbfbf",
  },
  notePageHeader: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },
  noteTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  noteSubtitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 10,
  },
  noteFooter: { fontSize: 9, marginTop: 15, fontFamily: "Helvetica" },
  noteRow: {
    flexDirection: "row",
    paddingVertical: 2,
    paddingHorizontal: 2,
    alignItems: "center",
  },
  noteColParticulars: { width: "40%", textAlign: "left" }, // Adjusted width
  noteColAmount: { width: "30%", textAlign: "right" }, // Adjusted width
  noteSubTotalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingVertical: 2,
    paddingHorizontal: 2,
    marginTop: 2,
    marginBottom: 5,
  },
  noteGrandTotalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderStyle: "solid",
    borderColor: "#333",
    paddingVertical: 3,
    paddingHorizontal: 2,
    marginTop: 5,
  },
  noteParagraph: {
    fontSize: 9,
    fontFamily: "Helvetica",
    textAlign: "justify",
    marginBottom: 8,
    lineHeight: 1.3,
  },
});