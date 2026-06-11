import React from 'react';

const Loader = ({ type = 'spinner' }) => {
  // type can be 'spinner' or 'skeleton'
  if (type === 'skeleton') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <div className="shimmer-card" style={{ height: '80px' }} />
        <div className="shimmer-card" style={{ height: '140px' }} />
        <div className="shimmer-card" style={{ height: '100px' }} />
      </div>
    );
  }

  return (
    <div className="page-loader">
      <div className="spinner" />
    </div>
  );
};

export default Loader;
