import { useMemo } from "react";
import {
  ACCOUNTING_POLICIES_CONTENT,
  BALANCE_SHEET_STRUCTURE,
  CASH_FLOW_STRUCTURE,
  INCOME_STATEMENT_STRUCTURE,
} from "./structures";
import {
  CashFlowItem,
  FinancialData,
  FinancialNote,
  FinancialVarRow,
  HierarchicalItem,
  MappedRow,
  TableContent,
  TemplateItem,
  TextVarRow,
    EquityColumn, // Add this
  EquityRow,    // Add this
} from "./types";
import { EQUITY_SHARE_COLUMNS, OTHER_EQUITY_COLUMNS } from "./Financialstatement";

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

// --- 4. CORE DATA PROCESSING HOOK (FIXED) ---
export const useFinancialData = (
  rawData: MappedRow[],
  financialVar2: FinancialVarRow[],
  textVar: TextVarRow[],
  editedNotes: FinancialNote[] | null,
  editedCashFlow: HierarchicalItem[] | null,
  periodHeaders: { currentPeriod: string; previousPeriod: string },
  shareCapitalRows: EquityRow[],
  baseOtherEquityRows: EquityRow[],
  editedNoteKeys: Set<string>
): FinancialData => {
  return useMemo(() => {
    console.log("editedNotes", editedNotes);

    

    const enrichedData = rawData.map((row) => ({
      ...row,
      amountCurrent: row.amountCurrent || 0,
      amountPrevious: row.amountPrevious || 0,
    }));

    const getAmount = (
      year: "amountCurrent" | "amountPrevious",
      level1Keywords?: string[], // Allow undefined safely
      level2Keywords?: string[]
    ): number => {
      if (!Array.isArray(level1Keywords) || level1Keywords.length === 0) {
        return 0; // Nothing to match => safe early return
      }

      return enrichedData.reduce((sum, row) => {
        const level1Desc = (row["Level 1 Desc"] || "").toLowerCase();
        const level2Desc = (row["Level 2 Desc"] || "").toLowerCase();

        const level1Match = level1Keywords.some((kw) =>
          level1Desc.includes(kw)
        );
        if (!level1Match) {
          return sum;
        }

        const level2Match =
          !level2Keywords ||
          (level2Keywords.length > 0 &&
            level2Keywords.some((kw) => level2Desc.includes(kw)));

        if (level2Match) {
          return sum + (row[year] ?? 0);
        }

        return sum;
      }, 0);
    };
    const getValueForKey = (
      noteKey: number,
      itemKey: string
    ): { valueCurrent: number | null; valuePrevious: number | null } => {
      const editedNote = editedNotes?.find((n) => n.noteNumber === noteKey);

      const findItem = (
        items: (HierarchicalItem | TableContent | string)[]
      ): { valueCurrent: number | null; valuePrevious: number | null } => {
        for (const item of items) {
          if (
            typeof item !== "string" &&
            "key" in item &&
            item.key === itemKey
          ) {
            return {
              valueCurrent:
                item.valueCurrent != null ? Number(item.valueCurrent) : null,
              valuePrevious:
                item.valuePrevious != null ? Number(item.valuePrevious) : null,
            };
          }
          if (typeof item !== "string" && "children" in item && item.children) {
            const childValue = findItem(item.children);
            if (
              childValue.valueCurrent !== null ||
              childValue.valuePrevious !== null
            ) {
              return childValue;
            }
          }
        }
        return { valueCurrent: null, valuePrevious: null };
      };

      // ✅ First try to get from editedNotes
      if (editedNote) {
        const editedValue = findItem(editedNote.content);
        if (
          editedValue.valueCurrent !== null ||
          editedValue.valuePrevious !== null
        ) {
          return editedValue;
        }
      }

      // ✅ Fallback to financialVar2
      const fallback = financialVar2.find((item) => item.key === itemKey);
      return {
        valueCurrent: fallback?.amountCurrent ?? null,
        valuePrevious: fallback?.amountPrevious ?? null,
      };
    };

    const getCashFlowValueByIdOrKey = (
      itemKey: string,
      editedCashFlow: CashFlowItem[] | null
    ): { valueCurrent: number | null; valuePrevious: number | null } => {
      const findItemRecursive = (
        items: CashFlowItem[] | undefined
      ): {
        valueCurrent: number | null;
        valuePrevious: number | null;
      } | null => {
        if (!items) return null;

        for (const item of items) {
          const matches = item.id === itemKey || item.key === itemKey;

          if (matches) {
            return {
              valueCurrent: item?.valueCurrent ?? 0,
              valuePrevious: item?.valuePrevious ?? 0,
            };
          }

          if (item.children && item.children.length > 0) {
            const found = findItemRecursive(item.children);
            if (found) return found;
          }
        }

        return null;
      };

      // 🔍 Check in editedCashFlow first
      if (editedCashFlow) {
        const fromEdited = findItemRecursive(editedCashFlow);
        if (fromEdited) return fromEdited;
      }

      // 🔍 Fallback to original
      const fallback = financialVar2.find((item) => item.key === itemKey);
      return {
        valueCurrent: fallback?.amountCurrent ?? 0,
        valuePrevious: fallback?.amountPrevious ?? 0,
      };
    };
    function evaluateFormula(
      formula: (string | number | "+" | "-")[],
      totals: Map<string, { current: number; previous: number }>
    ) {
      if (!formula || formula.length === 0) {
        return { current: null, previous: null };
      }

      let current: number | null = null;
      let previous: number | null = null;
      let operator: "+" | "-" = "+"; // default operator

      for (const token of formula) {
        if (token === "+" || token === "-") {
          operator = token;
          continue;
        }

        let val: { current: number; previous: number } | null = null;

        if (typeof token === "number") {
          // ✅ handle numeric constants directly
          val = { current: token, previous: token };
        } else {
          // ✅ look up totals map
          val = totals.get(token) ?? null;
        }

        if (!val) {
          return { current: null, previous: null }; // missing operand
        }

        if (current === null || previous === null) {
          // first operand
          current = val.current;
          previous = val.previous;
        } else {
          // subsequent operands
          current =
            operator === "+" ? current + val.current : current - val.current;
          previous =
            operator === "+"
              ? previous + val.previous
              : previous - val.previous;
        }
      }

      return { current, previous };
    }

    const findNarrativeText = (
      items: (HierarchicalItem | TableContent | string)[],
      key: string,
      textVar: TextVarRow[],
      defaultValue: string
    ): string => {
      // 1. First check if edit note is not blank, take value from edit note
      for (const item of items) {
        if (typeof item !== "string" && "key" in item && item.key === key) {
          const editNoteValue = item.narrativeText;
          if (editNoteValue && editNoteValue.trim() !== "") {
            return editNoteValue;
          }
        }

        if (typeof item !== "string" && "children" in item && item.children) {
          const result = findNarrativeText(
            item.children,
            key,
            textVar,
            defaultValue
          );
          if (result !== defaultValue) return result;
        }
      }

      // 2. If edit note is null/blank, get value from textVar using the key
      const textVarItem = textVar.find((item) => item.key === key);
      if (
        textVarItem &&
        textVarItem.amountCurrent &&
        textVarItem.amountCurrent.trim() !== ""
      ) {
        return textVarItem.amountCurrent;
      }

      // 3. If textVar value is null/blank, take the default value
      return defaultValue;
    };
    const getNarrativeTextByKey = (
      key: string,
      defaultValue: string = ""
    ): string => {
      if (!editedNotes) {
        // If no edited notes, try to get from textVar
        const textVarItem = textVar.find((item) => item.key === key);
        if (
          textVarItem &&
          textVarItem.amountCurrent &&
          textVarItem.amountCurrent.trim() !== ""
        ) {
          return textVarItem.amountCurrent;
        }
        return defaultValue;
      }

      for (const note of editedNotes) {
        const result = findNarrativeText(
          note.content,
          key,
          textVar,
          defaultValue
        );
        if (result !== defaultValue) return result;
      }

      // If not found in edited notes, try textVar
      const textVarItem = textVar.find((item) => item.key === key);
      if (
        textVarItem &&
        textVarItem.amountCurrent &&
        textVarItem.amountCurrent.trim() !== ""
      ) {
        return textVarItem.amountCurrent;
      }

      return defaultValue;
    };

    const getTableValue1 = (
      noteKey: number,
      keys: [string, ...string[]],
      rowLabel: string
    ): string[] | null => {
      // 1️⃣ First try from editedNotes
      const editedNote = editedNotes?.find((n) => n.noteNumber === noteKey);
      if (editedNote && editedNote.content?.length > 0) {
        for (const item of editedNote.content) {
          if (
            typeof item === "object" &&
            "type" in item &&
            item.type === "table"
          ) {
            const table = item as TableContent;
            if (table.isEditable) {
              const foundRow = table.rows.find(
                (row) => row[0]?.trim() === rowLabel.trim()
              );
              if (foundRow) return foundRow;
            }
          }
        }
      }

      // 2️⃣ Fallback: check all keys in textVar
      for (const key of keys) {
        const textVarItem = textVar.find((item) => item.key === key);
        if (!textVarItem) continue;

        // If table is stored as JSON string in amountCurrent
        if (
          "amountCurrent" in textVarItem &&
          typeof textVarItem.amountCurrent === "string"
        ) {
          try {
            const parsedRows = JSON.parse(
              textVarItem.amountCurrent
            ) as string[][];
            const foundRow = parsedRows.find(
              (row) => row[0]?.trim() === rowLabel.trim()
            );
            if (foundRow) return foundRow;
          } catch (err) {
            console.error(`Error parsing table for key ${key}`, err);
          }
        }

        // If it's already in rows format
        if ("rows" in textVarItem && Array.isArray(textVarItem.rows)) {
          const foundRow = textVarItem.rows.find(
            (row) => row[0]?.trim() === rowLabel.trim()
          );
          if (foundRow) return foundRow;
        }
      }

      return null;
    };
    const findItemInTree = (
      nodes: HierarchicalItem[],
      key: string
    ): HierarchicalItem | null => {
      for (const node of nodes) {
        if (node.key === key) return node;
        if (node.children) {
          const found = findItemInTree(node.children, key);
          if (found) return found;
        }
      }
      return null;
    };
    const totals = new Map<string, { current: number; previous: number }>();
    const calculateNote3 = (periodHeaders: {
      currentPeriod: string;
      previousPeriod: string;
    }): FinancialNote => {
      // Updated calculateRowTotal to sum columns 1 to 7 (exclusive of 'Total' column at index 8)
      const calculateRowTotal = (row: string[]): string => {
        const sum = row
          .slice(1, 8)
          .reduce(
            (acc, val) => acc + (parseFloat(val.replace(/,/g, "")) || 0),
            0
          );
        return sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      const parseNum = (val: string): number =>
        parseFloat(val.replace(/,/g, "")) || 0;

      // calculateBalance remains unchanged as per your request
      const calculateBalance = (
        rows: string[][],
        columnCount: number
      ): string[] => {
        const result: number[] = [];
        // Start from index 1 to skip the label column
        for (let i = 1; i < columnCount; i++) {
          const colSum = rows.reduce((sum, row) => sum + parseNum(row[i]), 0);
          result.push(colSum);
        }
        const total = result.reduce((sum, val) => sum + val, 0);
        return [
          "",
          ...result.map((val) =>
            val.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          ),
          total.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        ];
      };

      const calculateDifference = (
        row1: string[],
        row2: string[]
      ): string[] => {
        const diff: number[] = [];
        // Start from index 1 to skip the label column
        for (let i = 1; i <= 8; i++) {
          const val1 = parseNum(row1[i]);
          const val2 = parseNum(row2[i]);
          diff.push(val1 - val2);
        }
        return [
          "",
          ...diff.map((val) =>
            val.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          ),
        ];
      };

      // This is the updated, dynamic `row` function
      const row = (label: string, columnCount: number): string[] => {
        const edited = getTableValue1(
          3,
          ["note3-table1", "note3-table2", "note3-table3"],
          label
        );
        if (edited) return edited;
        const emptyRow = Array(columnCount).fill("");
        const r = [...emptyRow];
        r[0] = label;
        return r;
      };

      // --- First Table Headers (PPE) ---
      const ppeHeaders = [
        "",
        "Freehold land (Refer Note b)",
        "Buildings (Refer Note b)",
        "Plant and equipment",
        "Furniture and fixtures",
        "Vehicles",
        "Office equipment",
        "Leasehold improvements",
        "Total",
      ];
      const ppeColumnCount = ppeHeaders.length;

      // --- First Table Rows (PPE) ---
      const ppeRows = [];

      // Gross carrying amount section
      const grossCarryingRows = [
        row("Balance as at Bigning", ppeColumnCount),
        row("Additions Prev", ppeColumnCount),
        row("Disposals Prev", ppeColumnCount),
        row("Adjustments Prev", ppeColumnCount),
      ];
      // calculateRowTotal is called on these editable rows
      grossCarryingRows.forEach((r) => (r[8] = calculateRowTotal(r)));
      // balanceRow is calculated using calculateBalance, not calculateRowTotal
      const balanceRow = [
        `Balance as at ${periodHeaders.previousPeriod}`,
        ...calculateBalance(grossCarryingRows, ppeColumnCount).slice(1, -1),
      ];

      const additionalGrossCarryingRows = [
        row("Additions Curr", ppeColumnCount),
        row("Disposals Curr", ppeColumnCount),
        row("Adjustments Curr", ppeColumnCount),
      ];
      additionalGrossCarryingRows.forEach((r) => (r[8] = calculateRowTotal(r)));
      const balanceRow1 = [
        `Balance as at ${periodHeaders.currentPeriod}`,
        ...calculateBalance(
          [balanceRow, ...additionalGrossCarryingRows],
          ppeColumnCount
        ).slice(1, -1),
      ];

      ppeRows.push(
        ["Gross carrying amount"],
        ...grossCarryingRows,
        balanceRow,
        ...additionalGrossCarryingRows,
        balanceRow1
      );

      // Accumulated depreciation section
      const accumulatedDepreciationRows = [
        row("Balance as at Bigning (dep)", ppeColumnCount),
        row("Depreciation expense Prev", ppeColumnCount),
        row("Eliminated on disposal Prev", ppeColumnCount),
        row("Adjustments (dep) Prev ", ppeColumnCount),
      ];
      accumulatedDepreciationRows.forEach((r) => (r[8] = calculateRowTotal(r)));
      const balanceRow2 = [
        `Balance as at ${periodHeaders.previousPeriod}`,
        ...calculateBalance(accumulatedDepreciationRows, ppeColumnCount).slice(
          1,
          -1
        ),
      ];

      const additionalDepreciationRows = [
        row("Depreciation expense Curr", ppeColumnCount),
        row("Eliminated on disposal Curr", ppeColumnCount),
        row("Adjustments (dep) Curr", ppeColumnCount),
      ];
      additionalDepreciationRows.forEach((r) => (r[8] = calculateRowTotal(r)));
      const balanceRow3 = [
        `Balance as at ${periodHeaders.currentPeriod} (dep)`,
        ...calculateBalance(
          [balanceRow2, ...additionalDepreciationRows],
          ppeColumnCount
        ).slice(1, -1),
      ];

      ppeRows.push(
        ["Accumulated depreciation"],
        ...accumulatedDepreciationRows,
        balanceRow2,
        ...additionalDepreciationRows,
        balanceRow3
      );
      // Net carrying amount section
      const balance4 = calculateDifference(balanceRow, balanceRow2);
      balance4[0] = `As at ${periodHeaders.previousPeriod}`;
      const balance5 = calculateDifference(balanceRow1, balanceRow3);
      balance5[0] = `As at ${periodHeaders.currentPeriod}`;

      ppeRows.push(["Net carrying amount"], balance4, balance5);

      // --- Second Table Headers (CWIP Ageing) ---
      const cwipHeaders = [
        "CWIP",
        "Less than 1 year",
        "1-2 years",
        "2-3 years",
        "More than 3 years",
        "Total",
      ];
      const cwipColumnCount = cwipHeaders.length;

      const calculateCwipRowTotal = (row: string[]): string => {
        const sum = row
          .slice(1, 5) // Summing columns 1-4
          .reduce(
            (acc, val) => acc + (parseFloat(val.replace(/,/g, "")) || 0),
            0
          );
        return sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      // --- CWIP Ageing Table ---
      const cwipAgeingProjectsRow = row(
        "Projects in progress",
        cwipColumnCount
      );
      const cwipAgeingAdjustmentsRow = row(
        "Adjustments in progress",
        cwipColumnCount
      );

      // Calculate horizontal totals for the editable data rows
      cwipAgeingProjectsRow[5] = calculateCwipRowTotal(cwipAgeingProjectsRow);
      cwipAgeingAdjustmentsRow[5] = calculateCwipRowTotal(
        cwipAgeingAdjustmentsRow
      );

      // Directly assign the row data to the total rows
      const cwipAgeingTotal24 = [
        `Total as on ${periodHeaders.currentPeriod}`,
        ...cwipAgeingProjectsRow.slice(1),
      ];
      const cwipAgeingTotal23 = [
        `Total as on ${periodHeaders.previousPeriod}`,
        ...cwipAgeingAdjustmentsRow.slice(1),
      ];

      const cwipAgeingTableRows = [
        cwipAgeingProjectsRow,
        cwipAgeingAdjustmentsRow,
        cwipAgeingTotal24,
        cwipAgeingTotal23,
      ];

      // --- CWIP Completion Table ---
      const cwipCompletionProjectsRow = row(
        "Projects to be completed",
        cwipColumnCount
      );
      const cwipCompletionAdjustmentsRow = row(
        "Adjustments to be completed",
        cwipColumnCount
      );

      // Calculate horizontal totals for the editable data rows
      cwipCompletionProjectsRow[5] = calculateCwipRowTotal(
        cwipCompletionProjectsRow
      );
      cwipCompletionAdjustmentsRow[5] = calculateCwipRowTotal(
        cwipCompletionAdjustmentsRow
      );

      // Directly assign the row data to the total rows
      const cwipCompletionTotal24 = [
        `Total as on ${periodHeaders.currentPeriod}`,
        ...cwipCompletionProjectsRow.slice(1),
      ];
      const cwipCompletionTotal23 = [
        `Total as on ${periodHeaders.previousPeriod}`,
        ...cwipCompletionAdjustmentsRow.slice(1),
      ];

      const cwipCompletionTableRows = [
        cwipCompletionProjectsRow,
        cwipCompletionAdjustmentsRow,
        cwipCompletionTotal24,
        cwipCompletionTotal23,
      ];

    



      // --- END: Replace with this corrected block ---
      return {
        noteNumber: 3,
        title: "Property, plant and equipment (PPE)",
        totalCurrent: 0,
        totalPrevious: 0,
        footer: "Note : Figures in brackets relate to previous year.",
        content: [
          {
            key: "note3-table1",
            type: "table",
            isEditable: true,
            headers: ppeHeaders,
            rows: ppeRows,
          },
          {
            key: "note3-Contractual",
            label: "Contractual obligations",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          {
            key: "note3-text-a",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note3-text-a",
              `a)Unless otherwise stated all the assets are owned by the Company and none of the assets have been given on operating lease by the Company.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note3-text-b",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note3-text-b",
              `b) Charge as on 31 March 2023 ₹1,774.36 lakhs towards Freehold land and buildings has been released during the year. `
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note3-Capital",
            label: "Capital Work-in-Progress",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          {
            key: "note3-text-d",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note3-text-d",
              `The capital work-in-progress ageing schedule for the year ended 31 March 2024 is as follows:`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },

          {
            key: "note3-table2",
            type: "table",
            isEditable: true,
            headers: cwipHeaders,
            rows: cwipAgeingTableRows,
          },
          {
            key: "note3-text-c",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note3-text-c",
              `There is no such case, wherein Capital-work-in progress, whose completion is overdue or has exceeded its cost compared to its original plan.The capital work-in-progress completion schedule for the year ended 31 March 2024 is as follows:`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note3-table3",
            type: "table",
            isEditable: true,
            headers: cwipHeaders,
            rows: cwipCompletionTableRows,
          },
        ],
      };
    };
    const calculateNote4 = (periodHeaders: {
      currentPeriod: string;
      previousPeriod: string;
    }): FinancialNote => {
      const calculateRowTotal = (row: string[]): string => {
        const sum = row
          .slice(0, 4)
          .reduce(
            (acc, val) => acc + (parseFloat(val.replace(/,/g, "")) || 0),
            0
          );
        return sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };
      const parseNum = (val: string | undefined): number => {
        if (!val) return 0;
        return parseFloat(String(val).replace(/,/g, "")) || 0;
      };

      const row = (label: string, columnCount: number): string[] => {
        const edited = getTableValue1(
          4,
          ["note4-table1", "note4-table2", "note4-table3", "note4-table4"],
          label
        );
        if (edited) return edited;
        const emptyRow = Array(columnCount).fill("");
        emptyRow[0] = label;
        return emptyRow;
      };

      // --- TABLE 1: Right of Use (ROU) Assets ---
      const rouHeaders = ["", "Buildings", "Vehicles", "Total"];
      const rouColumnCount = rouHeaders.length;

      const calculateRouRowTotal = (r: string[]): string => {
        const sum = parseNum(r[1]) + parseNum(r[2]);
        return sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      const calculateRouBalance = (rows: string[][]): string[] => {
        const buildingsTotal = rows.reduce((sum, r) => sum + parseNum(r[1]), 0);
        const vehiclesTotal = rows.reduce((sum, r) => sum + parseNum(r[2]), 0);
        const grandTotal = buildingsTotal + vehiclesTotal;
        return [
          "",
          buildingsTotal.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          vehiclesTotal.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          grandTotal.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        ];
      };

      const calculateRouDifference = (
        row1: string[],
        row2: string[]
      ): string[] => {
        const buildingsDiff = parseNum(row1[1]) - parseNum(row2[1]);
        const vehiclesDiff = parseNum(row1[2]) - parseNum(row2[2]);
        const totalDiff = parseNum(row1[3]) - parseNum(row2[3]);
        return [
          "",
          buildingsDiff.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          vehiclesDiff.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          totalDiff.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        ];
      };

      const rouGrossRows1 = [
        row("Balance as at Bigning (ROU)", rouColumnCount),
        row("Additions (ROU)", rouColumnCount),
        row("Disposals/Adjustments (ROU)", rouColumnCount),
      ];
      rouGrossRows1.forEach((r) => {
        if (r.length > 3) r[3] = calculateRouRowTotal(r);
      });
      const rouBalance23 = [
        `Balance as at ${periodHeaders.previousPeriod}(ROU)`,
        ...calculateRouBalance(rouGrossRows1).slice(1),
      ];

      const rouGrossRows2 = [
        row("Additions  (ROU)", rouColumnCount),
        row("Deletions (ROU)", rouColumnCount),
      ];
      rouGrossRows2.forEach((r) => {
        if (r.length > 3) r[3] = calculateRouRowTotal(r);
      });
      const rouBalance24 = [
        `Balance as at ${periodHeaders.currentPeriod}`,
        ...calculateRouBalance([rouBalance23, ...rouGrossRows2]).slice(1),
      ];

      const rouDepRows1 = [
        row("Balance as at Bigning (ROU dep)", rouColumnCount),
        row("Amortisation (ROU)", rouColumnCount),
        row("Eliminated on disposal (ROU)", rouColumnCount),
      ];
      rouDepRows1.forEach((r) => {
        if (r.length > 3) r[3] = calculateRouRowTotal(r);
      });
      const rouDepBalance23 = [
        `Balance as at ${periodHeaders.previousPeriod} (ROU dep)`,
        ...calculateRouBalance(rouDepRows1).slice(1),
      ];

      const rouDepRows2 = [
        row("Amortisation  (ROU)", rouColumnCount),
        row("Deletions (ROU dep)", rouColumnCount),
      ];
      rouDepRows2.forEach((r) => {
        if (r.length > 3) r[3] = calculateRouRowTotal(r);
      });
      const rouDepBalance24 = [
        `Balance as at ${periodHeaders.currentPeriod} (ROU dep)`,
        ...calculateRouBalance([rouDepBalance23, ...rouDepRows2]).slice(1),
      ];

      const rouNetBalance23 = [
        `As at ${periodHeaders.previousPeriod}`,
        ...calculateRouDifference(rouBalance23, rouDepBalance23).slice(1),
      ];
      const rouNetBalance24 = [
        `As at ${periodHeaders.currentPeriod}`,
        ...calculateRouDifference(rouBalance24, rouDepBalance24).slice(1),
      ];

      // --- TABLE 2: Other Intangible Assets ---
      const intangibleHeaders = ["", "Computer Software"];
      const intangibleColumnCount = intangibleHeaders.length;

      const intangibleGrossRows1 = [
        row("Balance as at Bigning (Int)", intangibleColumnCount),
        row("Additions (Int) Prev", intangibleColumnCount),
        row("Disposal (Int) Prev", intangibleColumnCount),
      ];
      const intangibleBalance23 = [
        `Balance as at ${periodHeaders.previousPeriod} (Int)`,
        parseNum(intangibleGrossRows1[0][1]) +
          parseNum(intangibleGrossRows1[1][1]) -
          parseNum(intangibleGrossRows1[2][1]),
      ];
      const intangibleGrossRows2 = [
        row("Additions (Int) Curr", intangibleColumnCount),
        row("Disposal (Int) Curr", intangibleColumnCount),
      ];
      const intangibleBalance24 = [
        `Balance as at ${periodHeaders.currentPeriod} (Int)`,
        parseNum(String(intangibleBalance23[1])) +
          parseNum(intangibleGrossRows2[0][1]) -
          parseNum(intangibleGrossRows2[1][1]),
      ];
      const intangibleAmortRows1 = [
        row("Balance as at Bigning (Int amort)", intangibleColumnCount),
        row("Amortisation charge (Int) Prev", intangibleColumnCount),
        row("Eliminated on disposal (Int amort) Prev", intangibleColumnCount),
      ];
      const intangibleAmortBalance23 = [
        `Balance as at ${periodHeaders.previousPeriod} (Int amort)`,
        parseNum(intangibleAmortRows1[0][1]) +
          parseNum(intangibleAmortRows1[1][1]) -
          parseNum(intangibleAmortRows1[2][1]),
      ];
      const intangibleAmortRows2 = [
        row("Amortisation charge (Int) Curr", intangibleColumnCount),
        row("Eliminated on disposal (Int amort) Curr", intangibleColumnCount),
      ];
      const intangibleAmortBalance24 = [
        `Balance as at ${periodHeaders.currentPeriod} (Int amort)`,
        parseNum(String(intangibleAmortBalance23[1])) +
          parseNum(intangibleAmortRows2[0][1]) -
          parseNum(intangibleAmortRows2[1][1]),
      ];
      const intangibleNetBalance23 = [
        `As at ${periodHeaders.previousPeriod}`,
        parseNum(String(intangibleBalance23[1])) -
          parseNum(String(intangibleAmortBalance23[1])),
      ];
      const intangibleNetBalance24 = [
        `As at ${periodHeaders.currentPeriod}`,
        parseNum(String(intangibleBalance24[1])) -
          parseNum(String(intangibleAmortBalance24[1])),
      ];

      // --- TABLE 3 & 4: Intangibles under Development ---
      const devHeaders = [
        "Intangibles under development",
        "Amount in Intangibles under\nDevelopment for a period of Less\nthan 1 year",
        "Amount in Intangibles under\nDevelopment for a period of 1-2\nyears",
        "Amount in Intangibles under\nDevelopment for a period of 2-3\nyears",
        "Amount in Intangibles under\nDevelopment for a period of More\nthan 3 years",
        "Total",
      ];
      const devColCount = devHeaders.length;

      const calculateDevRowTotal = (r: string[]): string => {
        const sum =
          parseNum(r[1]) + parseNum(r[2]) + parseNum(r[3]) + parseNum(r[4]);
        return sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      // --- Ageing Table (Table 3) ---
      const devAgeingRow1 = row(
        "TAS Software Application Development (Intangible under development)(Ageing) Current",
        devColCount
      );
      const devAgeingRow2 = row("Previos", devColCount);

      devAgeingRow1[5] = calculateDevRowTotal(devAgeingRow1);
      devAgeingRow2[5] = calculateDevRowTotal(devAgeingRow2);

      // The 2024 total is a copy of the FIRST data row
      const totalAgeing24 = [
        `Total as on ${periodHeaders.currentPeriod}`,
        ...devAgeingRow1.slice(1),
      ];

      // FIX: The 2023 total is now a copy of the SECOND data row
      const totalAgeing23 = [
        `Total as on ${periodHeaders.previousPeriod}`,
        ...devAgeingRow2.slice(1),
      ];

      const cwipAgeingTableRows = [
        devAgeingRow1,
        devAgeingRow2,
        totalAgeing24,
        totalAgeing23,
      ];

      // --- Completion Table (Table 4) ---
      const completionHeaders = [
        "Intangibles under development",
        "To be completed in Less than 1\nyear",
        "To be completed in 1-2\nyears",
        "To be completed in 2-3\nyears",
        "To be completed in More than 3\nyears",
        "Total",
      ];
      const completionColCount = completionHeaders.length;

      const devCompletionRow1 = row(
        "TAS Software Application Development (Intangible under development)(Completion) Current",
        completionColCount
      );
      const devCompletionRow2 = row(" Previous", completionColCount);

      devCompletionRow1[5] = calculateDevRowTotal(devCompletionRow1);
      devCompletionRow2[5] = calculateDevRowTotal(devCompletionRow2);

      // The 2024 total is a copy of the FIRST data row
      const totalCompletion24 = [
        `Total as on ${periodHeaders.currentPeriod}`,
        ...devCompletionRow1.slice(1),
      ];

      // FIX: The 2023 total is now a copy of the SECOND data row
      const totalCompletion23 = [
        `Total as on ${periodHeaders.previousPeriod}`,
        ...devCompletionRow2.slice(1),
      ];

      const cwipCompletionTableRows = [
        // Note: This variable name seems like a typo in your original code but keeping for consistency
        devCompletionRow1, // Should be devCompletionRow1
        devCompletionRow2, // Should be devCompletionRow2
        totalCompletion24,
        totalCompletion23,
      ];

      // --- END: The code to replace ---

      return {
        noteNumber: 4,
        title: "Note 4a Right of Use (ROU) Assets",
        totalCurrent: 0,
        totalPrevious: 0,
        footer: "Note: Figures in brackets relate to previous year.",
        content: [
          {
            key: "note4-table1",
            type: "table",
            isEditable: true,
            headers: rouHeaders,
            rows: [
              ["Gross carrying value"],
              ...rouGrossRows1,
              rouBalance23,
              // ["Balance as at 1 April 2023", ...rouBalance23.slice(1)],
              ...rouGrossRows2,
              rouBalance24,
              ["Accumulated Depreciation"],
              ...rouDepRows1,
              rouDepBalance23,
              // ["Balance as at 1 April 2023 (dep)", ...rouDepBalance23.slice(1)],
              ...rouDepRows2,
              rouDepBalance24,
              ["Net carrying value"],
              rouNetBalance23,
              rouNetBalance24,
            ].map((r) => r.map((c) => String(c))),
          },
          {
            key: "note4-intangiable",
            label: "Note 4b Other Intangible assets",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          {
            key: "note4-table2",
            type: "table",
            isEditable: true,
            headers: intangibleHeaders,
            rows: [
              ["Gross carrying value"],
              ...intangibleGrossRows1,
              intangibleBalance23.map(String),
              // [
              //   "Balance as at 1 April 2023 (Int)",
              //   intangibleBalance23[1].toLocaleString("en-IN", {
              //     minimumFractionDigits: 2,
              //     maximumFractionDigits: 2,
              //   }),
              // ],
              ...intangibleGrossRows2,
              intangibleBalance24.map(String),
              ["Accumulated amortisation"],
              ...intangibleAmortRows1,
              intangibleAmortBalance23.map(String),
              // [
              //   "Balance as at 1 April 2023 (Int amort)",
              //   intangibleAmortBalance23[1].toLocaleString("en-IN", {
              //     minimumFractionDigits: 2,
              //     maximumFractionDigits: 2,
              //   }),
              // ],
              ...intangibleAmortRows2,
              intangibleAmortBalance24.map(String),
              ["Net carrying value"],
              intangibleNetBalance23.map(String),
              intangibleNetBalance24.map(String),
            ].map((r) => r.map((c) => String(c))),
          },
          {
            key: "note4-intangiable-devlopment",
            label: "Note 4c Intangibles under Development",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          "The intangibles under development ageing schedule for the year ended 31 March 2024 is as follows :",
          {
            key: "note4-table3",
            type: "table",
            isEditable: true,
            headers: devHeaders,
            rows: [devAgeingRow1, devAgeingRow2, totalAgeing24, totalAgeing23],
          },
          {
            key: "note4-text-a",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note4-text-a",
              `There is no such case, wherein Intangibles Under Development , whose completion is overdue or has exceeded its cost compared to its original plan .`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          "The intangibles under development completion schedule for the year ended 31 March 2024 is as follows :",
          {
            key: "note4-table4",
            type: "table",
            isEditable: true,
            headers: completionHeaders,
            rows: [
              devCompletionRow1,
              devCompletionRow2,
              totalCompletion24,
              totalCompletion23,
            ],
          },
        ],
      };
    };

    const calculateNote5 = (): FinancialNote => {
      const note5_1 = getValueForKey(5, "note5-nc-emp");
      const note5_2 = getValueForKey(5, "note5-c-emp");

      const nonCurrentTotal = {
        current: note5_1.valueCurrent,
        previous: note5_1.valuePrevious,
      };
      const currentTotal = {
        current: note5_2.valueCurrent,
        previous: note5_2.valuePrevious,
      };

      return {
        noteNumber: 5,
        title: "Financial assets",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note5-loans",
            label: "Loans",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note5-noncurrent",
            label: "Non-current",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note5-nc-emp-unsecured",
                label: "Unsecured, considered good",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note5-nc-emp",
                label: "  - Loans to employees",
                valueCurrent: nonCurrentTotal.current,
                valuePrevious: nonCurrentTotal.previous,
                isEditableRow: true,
              },
              {
                key: "note5-nc-emp-total",
                label: "",
                valueCurrent: nonCurrentTotal.current,
                valuePrevious: nonCurrentTotal.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note5-current",
            label: "Current",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note5-c-emp-unsecured",
                label: "Unsecured, considered good",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note5-c-emp",
                label: "  - Loans to employees",
                valueCurrent: currentTotal.current,
                valuePrevious: currentTotal.previous,
                isEditableRow: true,
              },
              {
                key: "note5-c-emp-total",
                label: "",
                valueCurrent: currentTotal.current,
                valuePrevious: currentTotal.previous,
                isGrandTotal: true,
              },
            ],
          },
        ],
      };
    };
    const calculateNote6 = (): FinancialNote => {
      const leasesNC = {
        current: getAmount(
          "amountCurrent",
          ["other non current financial assets "],
          ["net investment in lease- non current"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other non current financial assets "],
          ["net investment in lease- non current"]
        ),
      };
      const securityDeposits = {
        current: getAmount(
          "amountCurrent",
          ["other non current financial assets "],
          ["security deposits"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other non current financial assets "],
          ["security deposits"]
        ),
      };
      const earnestNC = {
        current: getAmount(
          "amountCurrent",
          ["other non current financial assets "],
          ["earnest money deposits with customers"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other non current financial assets "],
          ["earnest money deposits with customers"]
        ),
      };
      const otherReceivable = {
        current: getAmount(
          "amountCurrent",
          ["other current financial assets"],
          ["other recoverable from customers"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other current financial assets"],
          ["other recoverable from customers"]
        ),
      };

      const leasesC = {
        current: getAmount(
          "amountCurrent",
          ["other current financial assets"],
          ["net investment in lease- current"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other current financial assets"],
          ["net investment in lease- current"]
        ),
      };
      const earnestC = {
        current: getAmount(
          "amountCurrent",
          ["other current financial assets"],
          ["earnest money deposits with customers"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other current financial assets"],
          ["earnest money deposits with customers"]
        ),
      };
      const unbilled = {
        current: getAmount(
          "amountCurrent",
          ["other current financial assets"],
          ["unbilled receivable"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other current financial assets"],
          ["unbilled receivable"]
        ),
      };
      const interest = {
        current: getAmount(
          "amountCurrent",
          ["other current financial assets"],
          ["interest accrued but not due"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other current financial assets"],
          ["interest accrued but not due"]
        ),
      };
      const employeeBenefit = {
        current: getAmount(
          "amountCurrent",
          ["other current financial assets"],
          ["others : provision for compensated absences"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other current financial assets"],
          ["others : provision for compensated absences"]
        ),
      };

      const nonCurrentTotal = {
        current:
          leasesNC.current +
          securityDeposits.current +
          earnestNC.current +
          otherReceivable.current,
        previous:
          leasesNC.previous +
          securityDeposits.previous +
          earnestNC.previous +
          otherReceivable.previous,
      };
      const currentTotal = {
        current:
          leasesC.current +
          earnestC.current +
          unbilled.current +
          interest.current +
          employeeBenefit.current,
        previous:
          leasesC.previous +
          earnestC.previous +
          unbilled.previous +
          interest.previous +
          employeeBenefit.previous,
      };

      return {
        noteNumber: 6,
        title: "Other financial assets",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note6-noncurrent",
            label: "Non-current",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note6-nc-secured",
                label: "(secured, considered good)",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note6-nc-lease",
                label: "(a) Net investment in leases",
                valueCurrent: leasesNC.current,
                valuePrevious: leasesNC.previous,
              },
              {
                key: "note6-nc-secured-2",
                label: "(secured, considered good)",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note6-nc-sec",
                label: "(a) Security deposits",
                valueCurrent: securityDeposits.current,
                valuePrevious: securityDeposits.previous,
              },
              {
                key: "note6-nc-earnest",
                label: "(b) Earnest money deposits",
                valueCurrent: earnestNC.current,
                valuePrevious: earnestNC.previous,
              },
              {
                key: "note6-nc-other",
                label: "(c) Other receivable",
                valueCurrent: otherReceivable.current,
                valuePrevious: otherReceivable.previous,
              },
              {
                key: "note6-nc-total",
                label: "",
                valueCurrent: nonCurrentTotal.current,
                valuePrevious: nonCurrentTotal.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note6-current",
            label: "Current",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note6-c-secured",
                label: "(secured, considered good)",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note6-c-lease",
                label: "(a) Net investment in leases",
                valueCurrent: leasesC.current,
                valuePrevious: leasesC.previous,
              },
              {
                key: "note6-c-secured-1",
                label: "(Unsecured, considered good)",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note6-c-earnest",
                label: "(a) Earnest money deposits",
                valueCurrent: earnestC.current,
                valuePrevious: earnestC.previous,
              },
              {
                key: "note6-c-unbilled",
                label: "(b) Unbilled receivables",
                valueCurrent: unbilled.current,
                valuePrevious: unbilled.previous,
              },
              {
                key: "note6-c-interest",
                label: "(c) Interest accrued",
                valueCurrent: interest.current,
                valuePrevious: interest.previous,
              },
              {
                key: "note6-c-benefit",
                label: "(d) Employee compensated absences",
                valueCurrent: employeeBenefit.current,
                valuePrevious: employeeBenefit.previous,
              },
              {
                key: "note6-c-total",
                label: "",
                valueCurrent: currentTotal.current,
                valuePrevious: currentTotal.previous,
                isGrandTotal: true,
              },
            ],
          },
        ],
      };
    };
    const calculateNote7 = (): FinancialNote => {
      const note7_1 = getValueForKey(7, "note7-under-protest");

      const note7_2 = getValueForKey(7, "note7a-adv-tds");

      const note7_3 = getValueForKey(7, "note7a-provision");

      const note7_4 = getValueForKey(7, "note7-adv-tax");

      const note7_5 = getValueForKey(7, "note7-provision");

      const taxPaidUnderProtest = {
        current: note7_1.valueCurrent ?? 0,
        previous: note7_1.valuePrevious ?? 0,
      };
      const advanceTaxAndTDSLiab = {
        current: note7_2.valueCurrent ?? 0,
        previous: note7_2.valuePrevious ?? 0,
      };
      const provisionForTaxLiab = {
        current: note7_3.valueCurrent ?? 0,
        previous: note7_3.valuePrevious ?? 0,
      };
      const advanceTaxAndTDS = {
        current: note7_4.valueCurrent ?? 0,
        previous: note7_4.valuePrevious ?? 0,
      };
      const provisionForTaxAsset = {
        current: note7_5.valueCurrent ?? 0,
        previous: note7_5.valuePrevious ?? 0,
      };

      const netTaxAsset = {
        current: advanceTaxAndTDS.current - provisionForTaxAsset.current,
        previous: advanceTaxAndTDS.previous - provisionForTaxAsset.previous,
      };
      const netTaxLiability = {
        current: provisionForTaxLiab.current - advanceTaxAndTDSLiab.current,
        previous: provisionForTaxLiab.previous - advanceTaxAndTDSLiab.previous,
      };

      // --- Return a single FinancialNote object ---
      return {
        noteNumber: 7,
        title: "Income Tax",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          // Section 7: Income Tax Asset (Net)
          {
            key: "note7-asset-section",
            label: "7. Income Tax Asset (Net)",
            isSubtotal: true, // Acts as a header for this section
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note7-main",
                label:
                  "Advance income tax (net of provisions) (refer Note (i) below)",
                valueCurrent: netTaxAsset.current - taxPaidUnderProtest.current,
                valuePrevious:
                  netTaxAsset.previous - taxPaidUnderProtest.previous,
                children: [
                  {
                    key: "note7-under-protest",
                    label: "Income tax paid under protest",
                    valueCurrent: taxPaidUnderProtest.current,
                    valuePrevious: taxPaidUnderProtest.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note7-under-protest-total",
                    label: "",
                    valueCurrent:
                      netTaxAsset.current -
                      taxPaidUnderProtest.current +
                      taxPaidUnderProtest.current,
                    valuePrevious:
                      netTaxAsset.previous -
                      taxPaidUnderProtest.previous +
                      taxPaidUnderProtest.previous,
                    isGrandTotal: true,
                  },
                ],
              },
              {
                key: "note7-breakup",
                label: "Note (i)",
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note7-adv-tax",
                    label: "Advance tax and TDS",
                    valueCurrent: advanceTaxAndTDS.current,
                    valuePrevious: advanceTaxAndTDS.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note7-provision",
                    label: "Less: Provision for tax",
                    valueCurrent: provisionForTaxAsset.current,
                    valuePrevious: provisionForTaxAsset.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note7-breakup-total",
                    label: "",
                    valueCurrent: netTaxAsset.current,
                    valuePrevious: netTaxAsset.previous,
                    isGrandTotal: true,
                  },
                ],
              },
            ],
          },
          // Section 7a: Income Tax Liabilities (Net) - now part of the same content array
          {
            key: "note7-liability-section",
            label: "7a. Income Tax Liabilities (Net)",
            isSubtotal: true, // Acts as a header for this section
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note7a-main",
                label:
                  "Income tax provision (net of advance tax) (refer Note (ii) below)",
                valueCurrent: netTaxLiability.current,
                valuePrevious: netTaxLiability.previous,
              },
              {
                key: "note7-liability-section-total",
                label: "",
                valueCurrent: netTaxLiability.current,
                valuePrevious: netTaxLiability.previous,
                isGrandTotal: true,
              },
              {
                key: "note7a-breakup",
                label: "Note (ii)",
                isSubtotal: true,
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note7a-provision",
                    label: "Provision for tax",
                    valueCurrent: provisionForTaxLiab.current,
                    valuePrevious: provisionForTaxLiab.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note7a-adv-tds",
                    label: "Less: Advance tax and TDS",
                    valueCurrent: advanceTaxAndTDSLiab.current,
                    valuePrevious: advanceTaxAndTDSLiab.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note7a-breakup-total",
                    label: "",
                    valueCurrent: netTaxLiability.current,
                    valuePrevious: netTaxLiability.previous,
                    isGrandTotal: true,
                  },
                ],
              },
            ],
          },
        ],
      };
    };
    const calculateNote8 = (): FinancialNote => {
      const goodsInTransitRaw = {
        current: getAmount(
          "amountCurrent",
          ["inventories"],
          ["goods-in-transit- raw materials"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["inventories"],
          ["goods-in-transit- raw materials"]
        ),
      };
      const goodsInTransitStock = {
        current: getAmount(
          "amountCurrent",
          ["inventories"],
          ["goods-in-transit- (acquired for trading)"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["inventories"],
          ["goods-in-transit- (acquired for trading)"]
        ),
      };
      const allRawMaterials = {
        current: getAmount("amountCurrent", ["inventories"], ["raw material"]),
        previous: getAmount(
          "amountPrevious",
          ["inventories"],
          ["raw material"]
        ),
      };
      const allStockInTrade = {
        current: getAmount(
          "amountCurrent",
          ["inventories"],
          ["stock-in-trade"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["inventories"],
          ["stock-in-trade"]
        ),
      };
      const rawMaterials = {
        current: allRawMaterials.current - goodsInTransitRaw.current,
        previous: allRawMaterials.previous - goodsInTransitRaw.previous,
      };
      const stockInTrade = {
        current: allStockInTrade.current - goodsInTransitStock.current,
        previous: allStockInTrade.previous - goodsInTransitStock.previous,
      };
      const workInProgress = {
        current: getAmount(
          "amountCurrent",
          ["inventories"],
          ["work-in-progress"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["inventories"],
          ["work-in-progress"]
        ),
      };
      const rawMaterialsSubTotal = {
        current: rawMaterials.current + goodsInTransitRaw.current,
        previous: rawMaterials.previous + goodsInTransitRaw.previous,
      };
      const stockInTradeSubTotal = {
        current: stockInTrade.current + goodsInTransitStock.current,
        previous: stockInTrade.previous + goodsInTransitStock.previous,
      };
      const grandTotal = {
        current:
          rawMaterialsSubTotal.current +
          workInProgress.current +
          stockInTradeSubTotal.current +
          goodsInTransitStock.current,
        previous:
          rawMaterialsSubTotal.previous +
          workInProgress.previous +
          stockInTradeSubTotal.previous +
          goodsInTransitStock.previous,
      };

      return {
        noteNumber: 8,
        title: "Inventories",
        subtitle: "(At lower of cost and net realisable value)",
        totalCurrent: grandTotal.current,
        totalPrevious: grandTotal.previous,
        // footer:"As at March 31, 2024 ₹ 389.16 lakhs (as at March 31, 2023: ₹ 379.17 lakhs) was charged to statement of profit and loss for slow moving and obsolete inventories.",
        content: [
          {
            key: "note8-raw-mat-group",
            label: "(a) Raw materials",
            valueCurrent: rawMaterialsSubTotal.current,
            valuePrevious: rawMaterialsSubTotal.previous,
            isSubtotal: true,
            children: [
              {
                key: "note8-raw-mat",
                label: "Raw materials",
                valueCurrent: rawMaterials.current,
                valuePrevious: rawMaterials.previous,
              },
              {
                key: "note8-git-raw",
                label: "Goods-in-transit",
                valueCurrent: goodsInTransitRaw.current,
                valuePrevious: goodsInTransitRaw.previous,
              },
            ],
          },
          {
            key: "note8-wip",
            label: "(b) Work-in-progress",
            valueCurrent: workInProgress.current,
            valuePrevious: workInProgress.previous,
            isSubtotal: true,
            children: [],
          },
          {
            key: "note8-stock-group",
            label: "(c) Stock-in-trade (acquired for trading)",
            valueCurrent: stockInTradeSubTotal.current,
            valuePrevious: stockInTradeSubTotal.previous,
            isSubtotal: true,
            children: [
              // { key: 'note8-stock', label: 'Stock-in-trade', valueCurrent: stockInTrade.current, valuePrevious: stockInTrade.previous },
              {
                key: "note8-git-stock",
                label: "Goods-in-transit",
                valueCurrent: goodsInTransitStock.current,
                valuePrevious: goodsInTransitStock.previous,
              },
            ],
          },
          {
            key: "note8-total",
            label: "Total",
            valueCurrent: grandTotal.current,
            valuePrevious: grandTotal.previous,
            isGrandTotal: true,
            // children: [],
          },
          {
            key: "note8-text-a",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note8-text-a",
              `As at March 31, 2024 ₹ 389.16 lakhs (as at March 31, 2023: ₹ 379.17 lakhs) was charged to statement of profit and loss for slow moving and obsolete inventories.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
        ],
      };
    };
    const calculateNote9 = (periodHeaders: {
      currentPeriod: string;
      previousPeriod: string;
    }): FinancialNote => {
      // --- Hierarchical Item Calculations (YOUR ORIGINAL LOGIC - UNCHANGED) ---
      const tradeReceivables = getAmount(
        "amountCurrent",
        ["trade receivables"],
        ["trade receivables"]
      );
      const tradeReceivablesPrev = getAmount(
        "amountPrevious",
        ["trade receivables"],
        ["trade receivables"]
      );
      const doubtfulDebts = getAmount(
        "amountCurrent",
        ["trade receivables"],
        ["allowances for doubtful debts"]
      );
      const doubtfulDebtsPrev = getAmount(
        "amountPrevious",
        ["trade receivables"],
        ["allowances for doubtful debts"]
      );
      const consideredGoodCurrent = tradeReceivables - -doubtfulDebts;
      const consideredGoodPrevious = tradeReceivablesPrev - -doubtfulDebtsPrev;
      const creditImpairedCurrent = -doubtfulDebts;
      const creditImpairedPrevious = -doubtfulDebtsPrev;
      const subtotalCurrent = consideredGoodCurrent + creditImpairedCurrent;
      const subtotalPrevious = consideredGoodPrevious + creditImpairedPrevious;
      const allowanceCurrent = -doubtfulDebts;
      const allowancePrevious = -doubtfulDebtsPrev;
      const totalCurrent = subtotalCurrent - allowanceCurrent;
      const totalPrevious = subtotalPrevious - allowancePrevious;

      // --- Editable Table Logic (FINAL VERSION) ---
      const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
      const formatValue = (num: number) => num.toLocaleString("en-IN", options);
      const formatPrevValue = (num: number) =>
        `(${num.toLocaleString("en-IN", options)})`;
      // const formatPrevValue = (num: number) => {
      //   if (num < 0) {
      //     return `(${Math.abs(num).toLocaleString("en-IN", options)})`;
      //   }
      //   return num.toLocaleString("en-IN", options);
      // };

      const parseNum = (
        val: string | undefined,
        isPrevious = false
      ): number => {
        if (!val) return 0;
        const parts = String(val).split("\n");
        let targetPart = isPrevious ? parts[1] || "0" : parts[0] || "0";

        const isNegative = targetPart.includes("(") || targetPart.includes("-");
        // Remove formatting but keep the minus sign and decimal point
        targetPart = targetPart.replace(/[^0-9.-]/g, "");
        let num = parseFloat(targetPart) || 0;

        // if (isNegative && num > 0) {
        //   num = num;
        // }
        return num;
      };

      const row = (label: string, columnCount: number): string[] => {
        const edited = getTableValue1(9, ["note9-table1"], label);
        if (edited) return edited;

        // ✅ FIX #1: Initialize with empty strings for blank fields by default.
        const emptyRow = Array(columnCount).fill("");
        emptyRow[0] = label;
        return emptyRow;
      };

      const ageingHeaders = [
        "PARTICULARS",
        "Not due",
        "Less than 6 months",
        "6 months - 1 year",
        "1-2 years",
        "2-3 years",
        "More than 3 years",
        "Total",
      ];
      const ageingColumnCount = ageingHeaders.length;

      const undisputedGood = row(
        "Undisputed Trade receivables - considered good",
        ageingColumnCount
      );
      const undisputedImpaired = row(
        "Undisputed Trade receivables – credit impaired",
        ageingColumnCount
      );
      const disputedGood = row(
        "Disputed Trade Receivables – considered good",
        ageingColumnCount
      );
      const disputedRisk = row(
        "Disputed Trade Receivables – significant increase in credit risk",
        ageingColumnCount
      );
      const disputedImpaired = row(
        "Disputed Trade Receivables – credit impaired",
        ageingColumnCount
      );
      const allowanceRow = row(
        "Less: Allowance for credit loss",
        ageingColumnCount
      );

      // calculating right sum
      const allDataRows = [
        undisputedGood,
        undisputedImpaired,
        disputedGood,
        disputedRisk,
        disputedImpaired,
      ];

      allDataRows.forEach((r) => {
        let currentSum = 0;
        let prevSum = 0;
        for (let i = 1; i <= 6; i++) {
          currentSum += parseNum(r[i], false);
          prevSum += parseNum(r[i], true);
        }
        r[7] = `(${formatValue(currentSum)})\n${formatPrevValue(prevSum)}`;
      });

      //cslculating bottom sum
      const mainTotalRow = ["Total", ...Array(7).fill("")];
      for (let i = 1; i <= 7; i++) {
        const currentSum = allDataRows.reduce(
          (acc, r) => acc + parseNum(r[i], false),
          0
        );
        const prevSum = allDataRows.reduce(
          (acc, r) => acc + parseNum(r[i], true),
          0
        );
        mainTotalRow[i] = `${formatValue(currentSum)}\n${formatPrevValue(
          prevSum
        )}`;
      }

      let allowanceCurrentSum = 0;
      let allowancePrevSum = 0;
      for (let i = 1; i <= 6; i++) {
        allowanceCurrentSum += parseNum(allowanceRow[i], false);
        allowancePrevSum += parseNum(allowanceRow[i], true);
      }
      allowanceRow[7] = `${formatValue(allowanceCurrentSum)}\n${formatPrevValue(
        allowancePrevSum
      )}`;

      // ✅ FIX #4: Create two separate, single-value rows for the final totals.
      const totalReceivables24 = [
        `Total Trade Receivables as on ${periodHeaders.currentPeriod}`,
        "",
        "",
        "",
        "",
        "",
        "",
        formatValue(
          parseNum(mainTotalRow[7], false) - parseNum(allowanceRow[7], false)
        ),
      ];
      const totalReceivables23 = [
        `Total Trade Receivables as on ${periodHeaders.previousPeriod}`,
        "",
        "",
        "",
        "",
        "",
        "",
        formatPrevValue(
          parseNum(mainTotalRow[7], true) - parseNum(allowanceRow[7], true)
        ),
      ];

      return {
        noteNumber: 9,
        title: "Trade receivables (unsecured)",
        totalCurrent: totalCurrent,
        totalPrevious: totalPrevious,
        footer: "Note: Figures in brackets relate to previous year.",
        content: [
          {
            key: "note9-good",
            label: "Trade Receivables - Considered good",
            valueCurrent: consideredGoodCurrent,
            valuePrevious: consideredGoodPrevious,
          },
          {
            key: "note9-impaired",
            label: "Trade Receivables - Credit impaired",
            valueCurrent: creditImpairedCurrent,
            valuePrevious: creditImpairedPrevious,
          },
          {
            key: "note9-subtotal",
            label: "",
            isSubtotal: true,
            valueCurrent: subtotalCurrent,
            valuePrevious: subtotalPrevious,
          },
          {
            key: "note9-allowance",
            label: "Less: Allowances for credit impairment",
            valueCurrent: allowanceCurrent,
            valuePrevious: allowancePrevious,
          },
          {
            key: "note9-total",
            label: "Total",
            isGrandTotal: true,
            valueCurrent: totalCurrent,
            valuePrevious: totalPrevious,
          },
          "Expected credit loss",
          {
            key: "note9-text-a",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note9-text-a",
              `The Company uses a provision matrix to determine impairment loss on portfolio of its trade receivable.The provision matrix is based on its historically observed default rates over the expected life of the trade receivables and is adjusted for forward-looking estimates. At regular intervals, the historically observed default rates are updated and changes in forward-looking estimates are analysed.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },

          "The trade receivables ageing schedule for the year ended as on 31 March 2024 is as follows :",
          {
            key: "note9-table1",
            type: "table",
            isEditable: true,
            headers: ageingHeaders,
            rows: [
              undisputedGood,
              undisputedImpaired,
              disputedGood,
              disputedRisk,
              disputedImpaired,
              mainTotalRow,
              allowanceRow,
              totalReceivables24,
              totalReceivables23,
            ],
          },
        ],
      };
    };
    const calculateNote10 = (): FinancialNote => {
      // Non-current
      const nonCurrentGovt = {
        current: getAmount(
          "amountCurrent",
          ["other non current assets"],
          ["balances with government authorities"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other non current assets"],
          ["balances with government authorities"]
        ),
      };

      const nonCurrentPrepaid = {
        current: getAmount(
          "amountCurrent",
          ["other non current assets"],
          ["prepaid expenses"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other non current assets"],
          ["prepaid expenses"]
        ),
      };

      // Current
      const currentGovt = {
        current: getAmount(
          "amountCurrent",
          ["other current assets"],
          ["balances with government authorities"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other current assets"],
          ["balances with government authorities"]
        ),
      };

      const currentPrepaid = {
        current: getAmount(
          "amountCurrent",
          ["other current assets"],
          ["prepaid expenses"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other current assets"],
          ["prepaid expenses"]
        ),
      };

      const advToEmployees = {
        current: getAmount(
          "amountCurrent",
          ["other current assets"],
          ["advances to employees"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other current assets"],
          ["advances to employees"]
        ),
      };

      const advToRelated = {
        current: getAmount(
          "amountCurrent",
          ["other current assets"],
          ["advance to creditors-rp"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other current assets"],
          ["advance to creditors-rp"]
        ),
      };

      const advToOtherTotal = {
        current: getAmount(
          "amountCurrent",
          ["other current assets"],
          ["advance to creditors"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other current assets"],
          ["advance to creditors"]
        ),
      };

      const currentTotal =
        currentGovt.current +
        currentPrepaid.current +
        advToEmployees.current -
        6.39 -
        3.79 +
        advToRelated.current +
        advToOtherTotal.current +
        23.03 +
        0.07;

      const previousCurrentTotal =
        currentGovt.previous +
        currentPrepaid.previous +
        advToEmployees.previous -
        6.36 -
        2.73 +
        advToRelated.previous +
        advToOtherTotal.previous +
        151.42;

      return {
        noteNumber: 10,
        title: "Other assets",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note10-noncurrent",
            label: "Non-current",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "Non-current-unsecured",
                label: "Unsecured, considered good",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note10-nc-govt",
                label: "(a) Balances with government authorities",
                valueCurrent: nonCurrentGovt.current,
                valuePrevious: nonCurrentGovt.previous,
              },
              {
                key: "note10-nc-prepaid",
                label: "(b) Prepaid expenses",
                valueCurrent: nonCurrentPrepaid.current,
                valuePrevious: nonCurrentPrepaid.previous,
              },
              {
                key: "Non-current-total",
                label: "Total",
                valueCurrent:
                  nonCurrentGovt.current + nonCurrentPrepaid.current,
                valuePrevious:
                  nonCurrentGovt.previous + nonCurrentPrepaid.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note10-current",
            label: "Current",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note10-current-unsecured",
                label: "Unsecured, considered good",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note10-c-govt",
                label: "(a) Balances with Government authorities",
                valueCurrent: currentGovt.current,
                valuePrevious: currentGovt.previous,
              },
              {
                key: "note10-c-prepaid",
                label: "(b) Prepaid expenses",
                valueCurrent: currentPrepaid.current + 0.07,
                valuePrevious: currentPrepaid.previous,
              },
              {
                key: "note10-c-emp",
                label: "(c) Advances to employees",
                valueCurrent: advToEmployees.current - 6.39 - 3.79,
                valuePrevious: advToEmployees.previous - 6.36 - 2.73,
              },
              {
                key: "note10-c-cred",
                label: "(d) Advance to creditors",
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note10-c-cred-unrel",
                    label: "(i) Advances paid to other parties",
                    valueCurrent: advToOtherTotal.current + 23.03,
                    valuePrevious: advToOtherTotal.previous + 151.42,
                  },
                  {
                    key: "note10-c-cred-rel",
                    label:
                      "(ii) Advances paid to related parties (Refer note 31)",
                    valueCurrent: advToRelated.current,
                    valuePrevious: advToRelated.previous,
                  },
                ],
              },
            ],
          },
          {
            key: "note10-total",
            label: "Total",
            isGrandTotal: true,
            valueCurrent:
              currentGovt.current +
              currentPrepaid.current +
              0.07 +
              advToEmployees.current -
              6.39 -
              3.79 +
              advToOtherTotal.current +
              23.03 +
              advToRelated.current,
            valuePrevious:
              currentGovt.previous +
              currentPrepaid.previous +
              advToEmployees.previous -
              6.36 -
              2.73 +
              advToOtherTotal.previous +
              151.42 +
              advToRelated.previous,
          },
        ],
      };
    };
    const calculateNote11 = (): FinancialNote => {
      // [NEW] Logic for Note 10: Cash and cash equivalents
      const cashOnHand = {
        current: getAmount(
          "amountCurrent",
          ["cash and cash equivalents"],
          ["cash on hand"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["cash and cash equivalents"],
          ["cash on hand"]
        ),
      };
      const currentAccounts = {
        current: getAmount(
          "amountCurrent",
          ["cash and cash equivalents"],
          ["in current accounts"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["cash and cash equivalents"],
          ["in current accounts"]
        ),
      };
      const eefcAccounts = {
        current: getAmount(
          "amountCurrent",
          ["cash and cash equivalents"],
          ["in eefc accounts"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["cash and cash equivalents"],
          ["in eefc accounts"]
        ),
      };
      const deposits3Months = {
        current: getAmount(
          "amountCurrent",
          ["cash and cash equivalents"],
          ["fixed deposits with maturity less than 3 months"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["cash and cash equivalents"],
          ["fixed deposits with maturity less than 3 months"]
        ),
      };
      const unpaid = {
        current: getAmount(
          "amountCurrent",
          ["cash and cash equivalents"],
          ["unpaid dividend account"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["cash and cash equivalents"],
          ["unpaid dividend account"]
        ),
      };
      const capital = {
        current: getAmount(
          "amountCurrent",
          ["cash and cash equivalents"],
          ["capital reduction "]
        ),
        previous: getAmount(
          "amountPrevious",
          ["cash and cash equivalents"],
          ["capital reduction "]
        ),
      };
      const deposit = {
        current: getAmount(
          "amountCurrent",
          ["cash and cash equivalents"],
          ["fixed deposits with maturity greater than 3 months"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["cash and cash equivalents"],
          ["fixed deposits with maturity greater than 3 months"]
        ),
      };

      const others = {
        current: getAmount(
          "amountCurrent",
          ["cash and cash equivalents"],
          ["balances with banks"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["cash and cash equivalents"],
          ["balances with banks"]
        ),
      };

      const other = {
        current: unpaid.current + capital.current + deposit.current,
        previous: unpaid.previous + capital.previous + deposit.previous,
      };
      const earmarked = {
        current: unpaid.current + capital.current,
        previous: unpaid.previous + capital.previous,
      };
      const bank = {
        current:
          currentAccounts.current +
          eefcAccounts.current +
          deposits3Months.current,
        previous:
          currentAccounts.previous +
          eefcAccounts.previous +
          deposits3Months.previous,
      };

      return {
        noteNumber: 11,
        title: "Cash and cash equivalents",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note10-coh",
            label: "(a) Cash on hand",
            valueCurrent: cashOnHand.current,
            valuePrevious: cashOnHand.previous,
          },
          {
            key: "note10-bwb-group",
            label: "(b) Balances with banks",
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note10-bwb-ca",
                label: "(i) In current accounts",
                valueCurrent: currentAccounts.current,
                valuePrevious: currentAccounts.previous,
              },
              {
                key: "note10-bwb-eefc",
                label: "(ii) In EEFC accounts",
                valueCurrent: eefcAccounts.current,
                valuePrevious: eefcAccounts.previous,
              },
              {
                key: "note10-bwb-dep",
                label:
                  "(iii) In deposit accounts (original maturity of 3 months or less)",
                valueCurrent: deposits3Months.current,
                valuePrevious: deposits3Months.previous,
              },
              {
                key: "note11-total",
                label: "",
                valueCurrent: cashOnHand.current + bank.current,
                valuePrevious: cashOnHand.previous + bank.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note10-bwb-group-other",
            label: "Other Bank Balances",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
            children: [
              {
                key: "note10-bwb",
                label: "(a) In earmarked Accounts",
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note10-bwb-unpaid",
                    label: "  - Unpaid dividend account(Refer note 12 (f))",
                    valueCurrent: unpaid.current,
                    valuePrevious: unpaid.previous,
                  },
                  {
                    key: "note10-bwb-capital",
                    label: "   - Capital Reduction",
                    valueCurrent: capital.current,
                    valuePrevious: capital.previous,
                  },
                ],
              },
              {
                key: "note10-bwb-deposit",
                label:
                  "(b) In deposit accounts (original maturity of more than 3 months but less than 12 months)",
                valueCurrent: deposit.current,
                valuePrevious: deposit.previous,
              },
              {
                key: "note10-bwb-group-other-total",
                label: "",
                valueCurrent: other.current,
                valuePrevious: other.previous,
                isGrandTotal: true,
              },
            ],
          },
        ],
      };
    };
    const calculateNote12 = (periodHeaders: {
      currentPeriod: string;
      previousPeriod: string;
    }): FinancialNote => {
      // Create a normal editable row
      const createEditableRow = (
        label: string,
        columnCount: number
      ): string[] => {
        const edited = getTableValue1(
          12,
          [
            "note12-table1",
            "note12-table2",
            "note12-table3",
            "note12-table4",
            "note12-table5",
            "note12-table6",
          ],
          label
        );
        if (edited) return edited;
        const emptyRow = Array(columnCount).fill("");
        emptyRow[0] = label;
        return emptyRow;
      };

      const parseNum = (val: string): number =>
        parseFloat(val.replace(/,/g, "")) || 0;

      const calculateBalance = (
        rows: string[][],
        columnCount: number
      ): string[] => {
        const result: number[] = [];
        for (let i = 1; i < columnCount; i++) {
          const colSum = rows.reduce((sum, row) => sum + parseNum(row[i]), 0);
          result.push(colSum);
        }
        return [
          "",
          ...result.map((val) =>
            val.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          ),
        ];
      };

      // ===== Table 1: Equity Share Capital =====
      const table1Headers = [
        "",
        `As at ${periodHeaders.currentPeriod}`,
        //"As at 31 March 2024\nNumber",
        "\nAmount",
        `As at ${periodHeaders.previousPeriod}`,
        //"As at 31 March 2023\nNumber",
        "\nAmount",
      ];
      const table1ColumnCount = table1Headers.length;

      const equitySharesRow = createEditableRow(
        "Equity shares of ₹ 10 each",
        table1ColumnCount
      );
      const unclassifiedSharesRow = createEditableRow(
        "Unclassified shares of ₹ 10 each",
        table1ColumnCount
      );
      const issuedCapitalRow = createEditableRow(
        "Issued Share Capital\nEquity shares of ₹ 10 each",
        table1ColumnCount
      );
      const subscribedCapitalRow = createEditableRow(
        "Subscribed and fully paid up\nEquity shares of ₹ 10 each",
        table1ColumnCount
      );
      const issuedSubscribedRows = [subscribedCapitalRow];
      const totalIssuedSubscribedRow = calculateBalance(
        issuedSubscribedRows,
        table1ColumnCount
      );

      // ===== Table 2: Reconciliation =====
      const table2Headers = [
        "",
        `As at ${periodHeaders.currentPeriod}`,
        // "As at 31 March 2024\nNumber",
        "\nAmount",
        `As at ${periodHeaders.previousPeriod}`,
        // "As at 31 March 2023\nNumber",
        "\nAmount",
      ];
      const table2ColumnCount = table2Headers.length;
      const balanceBeginningRow = createEditableRow(
        "Balances as at the beginning of the year",
        table2ColumnCount
      );
      const balanceEndRow = createEditableRow(
        "Balance at the end of the year",
        table2ColumnCount
      );

      // ===== Table 3: Holding Company =====
      const table3Headers = [
        "",
        `As at ${periodHeaders.currentPeriod}`,
        //"As at 31 March 2024\nNumber",
        "\nAmount",
        `As at ${periodHeaders.previousPeriod}`,
        // "As at 31 March 2023\nNumber",
        "\nAmount",
      ];
      const table3ColumnCount = table3Headers.length;
      const yokogawaHoldingRow = createEditableRow(
        "Yokogawa Electric Corporation",
        table3ColumnCount
      );

      // ===== Table 4: Shareholders > 5% =====
      const table4Headers = [
        "",
        `As at ${periodHeaders.currentPeriod}`,
        // "As at 31 March 2024\nNumber",
        "\nPercentage",
        `As at ${periodHeaders.previousPeriod}`,
        //"As at 31 March 2023\nNumber",
        "\nPercentage",
      ];
      const table4ColumnCount = table4Headers.length;
      const yokogawaShareholderRow = createEditableRow(
        "Yokogawa Electric Corporation and its nominees",
        table4ColumnCount
      );

      // ===== Table 5: Promoter's Shareholding 2024 (STATIC VALUES) =====
      const table5Headers = [
        "SL.No",
        "Promoter Name",
        "No. of shares held",
        "% of total shares",
        "% change during the year",
      ];
      const promoterRows2024 = [
        [
          "1",
          "Yokogawa Electric Corporation, Japan",
          "85,05,469",
          "100%",
          "No change during the year",
        ],
      ];

      // ===== Table 6: Promoter's Shareholding 2023 (STATIC VALUES) =====
      const table6Headers = [
        "SL.No",
        "Promoter Name",
        "No. of shares held",
        "% of total shares",
        "% change during the year",
      ];
      const promoterRows2023 = [
        [
          "1",
          "Yokogawa Electric Corporation, Japan",
          "85,05,469",
          "100%",
          "No change during the year",
        ],
      ];

      return {
        noteNumber: 12,
        title: "Equity Share Capital",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note12-table1",
            type: "table",
            isEditable: true,
            headers: table1Headers,
            rows: [
              ["Authorised"],
              equitySharesRow,
              unclassifiedSharesRow,
              ["Issued Share Capital"],
              issuedCapitalRow,
              ["Subscribed and fully paid up"],
              subscribedCapitalRow,
              totalIssuedSubscribedRow,
            ],
          },
          "Refer note (a) to (d) below",
          "(a) Reconciliation of the number of shares and amount outstanding at the beginning and at the end of the reporting period:",
          {
            key: "note12-table2",
            type: "table",
            isEditable: true,
            headers: table2Headers,
            rows: [
              ["Equity shares of ₹ 10 each par value"],
              balanceBeginningRow,
              balanceEndRow,
            ],
          },
          "(b) Terms and rights attached to equity shares",
          {
            key: "note12-text-a",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note12-text-a",
              `The Company has only one class of equity shares having a par value of ₹ 10 per share. Each equity share is entitled to one vote per share. The dividend, if any, proposed by the Board of Directors is subject to the approval of the shareholders in the ensuing Annual General Meeting and shall be payable in Indian rupees. In the event of liquidation of the company, the shareholders will be entitled to receive remaining assets of the company, after distribution of all preferential amounts.The distribution will be in proportion to the number of equity shares held by the shareholders.
There have been no issues with respect to unclassified shares.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          "(c) Details of shares held by the holding company",
          {
            key: "note12-table3",
            type: "table",
            isEditable: true,
            headers: table3Headers,
            rows: [["Holding Company:"], yokogawaHoldingRow],
          },
          "(d) Details of shares held by each shareholder holding more than 5% shares:",
          {
            key: "note12-table4",
            type: "table",
            isEditable: true,
            headers: table4Headers,
            rows: [
              ["Equity shares of ₹ 10 each, par value"],
              yokogawaShareholderRow,
            ],
          },
          "(e) In the period of five years immediately preceding the Balance Sheet date, the Company has not issued any bonus shares or has bought back any shares.",
          "(f) Capital Reduction",
          {
            key: "note12-text-b",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note12-text-b",
              `The Company considered the Reduction of Share Capital on selective basis by reducing the capital to the extent of the holding by the shareholders other than the promoter shareholders. Before the capital reduction, 97.21% of the share capital was held by M/s. Yokogawa Electric Corporation and the balance 2.79% by public. It was therefore proposed to reduce and hence cancel the portion of the shares held by the public by 2.79% (244,531 number of shares). The Board of Directors during the 147th Meeting held on 13th November 2017 and the shareholders during the Extra Ordinary General Meeting held on 11th January 2018 have considered and approved the proposal of selective capital reduction.
The Company had accordingly filed petition with the Hon'ble Tribunal (National Company Law Tribunal-Bengaluru Bench) to reduce the issued, subscribed and paid up share capital of the company consisting of 244,531 equity shares of INR 10/- each fully paid up (INR 2,445,310/-), held by shareholders belonging to non-promoter group and cancel along with the securities premium/free reserves of the Company. The reduction and cancellation is effected by returning the paid-up equity share capital along with the securities premium lying to the credit of the securities premium account and free reserves to the shareholders belonging to non-promoter group ( “Public Shareholders”) in cash at the rate of INR 923.20/- which includes the paid up share capital and the premium amount thereon.
The National Company Law Tribunal vide its order dated  9th May, 2019 confirmed the petition for the reduction of the share capital of the Company. The company pursuant to the order of the Hon'ble Tribunal discharged the dues to the shareholders whose shares were reduced by depositing the fund with an Escrow Account opened for the purpose and paying the shareholders out of this account by Bank Transfer or Draft or other mode as indicated by the respective shareholder with the Company. For the year ended 31st March 2024 the capital reduction liability payable to shareholders has been discharged to the extent of Rs. 92,320/-.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          `(g) Promoter's Shareholding as on 31 March 2024 :`,
          {
            key: "note12-table5",
            type: "table",
            isEditable: false, // make non-editable to match screenshot 2
            headers: table5Headers,
            rows: promoterRows2024,
          },
          `(h) Promoter's Shareholding as on 31st March 2023 :`,
          {
            key: "note12-table6",
            type: "table",
            isEditable: false, // make non-editable to match screenshot 2
            headers: table6Headers,
            rows: promoterRows2023,
          },
        ],
      };
    };
    const calculateNote13 = (): FinancialNote => {
      const note13_1 = getValueForKey(13, "note13-opening");

      const note13_2 = getValueForKey(13, "note13-profit");

      const note13_3 = getValueForKey(13, "note13-dividends");

      const note13_4 = getValueForKey(13, "note13-oci");

      const note13_5 = getValueForKey(13, "note13-reserve");

      const retainedOpening = {
        current: note13_1.valueCurrent ?? 0,
        previous: note13_1.valuePrevious ?? 0,
      };
      const transferredProfit = {
        current: note13_2.valueCurrent ?? 0,
        previous: note13_2.valuePrevious ?? 0,
      };
      const dividendsPaid = {
        current: note13_3.valueCurrent ?? 0,
        previous: note13_3.valuePrevious ?? 0,
      };
      const oci = {
        current: note13_4.valueCurrent ?? 0,
        previous: note13_4.valuePrevious ?? 0,
      };
      const generalReserve = {
        current: note13_5.valueCurrent ?? 0,
        previous: note13_5.valuePrevious ?? 0,
      };

      const retainedClosing = {
        current: Number(
          (
            retainedOpening.current +
            transferredProfit.current +
            dividendsPaid.current
          ).toFixed(2)
        ),
        previous: Number(
          (
            retainedOpening.previous +
            transferredProfit.previous +
            dividendsPaid.previous
          ).toFixed(2)
        ),
      };

      const total = {
        current: retainedClosing.current + oci.current + generalReserve.current,
        previous:
          retainedClosing.previous + oci.previous + generalReserve.previous,
      };

      return {
        noteNumber: 13,
        title: "Other Equity",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note13-retained",
            label: "a) Retained Earnings*",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note13-opening",
                label: "Balance at the beginning of the year",
                valueCurrent: retainedOpening.current,
                valuePrevious: retainedOpening.previous,
                isEditableRow: true,
              },
              {
                key: "note13-profit",
                label:
                  "Add: Transferred from surplus in statement of profit and loss",
                valueCurrent: transferredProfit.current,
                valuePrevious: transferredProfit.previous,
                isEditableRow: true,
              },
              {
                key: "note13-dividends",
                label: "Less: Dividends Paid",
                valueCurrent: dividendsPaid.current,
                valuePrevious: 0,
                isEditableRow: true,
              },
              {
                key: "note13-closing",
                label: "Balance at the end of year",
                valueCurrent: retainedClosing.current,
                valuePrevious: retainedClosing.previous,
              },
            ],
          },
          {
            key: "note13-oci",
            label: "b) Other Comprehensive Income#",
            valueCurrent: oci.current,
            valuePrevious: oci.previous,
            isEditableRow: true,
          },
          {
            key: "note13-reserve",
            label: "c) General reserve ^",
            valueCurrent: generalReserve.current,
            valuePrevious: generalReserve.previous,
            isEditableRow: true,
          },
          {
            key: "note13-total",
            label: "",
            isGrandTotal: true,
            valueCurrent: total.current,
            valuePrevious: total.previous,
          },
        ],
        footer:
          `* Retained earning comprises of the amounts that can be distributed as dividends to its equity shareholders.\n` +
          `# Actuarial gain or losses on gratuity are recognised in other comprehensive income.\n` +
          `^ This represents appropriation of profit by the company.`,
      };
    };
    const calculateNote14 = (periodHeaders: {
      currentPeriod: string;
      previousPeriod: string;
    }): FinancialNote => {
      // --- Hierarchical Item Calculations (YOUR ORIGINAL LOGIC - UNCHANGED) ---
      const msme = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["trade payables"],
            [
              "total outstanding dues of micro enterprises and small enterprises",
            ]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["trade payables"],
            [
              "total outstanding dues of micro enterprises and small enterprises",
            ]
          ),
      };
      const nonMsme = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["trade payables"],
            [
              "dues to related parties",
              "total outstanding dues of creditors other than micro enterprises and small enterprises",
              "creditors other than micro",
            ]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["trade payables"],
            [
              "dues to related parties",
              "total outstanding dues of creditors other than micro enterprises and small enterprises",
              "creditors other than micro",
            ]
          ),
      };
      const grandTotal = {
        current: msme.current + nonMsme.current,
        previous: msme.previous + nonMsme.previous,
      };

      // --- Editable Table Logic ---
      const parseNum = (val: string): number => {
        if (!val) return 0;
        return parseFloat(String(val).replace(/,/g, "")) || 0;
      };

      const row = (label: string, columnCount: number): string[] => {
        const edited = getTableValue1(14, ["note14-table1"], label);
        if (edited) return edited;

        const emptyRow = Array(columnCount).fill("");
        emptyRow[0] = label;
        return emptyRow;
      };

      const ageingHeaders = [
        "Particulars",
        "Less than 1 year",
        "1-2 years",
        "2-3 years",
        "More than 3 years",
        "Total",
      ];
      const ageingColCount = ageingHeaders.length;

      const calculateAgeingRowTotal = (r: string[]): string => {
        let sum = 0;
        for (let i = 1; i <= 4; i++) {
          // Sum columns 1 through 4
          sum += parseNum(r[i]);
        }
        return sum.toLocaleString("en-IN", { minimumFractionDigits: 2 });
      };

      // Define editable rows for the current year (2024) data points
      const msme2024 = row("(i) MSME(Current) ", ageingColCount);
      const others2024 = row("(ii) Others(Current)", ageingColCount);

      // Define editable rows for the previous year (2023) data points
      const msme2023 = row("(i) MSME(Previous) ", ageingColCount);
      const others2023 = row("(ii) Others(Previous) ", ageingColCount);

      // Calculate row totals for each editable row
      msme2024[5] = calculateAgeingRowTotal(msme2024);
      others2024[5] = calculateAgeingRowTotal(others2024);
      msme2023[5] = calculateAgeingRowTotal(msme2023);
      others2023[5] = calculateAgeingRowTotal(others2023);

      // Calculate the "Total Trade Payables as on 31st March 2024" row
      const total2024 = [
        `Total Trade Payables as on ${periodHeaders.currentPeriod}`,
        //"Total Trade Payables as on 31st March 2024",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
      ];
      for (let i = 1; i <= 5; i++) {
        const colSum = parseNum(msme2024[i]) + parseNum(others2024[i]);
        total2024[i] = colSum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        });
      }

      // Calculate the "Total Trade Payables as on 31st March 2023" row
      const total2023 = [
        `Total Trade Payables as on ${periodHeaders.previousPeriod}`,
        //"Total Trade Payables as on 31st March 2023",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
      ];
      for (let i = 1; i <= 5; i++) {
        const colSum = parseNum(msme2023[i]) + parseNum(others2023[i]);
        total2023[i] = colSum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        });
      }

      return {
        noteNumber: 14,
        title: "Trade payables",
        totalCurrent: null,
        totalPrevious: null,
        footer: "Note : Figures in brackets relates to previous year.",
        content: [
          "Trade Payables:",
          {
            key: "note14-msme-group",
            label:
              "(i) Total outstanding dues of micro enterprises and small enterprises (MSME)",
            valueCurrent: msme.current,
            valuePrevious: msme.previous,
          },
          {
            key: "note14-nonmsme-group",
            label:
              "(ii) Total outstanding dues of creditors other than micro enterprises and small enterprises",
            isSubtotal: true,
            valueCurrent: nonMsme.current,
            valuePrevious: nonMsme.previous,
          },
          {
            key: "note14-total",
            label: "",
            isGrandTotal: true,
            valueCurrent: grandTotal.current,
            valuePrevious: grandTotal.previous,
          },
          "(Refer notes below)",
          "Note",
          {
            key: "note14-text-a",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note14-text-a",
              `a) Dues to related parties (Refer note 31b) in trade payable {other than MSME} Rs. 26,398.24 Lakhs [31 March 2023: 35,845.48 Lakhs].`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note14-text-b",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note14-text-b",
              `b) Trade payables include foreign currency payables amounting to Rs.2,307.03 lakhs which are outstanding for a period greater than 6 months. The Company has informed about their status to the authorised dealer. The Company will obtain and ensure the requisite approvals wherever required before settling the overdue balances payable.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          "The trade payables ageing schedule for the years ended as on 31 March is as follows :",
          {
            key: "note14-table1",
            type: "table",
            isEditable: true,
            headers: ageingHeaders,
            rows: [
              msme2024,
              others2024,
              total2024,
              msme2023,
              others2023,
              total2023,
            ],
          },
        ],
      };
    };

    const calculateNote15 = (): FinancialNote => {
      const leaseLiabilitiesNonCurrent = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["other non current financial liabilities"],
            ["long term  lease obligation"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["other non current financial liabilities"],
            ["long term  lease obligation"]
          ),
      };

      const unpaidDividends = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["other current financial liabilities"],
            ["unpaid dividends"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["other current financial liabilities"],
            ["unpaid dividends"]
          ),
      };

      const capitalReduction = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["other current financial liabilities"],
            ["amount payable on capital reduction"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["other current financial liabilities"],
            ["amount payable on capital reduction"]
          ),
      };

      const leaseLiabilitiesCurrent = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["other current financial liabilities"],
            ["short term lease obligations"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["other current financial liabilities"],
            ["short term lease obligation"]
          ),
      };

      const payableToEmployees = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["other current financial liabilities"],
            ["payable to employees"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["other current financial liabilities"],
            ["payable to employees"]
          ),
      };

      const leasePortion = {
        current: leaseLiabilitiesCurrent.current,
        previous: leaseLiabilitiesCurrent.previous,
      };

      const otherCurrentPortion = {
        current:
          unpaidDividends.current +
          capitalReduction.current +
          payableToEmployees.current +
          leaseLiabilitiesCurrent.current,
        previous:
          unpaidDividends.previous +
          capitalReduction.previous +
          payableToEmployees.previous +
          leaseLiabilitiesCurrent.previous,
      };

      const totalCurrent = {
        current: leasePortion.current + otherCurrentPortion.current,
        previous: leasePortion.previous + otherCurrentPortion.previous,
      };

      return {
        noteNumber: 15,
        title: "Other financial liabilities",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note15-noncurrent",
            label: "Non-current",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note15-nc-lease",
                label: "(a) Lease liabilities",
                valueCurrent: leaseLiabilitiesNonCurrent.current,
                valuePrevious: leaseLiabilitiesNonCurrent.previous,
              },
              {
                key: "note15-nc-lease-total",
                label: "",
                valueCurrent: leaseLiabilitiesNonCurrent.current,
                valuePrevious: leaseLiabilitiesNonCurrent.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note15-current",
            label: "Current",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note15-c-unpaid",
                label: "(a) Unpaid dividends",
                valueCurrent: unpaidDividends.current,
                valuePrevious: unpaidDividends.previous,
              },
              {
                key: "note15-c-capred",
                label:
                  "(b) Amount payable on capital reduction (Refer note 12 (f))",
                valueCurrent: capitalReduction.current,
                valuePrevious: capitalReduction.previous,
              },
              {
                key: "note15-c-lease",
                label: "(c) Lease liabilities",
                valueCurrent: leaseLiabilitiesCurrent.current,
                valuePrevious: leaseLiabilitiesCurrent.previous,
              },
              {
                key: "note15-c-emp",
                label: "(d) Payable to employees",
                valueCurrent: payableToEmployees.current,
                valuePrevious: payableToEmployees.previous,
              },
              {
                key: "note15-current-total",
                label: "",
                valueCurrent: otherCurrentPortion.current,
                valuePrevious: otherCurrentPortion.previous,
                isGrandTotal: true,
              },
            ],
          },
          "Note: Of the above, amount disclosed under:",
          {
            key: "note15-footer-lease",
            label: "Current portion of lease liabilities",
            valueCurrent: leaseLiabilitiesCurrent.current,
            valuePrevious: leaseLiabilitiesCurrent.previous,
          },
          {
            key: "note15-footer-other",
            label: "Other current financial liabilities",
            valueCurrent:
              otherCurrentPortion.current - leaseLiabilitiesCurrent.current,
            valuePrevious:
              otherCurrentPortion.previous - leaseLiabilitiesCurrent.previous,
          },
          {
            key: "note15-total",
            label: "Total",
            isGrandTotal: true,
            valueCurrent:
              leaseLiabilitiesCurrent.current +
              otherCurrentPortion.current -
              leaseLiabilitiesCurrent.current,
            valuePrevious:
              leaseLiabilitiesCurrent.previous +
              otherCurrentPortion.previous -
              leaseLiabilitiesCurrent.previous,
          },
        ],
      };
    };
    const calculateNote16 = (): FinancialNote => {
      const unearnedRevenue = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["other current liabilities"],
            ["income received in advance (unearned revenue)"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["other current liabilities"],
            ["income received in advance (unearned revenue)"]
          ),
      };

      const statutoryDues = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["other current liabilities"],
            [
              "statutory dues ( including pf, esi, gst (net),withholding taxes, etc.)",
            ]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["other current liabilities"],
            [
              "statutory dues ( including pf, esi, gst (net),withholding taxes, etc.)",
            ]
          ),
      };

      const advancesFromCustomers = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["other current liabilities"],
            ["advances from customers"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["other current liabilities"],
            ["advances from customers"]
          ),
      };

      const otherPayablesTotal = {
        current: statutoryDues.current + advancesFromCustomers.current,
        previous: statutoryDues.previous + advancesFromCustomers.previous,
      };

      const totalCurrent = {
        current: unearnedRevenue.current + otherPayablesTotal.current,
        previous: unearnedRevenue.previous + otherPayablesTotal.previous,
      };

      return {
        noteNumber: 16,
        title: "Other liabilities",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note16-current",
            label: "Current",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note16-unearned",
                label: "(a) Unearned revenue",
                valueCurrent: unearnedRevenue.current,
                valuePrevious: unearnedRevenue.previous,
              },
              {
                key: "note16-other-payables",
                label: "(b) Other payables",
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note16-statutory",
                    label:
                      "(i) Statutory dues (Including PF, ESI, GST (Net), withholding taxes, etc.)",
                    valueCurrent: statutoryDues.current,
                    valuePrevious: statutoryDues.previous,
                  },
                  {
                    key: "note16-adv-cust",
                    label: "(ii) Advances from customers",
                    valueCurrent: advancesFromCustomers.current,
                    valuePrevious: advancesFromCustomers.previous,
                  },
                ],
              },
            ],
          },
          {
            key: "note16-total",
            label: "Total",
            isGrandTotal: true,
            valueCurrent: totalCurrent.current,
            valuePrevious: totalCurrent.previous,
          },
        ],
      };
    };
    const calculateNote17 = (): FinancialNote => {
      const gratuity = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["provisions- non current"],
            ["provision for gratuity"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["provisions- non current"],
            ["provision for gratuity"]
          ),
      };

      const constructionContracts = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["provisions- current"],
            ["provision for construction contracts"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["provisions- current"],
            ["provision for construction contracts"]
          ),
      };

      const productSupport = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["provisions- current"],
            ["provision for product support  (warranty)"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["provisions- current"],
            ["provision for product support  (warranty)"]
          ),
      };

      const onerousContracts = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["provisions- current"],
            ["provision for estimated losses on onerous contracts"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["provisions- current"],
            ["provision for estimated losses on onerous contracts"]
          ),
      };

      const serviceTax = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["provisions- current"],
            ["provision for service tax"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["provisions- current"],
            ["provision for service tax"]
          ),
      };

      const nonCurrentTotal = {
        current: gratuity.current,
        previous: gratuity.previous,
      };

      const currentTotal = {
        current:
          constructionContracts.current +
          productSupport.current +
          onerousContracts.current +
          serviceTax.current,
        previous:
          constructionContracts.previous +
          productSupport.previous +
          onerousContracts.previous +
          serviceTax.previous,
      };

      return {
        noteNumber: 17,
        title: "Provisions",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note17-noncurrent",
            label: "Non-current",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note17-gratuity",
                label: "(a) Provision for employee benefits:",
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note17-gratuity-net",
                    label:
                      "  (i) Provision for gratuity (net) (Refer Note No. 28)",
                    valueCurrent: gratuity.current,
                    valuePrevious: gratuity.previous,
                  },
                  {
                    key: "note17-gratuity-total",
                    label: "",
                    valueCurrent: gratuity.current,
                    valuePrevious: gratuity.previous,
                    isGrandTotal: true,
                  },
                ],
              },
            ],
          },
          {
            key: "note17-current",
            label: "Current",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note17-provisions-others",
                label: "(b) Provision - others: (Refer Note No. 33)",
                isSubtotal: true,
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note17-const",
                    label: "  (i) Provision for construction contracts",
                    valueCurrent: constructionContracts.current,
                    valuePrevious: constructionContracts.previous,
                  },
                  {
                    key: "note17-warranty",
                    label: "  (ii) Provision for product support (Warranty)",
                    valueCurrent: productSupport.current,
                    valuePrevious: productSupport.previous,
                  },
                  {
                    key: "note17-onerous",
                    label:
                      "  (iii) Provision for estimated losses on onerous contracts",
                    valueCurrent: onerousContracts.current,
                    valuePrevious: onerousContracts.previous,
                  },
                  {
                    key: "note17-service-tax",
                    label: "  (iv) Provision for Service Tax",
                    valueCurrent: serviceTax.current,
                    valuePrevious: serviceTax.previous,
                  },
                ],
              },
            ],
          },
          {
            key: "note17-total",
            label: "Total",
            isGrandTotal: true,
            valueCurrent: currentTotal.current,
            valuePrevious: currentTotal.previous,
          },
        ],
      };
    };
    const calculateNote18 = (): FinancialNote => {
      const note18_1 = getValueForKey(18, "note18-process");

      const note18_2 = getValueForKey(18, "note18-spares");

      const note18_3 = getValueForKey(18, "note18-products");

      const note18_4 = getValueForKey(18, "note18-amc");

      const note18_5 = getValueForKey(18, "note18-it");

      const note18_6 = getValueForKey(18, "note18-time-point");

      const note18_7 = getValueForKey(18, "note18-time-over");

      const note18_8 = getValueForKey(18, "note18-out-india");

      const note18_9 = getValueForKey(18, "note18-india");

      const note18_10 = getValueForKey(18, "performance-within-1y");

      const note18_11 = getValueForKey(18, "performance-more-1y");

      const instrumentation = {
        current: note18_1.valueCurrent ?? 0,
        previous: note18_1.valuePrevious ?? 0,
      };
      const spares = {
        current: note18_2.valueCurrent ?? 0,
        previous: note18_2.valuePrevious ?? 0,
      };
      const tradedGoods = {
        current: note18_3.valueCurrent ?? 0,
        previous: note18_3.valuePrevious ?? 0,
      };
      const amcTraining = {
        current: note18_4.valueCurrent ?? 0,
        previous: note18_4.valuePrevious ?? 0,
      };
      const itSupport = {
        current: note18_5.valueCurrent ?? 0,
        previous: note18_5.valuePrevious ?? 0,
      };
      const pointInTime = {
        current: note18_6.valueCurrent ?? 0,
        previous: note18_6.valuePrevious ?? 0,
      };
      const overTime = {
        current: note18_7.valueCurrent ?? 0,
        previous: note18_7.valuePrevious ?? 0,
      };
      const outsideIndia = {
        current: note18_8.valueCurrent ?? 0,
        previous: note18_8.valuePrevious ?? 0,
      };
      const india = {
        current: note18_9.valueCurrent ?? 0,
        previous: note18_9.valuePrevious ?? 0,
      };
      const remainingPerformanceObligations = {
        withinOneYear: {
          current: note18_10.valueCurrent ?? 0,
          previous: note18_10.valuePrevious ?? 0,
        },
        moreThanOneYear: {
          current: note18_11.valueCurrent ?? 0,
          previous: note18_11.valuePrevious ?? 0,
        },
      };

      // Section A.1 - Type of goods or services

      const constructionContracts = {
        current: instrumentation.current + spares.current,
        previous: instrumentation.previous + spares.previous,
      };

      const saleOfProducts = {
        current: tradedGoods.current + constructionContracts.current,
        previous: tradedGoods.previous + constructionContracts.previous,
      };

      const saleOfServices = {
        current: amcTraining.current + itSupport.current,
        previous: amcTraining.previous + itSupport.previous,
      };
      const scrapSales = {
        current:
          -1 *
          getAmount(
            "amountCurrent",
            ["other operating revenue "],
            ["sale of scrap"]
          ),
        previous:
          -1 *
          getAmount(
            "amountPrevious",
            ["other operating revenue "],
            ["sale of scrap"]
          ),
      };

      const total = {
        current:
          saleOfProducts.current + saleOfServices.current + scrapSales.current,
        previous:
          saleOfProducts.previous +
          saleOfServices.previous +
          scrapSales.previous,
      };

      const contractBalances = {
        tradeReceivables: {
          current: getAmount(
            "amountCurrent",
            ["trade receivables"],
            ["trade receivables", "allowances for doubtful debts"]
          ),
          previous: getAmount(
            "amountPrevious",
            ["trade receivables"],
            ["trade receivables", "allowances for doubtful debts"]
          ),
        },
        contractAssets: {
          current: getAmount(
            "amountCurrent",
            ["other current financial assets"],
            ["unbilled receivable"]
          ),
          previous: getAmount(
            "amountPrevious",
            ["other current financial assets"],
            ["unbilled receivable"]
          ),
        },
        contractLiabilities: {
          current:
            -1 *
              getAmount(
                "amountCurrent",
                ["other current liabilities"],
                ["income received in advance (unearned revenue)"]
              ) +
            -1 *
              getAmount(
                "amountCurrent",
                ["other current liabilities"],
                ["advances from customers"]
              ) +
            -1 *
              getAmount(
                "amountCurrent",
                ["provisions- current"],
                ["provision for product support  (warranty)"]
              ),
          previous:
            -1 *
              getAmount(
                "amountPrevious",
                ["other current liabilities"],
                ["income received in advance (unearned revenue)"]
              ) +
            -1 *
              getAmount(
                "amountPrevious",
                ["other current liabilities"],
                ["advances from customers"]
              ) +
            -1 *
              getAmount(
                "amountPrevious",
                ["provisions- current"],
                ["provision for product support  (warranty)"]
              ),
        },
      };

      // 18.2 Performance Obligations

      return {
        noteNumber: 18,
        title: "Revenue from Operations",
        subtitle: "Disaggregated revenue information",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note18-text-a",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note18-text-a",
              ` Set out below is the disaggregation of the Company’s revenue from contracts with customers`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },

          {
            key: "note18-disaggregate",
            label: "Type of goods or services",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note18-sale-prod",
                label: "(a) Sale of Products (Refer Note (i) below)",
                valueCurrent: saleOfProducts.current,
                valuePrevious: saleOfProducts.previous,
              },
              {
                key: "note18-sale-serv",
                label: "(b) Sale of Services (Refer Note (ii) below)",
                valueCurrent: saleOfServices.current,
                valuePrevious: saleOfServices.previous,
              },
              {
                key: "note18-other-prod-serv",
                label: "",
                isSubtotal: true,
                valueCurrent: saleOfProducts.current + saleOfServices.current,
                valuePrevious:
                  saleOfProducts.previous + saleOfServices.previous,
              },
              {
                key: "note18-other-rev",
                label: "(c) Other operating revenues (Refer Note (iii) below)",
                valueCurrent: scrapSales.current,
                valuePrevious: scrapSales.previous,
              },
              {
                key: "note18-other-rev-total",
                label: "",
                isSubtotal: true,
                valueCurrent: scrapSales.current,
                valuePrevious: scrapSales.previous,
              },
              {
                key: "note18-other-rev-total-final",
                label: "Total Net Revenue",
                isSubtotal: true,
                valueCurrent: total.current,
                valuePrevious: total.previous,
              },
            ],
          },
          {
            key: "note18-sale-products-group",
            label: `Note(i)    Sale of products comprises:
                            Revenue from construction contracts`,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note18-process",
                label: "Process control instrumentation systems",
                valueCurrent: instrumentation.current,
                valuePrevious: instrumentation.previous,
                isEditableRow: true,
              },
              {
                key: "note18-spares",
                label: "Spares and others",
                valueCurrent: spares.current,
                valuePrevious: spares.previous,
                isEditableRow: true,
              },
              {
                key: "note18-sale-products-group-total",
                label: "Total - Revenue from construction contracts & others",
                valueCurrent: constructionContracts.current,
                valuePrevious: constructionContracts.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note18-traded-goods",
            label: "Sale of traded goods",
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note18-products",
                label: "Products and Accessories",
                valueCurrent: tradedGoods.current,
                valuePrevious: tradedGoods.previous,
                isEditableRow: true,
              },
              {
                key: "note18-traded-goods-total",
                label: "Total - Sale of traded goods",
                valueCurrent: tradedGoods.current,
                valuePrevious: tradedGoods.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note18-products-total",
            label: "Total - Sale of products",
            valueCurrent: saleOfProducts.current,
            valuePrevious: saleOfProducts.previous,
            isGrandTotal: true,
          },
          {
            key: "note18-sale-services",
            label: "Note (ii) Sale of services comprises:",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note18-amc",
                label: "AMC, Training, etc.",
                valueCurrent: amcTraining.current,
                valuePrevious: amcTraining.previous,
                isEditableRow: true,
              },
              {
                key: "note18-it",
                label: "IT support services",
                valueCurrent: itSupport.current,
                valuePrevious: itSupport.previous,
                isEditableRow: true,
              },
              {
                key: "note18-sale-services-total",
                label: "Total - Sale of services",
                valueCurrent: saleOfServices.current,
                valuePrevious: saleOfServices.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note18-other-op",
            label: "Note (iii) Other operating revenue comprises:",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note18-scrap",
                label: "Sale of scrap",
                valueCurrent: scrapSales.current,
                valuePrevious: scrapSales.previous,
              },
              {
                key: "note18-other-op-total",
                label: "Total - Other operating revenue",
                valueCurrent: scrapSales.current,
                valuePrevious: scrapSales.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note18-timing",
            label: "Timing of revenue recognition",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note18-time-point",
                label: "Goods transferred at a point in time",
                valueCurrent: pointInTime.current,
                valuePrevious: pointInTime.previous,
                isEditableRow: true,
              },
              {
                key: "note18-time-over",
                label: "Services transferred over time",
                valueCurrent: overTime.current,
                valuePrevious: overTime.previous,
                isEditableRow: true,
              },
              {
                key: "note18-timing-total",
                label: "Total revenue from contracts with customers",
                valueCurrent: pointInTime.current + pointInTime.previous,
                valuePrevious: pointInTime.previous + overTime.current,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note18-geo",
            label: "",
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note18-india",
                label: "India",
                valueCurrent: india.current,
                valuePrevious: india.previous,
                isEditableRow: true,
              },
              {
                key: "note18-out-india",
                label: "Outside India",
                valueCurrent: outsideIndia.current,
                valuePrevious: outsideIndia.previous,
                isEditableRow: true,
              },
              {
                key: "note18-geo-total",
                label: "Total revenue from contracts with customers",
                valueCurrent: india.current + outsideIndia.current,
                valuePrevious: india.previous + outsideIndia.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note18-text-b",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note18-text-b",
              `The Company presented disaggregated revenue based on the type of goods or services provided to customers, the geographical region, and the timing of transfer of goods and services. 
       The Company presented a reconciliation of the disaggregated revenue with the revenue information disclosed for each reportable segment. Refer note 30 for the detailed information.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },

          {
            key: "note18-contract-balances",
            label: "18.1 Contract balances",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "contract-trade-receivables",
                label: "Trade receivables",
                valueCurrent: contractBalances.tradeReceivables.current,
                valuePrevious: contractBalances.tradeReceivables.previous,
              },
              {
                key: "contract-assets",
                label: "Contract assets",
                valueCurrent: contractBalances.contractAssets.current,
                valuePrevious: contractBalances.contractAssets.previous,
              },
              {
                key: "contract-liabilities",
                label: "Contract liabilities",
                valueCurrent: contractBalances.contractLiabilities.current,
                valuePrevious: contractBalances.contractLiabilities.previous,
              },
            ],
          },
          {
            key: "note18-text-c",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note18-text-c",
              `Trade receivables are non-interest bearing and are generally on terms of 30 to 90 days. At 31 March 2024, ₹ 7,050.91 Lakhs (31 March 2023: ₹ 4,608.50 Lakhs ) was recognised as provision for expected credit losses on trade receivables.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note18-text-d",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note18-text-d",
              `Contract assets relates to revenue earned from ongoing supply and installation service contracts as well as retention money receivable from customers. As such, the balances of this account vary and depend on the number of such contracts at the end of the year.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note18-text-e",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note18-text-e",
              `Contract liabilities include long-term advances received to and short-term advances received to render supply and installation services as well as transaction price allocated to unexpired service obligations.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },

          {
            key: "note18-performance-obligation-total",
            label: `18.2 Performance obligation
            
            Information about the Company's performance obligations are summarised below:
            
            Industrial Automation Services`,
            valueCurrent: saleOfProducts.current,
            valuePrevious: saleOfProducts.previous,
            isGrandTotal: true,
          },

          {
            key: "note18-text-f",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note18-text-f",
              `The performance obligation is satisfied over-time and payment is generally due upon completion of installation and acceptance of the customer. In some contracts, short-term advances are required before the installation service is provided`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },

          {
            key: "note18-text-g",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note18-text-g",
              `Procurement services`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },

          {
            key: "note18-text-h",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note18-text-h",
              `There are contracts with customers to acquire buy out items like UPS, Cables Batteries, on their behalf, The Company is acting as agent in these arrangements. The performance obligation is satisfied, and payment is due upon receipt of the equipment by the customer.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },

          {
            key: "note18-performance-obligation",
            label: `The transaction price allocated to the remaining performance obligations (unsatisfied or partially unsatisfied) as at 31 March are, as follows:`,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "performance-within-1y",
                label: "Within one year",
                valueCurrent:
                  remainingPerformanceObligations.withinOneYear.current,
                valuePrevious:
                  remainingPerformanceObligations.withinOneYear.previous,
                isEditableRow: true,
              },
              {
                key: "performance-more-1y",
                label: "More than one year",
                valueCurrent:
                  remainingPerformanceObligations.moreThanOneYear.current,
                valuePrevious:
                  remainingPerformanceObligations.moreThanOneYear.previous,
                isEditableRow: true,
              },
              {
                key: "note18-performance-obligation-total",
                label: "",
                valueCurrent:
                  remainingPerformanceObligations.withinOneYear.current +
                  remainingPerformanceObligations.moreThanOneYear.current,
                valuePrevious:
                  remainingPerformanceObligations.withinOneYear.previous +
                  remainingPerformanceObligations.moreThanOneYear.previous,
                isGrandTotal: true,
              },
            ],
          },
        ],
      };
    };
    const calculateNote19 = (): FinancialNote => {
      const note19_1 = getValueForKey(19, "note19-reimb");

      const note19_2 = getValueForKey(19, "note19-bond");

      const note19_3 = getValueForKey(19, "note19-insurance");

      const note19_4 = getValueForKey(19, "note19-others");

      const reimbursements = {
        current: note19_1.valueCurrent ?? 0,
        previous: note19_1.valuePrevious ?? 0,
      };
      const bondRecoveries = {
        current: note19_2.valueCurrent ?? 0,
        previous: note19_2.valuePrevious ?? 0,
      };
      const insuranceRefund = {
        current: note19_3.valueCurrent ?? 0,
        previous: note19_3.valuePrevious ?? 0,
      };
      const others = {
        current: note19_4.valueCurrent ?? 0,
        previous: note19_4.valuePrevious ?? 0,
      };

      const interestBank = {
        current: -getAmount(
          "amountCurrent",
          ["other income"],
          ["interest income"]
        ),
        previous: -getAmount(
          "amountPrevious",
          ["other income"],
          ["interest income"]
        ),
      };

      const interestOther = {
        current: -getAmount(
          "amountCurrent",
          ["other income"],
          ["interest from financial assets at amortised cost"]
        ),
        previous: -getAmount(
          "amountPrevious",
          ["other income"],
          ["interest from financial assets at amortised cost"]
        ),
      };

      const totalInterestIncome = {
        current: interestBank.current + interestOther.current,
        previous: interestBank.previous + interestOther.previous,
      };

      const totalMiscIncome = {
        current:
          reimbursements.current +
          bondRecoveries.current +
          insuranceRefund.current +
          others.current,
        previous:
          reimbursements.previous +
          bondRecoveries.previous +
          insuranceRefund.previous +
          others.previous,
      };

      const totalOtherIncome = {
        current: totalInterestIncome.current + totalMiscIncome.current,
        previous: totalInterestIncome.previous + totalMiscIncome.previous,
      };

      return {
        noteNumber: 19,
        title: "Other income",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note19-summary",
            label: "Note 19 Other income",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note19-interest",
                label: "(a) Interest income (Refer Note (i) below)",
                valueCurrent: totalInterestIncome.current,
                valuePrevious: totalInterestIncome.previous,
              },
              {
                key: "note19-other",
                label: `(b) Other non-operating income: 
                               Miscellaneous Income (Refer Note (ii) below)`,
                valueCurrent: totalMiscIncome.current,
                valuePrevious: totalMiscIncome.previous,
              },
              {
                key: "note19-summary-total",
                label: "",
                valueCurrent: totalOtherIncome.current,
                valuePrevious: totalOtherIncome.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note19-interest-breakup",
            label:
              "Note (i) Interest income on financial assets at amortised cost comprises:",
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note19-bank",
                label: "-Interest income from bank on deposits",
                valueCurrent: interestBank.current,
                valuePrevious: interestBank.previous,
              },
              {
                key: "note19-other-interest",
                label: "-Interest income on other financial assets",
                valueCurrent: interestOther.current,
                valuePrevious: interestOther.previous,
              },
              {
                key: "note19-interest-breakup-total",
                label: "Total - Interest income",
                valueCurrent: totalInterestIncome.current,
                valuePrevious: totalInterestIncome.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note19-misc-breakup",
            label: "Note (ii) Other non-operating income comprises:",
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note19-reimb",
                label: "(a) Reimbursements from YHQ",
                valueCurrent: reimbursements.current,
                valuePrevious: reimbursements.previous,
                isEditableRow: true,
              },
              {
                key: "note19-bond",
                label: "(b) Bond Recoveries",
                valueCurrent: bondRecoveries.current,
                valuePrevious: bondRecoveries.previous,
                isEditableRow: true,
              },
              {
                key: "note19-insurance",
                label: "(c) Insurance Refund",
                valueCurrent: insuranceRefund.current,
                valuePrevious: insuranceRefund.previous,
                isEditableRow: true,
              },
              {
                key: "note19-others",
                label: "(d) Others",
                valueCurrent: others.current,
                valuePrevious: others.previous,
                isEditableRow: true,
              },
              {
                key: "note19-misc-breakup-total",
                label: "Total - Miscellaneous Income",
                valueCurrent: totalMiscIncome.current,
                valuePrevious: totalMiscIncome.previous,
                isGrandTotal: true,
              },
            ],
          },
        ],
      };
    };
    const calculateNote20 = (): FinancialNote => {
      const note20_1 = getValueForKey(20, "note20-openstock");

      const note20_2 = getValueForKey(20, "note20-prod-access");

      const note20_3 = getValueForKey(20, "note20-inventory-boy-wip");

      const note20_4 = getValueForKey(20, "note20-inventory-boy-sit");

      const openStock = {
        current: note20_1.valueCurrent ?? 0,
        previous: note20_1.valuePrevious ?? 0,
      };
      const produtAndAccessories = {
        current: note20_2.valueCurrent ?? 0,
        previous: note20_2.valuePrevious ?? 0,
      };
      const workInProgressBOY = {
        current: note20_3.valueCurrent ?? 0,
        previous: note20_3.valuePrevious ?? 0,
      };
      const stockInTradeBOY = {
        current: note20_4.valueCurrent ?? 0,
        previous: note20_4.valuePrevious ?? 0,
      };

      const allRawMaterials = {
        current: getAmount("amountCurrent", ["inventories"], ["raw material"]),
        previous: getAmount(
          "amountPrevious",
          ["inventories"],
          ["raw material"]
        ),
      };

      const clossingStock = {
        current: allRawMaterials.current,
        previous: allRawMaterials.previous,
      };

      const costOfMaterialsConsumed = {
        current: getAmount(
          "amountCurrent",
          ["direct expenses", "cost of material consumed"],
          ["cost of materials consumed"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["direct expenses", "cost of material consumed"],
          ["cost of materials consumed"]
        ),
      };

      const workInProgress = {
        current: getAmount(
          "amountCurrent",
          ["inventories"],
          ["work-in-progress"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["inventories"],
          ["work-in-progress"]
        ),
      };

      const goodsInTransitStock = {
        current: getAmount(
          "amountCurrent",
          ["inventories"],
          ["goods-in-transit- (acquired for trading)"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["inventories"],
          ["goods-in-transit- (acquired for trading)"]
        ),
      };

      const allStockInTrade = {
        current: getAmount(
          "amountCurrent",
          ["inventories"],
          ["stock-in-trade"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["inventories"],
          ["stock-in-trade"]
        ),
      };

      const stockInTradeSubTotal = {
        current: allStockInTrade.current + goodsInTransitStock.current,
        previous: allStockInTrade.previous + goodsInTransitStock.previous,
      };

      const inventoryEOY = {
        current: stockInTradeSubTotal.current + workInProgress.current,
        previous: stockInTradeSubTotal.previous + workInProgress.previous,
      };
      const inventoryBOY = {
        current: stockInTradeBOY.current + workInProgressBOY.current,
        previous: stockInTradeBOY.previous + workInProgressBOY.previous,
      };

      const netIncDec = {
        current: inventoryBOY.current - inventoryEOY.current,
        previous: inventoryBOY.previous - inventoryEOY.previous,
      };

      const purchase = {
        current:
          costOfMaterialsConsumed.current -
          produtAndAccessories.current -
          netIncDec.current -
          openStock.current +
          clossingStock.current,
        previous:
          costOfMaterialsConsumed.previous -
          produtAndAccessories.previous -
          netIncDec.previous -
          openStock.previous +
          clossingStock.previous,
      };
      const subTotal = {
        current: purchase.current + openStock.current - clossingStock.current,
        previous:
          purchase.previous + openStock.previous - clossingStock.previous,
      };

      return {
        noteNumber: 20,
        title: "",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note20-cogs",
            label: "a Cost of materials consumed",
            isGrandTotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note20-openstock",
                label: "Opening stock",
                valueCurrent: openStock.current,
                valuePrevious: openStock.previous,
                isEditableRow: true,
              },
              {
                key: "note20-purchase",
                label: "Add: Purchases",
                valueCurrent: purchase.current,
                valuePrevious: purchase.previous,
              },
              {
                key: "note20-cogs-total",
                label: "",
                valueCurrent: openStock.current + purchase.current,
                valuePrevious: openStock.previous + purchase.previous,
                isGrandTotal: true,
              },

              {
                key: "note20-closingstock",
                label: "Less: Closing stock",
                valueCurrent: clossingStock.current,
                valuePrevious: clossingStock.previous,
              },
              {
                key: "note20-cogs-total-final",
                label: "Total",
                valueCurrent: subTotal.current,
                valuePrevious: subTotal.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note20-purchase-traded-goods",
            label: "Note 20b Purchase of traded goods",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note20-prod-access",
                label: "Products and Accessories",
                valueCurrent: produtAndAccessories.current,
                valuePrevious: produtAndAccessories.previous,
                isEditableRow: true,
              },
              {
                key: "note20-purchase-traded-goods-total",
                label: "Total",
                valueCurrent: produtAndAccessories.current,
                valuePrevious: produtAndAccessories.previous,
                isGrandTotal: true,
              },
            ],
          },
          {
            key: "note20-changes-in-inventories",
            label:
              "Note 20c Changes in inventories of work-in-progress and stock in trade",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note20-inventory-eoy",
                label: "Inventories at the end of the year:",
                isSubtotal: true,
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note20-inventory-eoy-wip",
                    label: "Work-in-progress",
                    valueCurrent: workInProgress.current,
                    valuePrevious: workInProgress.previous,
                  },
                  {
                    key: "note20-inventory-eoy-sit",
                    label: "Stock-in-trade",
                    valueCurrent: stockInTradeSubTotal.current,
                    valuePrevious: stockInTradeSubTotal.previous,
                  },
                  {
                    key: "note20-inventory-eoy-total",
                    label: "",
                    valueCurrent: inventoryEOY.current,
                    valuePrevious: inventoryEOY.previous,
                    isGrandTotal: true,
                  },
                ],
              },

              {
                key: "note20-inventory-boy",
                label: "Inventories at the beginning of the year:",
                isSubtotal: true,
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note20-inventory-boy-wip",
                    label: "Work-in-progress",
                    valueCurrent: workInProgressBOY.current,
                    valuePrevious: workInProgressBOY.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note20-inventory-boy-sit",
                    label: "Stock-in-trade",
                    valueCurrent: stockInTradeBOY.current,
                    valuePrevious: stockInTradeBOY.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note20-inventory-boy-total",
                    label: "",
                    valueCurrent: inventoryBOY.current,
                    valuePrevious: inventoryBOY.previous,
                    isGrandTotal: true,
                  },
                ],
              },
              {
                key: "note20-changes-in-inventories-total",
                label: "Net (increase)/ Decrease",
                valueCurrent: netIncDec.current,
                valuePrevious: netIncDec.previous,
                isGrandTotal: true,
              },
            ],
          },
        ],
      };
    };
    const calculateNote21 = (): FinancialNote => {
      const salary = {
        current: getAmount(
          "amountCurrent",
          ["employee benefits expense"],
          ["salaries and wages"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["employee benefits expense"],
          ["salaries and wages"]
        ),
      };
      const contribution = {
        current: getAmount(
          "amountCurrent",
          ["employee benefits expense"],
          ["contributions to provident and other funds"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["employee benefits expense"],
          ["contributions to provident and other funds"]
        ),
      };
      const welfare = {
        current: getAmount(
          "amountCurrent",
          ["employee benefits expense"],
          ["staff welfare expenses"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["employee benefits expense"],
          ["staff welfare expenses"]
        ),
      };

      const grandTotal = {
        current: salary.current + contribution.current + welfare.current,
        previous: salary.previous + contribution.previous + welfare.previous,
      };

      return {
        noteNumber: 21,
        title: "Employee benefits expense",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note21-salary-wages",
            label: "Salaries, wages and Bonus",

            valueCurrent: salary.current,
            valuePrevious: salary.previous,
          },
          {
            key: "note21-contribution",
            label:
              "Contributions to provident and other funds (Refer Note No. 28(a))",
            valueCurrent: contribution.current,
            valuePrevious: contribution.previous,
          },
          {
            key: "note21-employee-benefits",
            label: "Staff welfare expenses",
            valueCurrent: welfare.current,
            valuePrevious: welfare.previous,
          },
          {
            key: "note21-total",
            label: "",
            isGrandTotal: true,
            valueCurrent: grandTotal.current,
            valuePrevious: grandTotal.previous,
          },
        ],
      };
    };
    const calculateNote22 = (): FinancialNote => {
      const leaseLiability = {
        current: getAmount(
          "amountCurrent",
          ["finance cost"],
          ["interest under ind as-116"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["finance cost"],
          ["interest under ind as-116"]
        ),
      };
      const msme = {
        current: getAmount(
          "amountCurrent",
          ["finance cost"],
          ["msme interest"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["finance cost"],
          ["msme interest"]
        ),
      };
      const others = {
        current: getAmount(
          "amountCurrent",
          ["finance cost"],
          ["other interest"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["finance cost"],
          ["other interest"]
        ),
      };

      const grandTotal = {
        current: leaseLiability.current + msme.current + others.current,
        previous: leaseLiability.previous + msme.previous + others.previous,
      };

      return {
        noteNumber: 22,
        title: "Finance cost",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note22-interest",
            label: "Interest expense on:",
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note22-lease-liability",
                label: "Lease liability",
                valueCurrent: leaseLiability.current,
                valuePrevious: leaseLiability.previous,
              },
              {
                key: "note22-contribution",
                label: "MSME Interest",
                valueCurrent: msme.current,
                valuePrevious: msme.previous,
              },
              {
                key: "note22-employee-benefits",
                label: "Others",
                valueCurrent: others.current,
                valuePrevious: others.previous,
              },
            ],
          },

          {
            key: "note22-total",
            label: "",
            isGrandTotal: true,
            valueCurrent: grandTotal.current,
            valuePrevious: grandTotal.previous,
          },
        ],
      };
    };
    const calculateNote23 = (): FinancialNote => {
      const property = {
        current: getAmount(
          "amountCurrent",
          ["depreciation expense"],
          ["depreciation for the year on property, plant and equipment"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["depreciation expense"],
          ["depreciation for the year on property, plant and equipment"]
        ),
      };
      const rouAsset = {
        current: getAmount(
          "amountCurrent",
          ["depreciation expense"],
          ["depreciation on rou asset"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["depreciation expense"],
          ["depreciation on rou asset"]
        ),
      };
      const intangibleAsset = {
        current: getAmount(
          "amountCurrent",
          ["depreciation expense"],
          ["amortization for the year on intangible assets"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["depreciation expense"],
          ["amortization for the year on intangible assets"]
        ),
      };

      const grandTotal = {
        current: property.current + rouAsset.current + intangibleAsset.current,
        previous:
          property.previous + rouAsset.previous + intangibleAsset.previous,
      };

      return {
        noteNumber: 23,
        title: "Depreciation Expense ",
        totalCurrent: 0,
        totalPrevious: 0,
        content: [
          {
            key: "note23-subhead",
            label: "Depreciation/ Amortisation",
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note23-property",
                label: "Property, plant and equipment : Refer Note 3a",
                valueCurrent: property.current,
                valuePrevious: property.previous,
              },
              {
                key: "note23-right-of-use-asset",
                label: "Right of use asset : Refer Note 4a",
                valueCurrent: rouAsset.current,
                valuePrevious: rouAsset.previous,
              },
              {
                key: "note23-intangible-assets",
                label: "Intangible assets : Refer Note 4b",
                valueCurrent: intangibleAsset.current,
                valuePrevious: intangibleAsset.previous,
              },
            ],
          },

          {
            key: "note23-total",
            label: "",
            isGrandTotal: true,
            valueCurrent: grandTotal.current,
            valuePrevious: grandTotal.previous,
          },
        ],
      };
    };
    const calculateNote24 = (): FinancialNote => {
      const packingMaterial = {
        current:
          getAmount(
            "amountCurrent",
            ["other expenses"],
            ["consumption of packing materials"]
          ) + 0.01,
        previous:
          getAmount(
            "amountPrevious",
            ["other expenses"],
            ["consumption of packing materials"]
          ) + 0.01,
      };
      const powerFuel = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["power and fuel"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["power and fuel"]
        ),
      };
      const rent = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["rent including lease rentals"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["rent including lease rentals"]
        ),
      };
      const buildingRepair = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["repairs and maintenance - buildings"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["repairs and maintenance - buildings"]
        ),
      };
      const otherRepair = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["repairs and maintenance - others"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["repairs and maintenance - others"]
        ),
      };
      const systemUsage = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["system usage fee (ygs implementation cost)"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["system usage fee (ygs implementation cost)"]
        ),
      };
      const insurance = {
        current: getAmount("amountCurrent", ["other expenses"], ["insurance"]),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["insurance"]
        ),
      };
      const ratesTaxes = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["rates and taxes"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["rates and taxes"]
        ),
      };
      const communication = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["communication"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["communication"]
        ),
      };
      const travelling = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["travelling and conveyance"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["travelling and conveyance"]
        ),
      };
      const lossonFD = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["loss on fixed assets sold / scrapped / written off "]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["loss on fixed assets sold / scrapped / written off "]
        ),
      };
      const printingandStationery = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["printing and stationery"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["printing and stationery"]
        ),
      };
      const sellingExpence = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["selling expenses"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["selling expenses"]
        ),
      };
      const salesCommission = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["sales commission"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["sales commission"]
        ),
      };
      const Donations = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["donations and contributions"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["donations and contributions"]
        ),
      };
      const legalProfessional = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["legal and professional"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["legal and professional"]
        ),
      };
      const netLossFC = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["net loss on foreign currency transactions and translation"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["net loss on foreign currency transactions and translation"]
        ),
      };
      const doubtfulTrade = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          [
            "provision for doubtful trade receivables/(provision written back) (net)",
          ]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          [
            "provision for doubtful trade receivables/(provision written back) (net)",
          ]
        ),
      };
      const estimateLoss = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          [
            "provision for estimated losses on construction contracts /(provision written back)",
          ]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          [
            "provision for estimated losses on construction contracts /(provision written back)",
          ]
        ),
      };
      const expLoss = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["provision for expected loss on onerous contracts"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["provision for expected loss on onerous contracts"]
        ),
      };
      const sittingFee = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["directors' sitting fees"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["directors' sitting fees"]
        ),
      };
      const bankCharge = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["bank charges "]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["bank charges "]
        ),
      };
      const corpSocialResp = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["corporate social responsibility"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["corporate social responsibility"]
        ),
      };
      const usageFee = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["prism usage fees"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["prism usage fees"]
        ),
      };
      const globSaleFee = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["global sales and marketing activity fee"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["global sales and marketing activity fee"]
        ),
      };
      const managementFee = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["management fee"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["management fee"]
        ),
      };
      const engSerFee = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["engineering service fees"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["engineering service fees"]
        ),
      };
      const engSupFee = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["engineering support fees"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["engineering support fees"]
        ),
      };
      const supSerFee = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["support service fees"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["support service fees"]
        ),
      };
      const subContract = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["sub-contract expenses"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["sub-contract expenses"]
        ),
      };
      const eduTraining = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["education & training "]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["education & training "]
        ),
      };
      const reqExp = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["recruitment expense"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["recruitment expense"]
        ),
      };
      const warantyExp = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["warranty expenses"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["warranty expenses"]
        ),
      };
      const membership = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["membership fees"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["membership fees"]
        ),
      };
      const miscellaneous = {
        current: getAmount(
          "amountCurrent",
          ["other expenses"],
          ["miscellaneous expenses"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["other expenses"],
          ["miscellaneous expenses"]
        ),
      };

      const grandTotal = {
        current:
          packingMaterial.current +
          powerFuel.current +
          rent.current +
          buildingRepair.current +
          otherRepair.current +
          systemUsage.current +
          insurance.current +
          ratesTaxes.current +
          communication.current +
          travelling.current +
          lossonFD.current +
          printingandStationery.current +
          sellingExpence.current +
          salesCommission.current +
          Donations.current +
          legalProfessional.current +
          netLossFC.current +
          doubtfulTrade.current +
          estimateLoss.current +
          expLoss.current +
          sittingFee.current +
          bankCharge.current +
          corpSocialResp.current +
          usageFee.current +
          globSaleFee.current +
          managementFee.current +
          engSerFee.current +
          engSupFee.current +
          supSerFee.current +
          subContract.current +
          eduTraining.current +
          reqExp.current +
          warantyExp.current +
          membership.current +
          miscellaneous.current,
        previous:
          packingMaterial.previous +
          powerFuel.previous +
          rent.previous +
          buildingRepair.previous +
          otherRepair.previous +
          systemUsage.previous +
          insurance.previous +
          ratesTaxes.previous +
          communication.previous +
          travelling.previous +
          lossonFD.previous +
          printingandStationery.previous +
          sellingExpence.previous +
          salesCommission.previous +
          Donations.previous +
          legalProfessional.previous +
          netLossFC.previous +
          doubtfulTrade.previous +
          estimateLoss.previous +
          expLoss.previous +
          sittingFee.previous +
          bankCharge.previous +
          corpSocialResp.previous +
          usageFee.previous +
          globSaleFee.previous +
          managementFee.previous +
          engSerFee.previous +
          engSupFee.previous +
          supSerFee.previous +
          subContract.previous +
          eduTraining.previous +
          reqExp.previous +
          warantyExp.previous +
          membership.previous +
          miscellaneous.previous,
      };

      return {
        noteNumber: 24,
        title: "Other expenses",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note24-packingMaterial",
            label: "Consumption of packing materials",
            valueCurrent: packingMaterial.current,
            valuePrevious: packingMaterial.previous,
          },
          {
            key: "note24-powerFuel",
            label: "Power and fuel",
            valueCurrent: powerFuel.current,
            valuePrevious: powerFuel.previous,
          },
          {
            key: "note24-rent",
            label: "Rent including lease rentals ",
            valueCurrent: rent.current,
            valuePrevious: rent.previous,
          },
          {
            key: "note24-buildingRepair",
            label: "Repairs and maintenance - Buildings",
            valueCurrent: buildingRepair.current,
            valuePrevious: buildingRepair.previous,
          },
          {
            key: "note24-otherRepair",
            label: "Repairs and maintenance - Others",
            valueCurrent: otherRepair.current,
            valuePrevious: otherRepair.previous,
          },
          {
            key: "note24-systemUsage",
            label:
              "System usage fee (YGS implementation cost) [Refer note: 31]",
            valueCurrent: systemUsage.current,
            valuePrevious: systemUsage.previous,
          },
          {
            key: "note24-insurance",
            label: "Insurance",
            valueCurrent: insurance.current,
            valuePrevious: insurance.previous,
          },
          {
            key: "note24-ratesTaxes",
            label: "Rates and taxes",
            valueCurrent: ratesTaxes.current,
            valuePrevious: ratesTaxes.previous,
          },
          {
            key: "note24-communication",
            label: "Communication expense [Refer note: 31]",
            valueCurrent: communication.current,
            valuePrevious: communication.previous,
          },
          {
            key: "note24-travelling",
            label: "Travelling and conveyance expense",
            valueCurrent: travelling.current,
            valuePrevious: travelling.previous,
          },
          {
            key: "note24-lossonFD",
            label: "Loss/(Gain) on fixed assets sold / scrapped / written off ",
            valueCurrent: lossonFD.current,
            valuePrevious: lossonFD.previous,
          },
          {
            key: "note24-printingandStationery",
            label: "Printing and stationery",
            valueCurrent: printingandStationery.current,
            valuePrevious: printingandStationery.previous,
          },
          {
            key: "note24-sellingExpence",
            label: "Selling expenses",
            valueCurrent: sellingExpence.current,
            valuePrevious: sellingExpence.previous,
          },
          {
            key: "note24-salesCommission",
            label: "Sales commission",
            valueCurrent: salesCommission.current,
            valuePrevious: salesCommission.previous,
          },
          {
            key: "note24-Donations",
            label: "Donations and contributions",
            valueCurrent: Donations.current,
            valuePrevious: Donations.previous,
          },
          {
            key: "note24-legalProfessional",
            label: "Legal and professional fees (Refer Note (i) below)",
            valueCurrent: legalProfessional.current,
            valuePrevious: legalProfessional.previous,
          },
          {
            key: "note24-netLossFC",
            label:
              "Net loss/(gain) on foreign currency transactions and translations",
            valueCurrent: netLossFC.current,
            valuePrevious: netLossFC.previous,
          },
          {
            key: "note24-doubtfulTrade",
            label:
              "Provision for doubtful trade receivables/(provision written back) (net)",
            valueCurrent: doubtfulTrade.current,
            valuePrevious: doubtfulTrade.previous,
          },
          {
            key: "note24-estimateLoss",
            label:
              "Provision for estimated losses on construction contracts /(provision written back) [Refer note: 33]",
            valueCurrent: estimateLoss.current,
            valuePrevious: estimateLoss.previous,
          },
          {
            key: "note24-expLoss",
            label:
              "Provision for expected loss on onerous contracts (Refer Note 33)",
            valueCurrent: expLoss.current,
            valuePrevious: expLoss.previous,
          },
          {
            key: "note24-sittingFee",
            label: "Directors' sitting fees",
            valueCurrent: sittingFee.current,
            valuePrevious: sittingFee.previous,
          },
          {
            key: "note24-bankCharge",
            label: "Bank charges ",
            valueCurrent: bankCharge.current,
            valuePrevious: bankCharge.previous,
          },
          {
            key: "note24-corpSocialResp",
            label: "Corporate Social Responsibility(Refer Note 27)",
            valueCurrent: corpSocialResp.current,
            valuePrevious: corpSocialResp.previous,
          },
          {
            key: "note24-usageFee",
            label: "Prism Usage Fees [Refer note: 31]",
            valueCurrent: usageFee.current,
            valuePrevious: usageFee.previous,
          },
          {
            key: "note24-globSaleFee",
            label: "Global sales and marketing activity fee [Refer note: 31]",
            valueCurrent: globSaleFee.current,
            valuePrevious: globSaleFee.previous,
          },
          {
            key: "note24-managementFee",
            label: "Management Fee [Refer note: 31]",
            valueCurrent: managementFee.current,
            valuePrevious: managementFee.previous,
          },
          {
            key: "note24-engSerFee",
            label: "Engineering service fees [Refer note: 31]",
            valueCurrent: engSerFee.current,
            valuePrevious: engSerFee.previous,
          },
          {
            key: "note24-engSupFee",
            label: "Engineering support fees (ESF) [Refer note: 31]",
            valueCurrent: engSupFee.current,
            valuePrevious: engSupFee.previous,
          },
          {
            key: "note24-supSerFee",
            label: "Support Service Fees [Refer note: 31]",
            valueCurrent: supSerFee.current,
            valuePrevious: supSerFee.previous,
          },
          {
            key: "note24-subContract",
            label: "Sub-contract expenses",
            valueCurrent: subContract.current,
            valuePrevious: subContract.previous,
          },
          {
            key: "note24-eduTraining",
            label: "Education & Training ",
            valueCurrent: eduTraining.current,
            valuePrevious: eduTraining.previous,
          },
          {
            key: "note24-reqExp",
            label: "Recruitment expense",
            valueCurrent: reqExp.current,
            valuePrevious: reqExp.previous,
          },
          {
            key: "note24-warantyExp",
            label: "Warranty expenses (Net of utilisation) [ Refer Note 33]",
            valueCurrent: warantyExp.current,
            valuePrevious: warantyExp.previous,
          },
          {
            key: "note24-membership",
            label: "Membership Fees",
            valueCurrent: membership.current,
            valuePrevious: membership.previous,
          },
          {
            key: "note24-miscellaneous",
            label: "Miscellaneous expenses",
            valueCurrent: miscellaneous.current,
            valuePrevious: miscellaneous.previous,
          },

          {
            key: "note24-total",
            label: "Total",
            isGrandTotal: true,
            valueCurrent: grandTotal.current,
            valuePrevious: grandTotal.previous,
          },
          "Notes:",
          {
            key: "note24-notes",
            label:
              "(i) Includes payments to the statutory auditors (excluding goods and service tax):",
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note24-statutoryAudit",
                label: "As auditors - statutory audit:",
                valueCurrent: 51.0,
                valuePrevious: 51.0,
              },
              {
                key: "note24- taxAudit",
                label: "For tax audit",
                valueCurrent: 5.0,
                valuePrevious: 5.0,
              },
            ],
          },

          {
            key: "note24-total1",
            label: "Total",
            isGrandTotal: true,
            valueCurrent: 56.0,
            valuePrevious: 56.0,
          },
        ],
      };
    };
    const calculateNote25 = (): FinancialNote => {
      const note25_1 = getValueForKey(25, "note25-3");

      const note25_2 = getValueForKey(25, "note25-4");

      const note25_3 = getValueForKey(25, "note25-5");

      const note25_4 = getValueForKey(25, "note25-8");

      const incomeTax = {
        current: note25_1.valueCurrent ?? 0,
        previous: note25_1.valuePrevious ?? 0,
      };
      const indirectTax = {
        current: note25_2.valueCurrent ?? 0,
        previous: note25_2.valuePrevious ?? 0,
      };
      const epfo = {
        current: note25_3.valueCurrent ?? 0,
        previous: note25_3.valuePrevious ?? 0,
      };
      const pop = {
        current: note25_4.valueCurrent ?? 0,
        previous: note25_4.valuePrevious ?? 0,
      };

      return {
        noteNumber: 25,
        title:
          "Contingent liabilities and commitments (to the extent not provided for)",
        totalCurrent: null, // Not applicable; shown as a disclosure table
        totalPrevious: null,
        content: [
          {
            key: "note25-1",
            label: "(i)  Contingent liabilities ",
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note25-2",
                label:
                  "(a) Claims against the Company not acknowledged as debt ",
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note25-3",
                    label:
                      "(i) Income tax matters in dispute (includes paid under protest ₹. 837.7 lakhs, as at 31 March 2023 ₹. 837.77 lakhs)",
                    valueCurrent: incomeTax.current,
                    valuePrevious: incomeTax.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note25-4",
                    label:
                      "(ii) Indirect tax matters in dispute (includes paid under protest ₹.49.05 lakhs, as at 31 March 2023 ₹. 49.05 lakhs)",
                    valueCurrent: indirectTax.current,
                    valuePrevious: indirectTax.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note25-5",
                    label:
                      "(iii) Employees' provident fund organisation (EPFO) matters of Yokogawa India Limited Employees Provident Fund in dispute (including paid under protest  ₹. 784.66 lakhs , as at 31 March 2023 ₹.784.66 lakhs)",
                    valueCurrent: epfo.current,
                    valuePrevious: epfo.previous,
                    isEditableRow: true,
                  },
                ],
              },
              {
                key: "note25-6",
                isSubtotal: true,
                label:
                  "Contingent liabilities disclosed above represent possible obligation where possibility of cash outflow to settle the obligation is not remote. ",
                valueCurrent:
                  incomeTax.current + indirectTax.current + epfo.current,
                valuePrevious:
                  incomeTax.previous + indirectTax.previous + epfo.previous,
              },
            ],
          },

          {
            key: "note25-7",
            label: "(ii) Other Commitments",
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note25-8",
                label:
                  "(a) Commitment towards procurement of property, plant and equipment",
                valueCurrent: pop.current,
                valuePrevious: pop.previous,
                isEditableRow: true,
              },
            ],
          },
          {
            key: "note25-8-1",
            label: "Total",
            isSubtotal: true,
            valueCurrent: pop.current,
            valuePrevious: pop.previous,
          },

          {
            key: "note25-9",
            label: "(iii) Guarantees",
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note25-10",
                label:
                  "Guarantees given by banks on behalf of the Company for contractual obligations of the Company.\nThe necessary terms and conditions have been complied with and no liabilities have arisen.",
                valueCurrent: 43194.01,
                valuePrevious: 39386.84,
              },
            ],
          },
          {
            key: "note25-11",
            label: "",
            isSubtotal: true,
            valueCurrent: 43194.01,
            valuePrevious: 39386.84,
          },
        ],
      };
    };
    const calculateNote26 = (): FinancialNote => {
      const note26_1 = getValueForKey(26, "note26-2");

      const note26_2 = getValueForKey(26, "note26-5");

      const interestUnpaid = {
        current: note26_1.valueCurrent ?? 0,
        previous: note26_1.valuePrevious ?? 0,
      };
      const interestAccruedUnpaid = {
        current: note26_2.valueCurrent ?? 0,
        previous: note26_2.valuePrevious ?? 0,
      };

      const principalUnpaid = {
        current: getAmount(
          "amountCurrent",
          ["trade payables"],
          ["total outstanding dues of micro enterprises and small enterprises"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["trade payables"],
          ["total outstanding dues of micro enterprises and small enterprises"]
        ),
      };

      const interestDuePayable = {
        current: getAmount(
          "amountCurrent",
          ["finance cost"],
          ["msme interest"]
        ),
        previous: getAmount(
          "amountPrevious",
          ["finance cost"],
          ["msme interest"]
        ),
      };

      return {
        noteNumber: 26,
        title:
          "Disclosures required under Section 22 of the Micro, Small and Medium Enterprises Development Act, 2006",
        totalCurrent: null, // Not applicable; shown as a disclosure table
        totalPrevious: null,
        content: [
          {
            key: "note26-1",
            label:
              "(i) Principal amount remaining unpaid to any supplier as at the end of the accounting year",
            valueCurrent: principalUnpaid.current,
            valuePrevious: principalUnpaid.previous,
          },
          {
            key: "note26-2",
            label:
              "(ii) Interest due thereon remaining unpaid to any supplier as at the end of the accounting year",
            valueCurrent: interestUnpaid.current,
            valuePrevious: interestUnpaid.previous,
            isEditableRow: true,
          },
          {
            key: "note26-3",
            label:
              "(iii) The amount of interest paid along with the amounts of the payment made to the supplier beyond the appointed day ",
            valueCurrent: 0,
            valuePrevious: 0,
          },
          {
            key: "note26-4",
            label: "(iv) The amount of interest due and payable for the year",
            valueCurrent: interestDuePayable.current,
            valuePrevious: interestDuePayable.previous,
          },
          {
            key: "note26-5",
            label:
              "(v) The amount of interest accrued and remaining unpaid at the end of the accounting year",
            valueCurrent: interestAccruedUnpaid.current,
            valuePrevious: interestAccruedUnpaid.previous,
            isEditableRow: true,
          },
          {
            key: "note26-6",
            label:
              "(vi) The amount of further interest due and payable even in the succeeding year, until such date when the interest dues as above are actually paid",
            valueCurrent: 0,
            valuePrevious: 0,
          },
        ],
        footer:
          "The said information regarding Micro and Small Enterprises has been determined to the extent such parties have been identified on the basis of information collected by the Management bases on enquiries made with the parties. This has been relied upon by the auditors.",
      };
    };
    const calculateNote27 = (periodHeaders: {
      currentPeriod: string;
      previousPeriod: string;
    }): FinancialNote => {
      // --- Hierarchical Item Calculations (YOUR ORIGINAL LOGIC - UNCHANGED) ---
      const note27_1 = getValueForKey(27, "note27-1");
      const note27_2 = getValueForKey(27, "note27-2");

      const grossAmount = {
        current: note27_1.valueCurrent ?? 0,
        previous: note27_1.valuePrevious ?? 0,
      };
      const amountSpent = {
        current: note27_2.valueCurrent ?? 0,
        previous: note27_2.valuePrevious ?? 0,
      };

      // --- Editable Table Logic (THE NEW PART) ---
      const parseNum = (val: string): number => {
        if (!val) return 0;
        return parseFloat(String(val).replace(/,/g, "")) || 0;
      };

      const row = (label: string, columnCount: number): string[] => {
        const edited = getTableValue1(
          27,
          ["note27-table1", "note27-table2"],
          label
        );
        if (edited) return edited;

        const emptyRow = Array(columnCount).fill("");
        emptyRow[0] = label;
        return emptyRow;
      };

      // --- TABLE 1: Current Year ---
      const headers2024 = [
        `${periodHeaders.currentPeriod}`,
        //"31 March 2024",
        "In cash",
        "Yet to be paid in cash",
        "Total",
      ];
      const colCount2024 = headers2024.length;

      const construction2024 = row(
        "(i) Construction/acquisition of any asset - 2024",
        colCount2024
      );
      const others2024 = row(
        "(ii) On purposes other than (i) above - 2024",
        colCount2024
      );

      construction2024[3] = (
        parseNum(construction2024[1]) + parseNum(construction2024[2])
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      others2024[3] = (
        parseNum(others2024[1]) + parseNum(others2024[2])
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const total2024 = ["Total", "0.00", "0.00", "0.00"];
      total2024[1] = (
        parseNum(construction2024[1]) + parseNum(others2024[1])
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      total2024[2] = (
        parseNum(construction2024[2]) + parseNum(others2024[2])
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      total2024[3] = (
        parseNum(total2024[1]) + parseNum(total2024[2])
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      // --- TABLE 2: Previous Year ---
      const headers2023 = [
        `${periodHeaders.previousPeriod}`,
        // "31 March 2023",
        "In cash",
        "Yet to be paid in cash",
        "Total",
      ];
      const colCount2023 = headers2023.length;

      const construction2023 = row(
        "(i) Construction/acquisition of any asset - 2023",
        colCount2023
      );
      const others2023 = row(
        "(ii) On purposes other than (i) above - 2023",
        colCount2023
      );

      construction2023[3] = (
        parseNum(construction2023[1]) + parseNum(construction2023[2])
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      others2023[3] = (
        parseNum(others2023[1]) + parseNum(others2023[2])
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const total2023 = ["Total", "0.00", "0.00", "0.00"];
      total2023[1] = (
        parseNum(construction2023[1]) + parseNum(others2023[1])
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      total2023[2] = (
        parseNum(construction2023[2]) + parseNum(others2023[2])
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      total2023[3] = (
        parseNum(total2023[1]) + parseNum(total2023[2])
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return {
        noteNumber: 27,
        title: "Corporate Social Responsibility (CSR)",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note27-text-a",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note27-text-a",
              `As per Section 135 of the Companies Act, 2013, a CSR committee has been formed by the Company. The areas for CSR activities are promoting education, healthcare and woman economic empowerment, providing disaster relief and undertaking rural development projects.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note27-1",
            label:
              "(a) Gross amount required to be spent by the company during the year ",
            valueCurrent: grossAmount.current,
            valuePrevious: grossAmount.previous,
            isEditableRow: true,
          },
          {
            key: "note27-2",
            label: "(b) Amount spent during the year ",
            valueCurrent: amountSpent.current,
            valuePrevious: amountSpent.previous,
            isEditableRow: true,
          },
          {
            key: "note27-3",
            label: "(c) shortfall at the end of the year, ",
            valueCurrent: 0, // Using original hardcoded/calculated logic
            valuePrevious: 122.41,
          },
          {
            key: "note27-4",
            label: "(d) total of previous years shortfall ",
            valueCurrent: 0, // Using original hardcoded/calculated logic
            valuePrevious: 122.41,
          },
          {
            key: "note27-5",
            label: "(e) reason for shortfall",
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note27-table1",
            type: "table",
            isEditable: true, // Make table editable
            headers: headers2024,
            rows: [construction2024, others2024, total2024],
          },
          {
            key: "note27-table2",
            type: "table",
            isEditable: true, // Make table editable
            headers: headers2023,
            rows: [construction2023, others2023, total2023],
          },
        ],
        footer: `(a) Gross amount required to be spent by the company during the year is ₹ 191.43 lakhs (Previous year is ₹ 122.41 lakhs).
             (b) Amount spent during the year is ₹ 191.43 lakhs ( Previous year is ₹ 122.41 lakhs)
             (c)  Amount donated towards promotion of education and eradication of hunger.`,
      };
    };
    const calculateNote28 = (periodHeaders: {
      currentPeriod: string;
      previousPeriod: string;
    }): FinancialNote => {
      // --- Hierarchical Item Calculations (YOUR ORIGINAL LOGIC - UNCHANGED) ---
      const note28_1 = getValueForKey(28, "note28-amount-current-service");
      const note28_2 = getValueForKey(28, "note28-amount-interest");
      const note28_3 = getValueForKey(28, "note28-benefit-return");
      const note28_4 = getValueForKey(28, "note28-benefit-DBO");
      const note28_5 = getValueForKey(28, "note28-benefit-DBO2");
      const note28_6 = getValueForKey(28, "note28-balancesheet-present");
      const note28_7 = getValueForKey(28, "note28-balancesheet-fair");
      const note28_8 = getValueForKey(28, "note28-movement-interest");
      const note28_9 = getValueForKey(28, "note28-movement-payments");
      const note28_10 = getValueForKey(28, "note28-fairmovement-open-plan");
      const note28_11 = getValueForKey(28, "note28-fairmovement-open-benefit");
      const note28_12 = getValueForKey(28, "note28-plan-assets-Actuarial-1");
      const note28_13 = getValueForKey(28, "note28-plan-assets-Actuarial-3");
      const note28_14 = getValueForKey(28, "note28-plan-assets-Actuarial-4");
      const note28_15 = getValueForKey(28, "note28-plan-assets-Actuarial-5");
      const currentservice = {
        current: note28_1.valueCurrent ?? 0,
        previous: note28_1.valuePrevious ?? 0,
      };
      const interest = {
        current: note28_2.valueCurrent ?? 0,
        previous: note28_2.valuePrevious ?? 0,
      };
      const returnasset = {
        current: note28_3.valueCurrent ?? 0,
        previous: note28_3.valuePrevious ?? 0,
      };
      const DBO = {
        current: note28_4.valueCurrent ?? 0,
        previous: note28_4.valuePrevious ?? 0,
      };
      const DBO2 = {
        current: note28_5.valueCurrent ?? 0,
        previous: note28_5.valuePrevious ?? 0,
      };
      const benefit = {
        current: note28_6.valueCurrent ?? 0,
        previous: note28_6.valuePrevious ?? 0,
      };
      const fair = {
        current: note28_7.valueCurrent ?? 0,
        previous: note28_7.valuePrevious ?? 0,
      };
      const movementinterest = {
        current: note28_8.valueCurrent ?? 0,
        previous: note28_8.valuePrevious ?? 0,
      };
      const benefitpayment = {
        current: note28_9.valueCurrent ?? 0,
        previous: note28_9.valuePrevious ?? 0,
      };
      const plan = {
        current: note28_10.valueCurrent ?? 0,
        previous: note28_10.valuePrevious ?? 0,
      };
      const openbenefit = {
        current: note28_11.valueCurrent ?? 0,
        previous: note28_11.valuePrevious ?? 0,
      };
      const discount = {
        current: note28_12.valueCurrent ?? 0,
        previous: note28_12.valuePrevious ?? 0,
      };
      const salary = {
        current: note28_13.valueCurrent ?? 0,
        previous: note28_13.valuePrevious ?? 0,
      };
      const attrition = {
        current: note28_14.valueCurrent ?? 0,
        previous: note28_14.valuePrevious ?? 0,
      };
      const mortality1 = {
        current: note28_15.valueCurrent ?? 0,
        previous: note28_15.valuePrevious ?? 0,
      };

      // --- Editable Table Logic ---
      const row = (label: string, columnCount: number): string[] => {
        const edited = getTableValue1(
          28,
          ["note28-table1", "note28-table2"],
          label
        );
        if (edited) return edited;

        const emptyRow = Array(columnCount).fill("");
        emptyRow[0] = label;
        return emptyRow;
      };

      // --- TABLE 1: Sensitivity Analysis ---
      const sensitivityHeaders = [
        "Particulars",
        `For the Year ended ${periodHeaders.currentPeriod}\nIncrease`,
        `For the Year ended ${periodHeaders.currentPeriod}\nDecrease`,
        `For the Year ended ${periodHeaders.previousPeriod}\nIncrease`,
        `For the Year ended ${periodHeaders.previousPeriod}\nDecrease`,
        //"For the Year ended 31 March 2024\nIncrease",
        ///"For the Year ended 31 March 2024\nDecrease",
        //"For the Year ended 31 March 2023\nIncrease",
        //"For the Year ended 31 March 2023\nDecrease",
      ];
      const sensitivityColCount = sensitivityHeaders.length;

      const dis = row(
        "Discount Rate (- / + 100 Basis Points)",
        sensitivityColCount
      );
      const growth = row(
        "Salary Growth Rate (- / + 100 Basis Points)",
        sensitivityColCount
      );
      const attr = row(
        "Attrition rate (- / + 100 Basis Points)",
        sensitivityColCount
      );
      const mortality = row(
        "Mortality Rate (- / + 10% of mortality rates)",
        sensitivityColCount
      );

      // --- TABLE 2: Future Cash Outflows ---
      const outflowHeaders = ["Particulars", "Amount\nUndiscounted values"];
      const outflowColCount = outflowHeaders.length;

      // Define the editable rows for the outflow table (now blank by default)
      const par24 = row("2024-25", outflowColCount);
      const par25 = row("2025-26", outflowColCount);
      const par26 = row("2026-27", outflowColCount);
      const par27 = row("2027-28", outflowColCount);
      const par28 = row("2028-29", outflowColCount);
      const par29 = row("2029-30 to 2033- 34", outflowColCount);
      const payouts = row("Payouts above ten years", outflowColCount);

      return {
        noteNumber: 28,
        title: "Employee benefit plans",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note28-1",
            label: "28(a)  Defined contribution plans ",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-text-a",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-a",
              `The Company makes Provident Fund and Superannuation Fund contributions to defined contribution plans for qualifying employees. Under the Schemes, the Company is required to contribute a specified percentage of the payroll costs to fund the benefits.  The Company recognised ₹ 798.70 Lakhs (Year ended 31 March 2023 ₹ 696.11 Lakhs) for Provident Fund contributions and ₹ 401.01 Lakhs (Year ended 31 March 2023 ₹ 349.60 Lakhs) for Superannuation Fund contributions. The contributions payable to these plans by the Company are at rates specified in the rules of the schemes.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-2",
            label: `28(b)  Defined benefit plans \n Gratuity`,
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-text-b",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-b",
              `The Gratuity scheme is a final salary defined benefit plan, that provides for a lumpsum payment at the time of separation; based on scheme rules the benefits are calculated on the basis of last drawn salary and the period of service at the time of separation and paid as lumpsum. There is a vesting period of 5 years.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-text-c",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-c",
              "These plans typically expose the company to actuarial risks such as:"
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-text-d",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-d",
              `(i) Investment Risk: The fund is managed by LIC, fund manager. So the details of composition of plan assets managed by the fund manager is not available with the company. However, the fall in plan assets will increase the defined benefit obligation.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-text-e",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-e",
              `(ii) Interest rates risks: the defined benefit obligation calculated uses a discount rate based on government bonds. If bond yields fall, the defined benefit will tend to increase.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-text-f",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-f",
              `(iii) Salary Inflation risks: The present value of the defined benefit plan liability is calculated by reference to the future salaries of plans participants. As such increase in salary will increase the defined benefit obligation.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-text-g",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-g",
              `(iv) Demographic risks: The present value of the defined benefit plan liability is calculated by reference to the best estimate of the mortality of plan participants during their employment as the increase in life  expectancy of the plan participants will increase the plan's liability.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-text-h",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-h",
              `In respect of the plan, the most recent actuary valuation of plan assets and the present values of the defined benefit obligation were carried out as at March 31,2024 and  March 31, 2023 . The present value of the defined benefit obligation, and the related service cost and the past service cost, were measured using the projected unit credit method.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-amount",
            label:
              "Amount recognised in comprehensive income in respect of these defined benefit plans are as follows:",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note28-amount-service",
                label: "Service cost",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-amount-current-service",
                label: "Current service cost",
                valueCurrent: currentservice.current,
                valuePrevious: currentservice.previous,
                isEditableRow: true,
              },
              {
                key: "note28-amount-past-service",
                label: "Past service cost",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-amount-interest",
                label: "Net interest expense/(income)",
                valueCurrent: interest.current,
                valuePrevious: interest.previous,
                isEditableRow: true,
              },
              {
                key: "note28-amount-long",
                label:
                  "Immediate recognition of (gain)/losses-Other long term benefits",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-amount-total",
                label: "",
                isGrandTotal: true,
                valueCurrent: currentservice.current + interest.current,
                valuePrevious: currentservice.previous + interest.previous,
              },
            ],
          },
          {
            key: "note28-benefit",
            label: "Amount recognised in other comprehensive income...",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note28-benefit-return",
                label:
                  "Return on plan assets (excluding amount included in net interest expense)",
                valueCurrent: returnasset.current,
                valuePrevious: returnasset.previous,
                isEditableRow: true,
              },
              {
                key: "note28-benefit-DBO",
                label:
                  "Actuarial gains and loss arising from changes in financial assumptions in DBO",
                valueCurrent: DBO.current,
                valuePrevious: DBO.previous,
                isEditableRow: true,
              },
              {
                key: "note28-benefit-DBO2",
                label:
                  "Actuarial gains and loss arising from experience adjustments in DBO",
                valueCurrent: DBO2.current,
                valuePrevious: DBO2.previous,
                isEditableRow: true,
              },
              {
                key: "note28-benefit-total",
                label: "",
                isGrandTotal: true,
                valueCurrent: returnasset.current + DBO.current + DBO2.current,
                valuePrevious:
                  returnasset.previous + DBO.previous + DBO2.previous,
              },
              {
                key: "note28-benefit-total-final",
                label: "Total",
                isGrandTotal: true,
                valueCurrent:
                  currentservice.current +
                  interest.current +
                  returnasset.current +
                  DBO.current +
                  DBO2.current,
                valuePrevious:
                  currentservice.previous +
                  interest.previous +
                  returnasset.previous +
                  DBO.previous +
                  DBO2.previous,
              },
            ],
          },
          {
            key: "note28-balancesheet",
            label: "Amount recognised in the balance sheet",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note28-balancesheet-present",
                label: "Present value of defined benefit obligation ",
                valueCurrent: benefit.current,
                valuePrevious: benefit.previous,
                isEditableRow: true,
              },
              {
                key: "note28-balancesheet-fair",
                label: "Fair value of plan assets",
                valueCurrent: fair.current,
                valuePrevious: fair.previous,
                isEditableRow: true,
              },
              {
                key: "note28-balancesheet-subtotal",
                label: "",
                valueCurrent: benefit.current - fair.current,
                valuePrevious: benefit.previous - fair.previous,
              },
              {
                key: "note28-balancesheet-current",
                label: "Current portion of the above",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-balancesheet-noncurrent",
                label: "Non current portion of the above",
                valueCurrent: benefit.current - fair.current,
                valuePrevious: benefit.previous - fair.previous,
              },
            ],
          },
          {
            key: "note28-movement",
            label: "Movement in present value of defined benefit obligation...",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note28-movement-opening",
                label: "Opening defined benefit obligation",
                valueCurrent: benefit.previous,
                valuePrevious: 2770.99,
              },
              {
                key: "note28-movement-expenses",
                label: "Expenses recognised in profit and loss account",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-movement-current",
                label: "-Current service cost",
                valueCurrent: currentservice.current,
                valuePrevious: currentservice.previous,
              },
              {
                key: "note28-movement-past",
                label: "-Past service cost",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-movement-interest",
                label: "-Interest expense (income)",
                valueCurrent: movementinterest.current,
                valuePrevious: movementinterest.previous,
                isEditableRow: true,
              },
              {
                key: "note28-movement-income",
                label: "Recognised in other comprehensive income",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-movement-gain",
                label: "Remeasurement (gains)/losses",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-movement-loss",
                label: "-Actuarial (gain)/loss arising from:",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-movement-demographic",
                label: "i. Demographic assumptions",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-movement-financial",
                label: "ii. Financial assumptions",
                valueCurrent: DBO.current,
                valuePrevious: DBO.previous,
              },
              {
                key: "note28-movement-expense",
                label: "iii. Experience adjustments",
                valueCurrent: DBO2.current,
                valuePrevious: DBO2.previous,
              },
              {
                key: "note28-movement-payments",
                label: "Benefit payments",
                valueCurrent: benefitpayment.current,
                valuePrevious: benefitpayment.previous,
                isEditableRow: true,
              },
              {
                key: "note28-movement-close",
                label: "Closing defined obligation",
                isGrandTotal: true,
                valueCurrent:
                  benefit.previous +
                  currentservice.current +
                  movementinterest.current +
                  DBO.current +
                  DBO2.current +
                  benefitpayment.current,
                valuePrevious:
                  2770.99 +
                  currentservice.previous +
                  movementinterest.previous +
                  DBO.previous +
                  DBO2.previous +
                  benefitpayment.previous,
              },
            ],
          },
          {
            key: "note28-fairmovement",
            label: "Movement in fair value of plan assets is as follows:",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note28-fairmovement-open",
                label: "Opening fair value of plan assets",
                valueCurrent: 0,
                valuePrevious: 2833.21,
              },
              {
                key: "note28-fairmovement-open-fair",
                label: "Amount recognised in Profit & Loss Account",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-fairmovement-open-plan",
                label: "- Expected return on plan assets",
                valueCurrent: plan.current,
                valuePrevious: plan.previous,
                isEditableRow: true,
              },
              {
                key: "note28-fairmovement-open-other",
                label: "Recognised in other comprehensive income",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-fairmovement-open-gain",
                label: "Remeasurement gains/(losses)",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-fairmovement-open-return",
                label:
                  "- Actual return on plan assets in excess of the expected return",
                valueCurrent: -returnasset.current,
                valuePrevious: null,
              },
              {
                key: "note28-fairmovement-open-benefit",
                label:
                  "Contributions by employer (including benefit payments recoverable)",
                valueCurrent: openbenefit.current,
                valuePrevious: openbenefit.previous,
                isEditableRow: true,
              },
              {
                key: "note28-fairmovement-open-benefitpayment",
                label: "Benefit payments",
                valueCurrent: benefitpayment.current,
                valuePrevious: benefitpayment.previous,
              },
              {
                key: "note28-fairmovement-close",
                label: "Closing fair value of plan asset",
                isGrandTotal: true,
                valueCurrent:
                  0 +
                  plan.current +
                  -returnasset.current +
                  openbenefit.current +
                  benefitpayment.current,
                valuePrevious:
                  2833.23 +
                  plan.previous +
                  0 +
                  openbenefit.previous +
                  benefitpayment.previous,
              },
            ],
          },
          {
            key: "note28-plan-assets",
            label: "The Major categories of plan assets(%)",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note28-plan-assets-insurance",
                label: "Assets under insurance schemes",
                valueCurrent: 100,
                valuePrevious: 100,
              },
              {
                key: "note28-plan-assets-Actuarial",
                label: "Actuarial assumptions",
                isSubtotal: true,
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note28-plan-assets-Actuarial-1",
                label: "1. Discount rate",
                valueCurrent: discount.current,
                valuePrevious: discount.previous,
                isEditableRow: true,
              },
              {
                key: "note28-plan-assets-Actuarial-2",
                label: "2. Expected rate of return on plan assets",
                valueCurrent: discount.current,
                valuePrevious: discount.previous,
              },
              {
                key: "note28-plan-assets-Actuarial-3",
                label: "3. Salary escalation",
                valueCurrent: salary.current,
                valuePrevious: salary.previous,
                isEditableRow: true,
              },
              {
                key: "note28-plan-assets-Actuarial-4",
                label: "4. Attrition rate",
                valueCurrent: attrition.current,
                valuePrevious: attrition.previous,
                isEditableRow: true,
              },
              {
                key: "note28-plan-assets-Actuarial-5",
                label: "5. Mortality rate",
                valueCurrent: mortality1.current,
                valuePrevious: mortality1.previous,
                isEditableRow: true,
              },
            ],
          },
          "Sensitivity analysis:",
          {
            key: "note28-text-i",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-i",
              `Significant actuarial assumptions for the determination of the defined benefit obligation are discount rate, expected salary increase and mortality. The sensitivity analysis below have been determined based on reasonably possible changes of the assumptions occurring at the end of the reporting period, while holding all other assumptions constant. The results of sensitivity analysis is given below:`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          "Gratuity",
          {
            key: "note28-table1",
            type: "table",
            isEditable: true, // Make this table editable
            headers: sensitivityHeaders,
            rows: [dis, growth, attr, mortality],
          },
          {
            key: "note28-text-j",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-j",
              `Sensitivity analysis presented above may not be representative of the actual change in the defined benefit obligation as it is unlikely that the change in assumptions would occur in isolation of one another as some of the assumptions may be correlated. There are no changes from the previous period in the methods and assumptions used in preparing the sensitivity analysis.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-text-k",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-k",
              `There has been no change in the process used by the Company to manage its risks from prior periods.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-text-l",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note28-text-l",
              `Expected future cash outflows towards the plans are as follows:`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note28-table2",
            type: "table",
            isEditable: true, // Make this table editable
            headers: outflowHeaders,
            rows: [par24, par25, par26, par27, par28, par29, payouts],
          },
        ],
      };
    };
    const calculateNote29 = (): FinancialNote => {
      const note29_1 = getValueForKey(29, "note29-balance-rou");

      const note29_2 = getValueForKey(29, "note29-balance-long-term");

      const note29_3 = getValueForKey(29, "note29-balance-short");

      const note29_4 = getValueForKey(29, "note29-pl-depreciation");

      const note29_5 = getValueForKey(29, "note29-pl-finance");

      const note29_6 = getValueForKey(29, "note29-pl-interest");

      const note29_7 = getValueForKey(29, "note29-pl-open");

      const note29_8 = getValueForKey(29, "note29-pl-add");

      const note29_9 = getValueForKey(29, "note29-pl-payments");

      const note29_10 = getValueForKey(29, "note29-pl-1");

      const note29_11 = getValueForKey(29, "note29-pl-5");

      const note29_12 = getValueForKey(29, "note29-pl-years");

      const note29_13 = getValueForKey(29, "note29a-lease-noncurrent");

      const note29_14 = getValueForKey(29, "note29a-lease-current");

      const note29_15_1 = getValueForKey(29, "note29a-year1");
      const note29_15_2 = getValueForKey(29, "note29a-year2");
      const note29_15_3 = getValueForKey(29, "note29a-year3");
      const note29_15_4 = getValueForKey(29, "note29a-year4");
      const note29_15_5 = getValueForKey(29, "note29a-year5");
      const note29_15_6 = getValueForKey(29, "note29a-year6");

      const note29_16 = getValueForKey(29, "note29a-total");

      const note29_17 = getValueForKey(29, "note29a-unearned");

      const note29_18 = getValueForKey(29, "note29a-after");

      const note29_19 = getValueForKey(29, "note29a-within");

      const note29_20 = getValueForKey(29, "note29a-after-lease");

      const note29_21 = getValueForKey(29, "note29a-within-lease");

      const note29_22 = getValueForKey(29, "note29a-profit-selling");

      const note29_23 = getValueForKey(29, "note29a-profit-finance");
      const note29_24 = getValueForKey(29, "note29a-investment-finance");

      const rou = {
        current: note29_1.valueCurrent ?? 0,
        previous: note29_1.valuePrevious ?? 0,
      };
      const long = {
        current: note29_2.valueCurrent ?? 0,
        previous: note29_2.valuePrevious ?? 0,
      };
      const short = {
        current: note29_3.valueCurrent ?? 0,
        previous: note29_3.valuePrevious ?? 0,
      };
      const dep = {
        current: note29_4.valueCurrent ?? 0,
        previous: note29_4.valuePrevious ?? 0,
      };
      const financecost = {
        current: note29_5.valueCurrent ?? 0,
        previous: note29_5.valuePrevious ?? 0,
      };
      const interest = {
        current: note29_6.valueCurrent ?? 0,
        previous: note29_6.valuePrevious ?? 0,
      };
      const open = {
        current: note29_7.valueCurrent ?? 0,
        previous: note29_7.valuePrevious ?? 0,
      };
      const add = {
        current: note29_8.valueCurrent ?? 0,
        previous: note29_8.valuePrevious ?? 0,
      };
      const payments = {
        current: note29_9.valueCurrent ?? 0,
        previous: note29_9.valuePrevious ?? 0,
      };
      const year = {
        current: note29_10.valueCurrent ?? 0,
        previous: note29_10.valuePrevious ?? 0,
      };
      const year5 = {
        current: note29_11.valueCurrent ?? 0,
        previous: note29_11.valuePrevious ?? 0,
      };
      const years = {
        current: note29_12.valueCurrent ?? 0,
        previous: note29_12.valuePrevious ?? 0,
      };
      const nonlease = {
        current: note29_13.valueCurrent ?? 0,
        previous: note29_13.valuePrevious ?? 0,
      };
      const lease = {
        current: note29_14.valueCurrent ?? 0,
        previous: note29_14.valuePrevious ?? 0,
      };
      const yr1 = {
        current: note29_15_1.valueCurrent ?? 0,
        previous: note29_15_1.valuePrevious ?? 0,
      };
      const yr2 = {
        current: note29_15_2.valueCurrent ?? 0,
        previous: note29_15_2.valuePrevious ?? 0,
      };
      const yr3 = {
        current: note29_15_3.valueCurrent ?? 0,
        previous: note29_15_3.valuePrevious ?? 0,
      };
      const yr4 = {
        current: note29_15_4.valueCurrent ?? 0,
        previous: note29_15_4.valuePrevious ?? 0,
      };
      const yr5 = {
        current: note29_15_5.valueCurrent ?? 0,
        previous: note29_15_5.valuePrevious ?? 0,
      };
      const yr6 = {
        current: note29_15_6.valueCurrent ?? 0,
        previous: note29_15_6.valuePrevious ?? 0,
      };
      const rectotal = {
        current:
          yr6.current +
          yr5.current +
          yr4.current +
          yr3.current +
          yr2.current +
          yr1.current,
        previous:
          yr6.previous +
          yr5.previous +
          yr4.previous +
          yr3.previous +
          yr2.previous +
          yr1.previous,
      };
      const less = {
        current: note29_17.valueCurrent ?? 0,
        previous: note29_17.valuePrevious ?? 0,
      };
      const after = {
        current: note29_18.valueCurrent ?? 0,
        previous: note29_18.valuePrevious ?? 0,
      };
      const within = {
        current: note29_19.valueCurrent ?? 0,
        previous: note29_19.valuePrevious ?? 0,
      };
      const afterlease = {
        current: note29_20.valueCurrent ?? 0,
        previous: note29_20.valuePrevious ?? 0,
      };
      const withinlease = {
        current: note29_21.valueCurrent ?? 0,
        previous: note29_21.valuePrevious ?? 0,
      };
      const profitselling = {
        current: note29_22.valueCurrent ?? 0,
        previous: note29_22.valuePrevious ?? 0,
      };
      const profitfinance = {
        current: note29_23.valueCurrent ?? 0,
        previous: note29_23.valuePrevious ?? 0,
      };
      const investfinance = {
        current: note29_24.valueCurrent ?? 0,
        previous: note29_24.valuePrevious ?? 0,
      };

      return {
        noteNumber: 29,
        title: "Leases",
        subtitle:
          "Rental expenses recorded for short term leases was ₹ 847.12 lakhs (31 March 2023 - ₹ 853.60 lakhs ) for the year ended on 31 March 2024.",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note29-balance",
            label: "Amounts recognized in Balance Sheet were as follows:",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note29-balance-rou",
                label: "ROU Assets",
                valueCurrent: rou.current,
                valuePrevious: rou.previous,
                isEditableRow: true,
              },
              {
                key: "note29-balance-long",
                label: "Operating lease liabilities",
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note29-balance-long-term",
                    label: "        - Long Term liabilities",
                    valueCurrent: long.current,
                    valuePrevious: long.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29-balance-short",
                    label: "        - Short Term liabilities",
                    valueCurrent: short.current,
                    valuePrevious: short.previous,
                    isEditableRow: true,
                  },
                ],
              },
            ],
          },
          {
            key: "note29-pl",
            label: "Amounts recognized in profit and loss were as follows:",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note29-pl-depreciation",
                label: "Depreciation Expenditure",
                valueCurrent: dep.current,
                valuePrevious: dep.previous,
                isEditableRow: true,
              },
              {
                key: "note29-pl-finance",
                label: "Finance Cost on Lease Liabilities",
                valueCurrent: financecost.current,
                valuePrevious: financecost.previous,
                isEditableRow: true,
              },
              {
                key: "note29-pl-impact",
                label:
                  "Impact on the statement of profit and loss for the year ended",
                isGrandTotal: true,
                valueCurrent: dep.current + financecost.current,
                valuePrevious: dep.previous + financecost.previous,
              },
            ],
          },
          {
            key: "note29-movement",
            label: "Movement in Lease Liability ",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note29-pl-open",
                label: "Opening Balance",
                valueCurrent: open.current,
                valuePrevious: open.previous,
                isEditableRow: true,
              },
              {
                key: "note29-pl-add",
                label: "Additions during the year",
                valueCurrent: add.current,
                valuePrevious: add.previous,
                isEditableRow: true,
              },
              {
                key: "note29-pl-interest",
                label: "Interest Expense",
                valueCurrent: interest.current,
                valuePrevious: interest.previous,
                isEditableRow: true,
              },
              {
                key: "note29-pl-payments",
                label: "Payments made during the year",
                valueCurrent: payments.current,
                valuePrevious: payments.previous,
                isEditableRow: true,
              },
              {
                key: "note29-pl-close",
                label: "Closing Balance",
                valueCurrent:
                  open.current +
                  add.current +
                  interest.current +
                  payments.current,
                valuePrevious:
                  open.previous +
                  add.previous +
                  interest.previous +
                  payments.previous,
              },
            ],
          },
          {
            key: "note29-movement1",
            label:
              " Supplemental cash flow information related to leases was as follows :",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note29-pl-leases",
                label: "Total cash outflow for leases   ",
                valueCurrent: -payments.current,
                valuePrevious: -payments.previous,
              },
            ],
          },
          {
            key: "note29-maturities",
            label:
              " Maturities of lease liabilities were as follows (Undiscounted lease payments to be paid)",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note29-pl-1",
                label: "Not later than 1 year",
                valueCurrent: year.current,
                valuePrevious: year.previous,
                isEditableRow: true,
              },
              {
                key: "note29-pl-5",
                label: "Later than 1 year and not later than 5 years",
                valueCurrent: year5.current,
                valuePrevious: year5.previous,
                isEditableRow: true,
              },
              {
                key: "note29-pl-years",
                label: "Later than 5 years",
                valueCurrent: years.current,
                valuePrevious: years.previous,
                isEditableRow: true,
              },
              {
                key: "note29-pl-totallease",
                label: "Total Lease Payments",
                isGrandTotal: true,
                valueCurrent: year.current + year5.current + years.current,
                valuePrevious: year.previous + year5.previous + years.previous,
              },
            ],
          },
          {
            key: "note29a-finance-lease",
            label: "Note 29A: Finance lease receivables",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note29a-bs-recognized",
                label: "Amounts recognized in Balance Sheet were as follows",
                isSubtotal: true,
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note29a-lease",
                    label: "Net Investment in Lease",
                    valueCurrent: null,
                    valuePrevious: null,
                    children: [
                      {
                        key: "note29a-lease-noncurrent",
                        label: "     - Non-current",
                        valueCurrent: nonlease.current,
                        valuePrevious: nonlease.previous,
                        isEditableRow: true,
                      },
                      {
                        key: "note29a-lease-current",
                        label: "     - current",
                        valueCurrent: lease.current,
                        valuePrevious: lease.previous,
                        isEditableRow: true,
                      },
                    ],
                  },
                ],
              },
              {
                key: "note29a-under-lease",
                label: "Amounts receivable under finance lease",
                isSubtotal: true,
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note29a-year1",
                    label: "Year 1",
                    valueCurrent: yr1.current,
                    valuePrevious: yr1.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-year2",
                    label: "Year 2",
                    valueCurrent: yr2.current,
                    valuePrevious: yr2.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-year3",
                    label: "Year 3",
                    valueCurrent: yr3.current,
                    valuePrevious: yr3.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-year4",
                    label: "Year 4",
                    valueCurrent: yr4.current,
                    valuePrevious: yr4.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-year5",
                    label: "Year 5",
                    valueCurrent: yr5.current,
                    valuePrevious: yr5.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-year6plus",
                    label: "Year 6 onwards",
                    valueCurrent: yr6.current,
                    valuePrevious: yr6.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-total",
                    label: "Total",
                    isGrandTotal: true,
                    valueCurrent: rectotal.current,
                    valuePrevious: rectotal.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-unearned",
                    label: "Less: unearned finance income",
                    valueCurrent: less.current,
                    valuePrevious: less.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-net-investment",
                    label:
                      "Present value of lease payments receivable / Net Investment in Lease",
                    isSubtotal: true,
                    valueCurrent: rectotal.current - less.current,
                    valuePrevious: rectotal.previous - less.previous,
                  },
                ],
              },
              {
                key: "note29a-net-analysed",
                label: "Undiscounted lease payments analysed as:",
                valueCurrent: null,
                valuePrevious: null,
                isSubtotal: true,
                children: [
                  {
                    key: "note29a-after",
                    label: "-     Recoverable after 12 months",
                    valueCurrent: after.current,
                    valuePrevious: after.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-within",
                    label: "-     Recoverable within 12 months",
                    valueCurrent: within.current,
                    valuePrevious: within.previous,
                    isEditableRow: true,
                  },
                ],
              },
              {
                key: "note29a-net-lease-investment",
                label: "Net investment in the lease analysed as:",
                valueCurrent: null,
                valuePrevious: null,
                isSubtotal: true,
                children: [
                  {
                    key: "note29a-after-lease",
                    label: "-     Recoverable after 12 months",
                    valueCurrent: afterlease.current,
                    valuePrevious: afterlease.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-within-lease",
                    label: "-     Recoverable within 12 months",
                    valueCurrent: withinlease.current,
                    valuePrevious: withinlease.previous,
                    isEditableRow: true,
                  },
                ],
              },
              {
                key: "note29a-profit",
                label: `The Company entered into finance leasing arrangements as a lessor for certain equipment to its customer. The term of finance leases entered into is 5 years. These lease contracts do not include extension or early termination options. The average effective interest rate contracted approximates 7.61% (2022-23: Nil) per annum. The net investment in lease is secured by bank guarantee issued by customer's bank.
          The following table presents the amounts included in profit or loss:`,
                valueCurrent: null,
                valuePrevious: null,
                children: [
                  {
                    key: "note29a-profit-selling",
                    label: "- Selling profit/loss for finance leases",
                    valueCurrent: profitselling.current,
                    valuePrevious: profitselling.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-profit-finance",
                    label:
                      "- Finance income on the net investment in finance leases",
                    valueCurrent: profitfinance.current,
                    valuePrevious: profitfinance.previous,
                    isEditableRow: true,
                  },
                  {
                    key: "note29a-investment-finance",
                    label:
                      "- Income relating to variable lease payments not included in the net investment in finance leases",
                    valueCurrent: investfinance.current,
                    valuePrevious: investfinance.previous,
                    isEditableRow: true,
                  },
                ],
              },
            ],
          },
        ],
      };
    };
    const format = (value: number): string =>
      value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const calculateNote30 = (periodHeaders: {
      currentPeriod: string;
      previousPeriod: string;
    }): FinancialNote => {
      // --- Editable Table Logic ---
      const parseNum = (val: string): number => {
        if (!val) return 0;
        return parseFloat(String(val).replace(/,/g, "")) || 0;
      };

      const row = (label: string, columnCount: number): string[] => {
        const edited = getTableValue1(30, ["note30-table1"], label);
        if (edited) return edited;

        const emptyRow = Array(columnCount).fill("");
        emptyRow[0] = label;
        return emptyRow;
      };

      const headers = [
        "Geographic segment",
        `India\n ${periodHeaders.currentPeriod}`,
        //"India\n31 March 2024",
        ` ${periodHeaders.previousPeriod}`,
        // "\n31 March 2023",
        `Outside India\n ${periodHeaders.currentPeriod}`,
        //"Outside India\n31 March 2024",
        `${periodHeaders.previousPeriod}`,
        //"\n31 March 2023",
        `Total\n ${periodHeaders.currentPeriod}`,
        `\n ${periodHeaders.previousPeriod}`,
        //"Total\n31 March 2024",
        //"\n31 March 2023",
      ];
      const colCount = headers.length;

      // --- Define Editable Rows (without default data to start blank) ---
      const salesRow = row("a) Sale and services(Net)", colCount);
      const otherIncomeRow = row("b) Other income", colCount);
      const rawMaterialsRow = row(
        "Cost of raw material and components consumed",
        colCount
      );
      const employeeRow = row("Employee benefits expense", colCount);
      const depreciationRow = row("Depreciation and amortization", colCount);
      const otherExpensesRow = row("Other Expenses", colCount);
      const financeCostRow = row("i) Finance Cost", colCount);
      const assetsRow = row("Assets", colCount);
      const dtaRow = row("i) Deffered tax assets(net)", colCount);
      const itaRow = row("ii) Income tax assets(net)", colCount);
      const liabilitiesRow = row("Liabilities", colCount);
      const taxLiabilitiesRow = row("i)Income tax Liabilities(net)", colCount);
      const capitalExpenditureRow = row("Capital Expenditure", colCount);

      // --- Perform Dynamic Calculations ---

      // Calculate totals for editable rows
      const editableRows = [
        salesRow,
        otherIncomeRow,
        rawMaterialsRow,
        employeeRow,
        depreciationRow,
        otherExpensesRow,
        assetsRow,
        liabilitiesRow,
        capitalExpenditureRow,
      ];
      editableRows.forEach((r) => {
        r[5] = (parseNum(r[1]) + parseNum(r[3])).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }); // Total 2024
        r[6] = (parseNum(r[2]) + parseNum(r[4])).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }); // Total 2023
      });

      // Calculate "Total income"
      const totalIncomeRow = [
        "Total income",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
      ];
      for (let i = 1; i <= 6; i++) {
        const sum = parseNum(salesRow[i]) + parseNum(otherIncomeRow[i]);
        totalIncomeRow[i] = sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        });
      }

      // Calculate "Total Expenses"
      const totalExpensesRow = [
        "Total Expenses",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
      ];
      const expenseRows = [
        rawMaterialsRow,
        employeeRow,
        depreciationRow,
        otherExpensesRow,
        financeCostRow,
      ];
      for (let i = 1; i <= 6; i++) {
        const sum = expenseRows.reduce((acc, r) => acc + parseNum(r[i]), 0);
        totalExpensesRow[i] = sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        });
      }

      // Calculate "Segment Profit"
      const segmentProfitRow = [
        "Segment Profit",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
      ];
      for (let i = 1; i <= 6; i++) {
        const profit =
          parseNum(totalIncomeRow[i]) - parseNum(totalExpensesRow[i]);
        segmentProfitRow[i] = profit.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        });
      }

      // Calculate "Total Assets"
      const totalAssetsRow = [
        "Total Assets",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
      ];
      const assetRows = [assetsRow, dtaRow, itaRow];
      for (let i = 1; i <= 6; i++) {
        const sum = assetRows.reduce((acc, r) => acc + parseNum(r[i]), 0);
        totalAssetsRow[i] = sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        });
      }

      // Calculate "Total Liabilities"
      const totalLiabilitiesRow = [
        "Total Liabilities",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
      ];
      const liabilityRows = [liabilitiesRow, taxLiabilitiesRow];
      for (let i = 1; i <= 6; i++) {
        const sum = liabilityRows.reduce((acc, r) => acc + parseNum(r[i]), 0);
        totalLiabilitiesRow[i] = sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        });
      }

      return {
        noteNumber: 30,
        title: "Segment information",
        totalCurrent: null,
        totalPrevious: null,
        footer: `Note:\nThe Secondary Segment is determined based on location of the customers. All other assets are situated in India.`,
        content: [
          {
            key: "note30-text-a",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note30-text-a",
              `As part of structural reform global project, the Yokogawa Group has established Structure between the Parent Company and its Subsidiaries wherein for each Global Business Function, a corresponding Regional Business/Process Function will be responsible for routine business/process operations. These Regional Business/Process Functions will make operating decisions in ratification with Managing Director of the Company and have been identified as the Chief Operating Decision Maker (CODM) as defined by Ind AS 108, operating segments. \nThe Company has identified geographic segments as operating and reportable segment. Revenues and expenses directly attributable to the geographic segment are reported under such segments. Assets and liabilities that are directly attributable or allocable to the segments are disclosed under the reportable segments. All other assets and liabilities are disclosed as unallocable. Fixed assets that are used interchangeably amongst segments are not allocated to the reportable segments. Geographical revenues are allocated based on the location of the customer. Geographic segments of the Company includes Japan, Singapore, Middle East & others.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note30-intro",
            label: `The geographic segments individually contributing 10 percent or more of the Company’s revenues and segment assets are shown separately:`,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note30-table1",
            type: "table",
            isEditable: true, // MAKE THE TABLE EDITABLE
            headers: headers,
            rows: [
              ["Revenue by geographical segment"],
              salesRow,
              otherIncomeRow,
              totalIncomeRow,
              ["Income/(Expenses)"],
              rawMaterialsRow,
              employeeRow,
              depreciationRow,
              otherExpensesRow,
              ["Unallocable"],
              financeCostRow,
              totalExpensesRow,
              segmentProfitRow,
              assetsRow,
              ["Unaliocable Assets"],
              dtaRow,
              itaRow,
              totalAssetsRow,
              liabilitiesRow,
              ["Unallocable Liabilities"],
              taxLiabilitiesRow,
              totalLiabilitiesRow,
              capitalExpenditureRow,
            ],
          },
        ],
      };
    };
    const calculateNote32 = (): FinancialNote => {
      const note32_1 = getValueForKey(32, "note32-netprofit");

      const note32_2 = getValueForKey(32, "note32-shares");

      const note32_3 = getValueForKey(32, "note32-face");

      const netProfit = {
        current: note32_1.valueCurrent ?? 0,
        previous: note32_1.valuePrevious ?? 0,
      };
      const weightedAvgShares = {
        current: note32_2.valueCurrent ?? 0,
        previous: note32_2.valuePrevious ?? 0,
      };
      const faceValue = {
        current: note32_3.valueCurrent ?? 0,
        previous: note32_3.valuePrevious ?? 0,
      };

      const earningsPerShare = {
        current: Number(
          ((netProfit.current * 1e5) / weightedAvgShares.current).toFixed(2)
        ),
        previous: Number(
          ((netProfit.previous * 1e5) / weightedAvgShares.previous).toFixed(2)
        ),
      };

      return {
        noteNumber: 32,
        title: "Earnings per share",
        subtitle: "Basic and Diluted",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note32-netprofit",
            label: "Net profit for the year",
            valueCurrent: netProfit.current,
            valuePrevious: netProfit.previous,
            isEditableRow: true,
          },
          {
            key: "note32-shares",
            label: "Weighted average number of equity shares",
            valueCurrent: weightedAvgShares.current,
            valuePrevious: weightedAvgShares.previous,
            isEditableRow: true,
          },
          {
            key: "note32-face",
            label: "Par value per share (in Rs.)",
            valueCurrent: faceValue.current,
            valuePrevious: faceValue.previous,
            isEditableRow: true,
          },
          {
            key: "note32-eps",
            label: "Earnings per share - basic and diluted (in Rs.)",
            valueCurrent: earningsPerShare.current,
            valuePrevious: earningsPerShare.previous,
          },
          {
            key: "note5-nc-emp-total",
            label: "",
            valueCurrent: earningsPerShare.current,
            valuePrevious: earningsPerShare.previous,
            isGrandTotal: true,
          },
        ],
      };
    };
    const calculateNote33 = (): FinancialNote => {
      // --- Helper Functions ---
      const parseNum = (val: string, isPrevious = false): number => {
        if (!val) return 0;
        const parts = String(val).split("\n");
        const targetPart = isPrevious ? parts[1] || "0" : parts[0] || "0";
        return parseFloat(targetPart.replace(/[(),]/g, "")) || 0;
      };
      const parseNum2 = (val: string): number => {
        if (!val) return 0;
        return parseFloat(val.replace(/[(),]/g, "")) || 0;
      };
      const formatNum = (val: number): string =>
        val.toLocaleString("en-IN", { minimumFractionDigits: 2 });
      const formatPrevNum = (val: number): string => `${formatNum(val)}`;

      const row = (label: string, defaultData: string[]): string[] => {
        const edited = getTableValue1(33, ["note33-table1"], label);
        if (edited) return edited;
        return [label, ...defaultData];
      };

      // --- Data and Table Structure ---
      const headers = [
        "",
        "As at 1 April 2023",
        "Additions",
        "Utilisation",
        "As at 31 March 2024",
      ];

      // Define editable rows, providing default data in the "current\n(previous)" format
      const warrantyRow = row("Provision for product support (Warranty)", [
        "",
        "",
        "",
        "",
      ]);
      const warrantyRow2 = row("Warranty Previous", [
        "",
        "",
        "",
        "",
      ]);
      const onerousRow = row(
        "Provision for estimated losses on onerous contracts",
        ["", "", "", ""]
      );
      const onerousRow2 = row(
        "Onerous Previous",
        ["", "", "", ""]
      );
      const constructionRow = row(
        "Provision for estimated losses on construction contracts",
        [
          "",
          "",
          "",
          "",
        ]
      );
      const constructionRow2 = row(
        "Construction Previous",
        [
          "",
          "",
          "",
          "",
        ]
      );
      const serviceTaxRow = row("Provision for service tax", [
        "",
        "",
        "",
        "",
      ]);
      const serviceTaxRow2 = row("Service tax Previous", [
        "",
        "",
        "",
        "",
      ]);

      // --- Dynamic Calculations ---
      // Recalculate the "As at 31 March" column based on the other columns
      [warrantyRow, warrantyRow2, onerousRow, onerousRow2, constructionRow, constructionRow2, serviceTaxRow, serviceTaxRow2].forEach((r) => {
        const opening = parseNum(r[1], false);
        const additions = parseNum(r[2], false);
        const utilisation = parseNum(r[3], false);
        const closing = opening + additions - utilisation;

        const prev_opening = parseNum(r[1], true);
        const prev_additions = parseNum(r[2], true);
        const prev_utilisation = parseNum(r[3], true);
        const prev_closing = prev_opening + prev_additions - prev_utilisation;

        r[4] = `${formatNum(closing)}`;
      });

      // Calculate totals for the current year (2024)
      const allRows = [warrantyRow, warrantyRow2, onerousRow, onerousRow2, constructionRow, constructionRow2, serviceTaxRow, serviceTaxRow2];
      const total2024 = [
        "Total as on 31 March 2024",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
      ];
      for (let i = 1; i <= 4; i++) {
        const colSum = [warrantyRow, constructionRow, onerousRow, serviceTaxRow].reduce(
          (acc, r) => acc + parseNum(r[i], false),
          0
        );
        total2024[i] = formatNum(colSum);
      }

      // Calculate totals for the previous year (2023)
      const total2023 = [
        "Total as on 31 March 2023",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
      ];
      for (let i = 1; i <= 4; i++) {
        const colSum = [warrantyRow2, onerousRow2, constructionRow2, serviceTaxRow2].reduce(
          (acc, r) => acc + parseNum2(r[i]),
          0
        );
        total2023[i] = formatPrevNum(colSum);
      }

      return {
        noteNumber: 33,
        title: "Details of provisions",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note33-title", // Corrected key
            label: `The Company has made provision for various contractual obligations based on its assessment of the amount it estimates to incur to meet such obligations, details of which are given below:`,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note33-table1",
            type: "table",
            isEditable: true, // This flag enables editing in your NotesEditor
            headers: headers,
            rows: [
              warrantyRow,
              warrantyRow2,
              onerousRow,
              onerousRow2,
              constructionRow,
              constructionRow2,
              serviceTaxRow,
              serviceTaxRow2,
              total2024,
              total2023,
            ],
          },
        ],
      };
    };
    const calculateNote34 = (): FinancialNote => {
      const note34_1 = getValueForKey(34, "note34-pl-current-tax");

      const note34_2 = getValueForKey(34, "note34-oci");

      const note34_3 = getValueForKey(34, "note34-benefit");

      const note34_4 = getValueForKey(34, "note34-reconciliation-open");

      const note34_5 = getValueForKey(34, "note34-reconciliation-v3");

      const note34_6 = getValueForKey(34, "note34-reconciliation-v4");

      const note34_7 = getValueForKey(34, "note34-reconciliation-short");

      const note34_8 = getValueForKey(34, "note34-reconciliation-expectedloss");

      const note34_9 = getValueForKey(34, "note34-Deferred-liability");

      const note34_10 = getValueForKey(34, "note34-Deferred-asset-provision");

      const note34_11 = getValueForKey(34, "note34-Deferred-asset-difference");

      const note34_12 = getValueForKey(34, "note34-Deferred-asset-debt");

      const note34_13 = getValueForKey(34, "note34-Deferred-asset-servicetax");

      const note34_14 = getValueForKey(34, "note34-Deferred-asset-loss");

      const note34_15 = getValueForKey(34, "note34-Deferred-asset-Others");

      const currentIncomeTax = {
        current: note34_1.valueCurrent ?? 0,
        previous: note34_1.valuePrevious ?? 0,
      };
      const relating = {
        current: note34_2.valueCurrent ?? 0,
        previous: note34_2.valuePrevious ?? 0,
      };
      const benefits = {
        current: note34_3.valueCurrent ?? 0,
        previous: note34_3.valuePrevious ?? 0,
      };
      const opening = {
        current: note34_4.valueCurrent ?? 0,
        previous: note34_4.valuePrevious ?? 0,
      };
      const account = {
        current: note34_5.valueCurrent ?? 0,
        previous: note34_5.valuePrevious ?? 0,
      };
      const enacted = {
        current: note34_6.valueCurrent ?? 0,
        previous: note34_6.valuePrevious ?? 0,
      };
      const short = {
        current: note34_7.valueCurrent ?? 0,
        previous: note34_7.valuePrevious ?? 0,
      };
      const expectedloss = {
        current: note34_8.valueCurrent ?? 0,
        previous: note34_8.valuePrevious ?? 0,
      };
      const liability = {
        current: note34_9.valueCurrent ?? 0,
        previous: note34_9.valuePrevious ?? 0,
      };
      const provision = {
        current: note34_10.valueCurrent ?? 0,
        previous: note34_10.valuePrevious ?? 0,
      };
      const difference = {
        current: note34_11.valueCurrent ?? 0,
        previous: note34_11.valuePrevious ?? 0,
      };
      const debts = {
        current: note34_12.valueCurrent ?? 0,
        previous: note34_12.valuePrevious ?? 0,
      };
      const servicetax = {
        current: note34_13.valueCurrent ?? 0,
        previous: note34_13.valuePrevious ?? 0,
      };
      const loss = {
        current: note34_14.valueCurrent ?? 0,
        previous: note34_14.valuePrevious ?? 0,
      };
      const others = {
        current: note34_15.valueCurrent ?? 0,
        previous: note34_15.valuePrevious ?? 0,
      };
      // --- Profit and Loss Section ---

      const closing = {
        previous: opening.previous + benefits.previous - -relating.previous,
        current:
          opening.previous +
          benefits.previous -
          -relating.previous +
          benefits.current -
          -relating.current,
      };

      return {
        noteNumber: 34,
        title: "Income Tax",
        subtitle: "The major components of income tax expense are:",
        content: [
          {
            key: "note34-income-tax",
            label: "Current income tax:",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note34-pl-current-tax",
            label: "Current income tax charge",
            valueCurrent: currentIncomeTax.current,
            valuePrevious: currentIncomeTax.previous,
            isEditableRow: true,
          },
          {
            key: "note34-pl-deferred-tax",
            label: "Deferred tax charge / (credit)",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note34-oci",
            label:
              "Relating to the origination and reversal of temporary differences",
            valueCurrent: relating.current,
            valuePrevious: relating.previous,
            isEditableRow: true,
          },
          {
            key: "note34-oci-dbt",
            label:
              "Income tax expense reported in Statement of Profit and Loss",
            isSubtotal: true,
            valueCurrent: currentIncomeTax.current + relating.current,
            valuePrevious: currentIncomeTax.previous + relating.previous,
          },
          {
            key: "note34-recon",
            label:
              "Deferred tax related to items recognised in other comprehensive income",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note34-benefit",
            label:
              "Income tax relating to re-measurement gains on defined benefit plans",
            valueCurrent: benefits.current,
            valuePrevious: benefits.previous,
            isEditableRow: true,
          },
          {
            key: "note34-recon-oci-movement",
            label: "Income tax expense reported in other comprehensive income",
            valueCurrent: benefits.current,
            valuePrevious: benefits.previous,
          },
          {
            key: "note34-reconciliation",
            label: "Reconciliation of deferred tax(net)",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          {
            key: "note34-reconciliation-open",
            label: "Opening balance",
            valueCurrent: closing.previous,
            valuePrevious: opening.previous,
            isEditableRow: true,
          },
          {
            key: "note34-reconciliation-tax-credit",
            label:
              "Tax credit/ (expense) during the year recognized in statement of profit and loss",
            valueCurrent: -relating.current,
            valuePrevious: -relating.previous,
          },
          {
            key: "note34-reconciliation-tax-expense",
            label:
              "Tax expense during the year recognised in other comprehensive income",
            valueCurrent: benefits.current,
            valuePrevious: benefits.previous,
          },
          {
            key: "note34-reconciliation-closing",
            label: "Closing balance",
            isSubtotal: true,
            valueCurrent: closing.current,
            valuePrevious: closing.previous,
          },
          {
            key: "note34-reconciliation-v2",
            label:
              "Reconciliation of tax expense and the accounting profit multiplied by Indias domestic tax rate",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          {
            key: "note34-reconciliation-v3",
            label: "Accounting profit before tax and exceptional item",
            valueCurrent: account.current,
            valuePrevious: account.previous,
            isEditableRow: true,
          },
          {
            key: "note34-reconciliation-v4",
            label: "Enacted income tax rate in India",
            valueCurrent: enacted.current,
            valuePrevious: enacted.previous,
            isEditableRow: true,
          },
          {
            key: "note34-reconciliation-tax",
            label:
              "Tax on accounting profit at statutory income tax rate 25.168% (in FY 2022-23 25.168%)",
            valueCurrent: account.current * (enacted.current / 100),
            valuePrevious: account.previous * (enacted.previous / 100),
          },
          {
            key: "note34-reconciliation-taxable",
            label:
              "Tax effects of amounts which are not deductible (taxable) in calculating taxable income",
            valueCurrent:
              -(account.current * (enacted.current / 100)) +
              expectedloss.current -
              short.current,
            valuePrevious:
              -(account.current * (enacted.previous / 100)) +
              expectedloss.previous -
              short.previous,
          },
          {
            key: "note34-reconciliation-taxliability",
            label:
              "Tax effect of items constituting deferred tax liability (Refer below for details)",
            valueCurrent: 0,
            valuePrevious: 0,
          },
          {
            key: "note34-reconciliation-taxasset",
            label:
              "Tax effect of items constituting deferred tax assets (Refer below for details)",
            valueCurrent: 0,
            valuePrevious: 0,
          },
          {
            key: "note34-reconciliation-taxprofit",
            label:
              "Tax effect on items that will not be reclassified to Profit & Loss Account",
            valueCurrent: 0,
            valuePrevious: 0,
          },
          {
            key: "note34-reconciliation-disallowances",
            label: "Other disallowances",
            valueCurrent: 0,
            valuePrevious: 0,
          },
          {
            key: "note34-reconciliation-short",
            label: "Short/ (excess) provision for previous year",
            valueCurrent: short.current,
            valuePrevious: short.previous,
            isEditableRow: true,
          },
          {
            key: "note34-reconciliation-expected",
            label: "Expected income tax expense",
            valueCurrent:
              account.current * (enacted.current / 100) +
              (-(account.current * (enacted.current / 100)) +
                expectedloss.current -
                short.current) +
              short.current,
            valuePrevious:
              account.previous * (enacted.previous / 100) +
              (-(account.current * enacted.current) +
                expectedloss.previous -
                short.previous) +
              short.previous,
          },
          {
            key: "note34-reconciliation-expectedloss",
            label:
              "Income tax expense reported in the statement of Profit and Loss",
            valueCurrent: expectedloss.current,
            valuePrevious: expectedloss.previous,
            isEditableRow: true,
          },
          {
            key: "note34-Deferred",
            label: "Deferred tax (liability) / asset ",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          {
            key: "note34-Deferred-liability-main",
            label: "Tax effect of items constituting deferred tax liability",
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note34-Deferred-assets",
            label:
              "On difference between book balance and tax balance of fixed assets",
            valueCurrent: liability.current,
            valuePrevious: liability.previous,
          },
          {
            key: "note34-Deferred-liability",
            label: "Tax effect of items constituting deferred tax liability",
            valueCurrent: liability.current,
            valuePrevious: liability.previous,
            isEditableRow: true,
          },
          {
            key: "note34-Deferred-asset-main",
            label: "Tax effect of items constituting deferred tax assets",
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note34-Deferred-asset-provision",
            label:
              "Provision for compensated absences, gratuity and other employee benefits",
            valueCurrent: provision.current,
            valuePrevious: provision.previous,
            isEditableRow: true,
          },
          {
            key: "note34-Deferred-asset-difference",
            label:
              "On difference between book balance and tax balance of fixed assets",
            valueCurrent: difference.current,
            valuePrevious: difference.previous,
            isEditableRow: true,
          },
          {
            key: "note34-Deferred-asset-debt",
            label: "Provision for doubtful debts/advances",
            valueCurrent: debts.current,
            valuePrevious: debts.previous,
            isEditableRow: true,
          },
          {
            key: "note34-Deferred-asset-servicetax",
            label: "Provision for  service tax",
            valueCurrent: servicetax.current,
            valuePrevious: servicetax.previous,
            isEditableRow: true,
          },
          {
            key: "note34-Deferred-asset-loss",
            label: "Provision for estimated loss on contract",
            valueCurrent: loss.current,
            valuePrevious: loss.previous,
            isEditableRow: true,
          },
          {
            key: "note34-Deferred-asset-Others",
            label: "Others",
            valueCurrent: others.current,
            valuePrevious: others.previous,
            isEditableRow: true,
          },
          {
            key: "note34-Deferred-asset-total",
            label: "",
            valueCurrent:
              provision.current +
              difference.current +
              debts.current +
              servicetax.current +
              loss.current +
              others.current,
            valuePrevious:
              provision.previous +
              difference.previous +
              debts.previous +
              servicetax.previous +
              loss.previous +
              others.previous,
          },
          {
            key: "note34-blank",
            label: "",
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note34-total",
            label: "Net deferred tax (liability) / asset",
            valueCurrent:
              provision.current +
              difference.current +
              debts.current +
              servicetax.current +
              loss.current +
              others.current -
              liability.current,
            valuePrevious:
              provision.previous +
              difference.previous +
              debts.previous +
              servicetax.previous +
              loss.previous +
              others.previous -
              liability.previous,
          },
        ],
        totalCurrent: null,
        totalPrevious: null,
      };
    };
    const calculateNote35 = (periodHeaders: {
      currentPeriod: string;
      previousPeriod: string;
    }): FinancialNote => {
      // --- Hierarchical Item Calculations (YOUR ORIGINAL LOGIC - UNCHANGED) ---
      const note35_1 = getValueForKey(35, "note35-capital-table");
      const note35_2 = getValueForKey(35, "note35-capital-table1");
      const note35_3 = getValueForKey(35, "note35-financialrisk-BOY");
      const note35_4 = getValueForKey(35, "note35-financialrisk-creditloss");
      const note35_5 = getValueForKey(
        35,
        "note35-financialrisk-creditloss-reverse"
      );
      const note35_6 = getValueForKey(35, "note35-revenue");
      const note35_7 = getValueForKey(35, "note35-revenue-top");
      const note35_8 = getValueForKey(35, "note35-geo-india");
      const note35_9 = getValueForKey(35, "note35-geo-rest");

      const equity = {
        current: note35_1.valueCurrent ?? 0,
        previous: note35_1.valuePrevious ?? 0,
      };
      const per = {
        current: note35_2.valueCurrent ?? 0,
        previous: note35_2.valuePrevious ?? 0,
      };
      const BOY = {
        current: note35_3.valueCurrent ?? 0,
        previous: note35_3.valuePrevious ?? 0,
      };
      const creditloss = {
        current: note35_4.valueCurrent ?? 0,
        previous: note35_4.valuePrevious ?? 0,
      };
      const creditreverse = {
        current: note35_5.valueCurrent ?? 0,
        previous: note35_5.valuePrevious ?? 0,
      };
      const top5 = {
        current: note35_6.valueCurrent ?? 0,
        previous: note35_6.valuePrevious ?? 0,
      };
      const top = {
        current: note35_7.valueCurrent ?? 0,
        previous: note35_7.valuePrevious ?? 0,
      };
      const india = {
        current: note35_8.valueCurrent ?? 0,
        previous: note35_8.valuePrevious ?? 0,
      };
      const rest = {
        current: note35_9.valueCurrent ?? 0,
        previous: note35_9.valuePrevious ?? 0,
      };

      // --- Editable Table Logic ---
      const parseNum = (val: string | undefined): number => {
        if (!val) return 0;
        return parseFloat(String(val).replace(/,/g, "")) || 0;
      };

      const row = (label: string, columnCount: number): string[] => {
        const edited = getTableValue1(
          35,
          [
            "note35-table1",
            "note35-table2",
            "note35-table3",
            "note35-table5",
            "note35-table4",
            "note35-table6",
          ],
          label
        );
        if (edited) return edited;

        const emptyRow = Array(columnCount).fill("");
        emptyRow[0] = label;
        return emptyRow;
      };

      // --- TABLE 1: Categories of Financial Instruments ---
      const categoryHeaders = [
        "Particulars",
        `Carrying Value As at  ${periodHeaders.currentPeriod}`,
        `Carrying Value As at  ${periodHeaders.previousPeriod}`,
        `Fair Value As at  ${periodHeaders.currentPeriod}`,
        `Fair Value As at  ${periodHeaders.previousPeriod}`,
        //"Carrying Value As at 31 March 2024",
        //"Carrying Value As at 31 March 2023",
        //"Fair Value As at 31 March 2024",
        //"Fair Value As at 31 March 2023",
      ];
      const categoryColCount = categoryHeaders.length;

      const catTradeReceivables = row(
        "(a) Trade receivables",
        categoryColCount
      );
      const catCash = row("(b) Cash and cash equivalents", categoryColCount);
      const catBank = row(
        "(c) Bank balance other than cash and cash equivalent",
        categoryColCount
      );
      const catLoans = row("(d) Loans", categoryColCount);
      const catOtherAssets = row(
        "(e) Other financial assets",
        categoryColCount
      );

      const catAssetTotalRow = ["Total", "0.00", "0.00", "0.00", "0.00"];
      for (let i = 1; i < 5; i++) {
        const sum =
          parseNum(catTradeReceivables[i]) +
          parseNum(catCash[i]) +
          parseNum(catBank[i]) +
          parseNum(catLoans[i]) +
          parseNum(catOtherAssets[i]);
        catAssetTotalRow[i] = sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        });
      }

      const catTradePayables = row("(a) Trade payables", categoryColCount);
      const catLease = row("(b) Lease Liabilities", categoryColCount);
      const catOtherLiabilities = row(
        "(b) Other financial liabilities",
        categoryColCount
      );

      const catLiabilityTotalRow = ["Total", "0.00", "0.00", "0.00", "0.00"];
      for (let i = 1; i < 5; i++) {
        const sum =
          parseNum(catTradePayables[i]) +
          parseNum(catLease[i]) +
          parseNum(catOtherLiabilities[i]);
        catLiabilityTotalRow[i] = sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        });
      }

      // --- TABLE 2 & 3: Maturity Analysis ---
      const maturityHeaders24 = [
        `As at ${periodHeaders.currentPeriod}`,
        //"As at 31 March 2024",
        "Less than 1 Year",
        "1 Year to 5 Year",
        "More than 5 Years",
        "Total",
      ];
      const maturityHeaders23 = [
        `As at ${periodHeaders.previousPeriod}`,
        //"As at 31 March 2023",
        "Less than 1 Year",
        "1 Year to 5 Year",
        "More than 5 Years",
        "Total",
      ];
      const maturityColCount = maturityHeaders24.length;

      const maturityTrade24 = row("Trade payables 2024", maturityColCount);
      const maturityLease24 = row("Lease Liabilities 2024", maturityColCount);
      const maturityOther24 = row(
        "Other financial liabilities 2024",
        maturityColCount
      );
      const maturityTrade23 = row("Trade payables 2023", maturityColCount);
      const maturityLease23 = row("Lease Liabilities 2023", maturityColCount);
      const maturityOther23 = row(
        "Other financial liabilities 2023",
        maturityColCount
      );

      const calculateMaturityRowTotal = (r: string[]) => {
        const total = parseNum(r[1]) + parseNum(r[2]) + parseNum(r[3]);
        if (r.length > 4)
          r[4] = total.toLocaleString("en-IN", { minimumFractionDigits: 2 });
      };
      [
        maturityTrade24,
        maturityLease24,
        maturityOther24,
        maturityTrade23,
        maturityLease23,
        maturityOther23,
      ].forEach(calculateMaturityRowTotal);

      const maturityTotal24 = ["Total", "0.00", "0.00", "0.00", "0.00"];
      for (let i = 1; i <= 4; i++) {
        const sum =
          parseNum(maturityTrade24[i]) +
          parseNum(maturityLease24[i]) +
          parseNum(maturityOther24[i]);
        maturityTotal24[i] = sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        });
      }
      const maturityTotal23 = ["Total", "0.00", "0.00", "0.00", "0.00"];
      for (let i = 1; i <= 4; i++) {
        const sum =
          parseNum(maturityTrade23[i]) +
          parseNum(maturityLease23[i]) +
          parseNum(maturityOther23[i]);
        maturityTotal23[i] = sum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        });
      }

      // --- TABLE 4: Management Policy ---
      const policyHeaders = [
        "MANAGEMENT POLICY",
        "POTENTIAL IMPACT OF RISK",
        "SENSITIVITY TO RISK",
      ];
      const policyColCount = policyHeaders.length;
      const policyInterest = row(
        "(i) Interest rate risk The Company is not exposed to interest rate risk because it does not have any borrowings",
        policyColCount
      );
      const policyPrice = row(
        "(ii) Price risk Major raw materials purchase is from international market and less dependency on domestic market. The prices of the Companys raw materials generally fluctuate in line with commodity cycles.",
        policyColCount
      );
      const policyCurrency = row(
        "(iii) Currency risk The Company operates internationally and consequently the Company is exposed to foreign exchange risk through its sales and purchases from overseas suppliers in various foreign currencies. The exchange rate between the rupee and foreign currencies has changed substantially in recent years and may fluctuate substantially in the future. Consequently, the results of the Company’s operations are adversely affected as the rupee appreciates/ depreciates against these currencies.",
        policyColCount
      );

      // --- TABLE 5: Foreign Currency Exposure ---
      const exposureHeaders = [
        `As at ${periodHeaders.currentPeriod}\nAmount in foreign currency in Lakhs`,
        `As at ${periodHeaders.currentPeriod}\nAmount in ₹ Lakhs`,
        `As at ${periodHeaders.previousPeriod}\nAmount in foreign currency in Lakhs`,
        `As at ${periodHeaders.previousPeriod}\nAmount in ₹ Lakhs`,
        // "As at 31 March 2024\nAmount in foreign currency in Lakhs",
        //"As at 31 March 2024\nAmount in ₹ Lakhs",
        //"As at 31 March 2023\nAmount in foreign currency in Lakhs",
        //"As at 31 March 2023\nAmount in ₹ Lakhs",
      ];
      const exposureColCount = exposureHeaders.length + 1;
      const expReceivableUSD = row("Trade receivables-USD", exposureColCount);
      const expReceivableBDT = row("Trade receivables-BDT", exposureColCount);
      const expPayableUSD = row("Trade payables-USD", exposureColCount);
      const expPayableEURO = row("Trade payables-EURO", exposureColCount);
      const expPayableBDT = row("Trade payables-BDT", exposureColCount);
      const expPayableCAD = row("Trade payables-CAD", exposureColCount);
      const expPayableSGD = row("Trade payables-SGD", exposureColCount);
      const expPayableJPY = row("Trade payables-JPY", exposureColCount);
      const expPayableGBP = row("Trade payables-GBP", exposureColCount);
      const expPayablePHP = row("Trade payables-PHP", exposureColCount);

      // --- TABLE 6: Conversion Rates ---
      // const conversionHeaders = ['Conversion rates', 'Financial assets USD', 'Financial assets BDT', 'Financial assets SGD', 'Financial liabilities USD', 'Financial liabilities EUR', 'Financial liabilities BDT', 'Financial liabilities CAD', 'Financial liabilities AED', 'Financial liabilities SGD', 'Financial liabilities JPY', 'Financial liabilities GBP', 'Financial liabilities PHP'];
      // const conversionColCount = conversionHeaders.length;
      // const rates2024 = row('As at March 2024', conversionColCount);
      // const rates2023 = row('As at March 2023', conversionColCount);

      // --- TABLE 7: Sensitivity Analysis ---
      const sensitivityHeaders = [
        "Particulars",
        `Increase ${periodHeaders.currentPeriod}`,
        `Decrease ${periodHeaders.currentPeriod}`,
        `Increase ${periodHeaders.previousPeriod}`,
        `Decrease ${periodHeaders.previousPeriod}`,
        // "Increase 31 March 2024",
        // "Decrease 31 March 2024",
        // "Increase 31 March 2023",
        // "Decrease 31 March 2023",
      ];
      const sensitivityColCount = sensitivityHeaders.length;
      const sensInrUsd = row("INR/USD", sensitivityColCount);
      const sensInrEuro = row("INR/EURO", sensitivityColCount);
      const sensInrBdt = row("INR/BDT", sensitivityColCount);
      const sensInrSgd = row("INR/SGD", sensitivityColCount);
      const sensInrCad = row("INR/CAD", sensitivityColCount);
      const sensInrYen = row("INR/YEN", sensitivityColCount);
      const sensInrPhp = row("INR/PHP", sensitivityColCount);

      // --- Final Return Statement ---
      return {
        noteNumber: 35,
        title: "Financial instuments",
        totalCurrent: null,
        totalPrevious: null,
        content: [
          {
            key: "note35-capital",
            label: "A   Capital management",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
            children: [
              {
                key: "note35-capital-description",
                label:
                  "The Companys policy is to maintain a strong capital base...",
                valueCurrent: null,
                valuePrevious: null,
              },
              {
                key: "note35-capital-table",
                label:
                  "Total equity attributable to the equity shareholders of the company ",
                valueCurrent: equity.current,
                valuePrevious: equity.previous,
                isEditableRow: true,
              },
              {
                key: "note35-capital-table1",
                label: "As a percentage of total capital",
                valueCurrent: per.current,
                valuePrevious: per.previous,
                isEditableRow: true,
              },
              {
                key: "note35-capital-table2",
                label: "Borrowings",
                valueCurrent: 0,
                valuePrevious: 0,
              },
              {
                key: "note35-capital-table3",
                label: "As a percentage of total capital",
                valueCurrent: 0,
                valuePrevious: 0,
              },
              {
                key: "note35-capital-table-total",
                label: "Total",
                isGrandTotal: true,
                valueCurrent: equity.current,
                valuePrevious: equity.previous,
              },
            ],
          },
          {
            key: "note35-text-a",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-a",
              `The Company is equity financed which is evident from the capital structure table. Further, the Company has always been a net cash Company with cash and bank balances along with liquid investments.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-category",
            label: "B.    Categories of financial Instruments",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          `The fair value of financial instruments by categories as at 31 March 2023, 31 March 2022 is as below:`,
          {
            key: "note35-table1",
            type: "table",
            isEditable: true,
            headers: categoryHeaders,
            rows: [
              ["Financial assets"],
              ["Measured at amortised cost"],
              catTradeReceivables,
              catCash,
              catBank,
              catLoans,
              catOtherAssets,
              catAssetTotalRow,
              ["Financial liabilities"],
              ["Measured at amortised cost"],
              catTradePayables,
              catLease,
              catOtherLiabilities,
              catLiabilityTotalRow,
            ],
          },
          {
            key: "note35-financialrisk",
            label: "C.    Financial risk management",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          {
            key: "note35-text-b",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-b",
              `The Company's activities expose it to a variety of financial risks: market risk, credit risk and liquidity risk. The Company's focus is to foresee the unpredictability of financial markets and seek to minimize potential adverse effects on it's financial performance. The primary market risk to the Company is foreign exchange exposure risk. The Company's exposure to credit risk is influenced mainly by the individual characteristic of each customer.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-text-c",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-c",
              `The Company's financial risk management is supported by the finance department and enterprise risk management committee:
 - protect the Company's financial results and position from financial risks
 - maintain market risks within acceptable parameters, while optimising returns; and
 - protect the Company's financial investments, while maximising returns.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-text-d",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-d",
              `The Company does not actively engage in the trading of financial assets for speculative purposes nor does it write options. The most significant financial risks to which the Company is exposed are described below.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-financialrisk-credit",
            label: "           (i) Management of credit risk",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          {
            key: "note35-text-e",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-e",
              `Credit risk is the risk of financial loss to the Company arising from counter party failure to meet its contractual obligations. Credit risk encompasses of both, the direct risk of default and the risk of deterioration of creditworthiness as well as concentration of risks. Credit risk is controlled by analysing credit limits and creditworthiness of customers on a continuous basis to whom the credit has been granted after necessary approvals for credit.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-financialrisk-trade",
            label: "Trade and other receivables",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          {
            key: "note35-text-f",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-f",
              `The Company assess the customers credit quality by taking into account their financial position, past experience and other factors. The Company’s exposure to credit risk is influenced mainly by the individual characteristics of each customer. The demographics of the customer, including the default risk of the industry and country in which the customer operates, also has an influence on credit risk assessment.
      Trade receivables are typically unsecured and are derived from revenue earned from customers primarily located in India and Japan. Credit risk has always been managed by the Company through credit approvals, establishing credit limits and continuously monitoring the creditworthiness of customers to which the Company grants credit terms in the normal course of business. On account of adoption of Ind AS 109, Financial Instruments, the Company uses expected credit loss model to assess the impairment loss or gain. The provision for expected credit loss takes into account available external and internal credit risk factors and Company's historical experience for customers.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-financialrisk-BOY",
            label: "Balance at the beginning",
            valueCurrent:
              BOY.current + creditloss.previous + creditloss.previous,
            valuePrevious: BOY.previous,
            isEditableRow: true,
          },
          {
            key: "note35-financialrisk-creditloss",
            label: "Expected Credit Loss recognized",
            valueCurrent: creditloss.current,
            valuePrevious: creditloss.previous,
            isEditableRow: true,
          },
          {
            key: "note35-financialrisk-creditloss-reverse",
            label: "Expected Credit Loss reversed",
            valueCurrent: creditreverse.current,
            valuePrevious: creditloss.previous,
            isEditableRow: true,
          },
          {
            key: "note35-financialrisk-BEY",
            label: "Balance at the end",
            valueCurrent:
              BOY.current +
              creditloss.previous +
              creditloss.previous +
              creditloss.current +
              creditreverse.current,
            valuePrevious:
              BOY.previous + creditloss.previous + creditloss.previous,
          },
          {
            key: "note35-revenue",
            label: "Revenue from top 5 customers",
            valueCurrent: top5.current,
            valuePrevious: top5.previous,
            isEditableRow: true,
          },
          {
            key: "note35-revenue-top",
            label: "Revenue from top customer",
            valueCurrent: top.current,
            valuePrevious: top.previous,
            isEditableRow: true,
          },
          {
            key: "note35-geo",
            label: "Geographical concentration of credit risk",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          `The Company has geographical concentration of trade receivables, net of advances as given below:`,
          {
            key: "note35-geo-india",
            label: "India",
            valueCurrent: india.current,
            valuePrevious: india.previous,
            isEditableRow: true,
          },
          {
            key: "note35-geo-rest",
            label: "Rest of the world",
            valueCurrent: rest.current,
            valuePrevious: rest.previous,
            isEditableRow: true,
          },
          `Geographical concentration of the credit risk is allocated based on the location of the customers.`,
          {
            key: "note35-financialrisk-liquidity",
            label: "           (ii) Management of liquidity risk",
            isSubtotal: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-text-g",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-g",
              `Liquidity risk is the risk that the Company will not be able to meet its financial obligations as they become due. The Company’s approach to managing liquidity is to ensure that it will have sufficient funds to meet its liabilities when due without incurring unacceptable losses. In doing this, management considers both normal and stressed conditions. A material and sustained shortfall in the cash flow could undermine the Company’s credit rating and impair investor confidence. The Company’s treasury department is responsible for liquidity, funding as well as settlement management. In addition, processes and policies related to such risks are overseen by senior management.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          `The following table shows the maturity analysis of the Company's financial liabilities based on contractually agreed undiscounted cash flows:`,
          {
            key: "note35-table2",
            type: "table",
            isEditable: true,
            headers: maturityHeaders24,
            rows: [
              maturityTrade24,
              maturityLease24,
              maturityOther24,
              maturityTotal24,
            ],
          },
          {
            key: "note35-table3",
            type: "table",
            isEditable: true,
            headers: maturityHeaders23,
            rows: [
              maturityTrade23,
              maturityLease23,
              maturityOther23,
              maturityTotal23,
            ],
          },
          {
            key: "note35-market-risk-contd",
            label: "C Financial risk management (contd)",
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-market-risk-main",
            label: "          (iii) Management of market risk",
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-text-h",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-h",
              `The Company's size and operations result in it being exposed to the following market risks that arise from its use of financial instruments:
              • interest rate risk
              • price risk
              • currency risk
           The above risks may affect the Company's income and expenses, or the value of its financial instruments. The objective of the Company’s management of market risk is to maintain this risk within acceptable parameters, while optimising returns. The Company’s exposure to, and management of, these risks is explained below:`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-table4",
            type: "table",
            isEditable: true,
            isTextTable: true,
            headers: policyHeaders,
            rows: [policyInterest, policyPrice, policyCurrency],
          },

          "The following table sets forth information relating to foreign currency exposures as at 31 March 2024 and 31 March 2023 :",
          {
            key: "note35-table5",
            type: "table",
            isEditable: true,
            headers: ["Particulars Included In", ...exposureHeaders],
            rows: [
              expReceivableUSD,
              expReceivableBDT,
              ["Financial liabilities"],
              expPayableUSD,
              expPayableEURO,
              expPayableBDT,
              expPayableCAD,
              expPayableSGD,
              expPayableJPY,
              expPayableGBP,
              expPayablePHP,
            ],
          },

          "Sensitivity",
          {
            key: "note35-text-i",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-i",
              `The following table details the Company’s sensitivity to a 1% increase and decrease in the ₹ against the relevant foreign currencies. 1% is the sensitivity rate used when reporting foreign currency risk internally to key management personnel and represents management’s assessment of the reasonably possible change in foreign exchange rates. The sensitivity analysis includes only outstanding foreign currency denominated monetary items and adjusts their translation at the year-end for a 1% change in foreign currency rates, with all other variables held constant. A positive number below indicates an increase in profit or equity where ₹ strengthens 1% against the relevant currency. For a 1% weakening of ₹ against the relevant currency, there would be a comparable impact on profit or equity, and the balances below would be negative.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-table6",
            type: "table",
            isEditable: true,
            headers: sensitivityHeaders,
            rows: [
              ["Sensitivity"],
              sensInrUsd,
              sensInrEuro,
              sensInrBdt,
              sensInrSgd,
              sensInrCad,
              sensInrYen,
              sensInrPhp,
            ],
          },
          {
            key: "note35-D",
            label: "Fair Value Measurement",
            valueCurrent: null,
            valuePrevious: null,
            isSubtotal: true,
          },
          {
            key: "note35-text-j",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-j",
              `Fair value is the price that would be received to sell an asset or paid to transfer a liability in an orderly transaction between Market participants at the measurement date, regardless of whether that price is directly observable or estimated using another valuation technique. In estimating the fair value of an asset or a liability, the Company takes into account the characteristics of the asset or liability if Market participants would take those characteristics into account when pricing the asset or liability, at the measurement date. Fair value for measurement and/or disclosure purposes in these financial statements is determined on such a basis, except for leasing transactions that are within the scope of Ind AS 116, and measurements that have some similarities to fair value but are not fair value, such as net realisable value in Ind AS 2 or value in use in Ind AS 36.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-text-k",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-k",
              `In addition, for financial reporting purposes, fair value measurements are categorised into Level 1, 2, or 3 based on the degree to which the inputs to the fair value measurements are observable and the significance of the inputs to the fair value measurement in its entirety, which are described as follows:`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-text-l",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-l",
              `- Level 1 inputs are quoted prices (unadjusted) in active Markets for identical assets or liabilities that the entity can access at the measurement date;`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-text-m",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-m",
              `- Level 2 inputs are inputs, other than quoted prices included within Level 1, that are observable for the asset or liability, either directly or indirectly; and`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-text-n",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-n",
              `- Level 3 inputs are unobservable inputs for the asset or liability.`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
          {
            key: "note35-text-o",
            label: "",
            narrativeText: getNarrativeTextByKey(
              "note35-text-o",
              `The fair value hierachy of Financial Instruments of the company are measured under Level 3 .`
            ),
            isNarrative: true,
            isEditableText: true,
            valueCurrent: null,
            valuePrevious: null,
          },
        ],
      };
    };
    const note3 = calculateNote3(periodHeaders);
    const note4 = calculateNote4(periodHeaders);
    const note5 = calculateNote5();
    const note6 = calculateNote6();
    const note7 = calculateNote7();
    const note8 = calculateNote8();
    const note9 = calculateNote9(periodHeaders);
    const note10 = calculateNote10();
    const note11 = calculateNote11();
    const note12 = calculateNote12(periodHeaders);
    const note13 = calculateNote13();
    const note14 = calculateNote14(periodHeaders);
    const note15 = calculateNote15();
    const note16 = calculateNote16();
    const note17 = calculateNote17();
    const note18 = calculateNote18();
    const note19 = calculateNote19();
    const note20 = calculateNote20();
    const note21 = calculateNote21();
    const note22 = calculateNote22();
    const note23 = calculateNote23();
    const note24 = calculateNote24();
    const note25 = calculateNote25();
    const note26 = calculateNote26();
    const note27 = calculateNote27(periodHeaders);
    const note28 = calculateNote28(periodHeaders);
    const note29 = calculateNote29();
    const note30 = calculateNote30(periodHeaders);
    const note32 = calculateNote32();
    const note33 = calculateNote33();
    const note34 = calculateNote34();
    const note35 = calculateNote35(periodHeaders);
    const allNotes = [
      note3,
      note4,
      note5,
      note6,
      note7,
      note8,
      note9,
      note10,
      note11,
      note12,
      note13,
      note14,
      note15,
      note16,
      note17,
      note18,
      note19,
      note20,
      note21,
      note22,
      note23,
      note24,
      note25,
      note26,
      note27,
      note28,
      note29,
      note30,
      note32,
      note33,
      note34,
      note35,
    ]; // [FIX] Add all calculated notes
    // Helper to check if a note's content is editable
    function isNoteContentEditable(content: any): boolean {
      // Early exit if content is not a processable array.
      if (!Array.isArray(content)) {
        return false;
      }

      // Inner recursive function to traverse the structure.
      const checkItems = (items: any[]): boolean => {
        // Use .some() to stop as soon as we find the first editable item.
        return items.some(item => {
          // Ignore non-objects.
          if (typeof item !== 'object' || item === null) {
            return false;
          }

          // 1. Check the current item for any editable property.
          if (
            item.isEditable === true ||
            item.isEditableRow === true ||
            item.isEditableText === true ||
            (item.type === 'table' && item.isEditable === true)
          ) {
            return true; // Found an editable flag, stop searching this branch.
          }

          // 2. If it has children, recursively check them.
          if (item.children && Array.isArray(item.children)) {
            // If any child (or grandchild, etc.) is editable, this path is true.
            return checkItems(item.children);
          }

          // 3. This item and its descendants are not editable.
          return false;
        });
      };

      // Start the recursive check on the top-level content array.
      return checkItems(content);
    }

    const editableNoteNumbers = new Set<number | string>();
    allNotes.forEach(note => {
      if (isNoteContentEditable(note.content)) {
        editableNoteNumbers.add(note.noteNumber);
      }
    });
    
    console.log("Editable Note Numbers:", Array.from(editableNoteNumbers));

    const processNode = (
      node: TemplateItem,
      enrichedData: MappedRow[],
      getAmount: (
        year: "amountCurrent" | "amountPrevious",
        level1Keywords?: string[],
        level2Keywords?: string[]
      ) => number
    ): HierarchicalItem => {
      const children = node.children?.map((child) =>
        processNode(child, enrichedData, getAmount)
      );
      let valueCurrent: number | null = 0;
      let valuePrevious: number | null = 0;

      function findNestedItem(
        item: HierarchicalItem,
        path: string[]
      ): HierarchicalItem | undefined {
        let current: HierarchicalItem | undefined = item;
        for (const key of path) {
          current = current?.children?.find((child) => child.key === key);
          if (!current) break;
        }
        return current;
      }
      // [FIX] Map the totals from the calculated notes back to the main statements
      if (node.key === "bs-assets-c-inv") {
        valueCurrent = note8.totalCurrent;
        valuePrevious = note8.totalPrevious;
      } else if (node.key === "bs-assets-c-other") {
        const banks = note10.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note10-total"
        );
        if (banks) {
          valueCurrent = banks.valueCurrent;
          valuePrevious = banks.valuePrevious;
        }
      } else if (node.key === "bs-assets-nc-other") {
        const yr = note10.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note10-noncurrent"
        );
        const child = yr?.children?.find(
          (child) => child.key === "Non-current-total"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-assets-c-fin-cce") {
        const yr = note11.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note10-bwb-group"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note11-total"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-assets-c-fin-bank") {
        const yr = note11.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note10-bwb-group-other"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note10-bwb-group-other-total"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-assets-nc-fin-loan") {
        const yr = note5.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note5-noncurrent"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note5-nc-emp"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-assets-c-fin-loans") {
        const yr = note5.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note5-current"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note5-c-emp"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-assets-nc-fin-other") {
        const yr = note6.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note6-noncurrent"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note6-nc-total"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-assets-c-fin-other") {
        const yr = note6.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note6-current"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note6-c-total"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-liab-c-fin-enterprises") {
        const msmes = note14.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note14-msme-group"
        );
        if (msmes) {
          valueCurrent = msmes.valueCurrent ?? 0;
          valuePrevious = msmes.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-liab-c-fin-creators") {
        const nonmsmes = note14.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note14-nonmsme-group"
        );
        if (nonmsmes) {
          valueCurrent = nonmsmes.valueCurrent ?? 0;
          valuePrevious = nonmsmes.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-liab-c-fin-enterprises-other") {
        const othercr = note15.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note15-footer-other"
        );
        if (othercr) {
          valueCurrent = othercr.valueCurrent ?? 0;
          valuePrevious = othercr.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-liab-c-other") {
        const lib = note16.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note16-total"
        );
        if (lib) {
          valueCurrent = lib.valueCurrent ?? 0;
          valuePrevious = lib.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-liab-nc-prov") {
        const borrow = note17.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note17-noncurrent"
        );
        const subchild = borrow
          ? findNestedItem(borrow, ["note17-gratuity", "note17-gratuity-net"])
          : undefined;
        if (subchild) {
          valueCurrent = subchild.valueCurrent ?? 0;
          valuePrevious = subchild.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-liab-c-prov") {
        const lib = note17.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note17-total"
        );
        if (lib) {
          valueCurrent = lib.valueCurrent ?? 0;
          valuePrevious = lib.valuePrevious ?? 0;
        }
      } else if (node.key === "is-rev-ops") {
        const yr = note18.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note18-disaggregate"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note18-other-rev-total-final"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "is-other-inc") {
        const yr = note19.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note19-summary"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note19-summary-total"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "is-exp-mat") {
        const yr = note20.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note20-cogs"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note20-cogs-total-final"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "is-exp-pur") {
        const yr = note20.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note20-purchase-traded-goods"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note20-purchase-traded-goods-total"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "is-exp-inv") {
        const yr = note20.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note20-changes-in-inventories"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note20-changes-in-inventories-total"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "is-exp-emp") {
        const inc = note21.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note21-total"
        );
        if (inc) {
          valueCurrent = inc.valueCurrent ?? 0;
          valuePrevious = inc.valuePrevious ?? 0;
        }
      } else if (node.key === "is-exp-fin") {
        const inc = note22.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note22-total"
        );
        if (inc) {
          valueCurrent = inc.valueCurrent ?? 0;
          valuePrevious = inc.valuePrevious ?? 0;
        }
      } else if (node.key === "is-exp-dep") {
        const inc = note23.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note23-total"
        );
        if (inc) {
          valueCurrent = inc.valueCurrent ?? 0;
          valuePrevious = inc.valuePrevious ?? 0;
        }
      } else if (node.key === "is-exp-oth") {
        const inc = note24.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note24-total"
        );
        if (inc) {
          valueCurrent = inc.valueCurrent ?? 0;
          valuePrevious = inc.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-assets-nc-fin-income") {
        const borrow = note7.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note7-asset-section"
        );
        const subchild = borrow
          ? findNestedItem(borrow, ["note7-main", "note7-under-protest-total"])
          : undefined;
        if (subchild) {
          valueCurrent = subchild.valueCurrent ?? 0;
          valuePrevious = subchild.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-liab-c-tax") {
        const yr = note7.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note7-liability-section"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note7a-main"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-eq-other") {
        const incLbt = note13.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note13-total"
        );
        if (incLbt) {
          valueCurrent = incLbt.valueCurrent ?? 0;
          valuePrevious = incLbt.valuePrevious ?? 0;
        }
      } else if (node.key === "is-eps-value") {
        const ear = note32.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note32-eps"
        );
        if (ear) {
          valueCurrent = ear.valueCurrent ?? 0;
          valuePrevious = ear.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-assets-c-fin-tr") {
        const rec = note9.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note9-total"
        );
        if (rec) {
          valueCurrent = rec.valueCurrent ?? 0;
          valuePrevious = rec.valuePrevious ?? 0;
        }
      } else if (node.key === "is-oci-remesure") {
        const yr = note28.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note28-benefit"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note28-benefit-total"
        );
        if (child) {
          valueCurrent = -(child.valueCurrent ?? 0);
          valuePrevious = -(child.valuePrevious ?? 0);
        }
      } else if (node.key === "bs-liab-nc-fin-borrow") {
        const borrow = note29.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note29-balance"
        );

        const subchild = borrow
          ? findNestedItem(borrow, [
              "note29-balance-long",
              "note29-balance-long-term",
            ])
          : undefined;

        if (subchild) {
          valueCurrent = subchild.valueCurrent ?? 0;
          valuePrevious = subchild.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-liab-c-fin-liability") {
        const yr = note29.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note29-maturities"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note29-pl-1"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "is-tax-curr") {
        const currenttax = note34.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note34-pl-current-tax"
        );
        if (currenttax) {
          valueCurrent = currenttax.valueCurrent ?? 0;
          valuePrevious = currenttax.valuePrevious ?? 0;
        }
      } else if (node.key === "is-tax-def") {
        const deffered = note34.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note34-oci"
        );
        if (deffered) {
          valueCurrent = deffered.valueCurrent ?? 0;
          valuePrevious = deffered.valuePrevious ?? 0;
        }
      } else if (node.key === "is-oci-tax") {
        const benefit = note34.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note34-benefit"
        );
        if (benefit) {
          valueCurrent = benefit.valueCurrent ?? 0;
          valuePrevious = benefit.valuePrevious ?? 0;
        }
      } else if (node.key === "bs-assets-nc-ppe") {
        const table = note3.content.find(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            (item as any).key === "note3-table1"
        ) as TableContent | undefined;
        if (table) {
          const ppeRow = table.rows.find(
            (row) => row[0] === `As at ${periodHeaders.currentPeriod}`
          );
          if (ppeRow) {
            valueCurrent =
              parseFloat(ppeRow[ppeRow.length - 1].replace(/,/g, "")) || 0;
          }
          const prevRow = table.rows.find(
            (row) => row[0] === `As at ${periodHeaders.previousPeriod}`
          );
          if (prevRow) {
            valuePrevious =
              parseFloat(prevRow[prevRow.length - 1].replace(/,/g, "")) || 0;
          }
        }
      } else if (node.key === "bs-assets-nc-cwip") {
        const cwipTable = note3.content.find(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            (item as any).key === "note3-table2"
        ) as TableContent | undefined;
        if (cwipTable) {
          const currentRow = cwipTable.rows.find(
            (row) => row[0] === `Total as on ${periodHeaders.currentPeriod}`
          );
          if (currentRow) {
            valueCurrent =
              parseFloat(currentRow[currentRow.length - 1].replace(/,/g, "")) ||
              0;
          }
          const previousRow = cwipTable.rows.find(
            (row) => row[0] === `Total as on ${periodHeaders.previousPeriod}`
          );
          if (previousRow) {
            valuePrevious =
              parseFloat(
                previousRow[previousRow.length - 1].replace(/,/g, "")
              ) || 0;
          }
        }
      } else if (node.key === "bs-assets-nc-rou") {
        const table = note4.content.find(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            (item as any).key === "note4-table1"
        ) as TableContent | undefined;
        if (table) {
          const rouRow = table.rows.find(
            (row) => row[0] === `As at ${periodHeaders.currentPeriod}`
          );
          if (rouRow) {
            valueCurrent =
              parseFloat(rouRow[rouRow.length - 1].replace(/,/g, "")) || 0;
          }
          const prevRow = table.rows.find(
            (row) => row[0] === `As at ${periodHeaders.previousPeriod}`
          );
          if (prevRow) {
            valuePrevious =
              parseFloat(prevRow[prevRow.length - 1].replace(/,/g, "")) || 0;
          }
        }
      } else if (node.key === "bs-assets-nc-intangible") {
        const intangibleTable = note4.content.find(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            (item as any).key === "note4-table2"
        ) as TableContent | undefined;
        if (intangibleTable) {
          const currentRow = intangibleTable.rows.find(
            (row) => row[0] === `As at ${periodHeaders.currentPeriod}`
          );
          if (currentRow && currentRow[1]) {
            valueCurrent =
              parseFloat(String(currentRow[1]).replace(/,/g, "")) || 0;
          }
          const previousRow = intangibleTable.rows.find(
            (row) => row[0] === `As at ${periodHeaders.previousPeriod}`
          );
          if (previousRow && previousRow[1]) {
            valuePrevious =
              parseFloat(String(previousRow[1]).replace(/,/g, "")) || 0;
          }
        }
      } else if (node.key === "bs-assets-nc-otherintangible") {
        const devTable = note4.content.find(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            (item as any).key === "note4-table3"
        ) as TableContent | undefined;
        if (devTable) {
          const currentRow = devTable.rows.find(
            (row) => row[0] === `Total as on ${periodHeaders.currentPeriod}`
          );
          if (currentRow) {
            valueCurrent =
              parseFloat(currentRow[currentRow.length - 1].replace(/,/g, "")) ||
              0;
          }
          const previousRow = devTable.rows.find(
            (row) => row[0] === `Total as on ${periodHeaders.previousPeriod}`
          );
          if (previousRow) {
            valuePrevious =
              parseFloat(
                previousRow[previousRow.length - 1].replace(/,/g, "")
              ) || 0;
          }
        }
      } else if (node.key === "bs-assets-nc-rou") {
        const table = note4.content.find(
          (item): item is TableContent =>
            (item as TableContent).type === "table"
        );
        if (table) {
          const ppeRow = table.rows.find(
            (row) => row[0] === "As at 31 March 2024"
          );
          if (ppeRow) {
            valueCurrent =
              parseFloat(ppeRow[ppeRow.length - 1].replace(/,/g, "")) || 0;
          }
          const prevRow = table.rows.find(
            (row) => row[0] === "As at 31 March 2023"
          );
          if (prevRow) {
            valuePrevious =
              parseFloat(prevRow[prevRow.length - 1].replace(/,/g, "")) || 0;
          }
        }
      } else if (node.key === "bs-assets-nc-intangible") {
        const tables = note4.content.filter(
          (item): item is TableContent =>
            (item as TableContent).type === "table"
        );
        // Assuming the second table in content is the CWIP table
        const cwipTable = tables[1]; // index 1 for second table
        if (cwipTable) {
          const currentRow = cwipTable.rows.find(
            (row) => row[0] === "As at 31 March 2024"
          );
          if (currentRow) {
            valueCurrent =
              parseFloat(currentRow[currentRow.length - 1].replace(/,/g, "")) ||
              0;
          }
          const previousRow = cwipTable.rows.find(
            (row) => row[0] === "As at 31 March 2023"
          );
          if (previousRow) {
            valuePrevious =
              parseFloat(
                previousRow[previousRow.length - 1].replace(/,/g, "")
              ) || 0;
          }
        }
      } else if (node.key === "bs-assets-nc-otherintangible") {
        const tables = note4.content.filter(
          (item): item is TableContent =>
            (item as TableContent).type === "table"
        );
        // Assuming the second table in content is the CWIP table
        const cwipTable = tables[2]; // index 1 for second table
        if (cwipTable) {
          const currentRow = cwipTable.rows.find(
            (row) => row[0] === "Total as on 31 March 2024"
          );
          if (currentRow) {
            valueCurrent =
              parseFloat(currentRow[currentRow.length - 1].replace(/,/g, "")) ||
              0;
          }
          const previousRow = cwipTable.rows.find(
            (row) => row[0] === "Total as on 31 March 2023"
          );
          if (previousRow) {
            valuePrevious =
              parseFloat(
                previousRow[previousRow.length - 1].replace(/,/g, "")
              ) || 0;
          }
        }
      } else if (node.key === "bs-eq-captial") {
        // const tables = note12.content.filter(
        //   (item): item is TableContent =>
        //     (item as TableContent).type === "table"
        // );
        // const cwipTable = tables[0]; // index 1 for second table
        // if (cwipTable) {
        //   const currentRow = cwipTable.rows.find((row) => row[0] === "");
        //   if (currentRow) {
        //     valueCurrent =
        //       Math.abs(
        //         parseFloat(currentRow[currentRow.length - 1].replace(/,/g, ""))
        //       ) || 0;
        //   }
        //   const previousRow = cwipTable.rows.find((row) => row[0] === "");
        //   if (previousRow) {
        //     valuePrevious =
        //       Math.abs(
        //         parseFloat(
        //           previousRow[previousRow.length - 1].replace(/,/g, "")
        //         )
        //       ) || 0;
        //   }
        // }
        const currentAmount =
          -1 *
          getAmount("amountCurrent", node.keywords, ["equity share capital"]);
        const previousAmount =
          -1 *
          getAmount("amountPrevious", node.keywords, ["equity share capital"]);
        valueCurrent = currentAmount;
        valuePrevious = previousAmount;
      } else if (node.key === "is-except") {
        valueCurrent = 12166.54;
      }

      // #cashflow

      // else if (node.key === 'cf-op-pro') {
      //         valueCurrent = null;
      //         valuePrevious = null;
      //       }
      else if (node.key === "cf-op-pro") {
        // This specifically pulls the "Profit for the Year" value
        // from the already-calculated Income Statement totals.
        const patTotals = totals.get("pat"); // "pat" is the ID from INCOME_STATEMENT_STRUCTURE
        if (patTotals) {
          valueCurrent = patTotals.current;
          valuePrevious = patTotals.previous;
        }
      }
      // else if (node.key === "cf-op-pro") {
      //   const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
      //     getCashFlowValueByIdOrKey("cf-op-pro", editedCashFlow);
      //   valueCurrent = editedCurrent;
      //   valuePrevious = editedPrevious;
      // }
      else if (node.key === "cf-op-sub-tax") {
        const benefit = note34.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note34-oci-dbt"
        );
        if (benefit) {
          valueCurrent = benefit.valueCurrent ?? 0;
          valuePrevious = benefit.valuePrevious ?? 0;
        }
      } else if (node.key === "cf-op-sub-dep") {
        const benefit = note23.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note23-total"
        );
        if (benefit) {
          valueCurrent = benefit.valueCurrent ?? 0;
          valuePrevious = benefit.valuePrevious ?? 0;
        }
      } else if (node.key === "cf-op-sub-prov") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-sub-prov", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-sub-interest") {
        const yr = note19.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note19-interest-breakup"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note19-interest-breakup-total"
        );
        if (child) {
          valueCurrent = -(child.valueCurrent ?? 0);
          valuePrevious = -(child.valuePrevious ?? 0);
        }
      } else if (node.key === "cf-op-sub-interest-2") {
        const yr = note22.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note22-interest"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note22-lease-liability"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "cf-op-sub-prov-2") {
        const benefit = note24.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note24-doubtfulTrade"
        );
        if (benefit) {
          valueCurrent = benefit.valueCurrent ?? 0;
          valuePrevious = benefit.valuePrevious ?? 0;
        }
      } else if (node.key === "cf-op-sub-loss") {
        const benefit = note24.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note24-lossonFD"
        );
        if (benefit) {
          valueCurrent = benefit.valueCurrent ?? 0;
          valuePrevious = benefit.valuePrevious ?? 0;
        }
      } else if (node.key === "cf-op-sub-prov-3") {
        const benefit = note24.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note24-estimateLoss"
        );
        if (benefit) {
          valueCurrent = benefit.valueCurrent ?? 0;
          valuePrevious = benefit.valuePrevious ?? 0;
        }
      } else if (node.key === "cf-op-sub-prov-4") {
        const benefit = note24.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note24-expLoss"
        );
        if (benefit) {
          valueCurrent = benefit.valueCurrent ?? 0;
          valuePrevious = benefit.valuePrevious ?? 0;
        }
      } else if (node.key === "cf-op-sub-loss-1") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-sub-loss-1", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov") {
        valueCurrent = null;
        valuePrevious = null;
      } else if (node.key === "cf-op-sub") {
        valueCurrent = null;
        valuePrevious = null;
      }
      // else if (node.key==='cf-op-mov-inv'){
      //   valueCurrent=null;
      //   valuePrevious=null;
      // }
      else if (node.key === "cf-op-mov-inv") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-inv", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-rec") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-rec", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-short") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-short", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-nonfinancial") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-nonfinancial", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-nonasset") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-nonasset", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-long") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-long", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-financial") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-financial", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-current") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-current", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-pay") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-pay", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-currentlib") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-currentlib", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-otherlib") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-otherlib", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-long-prov") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-long-prov", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-mov-short-prov") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-mov-short-prov", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-op-direct-tax") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-direct-tax", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-inv") {
        valueCurrent = null;
        valuePrevious = null;
        if (node.formula) {
          const result = evaluateFormula(node.formula, totals);
          valueCurrent = result.current;
          valuePrevious = result.previous;
        }
      } else if (node.key === "cf-inv-capex") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-inv-capex", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      }

      // else if (node.key==='cf-inv-capex'){
      //   valueCurrent=null;
      //   valuePrevious=null;
      // }
      else if (node.key === "cf-inv-capex-ppe") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-inv-capex-ppe", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-inv-capex-cce") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-inv-capex-cce", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-inv-capex-interest") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-inv-capex-interest", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-fin") {
        valueCurrent = null;
        valuePrevious = null;
        if (node.formula) {
          const result = evaluateFormula(node.formula, totals);
          valueCurrent = result.current;
          valuePrevious = result.previous;
        }
      } else if (node.key === "cf-fin-lib") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-fin-lib", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-fin-dividend") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-fin-dividend", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-foreign") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-foreign", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-net-total-prev") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-net-total-prev", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-cce-prev") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-cce-prev", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;

        if (!valueCurrent && !valuePrevious && node.formula) {
          const result = evaluateFormula(node.formula, totals);
          valueCurrent = result.current;
          valuePrevious = result.previous;
        }
      } else if (node.key === "cf-cce") {
        valueCurrent = null;
        valuePrevious = null;
        if (node.formula) {
          const result = evaluateFormula(node.formula, totals);
          valueCurrent = result.current;
          valuePrevious = result.previous;
        }
      } else if (node.key === "cf-cce-cih") {
        const benefit = note11.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note10-coh"
        );
        if (benefit) {
          valueCurrent = benefit.valueCurrent ?? 0;
          valuePrevious = benefit.valuePrevious ?? 0;
        }
      } else if (node.key === "cf-cce-bank") {
        valueCurrent = null;
        valuePrevious = null;
      } else if (node.key === "cf-cce-current") {
        const yr = note11.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note10-bwb-group"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note10-bwb-ca"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "cf-cce-eefc") {
        const yr = note11.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note10-bwb-group"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note10-bwb-eefc"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      } else if (node.key === "cf-cce-fixed") {
        const yr = note11.content.find(
          (item): item is HierarchicalItem =>
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            item.key === "note10-bwb-group"
        );
        const child = yr?.children?.find(
          (child) => child.key === "note10-bwb-dep"
        );
        if (child) {
          valueCurrent = child.valueCurrent ?? 0;
          valuePrevious = child.valuePrevious ?? 0;
        }
      }
      // else if (node.key==='cf-op-profit'){
      //   valueCurrent=null;
      //   valuePrevious=null;
      // }
      else if (node.key === "cf-op-profit") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-profit", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;

        if (!valueCurrent && !valuePrevious && node.formula) {
          const result = evaluateFormula(node.formula, totals);
          valueCurrent = result.current;
          valuePrevious = result.previous;
        }
      } else if (node.key === "cf-op") {
        valueCurrent = null;
        valuePrevious = null;
        if (node.formula) {
          const result = evaluateFormula(node.formula, totals);
          valueCurrent = result.current;
          valuePrevious = result.previous;
        }
      } else if (node.key === "cf-op-cgo") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-cgo", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
        if (!valueCurrent && !valuePrevious && node.formula) {
          const result = evaluateFormula(node.formula, totals);
          valueCurrent = result.current;
          valuePrevious = result.previous;
        }
      } else if (node.key === "cf-op-cgo-total") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-op-cgo-total", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
      } else if (node.key === "cf-net-total") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-net-total", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
        if (!valueCurrent && !valuePrevious && node.formula) {
          const result = evaluateFormula(node.formula, totals);
          valueCurrent = result.current;
          valuePrevious = result.previous;
        }
      } else if (node.key === "cf-cce-total") {
        const { valueCurrent: editedCurrent, valuePrevious: editedPrevious } =
          getCashFlowValueByIdOrKey("cf-cce-total", editedCashFlow);
        valueCurrent = editedCurrent;
        valuePrevious = editedPrevious;
        if (!valueCurrent && !valuePrevious && node.formula) {
          const result = evaluateFormula(node.formula, totals);
          valueCurrent = result.current;
          valuePrevious = result.previous;
        }
      } else if (node.keywords) {
        valueCurrent = getAmount("amountCurrent", node.keywords);
        valuePrevious = getAmount("amountPrevious", node.keywords);
      } else if (children?.length) {
        valueCurrent = children.reduce(
          (sum, c) => sum + (c.valueCurrent ?? 0),
          0
        );
        valuePrevious = children.reduce(
          (sum, c) => sum + (c.valuePrevious ?? 0),
          0
        );
      } else if (node.formula) {
        const result = evaluateFormula(node.formula, totals);
        valueCurrent = result.current;
        valuePrevious = result.previous;
      }
      const noteIdentifier = node.noteLink || node.note;
      const isEditableNote = noteIdentifier ? editableNoteNumbers.has(noteIdentifier) : false;
      if (node.id) {
        totals.set(node.id, {
          current: valueCurrent ?? 0,
          previous: valuePrevious ?? 0,
        });
      }
      const isEdited = noteIdentifier ? editedNoteKeys.has(String(noteIdentifier)) : false;
      return {
         ...node, 
         valueCurrent, 
         valuePrevious, 
         children,
         isEditableNote,
         isEdited 
         };
    };

    const balanceSheet = BALANCE_SHEET_STRUCTURE.map((node) => processNode(node, enrichedData, getAmount));
    const incomeStatement = INCOME_STATEMENT_STRUCTURE.map((node) => processNode(node, enrichedData, getAmount));
    const cashFlow = CASH_FLOW_STRUCTURE.map((node) => processNode(node, enrichedData, getAmount));
    
    // 1. Derive PAT and Comprehensive Income from the calculated incomeStatement
    const incomeStatementPAT = incomeStatement.find(item => item.id === "pat");
    const rawPatCurrent = incomeStatementPAT?.valueCurrent ?? 0;
    const rawPatPrevious = incomeStatementPAT?.valuePrevious ?? 0;
    const patCurrent = Math.round(rawPatCurrent * 100) / 100;
    const patPrevious = Math.round(rawPatPrevious * 100) / 100;
    
    const comprehensiveIncomeItem = incomeStatement.find(item => item.id === "comp-income");
    const rawCompIncomeCurrent = comprehensiveIncomeItem?.valueCurrent ?? 0;
    const rawCompIncomePrevious = comprehensiveIncomeItem?.valuePrevious ?? 0;
    const compIncomeCurrent = Math.round(rawCompIncomeCurrent * 100) / 100;
    const compIncomePrevious = Math.round(rawCompIncomePrevious * 100) / 100;

    // 2. Calculate the updated other equity rows (logic copied from FinancialStatement.tsx)
    const updatedOtherEquityRows = baseOtherEquityRows.map(row => {
      const parseValue = (val: any): number => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
      };
      
      let newValues = { ...row.values };

      if (row.id === "pat") newValues.retEarn = patPrevious;
      if (row.id === "pat2") newValues.retEarn = patCurrent;
      if (row.id === "comp-income") newValues.oci = compIncomePrevious;
      if (row.id === "comp-income2") newValues.oci = compIncomeCurrent;

      const genRes = parseValue(newValues.genRes);
      const retEarn = parseValue(newValues.retEarn);
      const oci = parseValue(newValues.oci);
      const total = genRes + retEarn + oci;

      return {
        ...row,
        values: {
          ...newValues,
          total: parseFloat(total.toFixed(2))
        },
      };
    });

    const getT = (id: string) => totals.get(id) || { current: 0, previous: 0 };
    const safeDiv = (n: number, d: number) => (d !== 0 ? n / d : 0);

    const is = incomeStatement;
    const bs = balanceSheet;

    const rev = findValueByKey(is, 'is-rev-ops');
    const pbt = findValueByKey(is, 'is-pbt');
    const pat = findValueByKey(is, 'is-pat');
    const financeCost = findValueByKey(is, 'is-exp-fin');
    const depreciation = findValueByKey(is, 'is-exp-dep');
    const cogs = getT("is-exp-mat");

    const ebit = { 
        current: pbt.current + financeCost.current, 
        previous: pbt.previous + financeCost.previous 
    };
    const ebitda = { 
        current: ebit.current + depreciation.current, 
        previous: ebit.previous + depreciation.previous 
    };

    const fundsFromOperations = pat.current + depreciation.current;

    const cAssets = findValueByKey(bs, 'bs-assets-c');
    const cLiab = findValueByKey(bs, 'bs-liab-c');
    const workingCapitalChange = (cAssets.current - cLiab.current) - (cAssets.previous - cLiab.previous);

    // --- 1. EXTRACT TDS PAYABLE (Requirement: TDS Due) ---
    // We search the raw data for any descriptions containing "TDS"
    const tdsPayable = enrichedData.reduce((sum, row) => {
        const desc = (row["Level 3 Desc"] || row["Level 2 Desc"] || "").toLowerCase();
        if (desc.includes("tds payable") || desc.includes("tax deducted at source")) {
            return sum + (row.amountCurrent || 0);
        }
        return sum;
    }, 0);

    // --- 2. CALCULATE CASH CONVERSION CYCLE (Requirement: CCC) ---
    // Formula: Inventory Days + Receivable Days - Payable Days
    const inventoryVal = findValueByKey(bs, 'bs-assets-c-inv').current;
    const receivablesVal = findValueByKey(bs, 'bs-assets-c-fin-tr').current;
    const payablesVal = findValueByKey(bs, 'bs-liab-c-fin-enterprises').current;

    const inventoryDays = safeDiv(inventoryVal, cogs.current) * 365;
    const receivableDays = safeDiv(receivablesVal, rev.current) * 365;
    const payableDays = safeDiv(payablesVal, cogs.current) * 365;
    const ccc = inventoryDays + receivableDays - payableDays;

    // --- 3. GENERATE KEY ALERTS (Requirement: Key Alerts/Exceptions) ---
    const alerts = [];
    
    // TDS Alert
    if (Math.abs(tdsPayable) > 0) {
        alerts.push({ 
            message: `Compliance: TDS Payable of ₹${Math.abs(tdsPayable).toLocaleString()} is outstanding.`, 
            severity: "info" 
        });
    }

    // Negative Stock Alert
    if (inventoryVal < 0) {
        alerts.push({ 
            message: `Inventory Alert: Negative stock balance detected (₹${inventoryVal.toLocaleString()}).`, 
            severity: "error" 
        });
    }

    // Overdue Receivables Alert (Example threshold: 90 days)
    if (receivableDays > 90) {
        alerts.push({ 
            message: `Liquidity Risk: Receivable cycle is high (${receivableDays.toFixed(0)} days).`, 
            severity: "warning" 
        });
    }

    const dashboardKPIs = {
      // P&L KPIs
      revenueGrowth: safeDiv(rev.current - rev.previous, rev.previous) * 100,
      gmPercentage: safeDiv(rev.current - cogs.current, rev.current) * 100,
      ebitdaPercentage: safeDiv(ebitda.current, rev.current) * 100,
      ebitPercentage: safeDiv(ebit.current, rev.current) * 100,
      patPercentage: safeDiv(pat.current, rev.current) * 100,
      eps: safeDiv(pat.current, 85.05),
      
      
      // Balance Sheet KPIs
      netWorth: findValueByKey(bs, 'bs-eq').current,
      totalDebt: findValueByKey(bs, 'bs-liab-nc-fin-borrow').current + findValueByKey(bs, 'bs-liab-c-fin-liability').current,
      capitalEmployed: (findValueByKey(bs, 'bs-eq').current) + (findValueByKey(bs, 'bs-liab-nc-fin-borrow').current),
      
      // Cash Flow KPIs
      freeCashFlow: (pat.current + depreciation.current) - Math.abs(getT("cf-inv-capex").current),

      // Fund Flow KPIs
      workingCapitalChange
      
    };

        // --- 4. UPDATE DASHBOARD KPIs OBJECT ---
    const dashboardKPIsExtended = {
      ...dashboardKPIs,
      tdsPayable: Math.abs(tdsPayable),
      inventoryDays,
      receivableDays,
      payableDays,
      ccc,
      netDebt: dashboardKPIs.totalDebt - (findValueByKey(bs, 'bs-assets-c-fin-cce').current),
      alerts // Pass the alerts array to the UI
    };

