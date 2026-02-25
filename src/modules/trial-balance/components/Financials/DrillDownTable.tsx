// DrillDownTable.tsx

import { HierarchicalItem } from "./types";
import { Fragment, useMemo } from "react";
import { Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, Link } from "@mui/material";
import { formatCurrency } from "./helpers";

export const DrillDownTable = ({
  title,
  data,
  expandedKeys,
  onToggleRow,
  handleEditNotes,
  periodHeaders,
}: {
  title: string;
  data: HierarchicalItem[];
  expandedKeys: Set<string>;
  onToggleRow: (key: string) => void;
  handleEditNotes: (note?: number | string) => void;
  periodHeaders: { currentPeriod: string; previousPeriod: string };
}) => {
  // Calculate the difference for assets and liabilities (only for Balance Sheet)
  const { assetsDifference, liabilitiesDifference } = useMemo(() => {
    if (title !== "Balance Sheet") {
      return { assetsDifference: null, liabilitiesDifference: null };
    }

    const assets = data.find(item => item.key === 'bs-assets');
     const liabilities = data.find(item => item.key === 'bs-eq-liab');

     if (!assets || !liabilities || 
         assets.valueCurrent === null || liabilities.valueCurrent === null ||
         assets.valuePrevious === null || liabilities.valuePrevious === null) {
       return { assetsDifference: null, liabilitiesDifference: null };
     }

     const currentAssetsDiff = (assets.valueCurrent ?? 0) - (liabilities.valueCurrent ?? 0);
     const previousAssetsDiff = (assets.valuePrevious ?? 0) - (liabilities.valuePrevious ?? 0);

    return {
      assetsDifference: {
        current: currentAssetsDiff,
        previous: previousAssetsDiff
      },
      liabilitiesDifference: {
        current: -currentAssetsDiff,
        previous: -previousAssetsDiff
      }
    };
  }, [data, title]);

  const renderRow = (row: HierarchicalItem, depth: number) => {
    const hasChildren = row.children && row.children.length > 0;
    const rowStyles: any = {};
    const cellStyles: any = {
      fontWeight:
        depth === 0 || row.isSubtotal || row.isGrandTotal ? "bold" : "normal",
      verticalAlign: "middle",
    };
    if (depth === 0) {
      rowStyles.backgroundColor = "#f0f0f0";
      cellStyles.borderTop = `1px solid #ccc`;
      cellStyles.borderBottom = `1px solid #ccc`;
    }
    if (row.isSubtotal && depth > 0) {
      cellStyles.borderTop = `1px solid #e0e0e0`;
    }
    if (row.isGrandTotal) {
      rowStyles.backgroundColor = "#f0f0f0";
      cellStyles.borderTop = `2px solid #333`;
      cellStyles.borderBottom = `2px solid #333`;
    }

    // Show difference for assets and liabilities
    const showDifference = title === "Balance Sheet" && 
      (row.key === 'bs-assets' || row.key === 'bs-eq-liab');
    
    const difference = row.key === 'bs-assets' 
      ? assetsDifference 
      : row.key === 'bs-eq-liab' 
        ? liabilitiesDifference 
        : null;

    return (
      <Fragment key={row.key}>
        <TableRow sx={rowStyles}>
          <TableCell
            sx={{
              ...cellStyles,
              paddingLeft: `${depth * 1.5 + 1}rem`,
              textTransform: depth === 0 ? "uppercase" : "none",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button
                size="small"
                onClick={() => onToggleRow(row.key)}
                variant="text"
                sx={{
                  mr: 1,
                  minWidth: "auto",
                  p: "2px 4px",
                  color: "text.secondary",
                  visibility: hasChildren ? "visible" : "hidden",
                }}
              >
                {expandedKeys.has(row.key) ? "▼" : "▶"}
              </Button>
              {row.label}
            </Box>
          </TableCell>
          <TableCell
            align="center"
            sx={{
              ...cellStyles,
            }}
          >
            {row.note && (
              <Link
                component="button"
                variant="body2"
                onClick={() => handleEditNotes(row.noteLink ?? row.note)}
                sx={{
                  color: row.isEditableNote ? 'red' : 'blue',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  // --- CHANGE IS HERE ---
                  textDecoration: 'none', // Remove underline
                  '&:hover': {
                    textDecoration: 'none', // Ensure no underline on hover either
                  },
                }}
              >
                {row.note}
              </Link>
            )}
          </TableCell>

          <TableCell align="right" sx={cellStyles}>
            {formatCurrency(row.valueCurrent)}
          </TableCell>
          <TableCell align="right" sx={cellStyles}>
            {formatCurrency(row.valuePrevious)}
          </TableCell>
        </TableRow>
        {hasChildren &&
          expandedKeys.has(row.key) &&
          row.children?.map((child) => renderRow(child, depth + 1))}
      </Fragment>
    );
  };

  return (
    <Paper sx={{ my: 2, overflow: "hidden" }}>
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" mb={1}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ₹ in Lakhs
          </Typography>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "50%", fontWeight: 'bold' }}>Particulars</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Note No.</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{periodHeaders.currentPeriod}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                {periodHeaders.previousPeriod}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => renderRow(row, 0))}
            {title === "Balance Sheet" && assetsDifference && liabilitiesDifference && (
              <TableRow sx={{ backgroundColor: "#f8f8f8" }}>
                <TableCell colSpan={2} sx={{ fontWeight: "bold", borderTop: "2px solid #333" }}>
                  Balance Sheet Difference
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", borderTop: "2px solid #333", color: assetsDifference.current !== 0 ? 'error.main' : 'inherit' }}>
                  Diff: {formatCurrency(assetsDifference.current)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", borderTop: "2px solid #333", color: assetsDifference.previous !== 0 ? 'error.main' : 'inherit' }}>
                  Diff: {formatCurrency(assetsDifference.previous)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};