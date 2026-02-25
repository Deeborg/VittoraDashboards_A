import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  AppBar,
  Toolbar,
} from '@mui/material';
import _ from 'lodash';
import { HierarchicalItem } from './types';
import { formatCurrency } from './helpers';

interface CashFlowEditorProps {
  cashFlowData: HierarchicalItem[];
  periodHeaders: { currentPeriod: string; previousPeriod: string };
  onSave: (updatedData: HierarchicalItem[]) => void;
  onClose: () => void;
}

// Recalculates all subtotals and grand totals in the cash flow hierarchy
const recalculateCashFlowTotals = (items: HierarchicalItem[]): HierarchicalItem[] => {
  const totals = new Map<string, { current: number, previous: number }>();

  function processNode(node: HierarchicalItem): HierarchicalItem {
    let valueCurrent = node.valueCurrent ?? 0;
    let valuePrevious = node.valuePrevious ?? 0;

    const children = node.children?.map(processNode);

    if (children?.length && !node.isEditableRow) { // Don't overwrite editable rows with sums
      valueCurrent = children.reduce((sum, c) => sum + (c.valueCurrent ?? 0), 0);
      valuePrevious = children.reduce((sum, c) => sum + (c.valuePrevious ?? 0), 0);
    }

    if (node.formula) {
      // Example: ["capex", "+", "ppe", "+", "cce", "+", "inter"]

      // start with first operand
      let firstId = node.formula[0];
      let firstVal = totals.get(firstId as string);

      let valueCurr = firstVal ? (firstVal.current ?? 0) : 0;
      let valuePrev = firstVal ? (firstVal.previous ?? 0) : 0;

      // loop over remaining operators/operands
      for (let i = 1; i < node.formula.length; i += 2) {
        const op = node.formula[i];
        const id = node.formula[i + 1];
        const val = totals.get(id as string);

        if (!val) continue; // just skip if missing

        if (op === "+") {
          valueCurr += val.current ?? 0;
          valuePrev += val.previous ?? 0;
        } else if (op === "-") {
          valueCurr -= val.current ?? 0;
          valuePrev -= val.previous ?? 0;
        }
      }

      valueCurrent = valueCurr;
      valuePrevious = valuePrev;
    }

    if (node.id) {
      totals.set(node.id, { current: valueCurrent, previous: valuePrevious });
    }

    return { ...node, children, valueCurrent, valuePrevious };
  }

  return items.map(processNode);
};


const EditableCashFlowItem: React.FC<{
  item: HierarchicalItem;
  onValueChange: (path: string, field: 'valueCurrent' | 'valuePrevious', value: number) => void;
  path: string;
  depth: number;
}> = ({ item, onValueChange, path, depth }) => {

  const handleInputChange = (field: 'valueCurrent' | 'valuePrevious', event: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseFloat(event.target.value) || 0;
    onValueChange(path, field, numericValue);
  };

  const isTotal = item.isGrandTotal || item.isSubtotal;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <>
      <TableRow key={item.key}>
        <TableCell style={{ paddingLeft: `${depth * 20 + 20}px`, fontWeight: isTotal ? 'bold' : 'normal' }}>
          {item.label}
        </TableCell>
        <TableCell align="right">
          {item.isEditableRow ? (
            <TextField
              type="number"
              size="small"
              variant="outlined"
              value={item.valueCurrent === 0 ? '' : item.valueCurrent}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('valueCurrent', e)}
              sx={{
                width: '150px',
                '& input[type=number]': {
                  MozAppearance: 'textfield',  // Firefox
                },
                '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none', // Chrome, Safari, Edge
                  margin: 0,
                },
              }}
              inputProps={{ style: { textAlign: 'right' } }}
            />
          ) : (
            formatCurrency(item.valueCurrent)
          )}
        </TableCell>
        <TableCell align="right">
          {item.isEditableRow ? (
            <TextField
              type="number"
              size="small"
              variant="outlined"
              value={item.valuePrevious === 0 ? '' : item.valuePrevious}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('valuePrevious', e)}
              sx={{
                width: '150px',
                '& input[type=number]': {
                  MozAppearance: 'textfield',  // Firefox
                },
                '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none', // Chrome, Safari, Edge
                  margin: 0,
                },
              }}
              inputProps={{ style: { textAlign: 'right' } }}
            />
          ) : (
            formatCurrency(item.valuePrevious)
          )}
        </TableCell>
      </TableRow>
      {item.children?.map((child, index) => (
        <EditableCashFlowItem
          key={child.key}
          item={child}
          path={`${path}.children[${index}]`}
          onValueChange={onValueChange}
          depth={depth + 1}
        />
      ))}
    </>
  );
};

const CashFlowEditor: React.FC<CashFlowEditorProps> = ({ cashFlowData,periodHeaders, onSave, onClose }) => {
  const [editableData, setEditableData] = useState<HierarchicalItem[]>(() =>
    _.cloneDeep(cashFlowData)
  );

  // Only reset editableData when the component first mounts or when cashFlowData reference actually changes
  // Remove the useEffect that was causing the reset issue

  const handleValueChange = (
    path: string,
    field: 'valueCurrent' | 'valuePrevious',
    value: number
  ) => {
    setEditableData((prevData) => {
      const newData = _.cloneDeep(prevData);
      _.set(newData, `${path}.${field}`, value);
      // After changing a value, recalculate all totals
      return recalculateCashFlowTotals(newData);
    });
  };

  const handleSave = () => {
    console.log('CASH FLOW EDITOR: Saving this data:', editableData);
    onSave(editableData);
  };

  return (
    <div>
      <Box sx={{ p: 5, backgroundColor: 'grey.100', minHeight: '100vh', maxWidth:3300 }}>
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Edit Cash Flow Statement
            </Typography>
            <Button color="info" onClick={handleSave} variant="contained">
              Save Changes
            </Button>
            <Button color="inherit" onClick={onClose} sx={{ ml: 2 }}>
              Close
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3, mt: 8 }}>
          <Paper sx={{ mb: 3, p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Cash Flow From Operating, Investing, and Financing Activities
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Particulars</TableCell>
                  <TableCell align="right">{periodHeaders.currentPeriod}</TableCell>
                  <TableCell align="right">{periodHeaders.previousPeriod}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editableData.map((item, index) => (
                  <EditableCashFlowItem
                    key={item.key}
                    item={item}
                    path={`[${index}]`}
                    onValueChange={handleValueChange}
                    depth={0}
                  />
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Box>
    </div>
  );
};

export default CashFlowEditor;