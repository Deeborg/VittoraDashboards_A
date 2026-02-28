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
  Chip,
  Grid,
} from '@mui/material';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { investmentsData } from '../../data/financialData';

/* ================= TYPES ================= */

interface Investment {
  id: number;
  instrument: string;
  folioNumber: string;
  issuer: string;
  amount: number;
  yield: number;
  maturity: string;
  category: string;
  creditRating: string;
}

const InvestmentsDashboard: React.FC = () => {
  const totalInvestments = investmentsData.reduce(
    (sum: number, inv: Investment) => sum + inv.amount,
    0
  );

  const avgYield =
    investmentsData.reduce(
      (sum: number, inv: Investment) => sum + inv.yield,
      0
    ) / investmentsData.length;

  const getRatingColor = (rating: string): string => {
    const colors: Record<string, string> = {
      AAA: '#2e7d32',
      'AA+': '#4caf50',
      AA: '#8bc34a',
      Sovereign: '#2196f3',
    };

    return colors[rating] || '#9e9e9e';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Investment Portfolio
        </Typography>

        {/* ================= SUMMARY CARDS ================= */}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                Total Investment Value
              </Typography>
              <Typography variant="h4">
                {formatCurrency(totalInvestments, true)}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                Average Yield
              </Typography>
              <Typography variant="h4" sx={{ color: '#2e7d32' }}>
                {formatPercentage(avgYield)}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                Liquid Investments
              </Typography>
              <Typography variant="h4">42%</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ================= TABLE ================= */}

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid #e0e0e0' }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Instrument</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Issuer</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Amount
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Yield
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Maturity
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  Credit Rating
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {investmentsData.map((investment: Investment) => (
                <TableRow key={investment.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {investment.instrument}
                    <Typography
                      variant="caption"
                      sx={{ color: '#90a4ae', display: 'block' }}
                    >
                      {investment.folioNumber}
                    </Typography>
                  </TableCell>

                  <TableCell>{investment.issuer}</TableCell>

                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 500 }}>
                      {formatCurrency(investment.amount)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: '#90a4ae' }}
                    >
                      {(
                        (investment.amount / totalInvestments) *
                        100
                      ).toFixed(1)}
                      % of portfolio
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Chip
                      label={formatPercentage(investment.yield)}
                      size="small"
                      sx={{
                        backgroundColor:
                          investment.yield > 7.5
                            ? '#e8f5e9'
                            : '#e3f2fd',
                        color:
                          investment.yield > 7.5
                            ? '#2e7d32'
                            : '#1565c0',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    {investment.maturity}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={investment.category}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={investment.creditRating}
                      size="small"
                      sx={{
                        backgroundColor:
                          getRatingColor(
                            investment.creditRating
                          ) + '20',
                        color: getRatingColor(
                          investment.creditRating
                        ),
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ================= FOOTER ================= */}

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            sx={{ color: '#546e7a' }}
          >
            <strong>Portfolio Composition:</strong> Liquid
            (39.2%) • Debt (18.3%) • ICD (29.3%) • Government
            (13.2%) |
            <strong> Next Maturity:</strong> Treasury Bill (Jun
            2024) |
            <strong> Credit Quality:</strong> 100% Investment
            Grade
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvestmentsDashboard;