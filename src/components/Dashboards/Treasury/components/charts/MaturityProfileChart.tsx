import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";
import { maturityProfile } from "../../data/financialData";

// ✅ Define proper type for maturityProfile object
type MaturityProfileData = Record<string, number>;

// ✅ Define chart data structure
interface ChartDataItem {
  bucket: string;
  amount: number;
  rawAmount: number;
}

const MaturityProfileChart: React.FC = () => {
  const profileData = maturityProfile as MaturityProfileData;

  const chartData: ChartDataItem[] = Object.entries(profileData).map(
    ([bucket, amount]) => ({
      bucket,
      amount: amount / 10000000, // Convert to Cr
      rawAmount: amount,
    })
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

        <XAxis
          dataKey="bucket"
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 12 }}
        />

        <YAxis
          tickFormatter={(value: number) => `${value} Cr`}
          tick={{ fontSize: 12 }}
        />

        <Tooltip
          formatter={(value: number) => [
            formatCurrency(value * 10000000),
            "Amount Due",
          ]}
          labelFormatter={(label: string) => `Maturity: ${label}`}
        />

        <Bar
          dataKey="amount"
          fill="#1a237e"
          name="Amount Due"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MaturityProfileChart;