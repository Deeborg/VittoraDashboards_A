import React, { useState } from 'react';
import styles from './RatioAnalysisPage.module.css';

interface RatioCategory {
  id: string;
  name: string;
  color: string;
}

interface CurvedPathProps {
  categories: RatioCategory[];
  selectedCategory: string | null;
  onSelectCategory: (id: string) => void;
}

const CurvedPath: React.FC<CurvedPathProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const numCategories = categories.length;
  const pathStart = { x: 80, y: 30 };
  const pathEnd = { x: 80, y: 30 + (numCategories - 1) * 60 };
  const curveControlOffset = 200;
  const dotRadius = 14;
  const selectedDotRadius = 17;

  const internalDotPositions = [
    { x: 70, y: 25 },
    { x: 167, y: 70 },
    { x: 230, y: 150 },
    { x: 173, y: 228 },
    { x: 87, y: 265 },
  ];

  const directionMap: ("left" | "right")[] = ["right", "right", "right", "right", "right"]; // Customize direction

  const generateCurvedPath = () => {
    if (numCategories <= 1) return '';
    const controlX = pathStart.x + curveControlOffset;
    const controlYStart = pathStart.y + ((numCategories - 1) * 60) / 4;
    const controlYEnd = pathStart.y + (3 * (numCategories - 1) * 60) / 4;
    return `M ${pathStart.x} ${pathStart.y} C ${controlX} ${controlYStart}, ${controlX} ${controlYEnd}, ${pathEnd.x} ${pathEnd.y}`;
  };

  return (
    <div className="relative h-full min-h-[300px] w-full">
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ minHeight: '300px' }}
        viewBox={`0 0 ${pathStart.x + curveControlOffset + 100} ${Math.max(300, (numCategories - 1) * 60 + 100)}`}
        preserveAspectRatio="xMinYMin meet"
      >
        {/* Curved connecting path */}
        <path
          d={generateCurvedPath()}
          fill="none"
          stroke="#CBD5E1"
          strokeWidth={5}
          strokeLinecap="round"
        />

        {/* Render each category node */}
        {categories.map((category, index) => {
          const position = internalDotPositions[index] || {
            x: pathStart.x,
            y: pathStart.y + index * 60,
          };
          const direction = directionMap[index] || 'right';
          const textXPosition = direction === 'right' ? position.x + 25 : position.x - 25;
          const textAnchor = direction === 'right' ? 'start' : 'end';
          const isSelected = selectedCategory === category.id;

          return (
            <g
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="cursor-pointer transition-all duration-300"
            >
              <circle
                cx={position.x}
                cy={position.y}
                r={isSelected ? selectedDotRadius : dotRadius}
                fill={category.color}
                stroke={category.color}
                strokeWidth={2}
              />
              <text
                x={textXPosition}
                y={position.y + 8}
                fill={isSelected ? "red" : category.color}
                fontSize={isSelected ? "14px" : "14px"}
                fontWeight={isSelected ? "bold" : "500px"}
                textAnchor={textAnchor}
              >
                {category.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default CurvedPath;
