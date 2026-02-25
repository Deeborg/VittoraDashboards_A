import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { CalculatedRatio } from './types';

// const formatPercentageValue = (value: string) => {
//   if (value === 'N/A') return value;
//   return `${value}%`;
// };

const isPercentageRatio = (measure: string) => {
  const lowerMeasure = measure.toLowerCase();
  // Only these specific ratios should be displayed as percentages based on the reference table
  const percentageRatios = [
    'capital gearing ratio',  // 25% - 50% in reference table
    'gross profit margin',    // 50-70 in reference table (but typically shown as %)
    'net profit margin',      // 10-20 in reference table (but typically shown as %)
    'operating profit margin', // >15 in reference table (but typically shown as %)
    'pretax margin',          // >20 in reference table (but typically shown as %)
    'return on capital employed' // >20 in reference table (but typically shown as %)
  ];
  
  return percentageRatios.some(ratio => lowerMeasure.includes(ratio));
};

const RatiosTableContent: React.FC<{
  ratios: CalculatedRatio[];
  periodHeaders: { currentPeriod: string; previousPeriod: string };
}> = ({ ratios, periodHeaders }) => {
  return (
    <Paper sx={{ my: 2, overflow: 'hidden', boxShadow: 'none' }}>
      <TableContainer>
        <Table size="small" sx={{ '& td, & th': { border: '1px solid rgba(224, 224, 224, 1)' } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>S.No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ratio/Measure</TableCell>
              {/* --- Methodology Header Removed --- */}
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>As at {periodHeaders.currentPeriod}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>As at {periodHeaders.previousPeriod}</TableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {ratios.map((ratio) => (
              <TableRow key={ratio.sNo}>
                <TableCell>{ratio.sNo}</TableCell>
                <TableCell>{ratio.ratioMeasure}</TableCell>
                {/* --- Methodology Cell Removed --- */}
                <TableCell align="center">
                  {typeof ratio.valueCurrent === 'string'
                    ? ratio.valueCurrent
                    : isPercentageRatio(ratio.ratioMeasure)
                      ? `${(ratio.valueCurrent * 100).toFixed(2)}%`
                      : ratio.valueCurrent.toFixed(2)}
                </TableCell>
                <TableCell align="center">
                  {typeof ratio.valuePrevious === 'string'
                    ? ratio.valuePrevious
                    : isPercentageRatio(ratio.ratioMeasure)
                      ? `${(ratio.valuePrevious * 100).toFixed(2)}%`
                      : ratio.valuePrevious.toFixed(2)}
                </TableCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};


interface RatiosModalProps {
  open: boolean;
  onClose: () => void;
  ratios: CalculatedRatio[];
  periodHeaders: { currentPeriod: string; previousPeriod: string };
}

export const RatiosModal: React.FC<RatiosModalProps> = ({ open, onClose, ratios, periodHeaders }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Important Ratios</DialogTitle>
      <DialogContent>
        <RatiosTableContent ratios={ratios} periodHeaders={periodHeaders} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};