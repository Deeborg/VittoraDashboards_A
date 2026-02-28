import React from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";

/* ================= TYPES ================= */

interface KPIItem {
  title: string;
  value: string;
  subtitle?: string;
}

/* ================= MOCK DATA ================= */

const kpiData: KPIItem[] = [
  { title: "Net Debt", value: "₹1,450 Cr" },
  { title: "Total Borrowings", value: "₹2,450 Cr" },
  { title: "Cash & Equivalents", value: "₹1,000 Cr" },
  { title: "Weighted Avg Rate", value: "7.94%" },
];

/* ================= COMPONENT ================= */

const KPICards: React.FC = () => {
  return (
    <Grid container spacing={3}>
      {kpiData.map((item: KPIItem, index: number) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card sx={{ height: "87%" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {item.title}
              </Typography>

              <Typography variant="h6" fontWeight={600}>
                {item.value}
              </Typography>

              {item.subtitle && (
                <Typography variant="caption">
                  {item.subtitle}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default KPICards;