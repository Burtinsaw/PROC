import React from 'react';
import { useAppTheme } from '../../contexts/useAppTheme';

// Theme-specific filter bars
import FilterBar from '../table/FilterBar';
import { ProcurementFilterBar } from '../procurement/ProcurementComponents';

/**
 * Universal Filter Bar - Theme-aware component
 * Automatically selects the appropriate filter bar based on current theme preset
 */
const UniversalFilterBar = ({ search, filters, onRefresh, onClear, onFilter, onExport, ...props }) => {
  const { preset } = useAppTheme();

  // Select appropriate component based on theme preset
  switch (preset) {
    case 'procurement':
      return (
        <ProcurementFilterBar 
          search={search}
          onRefresh={onRefresh}
          onClear={onClear}
          onFilter={onFilter}
          onExport={onExport}
          {...props}
        />
      );
    
    case 'business':
      return (
        <FilterBar 
          search={search}
          filters={filters}
          onRefresh={onRefresh}
          onClear={onClear}
          {...props}
        />
      );
    
    default:
      // For classic, neo, aurora, minimal, contrast themes, use default FilterBar
      return (
        <FilterBar 
          search={search}
          filters={filters}
          onRefresh={onRefresh}
          onClear={onClear}
          {...props}
        />
      );
  }
};

export default UniversalFilterBar;
