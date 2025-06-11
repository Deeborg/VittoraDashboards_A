import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";

interface CountryData {
  [key: string]: any;
}

interface WorldBubbleMapChartProps {
  data: CountryData[];
  CategoryColumn: string;
  CategoryColumn1: string;
  ValueColumn: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + "B"; // Billions
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + "M"; // Millions
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + "K"; // Thousands
  } else {
    return num.toString(); // Return the number as is
  }
};

const WorldBubbleMapChart: React.FC<WorldBubbleMapChartProps> = ({
  data,
  CategoryColumn,
  CategoryColumn1,
  ValueColumn,
}) => {
  useEffect(() => {
    // Validate data
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("Invalid or empty data provided:", data);
      return;
    }

    // Log raw data to verify structure
    console.log("Input Data:", data);
    console.log("ValueColumn Values:", data.map((d) => d[ValueColumn]));

    const root = am5.Root.new("chartdiv");
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "translateY",
        projection: am5map.geoMercator(),
      })
    );

    // Add map polygon series
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow as any,
        exclude: ["AQ"],
      })
    );

    // Add bubble series
    const bubbleSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {
        valueField: ValueColumn,
        calculateAggregates: true,
        polygonIdField: CategoryColumn,
      })
    );

    // Create circle template
    const circleTemplate = am5.Template.new<am5.Circle>({});

    // Define bullets
    bubbleSeries.bullets.push((root, series, dataItem) => {
      const value = dataItem.get("value") as number;
      // const country = dataItem.get(CategoryColumn1) || "Unknown";
      // console.log(`Bubble - Country: ${country}, Value: ${value}, Formatted: ${formatNumber(value)}`);
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(
          root,
          {
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

    // Calculate min and max values
    const values = data.map((d) => Number(d[ValueColumn]) || 0).filter((v) => !isNaN(v));
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values.filter((v) => v > 0)); // Exclude 0 for better scaling
    // console.log("Values:", values);
    // console.log("Min Value (excluding 0):", minValue);
    // console.log("Max Value:", maxValue);

    // Apply heat rules with adjusted range for better visibility
    bubbleSeries.set("heatRules", [
      {
        target: circleTemplate,
        dataField: ValueColumn,
        min: 1, // Increased min to make smaller bubbles more visible
        max: 50, // Increased max for more noticeable differences
        minValue: minValue > 0 ? minValue : 0,
        maxValue: maxValue > 0 ? maxValue : 1,
        key: "radius",
      },
    ]);

    // Set data and log the processed data
    bubbleSeries.data.setAll(data);
    // console.log("Bubble Series Data Items:", bubbleSeries.data.items);

    // Zoom to make sure bubbles are visible
    chart.set("zoomLevel", 1);

    return () => {
      root.dispose();
    };
  }, [data, CategoryColumn, CategoryColumn1, ValueColumn]);

  return <div id="chartdiv" style={{ width: "100%", height: 500 }} />;
};

export default WorldBubbleMapChart;