import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataPorts {
  data: Record<string, any>[]; 
  category_column: string; 
  value_column: string; // The column name for values
  sortOrder?: 'asc' | 'desc'; // Optional sort order
}

const TreemapChart: React.FC<DataPorts> = ({ data, category_column, value_column, sortOrder = 'desc' }) => {
  const chartDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartDivRef.current) return;

    // Create root element
    const root = am5.Root.new(chartDivRef.current);

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create wrapper container
    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout,
      })
    );

    // Convert flat data to hierarchical format and sort
    const transformData = (data: Record<string, any>[]) => {
      const grouped: Record<string, any> = {};

      // Group the data by category and sum the values
      data.forEach((item) => {
        const category = item[category_column];
        const value = item[value_column];

        if (grouped[category]) {
          grouped[category].value += value;
        } else {
          grouped[category] = { name: category, value, children: [] };
        }
      });

      // Convert grouped data to array
      const groupedArray = Object.values(grouped);

      // Sort the grouped data by the value
      return groupedArray.sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.value - a.value; // Descending order
        } else {
          return a.value - b.value; // Ascending order
        }
      });
    };

    const hierarchicalData = {
      name: "Root",
      children: transformData(data),
    };

    // Create series
    const series = container.children.push(
      am5hierarchy.Treemap.new(root, {
        singleBranchOnly: false,
        downDepth: 1,
        upDepth: -1,
        initialDepth: 2,
        valueField: "value",
        categoryField: "name",
        childDataField: "children",
        nodePaddingOuter: 0,
        nodePaddingInner: 0,
      })
    );

    series.rectangles.template.setAll({
      strokeWidth: 2,
    });

    // Set transformed and sorted data
    series.data.setAll([hierarchicalData]);

    // Animate on load
    series.appear(1000, 100);

    // Cleanup chart on unmount
    return () => {
      root.dispose();
    };
  }, [data, category_column, value_column, sortOrder]);

  return (
    <div
      ref={chartDivRef}
      style={{
        width: "100%",
        height: "500px", // Adjust height as needed
      }}
    />
  );
};

export default TreemapChart;
