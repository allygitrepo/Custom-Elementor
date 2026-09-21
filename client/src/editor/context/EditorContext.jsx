import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { 
  createNewElement, 
  findElementById, 
  findParentById, 
  updateElementSettingsInTree, 
  addElementToTree, 
  deleteElementFromTree, 
  duplicateElementInTree, 
  moveElementInTree 
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
      background: '#0b0f17',
      padding: { top: '40px', right: '24px', bottom: '40px', left: '24px' }
    },
    children: []
  });

  // History for Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Editor View States
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [hoveredElementId, setHoveredElementId] = useState(null);
  const [responsiveMode, setResponsiveMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [previewMode, setPreviewMode] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('widgets'); // 'widgets' | 'navigator' | 'templates'
  const [clipboard, setClipboard] = useState(null);

  // Dragging state
  const [draggedWidgetType, setDraggedWidgetType] = useState(null);
  const [draggedElementId, setDraggedElementId] = useState(null);

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
              background: '#0b0f17',
              padding: { top: '40px', right: '24px', bottom: '40px', left: '24px' }
            },
            children: []
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

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        savePage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Actions
  const addElement = useCallback((parentId, widgetType, targetIndex = -1) => {
    const newEl = createNewElement(widgetType);
    const newTree = addElementToTree(tree, parentId, newEl, targetIndex);
    updateTree(newTree);
    setSelectedElementId(newEl.id);
    return newEl;
  }, [tree, updateTree]);

  const updateElementSettings = useCallback((elementId, newSettings) => {
    const newTree = updateElementSettingsInTree(tree, elementId, newSettings);
    updateTree(newTree);
  }, [tree, updateTree]);

  const deleteElement = useCallback((elementId) => {
    if (elementId === 'root') {
      alert('Cannot delete the root container.');
      return;
    }
    const parent = findParentById(tree, elementId);
    const newTree = deleteElementFromTree(tree, elementId);
    updateTree(newTree);
    setSelectedElementId(parent ? parent.id : 'root');
  }, [tree, updateTree]);

  const duplicateElement = useCallback((elementId) => {
    if (elementId === 'root') return;
    const newTree = duplicateElementInTree(tree, elementId);
    updateTree(newTree);
  }, [tree, updateTree]);

  const moveElement = useCallback((elementId, targetParentId, targetIndex = -1) => {
    if (elementId === 'root' || elementId === targetParentId) return;
    const newTree = moveElementInTree(tree, elementId, targetParentId, targetIndex);
    updateTree(newTree);
  }, [tree, updateTree]);

  const copyElement = useCallback((elementId) => {
    const el = findElementById(tree, elementId);
    if (el) {
      setClipboard(el);
    }
  }, [tree]);

  const pasteElement = useCallback((targetParentId) => {
    if (!clipboard) return;
    const parent = findElementById(tree, targetParentId) || tree;
    const isContainer = parent.type === 'container' || parent.id === 'root';
    const destinationId = isContainer ? parent.id : (findParentById(tree, targetParentId)?.id || 'root');

    const duplicated = duplicateElementInTree(
      addElementToTree(tree, destinationId, clipboard),
      clipboard.id
    );
    updateTree(duplicated);
  }, [clipboard, tree, updateTree]);

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

  const selectedElement = findElementById(tree, selectedElementId);

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
        responsiveMode,
        previewMode,
        activeLeftTab,
        clipboard,
        draggedWidgetType,
        draggedElementId,
        canUndo,
        canRedo,
        // Actions
        setSelectedElementId,
        setHoveredElementId,
        setResponsiveMode,
        setPreviewMode,
        setActiveLeftTab,
        setDraggedWidgetType,
        setDraggedElementId,
        addElement,
        updateElementSettings,
        deleteElement,
        duplicateElement,
        moveElement,
        copyElement,
        pasteElement,
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
