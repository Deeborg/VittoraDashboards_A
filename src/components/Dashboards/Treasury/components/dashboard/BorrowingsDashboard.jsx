import React, { useState } from 'react';
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
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { borrowingsData, maturityProfile } from '../../data/financialData';
import MaturityProfileChart from '../charts/MaturityProfileChart';

const BorrowingsDashboard = () => {
  const [viewType, setViewType] = useState('facilities');

  const maturityChartData = Object.entries(maturityProfile).map(([bucket, amount]) => ({
    bucket,
    amount: amount / 10000000,
    rawAmount: amount,
  }));

  const totalInterestMonthly = borrowingsData.reduce((sum, loan) => sum + loan.interestMonthly, 0);
  const totalInterestAnnual = borrowingsData.reduce((sum, loan) => sum + loan.interestAnnual, 0);
  const totalUtilized = borrowingsData.reduce((sum, loan) => sum + loan.utilizedAmount, 0);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h2">
            Borrowings & Credit Facilities
          </Typography>
          
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={(e, newView) => newView && setViewType(newView)}
            size="small"
          >
            <ToggleButton value="facilities">Facilities</ToggleButton>
            <ToggleButton value="maturity">Maturity Profile</ToggleButton>
            <ToggleButton value="interest">Interest Analysis</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {viewType === 'facilities' && (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Facility</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Bank/Lessor</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Utilized Amount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Interest Rate</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Monthly Interest</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Maturity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {borrowingsData.map((loan) => (
                  <TableRow key={loan.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {loan.facility}
                      <Typography variant="caption" sx={{ color: '#90a4ae', display: 'block' }}>
                        {loan.accountNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{loan.bank || loan.lessor}</TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 500 }}>
                        {formatCurrency(loan.utilizedAmount)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#90a4ae' }}>
                        Limit: {formatCurrency(loan.sanctionedLimit)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatPercentage(loan.interestRate)}
                        size="small"
                        sx={{
                          backgroundColor: loan.interestRate < 8 ? '#e8f5e9' : '#fff3e0',
                          color: loan.interestRate < 8 ? '#2e7d32' : '#ed6c02',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 500 }}>
                        {formatCurrency(loan.interestMonthly)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#90a4ae' }}>
                        Annual: {formatCurrency(loan.interestAnnual)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{loan.dueDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={loan.category}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {viewType === 'maturity' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Box sx={{ height: 300, mt: 2 }}>
                <MaturityProfileChart />
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper variant="outlined" sx={{ p: 2, height: 300, overflow: 'auto' }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  Maturity Schedule
                </Typography>
                {maturityChartData.map((item) => (
                  <Box key={item.bucket} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.bucket}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatCurrency(item.rawAmount)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#90a4ae' }}>
                      {(item.rawAmount / 2450000000 * 100).toFixed(1)}% of total borrowings
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        )}

        {viewType === 'interest' && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  Interest Cost Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#546e7a' }}>
                        Monthly Interest Outflow
                      </Typography>
                      <Typography variant="h2" sx={{ color: '#d32f2f' }}>
                        {formatCurrency(totalInterestMonthly)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#546e7a' }}>
                        Annual Interest Cost
                      </Typography>
                      <Typography variant="h2" sx={{ color: '#d32f2f' }}>
                        {formatCurrency(totalInterestAnnual)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  Weighted Average Interest Rate
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ color: '#1a237e' }}>
                    7.94%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#90a4ae' }}>
                    Calculated based on utilized amounts
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#546e7a' }}>
            <strong>Total Borrowings:</strong> {formatCurrency(totalUtilized)} | 
            <strong> Monthly Interest:</strong> {formatCurrency(totalInterestMonthly)} | 
            <strong> Weighted Average Rate:</strong> 7.94%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BorrowingsDashboard;