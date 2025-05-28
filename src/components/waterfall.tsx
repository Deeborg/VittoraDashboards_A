// waterfall.tsx
import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface WaterfallProps {
  id: string;
  data: { category: string; value: number }[];
  title?: string;
  yAxisFormatter?: (value: number) => string;
  totalLabel?: string; // Add the new prop
}

const formatNumber = (num: number): string => {
  const sign = num < 0 ? "-" : "";
  const absNum = Math.abs(num);

  let formattedValue: string;

  if (absNum >= 1_000_000_000) {
    formattedValue = `${(absNum / 1_000_000_000).toFixed(2)} Bn`;
  } else if (absNum >= 1_000_000) {
    formattedValue = `${(absNum / 1_000_000).toFixed(2)} M`;
  } else if (absNum >= 1_00_00_00_000) {
    formattedValue = `₹ ${(absNum / 1_00_00_00_000).toFixed(2)} Cr`; // Crores
  } else if (absNum >= 1_00_00_000) {
    formattedValue = `₹ ${(absNum / 1_00_00_000).toFixed(2)} Cr`; // Less than 1000 Cr but > 1 Cr
  } else {
    formattedValue = absNum.toLocaleString();
  }

  return sign + (formattedValue.startsWith("₹") || formattedValue.startsWith("$") ? formattedValue : formattedValue);
};

const WaterfallChart: React.FC<WaterfallProps> = ({ id, data, title, totalLabel = "Total" }) => { // Provide a default value
  useEffect(() => {
    const root = am5.Root.new(id);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        paddingLeft: 0,
      })
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 40,
      // minorGridEnabled: true,
    });
    xRenderer.grid.template.setAll({
  visible: false,
  strokeOpacity: 0,
});

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        // maxDeviation: 0,
        categoryField: "category",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xRenderer.grid.template.setAll({ location: 0.5 });
    xRenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingTop: 80,
    });

    const formatter = am5.NumberFormatter.new(root, {
      numberFormat: "#.##a",
    });
    formatter.set("bigNumberPrefixes", [
      { number: 1e9, suffix: " Bn" },
    ]);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        strictMinMax: true,
        renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
        tooltip: am5.Tooltip.new(root, {}),
        extraMax: 0.1,
        numberFormatter: formatter,
      })
    );
    const yRenderer = yAxis.get("renderer") as am5xy.AxisRendererY;
yRenderer.grid.template.setAll({
  visible: false,
  strokeOpacity: 0,
});
const zeroLine = yAxis.createAxisRange(yAxis.makeDataItem({ value: 0 }));
zeroLine.get("grid")?.setAll({
  visible: true,
  strokeOpacity: 0.2,
  stroke: am5.color(0x000000), // Change to desired color
  strokeWidth: 1,
});

    chart.set("cursor", am5xy.XYCursor.new(root, { xAxis, yAxis }));

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis,
        yAxis,
        valueYField: "value",
        openValueYField: "open",
        categoryXField: "category",
      })
    );

    series.columns.template.setAll({
      templateField: "columnConfig",
      strokeOpacity: 0,
    });

    xAxis.children.push(
      am5.Label.new(root, {
        text: "Category", // You can customize or use a prop
        x: am5.p50,
        centerX: am5.p50,
        centerY: am5.p100,
        // paddingTop: 20,
        fontSize: 14,
        fontWeight: "bold",
      })
    );

    yAxis.children.unshift(
      am5.Label.new(root, {
        text: "Value", // Customize as needed
        rotation: -90,
        y: am5.p50,
        centerX: am5.p50,
        centerY: am5.p50,
        fontSize: 14,
        fontWeight: "bold",
      })
    );

    series.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Label.new(root, {
          text: "{displayValue}",
          centerY: am5.p50,
          centerX: am5.p50,
          populateText: true,
        }),
      })
    );

    const stepSeries = chart.series.push(
      am5xy.StepLineSeries.new(root, {
        xAxis,
        yAxis,
        valueYField: "stepValue",
        categoryXField: "category",
        noRisers: true,
        locationX: 0.65,
        stroke: root.interfaceColors.get("alternativeBackground"),
      })
    );

    stepSeries.strokes.template.setAll({
      strokeDasharray: [3, 3],
    });

    const colorSet = am5.ColorSet.new(root, {});
    let cumulative = 0;

    const processedData = data.map((item, index) => {
      const start = cumulative;
      cumulative += item.value;

      return {
        category: item.category,
        value: cumulative,
        open: start,
        stepValue: cumulative,
        columnConfig: {
          fill: colorSet.getIndex(index),
        },
        displayValue: formatNumber(Math.abs(item.value)),
      };
    });

    processedData.push({
      category: totalLabel, // Use the totalLabel prop here
      open: 0,
      value: cumulative,
      stepValue: cumulative,
      columnConfig: {
        fill: colorSet.getIndex(data.length),
      },
      displayValue: formatNumber(cumulative),
    });

    xAxis.data.setAll(processedData);
    series.data.setAll(processedData);
    stepSeries.data.setAll(processedData);

    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, id, totalLabel]); // Add totalLabel to the dependency array

  return <div id={id} style={{ width: "100%", height: "700px", margin: "auto", paddingTop: "20px" }}></div>;
};

export default WaterfallChart;