import React from 'react';
import { useParams } from 'react-router-dom';
import { EditorProvider, useEditor } from './context/EditorContext';
import TopToolbar from './TopToolbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import Canvas from './canvas/Canvas';
import { Loader2 } from 'lucide-react';

function BuilderContent() {
  const { loading, previewMode, focusMode } = useEditor();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--primary)',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <Loader2 size={40} className="animate-spin" />
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading visual builder...</span>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-main)',
      overflow: 'hidden'
    }}>
      {/* Top Toolbar */}
      <TopToolbar />

      {/* Main Studio Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Sidebar (Widgets & Navigator) */}
        {!previewMode && !focusMode && <LeftSidebar />}

        {/* Visual Canvas Viewport */}
        <Canvas />

        {/* Right Sidebar (Settings & Controls) */}
        {!previewMode && !focusMode && <RightSidebar />}
      </div>
    </div>
  );
}

export default function Builder() {
  const { pageId } = useParams();

  return (
    <EditorProvider pageId={pageId}>
      <BuilderContent />
    </EditorProvider>
  );
}
