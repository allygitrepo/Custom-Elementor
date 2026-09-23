import React from 'react';
import { useEditor } from '../context/EditorContext';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  Ruler, 
  Hand, 
  ChevronRight, 
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Eye
} from 'lucide-react';

export default function CanvasBottomBar() {
  const { 
    zoom, 
    setZoom, 
    zoomIn, 
    zoomOut, 
    resetZoom, 
    fitToScreen,
    isPanMode, 
    setIsPanMode, 
    focusMode, 
    setFocusMode, 
    showRulers, 
    setShowRulers,
    breadcrumbs,
    setSelectedElementId,
    selectedElementId,
    previewMode,
    responsiveMode,
    setResponsiveMode,
    customCanvasWidth,
    setCustomCanvasWidth
  } = useEditor();

  if (previewMode) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: focusMode ? '24px' : '300px',
        right: focusMode ? '24px' : '340px',
        height: '42px',
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        zIndex: 80,
        userSelect: 'none',
        transition: 'all 200ms ease'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left: Interactive Breadcrumb Hierarchy */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', maxWidth: '50%' }}>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id}>
                <button
                  onClick={() => setSelectedElementId(crumb.id)}
                  style={{
                    background: isLast ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    border: 'none',
                    color: isLast ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: '11px',
                    fontWeight: isLast ? '700' : '500',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 120ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLast) e.currentTarget.style.color = 'var(--text-main)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLast) e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {crumb.name}
                </button>
                {!isLast && <ChevronRight size={12} color="var(--text-dim)" />}
              </React.Fragment>
            );
          })
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Page Canvas</span>
        )}
      </div>

      {/* Right: Viewport, Zoom, Pan & Focus Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Custom Width Reset Pill if active */}
        {customCanvasWidth && (
          <button
            onClick={() => setCustomCanvasWidth(null)}
            title="Reset to standard breakpoint width"
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: 'var(--primary)',
              fontSize: '10px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {customCanvasWidth}px (Custom) ✕
          </button>
        )}

        {/* Pan Tool Toggle */}
        <ToolButton
          icon={Hand}
          title="Pan Mode (Space + Drag)"
          active={isPanMode}
          onClick={() => setIsPanMode(!isPanMode)}
        />

        {/* Rulers Toggle */}
        <ToolButton
          icon={Ruler}
          title="Toggle Pixel Rulers"
          active={showRulers}
          onClick={() => setShowRulers(!showRulers)}
        />

        {/* Divider */}
        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />

        {/* Zoom Out */}
        <ToolButton
          icon={ZoomOut}
          title="Zoom Out"
          disabled={zoom <= 0.5}
          onClick={zoomOut}
        />

        {/* Zoom Level Select */}
        <select
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          style={{
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontWeight: '600',
            padding: '2px 6px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value={0.5}>50%</option>
          <option value={0.75}>75%</option>
          <option value={1}>100%</option>
          <option value={1.25}>125%</option>
          <option value={1.5}>150%</option>
        </select>

        {/* Zoom In */}
        <ToolButton
          icon={ZoomIn}
          title="Zoom In"
          disabled={zoom >= 1.5}
          onClick={zoomIn}
        />

        {/* Reset Zoom */}
        <ToolButton
          icon={RotateCcw}
          title="Reset Zoom to 100%"
          onClick={resetZoom}
        />

        {/* Divider */}
        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />

        {/* Focus Mode (Fullscreen Canvas) */}
        <ToolButton
          icon={focusMode ? Minimize : Maximize}
          title={focusMode ? 'Exit Fullscreen Focus (Ctrl+\\)' : 'Fullscreen Focus Mode (Ctrl+\\)'}
          active={focusMode}
          onClick={() => setFocusMode(!focusMode)}
        />
      </div>
    </div>
  );
}

function ToolButton({ icon: Icon, title, active = false, disabled = false, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: 'var(--radius-sm)',
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? '#000000' : (disabled ? 'var(--text-dim)' : 'var(--text-muted)'),
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 120ms ease'
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.color = 'var(--text-main)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }
      }}
    >
      <Icon size={14} />
    </button>
  );
}
