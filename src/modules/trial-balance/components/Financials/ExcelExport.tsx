import { AccountingPolicy, EquityColumn, EquityRow, FinancialData, FinancialNote, HierarchicalItem, TableContent } from "./types";
import ExcelJS, { Worksheet, Border, Fill } from "exceljs";
import { saveAs } from "file-saver";
import { formatCurrency } from "./helpers";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

const addEquityTableToSheet = (
  worksheet: Worksheet,
  title: string,
  columns: EquityColumn[],
  rows: EquityRow[]
) => {
  // Title Row
  const titleRow = worksheet.addRow([title]);
  titleRow.font = { bold: true, size: 14 };
  worksheet.mergeCells(titleRow.number, 1, titleRow.number, columns.length + 1);
  worksheet.addRow([]); // Spacer

  // Header Row
  const headerRow = worksheet.addRow(['Particulars', ...columns.map(c => c.label)]);
  headerRow.font = { bold: true };
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Data Rows
  rows.forEach(row => {
    const rowData = [row.label, ...columns.map(col => row.values?.[col.key] ?? "")];
    const addedRow = worksheet.addRow(rowData);
    
    // Format cells
    addedRow.getCell(1).alignment = { horizontal: 'left', wrapText: true, vertical: 'top' };
    columns.forEach((col, index) => {
      const cell = addedRow.getCell(index + 2); // +2 because Excel columns are 1-based and we have 'Particulars'
      const value = row.values?.[col.key];

      if (typeof value === 'number') {
        cell.numFmt = '#,##0.00;(#,##0.00)';
        cell.alignment = { horizontal: 'right' };
      } else {
        cell.alignment = { horizontal: 'center' };
      }
    });
  });
};

