import React, { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  Stack,
  Typography,
  TextField,
  Chip,
} from '@mui/material';
import {
  Category as CategoryIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface CategoryFilterProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>(Array.isArray(value) ? value : [value]);

  const categories = [
    { id: 'all', name: 'All Categories', color: '#2563eb' },
    { id: 'raw_material', name: 'Raw Material', color: '#059669' },
    { id: 'employee', name: 'Employee Expenses', color: '#d97706' },
    { id: 'finance', name: 'Finance Costs', color: '#dc2626' },
    { id: 'other', name: 'Other Operating', color: '#7c3aed' },
    { id: 'depreciation', name: 'Depreciation', color: '#0ea5e9' },
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchTerm('');
  };

  const open = Boolean(anchorEl);

  const handleSelect = (id: string) => {
    let newSelected: string[];
    
    if (id === 'all') {
      newSelected = ['all'];
    } else {
      newSelected = selected.filter(s => s !== 'all');
      if (newSelected.includes(id)) {
        newSelected = newSelected.filter(s => s !== id);
      } else {
        newSelected = [...newSelected, id];
      }
      if (newSelected.length === 0) {
        newSelected = ['all'];
      }
    }
    
    setSelected(newSelected);
    onChange(newSelected);
  };

  const handleRemove = (id: string) => {
    const newSelected = selected.filter(s => s !== id);
    if (newSelected.length === 0) {
      handleSelect('all');
    } else {
      setSelected(newSelected);
      onChange(newSelected);
    }
  };

  const getDisplayValue = () => {
    if (selected.includes('all') || selected.length === 0) {
      return 'All Categories';
    }
    if (selected.length <= 2) {
      return selected
        .map(s => categories.find(c => c.id === s)?.name || s)
        .join(', ');
    }
    return `${selected.length} categories selected`;
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<CategoryIcon />}
        endIcon={<ExpandMoreIcon />}
        onClick={handleClick}
        sx={{
          justifyContent: 'space-between',
          width: '100%',
          textTransform: 'none',
          backgroundColor: 'white',
        }}
      >
        <Typography variant="body2" noWrap>
          {getDisplayValue()}
        </Typography>
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, width: 300 } }}
      >
        <Stack spacing={2}>
          <Typography variant="subtitle2" fontWeight={600}>
            Select Categories
          </Typography>

          <TextField
            placeholder="Search categories..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
            {filteredCategories.map((category) => (
              <Button
                key={category.id}
                variant={selected.includes(category.id) ? 'contained' : 'text'}
                size="small"
                onClick={() => handleSelect(category.id)}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  mb: 0.5,
                  backgroundColor: selected.includes(category.id) ? category.color : 'transparent',
                  color: selected.includes(category.id) ? 'white' : '#1e293b',
                  '&:hover': {
                    backgroundColor: selected.includes(category.id) ? category.color : '#f1f5f9',
                  }
                }}
              >
                {category.name}
              </Button>
            ))}
          </Box>

          {!selected.includes('all') && selected.length > 0 && (
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>
                Selected:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(id => {
                  const category = categories.find(c => c.id === id);
                  return category ? (
                    <Chip
                      key={id}
                      label={category.name}
                      size="small"
                      onDelete={() => handleRemove(id)}
                      sx={{
                        backgroundColor: category.color + '20',
                        color: category.color,
                      }}
                    />
                  ) : null;
                })}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleClose}>
              Done
            </Button>
          </Box>
        </Stack>
      </Popover>
    </Box>
  );
};

export default CategoryFilter;