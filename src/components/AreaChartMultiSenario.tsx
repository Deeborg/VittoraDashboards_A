import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,ReferenceLine,
} from "recharts";
import dayjs from "dayjs";

type DataPoint = Record<string, any>;

interface Props {
  data: DataPoint[];
  xField: string;
  yFields: string[];
  colors?: string[];
  displayNames?: Record<string, string>; // key: internal field, value: display label
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

const AmDrillDownChart: React.FC<Props> = ({
  data,
  xField,
  yFields,
  colors = [],
  displayNames
}) => {
  const [isYearLevel, setIsYearLevel] = useState(false);

  const chartLevel = isYearLevel ? "year" : "month";
  const chartData = groupAndAggregate(data, xField, yFields, chartLevel);
  // console.log("chartData",chartData)

  const handleClick = () => {
    if (isYearLevel) setIsYearLevel(false);
  };

  const handleBack = () => setIsYearLevel(true);

  return (
    <div>
      {!isYearLevel && (
        <button onClick={handleBack} style={{ marginBottom: 12 }}>
          Year level
        </button>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} onClick={handleClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} />
          <YAxis tickFormatter={formatValue} />
          <Tooltip
            formatter={(value, name) => [formatValue(Number(value)), displayNames?.[name] || name]}
          />
          <Legend
            formatter={(value) => displayNames?.[value] || value}
          />


          {/* Add a vertical line for start of 2025 */}
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

          {yFields.map((field, index) => (
            <Area
              key={field}
              type="monotone"
              dataKey={field}
              stroke={colors[index] || "#000"}
              fill={colors[index] || "#000"}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>

      </ResponsiveContainer>
    </div>
  );
};

export default AmDrillDownChart;
