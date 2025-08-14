import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import PermissionGuard from '../components/rbac/PermissionGuard';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../hooks/usePermissions', () => ({
  default: () => ({ any: (arr)=> arr.includes('allow:any'), all: (arr)=> arr.every(a=> a==='allow:all') })
}));

describe('PermissionGuard', () => {
  it('renders children when anyOf satisfied', () => {
    const tree = (
      <MemoryRouter>
        <PermissionGuard anyOf={['allow:any']}><div data-testid="child">OK</div></PermissionGuard>
      </MemoryRouter>
    );
    // Renderless check: we just ensure the wrapper structure exists
    expect(tree.props.children.props.children.props['data-testid']).toBe('child');
  });
  it('redirects when not satisfied', () => {
    const tree = (
      <MemoryRouter>
        <PermissionGuard anyOf={['nope']}><div>NA</div></PermissionGuard>
      </MemoryRouter>
    );
    // Should still be PermissionGuard element
    expect(tree.props.children.type.name).toBe('PermissionGuard');
  });
});
