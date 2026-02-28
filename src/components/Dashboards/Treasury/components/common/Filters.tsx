import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  SelectChangeEvent,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

/* ✅ Define filter structure */
export interface FilterState {
  month: string;
  loanType: string;
  investmentType: string;
}

/* ✅ Define props */
interface FiltersProps {
  onFilterChange: (
    field: keyof FilterState | "reset",
    value?: string
  ) => void;
  filters: FilterState;
}

const Filters: React.FC<FiltersProps> = ({
  onFilterChange,
  filters,
}) => {
  const handleChange =
    (field: keyof FilterState) =>
    (event: SelectChangeEvent<string>) => {
      onFilterChange(field, event.target.value);
    };

  // return (
  //   <Box sx={{ mb: 3, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
  //     <Grid container spacing={2} alignItems="center">
  //       <Grid item>
  //         <FilterListIcon sx={{ color: '#546e7a' }} />
  //       </Grid>
  //       
  //       <Grid item xs={12} sm={3}>
  //         <FormControl fullWidth size="small">
  //           <InputLabel>Month</InputLabel>
  //           <Select
  //             value={filters.month}
  //             label="Month"
  //             onChange={handleChange('month')}
  //           >
  //             <MenuItem value="all">All Months</MenuItem>
  //             <MenuItem value="Mar 2024">Mar 2024</MenuItem>
  //             <MenuItem value="Feb 2024">Feb 2024</MenuItem>
  //             <MenuItem value="Jan 2024">Jan 2024</MenuItem>
  //           </Select>
  //         </FormControl>
  //       </Grid>
  //       
  //       <Grid item xs={12} sm={3}>
  //         <FormControl fullWidth size="small">
  //           <InputLabel>Loan Type</InputLabel>
  //           <Select
  //             value={filters.loanType}
  //             label="Loan Type"
  //             onChange={handleChange('loanType')}
  //           >
  //             <MenuItem value="all">All Types</MenuItem>
  //             <MenuItem value="Cash Credit">Cash Credit</MenuItem>
  //             <MenuItem value="Term Loan">Term Loan</MenuItem>
  //             <MenuItem value="Overdraft">Overdraft</MenuItem>
  //           </Select>
  //         </FormControl>
  //       </Grid>
  //       
  //       <Grid item xs={12} sm={3}>
  //         <FormControl fullWidth size="small">
  //           <InputLabel>Investment Type</InputLabel>
  //           <Select
  //             value={filters.investmentType}
  //             label="Investment Type"
  //             onChange={handleChange('investmentType')}
  //           >
  //             <MenuItem value="all">All Types</MenuItem>
  //             <MenuItem value="Liquid">Liquid</MenuItem>
  //             <MenuItem value="Debt">Debt</MenuItem>
  //             <MenuItem value="ICD">ICD</MenuItem>
  //           </Select>
  //         </FormControl>
  //       </Grid>
  //       
  //       <Grid item xs={12} sm={3}>
  //         <Button 
  //           variant="outlined" 
  //           size="small" 
  //           fullWidth
  //           onClick={() => onFilterChange('reset')}
  //         >
  //           Reset Filters
  //         </Button>
  //       </Grid>
  //     </Grid>
  //   </Box>
  // );
  return null; 
};

export default Filters;