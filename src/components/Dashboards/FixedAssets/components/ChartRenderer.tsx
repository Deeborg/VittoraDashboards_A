import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface Props {
  data: any[];
}

const CategoryChart: React.FC<Props> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const categories = data.map((a) => a.category);
    const values = data.map((a) => a.grossValue);

    const chart = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: categories,
        datasets: [
          {
            label: "Gross Value",
            data: values,
          },
        ],
      },
    });

    return () => chart.destroy();
  }, [data]);

  return <canvas ref={canvasRef}></canvas>;
};

export default CategoryChart;