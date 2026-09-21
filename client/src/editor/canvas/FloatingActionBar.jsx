import React from 'react';
import { useEditor } from '../context/EditorContext';
import { WIDGET_REGISTRY } from '../widgetRegistry';
import { Copy, Trash2, ArrowUp, ArrowDown, Scissors } from 'lucide-react';

export default function FloatingActionBar({ element }) {
  const { deleteElement, duplicateElement, copyElement } = useEditor();

  if (!element || element.id === 'root') return null;

  const def = WIDGET_REGISTRY[element.type] || { name: element.type };

  return (
    <div
      style={{
        position: 'absolute',
        top: '-28px',
        left: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        background: 'var(--primary)',
        color: '#0f172a',
        padding: '2px 6px',
        borderRadius: '4px 4px 0 0',
        fontSize: '11px',
        fontWeight: '700',
        zIndex: 100,
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        pointerEvents: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <span>{def.name}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '6px', borderLeft: '1px solid rgba(15,23,42,0.2)', paddingLeft: '4px' }}>
        <button
          onClick={() => duplicateElement(element.id)}
          title="Duplicate Element"
          style={{
            background: 'none',
            border: 'none',
            color: '#0f172a',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Copy size={11} />
        </button>

        <button
          onClick={() => copyElement(element.id)}
          title="Copy Element"
          style={{
            background: 'none',
            border: 'none',
            color: '#0f172a',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Scissors size={11} />
        </button>

        <button
          onClick={() => deleteElement(element.id)}
          title="Delete Element"
          style={{
            background: 'none',
            border: 'none',
            color: '#991b1b',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}
