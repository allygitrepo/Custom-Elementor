import React, { useState } from 'react';
import { useEditor } from './context/EditorContext';
import { WIDGET_REGISTRY, WIDGET_CATEGORIES } from './widgetRegistry';
import { 
  Search, 
  Layers, 
  Grid, 
  LayoutTemplate, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Copy,
  Box,
  Maximize2,
  Minus,
  Heading,
  AlignLeft,
  Image,
  MousePointerClick,
  Star,
  Video,
  ListCollapse,
  Hash,
  Code2
} from 'lucide-react';

const ICON_MAP = {
  Box,
  Maximize2,
  Minus,
  Heading,
  AlignLeft,
  Image,
  MousePointerClick,
  Star,
  Video,
  ListCollapse,
  Hash,
  Code2
};

export default function LeftSidebar() {
  const { 
    tree, 
    selectedElementId, 
    setSelectedElementId, 
    deleteElement, 
    duplicateElement, 
    setDraggedWidgetType,
    addElement
  } = useEditor();

  const [activeTab, setActiveTab] = useState('widgets'); // 'widgets' | 'navigator'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const widgetsList = Object.values(WIDGET_REGISTRY);

  const filteredWidgets = widgetsList.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || w.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDragStart = (widgetType, e) => {
    setDraggedWidgetType(widgetType);
    e.dataTransfer.setData('text/plain', widgetType);
  };

  const handleDragEnd = () => {
    setDraggedWidgetType(null);
  };

  // Navigator recursive tree rendering
  const renderNavigatorNode = (node, depth = 0) => {
    const isSelected = selectedElementId === node.id;
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const def = WIDGET_REGISTRY[node.type] || { name: node.type };
    const IconComp = ICON_MAP[def.icon] || Layers;

    return (
      <div key={node.id} style={{ marginLeft: `${depth * 14}px` }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElementId(node.id);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            border: isSelected ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
            color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '12px',
            marginBottom: '2px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <IconComp size={14} />
            <span style={{ fontWeight: isSelected ? '700' : '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {node.id === 'root' ? 'Root Container' : def.name}
            </span>
          </div>

          {node.id !== 'root' && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateElement(node.id);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                title="Duplicate"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteElement(node.id);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px' }}
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>

        {hasChildren && (
          <div>
            {node.children.map(child => renderNavigatorNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '300px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 56px)',
      userSelect: 'none',
      zIndex: 50
    }}>
      {/* Sidebar Header Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface-elevated)'
      }}>
        <button
          onClick={() => setActiveTab('widgets')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '12px',
            background: activeTab === 'widgets' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'widgets' ? 'var(--primary)' : 'var(--text-dim)',
            border: 'none',
            borderBottom: activeTab === 'widgets' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          <Grid size={15} />
          <span>Widgets</span>
        </button>

        <button
          onClick={() => setActiveTab('navigator')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '12px',
            background: activeTab === 'navigator' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'navigator' ? 'var(--primary)' : 'var(--text-dim)',
            border: 'none',
            borderBottom: activeTab === 'navigator' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          <Layers size={15} />
          <span>Layers Tree</span>
        </button>
      </div>

      {/* Widgets Tab Content */}
      {activeTab === 'widgets' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px', fontSize: '13px' }}
              placeholder="Search elements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={15} color="var(--text-dim)" style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
          </div>

          {/* Categories Pill Bar */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '10px' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: '600',
                background: selectedCategory === 'all' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                color: selectedCategory === 'all' ? '#0f172a' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              All
            </button>
            {WIDGET_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: selectedCategory === cat.id ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                  color: selectedCategory === cat.id ? '#0f172a' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Draggable Widgets Grid */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            alignContent: 'start',
            paddingRight: '4px'
          }}>
            {filteredWidgets.map(widget => {
              const IconComponent = ICON_MAP[widget.icon] || Box;
              return (
                <div
                  key={widget.type}
                  draggable
                  onDragStart={(e) => handleDragStart(widget.type, e)}
                  onDragEnd={handleDragEnd}
                  onClick={() => addElement(selectedElementId || 'root', widget.type)}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'grab',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <IconComponent size={18} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {widget.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Layers Navigator Tab Content */}
      {activeTab === 'navigator' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', marginBottom: '12px', fontWeight: '700' }}>
            Page Hierarchy
          </div>
          {renderNavigatorNode(tree)}
        </div>
      )}
    </div>
  );
}
