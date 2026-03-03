import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@mui/material';
import { formatCurrency } from '../../utils/formatters';
import { netDebtData } from '../../data/financialData';
import NetDebtMovementChart from '../charts/NetDebtMovementChart';

/* ================= TYPES ================= */

interface NetDebtComponent {
  label: string;
  amount: number;
  isTotal?: boolean;
  isSubtraction?: boolean;
  isFinal?: boolean;
}

const NetDebtSummary: React.FC = () => {
  const components: NetDebtComponent[] = [
    {
      label: 'Short-term Borrowings',
      amount: netDebtData.shortTermBorrowings,
    },
    {
      label: 'Long-term Borrowings',
      amount: netDebtData.longTermBorrowings,
    },
    {
      label: 'Total Borrowings',
      amount: netDebtData.totalBorrowings,
      isTotal: true,
    },
    {
      label: 'Cash & Bank Balances',
      amount: -netDebtData.cashBankBalances,
      isSubtraction: true,
    },
    {
      label: 'Fixed Deposits (Unencumbered)',
      amount: -(netDebtData.fixedDeposits - netDebtData.lienMarkedFDs),
      isSubtraction: true,
    },
    {
      label: 'Net Debt Position',
      amount: netDebtData.netDebt,
      isFinal: true,
    },
  ];

  return (
    <Grid container spacing={3}>
      {/* ================= LEFT COLUMN ================= */}
      <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
        <Card
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              p: 3,
            }}
          >
            <Typography variant="h4" sx={{ mb: 3 }}>
              Net Debt Position
            </Typography>

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                flex: 1,                 // takes remaining space
                minHeight: 0,              // allows flex child to shrink
                overflow: 'auto',          // scroll if needed
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Component</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Amount (₹)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {components.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell>
                        {row.isSubtraction ? `Less: ${row.label}` : row.label}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: (theme) =>
                            row.amount < 0
                              ? theme.palette.error.main
                              : theme.palette.text.primary,
                        }}
                      >
                        {formatCurrency(Math.abs(row.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                <strong>Note:</strong> Net Debt = Total Borrowings – (Cash & Bank Balances + Unencumbered Fixed Deposits)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* ================= RIGHT COLUMN ================= */}
      <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
        <Card
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              p: 3,
            }}
          >
            <Typography variant="h4" sx={{ mb: 3 }}>
              Net Debt Movement (Last 12 Months)
            </Typography>

            {/* Chart container – takes remaining space */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <NetDebtMovementChart />
            </Box>

            {/* Opening/Closing boxes – stays at bottom */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#546e7a' }}>
                    Opening Balance (Apr 2023)
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(850000000, true)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#546e7a' }}>
                    Closing Balance (Mar 2024)
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(1525000000, true)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default NetDebtSummary;