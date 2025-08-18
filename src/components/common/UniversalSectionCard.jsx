// Universal Section Card System
// Tüm preset'lerde tutarlı çalışan akıllı card sistemi

import React from 'react';
import { useAppTheme } from '../../contexts/useAppTheme';

// Business theme imports
import { BusinessSectionCard } from '../business/BusinessLayoutComponents';

// Procurement theme imports  
import { ProcurementSectionCard } from '../procurement/ProcurementComponents';

// Default MainCard import
import MainCard from './MainCard';

/**
 * UniversalSectionCard - Tüm tema preset'lerinde çalışan akıllı card
 * Otomatik olarak aktif tema preset'ine göre doğru bileşeni render eder
 * 
 * @param {string} title - Card başlığı
 * @param {string} subtitle - Alt başlık
 * @param {React.ReactNode} children - Card içeriği
 * @param {boolean} content - MainCard content prop'u için backward compatibility
 * @param {Object} ...props - Diğer props'lar
 */
export const UniversalSectionCard = ({ 
  title, 
  subtitle,
  children,
  content = true,
  ...props 
}) => {
  const { preset } = useAppTheme();

  // Business preset: Use business card
  if (preset === 'business') {
    return (
      <BusinessSectionCard
        title={title}
        subtitle={subtitle}
        {...props}
      >
        {children}
      </BusinessSectionCard>
    );
  }

  // Procurement preset: Use procurement card
  if (preset === 'procurement') {
    return (
      <ProcurementSectionCard
        title={title}
        subtitle={subtitle}
        {...props}
      >
        {children}
      </ProcurementSectionCard>
    );
  }

  // Default themes: Use MainCard with optional title
  if (title) {
    return (
      <MainCard 
        title={title} 
        subtitle={subtitle}
        content={content}
        {...props}
      >
        {children}
      </MainCard>
    );
  }

  // Simple MainCard without title
  return (
    <MainCard content={content} {...props}>
      {children}
    </MainCard>
  );
};

export default UniversalSectionCard;
