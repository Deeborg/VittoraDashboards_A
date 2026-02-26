import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getFilteredData } from '../services/dataService';
import type { FilterState } from '../services/dataService';
import type { ExceptionRecord } from '../data/mockExceptions';

interface FilterContextType {
    filters: FilterState;
    setFilters: (filters: Partial<FilterState>) => void;
    resetFilters: () => void;
    filteredData: ExceptionRecord[];
}

const defaultFilters: FilterState = {
    dateRange: { start: '2024-02-01', end: '2025-02-01' },
    department: 'All',
    category: 'All',
};

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
    const [filters, setFiltersState] = useState<FilterState>(defaultFilters);

    const setFilters = useCallback((partial: Partial<FilterState>) => {
        setFiltersState(prev => ({ ...prev, ...partial }));
    }, []);

    const resetFilters = useCallback(() => {
        setFiltersState(defaultFilters);
    }, []);

    const filteredData = useMemo(() => getFilteredData(filters), [filters]);

    return (
        <FilterContext.Provider value={{ filters, setFilters, resetFilters, filteredData }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter(): FilterContextType {
    const ctx = useContext(FilterContext);
    if (!ctx) throw new Error('useFilter must be used within FilterProvider');
    return ctx;
}
