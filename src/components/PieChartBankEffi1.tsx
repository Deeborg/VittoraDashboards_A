import React, { useEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

interface DataPorts {
  data: Record<string, any>[];
  CategoryColumn: string;
  ValueColumn: string;
}

const DonetChart: React.FC<DataPorts> = ({
  data,
  CategoryColumn,
  ValueColumn,
}) => {
  const chartDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sum the Value for each category
    

    // Set themes
    am4core.useTheme(am4themes_animated);

    // Create the chart instance using amCharts 4
    const chart = am4core.create(chartDivRef.current!, am4charts.PieChart);

    // Add inner radius to create a donut chart
    chart.innerRadius = am4core.percent(50);



    // Create series
    const series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = ValueColumn;
    series.dataFields.category = CategoryColumn;
    
    // Set the data to the series
    series.data = data;

    series.labels.template.disabled = true; 
    series.ticks.template.disabled = true;  


 

 

    // Optional: Add legend
    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";

    return () => {
      chart.dispose();
    };
  }, [data, CategoryColumn, ValueColumn,]); 

  return (
    <div
      ref={chartDivRef}
      style={{ width: "100%", height: "300px" }} 
    />
  );
};

export default DonetChart;
