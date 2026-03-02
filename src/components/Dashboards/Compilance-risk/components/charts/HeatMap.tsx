import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme_cr';

const HeatMapContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Matrix = styled.div`
  display: inline-block;
  min-width: 100%;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.xs};
`;

const RowLabel = styled.div`
  width: 120px;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
  padding-right: ${theme.spacing.md};
`;

const Cells = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex: 1;
`;

const Cell = styled.div<{ $value: number; $maxValue: number }>`
  flex: 1;
  height: 40px;
  background: ${props => {
    const intensity = props.$value / props.$maxValue;
    if (intensity < 0.2) return theme.colors.primary[50];
    if (intensity < 0.4) return theme.colors.primary[100];
    if (intensity < 0.6) return theme.colors.primary[200];
    if (intensity < 0.8) return theme.colors.primary[300];
    if (intensity < 0.9) return theme.colors.primary[400];
    return theme.colors.primary[500];
  }};
  border-radius: ${theme.borderRadius.base};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.xs};
  color: ${props => props.$value / props.$maxValue > 0.6 ? 'white' : theme.colors.gray[700]};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.md};
  }
`;

const ColumnLabels = styled.div`
  display: flex;
  margin-left: 136px;
  margin-bottom: ${theme.spacing.md};
`;

const ColumnLabel = styled.div`
  flex: 1;
  text-align: center;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray[500]};
  font-weight: ${theme.typography.fontWeight.medium};
  padding: ${theme.spacing.xs};
`;

interface HeatMapProps {
  data: {
    rows: string[];
    columns: string[];
    values: number[][];
  };
  onCellClick?: (row: string, column: string, value: number) => void;
}

const HeatMap: React.FC<HeatMapProps> = ({ data, onCellClick }) => {
  const maxValue = Math.max(...data.values.flat());

  return (
    <HeatMapContainer>
      <Matrix>
        <ColumnLabels>
          <ColumnLabel style={{ visibility: 'hidden' }}> </ColumnLabel>
          {data.columns.map((column) => (
            <ColumnLabel key={column}>{column}</ColumnLabel>
          ))}
        </ColumnLabels>
        
        {data.rows.map((row, rowIndex) => (
          <Row key={row}>
            <RowLabel>{row}</RowLabel>
            <Cells>
              {data.values[rowIndex].map((value, colIndex) => (
                <Cell
                  key={`${row}-${data.columns[colIndex]}`}
                  $value={value}
                  $maxValue={maxValue}
                  onClick={() => onCellClick?.(row, data.columns[colIndex], value)}
                  title={`${row} - ${data.columns[colIndex]}: ${value}`}
                >
                  {value}
                </Cell>
              ))}
            </Cells>
          </Row>
        ))}
      </Matrix>
    </HeatMapContainer>
  );
};

export default HeatMap;