// components/AmMultiAreaChart.tsx
import React, { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface AmMultiAreaChartProps {
  data: Record<string, any>[];
  xField: string;
  yFields: string[]; // Multiple Y keys
  colors?: string[];
}

const AmMultiAreaChart: React.FC<AmMultiAreaChartProps> = ({
  data,
  xField,
  yFields,
  colors = ["#64b5f6", "#0D41E1", "#432371"],
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = am5.Root.new(chartRef.current!);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: xField,
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );
    xAxis.get("renderer").labels.template.setAll({
      fontSize: 12,
      rotation: -45, // Optional: rotate for better fit
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 10,
    });    
    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // Create multiple stacked area series
    yFields.forEach((yField, index) => {
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: yField, // For tooltip
          xAxis,
          yAxis,
          valueYField: yField,
          categoryXField: xField,
          stroke: am5.color(colors[index % colors.length]),
          fill: am5.color(colors[index % colors.length]),
          stacked: true,
          tooltip: am5.Tooltip.new(root, {
            labelText: "{name}: {valueY}",
          }),
        })
      );

      series.fills.template.setAll({
        visible: true,
        fillOpacity: 0.8,
      });

      series.data.setAll(data);
    });

    chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));

    // Add an optional x-axis label if needed
    const xLabel = "Fiscal Year"; // Replace with a dynamic value if required
    chart.children.push(
      am5.Label.new(root, {
        text: xLabel,
        fontSize: 14,
        fontWeight: "bold",
        x: am5.p50,
        centerX: am5.p50,
        y: am5.percent(98), // Adjust vertical position as needed
      })
    );
    

    return () => {
      root.dispose();
    };
  }, [data, xField, yFields, colors]);

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        {yFields.map((label, index) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
            <div
              style={{
                width: '15px',
                height: '15px',
                backgroundColor: colors[index % colors.length] || 'gray',
                marginRight: '5px',
              }}
            ></div>
            <span style={{ color: "#000",fontSize:12 }}>{label}</span>
          </div>
        ))}
      </div>
      <div ref={chartRef} style={{ width: "100%", height: "148%" }} />
    </div>
  );
};

export default AmMultiAreaChart;