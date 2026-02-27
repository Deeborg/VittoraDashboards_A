import React, { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  Stack,
  Typography,
  TextField,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

interface DateFilterProps {
  onDateChange?: (startDate: Date | null, endDate: Date | null) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ onDateChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [displayText, setDisplayText] = useState<string>('Select Date Range');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setDisplayText(`Last ${days} days`);
    
    if (onDateChange) {
      onDateChange(start, end);
    }
    handleClose();
  };

  const handleApply = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && end) {
      setDisplayText(`${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`);
    }
    
    if (onDateChange) {
      onDateChange(start, end);
    }
    handleClose();
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setDisplayText('Select Date Range');
    if (onDateChange) {
      onDateChange(null, null);
    }
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<CalendarIcon />}
        endIcon={<FilterIcon />}
        onClick={handleClick}
        sx={{
          justifyContent: 'space-between',
          width: '100%',
          textTransform: 'none',
          backgroundColor: 'white',
        }}
      >
        <Typography variant="body2" noWrap>
          {displayText}
        </Typography>
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, width: 320 } }}
      >
        <Stack spacing={2}>
          <Typography variant="subtitle2" fontWeight={600}>
            Quick Select
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button size="small" variant="outlined" onClick={() => handleQuickSelect(7)}>7 Days</Button>
            <Button size="small" variant="outlined" onClick={() => handleQuickSelect(30)}>30 Days</Button>
            <Button size="small" variant="outlined" onClick={() => handleQuickSelect(90)}>90 Days</Button>
          </Box>

          <Typography variant="subtitle2" fontWeight={600}>
            Custom Range
          </Typography>

          <TextField
            label="Start Date"
            type="date"
            size="small"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            label="End Date"
            type="date"
            size="small"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleClear}>
              Clear
            </Button>
            <Button size="small" variant="contained" onClick={handleApply}>
              Apply
            </Button>
          </Box>
        </Stack>
      </Popover>
    </Box>
  );
};

export default DateFilter;