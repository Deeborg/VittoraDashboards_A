import { useState, useMemo } from 'react';

export function usePagination<T>(
  data: T[],
  pageSize: number = 10,
  initialPage: number = 1
) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const totalItems = data.length;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  const pagination = {
    currentPage,
    totalPages,
    pageSize: itemsPerPage,
    totalItems,
    onPageChange: setCurrentPage,
    onPageSizeChange: setItemsPerPage,
  };

  return {
    paginatedData,
    pagination,
    setPage: setCurrentPage,
    setPageSize: setItemsPerPage,
  };
}