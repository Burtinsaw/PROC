// Custom page title hook
// Allows pages to override the automatic navConfig-based title

import { useEffect } from 'react';

/**
 * usePageTitle - Set custom page title for header
 * @param {string} title - Custom title to display in header
 * @param {string} subtitle - Optional subtitle for breadcrumb
 */
export const usePageTitle = (title, subtitle = null) => {
  useEffect(() => {
    // Store original values
    const originalTitle = window.__pageTitle;
    const originalSubtitle = window.__pageSubtitle;
    
    // Set custom title
    window.__pageTitle = title;
    if (subtitle) window.__pageSubtitle = subtitle;
    
    // Trigger header update
    try {
      window.dispatchEvent(new CustomEvent('page-title-changed', { 
        detail: { title, subtitle } 
      }));
    } catch {
      // ignore
    }
    
    // Cleanup on unmount
    return () => {
      window.__pageTitle = originalTitle;
      window.__pageSubtitle = originalSubtitle;
      try {
        window.dispatchEvent(new CustomEvent('page-title-changed', { 
          detail: { title: originalTitle, subtitle: originalSubtitle } 
        }));
      } catch {
        // ignore
      }
    };
  }, [title, subtitle]);
};

export default usePageTitle;
