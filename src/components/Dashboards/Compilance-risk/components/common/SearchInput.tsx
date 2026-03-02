import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { theme } from '../../styles/theme_cr';

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: ${theme.spacing.md};
  color: ${theme.colors.gray[400]};
  font-size: ${theme.typography.fontSize.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
  transition: all 0.2s ease;

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
  position: absolute;
  right: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xs};
  background: transparent;
  border: none;
  color: ${theme.colors.gray[400]};
  cursor: pointer;
  border-radius: ${theme.borderRadius.full};
  transition: all 0.2s ease;

  &:hover {
    color: ${theme.colors.gray[600]};
    background: ${theme.colors.gray[100]};
  }
`;

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  style?: React.CSSProperties;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  style,
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(inputValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, onChange, debounceMs]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <SearchContainer style={style}>
      <SearchIcon size={14} />
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
      />
      {inputValue && (
        <ClearButton onClick={() => setInputValue('')}>
          <FaTimes size={14} />
        </ClearButton>
      )}
    </SearchContainer>
  );
};

export default SearchInput;