import React from 'react';
import { useEditor } from './context/EditorContext';
import { WIDGET_REGISTRY } from './widgetRegistry';
import DynamicControlPanel from './controls/DynamicControlPanel';

export default function RightSidebar() {
  const { 
    selectedElement, 
    updateElementSettings, 
    deleteElement, 
    duplicateElement 
  } = useEditor();

  const widgetDef = selectedElement ? WIDGET_REGISTRY[selectedElement.type] : null;

  return (
    <div style={{
      width: '320px',
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 56px)',
      userSelect: 'none',
      zIndex: 50
    }}>
      <DynamicControlPanel
        element={selectedElement}
        widgetDef={widgetDef}
        onUpdateSettings={(newSettings) => updateElementSettings(selectedElement.id, newSettings)}
        onDelete={selectedElement?.id !== 'root' ? () => deleteElement(selectedElement.id) : null}
        onDuplicate={selectedElement?.id !== 'root' ? () => duplicateElement(selectedElement.id) : null}
      />
    </div>
  );
}
