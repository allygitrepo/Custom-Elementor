import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ArrowLeft, 
  Plus, 
  Layers, 
  Edit3, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Eye, 
  Globe, 
  Calendar, 
  Loader2,
  FileCode,
  CheckCircle,
  Send,
  Check
} from 'lucide-react';

export default function PagesPage() {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const [website, setWebsite] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState(null);

  // Create Page Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '' });
  const [modalError, setModalError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const siteData = await api.getWebsite(websiteId);
      setWebsite(siteData);
      setPages(siteData.pages || []);
    } catch (err) {
      console.error('Failed to load website pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [websiteId]);

  const handleTitleChange = (title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setNewPage(prev => ({ ...prev, title, slug }));
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!newPage.title) {
      setModalError('Please enter a page title.');
      return;
    }

    try {
      setCreating(true);
      const created = await api.createPage(websiteId, newPage);
      setIsCreateOpen(false);
      setNewPage({ title: '', slug: '' });
      await fetchData();
      if (created?.id) {
        navigate(`/builder/${created.id}`);
      }
    } catch (err) {
      setModalError(err.message || 'Failed to create page.');
    } finally {
      setCreating(false);
    }
  };

  const handlePublishWebsite = async () => {
    try {
      setPublishing(true);
      const res = await api.publishWebsite(websiteId);
      setPublishedData(res);
      await fetchData();
    } catch (err) {
      alert('Failed to publish website: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleDuplicatePage = async (pageId) => {
    try {
      await api.duplicatePage(pageId);
      await fetchData();
    } catch (err) {
      alert('Failed to duplicate page: ' + err.message);
    }
  };

  const handleDeletePage = async (pageId, title) => {
    if (pages.length <= 1) {
      alert('Cannot delete the only page in the website. Create another page first.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.deletePage(pageId);
        await fetchData();
      } catch (err) {
        alert('Failed to delete page: ' + err.message);
      }
    }
  };

  const getPagePublishedUrl = (pageSlug) => {
    if (!website?.slug) return '#';
    const filename = (pageSlug === 'home' || pageSlug === 'index') ? 'index.html' : `${pageSlug}.html`;
    const protocol = window.location.protocol;
    const host = window.location.port === '5173' ? '127.0.0.1:8000' : window.location.host;
    return `${protocol}//${host}/published/${website.slug}/${filename}`;
  };

  const getSitePublishedUrl = () => {
    if (!website?.slug) return '#';
    const protocol = window.location.protocol;
    const host = window.location.port === '5173' ? '127.0.0.1:8000' : window.location.host;
    return `${protocol}//${host}/published/${website.slug}/index.html`;
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumbs & Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '16px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Websites</span>
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '800' }}>
                {website ? website.name : 'Website Pages'}
              </h1>
              {website && (
                <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)' }}>
                  /{website.slug}
                </span>
              )}
              {website?.status === 'published' && (
                <span className="badge badge-success">Published</span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              Manage and synchronize all pages for this website with multi-page navigation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {website?.status === 'published' && (
              <a
                href={getSitePublishedUrl()}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ padding: '8px 14px' }}
              >
                <Globe size={16} />
                <span>View Live Site</span>
              </a>
            )}

            <button
              onClick={handlePublishWebsite}
              disabled={publishing || pages.length === 0}
              className="btn btn-secondary"
              style={{
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(56, 189, 248, 0.2))',
                borderColor: 'var(--primary)',
                color: '#38bdf8'
              }}
            >
              {publishing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Publishing All...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Publish Entire Site</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>Add New Page</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pages List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--primary)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading website pages...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Layers size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Pages Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            Create your first page to start designing.
          </p>
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add First Page</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pages.map((page) => {
            const pageLiveUrl = getPagePublishedUrl(page.slug);
            return (
              <div
                key={page.id}
                className="glass-card"
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                {/* Page Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <FileCode size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{page.title}</h3>
                      <span className={`badge ${page.status === 'published' ? 'badge-success' : 'badge-info'}`}>
                        {page.status}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-dim)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: '2px'
                    }}>
                      /{page.slug === 'home' || page.slug === 'index' ? 'index.html' : `${page.slug}.html`}
                    </div>
                  </div>
                </div>

                {/* Date & Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: 'var(--text-dim)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    <span>Updated: {page.updated_at ? new Date(page.updated_at).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a
                    href={pageLiveUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="View Page Preview / Live"
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  >
                    <Eye size={15} />
                    <span>View Live</span>
                  </a>

                  <Link
                    to={`/builder/${page.id}`}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <Edit3 size={15} />
                    <span>Open Builder</span>
                  </Link>

                  <button
                    onClick={() => handleDuplicatePage(page.id)}
                    title="Duplicate Page"
                    className="btn btn-secondary"
                    style={{ padding: '8px 10px' }}
                  >
                    <Copy size={15} />
                  </button>

                  <button
                    onClick={() => handleDeletePage(page.id, page.title)}
                    title="Delete Page"
                    className="btn btn-danger"
                    style={{ padding: '8px 10px' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Published Site Success Modal */}
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
              All Pages Published Successfully!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Compiled <strong>{publishedData.pages_count || publishedData.pages?.length || pages.length}</strong> pages with synchronized multi-page navigation.
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
                href={publishedData.published_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                <ExternalLink size={16} />
                <span>Open Live Website</span>
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

      {/* Create Page Modal */}
      {isCreateOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
              Add New Page
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Add a new page to <strong>{website?.name}</strong>.
            </p>

            {modalError && (
              <div className="alert alert-error">
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePage}>
              <div className="form-group">
                <label className="form-label">Page Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. About Us"
                  value={newPage.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Page Slug</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="about-us"
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn btn-secondary"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Create Page</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

