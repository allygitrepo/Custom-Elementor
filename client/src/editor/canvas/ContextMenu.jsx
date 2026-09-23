import React, { useEffect, useRef } from 'react';
import { useEditor } from '../context/EditorContext';
import { 
  Edit3, 
  Copy, 
  Paintbrush, 
  Clipboard, 
  Layers, 
  PlusCircle, 
  ArrowUp, 
  ArrowDown, 
  Lock, 
  Unlock, 
  EyeOff, 
  Trash2, 
  X,
  Plus
} from 'lucide-react';

export default function ContextMenu() {
  const { 
    contextMenu, 
    closeContextMenu, 
    tree, 
    selectedElement,
    responsiveMode,
    copyElement, 
    pasteElement, 
    copyStyle, 
    pasteStyle, 
    duplicateElement, 
    deleteElement, 
    toggleLock, 
    isElementLocked,
    toggleHideOnDevice,
    addBefore,
    addAfter,
    addElement,
    clipboard, 
    styleClipboard,
    setActiveLeftTab
  } = useEditor();

  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeContextMenu();
      }
    };

    if (contextMenu.isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [contextMenu.isOpen, closeContextMenu]);

  if (!contextMenu.isOpen || !selectedElement) return null;

  const elementId = selectedElement.id;
  const isRoot = elementId === 'root';
  const isLocked = isElementLocked(elementId);
  const isContainer = selectedElement.type === 'container' || isRoot;
  const isHiddenOnCurrent = Boolean(selectedElement.settings?.hidden?.[responsiveMode]);

  // Prevent menu from overflowing window bounds
  const x = Math.min(contextMenu.x, window.innerWidth - 240);
  const y = Math.min(contextMenu.y, window.innerHeight - 380);

  const handleAction = (callback) => {
    callback();
    closeContextMenu();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        width: '230px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.08)',
        zIndex: 9999,
        padding: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        userSelect: 'none',
        animation: 'fadeIn 120ms ease'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with Type Tag */}
      <div style={{
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '4px'
      }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
          {selectedElement.type}
        </span>
        <button
          onClick={closeContextMenu}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex' }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Copy & Paste Options */}
      <MenuItem 
        icon={Copy} 
        label="Copy Element" 
        shortcut="Ctrl+C" 
        onClick={() => handleAction(() => copyElement(elementId))} 
      />
      <MenuItem 
        icon={Paintbrush} 
        label="Copy Style Only" 
        onClick={() => handleAction(() => copyStyle(elementId))} 
      />
      <MenuItem 
        icon={Clipboard} 
        label="Paste Element" 
        shortcut="Ctrl+V" 
        disabled={!clipboard} 
        onClick={() => handleAction(() => pasteElement(elementId))} 
      />
      <MenuItem 
        icon={Paintbrush} 
        label="Paste Style" 
        disabled={!styleClipboard} 
        onClick={() => handleAction(() => pasteStyle(elementId))} 
      />

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

      {/* Structure & Sibling Additions */}
      {!isRoot && (
        <>
          <MenuItem 
            icon={Layers} 
            label="Duplicate" 
            shortcut="Ctrl+D" 
            onClick={() => handleAction(() => duplicateElement(elementId))} 
          />
          <MenuItem 
            icon={PlusCircle} 
            label="Add Section Before" 
            onClick={() => handleAction(() => addBefore(elementId, 'container'))} 
          />
          <MenuItem 
            icon={PlusCircle} 
            label="Add Section After" 
            onClick={() => handleAction(() => addAfter(elementId, 'container'))} 
          />
        </>
      )}

      {isContainer && (
        <MenuItem 
          icon={Plus} 
          label="Add Widget Inside" 
          onClick={() => handleAction(() => setActiveLeftTab('widgets'))} 
        />
      )}

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

      {/* Lock & Visibility */}
      {!isRoot && (
        <>
          <MenuItem 
            icon={isLocked ? Unlock : Lock} 
            label={isLocked ? 'Unlock Element' : 'Lock Element'} 
            onClick={() => handleAction(() => toggleLock(elementId))} 
          />
          <MenuItem 
            icon={EyeOff} 
            label={isHiddenOnCurrent ? `Show on ${responsiveMode}` : `Hide on ${responsiveMode}`} 
            onClick={() => handleAction(() => toggleHideOnDevice(elementId, responsiveMode))} 
          />
          
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

          {/* Delete */}
          <MenuItem 
            icon={Trash2} 
            label="Delete" 
            shortcut="Del" 
            danger 
            onClick={() => handleAction(() => deleteElement(elementId))} 
          />
        </>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, shortcut, danger = false, disabled = false, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '7px 10px',
        borderRadius: 'var(--radius-sm)',
        background: 'transparent',
        border: 'none',
        color: disabled ? 'var(--text-dim)' : (danger ? 'var(--accent-rose)' : 'var(--text-main)'),
        fontSize: '13px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 120ms ease'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = danger ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={14} style={{ opacity: 0.8 }} />
        <span>{label}</span>
      </div>
      {shortcut && (
        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          {shortcut}
        </span>
      )}
    </button>
  );
}
