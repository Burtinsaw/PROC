import React from 'react';
import { useAppTheme } from '../../contexts/useAppTheme';

// Theme-specific status chips
import StatusChip from '../common/StatusChip';
import { ProcurementStatusChip } from '../procurement/ProcurementComponents';
import { BusinessStatusChip } from '../business/BusinessLayoutComponents';

/**
 * Universal Status Chip - Theme-aware component
 * Automatically selects the appropriate status chip based on current theme preset
 */
const UniversalStatusChip = ({ status, ...props }) => {
  const { preset } = useAppTheme();

  // Select appropriate component based on theme preset
  switch (preset) {
    case 'procurement':
      return <ProcurementStatusChip status={status} {...props} />;
    
    case 'business':
      return <BusinessStatusChip status={status} {...props} />;
    
    default:
      // For classic, neo, aurora, minimal, contrast themes, use default StatusChip
      return <StatusChip status={status} {...props} />;
  }
};

export default UniversalStatusChip;
