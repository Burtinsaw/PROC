import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import usePermissions from '../../hooks/usePermissions';

const PermissionGuard = ({ children, anyOf = [], allOf = [] }) => {
  const { any, all } = usePermissions();
  const location = useLocation();

  const ok = (allOf.length ? all(allOf) : true) && (anyOf.length ? any(anyOf) : true);

  if (!ok) {
    return <Navigate to="/forbidden" replace state={{ from: location }} />;
  }

  return children;
};

export default PermissionGuard;
