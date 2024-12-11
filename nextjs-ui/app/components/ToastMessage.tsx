import React from 'react';

export const ToastMessage = ({ fromAddress }: { fromAddress: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ fontSize: '2em', marginBottom: '4px' }}>
      <span style={{ marginRight: '8px' }}>🦣</span>
      <span style={{ fontWeight: 'bold' }}>gMammoth!</span>
    </div>
    <div style={{ fontSize: '0.8em', opacity: 0.8 }}>
      - <span style={{ wordBreak: 'break-all' }}>{fromAddress}</span>
    </div>
  </div>
); 