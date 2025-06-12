import React, { useState, useEffect } from 'react';

interface FilterProps {
  data: Array<Record<string, any>>;
  onFilterChange: (filters: {
    selectedFilter1: string | null;
    selectedFilter2: string | null;
    selectedFilter3: string | null;
    selectedFilter4: string | null;
  }) => void;
}

const FilterComponent: React.FC<FilterProps> = ({ data, onFilterChange }) => {
  // State for each filter
  const [selectedFilter1, setSelectedFilter1] = useState<string | null>(""); // STATE
  const [selectedFilter2, setSelectedFilter2] = useState<string | null>(""); // DISTRICT
  const [selectedFilter3, setSelectedFilter3] = useState<string | null>(""); // POPULATION_CAT
  const [selectedFilter4, setSelectedFilter4] = useState<string | null>(""); // BRANCH_NAME

  // State for dynamic filter options
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availablePopulationCats, setAvailablePopulationCats] = useState<string[]>([]);
  const [availableBranchNames, setAvailableBranchNames] = useState<string[]>([]);

  // Get unique values for the first filter (STATE)
  const states = Array.from(new Set(data.map((row) => row["STATE"]))).filter(Boolean).sort();

  // Update available districts when STATE changes
  useEffect(() => {
    let filteredData = data;
    if (selectedFilter1) {
      filteredData = filteredData.filter((row) => row["STATE"] === selectedFilter1);
    }
    const districts = Array.from(new Set(filteredData.map((row) => row["DISTRICT"])))
      .filter(Boolean)
      .sort();
    setAvailableDistricts(districts);
    // Reset subsequent filters if they are not valid
    if (selectedFilter2 && !districts.includes(selectedFilter2)) {
      setSelectedFilter2("");
    }
    setSelectedFilter3("");
    setSelectedFilter4("");
  }, [selectedFilter1, data]);

  // Update available population categories when STATE or DISTRICT changes
  useEffect(() => {
    let filteredData = data;
    if (selectedFilter1) {
      filteredData = filteredData.filter((row) => row["STATE"] === selectedFilter1);
    }
    if (selectedFilter2) {
      filteredData = filteredData.filter((row) => row["DISTRICT"] === selectedFilter2);
    }
    const populationCats = Array.from(new Set(filteredData.map((row) => row["POPULATION_CAT"])))
      .filter(Boolean)
      .sort();
    setAvailablePopulationCats(populationCats);
    // Reset subsequent filter if not valid
    if (selectedFilter3 && !populationCats.includes(selectedFilter3)) {
      setSelectedFilter3("");
    }
    setSelectedFilter4("");
  }, [selectedFilter1, selectedFilter2, data]);

  // Update available branch names when STATE, DISTRICT, or POPULATION_CAT changes
  useEffect(() => {
    let filteredData = data;
    if (selectedFilter1) {
      filteredData = filteredData.filter((row) => row["STATE"] === selectedFilter1);
    }
    if (selectedFilter2) {
      filteredData = filteredData.filter((row) => row["DISTRICT"] === selectedFilter2);
    }
    if (selectedFilter3) {
      filteredData = filteredData.filter((row) => row["POPULATION_CAT"] === selectedFilter3);
    }
    const branchNames = Array.from(new Set(filteredData.map((row) => row["Branch_Code_Name"])))
      .filter(Boolean)
      .sort();
    setAvailableBranchNames(branchNames);
    // Reset branch name filter if not valid
    if (selectedFilter4 && !branchNames.includes(selectedFilter4)) {
      setSelectedFilter4("");
    }
  }, [selectedFilter1, selectedFilter2, selectedFilter3, data]);

  // Handle filter changes and update parent component
   
    const handleFilter1Select = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const Filter1Value = event.target.value || null;
      setSelectedFilter1(Filter1Value);
      onFilterChange({selectedFilter1: Filter1Value,selectedFilter2,selectedFilter3,selectedFilter4});
    };
    const handleFilter2Select = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const Filter2Value = event.target.value || null;
      setSelectedFilter2(Filter2Value);
      onFilterChange({selectedFilter1,selectedFilter2:Filter2Value,selectedFilter3,selectedFilter4});
    };
    const handleFilter3Select = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const Filter3Value = event.target.value || null;
      setSelectedFilter3(Filter3Value);
      onFilterChange({selectedFilter1,selectedFilter2,selectedFilter3: Filter3Value,selectedFilter4});
    };
    const handleFilter4Select = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const Filter4Value =event.target.value || null;
      setSelectedFilter4(Filter4Value);
      onFilterChange({selectedFilter1,selectedFilter2,selectedFilter3,selectedFilter4:Filter4Value});
    };

  return (
    <div className="filters-container1-bankeffi">
    <div className="filters-bankeffi">
      <div className="filter-row-bankeffi">
        <select
          value={selectedFilter1 || ""} onChange={handleFilter1Select}
        >
          <option value="">All State</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-row-bankeffi">
        <select
          value={selectedFilter2 || ""} onChange={handleFilter2Select}
        >
          <option value="">All District</option>
          {availableDistricts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-row-bankeffi">
        <select
          value={selectedFilter3 || ""} onChange={handleFilter3Select}
        >
          <option value="">All Population Category</option>
          {availablePopulationCats.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-row-bankeffi">
        <select
          value={selectedFilter4 || ""} onChange={handleFilter4Select}
        >
          <option value="">All Branch Name</option>
          {availableBranchNames.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>
    </div>
    </div>
  );
};

export default FilterComponent;