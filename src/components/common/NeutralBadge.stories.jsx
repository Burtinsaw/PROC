import React from 'react';
import NeutralBadge from './NeutralBadge';

export default {
  title: 'Primitives/NeutralBadge',
  component: NeutralBadge,
  args: { label: 'TR/EN', variant: 'subtle' },
  argTypes: {
    variant: { control: 'select', options: ['subtle', 'outlined', 'solid'] },
    size: { control: 'select', options: ['small', 'medium'] }
  }
};

export const Subtle = { args: { variant: 'subtle' } };
export const Outlined = { args: { variant: 'outlined' } };
export const Solid = { args: { variant: 'solid' } };
