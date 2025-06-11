import React, { useState, useEffect } from 'react';

interface FilterProps {
  data: Array<Record<string, any>>;
  onFilterChange: (filters: {
    selectedFilter1: string | null;
    selectedFilter2: string | null;
  }) => void;
}

const FilterComponent: React.FC<FilterProps> = ({ data, onFilterChange }) => {
  // State for each filter
  const [selectedFilter1, setSelectedFilter1] = useState<string | null>(""); // Country
  const [selectedFilter2, setSelectedFilter2] = useState<string | null>(""); // Material Group Desc

  // State for dynamic filter options
  const [availableMaterialGroups, setAvailableMaterialGroups] = useState<string[]>([]);

  // Get unique values for Country
  const countries = Array.from(new Set(data.map((row) => row["Country"])))
    .filter(Boolean)
    .sort();

  // Update available Material Group Desc when Country changes
  useEffect(() => {
    let filteredData = data;
    if (selectedFilter1) {
      filteredData = filteredData.filter((row) => row["Country"] === selectedFilter1);
    }
    const materialGroups = Array.from(
      new Set(filteredData.map((row) => row["Material Group Desc"]))
    )
      .filter(Boolean)
      .sort();
    setAvailableMaterialGroups(materialGroups);
    // Reset Material Group Desc filter if not valid for the new country
    if (selectedFilter2 && !materialGroups.includes(selectedFilter2)) {
      setSelectedFilter2("");
    }
  }, [selectedFilter1, data]);

  // Handle filter changes
  const handleFilter1Select = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const filter1Value = event.target.value || null;
    setSelectedFilter1(filter1Value);
    onFilterChange({ selectedFilter1: filter1Value, selectedFilter2 });
  };

  const handleFilter2Select = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const filter2Value = event.target.value || null;
    setSelectedFilter2(filter2Value);
    onFilterChange({ selectedFilter1, selectedFilter2: filter2Value });
  };

  return (
    <div className="filters">
      <div className="filter-row">
        <select value={selectedFilter1 || ""} onChange={handleFilter1Select}>
          <option value="">Choose Country...</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-row">
        <select value={selectedFilter2 || ""} onChange={handleFilter2Select}>
          <option value="">Choose Material Group...</option>
          {availableMaterialGroups.map((materialGroup) => (
            <option key={materialGroup} value={materialGroup}>
              {materialGroup}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterComponent;