import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import FloatingActionBar from './FloatingActionBar';
import { 
  Sparkles, 
  Star, 
  Heart, 
  Check, 
  Zap, 
  Shield, 
  Globe, 
  Layers, 
  Send, 
  Activity,
  ChevronDown,
  Plus,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ICON_MAP = {
  Sparkles, Star, Heart, Check, Zap, Shield, Globe, Layers, Send, Activity
};

export default function ElementRenderer({ element, parentId = null }) {
  const { 
    selectedElementId, 
    setSelectedElementId, 
    hoveredElementId, 
    setHoveredElementId,
    responsiveMode,
    previewMode,
    updateElementSettings,
    addElement,
    draggedWidgetType
  } = useEditor();

  const [isDragOver, setIsDragOver] = useState(false);
  const [activeAccordionIndex, setActiveAccordionIndex] = useState(0);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  if (!element) return null;

  const isSelected = selectedElementId === element.id && !previewMode;
  const isHovered = hoveredElementId === element.id && !isSelected && !previewMode;
  const isRoot = element.id === 'root';
  const settings = element.settings || {};

  // Responsive value helper
  const getVal = (val, defaultVal = '') => {
    if (val === undefined || val === null) return defaultVal;
    if (typeof val === 'object') {
      return val[responsiveMode] || val.desktop || defaultVal;
    }
    return val || defaultVal;
  };

  // Drag & Drop Handlers for Containers
  const handleDragOver = (e) => {
    if (element.type === 'container' || isRoot) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    if (element.type === 'container' || isRoot) {
      e.stopPropagation();
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    if (element.type === 'container' || isRoot) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const widgetType = e.dataTransfer.getData('text/plain') || draggedWidgetType;
      if (widgetType) {
        addElement(element.id, widgetType);
      }
    }
  };

  const handleClick = (e) => {
    if (previewMode) return;
    e.stopPropagation();
    setSelectedElementId(element.id);
  };

  // Inline text editing handler
  const handleInlineBlur = (field, e) => {
    updateElementSettings(element.id, {
      ...settings,
      [field]: e.currentTarget.innerHTML || e.currentTarget.innerText
    });
  };

  // Build element style
  const getContainerStyle = () => {
    const pad = settings.padding || {};
    const mar = settings.margin || {};
    return {
      display: 'flex',
      flexDirection: settings.direction || 'column',
      alignItems: settings.align || 'stretch',
      justifyContent: settings.justify || 'flex-start',
      flexWrap: settings.wrap || 'nowrap',
      gap: settings.gap || '16px',
      paddingTop: pad.top || '0px',
      paddingRight: pad.right || '0px',
      paddingBottom: pad.bottom || '0px',
      paddingLeft: pad.left || '0px',
      marginTop: mar.top || '0px',
      marginRight: mar.right || '0px',
      marginBottom: mar.bottom || '0px',
      marginLeft: mar.left || '0px',
      background: settings.background || 'transparent',
      minHeight: settings.minHeight || 'auto',
      maxWidth: settings.maxWidth || '100%',
      borderRadius: settings.borderRadius || '0px',
      borderStyle: settings.borderStyle || 'none',
      borderWidth: settings.borderWidth || '1px',
      borderColor: settings.borderColor || 'transparent',
      boxShadow: settings.boxShadow || 'none',
      position: 'relative',
      boxSizing: 'border-box',
      width: '100%'
    };
  };

  // Outline style for editor visual cues
  const getOutlineStyle = () => {
    if (previewMode) return {};

    if (isSelected) {
      return {
        outline: '2px solid var(--primary)',
        outlineOffset: '-1px'
      };
    }

    if (isDragOver) {
      return {
        outline: '2px dashed var(--accent-emerald)',
        background: 'rgba(16, 185, 129, 0.05)'
      };
    }

    if (isHovered) {
      return {
        outline: '1px dashed rgba(56, 189, 248, 0.6)',
        outlineOffset: '-1px'
      };
    }

    if (element.type === 'container' && (!element.children || element.children.length === 0)) {
      return {
        outline: '1px dashed rgba(255, 255, 255, 0.15)',
        minHeight: '80px'
      };
    }

    return {};
  };

  // Render individual widget types
  const renderWidgetContent = () => {
    switch (element.type) {
      case 'container':
        return (
          <div style={{ ...getContainerStyle(), ...getOutlineStyle() }}>
            {isSelected && <FloatingActionBar element={element} />}

            {(!element.children || element.children.length === 0) && !previewMode && (
              <div style={{
                width: '100%',
                padding: '30px 20px',
                textAlign: 'center',
                color: 'var(--text-dim)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                pointerEvents: 'none'
              }}>
                <Plus size={20} style={{ opacity: 0.5 }} />
                <span style={{ fontSize: '13px' }}>Drag widgets here or click + from the sidebar</span>
              </div>
            )}

            {Array.isArray(element.children) && element.children.map(child => (
              <ElementRenderer key={child.id} element={child} parentId={element.id} />
            ))}
          </div>
        );

      case 'heading': {
        const Tag = settings.tag || 'h2';
        const fontSize = getVal(settings.fontSize, '32px');
        return (
          <Tag
            contentEditable={!previewMode}
            suppressContentEditableWarning
            onBlur={(e) => handleInlineBlur('text', e)}
            style={{
              color: settings.color || '#ffffff',
              fontSize: fontSize,
              fontWeight: settings.fontWeight || '700',
              textAlign: settings.align || 'left',
              lineHeight: settings.lineHeight || '1.2',
              letterSpacing: settings.letterSpacing || '0px',
              margin: '0',
              outline: 'none',
              cursor: previewMode ? 'inherit' : 'text'
            }}
            dangerouslySetInnerHTML={{ __html: settings.text || 'Heading Text' }}
          />
        );
      }

      case 'text': {
        const fontSize = getVal(settings.fontSize, '16px');
        return (
          <div
            contentEditable={!previewMode}
            suppressContentEditableWarning
            onBlur={(e) => handleInlineBlur('text', e)}
            style={{
              color: settings.color || '#94a3b8',
              fontSize: fontSize,
              lineHeight: settings.lineHeight || '1.6',
              textAlign: settings.align || 'left',
              maxWidth: settings.maxWidth || '100%',
              outline: 'none',
              cursor: previewMode ? 'inherit' : 'text'
            }}
            dangerouslySetInnerHTML={{ __html: settings.text || '<p>Text content here...</p>' }}
          />
        );
      }

      case 'image':
        return (
          <div style={{ width: settings.width || '100%', maxWidth: settings.maxWidth || '100%', textAlign: settings.align || 'left' }}>
            <img
              src={settings.url || 'https://via.placeholder.com/600x400'}
              alt={settings.alt || 'Widget image'}
              style={{
                width: '100%',
                height: settings.height || 'auto',
                objectFit: settings.objectFit || 'cover',
                borderRadius: settings.borderRadius || '8px',
                display: 'block'
              }}
            />
          </div>
        );

      case 'button':
        return (
          <div style={{ display: 'inline-block' }}>
            <a
              href={previewMode ? (settings.url || '#') : undefined}
              target={settings.target || '_self'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: settings.background || '#38bdf8',
                color: settings.textColor || '#0f172a',
                paddingTop: settings.padding?.top || '12px',
                paddingRight: settings.padding?.right || '24px',
                paddingBottom: settings.padding?.bottom || '12px',
                paddingLeft: settings.padding?.left || '24px',
                borderRadius: settings.borderRadius || '8px',
                fontSize: settings.fontSize || '14px',
                fontWeight: settings.fontWeight || '600',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onClick={(e) => { if (!previewMode) e.preventDefault(); }}
            >
              {settings.text || 'Click Here'}
            </a>
          </div>
        );

      case 'icon': {
        const IconComponent = ICON_MAP[settings.iconName] || Sparkles;
        return (
          <div style={{ textAlign: settings.align || 'left' }}>
            <IconComponent
              size={parseInt(settings.size, 10) || 32}
              color={settings.color || '#38bdf8'}
            />
          </div>
        );
      }

      case 'iconbox': {
        const IconComponent = ICON_MAP[settings.iconName] || Zap;
        const pad = settings.padding || {};
        return (
          <div style={{
            background: settings.background || 'rgba(255,255,255,0.03)',
            paddingTop: pad.top || '24px',
            paddingRight: pad.right || '20px',
            paddingBottom: pad.bottom || '24px',
            paddingLeft: pad.left || '20px',
            borderRadius: settings.borderRadius || '12px',
            textAlign: settings.align || 'center',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ display: 'inline-flex', marginBottom: '12px', color: settings.iconColor || '#38bdf8' }}>
              <IconComponent size={parseInt(settings.iconSize, 10) || 36} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
              {settings.title || 'Feature Title'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              {settings.description || 'Feature description details here...'}
            </p>
          </div>
        );
      }

      case 'spacer':
        return (
          <div style={{ height: settings.height || '40px', width: '100%' }} />
        );

      case 'divider':
        return (
          <div style={{ width: '100%', display: 'flex', justifyContent: settings.align || 'center' }}>
            <div style={{
              width: settings.width || '100%',
              borderTopStyle: settings.style || 'solid',
              borderTopWidth: settings.weight || '1px',
              borderTopColor: settings.color || 'rgba(255,255,255,0.12)'
            }} />
          </div>
        );

      case 'video':
        return (
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: settings.aspectRatio || '16/9',
            borderRadius: settings.borderRadius || '8px',
            overflow: 'hidden'
          }}>
            <iframe
              src={settings.url || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
              title="Video player"
              frameBorder="0"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none', pointerEvents: previewMode ? 'auto' : 'none' }}
            />
          </div>
        );

      case 'gallery': {
        const images = settings.images || [];
        const cols = settings.columns || 3;
        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: settings.gap || '12px',
            width: '100%'
          }}>
            {images.map((imgUrl, i) => (
              <div key={i} style={{ aspectRatio: '1', borderRadius: settings.borderRadius || '8px', overflow: 'hidden' }}>
                <img src={imgUrl} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        );
      }

      case 'accordion': {
        const items = settings.items || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            {items.map((item, idx) => {
              const isOpen = activeAccordionIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: settings.background || 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: settings.borderRadius || '8px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAccordionIndex(isOpen ? -1 : idx);
                    }}
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: isOpen ? (settings.activeColor || '#38bdf8') : '#ffffff'
                    }}
                  >
                    <span>{item.title}</span>
                    <ChevronDown size={16} style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 200ms ease'
                    }} />
                  </div>
                  {isOpen && (
                    <div style={{ padding: '0 18px 16px', color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case 'tabs': {
        const tabs = settings.tabs || [];
        return (
          <div style={{
            background: settings.background || 'rgba(255,255,255,0.03)',
            borderRadius: settings.borderRadius || '8px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            width: '100%'
          }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {tabs.map((tab, idx) => {
                const isActive = activeTabIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTabIndex(idx);
                    }}
                    style={{
                      padding: '12px 20px',
                      background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                      color: isActive ? (settings.activeColor || '#38bdf8') : '#94a3b8',
                      border: 'none',
                      borderBottom: isActive ? `2px solid ${settings.activeColor || '#38bdf8'}` : '2px solid transparent',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    {tab.title}
                  </button>
                );
              })}
            </div>
            <div style={{ padding: '20px', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
              {tabs[activeTabIndex]?.content}
            </div>
          </div>
        );
      }

      case 'counter':
        return (
          <div style={{ textAlign: 'center', padding: '12px' }}>
            <div style={{
              fontSize: '48px',
              fontWeight: '800',
              color: settings.numberColor || '#38bdf8',
              lineHeight: '1'
            }}>
              {settings.prefix || ''}{settings.number || '100'}{settings.suffix || ''}
            </div>
            {settings.label && (
              <div style={{ fontSize: '14px', color: settings.labelColor || '#94a3b8', marginTop: '6px', fontWeight: '500' }}>
                {settings.label}
              </div>
            )}
          </div>
        );

      case 'progress': {
        const pct = Math.min(100, Math.max(0, parseInt(settings.percent, 10) || 0));
        return (
          <div style={{ width: '100%' }}>
            {settings.label && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                <span>{settings.label}</span>
                <span style={{ color: settings.barColor || '#38bdf8' }}>{pct}%</span>
              </div>
            )}
            <div style={{
              width: '100%',
              height: settings.height || '10px',
              background: settings.trackColor || 'rgba(255,255,255,0.1)',
              borderRadius: settings.borderRadius || '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: settings.barColor || '#38bdf8',
                borderRadius: settings.borderRadius || '9999px',
                transition: 'width 300ms ease'
              }} />
            </div>
          </div>
        );
      }

      case 'testimonial': {
        const pad = settings.padding || {};
        return (
          <div style={{
            background: settings.background || 'rgba(255, 255, 255, 0.03)',
            paddingTop: pad.top || '24px',
            paddingRight: pad.right || '24px',
            paddingBottom: pad.bottom || '24px',
            paddingLeft: pad.left || '24px',
            borderRadius: settings.borderRadius || '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', gap: '4px', color: '#f59e0b' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#f59e0b" />
              ))}
            </div>

            <p style={{ color: '#e2e8f0', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.6', margin: 0 }}>
              {settings.quote || '"Amazing results and lightning fast delivery."'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              {settings.photo && (
                <img
                  src={settings.photo}
                  alt={settings.name || 'Author'}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>{settings.name || 'Author Name'}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{settings.role || 'Role, Company'}</div>
              </div>
            </div>
          </div>
        );
      }

      case 'alert': {
        const alertTypes = {
          info: { bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8', icon: Info },
          success: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', color: '#10b981', icon: CheckCircle2 },
          warning: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', icon: AlertTriangle },
          error: { bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)', color: '#f43f5e', icon: XCircle }
        };
        const currentAlert = alertTypes[settings.type || 'info'] || alertTypes.info;
        const IconComp = currentAlert.icon;

        return (
          <div style={{
            background: currentAlert.bg,
            border: `1px solid ${currentAlert.border}`,
            borderRadius: settings.borderRadius || '8px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            width: '100%'
          }}>
            <IconComp size={20} color={currentAlert.color} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              {settings.title && (
                <div style={{ fontWeight: '700', fontSize: '14px', color: currentAlert.color, marginBottom: '4px' }}>
                  {settings.title}
                </div>
              )}
              <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                {settings.message || 'Alert message...'}
              </div>
            </div>
          </div>
        );
      }

      case 'html':
        return (
          <div
            dangerouslySetInnerHTML={{ __html: settings.code || '<div>Custom HTML Block</div>' }}
          />
        );

      default:
        return <div>Widget type [{element.type}]</div>;
    }
  };

  if (element.type === 'container') {
    return (
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => !previewMode && setHoveredElementId(element.id)}
        onMouseLeave={() => !previewMode && setHoveredElementId(null)}
        style={{ width: '100%', position: 'relative' }}
      >
        {renderWidgetContent()}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => !previewMode && setHoveredElementId(element.id)}
      onMouseLeave={() => !previewMode && setHoveredElementId(null)}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        ...getOutlineStyle()
      }}
    >
      {isSelected && <FloatingActionBar element={element} />}
      {renderWidgetContent()}
    </div>
  );
}
