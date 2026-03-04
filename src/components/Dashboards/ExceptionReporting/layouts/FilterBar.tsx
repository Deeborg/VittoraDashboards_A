import { useFilter } from '../contexts/FilterContext';
import { allDepartments, allCategories } from '../services/dataService';
import { HiOutlineFilter, HiOutlineRefresh } from 'react-icons/hi';

export default function FilterBar() {
    const { filters, setFilters, resetFilters } = useFilter();

    return (
        <div className="ed-filter-bar">
            {/* 1. Header Label */}
            <div className="ed-filter-main-label">
                <HiOutlineFilter size={18} />
                <span>FILTERS</span>
            </div>

            <div className="ed-v-divider" />

            {/* 2. Date Range Group */}
            <div className="ed-filter-group">
                <span className="ed-label-small">FROM</span>
                <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) =>
                        setFilters({ dateRange: { ...filters.dateRange, start: e.target.value } })
                    }
                    className="ed-filter-input"
                />
                <span className="ed-label-small">TO</span>
                <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) =>
                        setFilters({ dateRange: { ...filters.dateRange, end: e.target.value } })
                    }
                    className="ed-filter-input"
                />
            </div>

            <div className="ed-v-divider" />

            {/* 3. Department Group */}
            <div className="ed-filter-group">
                <span className="ed-label-small">DEPARTMENT</span>
                <select
                    value={filters.department}
                    onChange={(e) => setFilters({ department: e.target.value })}
                    className="ed-filter-select"
                >
                    <option value="All">All Departments</option>
                    {allDepartments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            <div className="ed-v-divider" />

            {/* 4. Category Group */}
            <div className="ed-filter-group">
                <span className="ed-label-small">CATEGORY</span>
                <select
                    value={filters.category}
                    onChange={(e) => setFilters({ category: e.target.value })}
                    className="ed-filter-select"
                >
                    <option value="All">All Categories</option>
                    {allCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* 5. Reset pushed to the right */}
            <button onClick={resetFilters} className="ed-filter-reset-btn">
                <HiOutlineRefresh size={16} />
                <span>RESET</span>
            </button>
        </div>
    );
}
