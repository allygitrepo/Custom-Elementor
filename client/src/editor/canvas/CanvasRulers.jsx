import React from 'react';
import { useEditor } from '../context/EditorContext';

export default function CanvasRulers({ mousePos }) {
  const { showRulers } = useEditor();

  if (!showRulers) return null;

  // Generate ticks for 3000px range
  const hTicks = [];
  for (let i = 0; i <= 3000; i += 50) {
    const isMajor = i % 100 === 0;
    hTicks.push(
      <div
        key={`h_${i}`}
        style={{
          position: 'absolute',
          left: `${i}px`,
          top: 0,
          bottom: 0,
          width: '1px',
          background: isMajor ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
          height: isMajor ? '16px' : '8px'
        }}
      >
        {isMajor && (
          <span style={{
            position: 'absolute',
            left: '3px',
            top: '2px',
            fontSize: '9px',
            fontFamily: 'monospace',
            color: 'rgba(255,255,255,0.4)',
            pointerEvents: 'none'
          }}>
            {i}
          </span>
        )}
      </div>
    );
  }

  const vTicks = [];
  for (let i = 0; i <= 4000; i += 50) {
    const isMajor = i % 100 === 0;
    vTicks.push(
      <div
        key={`v_${i}`}
        style={{
          position: 'absolute',
          top: `${i}px`,
          left: 0,
          right: 0,
          height: '1px',
          background: isMajor ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
          width: isMajor ? '16px' : '8px'
        }}
      >
        {isMajor && (
          <span style={{
            position: 'absolute',
            left: '2px',
            top: '2px',
            fontSize: '9px',
            fontFamily: 'monospace',
            color: 'rgba(255,255,255,0.4)',
            pointerEvents: 'none',
            transform: 'rotate(-90deg)',
            transformOrigin: 'top left'
          }}>
            {i}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Top Ruler */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '20px',
          right: 0,
          height: '20px',
          background: '#070a0f',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 50,
          overflow: 'hidden',
          userSelect: 'none',
          pointerEvents: 'none'
        }}
      >
        <div style={{ position: 'relative', width: '3000px', height: '100%' }}>
          {hTicks}
          {mousePos?.x !== undefined && (
            <div
              style={{
                position: 'absolute',
                left: `${mousePos.x}px`,
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'var(--primary)',
                zIndex: 60
              }}
            />
          )}
        </div>
      </div>

      {/* Left Ruler */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: 0,
          bottom: 0,
          width: '20px',
          background: '#070a0f',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          zIndex: 50,
          overflow: 'hidden',
          userSelect: 'none',
          pointerEvents: 'none'
        }}
      >
        <div style={{ position: 'relative', height: '4000px', width: '100%' }}>
          {vTicks}
          {mousePos?.y !== undefined && (
            <div
              style={{
                position: 'absolute',
                top: `${mousePos.y}px`,
                left: 0,
                right: 0,
                height: '1px',
                background: 'var(--primary)',
                zIndex: 60
              }}
            />
          )}
        </div>
      </div>

      {/* Origin Corner Box */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '20px',
          height: '20px',
          background: '#04060a',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '9px',
          color: 'var(--primary)',
          fontWeight: '700'
        }}
      >
        px
      </div>
    </>
  );
}
