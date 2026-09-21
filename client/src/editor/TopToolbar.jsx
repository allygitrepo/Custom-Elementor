import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEditor } from './context/EditorContext';
import { api } from '../services/api';
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Save, 
  Send, 
  Loader2, 
  Check, 
  Globe, 
  ExternalLink,
  X
} from 'lucide-react';

export default function TopToolbar() {
  const { 
    page, 
    responsiveMode, 
    setResponsiveMode, 
    previewMode, 
    setPreviewMode, 
    canUndo, 
    canRedo, 
    undo, 
    redo, 
    savePage, 
    saving, 
    saveStatus 
  } = useEditor();

  const [publishing, setPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState(null);

  const devices = [
    { key: 'desktop', icon: Monitor, label: 'Desktop (1200px)' },
    { key: 'tablet', icon: Tablet, label: 'Tablet (768px)' },
    { key: 'mobile', icon: Smartphone, label: 'Mobile (375px)' }
  ];

  const handlePublish = async () => {
    if (!page?.id) return;
    try {
      setPublishing(true);
      // Save first
      await savePage();
      const res = await api.publishPage(page.id);
      setPublishedData(res);
    } catch (err) {
      alert('Failed to publish: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <div style={{
        height: '56px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 60,
        userSelect: 'none'
      }}>
        {/* Left Area: Back & Page Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to={page?.website_id ? `/websites/${page.website_id}/pages` : '/'}
            title="Back to Pages"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} />
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                {page?.title || 'Page Editor'}
              </span>
              {page?.slug && (
                <span className="badge badge-info" style={{ fontSize: '10px', padding: '1px 6px', fontFamily: 'var(--font-mono)' }}>
                  /{page.slug}
                </span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{page?.website_name || 'Website'}</span>
              <span>•</span>
              <span style={{ color: saveStatus === 'All changes saved' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {saveStatus}
              </span>
            </div>
          </div>

          {/* Undo / Redo */}
          <div style={{ display: 'flex', gap: '4px', marginLeft: '12px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                border: 'none',
                color: canUndo ? 'var(--text-main)' : 'var(--text-dim)',
                cursor: canUndo ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Undo2 size={16} />
            </button>

            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                border: 'none',
                color: canRedo ? 'var(--text-main)' : 'var(--text-dim)',
                cursor: canRedo ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Redo2 size={16} />
            </button>
          </div>
        </div>

        {/* Center Area: Responsive Breakpoint Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-main)',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {devices.map((d) => {
            const Icon = d.icon;
            const isActive = responsiveMode === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setResponsiveMode(d.key)}
                title={d.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#0f172a' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={15} />
                <span style={{ textTransform: 'capitalize' }}>{d.key}</span>
              </button>
            );
          })}
        </div>

        {/* Right Area: Preview, Save & Publish */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="btn btn-secondary"
            style={{ padding: '7px 12px', fontSize: '13px' }}
          >
            {previewMode ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>

          <button
            onClick={savePage}
            disabled={saving}
            className="btn btn-secondary"
            style={{ padding: '7px 14px', fontSize: '13px' }}
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save</span>
              </>
            )}
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="btn btn-primary"
            style={{ padding: '7px 16px', fontSize: '13px', background: 'linear-gradient(135deg, #0284c7, #38bdf8)' }}
          >
            {publishing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Compiling...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Publish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Publish Success Modal */}
      {publishedData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 300
        }}>
          <div className="glass-card" style={{ maxWidth: '540px', width: '100%', padding: '32px', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Check size={28} strokeWidth={2.5} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
              Website Published Live!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              All <strong>{publishedData.pages_count || (publishedData.pages?.length) || 1}</strong> pages have been compiled with synchronized multi-page navigation.
            </p>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Main Website URL</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: '600' }}>Active Live</span>
              </label>
              <input
                type="text"
                readOnly
                value={publishedData.published_url}
                className="form-input"
                style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                onClick={(e) => e.target.select()}
              />
            </div>

            {/* List of Detected Pages */}
            {publishedData.pages && publishedData.pages.length > 0 && (
              <div style={{
                textAlign: 'left',
                marginBottom: '20px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Detected Site Pages ({publishedData.pages.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {publishedData.pages.map((p) => {
                    const protocol = window.location.protocol;
                    const host = window.location.port === '5173' ? '127.0.0.1:8000' : window.location.host;
                    const pUrl = `${protocol}//${host}/published/${publishedData.website_slug}/${p.filename}`;
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.title}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>/{p.filename}</span>
                        </div>
                        <a
                          href={pUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}
                        >
                          <span>Open</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={publishedData.current_page_url || publishedData.published_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                <ExternalLink size={16} />
                <span>Open Live Page</span>
              </a>

              <button
                onClick={() => setPublishedData(null)}
                className="btn btn-secondary"
                style={{ padding: '10px 16px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
