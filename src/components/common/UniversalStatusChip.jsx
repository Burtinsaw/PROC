// Universal Status Chip System
// Tüm preset'lerde tutarlı çalışan akıllı status chip sistemi

import React from 'react';
import { useAppTheme } from '../../contexts/useAppTheme';

// Procurement theme imports  
import { ProcurementStatusChip } from '../procurement/ProcurementComponents';

// Default StatusChip import
import StatusChip from './StatusChip';

/**
 * UniversalStatusChip - Tüm tema preset'lerinde çalışan akıllı status chip
 * Otomatik olarak aktif tema preset'ine göre doğru bileşeni render eder
 * 
 * @param {string} status - Status değeri
 * @param {string} variant - Chip variant'ı
 * @param {string} size - Chip boyutu
 * @param {Object} ...props - Diğer props'lar
 */
export const UniversalStatusChip = ({ 
  status,
  variant,
  size = 'small',
  ...props 
}) => {
  const { preset } = useAppTheme();

  // Procurement preset: Use procurement status chip
  if (preset === 'procurement') {
    return (
      <ProcurementStatusChip
        status={status}
        variant={variant}
        size={size}
        {...props}
      />
    );
  }

  // Default themes: Use original StatusChip
  return (
    <StatusChip
      status={status}
      variant={variant}
      size={size}
      {...props}
    />
  );
};

export default UniversalStatusChip;
