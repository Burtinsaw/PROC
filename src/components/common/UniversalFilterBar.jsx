// Universal Filter Bar System
// Tüm preset'lerde tutarlı çalışan akıllı filter bar sistemi

import React from 'react';
import { useAppTheme } from '../../contexts/useAppTheme';

// Procurement theme imports  
import { ProcurementFilterBar } from '../procurement/ProcurementComponents';

// Default FilterBar import
import FilterBar from '../table/FilterBar';

/**
 * UniversalFilterBar - Tüm tema preset'lerinde çalışan akıllı filter bar
 * Otomatik olarak aktif tema preset'ine göre doğru bileşeni render eder
 * 
 * @param {Object} search - { value, onChange, placeholder }
 * @param {Array} filters - Filter options array
 * @param {Function} onRefresh - Refresh handler
 * @param {Function} onClear - Clear filters handler
 * @param {Function} onFilter - Filter action handler (procurement tema için)
 * @param {Function} onExport - Export action handler (procurement tema için)
 * @param {React.ReactNode} right - Right side content
 * @param {Object} ...props - Diğer props'lar
 */
export const UniversalFilterBar = ({ 
  search,
  filters,
  onRefresh,
  onClear,
  onFilter,
  onExport,
  right,
  ...props 
}) => {
  const { preset } = useAppTheme();

  // Procurement preset: Use procurement filter bar
  if (preset === 'procurement') {
    return (
      <ProcurementFilterBar
        search={search}
        onRefresh={onRefresh}
        onClear={onClear}
        onFilter={onFilter || (() => {})}
        onExport={onExport || (() => {})}
        {...props}
      />
    );
  }

  // Default themes: Use original FilterBar
  return (
    <FilterBar
      search={search}
      filters={filters}
      onRefresh={onRefresh}
      onClear={onClear}
      right={right}
      {...props}
    />
  );
};

export default UniversalFilterBar;
