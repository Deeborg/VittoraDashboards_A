import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt } from 'react-icons/fa';
import { format, isValid, parse } from 'date-fns';
import { theme } from '../../styles/theme';

const Container = styled.div`
  position: relative;
  display: flex;
  gap: ${theme.spacing.sm};
`;

const DateInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const DateIcon = styled(FaCalendarAlt)`
  position: absolute;
  left: ${theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray[400]};
  font-size: ${theme.typography.fontSize.sm};
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-left: 2.25rem;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.base};
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

const Separator = styled.span`
  display: flex;
  align-items: center;
  color: ${theme.colors.gray[400]};
  font-size: ${theme.typography.fontSize.sm};
`;

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const [startInputValue, setStartInputValue] = useState(startDate);
  const [endInputValue, setEndInputValue] = useState(endDate);

  const formatDateForInput = (date: string) => {
    if (!date) return '';
    const parsedDate = new Date(date);
    return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : '';
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartInputValue(value);
    
    if (value) {
      const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
      if (isValid(parsedDate)) {
        onStartDateChange(value);
      }
    } else {
      onStartDateChange('');
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndInputValue(value);
    
    if (value) {
      const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
      if (isValid(parsedDate)) {
        onEndDateChange(value);
      }
    } else {
      onEndDateChange('');
    }
  };

  useEffect(() => {
    setStartInputValue(formatDateForInput(startDate));
  }, [startDate]);

  useEffect(() => {
    setEndInputValue(formatDateForInput(endDate));
  }, [endDate]);

  return (
    <Container>
      <DateInputWrapper>
        <DateIcon size={14} />
        <Input
          type="date"
          value={startInputValue}
          onChange={handleStartChange}
          placeholder="Start date"
        />
      </DateInputWrapper>
      <Separator>to</Separator>
      <DateInputWrapper>
        <DateIcon size={14} />
        <Input
          type="date"
          value={endInputValue}
          onChange={handleEndChange}
          placeholder="End date"
        />
      </DateInputWrapper>
    </Container>
  );
};

export default DateRangePicker;