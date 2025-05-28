import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface WaterfallProps {
  data: { category: string; value: number }[];
  title?: string;
}

const WaterfallChart: React.FC<WaterfallProps> = ({ data, title }) => {
  useEffect(() => {
    const root = am5.Root.new("chartdiv");
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        paddingLeft: 0,
      })
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      minorGridEnabled: true,
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: "category",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xRenderer.grid.template.setAll({ location: 1 });
    xRenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingTop: 80,
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        strictMinMax: true,
        renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
        tooltip: am5.Tooltip.new(root, {}),
        extraMax: 0.1, 
      })
    );

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

    // series.columns.template.events.on("click", (ev) => {
    //   const dataItem = ev.target.dataItem;
    //   if (dataItem && dataItem.dataContext) {
    //     const category = (dataItem.dataContext as any).category;
    //     if (onFilterChange2 && category !== "Total") {
    //       onFilterChange2({ Category: category });
    //       console.log(category)
    //     }
    //   }
    // });

    xAxis.children.push(
      am5.Label.new(root, {
        text: "Category", // You can customize or use a prop
        x: am5.p50,
        centerX: am5.p50,
        centerY: am5.p100,
        paddingTop: 20,
        fontSize: 14,
        fontWeight:"bold",
      })
    );

    yAxis.children.unshift(
      am5.Label.new(root, {
        text: "Sum of Value", // Customize as needed
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
        displayValue: item.value.toLocaleString(),
      };
    });

    processedData.push({
      category: "Total",
      open: 0,
      value: cumulative,
      stepValue: cumulative,
      columnConfig: {
        fill: colorSet.getIndex(data.length),
      },
      displayValue: cumulative.toLocaleString(),
    });

    xAxis.data.setAll(processedData);
    series.data.setAll(processedData);
    stepSeries.data.setAll(processedData);

    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  return (

      <div id="chartdiv" style={{ width: "100%", height: "800px" }}></div>
  );
};

export default WaterfallChart;
