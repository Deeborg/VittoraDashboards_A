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
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface EntityFilterProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

const EntityFilter: React.FC<EntityFilterProps> = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>(Array.isArray(value) ? value : [value]);

  const entities = [
    { id: 'all', name: 'All Entities', color: '#2563eb' },
    { id: 'factory_a', name: 'Factory A', color: '#059669' },
    { id: 'factory_b', name: 'Factory B', color: '#d97706' },
    { id: 'factory_c', name: 'Factory C', color: '#7c3aed' },
    { id: 'factory_d', name: 'Factory D', color: '#dc2626' },
    { id: 'office', name: 'Office', color: '#0ea5e9' },
    { id: 'warehouse', name: 'Warehouse', color: '#f97316' },
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
      return 'All Entities';
    }
    if (selected.length <= 2) {
      return selected
        .map(s => entities.find(e => e.id === s)?.name || s)
        .join(', ');
    }
    return `${selected.length} entities selected`;
  };

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<BusinessIcon />}
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
            Select Entities
          </Typography>

          <TextField
            placeholder="Search entities..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
            {filteredEntities.map((entity) => (
              <Button
                key={entity.id}
                variant={selected.includes(entity.id) ? 'contained' : 'text'}
                size="small"
                onClick={() => handleSelect(entity.id)}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  mb: 0.5,
                  backgroundColor: selected.includes(entity.id) ? entity.color : 'transparent',
                  color: selected.includes(entity.id) ? 'white' : '#1e293b',
                  '&:hover': {
                    backgroundColor: selected.includes(entity.id) ? entity.color : '#f1f5f9',
                  }
                }}
              >
                {entity.name}
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
                  const entity = entities.find(e => e.id === id);
                  return entity ? (
                    <Chip
                      key={id}
                      label={entity.name}
                      size="small"
                      onDelete={() => handleRemove(id)}
                      sx={{
                        backgroundColor: entity.color + '20',
                        color: entity.color,
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

export default EntityFilter;