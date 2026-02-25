import { Fragment } from "react";
import { formatCurrency, PDF_STYLES } from "./helpers";
import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  PDFDownloadLink,
  Link,
} from "@react-pdf/renderer";
import { useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { EquityColumn, EquityRow, FinancialData, FinancialNote,HierarchicalItem,TableContent, } from "./types";



export const RenderPdfNoteRow = ({
  item,
  depth,
}: {
  item: HierarchicalItem;
  depth: number;
}) => {
  let rowStyle: any = PDF_STYLES.noteRow;
  if (item.isSubtotal)
    rowStyle = {
      ...PDF_STYLES.noteSubTotalRow,
      ...(item.children && { marginBottom: 0 }),
    };
  if (item.isGrandTotal) rowStyle = PDF_STYLES.noteGrandTotalRow;

  const textStyle = {
    fontFamily:
      item.isSubtotal || item.isGrandTotal ? "Helvetica-Bold" : "Helvetica",
  };

  return (
    <View key={item.key}>
      <View style={rowStyle} wrap={false}>
        <Text
          style={[
            textStyle,
            PDF_STYLES.colParticulars,
            { paddingLeft: depth * 15 },
          ]}
        >
          {item.label}
        </Text>
        <Text style={[textStyle, PDF_STYLES.noteColAmount]}>
          {item.isSubtotal || item.isGrandTotal
            ? formatCurrency(item.valueCurrent)
            : item.children
            ? ""
            : formatCurrency(item.valueCurrent)}
        </Text>
        <Text style={[textStyle, PDF_STYLES.noteColAmount]}>
          {item.isSubtotal || item.isGrandTotal
            ? formatCurrency(item.valuePrevious)
            : item.children
            ? ""
            : formatCurrency(item.valuePrevious)}
        </Text>
      </View>
      {/* Narrative text (if present) */}
      {item.narrativeText && (
        <Text style={PDF_STYLES.noteParagraph}>{item.narrativeText}</Text>
      )}
      {item.children?.map((child) => (
        <RenderPdfNoteRow key={child.key} item={child} depth={depth + 1} />
      ))}
    </View>
  );
};
// --- FIX: New component to render a table within a PDF note ---
export const RenderPdfNoteTable = ({ data }: { data: TableContent }) => (
  <View style={[PDF_STYLES.policyTable, { width: "100%", marginTop: 10 }]}>
    <View style={PDF_STYLES.policyTableRow}>
      {data.headers.map((header, hIndex) => (
        <Text
          key={hIndex}
          style={[PDF_STYLES.policyTableHeaderCell, { fontSize: 8 }]}
        >
          {header}
        </Text>
      ))}
    </View>
    {data.rows.map((row, rIndex) => (
      <View key={rIndex} style={PDF_STYLES.policyTableRow}>
        {row.map((cell, cIndex) => (
          <Text
            key={cIndex}
            style={[
              PDF_STYLES.policyTableCell,
              { fontSize: 8, textAlign: cIndex === 0 ? "left" : "right" },
            ]}
          >
            {cell}
          </Text>
        ))}
      </View>
    ))}
  </View>
);
export const RenderPdfNote = ({ note,periodHeaders }: { note: FinancialNote , periodHeaders: { currentPeriod: string, previousPeriod: string }}) => {
  const isTableNote =
    note.content.length > 0 &&
    typeof note.content[0] === "object" &&
    note.content[0] !== null &&
    "type" in note.content[0] &&
    (note.content[0] as TableContent).type === "table";

  return (
    <View style={PDF_STYLES.section} id={`note-${note.noteNumber}`} break>
      <Text style={PDF_STYLES.notePageHeader}>
        Notes forming part of the financial statements
      </Text>
      <Text style={PDF_STYLES.title}>
        (All amounts in ₹ lakhs, unless otherwise stated)
      </Text>

      <View style={{ marginTop: 15 }}>
        <Text style={PDF_STYLES.noteTitle}>
          Note {note.noteNumber}: {note.title}
        </Text>
        {note.subtitle && (
          <Text style={PDF_STYLES.noteSubtitle}>{note.subtitle}</Text>
        )}

        {/* Column headers: only show if not pure table note */}
        {!isTableNote && (
          <View style={PDF_STYLES.tableHeader}>
            <Text style={PDF_STYLES.noteColParticulars}>Particulars</Text>
            <Text style={PDF_STYLES.noteColAmount}>{periodHeaders.currentPeriod}</Text>
            <Text style={PDF_STYLES.noteColAmount}>{periodHeaders.previousPeriod}</Text>
          </View>
        )}

        {/* Render each content item with proper type guard */}
        {note.content.map((item, index) => {
          if (typeof item === "string") {
            return (
              <Text key={index} style={PDF_STYLES.noteParagraph}>
                {item}
              </Text>
            );
          }

          if (typeof item === "object" && item !== null) {
            if ("type" in item && item.type === "table") {
              return (
                <RenderPdfNoteTable key={`table-${index}`} data={item as TableContent} />
              );
            }
            if ("key" in item) {
              return (
                <RenderPdfNoteRow
                  key={(item as HierarchicalItem).key}
                  item={item as HierarchicalItem}
                  
                  depth={0}
                />
              );
            }
          }

          return null;
        })}

        {note.footer && (
          <Text style={PDF_STYLES.noteFooter}>{note.footer}</Text>
        )}
      </View>
    </View>
  );
};

export const RenderEquityTablePdf = ({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: EquityColumn[];
  rows: EquityRow[];
}) => {
  // Define column widths. Particulars gets 40%, the rest split the remainder.
  const particularColWidth = 40;
  const otherColWidth = (100 - particularColWidth) / columns.length;

  return (
    <View style={{ marginTop: 15 }} wrap={false}>
      <Text style={PDF_STYLES.noteTitle}>{title}</Text>

      {/* Table Header */}
      <View style={{ ...PDF_STYLES.tableHeader, borderBottom: 1, borderBottomColor: '#333' }}>
        <Text style={[PDF_STYLES.rowTextBold, { width: `${particularColWidth}%`, textAlign: 'left', paddingLeft: 5 }]}>Particulars</Text>
        {columns.map(col => (
          <Text key={col.key} style={[PDF_STYLES.rowTextBold, { width: `${otherColWidth}%`, textAlign: 'right', paddingRight: 5 }]}>{col.label}</Text>
        ))}
      </View>

      {/* Table Body */}
      {rows.map(row => (
        <View key={row.key} style={{ ...PDF_STYLES.row, borderBottom: 0 }}>
          <Text style={[PDF_STYLES.rowText, { width: `${particularColWidth}%`, textAlign: 'left', paddingLeft: 5, paddingRight: 5 }]}>{row.label}</Text>
          {columns.map(col => {
            const value = row.values ? row.values[col.key] : undefined;
            const displayValue = typeof value === 'number' ? formatCurrency(value) : value;
            return (
              <Text key={col.key} style={[PDF_STYLES.rowText, { width: `${otherColWidth}%`, textAlign: 'right', paddingRight: 5 }]}>{displayValue ?? ''}</Text>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export const RenderPdfRow = ({
  item,
  depth,
}: {
  item: HierarchicalItem;
  depth: number;
}) => {
  const isTotal = item.isGrandTotal || item.isSubtotal;
  let rowStyle: any = PDF_STYLES.row;
  if (depth === 0) rowStyle = PDF_STYLES.topLevelRow;
  else if (item.isGrandTotal) rowStyle = PDF_STYLES.grandTotalRow;
  else if (item.isSubtotal) rowStyle = PDF_STYLES.subTotalRow;

  const textStyle: any[] = [
    isTotal || depth === 0 ? PDF_STYLES.rowTextBold : PDF_STYLES.rowText,
  ];

  const AmountCell = ({ value }: { value: number | null }) => (
    <Text style={[...textStyle, PDF_STYLES.colAmount]}>
      {formatCurrency(value)}
    </Text>
  );

  const LinkedAmountCell = ({
    value,
    note,
  }: {
    value: number | null;
    note?: string | number;
  }) => {
    if (note) {
      return (
        <Link
          src={`#note-${note}`}
          style={{ ...PDF_STYLES.colAmount, textDecoration: "none" }}
        >
          <Text
            style={[...textStyle, { color: "black", textDecoration: "none" }]}
          >
            {formatCurrency(value)}
          </Text>
        </Link>
      );
    }
    return <AmountCell value={value} />;
  };

  return (
    <Fragment>
      <View style={rowStyle} wrap={false}>
        <Text
          style={[
            ...textStyle,
            PDF_STYLES.colParticulars,
            {
              paddingLeft: depth > 0 ? depth * 15 + 5 : 5,
              textTransform: depth === 0 ? "uppercase" : "none",
            },
          ]}
        >
          {item.label}
        </Text>
        <Text style={[...textStyle, PDF_STYLES.colNote]}>{item.note}</Text>
        <LinkedAmountCell value={item.valueCurrent} note={item.note} />
        <LinkedAmountCell value={item.valuePrevious} note={item.note} />
      </View>
      {item.children?.map((child) => (
        <RenderPdfRow key={child.key} item={child} depth={depth + 1} />
      ))}
    </Fragment>
  );
};
export const PDFDocumentComponent = ({
  data,
  periodHeaders,
}: {
  data: FinancialData;
  periodHeaders: { currentPeriod: string; previousPeriod: string };
}) => (
  <Document>
    <Page size="A4" style={PDF_STYLES.page}>
      <Text style={PDF_STYLES.title}>Financial Statements</Text>

      <View style={PDF_STYLES.section}>
        <Text style={PDF_STYLES.sectionHeader}>Balance Sheet</Text>
        <View style={PDF_STYLES.tableHeader}>
          <Text style={PDF_STYLES.colParticulars}>Particulars</Text>
          <Text style={PDF_STYLES.colNote}>Note</Text>
          <Text style={PDF_STYLES.colAmount}>
            {periodHeaders.currentPeriod}
          </Text>
          <Text style={PDF_STYLES.colAmount}>
            {periodHeaders.previousPeriod}
          </Text>
        </View>
        {data.balanceSheet.map((item) => (
          <RenderPdfRow key={item.key} item={item} depth={0} />
        ))}
      </View>
      <View style={PDF_STYLES.section} break>
        <Text style={PDF_STYLES.sectionHeader}>
          Statement of Profit and Loss
        </Text>
        <View style={PDF_STYLES.tableHeader}>
          <Text style={PDF_STYLES.colParticulars}>Particulars</Text>
          <Text style={PDF_STYLES.colNote}>Note</Text>
          <Text style={PDF_STYLES.colAmount}>
            {periodHeaders.currentPeriod}
          </Text>
          <Text style={PDF_STYLES.colAmount}>
            {periodHeaders.previousPeriod}
          </Text>
        </View>
        {data.incomeStatement.map((item) => (
          <RenderPdfRow key={item.key} item={item} depth={0} />
        ))}
      </View>

      <View style={PDF_STYLES.section} break>
        <Text style={PDF_STYLES.sectionHeader}>Cash Flow Statement</Text>
        <View style={PDF_STYLES.tableHeader}>
          <Text style={PDF_STYLES.colParticulars}>Particulars</Text>
          <Text style={PDF_STYLES.colNote}>Note</Text>
          <Text style={PDF_STYLES.colAmount}>
            {periodHeaders.currentPeriod}
          </Text>
          <Text style={PDF_STYLES.colAmount}>
            {periodHeaders.previousPeriod}
          </Text>
        </View>
        {data.cashFlow.map((item) => (
          <RenderPdfRow key={item.key} item={item} depth={0} />
        ))}
      </View>
      <View style={PDF_STYLES.section} break>
        <Text style={PDF_STYLES.sectionHeader}>Statement of Changes in Equity</Text>
        <RenderEquityTablePdf
          title="A. Equity Share Capital"
          columns={data.equityShareCapital.columns}
          rows={data.equityShareCapital.rows}
        />
        <RenderEquityTablePdf
          title="B. Other Equity"
          columns={data.otherEquity.columns}
          rows={data.otherEquity.rows}
        />
      </View>

      {data.notes.map((note) => (
        <RenderPdfNote  note={note} periodHeaders={periodHeaders}/>
      ))}
    </Page>
    <Page size="A4" style={PDF_STYLES.page}>
      <View style={PDF_STYLES.section}>
        <Text style={PDF_STYLES.sectionHeader}>
          Significant Accounting Policies
        </Text>
        {data.accountingPolicies.map((policy, index) => (
          <View key={index} style={PDF_STYLES.policyBlock}>
            <Text style={PDF_STYLES.policyTitle} minPresenceAhead={20}>
              {policy.title}
            </Text>

            {policy.text.map((content, contentIndex) => {
              if (typeof content === "string") {
                return (
                  <Text key={contentIndex} style={PDF_STYLES.policyText}>
                    {content}
                  </Text>
                );
              } else if (content.type === "table") {
                return (
                  <View key={contentIndex} style={PDF_STYLES.policyTable}>
                    <View style={PDF_STYLES.policyTableRow}>
                      {content.headers.map((header, hIndex) => (
                        <Text
                          key={hIndex}
                          style={PDF_STYLES.policyTableHeaderCell}
                        >
                          {header}
                        </Text>
                      ))}
                    </View>
                    {content.rows.map((row, rIndex) => (
                      <View key={rIndex} style={PDF_STYLES.policyTableRow}>
                        {row.map((cell, cIndex) => (
                          <Text key={cIndex} style={PDF_STYLES.policyTableCell}>
                            {cell}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                );
              }
              return (
                <Text key={contentIndex} style={PDF_STYLES.policyText}></Text>
              );
            })}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
export const PdfModal = ({
  open,
  onClose,
  data,
  periodHeaders,
}: {
  open: boolean;
  onClose: () => void;
  data: FinancialData;
  periodHeaders: { currentPeriod: string; previousPeriod: string };
}) => {
  useEffect(() => {
    console.log("PdfModal open:", open);
    return () => {
      console.log("PdfModal closing");
    };
  }, [open]);

  const handleClose = () => {
    try {
      onClose();
    } catch (error) {
      console.error("Error during close:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogContent sx={{ height: "80vh" }}>
        {open && (
          <PDFViewer width="100%" height="100%">
            <PDFDocumentComponent data={data} periodHeaders={periodHeaders} />
          </PDFViewer>
        )}
      </DialogContent>
      <DialogActions>
        {open && (
          <PDFDownloadLink
            document={
              <PDFDocumentComponent data={data} periodHeaders={periodHeaders} />
            }
            fileName="financial_statements.pdf"
            style={{ textDecoration: "none" }}
          >
            {({ loading }) => (
              <Button variant="contained" disabled={loading}>
                {loading ? "Generating..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        )}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
