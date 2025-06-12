

import React, { useState} from 'react';
interface FilterProps {
  data: Array<Record<string, any>>; 
  // data1: Array<Record<string, any>>;
  onFilterChange: (filters: any) => void; 
}



const FilterComponent: React.FC<FilterProps> = ({ data, onFilterChange }) => {
  // State for each filter
  const [selectedFilter1, setSelectedFilter1] = useState<string | undefined>(undefined);
  const [selectedFilter2, setselectedFilter2] = useState<string | undefined>(undefined);
  const [selectedFilter3, setSelectedFilter3] = useState<string | undefined>(undefined);
  const [selectedFilter4, setselectedFilter4] = useState<string | undefined>(undefined);

  // Get unique values for each filter
  const filterFilter1 = Array.from(new Set(data.map((row) => row["STATE"]))).sort();  
  const filterFilter2= Array.from(new Set(data.map((row) => row["DISTRICT"]))).sort();
  const filterFilter3 = Array.from(new Set(data.map((row) => row["POPULATION_CAT"]))).sort();  
  const filterFilter4= Array.from(new Set(data.map((row) => row["BRANCH_NAME"]))).sort();

  // Handle filter changes and update parent component
 
  const handleFilter1Select = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const Filter1Value = event.target.value || undefined;
    setSelectedFilter1(Filter1Value);
    onFilterChange({selectedFilter1: Filter1Value,selectedFilter2,selectedFilter3,selectedFilter4});
  };
  const handleFilter2Select = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const Filter2Value = event.target.value || undefined;
    setselectedFilter2(Filter2Value);
    onFilterChange({selectedFilter1,selectedFilter2:Filter2Value,selectedFilter3,selectedFilter4});
  };
  const handleFilter3Select = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const Filter3Value = event.target.value || undefined;
    setSelectedFilter3(Filter3Value);
    onFilterChange({selectedFilter1,selectedFilter2,selectedFilter3: Filter3Value,selectedFilter4});
  };
  const handleFilter4Select = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const Filter4Value = event.target.value || undefined;
    setselectedFilter4(Filter4Value);
    onFilterChange({selectedFilter1,selectedFilter2,selectedFilter3,selectedFilter4:Filter4Value});
  };
  
  
  return (
    <div className="filters-bankeffi">
      
      <div className="filter-row-bankeffi">
        <select onChange={handleFilter1Select}>
          <option value="">State</option>
          {filterFilter1.map((filter, index) => (
            <option key={index} value={filter}>
              {filter}
            </option>
          ))}
        </select>
      </div>  
      <div className="filter-row-bankeffi">
        <select onChange={handleFilter2Select}>
          <option value="">District</option>
          {filterFilter2.map((filter, index) => (
            <option key={index} value={filter}>
              {filter}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-row-bankeffi">
        <select onChange={handleFilter3Select}>
          <option value="">Population Category</option>
          {filterFilter3.map((filter, index) => (
            <option key={index} value={filter}>
              {filter}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-row-bankeffi">
        <select onChange={handleFilter4Select}>
          <option value="">Branch Name</option>
          {filterFilter4.map((filter, index) => (
            <option key={index} value={filter}>
              {filter}
            </option>
          ))}
        </select>
      </div>

      

    </div>
  );
};

export default FilterComponent;