import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";
import { netDebtMovement } from "../../data/financialData";

// ✅ Define data structure for financialData
interface NetDebtItem {
  month: string;
  closingBalance: () => number;
}

// ✅ Chart formatted structure
interface ChartDataItem {
  month: string;
  amount: number;
  rawAmount: number;
}

const NetDebtMovementChart: React.FC = () => {
  const movementData = netDebtMovement as NetDebtItem[];

  const chartData: ChartDataItem[] = movementData.map((item) => {
    const balance = item.closingBalance();

    return {
      month: item.month,
      amount: balance / 10000000, // Convert to Cr
      rawAmount: balance,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />

        <YAxis
          tickFormatter={(value: number) => `${value} Cr`}
          tick={{ fontSize: 12 }}
        />

        <Tooltip
          formatter={(value: number) => [
            formatCurrency(value * 10000000),
            "Net Debt",
          ]}
          labelFormatter={(label: string) => `Month: ${label}`}
        />

        <Line
          type="monotone"
          dataKey="amount"
          stroke="#1a237e"
          strokeWidth={2}
          dot={{ stroke: "#1a237e", strokeWidth: 2, r: 3 }}
          activeDot={{ r: 6 }}
          name="Net Debt"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default NetDebtMovementChart;