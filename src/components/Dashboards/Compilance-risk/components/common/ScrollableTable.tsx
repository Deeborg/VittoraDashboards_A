import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[200]};
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.gray[100]};
    border-radius: ${theme.borderRadius.full};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.gray[400]};
    border-radius: ${theme.borderRadius.full};
    
    &:hover {
      background: ${theme.colors.gray[500]};
    }
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

const Th = styled.th`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.gray[50]};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[700]};
  font-size: ${theme.typography.fontSize.sm};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  text-align: left;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  color: ${theme.colors.gray[700]};
  font-size: ${theme.typography.fontSize.sm};
  white-space: nowrap;
`;

const EmptyMessage = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.gray[500]};
  font-size: ${theme.typography.fontSize.sm};
`;

interface Column {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode;
}

interface ScrollableTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (item: any) => void;
}

export const ScrollableTable: React.FC<ScrollableTableProps> = ({
  columns,
  data,
  onRowClick,
}) => {
  if (data.length === 0) {
    return (
      <TableWrapper>
        <EmptyMessage>No data available</EmptyMessage>
      </TableWrapper>
    );
  }

  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            {columns.map((column) => (
              <Th key={column.key}>{column.header}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              onClick={() => onRowClick?.(item)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => (
                <Td key={`${item.id}-${column.key}`}>
                  {column.render ? column.render(item) : item[column.key]}
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};