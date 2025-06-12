import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5wc from "@amcharts/amcharts5/wc";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataPorts {
  data: Record<string, any>[]; 
  CategoryColumn: string; 
  ValueColumn: string; 
}

const WordCloudChart: React.FC<DataPorts> = ({ data, CategoryColumn, ValueColumn, }) => {
  const chartDivRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    
    // Ensure that the div reference is available
    if (!chartDivRef.current) return;

    // Create the root element
    const root = am5.Root.new(chartDivRef.current);

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create the word cloud series
    const series = root.container.children.push(
      am5wc.WordCloud.new(root, {
        categoryField: CategoryColumn, // Field for words
        valueField: ValueColumn, // Field for word size (weight)
        maxFontSize: am5.percent(15), 
        minFontSize:am5.percent(5),  
        
       
      })
    );
    // series.labels.template.adapters.add("rotation", () => {
    //   return 0;
    // });

    // Configure labels for the word cloud
    series.labels.template.setAll({
      fontFamily: "Courier New",
      
    });

    // Set the data for the word cloud
    series.data.setAll(data);

    
    return () => {
      root.dispose();
    };
  }, [data, ValueColumn, CategoryColumn]); 

  return <div ref={chartDivRef} style={{ width: "100%", height: "500px" }} />;
};

export default WordCloudChart;
