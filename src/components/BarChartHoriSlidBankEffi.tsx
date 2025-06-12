import React, { useEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

interface DataPorts {
  data: Record<string, any>[];
  CategoryColumn: string;
  ValueColumns: string[];
  xLabel: string;
  yLabel: string;
  sizeylab:number;
}
interface DataRow {
  EMP_COUNT: number;
  [key: string]: any;
}
const HorizontalBarChartSlid: React.FC<DataPorts> = ({
  data,
  CategoryColumn,
  ValueColumns,
  xLabel,
  yLabel,
  sizeylab
  
}) => {
  const chartDivRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number): string => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B'; // Billions
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M'; // Millions
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K'; // Thousands
    } else {
      return num.toString(); // Return the number as is
    }
  };

  useEffect(() => {
    if (
      !data.every(
        (item) =>
          item.hasOwnProperty(CategoryColumn) &&
          ValueColumns.every((col) => item.hasOwnProperty(col))
      )
    ) {
      console.error("Invalid keys provided for categoryField or valueFields");
      return;
    }

    const sorted = [...data].sort((a, b) => {
      return parseFloat(a[ValueColumns[0]])-parseFloat(b[ValueColumns[0]]);
    });

    const chartData = sorted.map((row) => ({
      category: row[CategoryColumn],
      ...ValueColumns.reduce((dec, col) => {
        dec[col] = parseFloat(row[col]) || 0;
        return dec;
      }, {} as Record<string, number>),
    }));

    if (!chartDivRef.current) return;

    am4core.useTheme(am4themes_animated);
    const chart = am4core.create(chartDivRef.current, am4charts.XYChart);

    chart.paddingRight = 60; // Add right padding for scrollbar space
    chart.minHeight = 300;
    chart.maxHeight = 500;
    chart.mouseWheelBehavior = "zoomY";

    const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    yAxis.dataFields.category = "category";
    yAxis.renderer.grid.template.disabled = true;
    yAxis.renderer.minGridDistance = 30; // more space between bars
    yAxis.renderer.cellStartLocation = 0.1;
    yAxis.renderer.cellEndLocation = 0.9;
    yAxis.renderer.labels.template.maxWidth = sizeylab;
    yAxis.renderer.labels.template.truncate = false;
    yAxis.renderer.labels.template.wrap = true;
    yAxis.maxZoomCount = 10;
    
    const xAxis = chart.xAxes.push(new am4charts.ValueAxis());
    xAxis.renderer.grid.template.disabled = true;
    // xAxis.renderer.labels.template.disabled = true;
    // xAxis.numberFormatter.numberFormat = "#,###"; // Default format
    // xAxis.renderer.labels.template.adapter.add("text", (text, target) => {
    //   const value = target.dataItem?.value;
    //   return value !== undefined ? formatNumber(value) : text; // Format the label
    // });

   
    ValueColumns.forEach((valCol, index) => {
      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueX= valCol;
      series.dataFields.categoryY = "category";

      // Use displayNames mapping or fallback to raw column name
      // const displayName = displayNames[valCol] || valCol;
      // series.name = displayName;

      // Format tooltip text using the formatNumber function
      series.columns.template.tooltipText = `{${CategoryColumn}}: {valueX.formatNumber('#,###')}`;
      series.columns.template.adapter.add("tooltipText", (text, target) => {
        if (target.dataItem) {
          const rawValue = target.dataItem.values.valueX.value;
          return `${target.dataItem.categories.categoryY}: ${formatNumber(
            rawValue
          )}`;
        }
        return text;
      });
      series.columns.template.tooltipPosition = "pointer";

      

      series.columns.template.adapter.add("fill", (_, target) => {
        const gradient = new am4core.LinearGradient();
        gradient.addColor(chart.colors.getIndex(index));
        gradient.addColor(am4core.color("#ffffff")); // Lighten at the end (can adjust)
        gradient.rotation = 90; // vertical gradient
        return gradient;
      });

      series.columns.template.adapter.add("stroke", (_, target) => {
        return chart.colors.getIndex(index); // Optional: keep stroke solid
      });

      series.columns.template.strokeWidth = 2;
    });

    chart.data = chartData;
    yAxis.data = chartData;

    // X axis label
    const xLabelText = chart.chartContainer.createChild(am4core.Label);
    xLabelText.text = xLabel;
    xLabelText.fontSize = 15;
    xLabelText.fontWeight = "bold";
    xLabelText.x = am4core.percent(50);
    xLabelText.horizontalCenter = "middle";
    xLabelText.y = am4core.percent(100);

    // Y axis label
    yAxis.title.text = yLabel;
    yAxis.title.rotation = -90;
    yAxis.title.align = "center";
    yAxis.title.valign = "middle";
    yAxis.title.fontSize = 15;
    yAxis.title.fontWeight = "bold";
    yAxis.title.dy = 0;
    yAxis.maxZoomCount = 12;

    // Scrollbar just after bar chart
    chart.scrollbarY = new am4core.Scrollbar();
    chart.scrollbarY.marginRight = 10;
    chart.scrollbarY.align = "right";
    chart.scrollbarY.width = 12;
    chart.events.on("datavalidated", () => {
      if (yAxis && chart.data && chart.data.length > 0) {
        yAxis.zoomToIndexes(0, Math.min(10, chart.data.length - 1));
      }
    });

    
    chart.legend = new am4charts.Legend();
    chart.legend.disabled=true;


   

    return () => {
      chart.dispose();
    };
  }, [data, CategoryColumn, ValueColumns, xLabel, yLabel,sizeylab]);

  return <div ref={chartDivRef} style={{ width: "100%", height: "500px" }} />;
};

export default HorizontalBarChartSlid;
