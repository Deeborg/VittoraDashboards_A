import React, { useEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

interface DataPorts {
  data2: Record<string, any>[];
  CategoryColumn: string;
  ValueColumns: string[];
  Labels: string[];
  yLabel: string;
  onFilterChange1: (filters: any) => void;
}

const HorizontalBarChartSlid: React.FC<DataPorts> = ({
  data2,
  CategoryColumn,
  ValueColumns,
  Labels,
  yLabel,
  onFilterChange1,
}) => {

  const chartDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartDivRef.current) return;

    // Apply theme
    am4core.useTheme(am4themes_animated);

    // Create a container for charts
    const container = am4core.create(chartDivRef.current, am4core.Container);
    container.layout = "horizontal";
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);

    // Shared scrollbar
    const scrollbarY = new am4core.Scrollbar();
    scrollbarY.orientation = "vertical";

    // Function to create charts
    const createChart = (valueField: string, label: string, index: number) => {
      const chart = container.createChild(am4charts.XYChart);
      chart.data = data2;
      chart.width = am4core.percent(index === 0 ? 30 : 15);
     

      // Create X-axis
      const xAxis = chart.xAxes.push(new am4charts.ValueAxis());
      xAxis.renderer.grid.template.disabled = true;
      xAxis.title.text = label;
      xAxis.renderer.labels.template.disabled = true;
      xAxis.title.fontWeight = "bold";

      if (index === 0) {
        const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        yAxis.dataFields.category = CategoryColumn;
        yAxis.renderer.grid.template.disabled = true;
        yAxis.renderer.minGridDistance = 30;
        // yAxis.renderer.maxGridDistance =30;
        yAxis.title.text = yLabel;
        yAxis.title.rotation = -90;
        yAxis.title.align = "center";
        yAxis.title.valign = "middle";
        yAxis.title.fontSize = 15;
        yAxis.title.fontWeight = "bold";
        // xAxis.logarithmic=true;

        // Clickable Y-axis labels
        yAxis.renderer.labels.template.events.on("hit", function (event) {
          const dataItem = event.target.dataItem?.dataContext as Record<
            string,
            any
          >;
          if (dataItem) {
            onFilterChange1({
              CategoryColumn,
              Category: dataItem[CategoryColumn],
            });
          }
        });
      } else {
        // Hide Y-axis for other charts
        const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        yAxis.dataFields.category = CategoryColumn;
        yAxis.renderer.labels.template.disabled = true;
        yAxis.renderer.grid.template.disabled = true;
        yAxis.renderer.minGridDistance = 15;
        

      }

      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueX = valueField;
      series.dataFields.categoryY = CategoryColumn;

      // Function to abbreviate values
      const abbreviateAmounts = (amount: number) => {
        if (Math.abs(amount) >= 1_000_000_000) {
          return `${(amount / 1_000_000_000).toFixed(2)} B`;
        } else if (Math.abs(amount) >= 1_000_000) {
          return `${(amount / 1_000_000).toFixed(2)} M`;
        } else if (Math.abs(amount) >= 1_000) {
          return `${(amount / 1_000).toFixed(2)} K`;
        }
        return amount.toFixed(2).toString();
      };

      series.columns.template.tooltipText = `{${CategoryColumn}}: {valueX.formatNumber('#,###')}`;
      series.columns.template.adapter.add("tooltipText", (text, target) => {
        if (target.dataItem) {
          const rawValue = target.dataItem.values.valueX.value;
          return `${target.dataItem.categories.categoryY}: ${abbreviateAmounts(
            rawValue
          )}`;
        }
        return text;
      });

      const labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.text = "{valueX}";
      labelBullet.label.fill = am4core.color("#000000");
      labelBullet.label.horizontalCenter = "left";
      labelBullet.label.verticalCenter = "middle";
      labelBullet.locationX = 1;
      labelBullet.label.hiddenState.properties.opacity = 1; 
      labelBullet.label.opacity = 1;
      labelBullet.label.hideOversized = false;
      labelBullet.label.truncate = false;
      labelBullet.label.adapter.add("text", (text, target) => {
        if (target.dataItem) {
          const rawValue = target.dataItem.values.valueX.value;
          return abbreviateAmounts(rawValue);
        }
        return text;
      });

      if (index === 1 || index === 0) {
        series.columns.template.adapter.add("fill", function (fill, target) {
          return am4core.color("#ADE8FA");
        });

        series.columns.template.adapter.add(
          "stroke",
          function (stroke, target) {
            return am4core.color("#ADE8FA");
          }
        );

        // labelBullet.label.horizontalCenter = "left";
      } else {
        series.columns.template.adapter.add("fill", function (fill, target) {
          return target.dataItem && target.dataItem.values.valueX.value < 0
            ? am4core.color("#FF0000")
            : am4core.color("#008000");
        });

        series.columns.template.adapter.add(
          "stroke",
          function (stroke, target) {
            return target.dataItem && target.dataItem.values.valueX.value < 0
              ? am4core.color("#FF0000")
              : am4core.color("#008000");
          }
        );

      }

      // Automatically adjust label position
      // labelBullet.label.horizontalCenter = "middle"; // Default to center

      // Change position dynamically based on bar size
      series.columns.template.adapter.add("maxWidth", (width, target) => {
        if (target.dataItem && target.dataItem.values.valueX.value < 0) {
          labelBullet.label.horizontalCenter = "right"; // Move left for negative values
          labelBullet.label.dx = -8; // Adjust spacing
        } else {
          labelBullet.label.horizontalCenter = "left"; // Move right for positive values
          labelBullet.label.dx = 8; // Adjust spacing
        }
        return width;
      });
      series.columns.template.maxHeight = 50;
      // series.columns.template.maxWidth= 80;
      series.columns.template.adapter.add("visible", () => true);

      series.columns.template.events.on("hit", (event) => {
        const dataItem = event.target.dataItem;
        if (dataItem) {
          onFilterChange1({
            CategoryColumn,
            Category: dataItem.categories.categoryY,
          });
        }
      });

      chart.scrollbarY = scrollbarY;

      return chart;
    };

    ValueColumns.forEach((col, index) =>
      createChart(col, Labels[index], index)
    );

    container.children.push(scrollbarY);

    return () => {
      if (container) {
        container.dispose();
      }
    };
  }, [data2, CategoryColumn, ValueColumns, Labels, yLabel, onFilterChange1]);

  return (
    <div
      ref={chartDivRef}
      style={{ width: "100%", height: "100%", display: "flex" }}
    />
  );
};

export default HorizontalBarChartSlid;