// --- 6. EXPORT & MODAL COMPONENTS ---
export const handleExportExcel = async (
  data: FinancialData,
  periodHeaders: { currentPeriod: string; previousPeriod: string }
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FinancialApp";
  workbook.created = new Date();

  // Recursive helper for hierarchical rows
  const addHierarchicalRows = (
    worksheet: Worksheet,
    items: HierarchicalItem[],
    depth: number
  ) => {
    items.forEach((item) => {
      const isTotal = item.isGrandTotal || item.isSubtotal;
      const row = worksheet.addRow([]); // Add empty row first to get a reference

      const noteSheetName = item.note ? `Note ${item.note}` : null;

      row.getCell(1).value = `${" ".repeat(depth * 4)}${item.label ?? ""}`;
      row.getCell(2).value = item.note || "";

      if (item.note && noteSheetName && workbook.getWorksheet(noteSheetName)) {
        row.getCell(3).value = {
          text: formatCurrency(item.valueCurrent) ?? "",
          hyperlink: `'${noteSheetName}'!A1`,
          tooltip: `Go to Note ${item.note}`,
        };
        row.getCell(4).value = {
          text: formatCurrency(item.valuePrevious) ?? "",
          hyperlink: `'${noteSheetName}'!A1`,
          tooltip: `Go to Note ${item.note}`,
        };
      } else {
        row.getCell(3).value = item.valueCurrent ?? "";
        row.getCell(4).value = item.valuePrevious ?? "";
      }

      row.font = { bold: isTotal || depth === 0 };
      if (depth === 0 || item.isGrandTotal) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };
        row.border = {
          top: { style: item.isGrandTotal ? "medium" : "thin" },
          bottom: { style: item.isGrandTotal ? "medium" : "thin" },
        };
      }

      row.getCell(3).numFmt = "#,##0.00;(#,##0.00)";
      row.getCell(4).numFmt = "#,##0.00;(#,##0.00)";
      row.getCell(3).alignment = { horizontal: "right" };
      row.getCell(4).alignment = { horizontal: "right" };

      if (item.note) {
        row.getCell(3).font = {
          color: { argb: "FF0000FF" },
          underline: true,
          bold: isTotal || depth === 0,
        };
        row.getCell(4).font = {
          color: { argb: "FF0000FF" },
          underline: true,
          bold: isTotal || depth === 0,
        };
      }

      if (item.children) {
        addHierarchicalRows(worksheet, item.children, depth + 1);
      }
    });
  };

  // Create summary sheets
  const createSheet = (title: string, sheetData: HierarchicalItem[]) => {
    const worksheet = workbook.addWorksheet(title);
    worksheet.columns = [
      { header: "Particulars", key: "particulars", width: 60 },
      {
        header: "Note No.",
        key: "note",
        width: 15,
        style: { alignment: { horizontal: "center" } },
      },
      { header: periodHeaders.currentPeriod, key: "current", width: 25 },
      { header: periodHeaders.previousPeriod, key: "previous", width: 25 },
    ];
    worksheet.getRow(1).font = { bold: true };
    addHierarchicalRows(worksheet, sheetData, 0);
  };

  const createEquitySheet = () => {
    const worksheet = workbook.addWorksheet("Equity Statement");

    // Define columns to accommodate the widest table (Other Equity has more columns)
    worksheet.columns = [
        { key: 'colA', width: 45 }, // Particulars
        { key: 'colB', width: 20 },
        { key: 'colC', width: 20 },
        { key: 'colD', width: 40 }, // For "Remeasurement gains..."
        { key: 'colE', width: 20 }
    ];

    addEquityTableToSheet(
      worksheet,
      "A. Equity Share Capital",
      data.equityShareCapital.columns,
      data.equityShareCapital.rows
    );
    
    worksheet.addRow([]); // Spacer row
    
    addEquityTableToSheet(
      worksheet,
      "B. Other Equity",
      data.otherEquity.columns,
      data.otherEquity.rows
    );
  };

  // Create note sheets
  const createNoteSheet = (note: FinancialNote) => {
    const worksheet = workbook.addWorksheet(`Note ${note.noteNumber}`);
    worksheet.views = [{ showGridLines: false }];

    const tableHeaderFill: Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
    const tableBorders: Partial<Border> = {
      style: "thin",
      color: { argb: "FF000000" },
    };
    const fullTableBorder = {
      top: tableBorders,
      left: tableBorders,
      bottom: tableBorders,
      right: tableBorders,
    };

    // Title
    worksheet.addRow([`Note ${note.noteNumber}: ${note.title ?? ""}`]).font = {
      bold: true,
      size: 14,
    };

    // Subtitle only if exists
    if (note.subtitle && note.subtitle.trim() !== "") {
      worksheet.addRow([note.subtitle]).font = { italic: true };
    }
    worksheet.addRow([]); // Spacer

    const addNoteContent = (
      items: (HierarchicalItem | TableContent)[],
      depth: number
    ) => {
      items.forEach((item) => {
        if ("key" in item) {
          // HierarchicalItem
          const row = worksheet.addRow([
            `${" ".repeat(depth * 4)}${item.label ?? ""}`,
            item.isSubtotal || item.isGrandTotal
              ? item.valueCurrent ?? ""
              : item.children
              ? ""
              : item.valueCurrent ?? "",
            item.isSubtotal || item.isGrandTotal
              ? item.valuePrevious ?? ""
              : item.children
              ? ""
              : item.valuePrevious ?? "",
          ]);

          row.getCell(2).numFmt = "#,##0.00;(#,##0.00)";
          row.getCell(3).numFmt = "#,##0.00;(#,##0.00)";
          row.getCell(2).alignment = { horizontal: "right" };
          row.getCell(3).alignment = { horizontal: "right" };

          if (item.isSubtotal) {
            row.font = { bold: true };
            row.eachCell((c) => (c.border = { top: { style: "thin" } }));
          }
          if (item.isGrandTotal) {
            row.font = { bold: true };
            row.eachCell(
              (c) =>
                (c.border = {
                  top: { style: "thin" },
                  bottom: { style: "double" },
                })
            );
          }

          // Narrative text only if exists
          if (item.narrativeText && item.narrativeText.trim() !== "") {
            const narrativeRow = worksheet.addRow([` ${item.narrativeText}`]);
            narrativeRow.getCell(1).alignment = { wrapText: true };
            narrativeRow.font = { italic: true, color: { argb: "FF555555" } };
          }

          if (item.children) {
            addNoteContent(item.children, depth + 1);
          }
        }
        if ("type" in item && item.type === "table") {
          // TableContent
          worksheet.addRow([]); // Spacer before table

          const numCols = item.headers.length;
          worksheet.mergeCells(
            worksheet.rowCount,
            1,
            worksheet.rowCount,
            numCols
          );

          const headerRow = worksheet.addRow(item.headers);
          headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = tableHeaderFill;
            cell.border = fullTableBorder;
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
              wrapText: true,
            };
          });

          item.rows.forEach((rowData) => {
            const dataRow = worksheet.addRow(rowData);
            dataRow.eachCell((cell) => {
              cell.border = fullTableBorder;
              cell.alignment = {
                vertical: "middle",
                horizontal: "right",
                wrapText: true,
              };
            });
            dataRow.getCell(1).alignment = { horizontal: "left" };
          });
          worksheet.addRow([]); // Spacer after table
        }
      });
    };

    // Columns setup
    const isFirstItemTable =
      note.content.length > 0 &&
      typeof note.content[0] === "object" &&
      note.content[0] !== null &&
      "type" in note.content[0] &&
      (note.content[0] as TableContent).type === "table";

    if (isFirstItemTable) {
      const table = note.content[0] as TableContent;
      worksheet.columns = table.headers.map((h, i) => ({
        key: `col${i}`,
        width: i === 0 ? 50 : 20,
      }));
    } else {
      worksheet.columns = [
        { key: "particulars", width: 60 },
        { key: "current", width: 20 },
        { key: "previous", width: 20 },
      ];
      const headerRow = worksheet.addRow([
        "",
        periodHeaders.currentPeriod,
        periodHeaders.previousPeriod,
      ]);
      headerRow.font = { bold: true };
      headerRow.eachCell((cell) => {
        cell.alignment = { horizontal: "right" };
        cell.border = { bottom: { style: "thin" } };
      });
      headerRow.getCell(1).alignment = { horizontal: "left" };
    }

    // Add content
    addNoteContent(
      note.content.filter(
        (item): item is TableContent | HierarchicalItem =>
          typeof item === "object" && item !== null
      ),
      0
    );

    worksheet.addRow([]); // Spacer
    // Footer only if exists
    if (note.footer && note.footer.trim() !== "") {
      const footerRow = worksheet.addRow([note.footer]);
      footerRow.getCell(1).alignment = { wrapText: true };
      worksheet.mergeCells(
        footerRow.number,
        1,
        footerRow.number,
        worksheet.columns.length
      );
    }
  };

  // Create policies sheet
  const createPoliciesSheet = (title: string, policies: AccountingPolicy[]) => {
    const worksheet = workbook.addWorksheet(title);
    worksheet.columns = [
      { header: "Significant Accounting Policies", key: "policy", width: 120 },
    ];
    worksheet.getRow(1).font = { bold: true, size: 14 };

    worksheet.views = [{ showGridLines: false }];

    const tableHeaderFill: Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
    const tableBorders: Partial<Border> = {
      style: "thin",
      color: { argb: "FF000000" },
    };
    const fullTableBorder = {
      top: tableBorders,
      left: tableBorders,
      bottom: tableBorders,
      right: tableBorders,
    };

    policies.forEach((policy) => {
      worksheet.addRow([policy.title ?? ""]).font = { bold: true, size: 12 };
      worksheet.addRow([]);

      policy.text.forEach((content) => {
        if (typeof content === "string" && content.trim() !== "") {
          const textRow = worksheet.addRow([content]);
          textRow.getCell(1).alignment = { wrapText: true, vertical: "top" };
        } else if (typeof content === "object" && content.type === "table") {
          const headerRow = worksheet.addRow(content.headers);
          headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = tableHeaderFill;
            cell.border = fullTableBorder;
            cell.alignment = { vertical: "middle", horizontal: "center" };
          });

          content.rows.forEach((rowData) => {
            const dataRow = worksheet.addRow(rowData);
            dataRow.eachCell((cell, colNumber) => {
              cell.border = fullTableBorder;
              if (colNumber === 1) {
                cell.alignment = {
                  vertical: "middle",
                  horizontal: "left",
                  wrapText: true,
                };
              } else {
                cell.alignment = { vertical: "middle", horizontal: "center" };
              }
            });
          });
        }
        worksheet.addRow([]);
      });
      worksheet.addRow([]);
    });
  };

  // Generate all sheets
  createSheet("Balance Sheet", data.balanceSheet);
  createSheet("Profit & Loss", data.incomeStatement);
  createSheet("Cash Flow", data.cashFlow);
  createEquitySheet();
  data.notes.forEach((note) => createNoteSheet(note));
  createPoliciesSheet("Accounting Policies", data.accountingPolicies);


  // Save Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "Financial_Statements.xlsx");
};

// Confirm export dialog
export const ExcelConfirmDialog = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="excel-confirm-dialog-title"
  >
    <DialogTitle id="excel-confirm-dialog-title">Confirm Export</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Do you want to download the financial statements as an Excel file?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} variant="contained" autoFocus>
        Confirm & Download
      </Button>
    </DialogActions>
  </Dialog>
);
