import { useFilter } from '../contexts/FilterContext';
import { allDepartments, allCategories } from '../services/dataService';
import { HiOutlineFilter, HiOutlineRefresh } from 'react-icons/hi';

export default function FilterBar() {
    const { filters, setFilters, resetFilters } = useFilter();

    return (
        <div className="ed-filter-bar">
            <div className="ed-filter-label">
                <HiOutlineFilter size={16} />
                <span>Filters</span>
            </div>

            <div className="ed-divider" />

            {/* Date Range */}
            <div className="ed-filter-group">
                <label className="ed-input-label">From</label>
                <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) =>
                        setFilters({ dateRange: { ...filters.dateRange, start: e.target.value } })
                    }
                    className="ed-input"
                />
                <label className="ed-input-label">To</label>
                <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) =>
                        setFilters({ dateRange: { ...filters.dateRange, end: e.target.value } })
                    }
                    className="ed-input"
                />
            </div>

            <div className="ed-divider" />

            {/* Department */}
            <div className="ed-filter-group">
                <label className="ed-input-label">Department</label>
                <select
                    value={filters.department}
                    onChange={(e) => setFilters({ department: e.target.value })}
                    className="ed-input"
                    style={{cursor: 'pointer'}}
                >
                    <option value="All">All Departments</option>
                    {allDepartments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            <div className="ed-divider" />

            {/* Category */}
            <div className="ed-filter-group">
                <label className="ed-input-label">Category</label>
                <select
                    value={filters.category}
                    onChange={(e) => setFilters({ category: e.target.value })}
                    className="ed-input"
                    style={{cursor: 'pointer'}}
                >
                    <option value="All">All Categories</option>
                    {allCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* Reset */}
            <button onClick={resetFilters} className="ed-reset-btn">
                <HiOutlineRefresh size={14} />
                Reset
            </button>
        </div>
    );
}