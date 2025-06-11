import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataPorts {
  data: Record<string, any>[];
  Xaxis: string;
  Yaxes: string[];
  xLabel: string;
  yLabel: string;
  onFilterChange1: (filters: any) => void;
}

const ColumnChart: React.FC<DataPorts> = ({
  data,
  Xaxis,
  Yaxes,
  xLabel,
  yLabel,
  onFilterChange1,
}) => {
  const chartDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const valid = data.every(
      (item) =>
        item.hasOwnProperty(Xaxis) && Yaxes.every((y) => item.hasOwnProperty(y))
    );
    if (!valid) {
      console.error("Invalid keys provided for categoryField or valueYFields");
      return;
    }

    const grouped = new Map<string, Record<string, any>>();
    data.forEach((row) => {
      const category = row[Xaxis];
      if (!grouped.has(category)) {
        grouped.set(category, { category });
      }
      Yaxes.forEach((yField) => {
        const value = parseFloat(row[yField]) || 0;
        grouped.get(category)![yField] =
          (grouped.get(category)![yField] || 0) + value;
      });
    });

    const chartData = Array.from(grouped.values());
    if (!chartDivRef.current) return;

    const root = am5.Root.new(chartDivRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    // Remove vertical layout and height settings
    // Create chart
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
      })
    );

    // Add cursor
    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);



    // Create axes
    const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
    xRenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15,
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, { labelText: "{category}" }),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
      })
    );

    // Add X-axis label (same as BarChart.tsx)
    chart.children.push(
      am5.Label.new(root, {
        text: xLabel,
        fontSize: 14,
        fontWeight: "bold",
        x: am5.p50,
        centerX: am5.p50,
        y: am5.percent(99),
      })
    );

    // Add Y-axis label (same as BarChart.tsx)
    chart.children.push(
      am5.Label.new(root, {
        text: yLabel,
        fontSize: 14,
        fontWeight: "bold",
        rotation: -90,
        y: am5.p50,
        centerY: am5.p50,
        x: am5.percent(-2),
      })
    );

    // Legend inside chart (not root)
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      })
    );
    //move legend to the top
    const legendIndex = root.container.children.indexOf(legend);
    root.container.children.removeValue(legend);
    root.container.children.insertIndex(0, legend);

    legend.data.setAll(chart.series.values);

    // Add Scrollbar
    const scrollbarX = am5xy.XYChartScrollbar.new(root, {
      orientation: "horizontal",
      height: 10,
      background: am5.Rectangle.new(root, {
        fill: am5.color(0xe0e0e0),
        fillOpacity: 0.6,
      }),
    });
    chart.set("scrollbarX", scrollbarX);

    // Series
    Yaxes.forEach((yField, index) => {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: yField,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: yField,
          categoryXField: "category",
          tooltip: am5.Tooltip.new(root, {
            labelText: `${yField}: {${yField}}`,
          }),
        })
      );

      series.columns.template.setAll({
        width: am5.percent(80 / Yaxes.length),
        tooltipY: 0,
        strokeOpacity: 0,
        fill: chart.get("colors")?.getIndex(index),
        stroke: chart.get("colors")?.getIndex(index),
      });

      series.columns.template.adapters.add("fill", (fill, target) => {
        return chart.get("colors")?.getIndex(index) ?? fill;
      });
      series.columns.template.adapters.add("stroke", (stroke, target) => {
        return chart.get("colors")?.getIndex(index) ?? stroke;
      });

      series.columns.template.events.on("click", (event) => {
        const dataItem = event.target.dataItem;
        if (dataItem && dataItem.dataContext) {
          const { category } = dataItem.dataContext as { category: string };
          onFilterChange1({ CategoryColumn: Xaxis, Category: category });
        }
      });

      series.data.setAll(chartData);
      legend.data.push(series);
    });

    xAxis.data.setAll(chartData);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, Xaxis, Yaxes, xLabel, yLabel]);

  return <div ref={chartDivRef} style={{ width: "100%", height: "83%" }} />;
};

export default ColumnChart;