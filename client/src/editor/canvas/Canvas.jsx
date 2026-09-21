import React from 'react';
import { useEditor } from '../context/EditorContext';
import ElementRenderer from './ElementRenderer';
import { Sparkles, Monitor, Tablet, Smartphone } from 'lucide-react';

export default function Canvas() {
  const { 
    tree, 
    responsiveMode, 
    previewMode, 
    setSelectedElementId 
  } = useEditor();

  const getViewportWidth = () => {
    switch (responsiveMode) {
      case 'tablet':
        return '768px';
      case 'mobile':
        return '375px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget && !previewMode) {
      setSelectedElementId('root');
    }
  };

  return (
    <div
      onClick={handleCanvasClick}
      style={{
        flex: 1,
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        overflowX: 'auto',
        background: previewMode ? 'var(--bg-main)' : 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.5) 0%, #070a0f 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: previewMode ? '0' : (responsiveMode === 'desktop' ? '0' : '32px 16px'),
        transition: 'all 250ms ease'
      }}
    >
      {/* Device Simulation Frame */}
      <div
        style={{
          width: getViewportWidth(),
          minHeight: '100%',
          background: '#0b0f17',
          boxShadow: previewMode || responsiveMode === 'desktop' ? 'none' : '0 20px 50px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
          borderRadius: previewMode || responsiveMode === 'desktop' ? '0' : '16px',
          overflow: 'hidden',
          transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Device Status Bar Indicator when in tablet/mobile mode */}
        {!previewMode && responsiveMode !== 'desktop' && (
          <div style={{
            height: '24px',
            background: '#070a0f',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            color: 'var(--text-dim)',
            userSelect: 'none',
            gap: '6px'
          }}>
            {responsiveMode === 'tablet' ? <Tablet size={12} /> : <Smartphone size={12} />}
            <span>{responsiveMode === 'tablet' ? '768px (Tablet)' : '375px (Mobile)'}</span>
          </div>
        )}

        {/* Tree Root Render */}
        <ElementRenderer element={tree} />
      </div>
    </div>
  );
}
