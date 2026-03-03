import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { theme } from '../../styles/theme_cr';
import DateRangePicker from './DateRangePicker';
import SearchInput from './SearchInput';

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'dateRange';
  options?: string[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  filterConfig: FilterConfig[];
  showSearch?: boolean;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
}

const FilterContainer = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[200]};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const FilterTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[700]};
  
  svg {
    color: ${theme.colors.primary[500]};
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${theme.spacing.md};
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const FilterLabel = styled.label`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[900]};
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 38px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  option {
    background: white;
    color: ${theme.colors.gray[900]};
  }
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[900]};
  background: white;
  transition: all 0.2s ease;
  height: 38px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }

  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: transparent;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.gray[600]};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  height: 32px;

  &:hover {
    background: ${theme.colors.error[50]};
    border-color: ${theme.colors.error[300]};
    color: ${theme.colors.error[700]};
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.gray[200]};
  flex-wrap: wrap;
`;

const FilterTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary[50]};
  color: ${theme.colors.primary[700]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  border: 1px solid ${theme.colors.primary[200]};
`;

const RemoveTag = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  background: transparent;
  border: none;
  color: ${theme.colors.primary[500]};
  cursor: pointer;
  border-radius: ${theme.borderRadius.full};
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.primary[100]};
    color: ${theme.colors.primary[800]};
  }
`;

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  filterConfig,
  showSearch = false,
  onSearch,
  searchPlaceholder = 'Search...',
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const renderFilterInput = (config: FilterConfig) => {
    switch (config.type) {
      case 'select':
        return (
          <Select
            value={filters[config.key] || ''}
            onChange={(e) => onFilterChange(config.key, e.target.value)}
          >
            <option value="">All</option>
            {config.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        );
      
      case 'text':
        return (
          <Input
            type="text"
            placeholder={config.placeholder || `Filter by ${config.label}`}
            value={filters[config.key] || ''}
            onChange={(e) => onFilterChange(config.key, e.target.value)}
          />
        );
      
      
      
      
      
      default:
        return null;
    }
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>
          <FaFilter size={14} />
          Filters
          {getActiveFilterCount() > 0 && (
            <span style={{ 
              background: theme.colors.primary[100],
              color: theme.colors.primary[700],
              padding: '2px 8px',
              borderRadius: theme.borderRadius.full,
              fontSize: theme.typography.fontSize.xs,
              marginLeft: theme.spacing.xs
            }}>
              {getActiveFilterCount()} active
            </span>
          )}
        </FilterTitle>
        {getActiveFilterCount() > 0 && (
          <ClearButton onClick={onClearFilters}>
            <FaTimes size={12} />
            Clear all
          </ClearButton>
        )}
      </FilterHeader>

      {showSearch && (
        <div style={{ marginBottom: theme.spacing.lg }}>
          <SearchInput
            value={searchValue}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      <FilterGrid>
        {filterConfig.map((config) => (
          <FilterItem key={config.key}>
            <FilterLabel>{config.label}</FilterLabel>
            {renderFilterInput(config)}
          </FilterItem>
        ))}
      </FilterGrid>

      {getActiveFilterCount() > 0 && (
        <ActiveFilters>
          {Object.entries(filters).map(([key, value]) => {
            if (value && value !== '') {
              const config = filterConfig.find(c => c.key === key || 
                (c.type === 'dateRange' && (key === `${c.key}Start` || key === `${c.key}End`)));
              if (config) {
                const displayKey = key.includes('Start') ? 'Start Date' : 
                                  key.includes('End') ? 'End Date' : config.label;
                return (
                  <FilterTag key={key}>
                    {displayKey}: {value}
                    <RemoveTag onClick={() => onFilterChange(key, '')}>
                      <FaTimes size={10} />
                    </RemoveTag>
                  </FilterTag>
                );
              }
            }
            return null;
          })}
        </ActiveFilters>
      )}
    </FilterContainer>
  );
};

export default FilterBar;