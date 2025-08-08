import { useMemo } from 'react';
import { useAuth } from '../contexts/useAuth';

// Simple role→permissions map; extend later from backend profile
const ROLE_PERMS = {
  admin: ['users:read', 'users:write', 'settings:write', 'requests:approve', 'requests:read', 'requests:create'],
  manager: ['users:read', 'requests:approve'],
  user: ['requests:read', 'requests:create']
};

export default function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || user?.Role || 'user';

  const perms = useMemo(() => ROLE_PERMS[role] || ROLE_PERMS.user, [role]);

  const has = (p) => perms.includes(p);
  const any = (list) => list.some((p) => has(p));
  const all = (list) => list.every((p) => has(p));

  return { role, perms, has, any, all };
}
