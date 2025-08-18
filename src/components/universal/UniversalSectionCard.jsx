import React from 'react';
import { useAppTheme } from '../../contexts/useAppTheme';

// Theme-specific section cards
import MainCard from '../common/MainCard';
import { ProcurementSectionCard } from '../procurement/ProcurementComponents';
import { BusinessSectionCard } from '../business/BusinessLayoutComponents';

/**
 * Universal Section Card - Theme-aware component
 * Automatically selects the appropriate card based on current theme preset
 */
const UniversalSectionCard = ({ title, children, ...props }) => {
  const { preset } = useAppTheme();

  // Select appropriate component based on theme preset
  switch (preset) {
    case 'procurement':
      return (
        <ProcurementSectionCard title={title} {...props}>
          {children}
        </ProcurementSectionCard>
      );
    
    case 'business':
      return (
        <BusinessSectionCard title={title} {...props}>
          {children}
        </BusinessSectionCard>
      );
    
    default:
      // For classic, neo, aurora, minimal, contrast themes, use MainCard
      return (
        <MainCard 
          title={title}
          content={false}
          sx={{ overflow: 'hidden', ...props.sx }}
          {...props}
        >
          {children}
        </MainCard>
      );
  }
};

export default UniversalSectionCard;
