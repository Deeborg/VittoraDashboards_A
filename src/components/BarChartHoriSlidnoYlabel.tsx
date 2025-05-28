import React, { useEffect, useRef, useCallback } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

interface DataPorts {
  data2: Record<string, any>[];
  CategoryColumn: string;
  ValueColumn: string[];
  xLabel: string[];
  yLabel: string;
  onFilterChange1: (filters: any) => void;
}

const HorizontalBarChartSlid: React.FC<DataPorts> = ({
  data2,
  CategoryColumn,
  ValueColumn,
  xLabel,
  yLabel,
  onFilterChange1,
}) => {
  const chartDivRef = useRef<HTMLDivElement>(null);
  const handleFilterChange = useCallback(
    (category: string) => {
      onFilterChange1({ CategoryColumn, Category: category });
    },
    [CategoryColumn, onFilterChange1]
  );

  useEffect(() => {
    if (
      !data2.every(
        (item) =>
          item.hasOwnProperty(CategoryColumn) &&
          ValueColumn.every((key) => item.hasOwnProperty(key))
      )
    ) {
      console.error("Invalid keys provided for categoryField or valueField");
      return;
    }

    if (!chartDivRef.current) return;

    // Apply theme
    am4core.useTheme(am4themes_animated);

    // Create chart
    const chart = am4core.create(chartDivRef.current, am4charts.XYChart);
    chart.data = data2; // ✅ Use data directly
    
    // Create Y Axis (Categories)
    const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    yAxis.dataFields.category = CategoryColumn;
    yAxis.renderer.grid.template.disabled = true;
    yAxis.renderer.minGridDistance = 30;
    // yAxis.title.text = yLabel;
    yAxis.title.rotation = -90;
    yAxis.title.align = "center";
    yAxis.title.valign = "middle";
    yAxis.title.fontSize = 15;
    yAxis.title.fontWeight = "bold";

    // Create X Axis (Values)
    const xAxis = chart.xAxes.push(new am4charts.ValueAxis());
    xAxis.renderer.grid.template.disabled = true;
    yAxis.renderer.labels.template.disabled = true; 

    // Create Series
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueX = ValueColumn[0]; // Use the first value column
    series.dataFields.categoryY = CategoryColumn;
    series.columns.template.tooltipText = `{${CategoryColumn}}: {${ValueColumn}}`;
    series.columns.template.tooltipPosition = "pointer";

    // Add click event to bars
    const handleClick = (event: any) => {
      const dataItem = event.target.dataItem;
      if (dataItem) {
        handleFilterChange(dataItem.categories.categoryY);
      }
    };
    
    yAxis.renderer.labels.template.events.on("hit", function (event) {
      const dataItem = event.target.dataItem?.dataContext as Record<string, any>; // Type assertion
      if (dataItem) {
        const clickedCategory = dataItem[CategoryColumn]; // Access category dynamically
        console.log("Clicked Label:", clickedCategory);
        onFilterChange1({ CategoryColumn, Category: clickedCategory });
      }
    });
    
    series.columns.template.events.on("hit", handleClick);

    // Add scrollbar
    chart.scrollbarY = new am4core.Scrollbar();

    // Cleanup on unmount
    return () => {
      series.columns.template.events.off("hit", handleClick);
      chart.dispose();
    };
  }, [data2, CategoryColumn, ValueColumn, xLabel, yLabel, handleFilterChange]);

  return <div ref={chartDivRef} style={{ width: "100%", height: "100%" }} />;
};

export default HorizontalBarChartSlid;
