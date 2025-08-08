import React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import menuItems from '../../menu-items';

const pathMap = (() => {
  const map = {};
  const walk = (nodes) => nodes.forEach((n) => {
    if (n.url) map[n.url] = n.title;
    if (n.children) walk(n.children);
  });
  walk(menuItems);
  return map;
})();

export default function BreadcrumbsNav() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const paths = segments.reduce((acc, seg, idx) => {
    const p = '/' + segments.slice(0, idx + 1).join('/');
    acc.push(p);
    return acc;
  }, ['/']);

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, color: 'text.secondary' }}>
      {paths.map((p, idx) => {
        const label = pathMap[p] || (p === '/' ? 'Ana Sayfa' : decodeURIComponent(p.split('/').pop()));
        const isLast = idx === paths.length - 1;
        return isLast ? (
          <Typography color="text.primary" key={p}>{label}</Typography>
        ) : (
          <Link component={RouterLink} underline="hover" color="inherit" to={p} key={p}>
            {label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
