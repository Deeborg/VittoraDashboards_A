import React, { useState } from 'react';
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
import { EquityColumn, EquityRow } from './types';

interface EquityEditorProps {
  shareCapitalData: { columns: EquityColumn[]; rows: EquityRow[] };
  otherEquityData: { columns: EquityColumn[]; rows: EquityRow[] };
  onSave: (updatedShareRows: EquityRow[], updatedOtherRows: EquityRow[]) => void;
  onClose: () => void;
}

const EditableEquityTable: React.FC<{
  title: string;
  columns: EquityColumn[];
  rows: EquityRow[];
  onValueChange: (rowIndex: number, colKey: string, value: string) => void;
}> = ({ title, columns, rows, onValueChange }) => {

  const handleInputChange = (rowIndex: number, colKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(rowIndex, colKey, event.target.value);
  };

  return (
    <Paper sx={{ mb: 3, p: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Table size="small" sx={{ "& td, & th": { border: "1px solid rgba(224,224,224,1)" } }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "action.hover" }}>
            <TableCell sx={{ fontWeight: "bold" }}>Particulars</TableCell>
            {columns.map((col) => (
              <TableCell key={col.key} align="right" sx={{ fontWeight: "bold" }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={row.key}>
              <TableCell>{row.label}</TableCell>
              {columns.map((col) => (
                <TableCell key={col.key} align="right">
                  <TextField
                    size="small"
                    variant="outlined"
                    value={row.values?.[col.key] ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(rowIndex, col.key, e)}
                    sx={{ width: '120px' }}
                    inputProps={{ style: { textAlign: 'right' } }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};


const EquityEditor: React.FC<EquityEditorProps> = ({ shareCapitalData, otherEquityData, onSave, onClose }) => {
  const [editableShareRows, setEditableShareRows] = useState(() => _.cloneDeep(shareCapitalData.rows));
  const [editableOtherRows, setEditableOtherRows] = useState(() => _.cloneDeep(otherEquityData.rows));

  const handleShareValueChange = (rowIndex: number, colKey: string, value: string) => {
    const newRows = _.cloneDeep(editableShareRows);
    const isNumeric = shareCapitalData.columns.find(c => c.key === colKey)?.key === 'amount';
    _.set(newRows, [rowIndex, 'values', colKey], isNumeric ? parseFloat(value) || 0 : value);
    setEditableShareRows(newRows);
  };

  const handleOtherValueChange = (rowIndex: number, colKey: string, value: string) => {
    const newRows = _.cloneDeep(editableOtherRows);
    _.set(newRows, [rowIndex, 'values', colKey], parseFloat(value) || 0);
    setEditableOtherRows(newRows);
  };

  const handleSave = () => {
    onSave(editableShareRows, editableOtherRows);
  };

  return (
    <Box sx={{ p: 5, backgroundColor: 'grey.100', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Edit Statement of Changes in Equity
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
        <EditableEquityTable
          title="A. Equity Share Capital"
          columns={shareCapitalData.columns}
          rows={editableShareRows}
          onValueChange={handleShareValueChange}
        />
        <EditableEquityTable
          title="B. Other Equity"
          columns={otherEquityData.columns}
          rows={editableOtherRows}
          onValueChange={handleOtherValueChange}
        />
      </Box>
    </Box>
  );
};

export default EquityEditor;