const fundsFlow = {
  sources: [
    ...(fundsFromOperations > 0
      ? [{ label: "Funds from Operations", amount: fundsFromOperations }]
      : []),

    ...(workingCapitalChange < 0
      ? [{
          label: "Decrease in Working Capital",
          amount: Math.abs(workingCapitalChange)
        }]
      : []),

    {
      label: "Increase in Long-term Borrowings",
      amount: Math.max(
        0,
        getT("bs-liab-nc-fin-borrow").current -
        getT("bs-liab-nc-fin-borrow").previous
      )
    }
  ],

  uses: [
    ...(fundsFromOperations < 0
      ? [{
          label: "Loss from Operations",
          amount: Math.abs(fundsFromOperations)
        }]
      : []),

    ...(workingCapitalChange > 0
      ? [{
          label: "Increase in Working Capital",
          amount: workingCapitalChange
        }]
      : []),

    {
      label: "Capital Expenditure (PPE)",
      amount: Math.abs(getT("bs-assets-nc-ppe").current)
    },

    {
      label: "Dividends Paid",
      amount: Math.abs(getT("cf-fin-dividend").current)
    }
  ]
};

     return {
      balanceSheet,
      incomeStatement,
      cashFlow,
      fundsFlow,      // Integrated
      dashboardKPIs: dashboardKPIsExtended,
      equityShareCapital: {
        columns: EQUITY_SHARE_COLUMNS,
        rows: shareCapitalRows,
      },
      otherEquity: {
        columns: OTHER_EQUITY_COLUMNS,
        rows: updatedOtherEquityRows, // Use the newly calculated rows
      },
      notes: allNotes,
      accountingPolicies: ACCOUNTING_POLICIES_CONTENT,
    };
  }, [
    rawData,
    financialVar2,
    textVar,
    editedNotes,
    editedCashFlow,
    periodHeaders,
    shareCapitalRows,
    baseOtherEquityRows, 
    editedNoteKeys // Update dependency
  ]);
};

