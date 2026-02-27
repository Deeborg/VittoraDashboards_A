import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { ComparisonData } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface ComparisonTableProps {
  data: ComparisonData[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Factory</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total Expense</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Raw Material</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Employee</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Finance</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Other</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Depreciation</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Variance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.factory} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.factory}</TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell align="right">{formatCurrency(row.totalExpense)}</TableCell>
                <TableCell align="right">{formatCurrency(row.rawMaterial)}</TableCell>
                <TableCell align="right">{formatCurrency(row.employee)}</TableCell>
                <TableCell align="right">{formatCurrency(row.finance)}</TableCell>
                <TableCell align="right">{formatCurrency(row.other)}</TableCell>
                <TableCell align="right">{formatCurrency(row.depreciation)}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                    {row.variance > 0 ? (
                      <TrendingUp sx={{ color: '#dc2626', fontSize: 16 }} />
                    ) : (
                      <TrendingDown sx={{ color: '#059669', fontSize: 16 }} />
                    )}
                    <Chip
                      label={formatPercentage(row.variance)}
                      size="small"
                      sx={{
                        backgroundColor: row.variance > 0 ? '#fee2e2' : '#d1fae5',
                        color: row.variance > 0 ? '#dc2626' : '#059669',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ComparisonTable;