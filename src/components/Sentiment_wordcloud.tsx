import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { Box, Typography } from '@mui/material';

interface WordData {
  text: string;
  value: number; // This represents the "Count of source"
}

interface WordCloudChartProps {
  width: number;
  height: number;
  words: WordData[];
}

const WordCloudChart: React.FC<WordCloudChartProps> = ({ width, height, words }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!words.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const filteredWords = words.filter(d => !d.text.toLowerCase().includes('cement'));

    const maxVal = d3.max(words, d => d.value) || 1;
    const minVal = d3.min(words, d => d.value) || 1;

    // Adjusted font size scale:
    const fontSizeScale = d3.scalePow()
      .exponent(0.2) // Even lower exponent for wider distribution of sizes
      .domain([minVal, maxVal])
      .range([8, 90]); // Min font size 8px, Max font size 90px

    const layout = cloud()
      .size([width, height * 0.98]) // Utilize almost full width and height
      .words(filteredWords.map(d => ({ text: d.text, size: fontSizeScale(d.value), value: d.value })))
      .padding(1) // Very tight padding
      .rotate(() => (Math.random() < 0.95 ? 0 : Math.random() * 20 - 10)) // Even more horizontal words (95%), very slight rotation for others
      .font('Inter, sans-serif')
      .fontSize(d => (d.size as number))
      .spiral('archimedean') // Consider 'rectangular' if 'archimedean' still clusters too much
      .on('end', draw);

    layout.start();

    function draw(words: cloud.Word[]) {
      // Remove the central translation and let words naturally position within the layout boundaries
      svg
        .append('g')
        // .attr('transform', `translate(${width / 2},${height / 2})`) // <--- REMOVE THIS LINE
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'Inter, sans-serif')
        .style('fill', (_, i) => schemeCategory10[i % 10])
        .style('font-weight', '600')
        .attr('text-anchor', 'middle')
        .style('cursor', 'pointer')
        .attr('transform', d => `translate(${(d.x ?? 0) + width / 2},${(d.y ?? 0) + height / 2})rotate(${d.rotate})`) // <--- ADJUSTED TRANSLATION HERE
        .text(d => d.text ?? '')
        .append('title')
        .text(d => `${d.text}: ${(d as WordData).value}`);
    }
  }, [words, width, height]);

  return (
    <Box sx={{
      height: 500,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      border: '1px solid #E0E0E0',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#FFFFFF'
    }}>
      {/* <Box sx={{
        width: '100%',
        backgroundColor: '#1A237E',
        color: '#FFFFFF',
        p: 1.5,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        borderBottom: '1px solid #1A237E'
      }}>
        Word Cloud
      </Box> */}

      {words.length > 0 ? (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <svg ref={svgRef} width={width} height={height} />
        </Box>
      ) : (
        <Typography sx={{ textAlign: 'center', my: 2 }}>
          No word data available to display the word cloud.
        </Typography>
      )}
    </Box>
  );
};

export default WordCloudChart;