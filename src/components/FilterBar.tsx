import React, { useState } from 'react';
import { GlobalFilterState, ColumnMeta, DateFilter } from '../types/dashboard';
import {
  Search,
  Calendar,
  X,
  Filter,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';

interface FilterBarProps {
  filters: GlobalFilterState;
  columns: ColumnMeta[];
  totalRecordsCount: number;
  filteredRecordsCount: number;
  onFilterChange: (newFilters: GlobalFilterState) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  columns,
  totalRecordsCount,
  filteredRecordsCount,
  onFilterChange,
  onResetFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Identify categorical columns suitable for quick filters
  const categoricalColumns = columns
    .filter(
      (col) =>
        col.type === 'string' &&
        col.uniqueValues &&
        col.uniqueValues.length >= 2 &&
        col.uniqueValues.length <= 15
    )
    .slice(0, 4);

  // Date range presets
  const datePresets: { id: DateFilter['preset']; label: string }[] = [
    { id: 'all', label: 'All Records' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: 'ytd', label: 'YTD' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const handlePresetChange = (preset: DateFilter['preset']) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        preset,
      },
    });
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', val: string) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        preset: 'custom',
        [field]: val,
      },
    });
  };

  const handleCategoricalToggle = (colKey: string, val: string) => {
    const currentList = filters.categorical[colKey] || [];
    let updated: string[];

    if (currentList.includes(val)) {
      updated = currentList.filter((item) => item !== val);
    } else {
      updated = [...currentList, val];
    }

    const newCategorical = { ...filters.categorical };
    if (updated.length === 0) {
      delete newCategorical[colKey];
    } else {
      newCategorical[colKey] = updated;
    }

    onFilterChange({
      ...filters,
      categorical: newCategorical,
    });
  };

  const removeSpecificFilter = (colKey: string, val: string) => {
    const currentList = filters.categorical[colKey] || [];
    const updated = currentList.filter((item) => item !== val);
    const newCategorical = { ...filters.categorical };
    if (updated.length === 0) {
      delete newCategorical[colKey];
    } else {
      newCategorical[colKey] = updated;
    }
    onFilterChange({
      ...filters,
      categorical: newCategorical,
    });
  };

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.dateRange.preset !== 'all' ||
    Object.keys(filters.categorical).length > 0 ||
    filters.metricRange !== undefined;

  const pct = totalRecordsCount > 0
    ? ((filteredRecordsCount / totalRecordsCount) * 100).toFixed(1)
    : '100';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
      {/* Primary Row: Search + Date Presets + Quick Filters + Count Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search Bar */}
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search all records, reps, categories..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center: Segmented Date Period Control (functional buttons per constitution) */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800/80 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          {datePresets.map((p) => {
            const isActive = filters.dateRange.preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePresetChange(p.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Right: Record Counter & Reset */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            <span className="text-white font-semibold">{filteredRecordsCount}</span> of{' '}
            <span className="text-slate-400">{totalRecordsCount}</span> records ({pct}%)
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              title="Reset all filters"
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1 border border-slate-800"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Inputs if Custom is selected */}
      {filters.dateRange.preset === 'custom' && (
        <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400">Custom Date Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateRange.startDate || ''}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-mono"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={filters.dateRange.endDate || ''}
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      )}

      {/* Secondary Row: Categorical Dropdown Filters */}
      {categoricalColumns.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by:</span>
          </div>

          {categoricalColumns.map((col) => {
            const selectedVals = filters.categorical[col.key] || [];
            const isOpen = openDropdown === col.key;

            return (
              <div key={col.key} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(isOpen ? null : col.key)}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    selectedVals.length > 0
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{col.label}</span>
                  {selectedVals.length > 0 && (
                    <span className="font-mono text-[10px] bg-indigo-600/40 px-1.5 py-0.2 rounded-xs">
                      {selectedVals.length}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute left-0 top-full mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 z-30 max-h-56 overflow-y-auto space-y-1">
                      <div className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-1">
                        Select {col.label}
                      </div>
                      {col.uniqueValues?.map((val) => {
                        const isChecked = selectedVals.includes(val);

                        return (
                          <label
                            key={val}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-800 cursor-pointer text-xs text-slate-200 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCategoricalToggle(col.key, val)}
                              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                            />
                            <span className="truncate">{val}</span>
                          </label>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Active Filter Criteria Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-[11px] text-slate-400">Active Criteria:</span>

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-slate-300 text-[11px]">
              Keyword: &quot;{filters.searchQuery}&quot;
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="hover:text-rose-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.dateRange.preset !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-slate-300 text-[11px]">
              Period: {filters.dateRange.preset.toUpperCase()}
              <button
                onClick={() => handlePresetChange('all')}
                className="hover:text-rose-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {Object.entries(filters.categorical).flatMap(([colKey, vals]) =>
            vals.map((v) => (
              <span
                key={`${colKey}-${v}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-950/60 border border-indigo-700/60 rounded-md text-indigo-200 text-[11px]"
              >
                <span>
                  {columns.find((c) => c.key === colKey)?.label || colKey}: {v}
                </span>
                <button
                  onClick={() => removeSpecificFilter(colKey, v)}
                  className="hover:text-rose-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      )}
    </div>
  );
};
