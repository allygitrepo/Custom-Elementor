/**
 * LightBuilder - Immutable Component Tree Utilities
 */

import { WIDGET_REGISTRY } from '../widgetRegistry';

export function createNewElement(widgetType) {
  const def = WIDGET_REGISTRY[widgetType] || { defaultSettings: {} };
  return {
    id: `el_${widgetType}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: widgetType,
    settings: JSON.parse(JSON.stringify(def.defaultSettings || {})),
    children: []
  };
}

export function findElementById(tree, id) {
  if (!tree) return null;
  if (tree.id === id) return tree;
  if (Array.isArray(tree.children)) {
    for (const child of tree.children) {
      const found = findElementById(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParentById(tree, childId) {
  if (!tree || !Array.isArray(tree.children)) return null;
  for (const child of tree.children) {
    if (child.id === childId) return tree;
    const foundParent = findParentById(child, childId);
    if (foundParent) return foundParent;
  }
  return null;
}

export function getBreadcrumbs(tree, elementId) {
  const path = [];
  function traverse(node, targetId, currentPath) {
    if (!node) return false;
    const newPath = [...currentPath, { 
      id: node.id, 
      type: node.type, 
      name: WIDGET_REGISTRY[node.type]?.name || (node.id === 'root' ? 'Page Root' : node.type) 
    }];
    if (node.id === targetId) {
      path.push(...newPath);
      return true;
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        if (traverse(child, targetId, newPath)) return true;
      }
    }
    return false;
  }
  traverse(tree, elementId, []);
  return path;
}

export function updateElementSettingsInTree(tree, elementId, newSettings) {
  if (tree.id === elementId) {
    return {
      ...tree,
      settings: newSettings
    };
  }

  if (Array.isArray(tree.children)) {
    return {
      ...tree,
      children: tree.children.map(child => updateElementSettingsInTree(child, elementId, newSettings))
    };
  }

  return tree;
}

export function addElementToTree(tree, parentId, newElement, targetIndex = -1) {
  if (tree.id === parentId) {
    const newChildren = [...(tree.children || [])];
    if (targetIndex >= 0 && targetIndex <= newChildren.length) {
      newChildren.splice(targetIndex, 0, newElement);
    } else {
      newChildren.push(newElement);
    }
    return {
      ...tree,
      children: newChildren
    };
  }

  if (Array.isArray(tree.children)) {
    return {
      ...tree,
      children: tree.children.map(child => addElementToTree(child, parentId, newElement, targetIndex))
    };
  }

  return tree;
}

export function addSiblingToTree(tree, targetId, newElement, position = 'after') {
  const parent = findParentById(tree, targetId);
  if (!parent) return tree;

  const targetIndex = parent.children.findIndex(c => c.id === targetId);
  if (targetIndex === -1) return tree;

  const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
  return addElementToTree(tree, parent.id, newElement, insertIndex);
}

export function deleteElementFromTree(tree, elementId) {
  if (tree.id === elementId) {
    return null; // Root cannot be deleted via this, handled separately
  }

  if (Array.isArray(tree.children)) {
    return {
      ...tree,
      children: tree.children
        .filter(child => child.id !== elementId)
        .map(child => deleteElementFromTree(child, elementId))
    };
  }

  return tree;
}

export function cloneElementTree(element) {
  const cloned = JSON.parse(JSON.stringify(element));
  
  function regenerateIds(node) {
    node.id = `el_${node.type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    if (Array.isArray(node.children)) {
      node.children.forEach(regenerateIds);
    }
  }

  regenerateIds(cloned);
  return cloned;
}

export function duplicateElementInTree(tree, elementId) {
  const parent = findParentById(tree, elementId);
  if (!parent) return tree;

  const target = findElementById(tree, elementId);
  if (!target) return tree;

  const duplicated = cloneElementTree(target);
  const targetIndex = parent.children.findIndex(c => c.id === elementId);

  return addElementToTree(tree, parent.id, duplicated, targetIndex + 1);
}

export function moveElementInTree(tree, elementId, targetParentId, targetIndex = -1) {
  const target = findElementById(tree, elementId);
  if (!target) return tree;

  // Prevent moving into itself or descendant
  if (elementId === targetParentId || isDescendant(target, targetParentId)) {
    return tree;
  }

  // 1. Remove from old position
  const treeWithoutElement = deleteElementFromTree(tree, elementId);

  // 2. Add to target position
  return addElementToTree(treeWithoutElement, targetParentId, target, targetIndex);
}

export function isDescendant(parentSubtree, searchId) {
  if (!parentSubtree || !Array.isArray(parentSubtree.children)) return false;
  for (const child of parentSubtree.children) {
    if (child.id === searchId || isDescendant(child, searchId)) {
      return true;
    }
  }
  return false;
}

const STYLE_KEYS = [
  'background', 'color', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
  'textAlign', 'textTransform', 'padding', 'margin', 'borderRadius', 'borderWidth',
  'borderColor', 'borderStyle', 'boxShadow', 'gap', 'opacity'
];

export function extractStyleSettings(settings = {}) {
  const styles = {};
  for (const key of STYLE_KEYS) {
    if (settings[key] !== undefined) {
      styles[key] = JSON.parse(JSON.stringify(settings[key]));
    }
  }
  return styles;
}

export function applyStyleSettings(currentSettings = {}, sourceStyles = {}) {
  return {
    ...currentSettings,
    ...JSON.parse(JSON.stringify(sourceStyles))
  };
}
