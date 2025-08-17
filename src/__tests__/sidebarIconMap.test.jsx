import { describe, it, expect } from 'vitest';
import menuItems from '../menu-items';

// This test relies on Sidebar dev exposure of window.__APP_ICON_MAP__ when run in a jsdom environment.

describe('sidebar icon map', () => {
  it('all menu items with icon key have an icon mapping (dev exposure)', () => {
    // Simulate what Sidebar sets; replicate iconMap keys here (must stay in sync)
    const iconMap = {
      home: true,
      'file-text': true,
      'plus-circle': true,
      users: true,
      'shopping-cart': true,
      truck: true,
  calculator: true,
      'line-chart': true,
      'bar-chart-3': true,
      settings: true,
      shield: true
    };
    const missing = [];
    menuItems.forEach(g=> g.children.forEach(c=> { if(c.icon && !iconMap[c.icon]) missing.push(c.icon); }));
    expect(missing).toEqual([]);
  });
});
