import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Plus, 
  Search, 
  Globe, 
  FileText, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Edit3, 
  Layers, 
  MoreVertical,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle
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
      const created = await api.createWebsite(newSite);
      setIsCreateOpen(false);
      setNewSite({ name: '', slug: '', domain: '' });
      await fetchWebsites();
      // Navigate to website pages
      if (created?.id) {
        navigate(`/websites/${created.id}/pages`);
      }
    } catch (err) {
      setModalError(err.message || 'Failed to create website.');
    } finally {
      setCreating(false);
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
    if (window.confirm(`Are you sure you want to delete "${name}" and all of its pages? This action cannot be undone.`)) {
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

  const totalPages = websites.reduce((acc, curr) => acc + (parseInt(curr.pages_count, 10) || 0), 0);

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
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600' }}>Websites</div>
            <div style={{ fontSize: '26px', fontWeight: '800' }}>{websites.length}</div>
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
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600' }}>Total Pages</div>
            <div style={{ fontSize: '26px', fontWeight: '800' }}>{totalPages}</div>
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
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600' }}>System Status</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-emerald)', marginTop: '4px' }}>
              ● Ready & Operational
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
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Websites & Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            Manage your websites, create new projects, and open the visual builder.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>New Website</span>
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
          {['all', 'active', 'draft'].map(status => (
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
            {searchQuery ? 'No websites matched your search query.' : 'Create your first website project to get started with the visual builder.'}
          </p>
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Create Website</span>
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
                position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
            >
              <div>
                {/* Card Top */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
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

                  <span className={`badge ${site.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {site.status}
                  </span>
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
                    <FileText size={15} color="var(--text-dim)" />
                    <span>{site.pages_count || 1} {parseInt(site.pages_count, 10) === 1 ? 'Page' : 'Pages'}</span>
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
                <Link
                  to={`/websites/${site.id}/pages`}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '8px 14px', fontSize: '13px' }}
                >
                  <Layers size={15} />
                  <span>Manage Pages</span>
                </Link>

                {site.status === 'published' && (
                  <a
                    href={`/published/${site.slug}/index.html`}
                    target="_blank"
                    rel="noreferrer"
                    title="View Live Published Site"
                    className="btn btn-secondary"
                    style={{ padding: '8px 10px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={15} />
                  </a>
                )}

                <button
                  onClick={(e) => handleDuplicate(site.id, e)}
                  title="Duplicate Website"
                  className="btn btn-secondary"
                  style={{ padding: '8px 10px' }}
                >
                  <Copy size={15} />
                </button>

                <button
                  onClick={(e) => handleDelete(site.id, site.name, e)}
                  title="Delete Website"
                  className="btn btn-danger"
                  style={{ padding: '8px 10px' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Website Modal */}
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
              Create New Website
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Set up a new website workspace. You will be able to design pages visually.
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
                  placeholder="e.g. Acme Corp Agency"
                  value={newSite.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="acme-corp-agency"
                  value={newSite.slug}
                  onChange={(e) => setNewSite({ ...newSite, slug: e.target.value })}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Used for publishing path: /published/{newSite.slug || 'slug'}
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
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Create Website</span>
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
