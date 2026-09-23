import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getPublishedUrl } from '../utils/media';
import { 
  Plus, 
  Search, 
  Globe, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Edit3, 
  Layers, 
  Calendar, 
  Sparkles, 
  Loader2, 
  CheckCircle,
  Zap,
  Layout
} from 'lucide-react';

export default function WebsitesPage() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSite, setNewSite] = useState({
    name: '',
    slug: '',
    domain: ''
  });
  const [modalError, setModalError] = useState('');

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const data = await api.getWebsites();
      setWebsites(data || []);
    } catch (err) {
      console.error('Failed to load websites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleNameChange = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setNewSite(prev => ({ ...prev, name, slug }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!newSite.name) {
      setModalError('Please enter a website name.');
      return;
    }

    try {
      setCreating(true);
      const res = await api.createWebsite(newSite);
      setIsCreateOpen(false);
      setNewSite({ name: '', slug: '', domain: '' });
      
      const targetPageId = res?.primary_page_id || res?.page_id;
      if (targetPageId) {
        navigate(`/builder/${targetPageId}`);
      } else if (res?.id) {
        // Fetch website details to get its primary page
        const details = await api.getWebsite(res.id);
        const pageId = details?.pages?.[0]?.id;
        if (pageId) {
          navigate(`/builder/${pageId}`);
        } else {
          await fetchWebsites();
        }
      } else {
        await fetchWebsites();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to create website.');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenBuilder = async (site, e) => {
    e?.stopPropagation();
    if (site.primary_page_id) {
      navigate(`/builder/${site.primary_page_id}`);
    } else {
      try {
        const details = await api.getWebsite(site.id);
        const pageId = details?.pages?.[0]?.id;
        if (pageId) {
          navigate(`/builder/${pageId}`);
        } else {
          alert('No page found for this website.');
        }
      } catch (err) {
        alert('Failed to open builder: ' + err.message);
      }
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      await api.duplicateWebsite(id);
      await fetchWebsites();
    } catch (err) {
      alert('Failed to duplicate: ' + err.message);
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await api.deleteWebsite(id);
        await fetchWebsites();
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const filteredWebsites = websites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          site.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || site.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const publishedCount = websites.filter(s => s.status === 'published' || s.status === 'active').length;

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Banner / Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Globe size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600' }}>Single Page Websites</div>
            <div style={{ fontSize: '26px', fontWeight: '800' }}>{websites.length}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald)'
          }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600' }}>Published & Active</div>
            <div style={{ fontSize: '26px', fontWeight: '800' }}>{publishedCount}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(168, 85, 247, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-purple)'
          }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600' }}>Builder Mode</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-purple)', marginTop: '4px' }}>
              ⚡ Single Page Engine
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>My Single Page Websites</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            Build and publish high-converting single page websites and landing pages.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>New Single Page Site</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search websites by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} color="var(--text-dim)" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'active', 'published', 'draft'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'capitalize',
                background: filterStatus === status ? 'var(--bg-surface-elevated)' : 'transparent',
                color: filterStatus === status ? 'var(--primary)' : 'var(--text-muted)',
                border: filterStatus === status ? '1px solid var(--border-glass)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Website Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--primary)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading your websites...</p>
        </div>
      ) : filteredWebsites.length === 0 ? (
        <div className="glass-card" style={{
          textAlign: 'center',
          padding: '60px 24px',
          border: '1px dashed var(--border-subtle)'
        }}>
          <Globe size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Websites Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>
            {searchQuery ? 'No websites matched your search query.' : 'Create your first single page website to get started with the visual builder.'}
          </p>
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Create Single Page Site</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {filteredWebsites.map(site => (
            <div
              key={site.id}
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform var(--transition-smooth), border-color var(--transition-smooth)',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => handleOpenBuilder(site)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-glass)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div>
                {/* Card Top */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <Globe size={20} />
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="badge badge-info" style={{ fontSize: '11px' }}>
                      One-Page
                    </span>
                    <span className={`badge ${site.status === 'published' || site.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {site.status}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
                  {site.name}
                </h3>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--primary)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  /{site.slug}
                </div>

                {/* Metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layout size={15} color="var(--text-dim)" />
                    <span>Single Page Site</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} color="var(--text-dim)" />
                    <span>{site.updated_at ? new Date(site.updated_at).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                gap: '8px'
              }}>
                <button
                  onClick={(e) => handleOpenBuilder(site, e)}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '9px 14px', fontSize: '13px' }}
                >
                  <Edit3 size={15} />
                  <span>Open Visual Builder</span>
                </button>

                {(site.status === 'published' || site.status === 'active') && (
                  <a
                    href={getPublishedUrl(site.slug, 'index.html')}
                    target="_blank"
                    rel="noreferrer"
                    title="View Live Published Site"
                    className="btn btn-secondary"
                    style={{ padding: '9px 12px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={15} />
                  </a>
                )}

                <button
                  onClick={(e) => handleDuplicate(site.id, e)}
                  title="Duplicate Website"
                  className="btn btn-secondary"
                  style={{ padding: '9px 12px' }}
                >
                  <Copy size={15} />
                </button>

                <button
                  onClick={(e) => handleDelete(site.id, site.name, e)}
                  title="Delete Website"
                  className="btn btn-danger"
                  style={{ padding: '9px 12px' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Single Page Website Modal */}
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
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
              Create Single Page Website
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Set up a fast, modern single page website or landing page. Automatically launches directly into the visual builder.
            </p>

            {modalError && (
              <div className="alert alert-error">
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Website Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acme Agency Landing"
                  value={newSite.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="acme-agency-landing"
                  value={newSite.slug}
                  onChange={(e) => setNewSite({ ...newSite, slug: e.target.value })}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Live URL path: /published/{newSite.slug || 'slug'}/index.html
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Custom Domain (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="example.com"
                  value={newSite.domain}
                  onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
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
                      <span>Creating & Launching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Create & Open Builder</span>
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
