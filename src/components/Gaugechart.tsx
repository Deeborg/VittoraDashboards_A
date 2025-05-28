import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface GaugeChartProps {
    value: number;
    title: string;
    min: number;
    max: number;
    colorRanges?: { start: number; color: string }[];
}

const GaugeChart: React.FC<GaugeChartProps> = ({
    value,
    title,
    min,
    max,
    colorRanges = [],
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = 300;
        const height = 200;
        const radius = Math.min(width, height) / 2;

        // Clear previous rendering
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2 + 20})`);

        // Scale to correctly map value within min-max range
        const scale = d3.scaleLinear()
            .domain([min, max])
            .range([-Math.PI / 2, Math.PI / 2]);

        // Adjust color range end dynamically
        const updatedZones = colorRanges.map((range, index) => ({
            ...range,
            end: index < colorRanges.length - 1 ? colorRanges[index + 1].start : max,
        }));

        const arcZone = d3.arc()
            .innerRadius(radius - 40)
            .outerRadius(radius - 10)
            .startAngle((d: any) => scale(d.start))
            .endAngle((d: any) => scale(d.end));

        g.selectAll(".zone")
            .data(updatedZones)
            .enter()
            .append("path")
            .attr("class", "zone")
            .style("fill", d => d.color)
            .attr("d", arcZone as any);

        // ** Correcting Needle Position **
        const needleScale = d3.scaleLinear()
            .domain([min, max]) // Each gauge respects its specific range
            .range([-180, 0]); // Ensures rotation maps correctly

        const needleAngle = needleScale(value); // Correctly scales needle within range
        const needleLength = radius - 50;
        const needleRadius = 8;

        const needle = g.append("g")
            .attr("class", "needle")
            .attr("transform", `rotate(${needleAngle})`);

        needle.append("path")
            .attr("d", `M ${-needleRadius} 0 L ${needleLength} 0 L 0 ${-needleRadius} Z`)
            .style("fill", "#374151");

        needle.append("circle")
            .attr("r", needleRadius)
            .style("fill", "#374151");

        // Min value label (left side)
        g.append("text")
            .attr("x", -radius + 20)
            .attr("y", radius - 80) // Adjusted upward for better alignment
            .attr("text-anchor", "start")
            .style("font-size", "16px")
            .style("fill", "#4b5563")
            .text(min.toFixed(2));

        // Max value label (right side)
        g.append("text")
            .attr("x", radius - 20)
            .attr("y", radius - 80) // Adjusted upward
            .attr("text-anchor", "end")
            .style("font-size", "16px")
            .style("fill", "#4b5563")
            .text(max.toFixed(2));

        g.append("text")
            .attr("class", "title")
            .attr("y", -radius + 3)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("fill", "#4b5563")
            .text(title);

        g.append("text")
            .attr("class", "value")
            .attr("y", radius - 50)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .style("fill", "#111827")
            .text(value.toFixed(2));

    }, [value, title, min, max, colorRanges]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default GaugeChart;