import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
} from '@mui/icons-material';
import { DrillDownData } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface DrillDownTableProps {
  data: DrillDownData[];
  onCostCenterClick?: (costCenter: string) => void;
  onGlAccountClick?: (glAccount: string) => void;
  selectedLevel: 'costCenter' | 'glAccount' | 'document';
}

const Row: React.FC<{ 
  row: DrillDownData; 
  level: number; 
  onGlAccountClick?: (glAccount: string) => void; 
  onCostCenterClick?: (costCenter: string) => void; 
  selectedLevel: string 
}> = ({ 
  row, 
  level, 
  onGlAccountClick,
  onCostCenterClick,
  selectedLevel 
}) => {
  const [open, setOpen] = useState(false);
  const hasChildren = row.children && row.children.length > 0;

  const handleClick = () => {
    if (row.level === 'costCenter' && onCostCenterClick && row.costCenter) {
      onCostCenterClick(row.costCenter);
    } else if (row.level === 'glAccount' && onGlAccountClick && row.glAccount) {
      onGlAccountClick(row.glAccount);
    } else if (hasChildren) {
      setOpen(!open);
    }
  };

  const getStatusColor = (variance: number) => {
    if (variance > 10) return '#fee2e2';
    if (variance > 5) return '#fef3c7';
    if (variance > 0) return '#fef9e7';
    if (variance < -5) return '#d1fae5';
    return '#f1f5f9';
  };

  const getStatusTextColor = (variance: number) => {
    if (variance > 10) return '#dc2626';
    if (variance > 5) return '#d97706';
    if (variance > 0) return '#b45309';
    if (variance < -5) return '#059669';
    return '#475569';
  };

  return (
    <>
      <TableRow 
        hover 
        onClick={handleClick}
        sx={{ 
          cursor: 'pointer',
          backgroundColor: level === 0 ? '#f8fafc' : 'transparent',
          '&:hover': {
            backgroundColor: '#f1f5f9',
          }
        }}
      >
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: level * 4 }}>
            {hasChildren && (
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(!open);
                }} 
                sx={{ mr: 1 }}
              >
                {open ? <CollapseIcon /> : <ExpandIcon />}
              </IconButton>
            )}
            {!hasChildren && <Box sx={{ width: 40 }} />}
            <Typography variant="body2" fontWeight={level === 0 ? 600 : 400}>
              {row.costCenter || row.glAccount || row.documentNo}
            </Typography>
            {row.glDescription && (
              <Typography variant="caption" sx={{ ml: 1, color: '#64748b' }}>
                - {row.glDescription}
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
        <TableCell align="right">{formatCurrency(row.budget)}</TableCell>
        <TableCell align="right">
          <Chip
            label={formatPercentage(row.variance)}
            size="small"
            sx={{
              backgroundColor: getStatusColor(row.variance),
              color: getStatusTextColor(row.variance),
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </TableCell>
      </TableRow>
      {hasChildren && (
        <TableRow>
          <TableCell colSpan={4} sx={{ p: 0 }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ py: 1 }}>
                {row.children!.map((child, index) => (
                  <Row 
                    key={index} 
                    row={child} 
                    level={level + 1} 
                    onGlAccountClick={onGlAccountClick}
                    onCostCenterClick={onCostCenterClick}
                    selectedLevel={selectedLevel}
                  />
                ))}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const DrillDownTable: React.FC<DrillDownTableProps> = ({ 
  data, 
  onCostCenterClick, 
  onGlAccountClick,
  selectedLevel 
}) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600 }}>Level / Account</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Budget</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Variance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <Row 
                key={index} 
                row={row} 
                level={0} 
                onGlAccountClick={onGlAccountClick}
                onCostCenterClick={onCostCenterClick}
                selectedLevel={selectedLevel}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DrillDownTable;