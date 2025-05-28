import React, { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface Props {
  data: Record<string, any>[];
  stackedFields: string[];
  xField: string;
  lineField: string;
}

const StackedLineChart: React.FC<Props> = ({ data, stackedFields, xField, lineField }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = am5.Root.new(chartRef.current!);
    root.setThemes([am5themes_Animated.new(root)]);

    // ✅ Layout: stack chart + legend vertically
    root.container.set("layout", root.verticalLayout);

    // ✅ Set height of the chart (leave room for legend)
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        layout: root.verticalLayout,
        height: am5.percent(90), // Adjusted height
      })
    );

    chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }));

    const xRenderer = am5xy.AxisRendererX.new(root, { minorGridEnabled: true });
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: xField,
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xRenderer.grid.template.setAll({ location: 1 });
    xAxis.data.setAll(data);

    // Left Y-axis (for columns)
    const leftYAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {
          opposite: false, // left side
          strokeOpacity: 0.1,
        }),
      })
    );

    // Right Y-axis (for line)
    const rightYAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {
          opposite: true, // right side
          strokeOpacity: 0.5,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    // ✅ Legend above chart
    const legend = root.container.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        // layout: root.horizontalLayout,
        // marginTop: 10,
        // marginBottom: 20,
        // width: am5.percent(100),
        // useDefaultMarker: true,
      })
    );
    root.container.children.removeValue(legend);
    root.container.children.insertIndex(0, legend);

    // const stackedFields = ["investments", "inventories", "receivables", "cash"];

    stackedFields.forEach((field) => {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: field,
          stacked: true,
          xAxis,
          yAxis: leftYAxis,
          valueYField: field,
          categoryXField: xField,
        })
      );

      series.columns.template.setAll({
        tooltipText: `{name}, {categoryX}: {valueY}`,
        tooltipY: am5.percent(10),
      });
      series.data.setAll(data);
      series.appear();

      series.bullets.push(() =>
        am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text: "{valueY}",
            fill: root.interfaceColors.get("alternativeText"),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true,
          }),
        })
      );

      legend.data.push(series);
    });

    const lineSeries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: lineField,
        xAxis,
        yAxis: rightYAxis,
        valueYField: lineField,
        categoryXField: xField,
        stroke: am5.color(0xd63384),
        fill: am5.color(0xd63384),
      })
    );

    lineSeries.strokes.template.setAll({ strokeWidth: 2 });
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
    lineSeries.appear();

    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, stackedFields, xField, lineField]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
};

export default StackedLineChart;
