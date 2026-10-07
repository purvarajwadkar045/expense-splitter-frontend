import React from 'react';
import { MdCalendarToday, MdGroup, MdCategory, MdPerson, MdClose, MdSearch } from 'react-icons/md';
import { DATE_RANGE_OPTIONS, CATEGORY_OPTIONS } from '../../data/analyzerData';

const FilterSelect = ({ icon: Icon, value, onChange, options, id }) => (
  <div className="analyzer-filter-select-wrap">
    <Icon size={15} className="analyzer-filter-icon" />
    <select
      id={id}
      className="analyzer-filter-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const isFilterActive = (filters) =>
  filters.dateRange !== 'this-month' ||
  filters.group !== 'all' ||
  filters.category !== 'all' ||
  filters.member !== 'all' ||
  Boolean(filters.search) ||
  filters.minAmount !== '' ||
  filters.maxAmount !== '';

const AnalyzerFilters = ({ filters, onFilterChange, onClearFilters, groupOptions, memberOptions, error }) => {
  const active = isFilterActive(filters);
  const groups = [{ value: 'all', label: 'All Groups' }, ...(groupOptions || [])];
  const members = [{ value: 'all', label: 'All Members' }, ...(memberOptions || [])];

  return (
    <div className="analyzer-filters-bar">
      <div className="analyzer-filter-search-wrap">
        <MdSearch size={16} />
        <input
          id="analyzer-search"
          className="analyzer-filter-search"
          placeholder="Search expenses..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>
      <FilterSelect
        id="filter-date-range"
        icon={MdCalendarToday}
        value={filters.dateRange}
        onChange={(v) => onFilterChange('dateRange', v)}
        options={DATE_RANGE_OPTIONS}
      />
      <FilterSelect
        id="filter-group"
        icon={MdGroup}
        value={filters.group}
        onChange={(v) => onFilterChange('group', v)}
        options={groups}
      />
      <FilterSelect
        id="filter-category"
        icon={MdCategory}
        value={filters.category}
        onChange={(v) => onFilterChange('category', v)}
        options={CATEGORY_OPTIONS}
      />
      <FilterSelect
        id="filter-member"
        icon={MdPerson}
        value={filters.member}
        onChange={(v) => onFilterChange('member', v)}
        options={members}
      />
      <input
        className="analyzer-amount-input"
        type="number"
        min="0"
        placeholder="Min ₹"
        value={filters.minAmount}
        onChange={(e) => onFilterChange('minAmount', e.target.value)}
        aria-label="Minimum amount"
      />
      <input
        className="analyzer-amount-input"
        type="number"
        min="0"
        placeholder="Max ₹"
        value={filters.maxAmount}
        onChange={(e) => onFilterChange('maxAmount', e.target.value)}
        aria-label="Maximum amount"
      />
      {active && (
        <button
          className="analyzer-clear-filters-btn"
          onClick={onClearFilters}
          id="filter-clear-btn"
          title="Clear all filters"
        >
          <MdClose size={13} />
          Clear
        </button>
      )}
      {error && <span className="analyzer-filter-error">{error}</span>}
    </div>
  );
};

export default AnalyzerFilters;
