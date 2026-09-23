import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useEditor } from '../context/EditorContext';
import ElementRenderer from './ElementRenderer';
import CanvasRulers from './CanvasRulers';
import CanvasBottomBar from './CanvasBottomBar';
import ContextMenu from './ContextMenu';
import { Tablet, Smartphone, ChevronUp, GripVertical, PanelLeft, Sliders, Plus } from 'lucide-react';

export default function Canvas() {
  const { 
    tree, 
    responsiveMode, 
    previewMode, 
    setSelectedElementId,
    zoom,
    panOffset,
    setPanOffset,
    isPanMode,
    customCanvasWidth,
    setCustomCanvasWidth,
    showRulers,
    closeContextMenu,
    leftSidebarOpen,
    rightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar
  } = useEditor();

  const scrollRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Panning tracking
  const isDraggingPan = useRef(false);
  const startPanPos = useRef({ x: 0, y: 0 });
  const startPanOffset = useRef({ x: 0, y: 0 });

  // Width Resizing tracking
  const isResizingWidth = useRef(false);
  const startResizeX = useRef(0);
  const startWidth = useRef(1200);

  const getViewportWidth = () => {
    if (customCanvasWidth) {
      return `${customCanvasWidth}px`;
    }
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
    closeContextMenu();
    if (e.target === e.currentTarget && !previewMode) {
      setSelectedElementId('root');
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowScrollTop(scrollRef.current.scrollTop > 350);
    }
  };

  const scrollToTop = (e) => {
    e.stopPropagation();
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMouseMove = (e) => {
    if (showRulers && scrollRef.current) {
      const rect = scrollRef.current.getBoundingClientRect();
      setMousePos({
        x: Math.round(e.clientX - rect.left + scrollRef.current.scrollLeft),
        y: Math.round(e.clientY - rect.top + scrollRef.current.scrollTop)
      });
    }

    // Handle Pan Dragging
    if (isDraggingPan.current) {
      const deltaX = e.clientX - startPanPos.current.x;
      const deltaY = e.clientY - startPanPos.current.y;
      setPanOffset({
        x: startPanOffset.current.x + deltaX,
        y: startPanOffset.current.y + deltaY
      });
    }

    // Handle Width Resizing
    if (isResizingWidth.current) {
      const deltaX = (e.clientX - startResizeX.current) * 2;
      const newWidth = Math.min(1920, Math.max(320, startWidth.current + deltaX));
      setCustomCanvasWidth(Math.round(newWidth));
    }
  };

  const handleMouseDown = (e) => {
    // Middle click or Space+click pan
    if (e.button === 1 || isPanMode || e.spaceKey) {
      isDraggingPan.current = true;
      startPanPos.current = { x: e.clientX, y: e.clientY };
      startPanOffset.current = { ...panOffset };
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    isDraggingPan.current = false;
    isResizingWidth.current = false;
  };

  const startWidthResize = (e, side) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingWidth.current = true;
    startResizeX.current = e.clientX;
    const currentW = customCanvasWidth || (responsiveMode === 'tablet' ? 768 : (responsiveMode === 'mobile' ? 375 : 1200));
    startWidth.current = currentW;
  };

  // Keyboard space key listener for pan
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' && !e.target.isContentEditable && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (e.type === 'keydown') {
          document.body.style.cursor = 'grab';
        } else {
          document.body.style.cursor = 'default';
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="canvas-scroll-container"
      onClick={handleCanvasClick}
      style={{
        flex: 1,
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'auto',
        background: previewMode ? 'var(--bg-main)' : 'radial-gradient(circle at 50% 30%, rgba(30, 41, 59, 0.4) 0%, #070a0f 100%)',
        position: 'relative',
        display: 'block',
        cursor: isPanMode ? 'grab' : 'default'
      }}
    >
      {/* Rulers Overlay */}
      <CanvasRulers mousePos={mousePos} />

      {/* Zoom and Pan Transform Container */}
      <div
        style={{
          width: '100%',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: previewMode || responsiveMode === 'desktop' ? '0' : '24px',
          paddingBottom: previewMode ? '0' : '180px',
          paddingLeft: previewMode || responsiveMode === 'desktop' ? '0' : '24px',
          paddingRight: previewMode || responsiveMode === 'desktop' ? '0' : '24px',
          boxSizing: 'border-box',
          transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'top center',
          transition: isDraggingPan.current ? 'none' : 'transform 150ms ease-out'
        }}
      >
        {/* Device Simulation Frame Wrapper */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: (responsiveMode === 'desktop' && !customCanvasWidth) ? '100%' : 'auto'
        }}>
          
          {/* Left Resize Handle */}
          {!previewMode && (
            <div
              onMouseDown={(e) => startWidthResize(e, 'left')}
              title="Drag to resize canvas width"
              style={{
                position: 'absolute',
                left: '-16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '10px',
                height: '48px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '4px',
                cursor: 'ew-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                zIndex: 60,
                userSelect: 'none'
              }}
            >
              <GripVertical size={10} />
            </div>
          )}

          {/* Device Simulation Frame */}
          <div
            style={{
              width: getViewportWidth(),
              minHeight: '100%',
              background: '#0b0f17',
              boxShadow: previewMode || (responsiveMode === 'desktop' && !customCanvasWidth) ? 'none' : '0 25px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)',
              borderRadius: previewMode || (responsiveMode === 'desktop' && !customCanvasWidth) ? '0' : '16px',
              transition: isResizingWidth.current ? 'none' : 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            {/* Device Status Bar Indicator */}
            {!previewMode && (responsiveMode !== 'desktop' || customCanvasWidth) && (
              <div style={{
                height: '28px',
                background: '#070a0f',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--text-dim)',
                userSelect: 'none',
                gap: '6px'
              }}>
                {responsiveMode === 'tablet' ? <Tablet size={13} style={{ color: 'var(--primary)' }} /> : <Smartphone size={13} style={{ color: 'var(--primary)' }} />}
                <span>
                  {customCanvasWidth ? `Custom Width: ${customCanvasWidth}px` : (responsiveMode === 'tablet' ? 'Tablet View (768px)' : 'Mobile View (375px)')}
                </span>
              </div>
            )}

            {/* Tree Root Render */}
            <ElementRenderer element={tree} />
          </div>

          {/* Right Resize Handle */}
          {!previewMode && (
            <div
              onMouseDown={(e) => startWidthResize(e, 'right')}
              title="Drag to resize canvas width"
              style={{
                position: 'absolute',
                right: '-16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '10px',
                height: '48px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '4px',
                cursor: 'ew-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                zIndex: 60,
                userSelect: 'none'
              }}
            >
              <GripVertical size={10} />
            </div>
          )}
        </div>
      </div>

      {/* Floating Canvas Bottom Toolbar */}
      <CanvasBottomBar />

      {/* Floating Left Panel Trigger (when collapsed) */}
      {!leftSidebarOpen && !previewMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLeftSidebar();
          }}
          title="Open Widgets & Elements Panel"
          style={{
            position: 'fixed',
            left: '16px',
            top: '72px',
            zIndex: 90,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            transition: 'all 200ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-surface-elevated)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.92)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <PanelLeft size={15} />
          <span>+ Add Widget</span>
        </button>
      )}

      {/* Floating Right Panel Trigger (when collapsed) */}
      {!rightSidebarOpen && !previewMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleRightSidebar();
          }}
          title="Open Settings & Styles Panel"
          style={{
            position: 'fixed',
            right: '16px',
            top: '72px',
            zIndex: 90,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            transition: 'all 200ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-surface-elevated)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.92)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <Sliders size={15} />
          <span>Settings</span>
        </button>
      )}

      {/* Right Click Context Menu */}
      <ContextMenu />

      {/* Floating Scroll To Top Button */}
      {showScrollTop && !previewMode && (
        <button
          onClick={scrollToTop}
          title="Scroll to top of canvas"
          style={{
            position: 'fixed',
            bottom: '70px',
            right: rightSidebarOpen ? '360px' : '24px',
            zIndex: 99,
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-main)',
            borderRadius: '9999px',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            transition: 'all 200ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--primary)';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
            e.currentTarget.style.color = 'var(--text-main)';
          }}
        >
          <ChevronUp size={16} />
          <span>Top</span>
        </button>
      )}
    </div>
  );
}
