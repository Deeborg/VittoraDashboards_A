import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ←
      </button>
      
      {getPageNumbers().map((page, index) => (
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="pagination__ellipsis">...</span>
        ) : (
          <button
            key={page}
            className={`pagination__btn ${currentPage === page ? 'pagination__btn--active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        className="pagination__btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        →
      </button>
      
      <span className="pagination__info">
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
      </span>
    </div>
  );
};

export default Pagination;