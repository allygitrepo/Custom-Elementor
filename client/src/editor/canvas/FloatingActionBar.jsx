import React from 'react';
import { useEditor } from '../context/EditorContext';
import { WIDGET_REGISTRY } from '../widgetRegistry';
import { 
  Copy, 
  Trash2, 
  ArrowUp, 
  Plus, 
  Paintbrush, 
  Lock, 
  Unlock, 
  CornerLeftUp,
  MoreHorizontal
} from 'lucide-react';

export default function FloatingActionBar({ element }) {
  const { 
    deleteElement, 
    duplicateElement, 
    copyElement, 
    copyStyle,
    addBefore, 
    addAfter, 
    toggleLock, 
    isElementLocked,
    selectParent,
    openContextMenu,
    setActiveLeftTab
  } = useEditor();

  if (!element || element.id === 'root') return null;

  const def = WIDGET_REGISTRY[element.type] || { name: element.type };
  const isLocked = isElementLocked(element.id);
  const isContainer = element.type === 'container' || element.type === 'section';

  return (
    <div
      style={{
        position: 'absolute',
        top: '-30px',
        left: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: isLocked ? '#f59e0b' : 'var(--primary)',
        color: '#070a0f',
        padding: '3px 8px',
        borderRadius: '6px 6px 0 0',
        fontSize: '11px',
        fontWeight: '800',
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Element Name Badge */}
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
        {isLocked && <Lock size={10} />}
        <span>{def.name}</span>
      </span>

      {/* Action Buttons Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '6px', borderLeft: '1px solid rgba(7,10,15,0.2)', paddingLeft: '6px' }}>
        {/* Select Parent (Jump up hierarchy) */}
        <button
          onClick={selectParent}
          title="Select Parent Container (Esc)"
          style={actionBtnStyle}
        >
          <CornerLeftUp size={12} />
        </button>

        {/* Add Section Before */}
        <button
          onClick={() => addBefore(element.id, 'section')}
          title="Add Section Before"
          style={actionBtnStyle}
        >
          <span style={{ fontSize: '10px', display: 'flex', alignItems: 'center' }}>↑+</span>
        </button>

        {/* Add Section After */}
        <button
          onClick={() => addAfter(element.id, 'section')}
          title="Add Section After"
          style={actionBtnStyle}
        >
          <span style={{ fontSize: '10px', display: 'flex', alignItems: 'center' }}>↓+</span>
        </button>

        {/* Add Widget inside (if container) */}
        {isContainer && (
          <button
            onClick={() => setActiveLeftTab('widgets')}
            title="Add Widget Inside (+)"
            style={actionBtnStyle}
          >
            <Plus size={12} />
          </button>
        )}

        {/* Copy Style */}
        <button
          onClick={() => copyStyle(element.id)}
          title="Copy Style Only"
          style={actionBtnStyle}
        >
          <Paintbrush size={12} />
        </button>

        {/* Duplicate */}
        <button
          onClick={() => duplicateElement(element.id)}
          title="Duplicate Element (Ctrl+D)"
          style={actionBtnStyle}
        >
          <Copy size={12} />
        </button>

        {/* Lock Toggle */}
        <button
          onClick={() => toggleLock(element.id)}
          title={isLocked ? 'Unlock Element' : 'Lock Element'}
          style={actionBtnStyle}
        >
          {isLocked ? <Unlock size={12} /> : <Lock size={12} />}
        </button>

        {/* More Actions / Context Menu Trigger */}
        <button
          onClick={(e) => openContextMenu(e, element.id)}
          title="More Actions (Right Click)"
          style={actionBtnStyle}
        >
          <MoreHorizontal size={12} />
        </button>

        {/* Delete */}
        <button
          onClick={() => deleteElement(element.id)}
          title="Delete Element (Del)"
          style={{ ...actionBtnStyle, color: '#b91c1c' }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#070a0f',
  cursor: 'pointer',
  padding: '2px 4px',
  borderRadius: '3px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 120ms ease'
};
