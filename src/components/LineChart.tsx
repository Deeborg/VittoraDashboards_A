import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataPorts {
  data: Record<string, any>[];
  catColumn: string;
  valueColumLine: string;
}

const LineChart: React.FC<DataPorts> = React.memo(({ data, catColumn,  valueColumLine }) => {
  useEffect(() => {
    const root = am5.Root.new("linechartDiv");
    root.setThemes([am5themes_Animated.new(root)]);

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
    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
      })
    );

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

    // Create Y Axis (for line)
    const yAxis2 = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        // min: 0,
        extraMax: 0.1,
        renderer: am5xy.AxisRendererY.new(root, {
          strokeOpacity: 0.1,
        }),
        tooltip: am5.Tooltip.new(root, { labelText: "{value}" }),
      })
    );

    // Add X Axis Label
xAxis.children.push(
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
yAxis2.children.unshift(
  am5.Label.new(root, {
    text: valueColumLine, // or "NWC_TNS" for static label
    rotation: -90,
    y: am5.p50,
    centerX: am5.p50,
    centerY: am5.p50,
    fontSize: 14,
    fontWeight:"bold",
  })
);


    // Create Line Series
    const series2 = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: valueColumLine,
        xAxis: xAxis,
        yAxis: yAxis2,
        valueYField: "valueLine",
        categoryXField: "category",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{categoryX}: {valueLine}",
        }),
      })
    );

    const strokeColor = 0x5a9bd5; // Example color in hexadecimal
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
    legend.data.setAll(chart.series.values);

    // Transform & Prepare Data
    const groupedData = data.reduce((acc, item) => {
      const category = item[catColumn];
      const valueLine = item[valueColumLine] || 0;
      if (!category) return acc;

      if (!acc[category]) {
        acc[category] = { category, valueLine: 0 };
      }
      acc[category].valueLine += valueLine;
      return acc;
    }, {} as Record<string, { category: string; valueLine: number }>);

    const sortedData = Object.values(groupedData)
    //   .sort((a, b) => b.valueLine - a.valueLine)
      .slice(0, 100);

    xAxis.data.setAll(sortedData);
    series2.data.setAll(sortedData);

    // Animate chart
    chart.appear(1000, 100);

    // Cleanup
    return () => {
      root.dispose();
    };
  }, [data, catColumn,  valueColumLine]);

  return (
      <div id="linechartDiv" style={{ width: "100%", height: "500px" }}></div>
  );
});

export default LineChart;
