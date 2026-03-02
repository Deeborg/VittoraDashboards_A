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
  background: ${theme.colors.background.card};
  border-radius: ${theme.borderRadius['2xl']};
  border: 1px solid ${theme.colors.border.medium};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.card};
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.md};
`;

const FilterTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
  color: ${theme.colors.text.secondary};
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  background: ${theme.colors.background.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[900]};
  }
  
  option {
    background: ${theme.colors.background.card};
    color: ${theme.colors.text.primary};
  }
`;
const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  background: ${theme.colors.background.secondary};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[900]};
  }

  &::placeholder {
    color: ${theme.colors.text.muted};
  }
`;
const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: transparent;
  border: none;
  color: ${theme.colors.gray[500]};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${theme.colors.error[500]};
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.light};
  flex-wrap: wrap;
`;

const FilterTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary[900]};
  color: ${theme.colors.primary[300]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  border: 1px solid ${theme.colors.primary[700]};
`;

const RemoveTag = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  background: transparent;
  border: none;
  color: ${theme.colors.primary[600]};
  cursor: pointer;
  border-radius: ${theme.borderRadius.full};

  &:hover {
    background: ${theme.colors.primary[100]};
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
      
      case 'date':
        return (
          <Input
            type="date"
            value={filters[config.key] || ''}
            onChange={(e) => onFilterChange(config.key, e.target.value)}
          />
        );
      
      case 'dateRange':
        return (
          <DateRangePicker
            startDate={filters[`${config.key}Start`] || ''}
            endDate={filters[`${config.key}End`] || ''}
            onStartDateChange={(date) => onFilterChange(`${config.key}Start`, date)}
            onEndDateChange={(date) => onFilterChange(`${config.key}End`, date)}
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
            <span style={{ color: theme.colors.primary[600] }}>
              ({getActiveFilterCount()} active)
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
        <SearchInput
          value={searchValue}
          onChange={handleSearch}
          placeholder={searchPlaceholder}
          style={{ marginBottom: theme.spacing.md }}
        />
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