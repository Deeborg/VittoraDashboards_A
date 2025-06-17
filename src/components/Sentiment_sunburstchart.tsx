import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface SunburstData {
  name: string;
  children?: SunburstData[];
  value?: number;
  color?: string;
}

interface SunburstChartProps {
  data: {
    source: string;
    sentiment: string;
    authorCount: number;
  }[];
}

const SunburstChart = ({ data }: SunburstChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // Updated color mapping with sentiment-specific colors
  const colorMap: Record<string, string> = {
    // Source colors
    'News': '#97BDA5',
    'Moneycontrol': '#e66c37',
    'X-Twitter': '#6879E0',
    'X-Turnitus': '#6879E0', // Alternative spelling
    
    // Sentiment colors
    'Positive': '#2BBE72',
    'Negative': '#A1343C',
    'Neutral': '#F0E199',
    'p0': '#2BBE72',  // Mapping p0 to Positive
    'p1': '#A1343C',  // Mapping p1 to Negative
    'p2': '#F0E199'   // Mapping p2 to Neutral
  };

  // Normalize sentiment values
  const normalizeSentiment = (sentiment: string): string => {
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes('positive') || lowerSentiment === 'p0') return 'Positive';
    if (lowerSentiment.includes('negative') || lowerSentiment === 'p1') return 'Negative';
    if (lowerSentiment.includes('neutral') || lowerSentiment === 'p2') return 'Neutral';
    return sentiment;
  };

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // const width = containerRef.current.clientWidth;
    // const height = Math.min(width, 450);

    const size = Math.min(containerWidth, containerHeight, 450);
    const radius = size / 2;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', size)
      .attr('height', size)
      .append('g')
      .attr('transform', `translate(${size / 2},${size / 2})`);

    // Process data into hierarchical format with normalized sentiments
    const processedData = data.reduce((acc, item) => {
      const normalizedSentiment = normalizeSentiment(item.sentiment);
      const sourceNode = acc.find(node => node.name === item.source);
      
      if (sourceNode) {
        const sentimentNode = sourceNode.children!.find(child => child.name === normalizedSentiment);
        if (sentimentNode) {
          sentimentNode.value! += item.authorCount;
        } else {
          sourceNode.children!.push({
            name: normalizedSentiment,
            value: item.authorCount,
            color: colorMap[normalizedSentiment] || '#ccc'
          });
        }
      } else {
        acc.push({
          name: item.source,
          color: colorMap[item.source] || '#ccc',
          children: [{
            name: normalizedSentiment,
            value: item.authorCount,
            color: colorMap[normalizedSentiment] || '#ccc'
          }]
        });
      }
      return acc;
    }, [] as SunburstData[]);

    const root = d3.hierarchy({
      name: 'root',
      children: processedData
    } as SunburstData)
    .sum(d => d.value || 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create partition layout
    const partition = d3.partition<SunburstData>()
      .size([2 * Math.PI, radius * 0.8]);

    const arc = d3.arc<d3.HierarchyRectangularNode<SunburstData>>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(0.01)
      .padRadius(radius / 20)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1);

    // Draw the sunburst
    const nodes = partition(root).descendants();

    svg.selectAll('path')
      .data(nodes.filter(d => d.depth > 0))
      .join('path')
      .attr('d', arc)
      .attr('fill', d => {
        // Use sentiment color for depth 2, source color for depth 1
        return d.depth === 2 ? 
          (colorMap[d.data.name] || d.parent?.data.color || '#ccc') :
          (colorMap[d.data.name] || '#ccc');
      })
      .attr('fill-opacity', 0.85)
      .style('cursor', 'pointer')
      .on('mouseover', function(event: MouseEvent, d) {
  d3.select(this)
    .attr('fill-opacity', 1);
  
  const [x, y] = arc.centroid(d);
  const tooltip = d3.select(tooltipRef.current);

   const containerRect = containerRef.current?.getBoundingClientRect();
  const svgRect = svgRef.current?.getBoundingClientRect();
  
  if (!containerRect || !svgRect) return;
  
  // Position calculation
  const left = x + (svgRect.width / 2) + (containerRect.left - svgRect.left);
  const top = y + (svgRect.height / 2) + (containerRect.top - svgRect.top);

        // Show tooltip
        // const tooltip = d3.select('#sunburst-tooltip');
    tooltip
        .html(`
          <div style="font-weight:bold;margin-bottom:4px;">
            ${d.depth === 1 ? 'Source' : 'Sentiment'}: ${d.data.name}
          </div>
          <div>Authors: ${d.value}</div>
        `)
        .transition()
        .duration(200)
        .style('opacity', 1)
        .style('left', `${left + 20}px`)
        .style('top', `${top + 20}px`);
})
.on('mouseout', function() {
  d3.select(this)
    .attr('fill-opacity', 0.85);
  
  d3.select(tooltipRef.current)
    .transition()
    .duration(200)
    .style('opacity', 0);
});

    // Add labels for the first level (sources)
    svg.selectAll('text.source-label')
      .data(nodes.filter(d => d.depth === 1))
      .join('text')
      .attr('class', 'source-label')
      .attr('transform', d => {
      const angle = (d.x0 + d.x1) / 2 * 180 / Math.PI; // Convert radians to degrees
      const radiusMid = (d.y0 + d.y1) / 2;
      const x = Math.sin(angle * Math.PI / 180) * radiusMid; // Use Math.sin with radians
      const y = -Math.cos(angle * Math.PI / 180) * radiusMid; // Use Math.cos with radians
      const rotation = (angle > 90 && angle < 270) ? (angle + 180) : angle;

      return `translate(${x},${y}) rotate(${rotation})`;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text(d => d.data.name.length > 8 ? d.data.name.slice(0, 15): d.data.name)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', theme.palette.text.primary);

  // Add labels for the second level (sentiments)
  svg.selectAll('text.sentiment-label')
    .data(nodes.filter(d => (d as any).depth === 2))
    .join('text')
    .attr('class', 'sentiment-label')
    .attr('transform', d => {
    const angle = (d.x0 + d.x1) / 2 * 180 / Math.PI; // Convert radians to degrees like source labels
    const radiusMid = (d.y0 + d.y1) / 2;
    const x = Math.sin(angle * Math.PI / 180) * radiusMid; // Use Math.sin with radians
    const y = -Math.cos(angle * Math.PI / 180) * radiusMid; // Use Math.cos with radians
    const rotation = (angle > 90 && angle < 270) ? (angle + 180) : angle; // Same rotation logic
    
    return `translate(${x},${y}) rotate(${rotation})`; // Apply rotation
  })
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => {
    // Only show label if this is the first occurrence of this name
    const firstOccurrence = nodes.findIndex(n => n.data.name === d.data.name) === nodes.indexOf(d);
    return firstOccurrence ? (d.data.name.length > 8 ? d.data.name.slice(0, 7) + '...' : d.data.name) : '';
  })
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .style('fill', theme.palette.text.primary);

  }, [data, theme]);
  

  return (
    <Box sx={{
      height: 400,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      border: '1px solid #E0E0E0',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      position: 'relative',
    }}>
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        bottom:'22px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '&:hover': {
          transform: 'translateY(-5px)',
          transition: 'transform 0.3s ease-in-out'
        }
      }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%', maxWidth: '400px', 
          maxHeight: '400px',marginTop: '40px' }} />
      
      {/* Tooltip */}
      <Box
  ref={tooltipRef}
  sx={{
    position: 'absolute',
    padding: '8px 12px',
    marginLeft: '160px',
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '8px',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out, left 0.2s ease-out, top 0.2s ease-out',
    boxShadow: theme.shadows[4],
    zIndex: 10,
    minWidth: '120px',
    fontSize: '14px',
    '& div': {
      lineHeight: '1.4'
    }
  }}
/>
    </Box>
    </Box>
  );
};

export default SunburstChart;