import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

// ✅ India states map data
import am5geodata_indiaLow from "@amcharts/amcharts5-geodata/indiaLow";

interface CountryData {
  [key: string]: any;
}

interface WorldBubbleMapChartProps {
  data: CountryData[];
  CategoryColumn: string;   // e.g., "id"
  CategoryColumn1: string;  // e.g., "name"
  ValueColumn: string;      // e.g., "value"
}

const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  else if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  else if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  else return num.toString();
};

const WorldBubbleMapChart: React.FC<WorldBubbleMapChartProps> = ({
  data,
  CategoryColumn,
  CategoryColumn1,
  ValueColumn,
}) => {
  useEffect(() => {
   

    const root = am5.Root.new("chartdiv");
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "translateY",
        projection: am5map.geoMercator(),
      })
    );

    // 🗺️ India State Map
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_indiaLow as any,
      })
    );

    const bubbleSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {
        valueField: ValueColumn,
        calculateAggregates: true,
        polygonIdField: CategoryColumn,
      })
    );

    const circleTemplate = am5.Template.new<am5.Circle>({});

    bubbleSeries.bullets.push((root, series, dataItem) => {
      const value = dataItem.get("value") as number;
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(
          root,
          {
            radius: 10,
            fillOpacity: 0.7,
            fill: am5.color(0x007aff),
            tooltipText: `{${CategoryColumn1}}: [bold]${formatNumber(value)}[/]`,
            cursorOverStyle: "pointer",
          },
          circleTemplate
        ),
        dynamic: true,
      });
    });

    const values = data.map((d) => Number(d[ValueColumn]) || 0).filter((v) => !isNaN(v));
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values.filter((v) => v > 0));

    // bubbleSeries.set("heatRules", [
    //   {
    //     target: circleTemplate,
    //     dataField: ValueColumn,
    //     min: 5,
    //     max: 50,
    //     minValue: minValue > 0 ? minValue : 1,
    //     maxValue: maxValue > 0 ? maxValue : 1,
    //     key: "radius",
    //   },
    // ]);

    bubbleSeries.data.setAll(data);
    chart.set("zoomLevel", 1);

    return () => {
      root.dispose();
    };
  }, [data, CategoryColumn, CategoryColumn1, ValueColumn]);

  return <div id="chartdiv" style={{ width: "100%",height:"450px" }} />;
};

export default WorldBubbleMapChart;
