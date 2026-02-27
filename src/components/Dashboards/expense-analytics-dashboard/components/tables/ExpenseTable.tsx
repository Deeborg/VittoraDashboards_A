import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Box,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { ExpenseRecord } from '../../types';
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters';

interface ExpenseTableProps {
  data: ExpenseRecord[];
}

type Order = 'asc' | 'desc';
type OrderBy = keyof ExpenseRecord;

const ExpenseTable: React.FC<ExpenseTableProps> = ({ data }) => {
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      if (orderBy === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (bValue < aValue) {
        return order === 'desc' ? -1 : 1;
      }
      if (bValue > aValue) {
        return order === 'desc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, order, orderBy]);

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return '#059669';
      case 'Pending':
        return '#d97706';
      case 'Rejected':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {['Date', 'Document No', 'Category', 'Entity', 'Amount', 'Status', 'Actions'].map((col) => (
                <TableCell key={col} sx={{ fontWeight: 600 }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell>{formatDate(row.date)}</TableCell>
                <TableCell>{row.documentNo}</TableCell>
                <TableCell>
                  <Box>
                    <Box sx={{ fontWeight: 500 }}>{row.category}</Box>
                    <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      {row.subCategory}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{row.entity}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(row.amount)}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{
                      backgroundColor: `${getStatusColor(row.status)}20`,
                      color: getStatusColor(row.status),
                      fontWeight: 500,
                      fontSize: '0.75rem',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
};

export default ExpenseTable;