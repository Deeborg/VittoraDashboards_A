import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataPorts {
  data: Record<string, any>[];
  catColumn: string;
  valueColum: string;
  valueColumLine: string;
  onFilterChange1: (filters: any) => void;
}

const BarChartLine: React.FC<DataPorts> = React.memo(({ data, catColumn, valueColum, valueColumLine, onFilterChange1 }) => {
  useEffect(() => {
    const root = am5.Root.new("chartDiv");
    root.setThemes([am5themes_Animated.new(root)]);

    // ✅ Layout: stack chart + legend vertically
    root.container.set("layout", root.verticalLayout);

    // Create XY Chart
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 5,
        paddingRight: 5,
      })
    );

    // Add Cursor
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

    // Create X Axis
    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 60,
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
    });

    // Create Y Axis for columns
    const yAxis1 = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        extraMax: 0.1,
        renderer: am5xy.AxisRendererY.new(root, {
          strokeOpacity: 0.1,
        }),
      })
    );

    // Create Y Axis for lines
    const yAxis2 = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        extraMax: 0.1,
        renderer: am5xy.AxisRendererY.new(root, {
          opposite: true, // Place the axis on the opposite side
          strokeOpacity: 0.1,
        }),
        tooltip: am5.Tooltip.new(root, { labelText: "{value}" }),
      })
    );

    // Create Column Series
    const series1 = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: valueColum,
        xAxis: xAxis,
        yAxis: yAxis1, // Assign to the first Y-axis
        valueYField: "value",
        categoryXField: "category",
        sequencedInterpolation: true,
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{categoryX}: {valueY}",
        }),
      })
    );

    series1.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      fillOpacity: 0.9,
      tooltipText: "{categoryX}: {valueY}",
    });

    // Add colors to columns
    const colorSet = chart.get("colors") || am5.ColorSet.new(root, {});
    series1.columns.template.adapters.add("fill", (fill, target) => {
      return colorSet.getIndex(series1.columns.indexOf(target));
    });

    series1.columns.template.adapters.add("stroke", (stroke, target) => {
      return colorSet.getIndex(series1.columns.indexOf(target));
    });

    series1.columns.template.events.on("click", (event) => {
      const dataItem = event.target.dataItem;
      if (dataItem && dataItem.dataContext) {
        const { category } = dataItem.dataContext as { category: string };
        console.log("Clicked Category:", category);
        onFilterChange1({ CategoryColumn: catColumn, Category: category });
      }
    });

    // Add X Axis Label
    const xAxisLabel = xAxis.children.push(
      am5.Label.new(root, {
        text: catColumn, // or "Fiscal Year" for static label
        x: am5.p50,
        centerX: am5.p50,
        centerY: am5.p100,
        paddingTop: 20,
        fontSize: 14,
        fontWeight: "bold",
      })
    );

    // Add Y Axis Label
    const yAxis1Label = yAxis1.children.unshift(
      am5.Label.new(root, {
        text: valueColum, // or hardcoded like "Revenue"
        rotation: -90,
        y: am5.p50,
        centerX: am5.p50,
        centerY: am5.p50,
        fontSize: 14,
        fontWeight: "bold",
      })
    );

    // Define stroke color
    const strokeColor = 0xff0000; // Example: red color

    // Create Line Series
    const series2 = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: valueColumLine,
        xAxis: xAxis,
        yAxis: yAxis2, // Assign to the second Y-axis
        valueYField: "valueLine",
        categoryXField: "category",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{categoryX}: {valueLine}",
        }),
      })
    );

    series2.strokes.template.setAll({
      stroke: am5.color(strokeColor),
      strokeWidth: 3,
    });

    series2.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: root.interfaceColors.get("background"),
          stroke: am5.color(strokeColor),
          strokeWidth: 3,
        }),
      })
    );

    // Set up legend
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

    // Transform Data
    const groupedData = data.reduce((acc, item) => {
      const category = item[catColumn];
      const value = item[valueColum] || 0;
      const valueLine = item[valueColumLine] || 0;
      if (!category) return acc;

      if (!acc[category]) {
        acc[category] = { category, value: 0, valueLine: 0 };
      }
      acc[category].value += value;
      acc[category].valueLine += valueLine;
      return acc;
    }, {} as Record<string, { category: string; value: number; valueLine: number }>);

    const sortedData = Object.values(groupedData)
      // .sort((a, b) => b.value - a.value)
      .slice(0, 100);

    xAxis.data.setAll(sortedData);
    series1.data.setAll(sortedData);
    series2.data.setAll(sortedData);

    // Animate chart
    chart.appear(1000, 100);

    // Cleanup on unmount
    return () => {
      root.dispose();
    };
  }, [data, catColumn, valueColum, valueColumLine, onFilterChange1]);

  return (
    <div id="chartDiv" style={{ width: "100%", height: "500px" }}></div>
  );
});

export default BarChartLine;
