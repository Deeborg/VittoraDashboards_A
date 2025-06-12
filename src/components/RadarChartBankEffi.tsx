import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface RadarChartProps {
  data: Record<string, any>[];
  CategoryColumn: string;
  ValueColumn: string;
}

interface RadarChartData {
  name: string;
  value1: number;
}

const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
};

const RadarChartComponent: React.FC<RadarChartProps> = ({
  data,
  CategoryColumn,
  ValueColumn
}) => {
  useEffect(() => {
    const root = am5.Root.new("radarChartDiv");
    root.setThemes([am5themes_Animated.new(root)]);

    const formattedData = data.map((item) => ({
        name: item[CategoryColumn],
        value1: item[ValueColumn],
        }));

    const chart = root.container.children.push(
      am5radar.RadarChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        innerRadius: am5.percent(40),
        radius: am5.percent(70),
        arrangeTooltips: false,
      })
    );

    const cursor = chart.set("cursor", am5radar.RadarCursor.new(root, {
      behavior: "zoomX",
    }));
    cursor.lineY.set("visible", false);

    const xRenderer = am5radar.AxisRendererCircular.new(root, {
      minGridDistance: 30,
    });

    xRenderer.labels.template.setAll({
      textType: "radial",
      radius: 10,
      paddingTop: 0,
      paddingBottom: 0,
      centerY: am5.p50,
      fontSize: "0.8em",
    });

    xRenderer.grid.template.setAll({
      location: 0.5,
      strokeDasharray: [2, 2],
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: "name",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    


    const yRenderer = am5radar.AxisRendererRadial.new(root, {
      minGridDistance: 30,
    });

    yRenderer.grid.template.setAll({
      strokeDasharray: [2, 2],
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: yRenderer,
      })
    );

    const series1 = chart.series.push(
      am5radar.RadarLineSeries.new(root, {
        name: ValueColumn,
        xAxis,
        yAxis,
        valueYField: "value1",
        categoryXField: "name",
         tooltip: am5.Tooltip.new(root, {
            labelText: "{name}: {value1}"  // Customize tooltip text here
            }),

        
      })
    );

    series1.adapters.add("tooltipHTML", (html, target) => {
    const data = target.dataItem?.dataContext as RadarChartData | undefined;
    if (data) {
        return `<strong>${data.name}</strong><br/><span>${formatNumber(data.value1)}</span>`;
    }
    return html;
    });


   
    series1.strokes.template.setAll({
      strokeOpacity: 0,
    });

    series1.fills.template.setAll({
      visible: true,
      fillOpacity: 0.5,
    });

    

    
    xAxis.data.setAll(formattedData);
    series1.data.setAll(formattedData);

    series1.appear(3000);
    chart.appear(1000, 300);

    return () => {
      root.dispose();
    };
  }, [data, CategoryColumn, ValueColumn]);

  return <div id="radarChartDiv" style={{ width: "100%", height: "500px" }} />;
};

export default RadarChartComponent;