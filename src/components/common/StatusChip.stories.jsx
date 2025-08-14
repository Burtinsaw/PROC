import React from 'react';
import StatusChip from './StatusChip';

export default {
  title: 'Primitives/StatusChip',
  component: StatusChip,
  args: { status: 'approved' },
  argTypes: {
    status: { control: 'text' }
  }
};

export const Approved = { args: { status: 'approved' } };
export const Pending = { args: { status: 'pending' } };
export const Rejected = { args: { status: 'rejected' } };
export const Quoted = { args: { status: 'quoted' } };
export const Unknown = { args: { status: 'something_else' } };
