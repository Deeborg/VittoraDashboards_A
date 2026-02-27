import React, { useEffect, useRef } from 'react';
import './HexagonalChart.css';

interface HexagonalChartProps {
  data?: number[];
  title?: string;
}

const HexagonalChart: React.FC<HexagonalChartProps> = ({ 
  data = [0, 1, 2, 3], // X-axis values
  title = "Hexagonal Analysis Chart" 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Y-axis labels (0 to 100)
  const yAxisLabels = ['100', '90', '80', '70', '60', '50', '40', '30', '20', '10', '0'];
  
  // X-axis labels
  const xAxisLabels = ['0', '1', '2', '3'];
  
  useEffect(() => {
    if (svgRef.current) {
      drawHexGrid(svgRef.current);
    }
  }, []);

  const drawHexGrid = (svg: SVGSVGElement) => {
    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 400;
    
    // Hexagon parameters
    const hexRadius = 30;
    const hexWidth = hexRadius * 2;
    const hexHeight = hexRadius * 1.732; // sqrt(3) * radius
    
    // Calculate grid dimensions
    const cols = 4; // 0-3
    const rows = 5; // For different value ranges
    
    // Create hex grid
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Calculate hex position with offset for odd rows
        const x = col * hexWidth * 0.75 + hexRadius;
        const y = row * hexHeight + (col % 2 === 0 ? 0 : hexHeight / 2);
        
        // Only draw if within view
        if (y < height - hexRadius) {
          const hexagon = createHexagon(x, y, hexRadius);
          hexagon.setAttribute('class', 'hex-cell');
          hexagon.setAttribute('fill', getColorByValue(row, col));
          hexagon.setAttribute('stroke', '#cbd5e1');
          hexagon.setAttribute('stroke-width', '1');
          
          // Add click handler
          hexagon.addEventListener('click', () => {
            console.log(`Hex clicked: row=${row}, col=${col}`);
          });
          
          svg.appendChild(hexagon);
          
          // Add text label
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', x.toString());
          text.setAttribute('y', y.toString());
          text.setAttribute('class', 'hex-text');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'middle');
          text.textContent = `${col}`;
          svg.appendChild(text);
        }
      }
    }
    
    // Add grid lines for better reference
    drawGridLines(svg, width, height);
  };

  const createHexagon = (cx: number, cy: number, r: number): SVGElement => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 30) * Math.PI / 180;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points.join(' '));
    return polygon;
  };

  const drawGridLines = (svg: SVGSVGElement, width: number, height: number) => {
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', width.toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('class', 'hex-grid-line-horizontal');
      svg.appendChild(line);
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = (width / 4) * i;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x.toString());
      line.setAttribute('y1', '0');
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', height.toString());
      line.setAttribute('class', 'hex-grid-line-vertical');
      svg.appendChild(line);
    }
  };

  const getColorByValue = (row: number, col: number): string => {
    // Color based on value (example: darker for higher values)
    const value = (row * col) / 15; // 0-1 scale
    const intensity = Math.floor(200 - value * 100);
    return `rgb(59, 130, ${intensity})`;
  };

  return (
    <div className="hexagonal-chart-container">
      <h3 className="hex-chart-title">{title}</h3>
      
      <div className="hex-chart-wrapper">
        {/* Y-axis */}
        <div className="hex-y-axis">
          {yAxisLabels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="hex-chart-area">
          <div className="hex-svg-container">
            <svg 
              ref={svgRef} 
              width="100%" 
              height="100%" 
              viewBox="0 0 800 400"
              preserveAspectRatio="xMidYMid meet"
            />
          </div>
        </div>

        {/* Right padding column */}
        <div style={{ gridColumn: 3, gridRow: 1 }} />

        {/* X-axis */}
        <div className="hex-x-axis">
          {xAxisLabels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HexagonalChart;