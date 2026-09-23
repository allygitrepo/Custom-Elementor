import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import TemplateLivePreview from '../components/TemplateLivePreview';
import { 
  LayoutTemplate, 
  Sparkles, 
  Plus, 
  Loader2, 
  ArrowRight, 
  Layers, 
  Dumbbell, 
  Factory, 
  Cloud, 
  Briefcase, 
  Search,
  CheckCircle2,
  ExternalLink,
  Eye,
  X,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Fitness & Gym': Dumbbell,
  'Industrial & Engineering': Factory,
  'SaaS & Software': Cloud,
  'Business': Briefcase,
  'default': Sparkles
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use Template Modal state
  const [useModalOpen, setUseModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [siteName, setSiteName] = useState('');
  const [creatingSite, setCreatingSite] = useState(false);
  const [createError, setCreateError] = useState('');

  // Preview Modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.getTemplates();
      setTemplates(data || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const categories = ['all', ...new Set(templates.map(t => t.category).filter(Boolean))];

  const filteredTemplates = templates.filter(tmpl => {
    const matchesCat = selectedCategory === 'all' || tmpl.category === selectedCategory;
    const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (tmpl.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenUseModal = (tmpl, e) => {
    e.stopPropagation();
    setSelectedTemplate(tmpl);
    setSiteName(`My ${tmpl.name}`);
    setCreateError('');
    setUseModalOpen(true);
  };

  const handleCreateWebsiteWithTemplate = async (e) => {
    e.preventDefault();
    if (!siteName.trim() || !selectedTemplate) return;

    try {
      setCreatingSite(true);
      setCreateError('');
      
      const res = await api.createWebsite({
        name: siteName.trim(),
        template_id: selectedTemplate.id
      });

      const pageId = res.primary_page_id || res.page_id;
      if (pageId) {
        navigate(`/editor/${pageId}`);
      } else {
        navigate('/websites');
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create website with template');
    } finally {
      setCreatingSite(false);
    }
  };

  const handleOpenPreview = async (tmpl, e) => {
    e.stopPropagation();
    setPreviewTemplate(tmpl);
    setPreviewModalOpen(true);
    setLoadingPreview(true);
    try {
      const fullTmpl = await api.getTemplate(tmpl.id);
      setPreviewContent(fullTmpl.content || fullTmpl.content_json);
    } catch (err) {
      console.error('Failed to load preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div style={{ padding: '36px 32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--primary)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '1px'
            }}>
              PRE-BUILT LAYOUTS
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>
            Template Library
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', maxWidth: '640px' }}>
            Launch high-converting landing pages in seconds. Choose from specialized Gym, Industrial, SaaS, and Business layouts built with responsive enterprise widgets.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Category Pills Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
              background: selectedCategory === cat ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface-elevated)',
              color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 150ms ease'
            }}
          >
            {cat === 'all' ? 'All Templates' : cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--primary)' }}>
          <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading template library...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <LayoutTemplate size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Templates Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            No templates match your search query or selected category.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '28px'
        }}>
          {filteredTemplates.map(tmpl => {
            const IconComp = CATEGORY_ICONS[tmpl.category] || CATEGORY_ICONS.default;
            return (
              <div
                key={tmpl.id}
                className="glass-card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-surface)',
                  transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-glass)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Thumbnail / Header Gradient */}
                <div style={{
                  height: '190px',
                  position: 'relative',
                  backgroundImage: tmpl.thumbnail ? `url(${tmpl.thumbnail})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#0a192f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {/* Overlay gradient */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(7, 10, 15, 0.4) 0%, rgba(7, 10, 15, 0.9) 100%)'
                  }} />

                  <div style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'rgba(56, 189, 248, 0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComp size={26} />
                    </div>
                  </div>

                  <span style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    zIndex: 3,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--primary)',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    letterSpacing: '0.5px'
                  }}>
                    {tmpl.category}
                  </span>
                </div>

                {/* Body Details */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                      {tmpl.name}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
                      {tmpl.description || 'Pre-configured responsive layout with enterprise headers, interactive tabs, comparison matrix, and lead capture.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                    <button
                      onClick={(e) => handleOpenPreview(tmpl, e)}
                      className="btn btn-ghost"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        padding: '10px'
                      }}
                    >
                      <Eye size={15} />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={(e) => handleOpenUseModal(tmpl, e)}
                      className="btn btn-primary"
                      style={{
                        flex: 1.2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: '800',
                        padding: '10px'
                      }}
                    >
                      <span>Use Template</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Use Template Modal */}
      {useModalOpen && selectedTemplate && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                  Create Website from Template
                </h3>
              </div>
              <button
                onClick={() => setUseModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
              You are using the <strong style={{ color: '#fff' }}>{selectedTemplate.name}</strong> template. Enter your website name to launch straight into the Visual Editor.
            </p>

            {createError && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: 'var(--accent-rose)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateWebsiteWithTemplate}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Website Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g., IronPulse Fitness Club"
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setUseModalOpen(false)}
                  className="btn btn-ghost"
                  disabled={creatingSite}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creatingSite || !siteName.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}
                >
                  {creatingSite ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating & Launching...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Editor</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Live Site Preview Modal */}
      {previewModalOpen && previewTemplate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          {/* Top Bar Navigation */}
          <div style={{
            height: '60px',
            minHeight: '60px',
            padding: '0 24px',
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexShrink: 0,
            zIndex: 10
          }}>
            {/* Left: Template Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="btn btn-ghost"
                style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <X size={16} />
                <span>Exit Preview</span>
              </button>
              <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>
                    {previewTemplate.name}
                  </span>
                  <span style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: 'var(--primary)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {previewTemplate.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Device Viewport Controls */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '3px'
            }}>
              <button
                onClick={() => setPreviewDevice('desktop')}
                title="Desktop View (100%)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: previewDevice === 'desktop' ? 'var(--primary)' : 'transparent',
                  color: previewDevice === 'desktop' ? '#070a0f' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700',
                  transition: 'all 150ms ease'
                }}
              >
                <Monitor size={14} />
                <span>Desktop</span>
              </button>

              <button
                onClick={() => setPreviewDevice('tablet')}
                title="Tablet View (768px)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: previewDevice === 'tablet' ? 'var(--primary)' : 'transparent',
                  color: previewDevice === 'tablet' ? '#070a0f' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700',
                  transition: 'all 150ms ease'
                }}
              >
                <Tablet size={14} />
                <span>Tablet</span>
              </button>

              <button
                onClick={() => setPreviewDevice('mobile')}
                title="Mobile View (375px)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: previewDevice === 'mobile' ? 'var(--primary)' : 'transparent',
                  color: previewDevice === 'mobile' ? '#070a0f' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700',
                  transition: 'all 150ms ease'
                }}
              >
                <Smartphone size={14} />
                <span>Mobile</span>
              </button>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => {
                  setPreviewModalOpen(false);
                  handleOpenUseModal(previewTemplate, { stopPropagation: () => {} });
                }}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '800',
                  padding: '8px 18px',
                  fontSize: '13px'
                }}
              >
                <span>Use This Template</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Viewport Scrollable Area */}
          <div 
            style={{
              flex: 1,
              height: 'calc(100vh - 60px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              background: '#04070e',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              padding: previewDevice === 'desktop' ? '0' : '30px 20px 60px',
              transition: 'padding 250ms ease',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div style={{
              width: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '375px',
              maxWidth: '100%',
              background: '#070a0f',
              boxShadow: previewDevice === 'desktop' ? 'none' : '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
              borderRadius: previewDevice === 'desktop' ? '0' : '16px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              marginBottom: previewDevice === 'desktop' ? '0' : '40px'
            }}>
              {loadingPreview ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  color: 'var(--primary)'
                }}>
                  <Loader2 size={40} className="animate-spin" style={{ marginBottom: '16px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading full site preview...</p>
                </div>
              ) : previewContent ? (
                <TemplateLivePreview content={previewContent} responsiveMode={previewDevice} />
              ) : (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  Template content unavailable.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
