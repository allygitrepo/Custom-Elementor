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

  // 1. Remove from old position
  const treeWithoutElement = deleteElementFromTree(tree, elementId);

  // 2. Add to target position
  return addElementToTree(treeWithoutElement, targetParentId, target, targetIndex);
}
