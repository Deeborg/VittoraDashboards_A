import React from 'react';
import styled from 'styled-components';
import { FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { theme } from '../../styles/theme_cr';

const TableScrollWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
  border-radius: ${theme.borderRadius.lg};
  
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

const TableContainer = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[200]};
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: ${theme.shadows.sm};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  background: white;
`;

const Th = styled.th<{ $sortable?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.gray[50]};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[700]}; /* Changed from gray[50] to gray[700] for dark text on light background */
  font-size: ${theme.typography.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  cursor: ${props => props.$sortable ? 'pointer' : 'default'};
  user-select: none;
  white-space: nowrap;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.$sortable ? theme.colors.gray[100] : theme.colors.gray[50]};
  }
`;

const Td = styled.td`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.gray[100]};
  color: ${theme.colors.gray[700]}; /* Changed from gray[50] to gray[700] for dark text on white background */
  font-size: ${theme.typography.fontSize.sm};
  background: white;
`;

const Tr = styled.tr<{ $clickable?: boolean }>`
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.$clickable ? theme.colors.gray[50] : 'transparent'};
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  }

  &:last-child td {
    border-bottom: none;
  }
`;

const SortIcon = styled.span`
  margin-left: ${theme.spacing.xs};
  color: ${theme.colors.gray[400]};
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.gray[200]};
  background: white;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const PaginationInfo = styled.div`
  color: ${theme.colors.gray[600]};
  font-size: ${theme.typography.fontSize.sm};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;

const PaginationButton = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  padding: 0 ${theme.spacing.sm};
  border: 1px solid ${props => props.$active ? theme.colors.primary[500] : theme.colors.gray[200]};
  background: ${props => props.$active ? theme.colors.primary[500] : 'white'};
  color: ${props => props.$active ? 'white' : theme.colors.gray[700]};
  border-radius: ${theme.borderRadius.base};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${props => props.$active ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? theme.colors.primary[600] : theme.colors.gray[100]};
    border-color: ${props => props.$active ? theme.colors.primary[600] : theme.colors.gray[300]};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Ellipsis = styled.span`
  color: ${theme.colors.gray[500]};
  padding: 0 ${theme.spacing.xs};
`;

const EmptyState = styled.div`
  padding: ${theme.spacing['3xl']};
  text-align: center;
  color: ${theme.colors.gray[500]};
  font-size: ${theme.typography.fontSize.sm};
  background: white;
`;

interface Column<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
    onSort: (key: string) => void;
  };
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  pagination,
  sortConfig,
}: DataTableProps<T>) {
  const renderSortIcon = (column: Column) => {
    if (!column.sortable) return null;
    
    if (sortConfig?.key === column.key) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    
    return <FaSort />;
  };

  if (data.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <p>No data available</p>
        </EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <TableScrollWrapper>
        <Table>
          <thead>
            <tr>
              {columns.map((column) => (
                <Th
                  key={column.key}
                  $sortable={column.sortable}
                  onClick={() => column.sortable && sortConfig?.onSort(column.key)}
                >
                  {column.header}
                  <SortIcon>{renderSortIcon(column)}</SortIcon>
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <Tr
                key={item.id || index}
                $clickable={!!onRowClick}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <Td key={`${item.id || index}-${column.key}`}>
                    {column.render ? column.render(item) : item[column.key]}
                  </Td>
                ))}
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableScrollWrapper>

      {pagination && (
        <PaginationContainer>
          <PaginationInfo>
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
            {pagination.totalItems} entries
          </PaginationInfo>
          <PaginationControls>
            <PaginationButton
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <FaChevronLeft />
            </PaginationButton>
            
            {[...Array(pagination.totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              if (
                pageNumber === 1 ||
                pageNumber === pagination.totalPages ||
                (pageNumber >= pagination.currentPage - 1 &&
                  pageNumber <= pagination.currentPage + 1)
              ) {
                return (
                  <PaginationButton
                    key={pageNumber}
                    $active={pageNumber === pagination.currentPage}
                    onClick={() => pagination.onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationButton>
                );
              } else if (
                pageNumber === pagination.currentPage - 2 ||
                pageNumber === pagination.currentPage + 2
              ) {
                return <Ellipsis key={pageNumber}>...</Ellipsis>;
              }
              return null;
            })}
            
            <PaginationButton
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <FaChevronRight />
            </PaginationButton>
          </PaginationControls>
        </PaginationContainer>
      )}
    </TableContainer>
  );
}