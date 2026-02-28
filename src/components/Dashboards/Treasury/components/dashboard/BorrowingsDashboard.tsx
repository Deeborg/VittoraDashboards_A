import React, { useState } from "react";
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
} from "@mui/material";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import { borrowingsData, maturityProfile } from "../../data/financialData";
import MaturityProfileChart from "../charts/MaturityProfileChart";

type ViewType = "facilities" | "maturity" | "interest";

interface BorrowingItem {
  id: number;
  facility: string;
  accountNumber: string;
  bank?: string;
  lessor?: string;
  sanctionedLimit: number;
  utilizedAmount: number;
  interestRate: number;
  tenure: string;
  dueDate: string;
  interestMonthly: number;
  interestAnnual: number;
  category: string;
}

const BorrowingsDashboard: React.FC = () => {
  const [viewType, setViewType] = useState<ViewType>("facilities");

  const totalInterestMonthly = borrowingsData.reduce(
    (sum: number, loan: BorrowingItem) => sum + loan.interestMonthly,
    0
  );

  const totalInterestAnnual = borrowingsData.reduce(
    (sum: number, loan: BorrowingItem) => sum + loan.interestAnnual,
    0
  );

  const totalUtilized = borrowingsData.reduce(
    (sum: number, loan: BorrowingItem) => sum + loan.utilizedAmount,
    0
  );

  const maturityChartData = Object.entries(
    maturityProfile as Record<string, number>
  ).map(([bucket, amount]) => ({
    bucket,
    rawAmount: amount,
  }));

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" fontWeight={600}>
            Borrowings & Credit Facilities
          </Typography>

          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={(_, newView: ViewType | null) =>
              newView && setViewType(newView)
            }
            size="small"
          >
            <ToggleButton value="facilities">Facilities</ToggleButton>
            <ToggleButton value="maturity">Maturity Profile</ToggleButton>
            <ToggleButton value="interest">Interest Analysis</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* ================= FACILITIES ================= */}
        {viewType === "facilities" && (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: "1px solid #e0e0e0" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f7fa" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Facility</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Bank/Lessor
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Utilized Amount
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Interest Rate
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Monthly Interest
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Maturity
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {borrowingsData.map((loan: BorrowingItem) => (
                  <TableRow key={loan.id} hover>
                    <TableCell>
                      {loan.facility}
                      <Typography
                        variant="caption"
                        sx={{ display: "block", color: "#90a4ae" }}
                      >
                        {loan.accountNumber}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {loan.bank ?? loan.lessor}
                    </TableCell>

                    <TableCell align="right">
                      <Typography fontWeight={500}>
                        {formatCurrency(loan.utilizedAmount)}
                      </Typography>
                      <Typography variant="caption" color="#90a4ae">
                        Limit: {formatCurrency(loan.sanctionedLimit)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Chip
                        label={formatPercentage(loan.interestRate)}
                        size="small"
                        sx={{
                          backgroundColor:
                            loan.interestRate < 8
                              ? "#e8f5e9"
                              : "#fff3e0",
                          color:
                            loan.interestRate < 8
                              ? "#2e7d32"
                              : "#ed6c02",
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      {formatCurrency(loan.interestMonthly)}
                    </TableCell>

                    <TableCell align="right">
                      {loan.dueDate}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={loan.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* ================= MATURITY ================= */}
        {viewType === "maturity" && (
        <Grid container spacing={3}>
  <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ height: 300, mt: 2 }}>
                <MaturityProfileChart />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper variant="outlined" sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" mb={2}>
                  Maturity Schedule
                </Typography>

                {maturityChartData.map((item) => (
                  <Box key={item.bucket} mb={2}>
                    <Typography fontWeight={500}>
                      {item.bucket}
                    </Typography>
                    <Typography fontWeight={600}>
                      {formatCurrency(item.rawAmount)}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* ================= INTEREST ================= */}
        {viewType === "interest" && (
          <Grid container spacing={3}>
  <Grid size={{ xs: 12, md: 7 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" mb={2}>
                  Interest Cost Summary
                </Typography>

                <Typography color="#d32f2f">
                  Monthly: {formatCurrency(totalInterestMonthly)}
                </Typography>

                <Typography color="#d32f2f">
                  Annual: {formatCurrency(totalInterestAnnual)}
                </Typography>
              </Paper>
            </Grid>

           <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" mb={2}>
                  Weighted Average Interest Rate
                </Typography>

                <Typography variant="h4" color="#1a237e">
                  7.94%
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Footer */}
        <Box mt={2}>
          <Typography variant="body2" color="#546e7a">
            <strong>Total Borrowings:</strong>{" "}
            {formatCurrency(totalUtilized)} |{" "}
            <strong> Monthly Interest:</strong>{" "}
            {formatCurrency(totalInterestMonthly)} |{" "}
            <strong> Weighted Average Rate:</strong> 7.94%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BorrowingsDashboard;