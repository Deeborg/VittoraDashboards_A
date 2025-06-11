import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  Brush,
} from 'recharts';

import { ReferenceLine } from 'recharts';

interface CashFlowData {
  Date?: Date | string | number;
  'Opening Balance'?: number;
  Receivables?: number;
  Payables?: number;
  Financing?: number;
  Investments?: number;
  'Closing balance'?: number;
  'Min Balance'?: number;
  'Max Balance'?: number;
  Invest?: number;
  Borrow?: number;
}

interface CashFlowForecastChartProps {
  data: CashFlowData[];
}

const CashFlowForecastChart: React.FC<CashFlowForecastChartProps> = ({ data }) => {
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    'Sum of Opening Balance': true,
    'Sum of Receivables': true,
    'Sum of Payables': true,
    'Sum of Financing': true,
    'Sum of Investments': true,
    'Sum of Borrow': true,
    'Sum of Closing Balance': true,
    'Sum of Min Balance': true,
    'Sum of Max Balance': true,
    'Sum of Invest': true,
  });

  const handleLegendClick = (legendItem: any) => {
    const { value } = legendItem;
    setVisibleLines((prevVisibleLines) => ({
      ...prevVisibleLines,
      [value]: !prevVisibleLines[value],
    }));
  };

  const formatYAxis = (value: number) => {
    return (value / 1000000).toFixed(1) + 'M';
  };

  const yAxisTicks = [0, 500000, 1000000, 1500000, 2000000, 2500000, 3000000];


  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart
        data={data}
        margin={{ top: 70, right: 30, left: 50, bottom: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="Date"
          tickFormatter={(date) => {
            try {
              const d = new Date(date);
              return `${d.toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric',
              })}`;
            } catch (error) {
              return String(date);
            }
          }}
        >
          <Label
            value="Year"
            offset={50}
            position="bottom"
            style={{ textAnchor: 'middle',fontSize: '14px', color: '#000', fontWeight: 'bold' }}
          />
        </XAxis>
        <YAxis tickFormatter={formatYAxis} ticks={yAxisTicks}>
          <Label
            value="Amount"
            offset={-10}
            position="insideLeft"
            angle={-90}
            dx={-20}
            style={{ textAnchor: 'middle',fontSize: '14px', color: '#000', fontWeight: 'bold'}}
          />
        </YAxis>
        <Tooltip
          labelFormatter={(value) => {
            try {
              const d = new Date(value);
              return `Date: ${d.toLocaleDateString()}`;
            } catch (error) {
              return `Date: ${value}`;
            }
          }}
        />
        <Legend
          layout="horizontal"
          align="center"
          verticalAlign="top"
          wrapperStyle={{ top: 13 }}
          onClick={handleLegendClick}
        />
        {/* Conditional rendering of lines based on legend selection */}
        <Line
          type="monotone"
          dataKey="Opening Balance"
          stroke="#8884d8"
          name="Sum of Opening Balance"
          dot={false}
          hide={!visibleLines['Sum of Opening Balance']}
        />
        <Line
          type="monotone"
          dataKey="Receivables"
          stroke="#82ca9d"
          name="Sum of Receivables"
          dot={false}
          hide={!visibleLines['Sum of Receivables']}
        />
        <Line
          type="monotone"
          dataKey="Payables"
          stroke="#ffc658"
          name="Sum of Payables"
          dot={false}
          hide={!visibleLines['Sum of Payables']}
        />
        <Line
          type="monotone"
          dataKey="Financing"
          stroke="#d273ff"
          name="Sum of Financing"
          dot={false}
          hide={!visibleLines['Sum of Financing']}
        />
        <Line
          type="monotone"
          dataKey="Investments"
          stroke="#a4de6c"
          name="Sum of Investments"
          dot={false}
          hide={!visibleLines['Sum of Investments']}
        />
        <Line
          type="monotone"
          dataKey="Borrow"
          stroke="#0088fe"
          name="Sum of Borrow"
          dot={false}
          hide={!visibleLines['Sum of Borrow']}
        />
        {data.some((item: CashFlowData) => item['Closing balance']) && (
          <Line
            type="monotone"
            dataKey="Closing balance"
            stroke="#ff7300"
            name="Sum of Closing Balance"
            dot={false}
            hide={!visibleLines['Sum of Closing Balance']}
          />
        )}
        <Line
          type="monotone"
          dataKey="Min Balance"
          stroke="#c62828"
          name="Sum of Min Balance"
          dot={false}
          hide={!visibleLines['Sum of Min Balance']}
        />
        <Line
          type="monotone"
          dataKey="Max Balance"
          stroke="#2e7d32"
          name="Sum of Max Balance"
          dot={false}
          hide={!visibleLines['Sum of Max Balance']}
        />
        {data.some((item: CashFlowData) => item['Invest']) && (
          <Line
            type="monotone"
            dataKey="Invest"
            stroke="#512da8"
            name="Sum of Invest"
            dot={false}
            hide={!visibleLines['Sum of Invest']}
          />
        )}
        {data.length > 10 && (
          <Brush
            dataKey="Date"
            height={30}
            stroke="#8884d8"
            tickFormatter={(date) => {
              try {
                const d = new Date(date);
                return `${d.toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}`;
              } catch (error) {
                return String(date);
              }
            }}
          />
        )}
        <ReferenceLine
          x={new Date('01-01-2025').toISOString().split('T')[0]}
          stroke="#d32f2f"
          strokeDasharray="4 4"
          label={{
            value: "Forecast Period",
            position: "top",
            fill: "#d32f2f",
            fontWeight: "bold",
            fontSize: 13,
          }}
        />        
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CashFlowForecastChart;
