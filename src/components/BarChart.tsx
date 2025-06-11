import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataPorts {
  data: Record<string, any>[];
  Xaxis: string; // Field for categories (X-axis)
  Yaxis: string; // Field for values to sum (Y-axis)
  xLabel: string; // Label for X-axis
  yLabel: string; // Label for Y-axis
  onFilterChange1: (filters: any) => void;
}

const ColumnChart: React.FC<DataPorts> = ({ data, Xaxis, Yaxis,  xLabel, yLabel,onFilterChange1, }) => {
  const chartDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Validate data structure
    if (!data.every((item) => item.hasOwnProperty(Xaxis) && item.hasOwnProperty(Yaxis))) {
      console.error("Invalid keys provided for categoryField or valueYField");
      return;
    }

    // Calculate the sum of `b` per `a`
    const sumData = new Map<string, number>();

    data.forEach((row) => {
      const category = row[Xaxis];
      const value = parseFloat(row[Yaxis]) || 0;

      if (!sumData.has(category)) {
        sumData.set(category, 0);
      }

      sumData.set(category, sumData.get(category)! + value);
    });

    // Transform Map to chart-friendly format
    const chartData = Array.from(sumData.entries()).map(([category, value]) => ({
      category,
      value,
    }));

    if (!chartDivRef.current) return;

    // Create root element
    const root = am5.Root.new(chartDivRef.current);

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

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

    // Add X-axis label
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

    // Add Y-axis label
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

    // Create series
    const seriesName = `Sum of ${Yaxis} by ${Xaxis}`;
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: seriesName,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
        tooltip: am5.Tooltip.new(root, { labelText: "{categoryX}: {valueY}" }),
      })
    );

    series.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      strokeOpacity: 0,
    });

    // Adapters with null-checks
    series.columns.template.adapters.add("fill", function (fill, target) {
      const colors = chart.get("colors");
      return colors ? colors.getIndex(series.columns.indexOf(target)) : fill;
    });

    series.columns.template.adapters.add("stroke", function (stroke, target) {
      const colors = chart.get("colors");
      return colors ? colors.getIndex(series.columns.indexOf(target)) : stroke;
    });
    series.columns.template.events.on("click", (event) => {
      const dataItem = event.target.dataItem;
      if (dataItem && dataItem.dataContext) {
        const { category } = dataItem.dataContext as { category: string };
        console.log("Clicked Category:", category);
        onFilterChange1({ CategoryColumn: Xaxis, Category: category });
      }
    });
    
    // Set data
    xAxis.data.setAll(chartData);
    series.data.setAll(chartData);

    // Animate on load
    series.appear(1000);
    chart.appear(1000, 100);

    // Cleanup on unmount
    return () => {
      root.dispose();
    };
  }, [data, Xaxis, Yaxis, xLabel, yLabel]);

  return <div ref={chartDivRef} style={{ width: "100%", height: "83%" }} />;
};

export default ColumnChart;
