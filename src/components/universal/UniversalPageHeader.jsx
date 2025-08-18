import React from 'react';
import StandardPageHeader from '../layout/StandardPageHeader';

/**
 * Universal Page Header - Theme-aware component
 * Now uses standardized layout with consistent spacing across all themes
 */
const UniversalPageHeader = ({ title, subtitle, description, actions, right, dense, variant, ...props }) => {
  // Normalize props for backward compatibility
  const normalizedActions = actions || (right ? (Array.isArray(right) ? right : [right]) : undefined);
  const normalizedSubtitle = subtitle || description;

  return (
    <StandardPageHeader
      title={title}
      subtitle={normalizedSubtitle}
      actions={normalizedActions}
      dense={dense}
      variant={variant || 'default'}
      {...props}
    />
  );
};

export default UniversalPageHeader;
