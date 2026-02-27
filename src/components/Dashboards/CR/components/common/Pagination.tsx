import React from 'react';
import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { theme } from '../../styles/theme';

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md} 0;
`;

const PaginationInfo = styled.div`
  color: ${theme.colors.gray[600]};
  font-size: ${theme.typography.fontSize.sm};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const PageButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 ${theme.spacing.sm};
  border: 1px solid ${props => props.$active ? theme.colors.primary[500] : theme.colors.gray[200]};
  background: ${props => props.$active ? theme.colors.primary[500] : 'white'};
  color: ${props => props.$active ? 'white' : theme.colors.gray[700]};
  border-radius: ${theme.borderRadius.base};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? theme.colors.primary[600] : theme.colors.gray[100]};
    border-color: ${props => props.$active ? theme.colors.primary[600] : theme.colors.gray[300]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Ellipsis = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: ${theme.colors.gray[500]};
  font-size: ${theme.typography.fontSize.sm};
`;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
}
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showPageSize = false,
  pageSizeOptions = [10, 25, 50, 100],
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis-start');
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }

    return pages;
  };
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
 if (showPageSize && onPageSizeChange) {
    return (
      <PaginationContainer>
        <PaginationInfo>   
            Showing {startItem} to {endItem} of {totalItems} entries
        </PaginationInfo>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <span style={{ color: theme.colors.gray[600], fontSize: theme.typography.fontSize.sm }}>
            Items per page:
            </span>
            <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                style={{
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.gray[300]}`,
                    borderRadius: theme.borderRadius.base,
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.gray[700],
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
            >   
                {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                        {size} 
)              </option>
                ))}
            </select>  
        </div>
        </PaginationContainer>
    );
    }

  return (
    <PaginationContainer>
      <PaginationInfo>
        Showing {startItem} to {endItem} of {totalItems} entries
      </PaginationInfo>
      <PaginationControls>
        <PageButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <FaAngleDoubleLeft size={14} />
        </PageButton>
        <PageButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaChevronLeft size={14} />
        </PageButton>

        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>;
          }

          return (
            <PageButton
              key={page}
              $active={page === currentPage}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </PageButton>
          );
        })}

        <PageButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight size={14} />
        </PageButton>
        <PageButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <FaAngleDoubleRight size={14} />
        </PageButton>
      </PaginationControls>
    </PaginationContainer>
  );
};

export default Pagination;