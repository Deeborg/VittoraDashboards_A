import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface BubbleChartProps {
  data: Record<string, any>[];
  CategoryColumn: string;
  ValueColumn: string;
}

interface BubbleNodeData {
  name: string;
  value: number;
}

const BubbleChart: React.FC<BubbleChartProps> = ({
  data,
  CategoryColumn,
  ValueColumn,
}) => {
  const chartDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartDivRef.current) return;

    const root = am5.Root.new(chartDivRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const formattedData = {
      value: 0,
      children: data.map((item) => ({
        name: item[CategoryColumn],
        value: Number(item[ValueColumn]) || 0,
      })),
    };

    const series = root.container.children.push(
      am5hierarchy.ForceDirected.new(root, {
        downDepth: 1,
        initialDepth: 2,
        topDepth: 1,
        valueField: "value",
        categoryField: "name",
        childDataField: "children",
        minRadius: 40,
        maxRadius: 80,
      })
    );

    const formatNumber = (num: string | number): string => {
      const parsed = typeof num === "string" ? parseFloat(num) : num;
      if (isNaN(parsed)) return "N/A";

      if (parsed >= 1e9) return (parsed / 1e9).toFixed(1) + "B";
      if (parsed >= 1e6) return (parsed / 1e6).toFixed(1) + "M";
      if (parsed >= 1e3) return (parsed / 1e3).toFixed(1) + "K";
      return parsed.toString();
    };

    series.nodes.template.setAll({
      tooltipHTML: "<strong>{name}</strong><br/><span>{value}</span>",
    });

    series.nodes.template.adapters.add("tooltipHTML", (html, target) => {
      const data = target.dataItem?.dataContext as BubbleNodeData | undefined;
      if (data) {
        return `<strong>${data.name}</strong><br/><span>${formatNumber(
          data.value
        )}</span>`;
      }
      return html;
    });

    series.data.setAll([formattedData]);
    series.appear(2000, 800);

    return () => {
      root.dispose();
    };
  }, [data, CategoryColumn, ValueColumn]);

  return <div ref={chartDivRef} style={{ width: "100%", height: "500px" }} />;
};

export default BubbleChart;
