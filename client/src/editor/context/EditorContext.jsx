import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { 
  createNewElement, 
  findElementById, 
  findParentById, 
  getBreadcrumbs,
  updateElementSettingsInTree, 
  addElementToTree, 
  addSiblingToTree,
  deleteElementFromTree, 
  duplicateElementInTree, 
  moveElementInTree,
  cloneElementTree,
  extractStyleSettings,
  applyStyleSettings
} from './treeUtils';

const EditorContext = createContext(null);

export function EditorProvider({ pageId, children }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('Saved');

  // Component Tree State
  const [tree, setTree] = useState({
    id: 'root',
    type: 'container',
    settings: {
      direction: 'column',
      minHeight: '100vh',
      background: '#070a0f',
      gap: '0px',
      padding: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    },
    children: []
  });

  // History for Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Editor View & Canvas Controls State
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [hoveredElementId, setHoveredElementId] = useState(null);
  const [multiSelectedIds, setMultiSelectedIds] = useState([]);
  const [responsiveMode, setResponsiveModeState] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [previewMode, setPreviewMode] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('widgets'); // 'widgets' | 'navigator' | 'templates'
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Responsive mode switcher helper (resets custom width)
  const setResponsiveMode = useCallback((mode) => {
    setResponsiveModeState(mode);
    setCustomCanvasWidth(null);
  }, []);

  const toggleLeftSidebar = useCallback(() => {
    setLeftSidebarOpen(prev => !prev);
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setRightSidebarOpen(prev => !prev);
  }, []);

  // Canvas Viewport Enhancements (Zoom, Pan, Rulers, Focus)
  const [zoom, setZoom] = useState(1); // 0.5 to 1.5 (1 = 100%)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false); // Fullscreen canvas-only mode
  const [showRulers, setShowRulers] = useState(false);
  const [customCanvasWidth, setCustomCanvasWidth] = useState(null);

  // Clipboards
  const [clipboard, setClipboard] = useState(null);
  const [styleClipboard, setStyleClipboard] = useState(null);

  // Locked & Hidden Elements
  const [lockedElementIds, setLockedElementIds] = useState(new Set());

  // Context Menu State
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    elementId: null
  });

  // Dragging State & Drop Indicators
  const [draggedWidgetType, setDraggedWidgetType] = useState(null);
  const [draggedElementId, setDraggedElementId] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null); // { targetId, position: 'before' | 'after' | 'inside' }

  // Fetch Page on Mount
  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        const data = await api.getPage(pageId);
        setPage(data);

        let initialTree = data.content;
        if (!initialTree || typeof initialTree !== 'object' || !initialTree.id) {
          initialTree = {
            id: 'root',
            type: 'container',
            settings: {
              direction: 'column',
              minHeight: '100vh',
              background: '#070a0f',
              gap: '0px',
              padding: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
              margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
            },
            children: []
          };
        } else if (initialTree.id === 'root') {
          // Clean up old default padding or legacy white background on root so canvas is seamless
          const currentBg = initialTree.settings?.background;
          const isWhiteBg = currentBg === '#ffffff' || currentBg === '#fff' || currentBg === 'white' || !currentBg;
          initialTree.settings = {
            ...initialTree.settings,
            background: isWhiteBg ? '#070a0f' : currentBg,
            gap: '0px',
            padding: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
          };
        }

        setTree(initialTree);
        setHistory([initialTree]);
        setHistoryIndex(0);
        setSelectedElementId('root');
      } catch (err) {
        console.error('Failed to load page into builder:', err);
      } finally {
        setLoading(false);
      }
    }

    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  // Update Tree helper that pushes to history
  const updateTree = useCallback((newTree) => {
    setTree(newTree);
    setSaveStatus('Unsaved changes');

    setHistory(prev => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, newTree];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Undo / Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setTree(history[nextIndex]);
      setSaveStatus('Unsaved changes');
    }
  }, [canUndo, historyIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setTree(history[nextIndex]);
      setSaveStatus('Unsaved changes');
    }
  }, [canRedo, historyIndex, history]);

  // Zoom helpers
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(1.5, Math.round((prev + 0.1) * 10) / 10));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const fitToScreen = useCallback(() => {
    setZoom(0.85);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Lock / Unlock element
  const toggleLock = useCallback((elementId) => {
    if (elementId === 'root') return;
    setLockedElementIds(prev => {
      const next = new Set(prev);
      if (next.has(elementId)) {
        next.delete(elementId);
      } else {
        next.add(elementId);
      }
      return next;
    });
  }, []);

  const isElementLocked = useCallback((elementId) => {
    return lockedElementIds.has(elementId);
  }, [lockedElementIds]);

  // Select Parent element
  const selectParent = useCallback(() => {
    if (!selectedElementId || selectedElementId === 'root') return;
    const parent = findParentById(tree, selectedElementId);
    if (parent) {
      setSelectedElementId(parent.id);
    }
  }, [selectedElementId, tree]);

  // Actions: Add / Sibling / Delete / Duplicate
  const addElement = useCallback((parentId, widgetType, targetIndex = -1) => {
    const newEl = createNewElement(widgetType);
    const newTree = addElementToTree(tree, parentId, newEl, targetIndex);
    updateTree(newTree);
    setSelectedElementId(newEl.id);
    return newEl;
  }, [tree, updateTree]);

  const addBefore = useCallback((targetId, widgetType) => {
    if (targetId === 'root') return;
    const newEl = createNewElement(widgetType);
    const newTree = addSiblingToTree(tree, targetId, newEl, 'before');
    updateTree(newTree);
    setSelectedElementId(newEl.id);
    return newEl;
  }, [tree, updateTree]);

  const addAfter = useCallback((targetId, widgetType) => {
    if (targetId === 'root') return;
    const newEl = createNewElement(widgetType);
    const newTree = addSiblingToTree(tree, targetId, newEl, 'after');
    updateTree(newTree);
    setSelectedElementId(newEl.id);
    return newEl;
  }, [tree, updateTree]);

  const updateElementSettings = useCallback((elementId, newSettings) => {
    if (lockedElementIds.has(elementId)) return;
    const newTree = updateElementSettingsInTree(tree, elementId, newSettings);
    updateTree(newTree);
  }, [tree, updateTree, lockedElementIds]);

  const deleteElement = useCallback((elementId) => {
    if (elementId === 'root') {
      alert('Cannot delete the root container.');
      return;
    }
    if (lockedElementIds.has(elementId)) {
      alert('This element is locked. Please unlock it before deleting.');
      return;
    }
    const parent = findParentById(tree, elementId);
    const newTree = deleteElementFromTree(tree, elementId);
    updateTree(newTree);
    setSelectedElementId(parent ? parent.id : 'root');
  }, [tree, updateTree, lockedElementIds]);

  const duplicateElement = useCallback((elementId) => {
    if (elementId === 'root') return;
    const newTree = duplicateElementInTree(tree, elementId);
    updateTree(newTree);
  }, [tree, updateTree]);

  const moveElement = useCallback((elementId, targetParentId, targetIndex = -1) => {
    if (elementId === 'root' || elementId === targetParentId) return;
    if (lockedElementIds.has(elementId)) return;
    const newTree = moveElementInTree(tree, elementId, targetParentId, targetIndex);
    updateTree(newTree);
  }, [tree, updateTree, lockedElementIds]);

  // Copy / Paste Element
  const copyElement = useCallback((elementId) => {
    const el = findElementById(tree, elementId);
    if (el) {
      setClipboard(cloneElementTree(el));
    }
  }, [tree]);

  const pasteElement = useCallback((targetId) => {
    if (!clipboard) return;
    const target = findElementById(tree, targetId) || tree;
    const isContainer = target.type === 'container' || target.id === 'root';
    const destinationId = isContainer ? target.id : (findParentById(tree, targetId)?.id || 'root');

    const freshClone = cloneElementTree(clipboard);
    const newTree = addElementToTree(tree, destinationId, freshClone);
    updateTree(newTree);
    setSelectedElementId(freshClone.id);
  }, [clipboard, tree, updateTree]);

  // Apply or Load Template onto Canvas
  const applyTemplate = useCallback((templateContent, mode = 'replace') => {
    if (!templateContent) return;
    const cloned = cloneElementTree(templateContent);
    if (mode === 'replace') {
      updateTree(cloned);
      setSelectedElementId(cloned.id || 'root');
    } else {
      // Append mode
      const currentChildren = Array.isArray(tree.children) ? [...tree.children] : [];
      const newChildren = Array.isArray(cloned.children) ? cloned.children : (cloned.type ? [cloned] : []);
      const newTree = {
        ...tree,
        children: [...currentChildren, ...newChildren]
      };
      updateTree(newTree);
    }
  }, [tree, updateTree]);

  // Copy / Paste Style Only
  const copyStyle = useCallback((elementId) => {
    const el = findElementById(tree, elementId);
    if (el && el.settings) {
      setStyleClipboard(extractStyleSettings(el.settings));
    }
  }, [tree]);

  const pasteStyle = useCallback((targetId) => {
    if (!styleClipboard) return;
    const el = findElementById(tree, targetId);
    if (el && el.settings) {
      const updatedSettings = applyStyleSettings(el.settings, styleClipboard);
      updateElementSettings(targetId, updatedSettings);
    }
  }, [styleClipboard, tree, updateElementSettings]);

  // Responsive Device Visibility Toggle
  const toggleHideOnDevice = useCallback((elementId, device) => {
    const el = findElementById(tree, elementId);
    if (!el) return;
    const hidden = el.settings?.hidden || {};
    const updatedHidden = {
      ...hidden,
      [device]: !hidden[device]
    };
    updateElementSettings(elementId, {
      ...el.settings,
      hidden: updatedHidden
    });
  }, [tree, updateElementSettings]);

  // Context Menu Helpers
  const openContextMenu = useCallback((e, elementId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElementId(elementId);
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      elementId
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Save Page to backend
  const savePage = async () => {
    if (!pageId) return;
    try {
      setSaving(true);
      setSaveStatus('Saving...');
      await api.savePage(pageId, {
        content: tree,
        styles_css: ''
      });
      setSaveStatus('All changes saved');
      setLastSaved(new Date());
    } catch (err) {
      setSaveStatus('Save failed');
      alert('Failed to save page: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if typing inside an active contenteditable or input
      const targetTag = e.target.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || e.target.isContentEditable;

      // Close context menu on any key
      if (contextMenu.isOpen) {
        closeContextMenu();
      }

      if (isInput) return;

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (isCtrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (isCtrl && e.key === 's') {
        e.preventDefault();
        savePage();
      } else if (isCtrl && e.key === 'c' && selectedElementId) {
        e.preventDefault();
        copyElement(selectedElementId);
      } else if (isCtrl && e.key === 'v' && selectedElementId) {
        e.preventDefault();
        pasteElement(selectedElementId);
      } else if (isCtrl && e.key === 'd' && selectedElementId) {
        e.preventDefault();
        duplicateElement(selectedElementId);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId && selectedElementId !== 'root') {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        selectParent();
      } else if (isCtrl && e.key === '\\') {
        e.preventDefault();
        setFocusMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo, 
    redo, 
    selectedElementId, 
    copyElement, 
    pasteElement, 
    duplicateElement, 
    deleteElement, 
    selectParent, 
    contextMenu.isOpen, 
    closeContextMenu
  ]);

  const selectedElement = useMemo(() => findElementById(tree, selectedElementId), [tree, selectedElementId]);
  const breadcrumbs = useMemo(() => getBreadcrumbs(tree, selectedElementId), [tree, selectedElementId]);

  return (
    <EditorContext.Provider
      value={{
        page,
        loading,
        saving,
        saveStatus,
        lastSaved,
        tree,
        selectedElementId,
        selectedElement,
        hoveredElementId,
        multiSelectedIds,
        breadcrumbs,
        responsiveMode,
        previewMode,
        activeLeftTab,
        leftSidebarOpen,
        rightSidebarOpen,
        toggleLeftSidebar,
        toggleRightSidebar,
        setLeftSidebarOpen,
        setRightSidebarOpen,
        clipboard,
        styleClipboard,
        draggedWidgetType,
        draggedElementId,
        dropIndicator,
        canUndo,
        canRedo,
        // Viewport & Tools
        zoom,
        panOffset,
        isPanMode,
        focusMode,
        showRulers,
        customCanvasWidth,
        lockedElementIds,
        contextMenu,
        // Actions
        setSelectedElementId,
        setHoveredElementId,
        setMultiSelectedIds,
        setResponsiveMode,
        setPreviewMode,
        setActiveLeftTab,
        setZoom,
        zoomIn,
        zoomOut,
        resetZoom,
        fitToScreen,
        setPanOffset,
        setIsPanMode,
        setFocusMode,
        setShowRulers,
        setCustomCanvasWidth,
        setDraggedWidgetType,
        setDraggedElementId,
        setDropIndicator,
        toggleLock,
        isElementLocked,
        toggleHideOnDevice,
        selectParent,
        openContextMenu,
        closeContextMenu,
        addElement,
        addBefore,
        addAfter,
        updateElementSettings,
        deleteElement,
        duplicateElement,
        moveElement,
        copyElement,
        pasteElement,
        copyStyle,
        pasteStyle,
        applyTemplate,
        undo,
        redo,
        savePage,
        setTree: updateTree
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
