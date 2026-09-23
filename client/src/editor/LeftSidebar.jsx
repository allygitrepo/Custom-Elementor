import React, { useState, useEffect } from 'react';
import { useEditor } from './context/EditorContext';
import { WIDGET_REGISTRY, WIDGET_CATEGORIES } from './widgetRegistry';
import { api } from '../services/api';
import { 
  Search, 
  Layers, 
  Grid, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
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
  Code2,
  Sparkles,
  Globe,
  Shield,
  Zap,
  Activity,
  LayoutTemplate,
  Check,
  Loader2,
  Download
} from 'lucide-react';

const ICON_MAP = {
  Box, Maximize2, Minus, Heading, AlignLeft, Image, MousePointerClick,
  Star, Video, ListCollapse, Hash, Code2, Sparkles, Globe, Shield, Zap, Activity, Grid
};

export default function LeftSidebar() {
  const { 
    tree, 
    selectedElementId, 
    setSelectedElementId, 
    deleteElement, 
    duplicateElement, 
    setDraggedWidgetType,
    addElement,
    activeLeftTab,
    setActiveLeftTab,
    toggleLock,
    isElementLocked,
    toggleHideOnDevice,
    responsiveMode,
    leftSidebarOpen,
    toggleLeftSidebar,
    applyTemplate
  } = useEditor();

  const [search, setSearch] = useState('');
  const [navSearch, setNavSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplateCat, setSelectedTemplateCat] = useState('all');
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [appliedTemplateId, setAppliedTemplateId] = useState(null);

  const widgetsList = Object.values(WIDGET_REGISTRY);

  useEffect(() => {
    if (activeLeftTab === 'templates' && templates.length === 0) {
      setLoadingTemplates(true);
      api.getTemplates()
        .then(res => {
          const list = Array.isArray(res) ? res : (res?.templates || []);
          setTemplates(list);
        })
        .catch(err => console.error('Failed to load templates in sidebar:', err))
        .finally(() => setLoadingTemplates(false));
    }
  }, [activeLeftTab, templates.length]);

  const handleApplyTemplate = async (template, mode = 'replace') => {
    try {
      let content = template.content;
      if (!content && template.id) {
        // Fetch full template with content
        const full = await api.getTemplate(template.id);
        content = full?.content || full?.content_json;
      }
      if (!content) {
        alert('Selected template has no valid section content.');
        return;
      }
      if (mode === 'replace') {
        const confirmMsg = 'Applying this template will replace your current canvas sections. Do you wish to continue?';
        if (!window.confirm(confirmMsg)) return;
      }
      applyTemplate(content, mode);
      setAppliedTemplateId(template.id);
      setTimeout(() => setAppliedTemplateId(null), 3000);
    } catch (err) {
      console.error('Error applying template:', err);
      alert('Could not load template: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredWidgets = widgetsList.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || w.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredTemplates = templates.filter(tpl => {
    const matchesSearch = (tpl.name || '').toLowerCase().includes(templateSearch.toLowerCase()) ||
                          (tpl.description || '').toLowerCase().includes(templateSearch.toLowerCase()) ||
                          (tpl.category || '').toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCat = selectedTemplateCat === 'all' || (tpl.category || '').toLowerCase() === selectedTemplateCat.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const templateCategories = [
    { id: 'all', name: 'All' },
    { id: 'gym', name: 'Gym & Fitness' },
    { id: 'industrial', name: 'Industrial' },
    { id: 'saas', name: 'SaaS & Tech' },
    { id: 'business', name: 'Business' },
  ];

  const handleDragStart = (widgetType, e) => {
    setDraggedWidgetType(widgetType);
    e.dataTransfer.setData('text/plain', widgetType);
  };

  const handleDragEnd = () => {
    setDraggedWidgetType(null);
  };

  const toggleCollapse = (nodeId, e) => {
    e.stopPropagation();
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  // Navigator recursive tree rendering
  const renderNavigatorNode = (node, depth = 0) => {
    if (!node) return null;
    const isSelected = selectedElementId === node.id;
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isCollapsed = collapsedNodes.has(node.id);
    const def = WIDGET_REGISTRY[node.type] || { name: node.type };
    const IconComp = ICON_MAP[def.icon] || Layers;
    const isLocked = isElementLocked(node.id);
    const isHidden = Boolean(node.settings?.hidden?.[responsiveMode]);

    // Filter check
    if (navSearch.trim()) {
      const nameMatch = def.name.toLowerCase().includes(navSearch.toLowerCase()) || node.type.toLowerCase().includes(navSearch.toLowerCase());
      const childMatch = hasChildren && node.children.some(c => c.type.toLowerCase().includes(navSearch.toLowerCase()));
      if (!nameMatch && !childMatch) return null;
    }

    return (
      <div key={node.id} style={{ marginLeft: `${depth * 10}px` }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElementId(node.id);
            // Scroll canvas element into view if available
            const domEl = document.getElementById(node.id);
            if (domEl) {
              domEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 8px',
            borderRadius: 'var(--radius-sm)',
            background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            border: isSelected ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
            color: isSelected ? 'var(--primary)' : (isHidden ? 'var(--text-dim)' : 'var(--text-muted)'),
            cursor: 'pointer',
            fontSize: '12px',
            marginBottom: '2px',
            opacity: isHidden ? 0.6 : 1,
            transition: 'all 120ms ease'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          }}
          onMouseLeave={(e) => {
            if (!isSelected) e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', flex: 1 }}>
            {hasChildren ? (
              <button
                onClick={(e) => toggleCollapse(node.id, e)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
              </button>
            ) : (
              <span style={{ width: '13px' }} />
            )}

            <IconComp size={13} style={{ opacity: 0.8 }} />
            <span style={{ fontWeight: isSelected ? '700' : '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {node.id === 'root' ? 'Page Root' : def.name}
            </span>
          </div>

          {node.id !== 'root' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {/* Lock Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(node.id);
                }}
                style={{ background: 'none', border: 'none', color: isLocked ? '#f59e0b' : 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                title={isLocked ? 'Unlock Element' : 'Lock Element'}
              >
                {isLocked ? <Lock size={11} /> : <Unlock size={11} style={{ opacity: 0.4 }} />}
              </button>

              {/* Hide Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHideOnDevice(node.id, responsiveMode);
                }}
                style={{ background: 'none', border: 'none', color: isHidden ? 'var(--accent-rose)' : 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                title={isHidden ? `Show on ${responsiveMode}` : `Hide on ${responsiveMode}`}
              >
                {isHidden ? <EyeOff size={11} /> : <Eye size={11} style={{ opacity: 0.4 }} />}
              </button>

              {/* Duplicate */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateElement(node.id);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                title="Duplicate"
              >
                <Copy size={11} />
              </button>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteElement(node.id);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px' }}
                title="Delete"
              >
                <Trash2 size={11} />
              </button>
            </div>
          )}
        </div>

        {hasChildren && !isCollapsed && (
          <div>
            {node.children.map(child => renderNavigatorNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!leftSidebarOpen) return null;

  return (
    <div style={{
      width: '300px',
      minWidth: '300px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 56px)',
      userSelect: 'none',
      zIndex: 50,
      transition: 'all 200ms ease'
    }}>
      {/* Sidebar Header Tabs & Collapse Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface-elevated)',
        paddingRight: '6px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', flex: 1 }}>
          <button
            onClick={() => setActiveLeftTab('widgets')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '12px 4px',
              background: activeLeftTab === 'widgets' ? 'var(--bg-surface)' : 'transparent',
              color: activeLeftTab === 'widgets' ? 'var(--primary)' : 'var(--text-dim)',
              border: 'none',
              borderBottom: activeLeftTab === 'widgets' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Grid size={14} />
            <span>Widgets</span>
          </button>

          <button
            onClick={() => setActiveLeftTab('navigator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '12px 4px',
              background: activeLeftTab === 'navigator' ? 'var(--bg-surface)' : 'transparent',
              color: activeLeftTab === 'navigator' ? 'var(--primary)' : 'var(--text-dim)',
              border: 'none',
              borderBottom: activeLeftTab === 'navigator' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Layers size={14} />
            <span>Tree</span>
          </button>

          <button
            onClick={() => setActiveLeftTab('templates')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '12px 4px',
              background: activeLeftTab === 'templates' ? 'var(--bg-surface)' : 'transparent',
              color: activeLeftTab === 'templates' ? '#f59e0b' : 'var(--text-dim)',
              border: 'none',
              borderBottom: activeLeftTab === 'templates' ? '2px solid #f59e0b' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <LayoutTemplate size={14} />
            <span>Templates</span>
          </button>
        </div>

        {/* Collapse Button */}
        <button
          onClick={toggleLeftSidebar}
          title="Collapse Panel (Hide Sidebar)"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      {/* Widgets Tab Content */}
      {activeLeftTab === 'widgets' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px', fontSize: '13px' }}
              placeholder="Search sections & widgets..."
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

      {/* Structure Tree Navigator Tab Content */}
      {activeLeftTab === 'navigator' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
          {/* Navigator Search Filter */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '30px', paddingRight: '8px', fontSize: '12px', height: '32px' }}
              placeholder="Filter structure..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
            />
            <Search size={13} color="var(--text-dim)" style={{
              position: 'absolute',
              left: '9px',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
          </div>

          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700' }}>
            Page Hierarchy
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {renderNavigatorNode(tree)}
          </div>
        </div>
      )}

      {/* Templates Library Tab Content */}
      {activeLeftTab === 'templates' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
          {/* Template Search Filter */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '30px', paddingRight: '8px', fontSize: '12px', height: '32px' }}
              placeholder="Search templates..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
            />
            <Search size={13} color="var(--text-dim)" style={{
              position: 'absolute',
              left: '9px',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px' }}>
            {templateCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedTemplateCat(cat.id)}
                style={{
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: selectedTemplateCat === cat.id ? '#f59e0b' : 'var(--bg-surface-elevated)',
                  color: selectedTemplateCat === cat.id ? '#0f172a' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Templates list */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
            {loadingTemplates ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-dim)' }}>
                <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px', display: 'block', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '12px' }}>Loading templates...</span>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
                No templates found matching your criteria.
              </div>
            ) : (
              filteredTemplates.map(tpl => {
                const isGym = (tpl.category || '').toLowerCase() === 'gym';
                const isJustApplied = appliedTemplateId === tpl.id;
                
                return (
                  <div
                    key={tpl.id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: isJustApplied ? '1px solid #10b981' : isGym ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {/* Template Thumbnail or Header Banner */}
                    <div style={{
                      height: '70px',
                      background: isGym 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(239, 68, 68, 0.25) 100%), #111827'
                        : 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%), #111827',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {tpl.thumbnail ? (
                        <img 
                          src={tpl.thumbnail} 
                          alt={tpl.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isGym ? '#f59e0b' : 'var(--primary)' }}>
                          <LayoutTemplate size={20} />
                          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {tpl.category || 'Template'}
                          </span>
                        </div>
                      )}

                      {/* Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(4px)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: isGym ? '#fbbf24' : '#38bdf8'
                      }}>
                        {tpl.category?.toUpperCase() || 'STARTER'}
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '3px' }}>
                        {tpl.name}
                      </div>
                      <p style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        margin: '0 0 10px 0',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {tpl.description || 'Pre-designed high-converting sections ready to edit.'}
                      </p>

                      {/* Action buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6px' }}>
                        <button
                          onClick={() => handleApplyTemplate(tpl, 'replace')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '6px 8px',
                            background: isJustApplied ? '#10b981' : isGym ? '#f59e0b' : 'var(--primary)',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '700',
                            transition: 'all 150ms ease'
                          }}
                        >
                          {isJustApplied ? <Check size={12} /> : <Download size={12} />}
                          <span>{isJustApplied ? 'Applied!' : 'Apply (Replace)'}</span>
                        </button>

                        <button
                          onClick={() => handleApplyTemplate(tpl, 'append')}
                          title="Add these template sections to the bottom of your current canvas"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px',
                            padding: '6px 8px',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                        >
                          <Plus size={12} />
                          <span>Append</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
