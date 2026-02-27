import { useState, useMemo, useCallback } from 'react';

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'dateRange';
  options?: string[];
  placeholder?: string;
}

export function useFilters<T extends Record<string, any>>(
  data: T[],
  filterConfig: FilterConfig[] // Use this parameter
) {
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Use filterConfig to initialize filters if needed
  const initialFilters = useMemo(() => {
    const initial: Record<string, any> = {};
    filterConfig.forEach(config => {
      if (config.type === 'dateRange') {
        initial[`${config.key}Start`] = '';
        initial[`${config.key}End`] = '';
      } else {
        initial[config.key] = '';
      }
    });
    return initial;
  }, [filterConfig]);

  // Merge initial filters with any existing filters
  useState(() => {
    setFilters(prev => ({ ...initialFilters, ...prev }));
  });
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue || filterValue === '') {
          return true;
        }

        const itemValue = item[key];
        
        if (typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(filterValue.toLowerCase());
        }
        
        if (typeof itemValue === 'number') {
          return itemValue === Number(filterValue);
        }
        
        if (Array.isArray(itemValue)) {
          return itemValue.some((v) =>
            v.toLowerCase().includes(filterValue.toLowerCase())
          );
        }
        
        if (itemValue instanceof Date || (typeof itemValue === 'string' && key.includes('Date'))) {
          const itemDate = new Date(itemValue).toISOString().split('T')[0];
          return itemDate === filterValue;
        }
        
        return itemValue === filterValue;
      });
    });
  }, [data, filters]);

  const getActiveFilterCount = useCallback(() => {
    return Object.values(filters).filter((v) => v && v !== '').length;
  }, [filters]);

  return {
    filters,
    filteredData,
    updateFilter,
    clearFilters,
    removeFilter,
    getActiveFilterCount,
  };
}