import { useState, useMemo } from 'react';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function useSorting<T extends Record<string, any>>(
  data: T[],
  initialSortConfig?: SortConfig
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    initialSortConfig || { key: '', direction: 'asc' }
  );

  const sortedData = useMemo(() => {
    if (!sortConfig.key) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) {
        return 0;
      }

      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return {
    sortedData,
    sortConfig,
    handleSort,
  };
}