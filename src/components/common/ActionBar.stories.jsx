import React, { useState } from 'react';
import ActionBar from './ActionBar';

export default {
  title: 'Primitives/ActionBar',
  component: ActionBar
};

export const Basic = () => {
  const [count] = useState(3);
  return (
    <div style={{ border: '1px solid #eee' }}>
      <ActionBar
        count={count}
        actions={[
          { key: 'approve', label: 'Onayla', color: 'success', onClick: () => alert('Onay') },
          { key: 'reject', label: 'Reddet', color: 'warning', variant: 'outlined', onClick: () => alert('Red') },
          { key: 'delete', label: 'Sil', color: 'error', variant: 'outlined', onClick: () => alert('Sil') }
        ]}
      />
    </div>
  );
};
