import React, { useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import dayjs from "dayjs";

type DataPoint = Record<string, any>;

interface Props {
  data: DataPoint[];
  xField: string;
  yFields: string[]; // [simulatedRevenueField, baseSalesField]
  colors?: string[];
  displayNames?: Record<string, string>;
}

const formatValue = (val: number): string => {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + "B";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
  if (val >= 1_000) return (val / 1_000).toFixed(1) + "K";
  return val.toString();
};

const groupAndAggregate = (
  data: DataPoint[],
  xField: string,
  yFields: string[],
  level: "year" | "month"
): DataPoint[] => {
  const groupMap: Record<string, DataPoint> = {};

  data.forEach((row) => {
    const date = dayjs(row[xField]);
    if (!date.isValid()) return;

    const key = level === "year" ? date.format("YYYY") : date.format("YYYY-MM");

    if (!groupMap[key]) {
      groupMap[key] = { [xField]: key };
      yFields.forEach((field) => {
        groupMap[key][field] = 0;
      });
    }

    yFields.forEach((field) => {
      const val = parseFloat(row[field]) || 0;
      groupMap[key][field] += val;
    });
  });

  return Object.values(groupMap).sort((a, b) =>
    a[xField].localeCompare(b[xField])
  );
};

const prepareDifferenceAreaData = (
  data: DataPoint[],
  xField: string,
  simKey: string,
  salesKey: string
): DataPoint[] => {
  return data.map((row) => {
    const sim = Number(row[simKey]) || 0;
    const sales = Number(row[salesKey]) || 0;
    const lower = Math.min(sim, sales);

    return {
      ...row,
      lower,
      Revenue_Increase: sim > sales ? sim - sales : 0,
      Revenue_Reduce: sim < sales ? sales - sim : 0,
      Simulated_Sales: sim > sales ? sales : undefined,
      Simulated_Sales_: sim < sales ? sales : undefined,
      [simKey]: sim,
    };
  });
};




const AmDrillDownChart: React.FC<Props> = ({
  data,
  xField,
  yFields,
  colors = ["#00ff00", "#1509eb"],
  displayNames,
}) => {
  const [isYearLevel, setIsYearLevel] = useState(false);

  const chartLevel = isYearLevel ? "year" : "month";
  const aggregated = groupAndAggregate(data, xField, yFields, chartLevel);
  const chartData = prepareDifferenceAreaData(aggregated, xField, yFields[0], yFields[1]);

  const handleClick = () => {
    if (isYearLevel) setIsYearLevel(false);
  };

  const handleBack = () => setIsYearLevel(true);

  return (
    <div style={{ border: "2px solid #222", padding: 16, borderRadius: 8 }}>
      {!isYearLevel && (
        <button
          onClick={handleBack}
          style={{
            marginBottom: 12,
            background: "#28a745",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
          }}
        >
          Year level
        </button>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} onClick={handleClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} />
          <YAxis tickFormatter={formatValue} />
          <Tooltip
            formatter={(value, name) => [formatValue(Number(value)), displayNames?.[name] || name]}
          />
          <Legend formatter={(value) => displayNames?.[value] || value} />

          <ReferenceLine
            x={isYearLevel ? "2025" : "2025-01"}
            stroke="red"
            strokeDasharray="10 2"
            label={{
              position: "top",
              value: "2025",
              fill: "red",
              fontSize: 20,
            }}
          />

          {/* Base line (lower of the two) */}
          <Area
            type="monotone"
            dataKey="lower"
            stackId="base"
            stroke="none"
            fill="transparent"
          />

          {/* Green area when Simulated > Sales */}
          <Area
            type="monotone"
            dataKey="Revenue_Increase"
            stackId="base"
            stroke="none"
            fill="#1df205"
            fillOpacity={0.7}
          />

          {/* Red area when Sales > Simulated */}
          <Area
            type="monotone"
            dataKey="Revenue_Reduce"
            stackId="base"
            stroke="none"
            fill="#cf1729"
            fillOpacity={0.7}
          />

          {/* Sales Value line */}
          {/* Green line when Simulated > Sales */}
          
          <Line
            type="monotone"
            dataKey={yFields[0]}
            stroke={colors[0]}
            strokeWidth={0}
            dot={{ r: 2 }}
          />

          <Line
            type="monotone"
            dataKey={yFields[1]}
            stroke={colors[1]}
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AmDrillDownChart;
