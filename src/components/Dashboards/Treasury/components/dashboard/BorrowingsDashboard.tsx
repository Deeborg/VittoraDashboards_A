import React, { useState, useMemo } from "react";
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

const bucketOrder = [
  "Within 3 months",
  "3-6 months",
  "6-12 months",
  "1-3 years",
  "3-5 years",
  "Beyond 5 years",
];

const BorrowingsDashboard: React.FC = () => {
  const [viewType, setViewType] = useState<ViewType>("facilities");

  /* ================= CALCULATIONS ================= */

  const totalInterestMonthly = useMemo(
    () =>
      borrowingsData.reduce(
        (sum, loan) => sum + loan.interestMonthly,
        0
      ),
    []
  );

  const totalInterestAnnual = useMemo(
    () =>
      borrowingsData.reduce(
        (sum, loan) => sum + loan.interestAnnual,
        0
      ),
    []
  );

  const totalUtilized = useMemo(
    () =>
      borrowingsData.reduce(
        (sum, loan) => sum + loan.utilizedAmount,
        0
      ),
    []
  );

  const weightedAverageRate = useMemo(() => {
    const totalWeighted = borrowingsData.reduce(
      (sum, loan) =>
        sum + loan.utilizedAmount * loan.interestRate,
      0
    );

    return totalWeighted / totalUtilized;
  }, [totalUtilized]);

  const maturitySchedule = bucketOrder.map((bucket) => ({
    bucket,
    amount: maturityProfile[bucket] || 0,
  }));

  /* ================= RETURN ================= */

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>

        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight={600}>
            Borrowings & Credit Facilities
          </Typography>

          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={(_, newView) =>
              newView && setViewType(newView)
            }
            size="small"
          >
            <ToggleButton value="facilities">
              Facilities
            </ToggleButton>
            <ToggleButton value="maturity">
              Maturity Profile
            </ToggleButton>
            <ToggleButton value="interest">
              Interest Analysis
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* ================= FACILITIES ================= */}
        {viewType === "facilities" && (
<TableContainer
  component={Paper}
  elevation={0}
  sx={{
    borderRadius: 2,
    border: "1px solid #e5e7eb",
    
  }}
>
  <Table>
    <TableHead>
      <TableRow sx={{ backgroundColor: "#f8fafc" }}>
        <TableCell sx={{ fontWeight: 600, color: "#111827" }}>
          Facility
        </TableCell>
        <TableCell sx={{ fontWeight: 600, color: "#111827" }}>
          Bank/Lessor
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 600, color: "#111827" }}>
          Utilized
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 600, color: "#111827" }}>
          Rate
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 600, color: "#111827" }}>
          Monthly Interest
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 600, color: "#111827" }}>
          Maturity
        </TableCell>
        <TableCell sx={{ fontWeight: 600, color: "#111827" }}>
          Category
        </TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {borrowingsData.map((loan) => (
        <TableRow
          key={loan.id}
          hover
          sx={{
            "&:hover": { backgroundColor: "#f1f5f9" },
          }}
        >
          <TableCell sx={{ color: "#1f2937" }}>
            {loan.facility}
            <Typography
              variant="caption"
              display="block"
              sx={{ color: "#6b7280" }}
            >
              {loan.accountNumber}
            </Typography>
          </TableCell>

          <TableCell sx={{ color: "#1f2937" }}>
            {loan.bank ?? loan.lessor}
          </TableCell>

          <TableCell align="right" sx={{ color: "#1f2937" }}>
            {formatCurrency(loan.utilizedAmount)}
          </TableCell>

          <TableCell align="right">
            <Chip
              label={formatPercentage(loan.interestRate)}
              size="small"
              sx={{
                backgroundColor:
                  loan.interestRate < 8 ? "#e6f4ea" : "#fff4e5",
                color:
                  loan.interestRate < 8 ? "#1b5e20" : "#e65100",
                fontWeight: 500,
              }}
            />
          </TableCell>

          <TableCell align="right" sx={{ color: "#1f2937" }}>
            {formatCurrency(loan.interestMonthly)}
          </TableCell>

          <TableCell align="right" sx={{ color: "#1f2937" }}>
            {loan.dueDate}
          </TableCell>

          <TableCell>
            <Chip
              label={loan.category}
              size="small"
              variant="outlined"
              sx={{
                borderColor: "#cbd5e1",
                color: "#334155",
              }}
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
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ mt: 2 }}>
                <MaturityProfileChart />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                }}
              >
                <Typography variant="h6" mb={3}>
                  Maturity Schedule
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  {maturitySchedule.map((item) => (
                    <Box key={item.bucket}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {item.bucket}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                      >
                        {formatCurrency(item.amount)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* ================= INTEREST ================= */}
        {viewType === "interest" && (
          <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                variant="outlined"
                sx={{ p: 3, borderRadius: 3 }}
              >
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
              <Paper
                variant="outlined"
                sx={{ p: 3, borderRadius: 3 }}
              >
                <Typography variant="h6" mb={2}>
                  Weighted Average Interest Rate
                </Typography>

                <Typography variant="h4" color="#1a237e">
                  {formatPercentage(weightedAverageRate)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* FOOTER */}
        <Box mt={4}>
          <Typography variant="body2" color="text.secondary">
            <strong>Total Borrowings:</strong>{" "}
            {formatCurrency(totalUtilized)} |{" "}
            <strong>Monthly Interest:</strong>{" "}
            {formatCurrency(totalInterestMonthly)} |{" "}
            <strong>Weighted Average Rate:</strong>{" "}
            {formatPercentage(weightedAverageRate)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BorrowingsDashboard;