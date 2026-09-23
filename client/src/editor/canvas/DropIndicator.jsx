import React from 'react';

export default function DropIndicator({ position = 'bottom', label = 'Insert Here' }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '4px',
        margin: '6px 0',
        background: 'var(--primary)',
        boxShadow: '0 0 12px var(--primary-glow), 0 0 4px var(--primary)',
        borderRadius: '2px',
        zIndex: 50,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 1s infinite alternate'
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--primary)',
          color: '#000000',
          fontSize: '10px',
          fontWeight: '800',
          padding: '2px 8px',
          borderRadius: '9999px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
        }}
      >
        {label}
      </div>
    </div>
  );
}
