import React, { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface Props {
  data: Record<string, any>[];
  xField: string;
  stackFields: string[];
  lineField: string;
  onFilterChange1: (filters: any) => void;
  xAxisLabel?: string; // New prop for x-axis label
}

const StackedBarWithLineChart: React.FC<Props> = ({
  data,
  xField,
  stackFields,
  lineField,
  onFilterChange1,
  xAxisLabel = "Fiscal Year", // Default label if not provided
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = am5.Root.new(chartRef.current!);
    root.setThemes([am5themes_Animated.new(root)]);

    // ✅ Layout: stack chart + legend vertically
    root.container.set("layout", root.verticalLayout);

    // ✅ Set height of the chart (leave room for legend)
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout,
        height: am5.percent(85), // Leaves 15% for legend
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: xField,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      })
    );

    xAxis.get("renderer").labels.template.setAll({
      fontSize: 12,
      fill: am5.color(0x000000),
    });

    xAxis.data.setAll(data);

    const yAxisLeft = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const yAxisRight = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          opposite: true,
          minGridDistance: 20,
          strokeOpacity: 0.2,
        }),
        min: 0,
        extraMin: 0.1,
        extraMax: 0.1,
        numberFormat: "#.00",
      })
    );
    xAxis.get("renderer").grid.template.setAll({ strokeOpacity: 1 });
    yAxisRight.get("renderer").grid.template.setAll({ strokeOpacity: 0 });

    // ✅ Legend above chart
    const legend = root.container.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        layout: root.horizontalLayout,
        marginTop: 10,
        marginBottom: 20,
        width: am5.percent(100),
        useDefaultMarker: true,
      })
    );
    legend.labels.template.setAll({
      maxWidth: 100, // adjust as needed
      oversizedBehavior: "wrap",
      textAlign: "center",
      fontSize: 13,
      paddingRight: 4,
      paddingLeft: 4,
    });    
    
    
    root.container.children.removeValue(legend);
    root.container.children.insertIndex(0, legend);

    // ✅ Stacked bar series
    const barSeriesList = stackFields.map((field, index) => {
      const barSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: field,
          stacked: true,
          xAxis,
          yAxis: yAxisLeft,
          valueYField: field,
          categoryXField: xField,
        })
      );

      barSeries.columns.template.setAll({
        tooltipText: `${field}: {valueY}`,
        width: am5.percent(80),
        fill: chart.get("colors")?.getIndex(index),
        stroke: chart.get("colors")?.getIndex(index),
      });

      barSeries.columns.template.adapters.add("fill", (fill, target) => {
        return chart.get("colors")?.getIndex(index) ?? fill;
      });
      barSeries.columns.template.adapters.add("stroke", (stroke, target) => {
        return chart.get("colors")?.getIndex(index) ?? stroke;
      });

      barSeries.columns.template.events.on("click", (event) => {
        const dataItem = event.target.dataItem;
        if (dataItem && dataItem.dataContext) {
          const { category } = dataItem.dataContext as { category: string };
          onFilterChange1({ CategoryColumn: xField, Category: category });
        }
      });

      barSeries.data.setAll(data);
      return barSeries;
    });

    // ✅ Line series with tooltip and bullets
    const lineSeries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: lineField,
        xAxis,
        yAxis: yAxisRight,
        valueYField: lineField,
        categoryXField: xField,
        stroke: am5.color(0xd63384),
        fill: am5.color(0xd63384),
      })
    );

    lineSeries.strokes.template.setAll({
      strokeWidth: 2,
    });

    lineSeries.set(
      "tooltip",
      am5.Tooltip.new(root, {
        labelText: "{name}: {valueY.formatNumber('#.00')}",
      })
    );

    lineSeries.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 4,
          fill: lineSeries.get("fill"),
          stroke: root.interfaceColors.get("background"),
          strokeWidth: 1,
        }),
      })
    );

    lineSeries.data.setAll(data);

    // ✅ Cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    // ✅ Legend
    legend.data.setAll(barSeriesList);
    legend.data.push(lineSeries);

    // Add X-Axis Label
    xAxis.children.push(
      am5.Label.new(root, {
        text: xAxisLabel, // Use the prop here
        x: am5.p50,
        centerX: am5.p50,
        y: am5.percent(100),
        paddingTop: 3,
        fontSize: 14,
        fontWeight: "bold",
      })
    );
    yAxisLeft.children.unshift(
      am5.Label.new(root, {
        text: "Amount in INR", // Change to your desired label
        rotation: -90,
        y: am5.p50,
        centerY: am5.p50,
        x: am5.percent(-10),
        fontSize: 14,
        fontWeight: "bold",
      })
    );

    // Add Y-Axis Label (Secondary)
    yAxisRight.children.push(
      am5.Label.new(root, {
        text: "Current Asset Ratio", // Change to your desired label
        rotation: -90,
        y: am5.p50,
        centerY: am5.p50,
        x: am5.percent(80),
        fontSize: 14,
        fontWeight: "bold",
      })
    );    

    return () => {
      root.dispose();
    };
  }, [data, xField, stackFields, lineField, onFilterChange1, xAxisLabel]); // Include xAxisLabel in dependencies

  return <div ref={chartRef} style={{ width: "100%", height: "90%" }} />;
};

export default StackedBarWithLineChart;
