import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import FloatingActionBar from './FloatingActionBar';
import { 
  Sparkles, 
  Star, 
  Heart, 
  Check, 
  Zap, 
  Shield, 
  Globe, 
  Layers, 
  Send, 
  Activity, 
  ChevronDown, 
  Plus, 
  Info, 
  Clock, 
  Mail, 
  MapPin, 
  ExternalLink, 
  ArrowRight, 
  Lock, 
  EyeOff, 
  ChevronLeft, 
  FileText, 
  Phone, 
  CheckCircle2, 
  XCircle,
  X, 
  Menu,
  Share2,
  HelpCircle
} from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

export default function ElementRenderer({ element, parentId = null }) {
  const { 
    selectedElementId, 
    setSelectedElementId, 
    hoveredElementId, 
    setHoveredElementId,
    responsiveMode,
    previewMode,
    updateElementSettings,
    addElement,
    draggedWidgetType,
    isElementLocked,
    openContextMenu
  } = useEditor();

  const [isDragOver, setIsDragOver] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeProdTab, setActiveProdTab] = useState(0);
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!element) return null;

  const isSelected = selectedElementId === element.id && !previewMode;
  const isHovered = hoveredElementId === element.id && !isSelected && !previewMode;
  const isRoot = element.id === 'root';
  const settings = element.settings || {};

  // Responsive value helper
  const getVal = (val, defaultVal = '') => {
    if (val === undefined || val === null) return defaultVal;
    if (typeof val === 'object') {
      return val[responsiveMode] || val.desktop || defaultVal;
    }
    return val || defaultVal;
  };

  const isContainerType = element.type === 'container' || element.type === 'section' || isRoot;

  // Drag & Drop Handlers for Containers / Sections
  const handleDragOver = (e) => {
    if (isContainerType) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    if (isContainerType) {
      e.stopPropagation();
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    if (isContainerType) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const widgetType = e.dataTransfer.getData('text/plain') || draggedWidgetType;
      if (widgetType) {
        addElement(element.id, widgetType);
      }
    }
  };

  const handleClick = (e) => {
    if (previewMode) return;
    e.stopPropagation();
    setSelectedElementId(element.id);
  };

  // Inline text editing handler
  const handleInlineBlur = (field, e) => {
    if (isElementLocked(element.id)) return;
    updateElementSettings(element.id, {
      ...settings,
      [field]: e.currentTarget.innerHTML || e.currentTarget.innerText
    });
  };

  // Build element style
  const getContainerStyle = () => {
    const pad = settings.padding || {};
    const mar = settings.margin || {};
    const bgImg = settings.bgImage ? `url("${getMediaUrl(settings.bgImage)}")` : 'none';
    const rawBg = settings.background;
    const isWhiteOrEmpty = isRoot && (!rawBg || rawBg === '#ffffff' || rawBg === '#fff' || rawBg === 'white');
    const bgCol = isWhiteOrEmpty ? '#070a0f' : (rawBg || (isRoot ? '#070a0f' : 'transparent'));

    return {
      display: 'flex',
      flexDirection: settings.direction || 'column',
      alignItems: settings.align || 'stretch',
      justifyContent: settings.justify || 'flex-start',
      gap: settings.gap !== undefined ? settings.gap : '0px',
      paddingTop: pad.top || (element.type === 'section' ? '60px' : '0px'),
      paddingRight: pad.right || (element.type === 'section' ? '24px' : '0px'),
      paddingBottom: pad.bottom || (element.type === 'section' ? '60px' : '0px'),
      paddingLeft: pad.left || (element.type === 'section' ? '24px' : '0px'),
      marginTop: mar.top || '0px',
      marginRight: mar.right || '0px',
      marginBottom: mar.bottom || '0px',
      marginLeft: mar.left || '0px',
      backgroundColor: bgCol,
      backgroundImage: bgImg,
      backgroundSize: settings.bgSize || 'cover',
      backgroundPosition: settings.bgPosition || 'center',
      minHeight: settings.minHeight || 'auto',
      maxWidth: settings.maxWidth || '100%',
      borderRadius: settings.borderRadius || '0px',
      position: 'relative',
      boxSizing: 'border-box',
      width: '100%'
    };
  };

  const getOutlineStyle = () => {
    if (previewMode) return {};

    if (isSelected) {
      return {
        outline: '2px solid var(--primary)',
        outlineOffset: '-1px'
      };
    }

    if (isDragOver) {
      return {
        outline: '2px dashed var(--accent-emerald)',
        background: 'rgba(16, 185, 129, 0.05)'
      };
    }

    if (isHovered) {
      return {
        outline: '1px dashed rgba(56, 189, 248, 0.6)',
        outlineOffset: '-1px'
      };
    }

    if ((element.type === 'container' || element.type === 'section') && (!element.children || element.children.length === 0)) {
      return {
        outline: '1px dashed rgba(255, 255, 255, 0.15)',
        minHeight: '80px'
      };
    }

    return {};
  };

  // Highlight word helper for headings
  const renderHighlightedTitle = (title, highlightWord, accentColor = 'var(--primary)') => {
    if (!highlightWord || !title) return title;
    const index = title.toLowerCase().indexOf(highlightWord.toLowerCase());
    if (index === -1) return title;

    const start = title.substring(0, index);
    const middle = title.substring(index, index + highlightWord.length);
    const end = title.substring(index + highlightWord.length);

    return (
      <>
        {start}
        <span style={{ color: accentColor, fontWeight: '900' }}>{middle}</span>
        {end}
      </>
    );
  };

  // Render individual widget types
  const renderWidgetContent = () => {
    const isMobile = responsiveMode === 'mobile';
    const isTablet = responsiveMode === 'tablet';

    switch (element.type) {
      case 'section':
      case 'container':
        return (
          <div style={{ ...getContainerStyle(), ...getOutlineStyle() }}>
            {isSelected && <FloatingActionBar element={element} />}

            {(!element.children || element.children.length === 0) && !previewMode && (
              <div style={{
                width: '100%',
                padding: '36px 20px',
                textAlign: 'center',
                color: 'var(--text-dim)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                pointerEvents: 'none'
              }}>
                <Plus size={22} style={{ opacity: 0.5 }} />
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Drag sections or widgets here</span>
              </div>
            )}

            {Array.isArray(element.children) && element.children.map(child => (
              <ElementRenderer key={child.id} element={child} parentId={element.id} />
            ))}
          </div>
        );

      // ── 1. NAVBAR HEADER ──
      case 'nav_header': {
        const linksList = (settings.links || 'About, Products, Features, Contact')
          .split(',')
          .map(l => l.trim())
          .filter(Boolean);

        const showCatalog = settings.showCatalogBtn !== false && Boolean(settings.catalogText && settings.catalogText.trim());
        const showCta = settings.showCtaBtn !== false && Boolean(settings.ctaText && settings.ctaText.trim());
        const showBrandText = settings.showBrandText !== false;
        const isSticky = Boolean(settings.isSticky);

        return (
          <header style={{
            position: isSticky ? 'sticky' : 'relative',
            top: isSticky ? 0 : 'auto',
            zIndex: isSticky ? 100 : 1,
            background: settings.background || 'rgba(13, 43, 94, 0.45)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: isMobile ? '10px 14px' : '12px 24px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: isMobile ? '10px' : '16px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {/* Brand Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
                {settings.logoUrl ? (
                  <>
                    <img 
                      src={getMediaUrl(settings.logoUrl)} 
                      alt={settings.brandName || 'Brand Logo'} 
                      style={{ 
                        height: isMobile ? '28px' : (settings.logoHeight || '38px'), 
                        maxHeight: isMobile ? '30px' : (settings.logoHeight || '48px'), 
                        maxWidth: isMobile ? '110px' : (settings.logoWidth || '160px'), 
                        width: 'auto',
                        objectFit: settings.logoFit || 'contain',
                        display: 'block',
                        flexShrink: 0
                      }} 
                    />
                    {showBrandText && settings.brandName && (
                      <span style={{ fontWeight: '800', fontSize: isMobile ? '15px' : '20px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {settings.brandName}
                      </span>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '900', fontSize: isMobile ? '15px' : '20px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary)', color: '#070a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Zap size={16} />
                    </div>
                    {showBrandText && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{settings.brandName || 'LiteSteel'}</span>}
                  </div>
                )}
              </div>

              {/* Navigation Links - Desktop Only */}
              {!isMobile && (
                <nav style={{ display: 'flex', alignItems: 'center', gap: isTablet ? '12px' : '20px', flexWrap: 'wrap' }}>
                  {linksList.map((link, idx) => {
                    const targetAnchor = '#' + link.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return (
                      <a
                        key={idx}
                        href={targetAnchor}
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: isTablet ? '12px' : '13px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          transition: 'color 150ms ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                      >
                        {link}
                      </a>
                    );
                  })}
                </nav>
              )}

              {/* Action Buttons & Mobile Hamburger */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {/* Desktop/Tablet Catalog Button */}
                {!isMobile && showCatalog && (
                  <a
                    href={settings.catalogUrl || '#contact'}
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: 'var(--primary)',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={13} />
                    <span>{settings.catalogText}</span>
                  </a>
                )}

                {/* CTA Button */}
                {showCta && (
                  <a
                    href={settings.ctaUrl || '#contact'}
                    style={{
                      background: 'var(--primary)',
                      color: '#070a0f',
                      padding: isMobile ? '6px 10px' : '8px 16px',
                      borderRadius: '6px',
                      fontSize: isMobile ? '11px' : '12px',
                      fontWeight: '800',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{settings.ctaText}</span>
                  </a>
                )}

                {/* Mobile Hamburger Toggle Button */}
                {isMobile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileMenuOpen(prev => !prev);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: mobileMenuOpen ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: mobileMenuOpen ? 'var(--primary)' : '#ffffff',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    title="Toggle mobile menu"
                  >
                    {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Dropdown Menu Drawer */}
            {isMobile && mobileMenuOpen && (
              <div style={{
                marginTop: '10px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {linksList.map((link, idx) => {
                  const targetAnchor = '#' + link.toLowerCase().replace(/[^a-z0-9]/g, '');
                  return (
                    <a
                      key={idx}
                      href={targetAnchor}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '13px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        background: 'rgba(255, 255, 255, 0.04)'
                      }}
                    >
                      {link}
                    </a>
                  );
                })}
                {showCatalog && (
                  <a
                    href={settings.catalogUrl || '#contact'}
                    style={{
                      marginTop: '4px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: 'var(--primary)',
                      fontSize: '12px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={13} />
                    <span>{settings.catalogText}</span>
                  </a>
                )}
              </div>
            )}
          </header>
        );
      }

      // ── 2. HERO SLIDER ──
      case 'hero_slider': {
        const slides = Array.isArray(settings.slides) && settings.slides.length > 0
          ? settings.slides.map(s => typeof s === 'string' ? s : (s.image || ''))
          : [
              settings.slide1Image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=80',
              settings.slide2Image || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=80',
              settings.slide3Image || 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1400&q=80'
            ].filter(Boolean);

        const currentBg = slides[activeSlide] || slides[0] || '';
        const showTag = settings.showTag !== false && Boolean(settings.tag && settings.tag.trim());
        const showDesc = settings.showDescription !== false && Boolean(settings.description && settings.description.trim());
        const showPrimaryBtn = settings.showPrimaryBtn !== false && Boolean(settings.primaryBtnText && settings.primaryBtnText.trim());
        const showSecondaryBtn = settings.showSecondaryBtn !== false && Boolean(settings.secondaryBtnText && settings.secondaryBtnText.trim());
        const showSlideControls = settings.showSlideControls !== false && slides.length > 1;

        return (
          <section style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            background: '#070a0f'
          }}>
            {/* Background Image Slide */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${getMediaUrl(currentBg)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'background-image 500ms ease-in-out'
            }}>
              {/* Overlay Gradient */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, rgba(7,10,15,0.92) 0%, rgba(7,10,15,0.7) 50%, rgba(7,10,15,0.3) 100%)'
              }} />
            </div>

            {/* Slide Content */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '80px 24px',
              width: '100%'
            }}>
              <div style={{ maxWidth: '680px' }}>
                {showTag && (
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '1.5px',
                    marginBottom: '16px'
                  }}>
                    {settings.tag}
                  </span>
                )}

                <h1 style={{
                  fontSize: 'clamp(2rem, 4vw, 3.4rem)',
                  fontWeight: '900',
                  lineHeight: '1.1',
                  color: '#ffffff',
                  marginBottom: '18px'
                }}>
                  {renderHighlightedTitle(settings.title || 'Next-Generation High Tensile Fencing', settings.italicWords || 'High Tensile')}
                </h1>

                {showDesc && (
                  <p style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6',
                    marginBottom: '28px'
                  }}>
                    {settings.description}
                  </p>
                )}

                {(showPrimaryBtn || showSecondaryBtn) && (
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    {showPrimaryBtn && (
                      <a
                        href={settings.primaryBtnUrl || '#products'}
                        style={{
                          background: 'var(--primary)',
                          color: '#070a0f',
                          padding: '12px 24px',
                          borderRadius: '6px',
                          fontWeight: '800',
                          fontSize: '14px',
                          textDecoration: 'none',
                          boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
                        }}
                      >
                        {settings.primaryBtnText} →
                      </a>
                    )}

                    {showSecondaryBtn && (
                      <a
                        href={settings.secondaryBtnUrl || '#contact'}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          padding: '12px 20px',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '14px',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Phone size={14} color="var(--primary)" />
                        <span>{settings.secondaryBtnText}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Slide Navigation Dots & Arrows */}
            {showSlideControls && (
              <div style={{
                position: 'absolute',
                bottom: '24px',
                right: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 3
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
                  }}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {slides.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(idx);
                      }}
                      style={{
                        width: activeSlide === idx ? '24px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        background: activeSlide === idx ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        transition: 'all 200ms ease'
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlide((prev) => (prev + 1) % slides.length);
                  }}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </section>
        );
      }

      // ── 3. ANIMATED STATS BAR ──
      case 'animated_stats_bar': {
        const stats = Array.isArray(settings.stats) && settings.stats.length > 0
          ? settings.stats.map((st, i) => ({
              num: st.number || st.num || '',
              label: st.label || '',
              icon: [Shield, Layers, Globe, CheckCircle2][i % 4] || Activity
            }))
          : [
              { num: settings.s1Num || '15+', label: settings.s1Label || 'Years of Engineering', icon: Shield },
              { num: settings.s2Num || '100K+', label: settings.s2Label || 'Sq.Ft Facility', icon: Layers },
              { num: settings.s3Num || '500+', label: settings.s3Label || 'Enterprise Clients', icon: Globe },
              { num: settings.s4Num || '99.8%', label: settings.s4Label || 'Quality Assurance', icon: CheckCircle2 }
            ];

        return (
          <div style={{
            background: settings.background || '#0a192f',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '32px 24px',
            width: '100%'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              textAlign: 'center'
            }}>
              {stats.map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div key={idx} style={{ padding: '10px' }}>
                    <div style={{
                      fontSize: 'clamp(2rem, 3vw, 2.6rem)',
                      fontWeight: '900',
                      color: 'var(--primary)',
                      fontFamily: 'var(--font-mono)',
                      lineHeight: '1.2'
                    }}>
                      {st.num}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      fontWeight: '600',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                      <Icon size={14} style={{ color: 'var(--accent-emerald)' }} />
                      <span>{st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // ── 4. ABOUT SHOWCASE ──
      case 'about_showcase': {
        const badges = (settings.techBadges || 'ISO 9001:2015, High Tensile Alloy, Epoxy Polymer Coating, 25-Year Warranty')
          .split(',')
          .map(b => b.trim())
          .filter(Boolean);

        const bullets = [
          settings.h1 || '100% Virgin Grade Carbon Steel Wire',
          settings.h2 || 'Triple-Layer Anti-Corrosive Thermal Barrier',
          settings.h3 || 'Custom Fabrication & Precision Tolerance Tested',
          settings.h4 || 'Fast Nationwide Dispatch & On-Site Support'
        ].filter(b => Boolean(b && b.trim()));

        const showBadge = settings.showBadge !== false && Boolean(settings.badge && settings.badge.trim());
        const showTechBadges = settings.showTechBadges !== false && badges.length > 0;
        const showBullets = settings.showBullets !== false && bullets.length > 0;
        const showBadgeCard = settings.showBadgeCard !== false && Boolean(settings.badgeCardTitle && settings.badgeCardTitle.trim());

        return (
          <section style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: responsiveMode === 'mobile' ? '1fr' : '1.1fr 0.9fr',
                gap: '48px',
                alignItems: 'center'
              }}>
                {/* Left Details */}
                <div>
                  {showBadge && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: 'var(--primary)',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      display: 'inline-block',
                      marginBottom: '10px'
                    }}>
                      {settings.badge}
                    </span>
                  )}

                  <h2 style={{
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                    fontWeight: '900',
                    color: '#fff',
                    lineHeight: '1.2',
                    marginBottom: '18px'
                  }}>
                    {renderHighlightedTitle(settings.title || 'Pioneering Advanced Steel Infrastructure', settings.highlightWord || 'Advanced Steel')}
                  </h2>

                  <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '24px' }}>
                    {settings.description || 'With decades of metallurgy expertise, we engineer high-grade perimeter fencing.'}
                  </p>

                  {/* Tech Badges */}
                  {showTechBadges && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
                      {badges.map((b, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: 'var(--primary)',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '4px 10px',
                            borderRadius: '20px'
                          }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Checkmark Highlights */}
                  {showBullets && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {bullets.map((bullet, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: 'var(--accent-emerald)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Media Frame */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-glass)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                  }}>
                    <img
                      src={getMediaUrl(settings.imageUrl || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80')}
                      alt="About showcase"
                      style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block' }}
                    />
                  </div>

                  {/* Overlay Badge Card */}
                  {showBadgeCard && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-20px',
                      left: '-20px',
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px'
                    }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Shield size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>
                          {settings.badgeCardTitle || 'ISO 9001 Certified'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {settings.badgeCardSubtitle || 'International Quality Standards'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      }

      // ── 5. PRODUCT TABS SHOWCASE ──
      case 'product_tabs_showcase': {
        const tabs = Array.isArray(settings.tabs) && settings.tabs.length > 0
          ? settings.tabs.map(t => ({
              tab: t.tabName || t.tab || 'Product',
              title: t.title || 'Product Title',
              desc: t.description || t.desc || '',
              img: getMediaUrl(t.image || t.img || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'),
              specCore: t.specCore || '2.50mm High Carbon Galvanized',
              specBarb: t.specBarb || '2.00mm 4-Point Staggered',
              specCoating: t.specCoating || 'Epoxy Polymer / Heavy Zinc',
              specTensile: t.specTensile || '1150 - 1350 MPa'
            }))
          : [
              {
                tab: settings.p1Tab || 'Barbed Wire',
                title: settings.p1Title || 'High-Tensile Epoxy Barbed Wire',
                desc: settings.p1Desc || 'Engineered for border security and industrial facilities with 4-point sharp barbs.',
                img: getMediaUrl(settings.p1Image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'),
                specCore: settings.p1SpecCore || '2.50mm High Carbon Galvanized',
                specBarb: '2.00mm 4-Point Staggered',
                specCoating: settings.p1SpecCoating || 'Epoxy Polymer / Heavy Zinc (275 gsm)',
                specTensile: '1150 - 1350 MPa'
              },
              {
                tab: settings.p2Tab || 'Chainlink Fence',
                title: settings.p2Title || 'Heavy-Duty Diamond Chainlink Mesh',
                desc: settings.p2Desc || 'Interwoven diamond pattern delivering maximum structural elasticity and impact absorption.',
                img: getMediaUrl(settings.p2Image || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'),
                specCore: settings.p2SpecCore || '3.15mm - 4.00mm Steel Wire',
                specBarb: 'Knuckled & Barbed Edge Selvage',
                specCoating: 'PVC / Fusion Bonded Epoxy',
                specTensile: '450 - 600 MPa'
              },
              {
                tab: settings.p3Tab || 'Concertina Coil',
                title: settings.p3Title || 'Reinforced Razor Concertina Coil',
                desc: settings.p3Desc || 'Maximum deterrent concertina razor wire with continuous spiral helical coils.',
                img: getMediaUrl(settings.p3Image || 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80'),
                specCore: '2.50mm Spring Steel Wire',
                specBarb: '0.50mm Stainless Steel Razor Blades',
                specCoating: 'Hot Dip Galvanized (Class A)',
                specTensile: '1400 - 1600 MPa'
              }
            ];

        const activeProduct = tabs[activeProdTab] || tabs[0] || {};
        const showBadge = settings.showBadge !== false && Boolean(settings.badge && settings.badge.trim());
        const showDatasheet = settings.showDatasheetBtn !== false;
        const showSpecs = settings.showSpecsTable !== false;

        return (
          <section style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              {showBadge && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: '900', color: '#fff', margin: '8px 0 24px' }}>
                {renderHighlightedTitle(settings.title || 'Engineered Fencing Solutions', settings.highlightWord || 'Fencing Solutions')}
              </h2>

              {/* Tab Pill Buttons */}
              <div style={{
                display: 'flex',
                gap: '6px',
                background: 'var(--bg-surface-elevated)',
                padding: '6px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '36px',
                overflowX: 'auto'
              }}>
                {tabs.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveProdTab(idx);
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: activeProdTab === idx ? 'var(--primary)' : 'transparent',
                      color: activeProdTab === idx ? '#070a0f' : 'var(--text-muted)',
                      fontWeight: '800',
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {t.tab}
                  </button>
                ))}
              </div>

              {/* Active Product Pane */}
              {activeProduct.title && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: (!showSpecs || responsiveMode === 'mobile') ? '1fr' : '1fr 1fr',
                  gap: '36px',
                  alignItems: 'center',
                  background: 'var(--bg-surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-glass)',
                  padding: '36px'
                }}>
                  {/* Left Column: Image & Overview */}
                  <div>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', height: '240px', marginBottom: '20px' }}>
                      <img src={activeProduct.img} alt={activeProduct.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                      {activeProduct.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                      {activeProduct.desc}
                    </p>
                    {showDatasheet && (
                      <a
                        href="#contact"
                        style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          color: 'var(--primary)',
                          padding: '10px 18px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '700',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FileText size={14} />
                        <span>Request Technical Datasheet</span>
                      </a>
                    )}
                  </div>

                  {/* Right Column: Specifications Table */}
                  {showSpecs && (
                    <div style={{
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '16px' }}>
                        Technical Specifications
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', fontSize: '13px' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Core Wire Gauge</span>
                          <span style={{ fontWeight: '700', color: '#fff' }}>{activeProduct.specCore}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', fontSize: '13px' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Coating Technology</span>
                          <span style={{ fontWeight: '700', color: '#fff' }}>{activeProduct.specCoating}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', fontSize: '13px' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Tensile Breaking Load</span>
                          <span style={{ fontWeight: '700', color: '#fff' }}>{activeProduct.specTensile}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Manufacturing Standard</span>
                          <span style={{ fontWeight: '700', color: 'var(--accent-emerald)' }}>ISO 9001:2015 Compliant</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      }

      // ── 6. APPLICATIONS GRID ──
      case 'applications_grid': {
        const apps = Array.isArray(settings.cards) && settings.cards.length > 0
          ? settings.cards.map(c => ({
              title: c.title || 'Application',
              desc: c.description || c.desc || '',
              img: getMediaUrl(c.image || c.img || 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=600&q=80')
            }))
          : [
              { title: settings.a1Title || 'Highways & Infrastructure', desc: settings.a1Desc || 'Crash-resistant highway median barriers.', img: getMediaUrl(settings.a1Image || 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=600&q=80') },
              { title: settings.a2Title || 'Airports & Military Defense', desc: settings.a2Desc || 'Heavy razor concertina barriers for secure perimeter control.', img: getMediaUrl(settings.a2Image || 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80') },
              { title: settings.a3Title || 'Agricultural & Farmland', desc: settings.a3Desc || 'Long-span cattle fence and anti-wildlife barriers.', img: getMediaUrl(settings.a3Image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80') }
            ];

        const showBadge = settings.showBadge !== false && Boolean(settings.badge && settings.badge.trim());

        return (
          <section style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              {showBadge && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: '900', color: '#fff', margin: '8px 0 36px' }}>
                {renderHighlightedTitle(settings.title || 'Proven in Every High-Security Application', settings.highlightWord || 'High-Security')}
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {apps.map((app, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'transform 200ms ease, border-color 200ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = 'var(--border-glass)';
                    }}
                  >
                    <div style={{ height: '180px', overflow: 'hidden' }}>
                      <img src={app.img} alt={app.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                        {app.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        {app.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ── 7. WHY US COMPARISON TABLE ──
      case 'comparison_table': {
        const rows = Array.isArray(settings.rows) && settings.rows.length > 0
          ? settings.rows.map(r => ({
              feat: r.feature || r.feat || 'Feature',
              us: r.us || '✓ High Performance',
              them: r.them || '✗ Subpar Alternative'
            }))
          : [
              { feat: settings.r1Feature || 'Anti-Rust Coating Technology', us: settings.r1Us || '✓ Advanced Epoxy Fusion Barrier', them: settings.r1Them || '✗ Basic Electro-Galvanized (Fades in 1 yr)' },
              { feat: settings.r2Feature || 'Tensile Breaking Strength', us: settings.r2Us || '✓ 1250 - 1450 MPa High Carbon', them: settings.r2Them || '✗ 350 - 500 MPa Mild Steel' },
              { feat: settings.r3Feature || 'Certified Lifespan Guarantee', us: settings.r3Us || '✓ 20 to 25 Years Tested Lifespan', them: settings.r3Them || '✗ 2 to 4 Years Before Rusting' },
              { feat: settings.r4Feature || 'Uniform Wire Gauge Tolerance', us: settings.r4Us || '✓ ±0.02mm Strict Laser Quality Tested', them: settings.r4Them || '✗ Inconsistent Thickness & Spliced' },
              { feat: settings.r5Feature || 'Factory Direct Testing & ISO Audit', us: settings.r5Us || '✓ ISO 9001:2015 Certified Lab Reports', them: settings.r5Them || '✗ No Testing Certifications Provided' }
            ];

        const showBadge = settings.showBadge !== false && Boolean(settings.badge && settings.badge.trim());

        return (
          <section style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              {showBadge && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: '900', color: '#fff', margin: '8px 0 36px' }}>
                {renderHighlightedTitle(settings.title || 'Why Leaders Choose Us over Local Brands', settings.highlightWord || 'Local Brands')}
              </h2>

              <div style={{
                background: 'var(--bg-surface)',
                borderRadius: '16px',
                border: '1px solid var(--border-glass)',
                overflowX: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}>
                <table style={{ width: '100%', minWidth: isMobile ? '480px' : '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '800', color: '#94a3b8' }}>FEATURE</th>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '800', color: 'var(--primary)', background: 'rgba(56, 189, 248, 0.08)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Star size={14} fill="var(--primary)" color="var(--primary)" />
                          <span>{settings.brandColName || 'Our Platform'}</span>
                        </span>
                      </th>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '800', color: '#fda4af' }}>
                        {settings.competitorColName || 'Standard Alternatives'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const cleanUs = (row.us || '').replace(/^[✓✗✔✕\s]+/, '').trim();
                      const cleanThem = (row.them || '').replace(/^[✓✗✔✕\s]+/, '').trim();
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                            {row.feat}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--accent-emerald)', background: 'rgba(56, 189, 248, 0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={15} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                              <span>{cleanUs}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '13px', color: '#fda4af' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <XCircle size={15} style={{ color: '#f87171', flexShrink: 0 }} />
                              <span>{cleanThem}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      }

      // ── 8. TECH INNOVATION CARDS ──
      case 'tech_innovation': {
        const cards = Array.isArray(settings.cards) && settings.cards.length > 0
          ? settings.cards.map(c => ({
              title: c.title || 'Innovation',
              tag: c.tag || 'PERFORMANCE',
              desc: c.description || c.desc || '',
              img: getMediaUrl(c.image || c.img || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80')
            }))
          : [
              { title: settings.t1Title || 'Thermal Fusion Bonding', tag: settings.t1Tag || 'THERMAL PROCESS', desc: settings.t1Desc || 'Dual-phase temperature bonding creates an molecular seal.', img: getMediaUrl(settings.t1Image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80') },
              { title: settings.t2Title || 'Automated CNC Weaving', tag: settings.t2Tag || 'ROBOTIC PRECISION', desc: settings.t2Desc || 'State-of-the-art multi-axis CNC machines guarantee uniform aperture dimensions.', img: getMediaUrl(settings.t2Image || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80') },
              { title: settings.t3Title || 'Accelerated Salt-Spray Testing', tag: settings.t3Tag || 'LAB VERIFIED', desc: settings.t3Desc || 'Subjected to 1,000+ hours of continuous ASTM B117 salt spray testing with zero rust.', img: getMediaUrl(settings.t3Image || 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=600&q=80') }
            ];

        const showBadge = settings.showBadge !== false && Boolean(settings.badge && settings.badge.trim());

        return (
          <section style={{
            background: settings.background || 'linear-gradient(135deg, #070a0f 0%, #0d2b5e 100%)',
            width: '100%'
          }}>
            <div style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
              {showBadge && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: '900', color: '#fff', margin: '8px 0 36px' }}>
                {renderHighlightedTitle(settings.title || 'Precision Metallurgy & Manufacturing Innovation', settings.highlightWord || 'Innovation')}
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {cards.map((card, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ height: '160px', overflow: 'hidden' }}>
                      <img src={getMediaUrl(card.img)} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '24px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        color: 'var(--accent-emerald)',
                        background: 'rgba(16, 185, 129, 0.15)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        letterSpacing: '1px'
                      }}>
                        {card.tag}
                      </span>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: '10px 0 8px' }}>
                        {card.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        {card.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ── 9. CONTACT SPLIT SECTION ──
      case 'contact_split': {
        const prodOptions = (settings.productsList || 'Barbed Wire, Chainlink Fence, Concertina Coil, Custom Project Order')
          .split(',')
          .map(p => p.trim())
          .filter(Boolean);

        const showBadge = settings.showBadge !== false && Boolean(settings.badge && settings.badge.trim());
        const showInfo = settings.showInfoCards !== false;
        const showForm = settings.showLeadForm !== false;

        const gridCols = (!showInfo || !showForm || responsiveMode === 'mobile') ? '1fr' : '1fr 1fr';

        return (
          <section style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              {showBadge && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: '900', color: '#fff', margin: '8px 0 36px' }}>
                {renderHighlightedTitle(settings.title || 'Connect with Our Engineering & Sales Team', settings.highlightWord || 'Engineering & Sales')}
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: gridCols,
                gap: '40px',
                alignItems: 'start'
              }}>
                {/* Left Info Cards */}
                {showInfo && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Mail size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Email Address</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{settings.email || 'sales@litesteel.com'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Phone size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Direct Sales Line</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{settings.phone || '+91 98765 43210'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Factory / Head Office</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{settings.address || 'Plot 42, Industrial Zone, India'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Lead Form */}
                {showForm && (
                  <div style={{
                    background: 'var(--bg-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-glass)',
                    padding: '32px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                      {settings.formTitle || 'Request Instant Price Quote'}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                      {settings.formSubtitle || 'Fill out your project specifications for tailored pricing.'}
                    </p>

                    <form onSubmit={(e) => { e.preventDefault(); alert('Enquiry submitted successfully!'); }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input type="text" className="form-input" placeholder="Your Full Name" required />
                        <input type="email" className="form-input" placeholder="Work Email" required />
                        <input type="tel" className="form-input" placeholder="Phone Number" required />
                        
                        <select className="form-input" style={{ background: 'var(--bg-surface-elevated)' }}>
                          {prodOptions.map((opt, idx) => (
                            <option key={idx} value={opt}>{opt}</option>
                          ))}
                        </select>

                        <textarea className="form-input" rows="3" placeholder="Estimated Quantity / Project Location..."></textarea>
                        
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontWeight: '800' }}>
                          Submit Enquiry →
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      }

      // ── 10. ENTERPRISE FOOTER ──
      case 'enterprise_footer': {
        const col1Links = (settings.col1Links || 'Barbed Wire, Chainlink Fence, Concertina Coil, Download Catalog')
          .split(',').map(l => l.trim()).filter(Boolean);
        const col2Links = (settings.col2Links || 'About Us, Applications, Why Choose Us, Technology, Contact')
          .split(',').map(l => l.trim()).filter(Boolean);

        const showSocial = settings.showSocialLinks !== false;
        const showCol1 = settings.showCol1 !== false;
        const showCol2 = settings.showCol2 !== false;
        const showCol3 = settings.showCol3 !== false;
        const showLegal = settings.showLegalLinks !== false;

        return (
          <footer style={{
            background: settings.background || '#04060a',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '60px 24px 24px',
            width: '100%',
            color: 'var(--text-muted)'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: responsiveMode === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '40px',
              paddingBottom: '40px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              {/* Brand Column */}
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary)', color: '#070a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={16} />
                  </div>
                  <span>{settings.brandName || 'LiteSteel'}</span>
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '18px' }}>
                  {settings.tagline || 'Precision engineered perimeter fencing and industrial wire solutions.'}
                </p>
                {showSocial && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[Globe, Share2, Mail, ExternalLink].map((Icon, idx) => (
                      <div key={idx} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                        <Icon size={14} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Col 1 */}
              {showCol1 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', marginBottom: '16px' }}>
                    {settings.col1Title || 'Products'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    {col1Links.map((l, idx) => (
                      <a key={idx} href="#products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
                    ))}
                  </div>
                </div>
              )}

              {/* Col 2 */}
              {showCol2 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', marginBottom: '16px' }}>
                    {settings.col2Title || 'Quick Links'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    {col2Links.map((l, idx) => (
                      <a key={idx} href="#about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
                    ))}
                  </div>
                </div>
              )}

              {/* Col 3 */}
              {showCol3 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', marginBottom: '16px' }}>
                    {settings.col3Title || 'Head Office'}
                  </h4>
                  <div style={{ fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                    {settings.col3Info || 'Plot 42, Industrial Zone\nPhone: +91 98765 43210\nEmail: sales@litesteel.com'}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              maxWidth: '1200px',
              margin: '20px auto 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '12px',
              color: 'var(--text-dim)'
            }}>
              <div>{settings.copyright || '© 2026 LiteSteel Manufacturing Ltd. All rights reserved.'}</div>
              {showLegal && (
                <div style={{ display: 'flex', gap: '16px' }}>
                  <a href="#privacy" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Privacy Policy</a>
                  <a href="#terms" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Terms of Service</a>
                </div>
              )}
            </div>
          </footer>
        );
      }

      // ── 11. TESTIMONIAL GRID ──
      case 'testimonial_grid': {
        const reviews = Array.isArray(settings.reviews) && settings.reviews.length > 0
          ? settings.reviews.map(r => ({
              name: r.name || 'Client',
              role: r.role || 'Executive',
              quote: r.quote || 'Outstanding quality and reliability.',
              photo: r.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
            }))
          : [
              { name: settings.t1Name || 'Rajesh Sharma', role: settings.t1Role || 'Chief Project Engineer', quote: settings.t1Quote || 'Tensile consistency and epoxy coating durability exceeded our strict highway safety compliance audits.', photo: settings.t1Photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
              { name: settings.t2Name || 'Ananya Verma', role: settings.t2Role || 'Procurement Director', quote: settings.t2Quote || 'Installed across 450 acres of solar farmland in harsh coastal humidity. Zero rust.', photo: settings.t2Photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
              { name: settings.t3Name || 'Vikram Patel', role: settings.t3Role || 'Managing Director', quote: settings.t3Quote || 'Superb knuckled selvage finish and on-time dispatch. Best enterprise supplier.', photo: settings.t3Photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }
            ];

        const showBadge = settings.showBadge !== false && Boolean(settings.badge && settings.badge.trim());
        const showStars = settings.showStars !== false;

        return (
          <section style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              {showBadge && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: '900', color: '#fff', margin: '8px 0 36px' }}>
                {settings.title || 'Endorsed by Top Infrastructure Contractors'}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {reviews.map((r, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '28px' }}>
                    {showStars && <div style={{ color: 'var(--accent-amber)', fontSize: '16px', marginBottom: '14px' }}>★★★★★</div>}
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>"{r.quote}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {r.photo && <img src={getMediaUrl(r.photo)} alt={r.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>{r.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{r.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ── 12. FAQ ACCORDION ──
      case 'faq_section': {
        const faqs = Array.isArray(settings.items) && settings.items.length > 0
          ? settings.items.map(f => ({
              q: f.question || f.q || 'Question',
              a: f.answer || f.a || 'Answer'
            }))
          : [
              { q: settings.q1 || 'What makes your epoxy coating superior to regular galvanized wire?', a: settings.a1 || 'Our fusion-bonded epoxy creates an impermeable polymer barrier that prevents oxygen and moisture from contacting steel core.' },
              { q: settings.q2 || 'Do you provide test certificates with bulk dispatch?', a: settings.a2 || 'Yes, every batch is dispatched with comprehensive mill test certificates (MTC).' },
              { q: settings.q3 || 'Can you manufacture custom wire gauges and mesh roll sizes?', a: settings.a3 || 'Yes, our automated CNC weaving lines allow customized wire gauges (1.6mm - 4.5mm).' },
              { q: settings.q4 || 'What is the minimum order quantity for enterprise projects?', a: settings.a4 || 'We accommodate both standard wholesale quantities and full container loads.' }
            ];

        const showBadge = settings.showBadge !== false && Boolean(settings.badge && settings.badge.trim());

        return (
          <section style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              <div style={{ maxWidth: '840px', margin: '0 auto' }}>
                {showBadge && (
                  <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {settings.badge}
                  </div>
                )}
                <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: '900', color: '#fff', marginBottom: '36px' }}>
                  {settings.title || 'Frequently Asked Questions'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {faqs.map((f, idx) => {
                    const isOpen = activeFaqIndex === idx;
                    return (
                      <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '12px', overflow: 'hidden' }}>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveFaqIndex(isOpen ? -1 : idx);
                          }}
                          style={{
                            padding: '18px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '15px',
                            color: isOpen ? 'var(--primary)' : '#fff'
                          }}
                        >
                          <span>{f.q}</span>
                          <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
                        </div>
                        {isOpen && (
                          <div style={{ padding: '0 24px 20px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            {f.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      }

      // ── BASIC ELEMENTS ──
      case 'heading': {
        const Tag = settings.tag || 'h2';
        const fontSize = getVal(settings.fontSize, '36px');
        return (
          <Tag
            contentEditable={!previewMode && !isElementLocked(element.id)}
            suppressContentEditableWarning
            onBlur={(e) => handleInlineBlur('text', e)}
            style={{
              color: settings.color || '#ffffff',
              fontSize: fontSize,
              fontWeight: settings.fontWeight || '800',
              textAlign: settings.align || 'left',
              lineHeight: '1.2',
              margin: '0',
              outline: 'none'
            }}
          >
            {settings.text || 'Heading Title'}
          </Tag>
        );
      }

      case 'text': {
        const fontSize = getVal(settings.fontSize, '16px');
        return (
          <div
            contentEditable={!previewMode && !isElementLocked(element.id)}
            suppressContentEditableWarning
            onBlur={(e) => handleInlineBlur('text', e)}
            dangerouslySetInnerHTML={{ __html: settings.text || '<p>Paragraph text</p>' }}
            style={{
              color: settings.color || '#94a3b8',
              fontSize: fontSize,
              textAlign: settings.align || 'left',
              lineHeight: '1.6',
              outline: 'none'
            }}
          />
        );
      }

      case 'button': {
        return (
          <div style={{ textAlign: settings.align || 'left', width: '100%' }}>
            <a
              href={settings.url || '#'}
              className={`btn btn-${settings.variant || 'primary'}`}
              style={{ display: 'inline-flex' }}
              onClick={(e) => previewMode && e.preventDefault()}
            >
              {settings.text || 'Click Here'}
            </a>
          </div>
        );
      }

      case 'image': {
        return (
          <div style={{ width: '100%', maxWidth: settings.maxWidth || '100%', borderRadius: settings.borderRadius || '12px', overflow: 'hidden' }}>
            <img
              src={getMediaUrl(settings.url || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80')}
              alt={settings.alt || 'Image showcase'}
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: settings.borderRadius || '12px' }}
            />
          </div>
        );
      }

      case 'video': {
        const url = settings.url || '';

        if (!url) {
          return (
            <div style={{
              width: '100%',
              maxWidth: settings.maxWidth || '100%',
              borderRadius: settings.borderRadius || '12px',
              overflow: 'hidden',
              aspectRatio: settings.aspectRatio || '16/9',
              background: '#070a0f',
              border: '2px dashed rgba(56, 189, 248, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-dim)',
              padding: '28px 20px',
              textAlign: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <Film size={24} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Video Player</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Select or upload a video file in the settings panel.</div>
              </div>
            </div>
          );
        }

        const isEmbed = settings.sourceType === 'embed' || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');

        const getEmbedSrc = (rawUrl) => {
          if (rawUrl.includes('youtube.com/watch?v=')) {
            return rawUrl.replace('watch?v=', 'embed/');
          }
          if (rawUrl.includes('youtu.be/')) {
            const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${id}`;
          }
          if (rawUrl.includes('vimeo.com/') && !rawUrl.includes('player.vimeo.com')) {
            const id = rawUrl.split('vimeo.com/')[1]?.split('?')[0];
            return `https://player.vimeo.com/video/${id}`;
          }
          return rawUrl;
        };

        return (
          <div style={{
            width: '100%',
            maxWidth: settings.maxWidth || '100%',
            borderRadius: settings.borderRadius || '12px',
            overflow: 'hidden',
            aspectRatio: settings.aspectRatio || '16/9',
            background: '#000',
            position: 'relative'
          }}>
            {isEmbed ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <iframe
                  src={getEmbedSrc(url)}
                  title="Video player"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: previewMode ? 'auto' : 'none'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {!previewMode && (
                  <div
                    onClick={handleClick}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 10,
                      cursor: 'pointer'
                    }}
                  />
                )}
              </div>
            ) : (
              <video
                src={getMediaUrl(url)}
                poster={settings.poster ? getMediaUrl(settings.poster) : undefined}
                controls={settings.controls === true || settings.controls === 'true'}
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                disableRemotePlayback
                autoPlay={settings.autoplay !== false && settings.autoplay !== 'false'}
                loop={settings.loop !== false && settings.loop !== 'false'}
                muted={settings.muted !== false && settings.muted !== 'false'}
                playsInline
                onClick={(e) => {
                  if (!(settings.controls === true || settings.controls === 'true')) {
                    if (e.currentTarget.paused) {
                      e.currentTarget.play().catch(() => {});
                    } else {
                      e.currentTarget.pause();
                    }
                  }
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: !(settings.controls === true || settings.controls === 'true') ? 'pointer' : 'default' }}
              />
            )}
          </div>
        );
      }

      case 'map_embed': {
        const query = encodeURIComponent(settings.query || 'Mumbai Industrial Zone, India');
        return (
          <div style={{
            width: '100%',
            height: settings.height || '350px',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <iframe
              src={`https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              style={{
                width: '100%',
                height: '100%',
                border: 0,
                pointerEvents: previewMode ? 'auto' : 'none'
              }}
              allowFullScreen
              loading="lazy"
            />
            {!previewMode && (
              <div
                onClick={handleClick}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  cursor: 'pointer'
                }}
              />
            )}
          </div>
        );
      }

      case 'divider': {
        return <hr style={{ border: 'none', height: settings.thickness || '1px', background: settings.color || 'rgba(255,255,255,0.1)', margin: settings.margin || '24px 0' }} />;
      }

      case 'spacer': {
        return <div style={{ height: settings.height || '40px', width: '100%' }} />;
      }

      case 'code_block': {
        return (
          <div style={{ background: '#0b1120', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ background: '#070a0f', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span>{settings.filename || 'specifications.json'}</span>
              <span style={{ color: 'var(--primary)' }}>{settings.language || 'json'}</span>
            </div>
            <pre style={{ padding: '16px', fontSize: '13px', color: '#38bdf8', fontFamily: 'var(--font-mono)', margin: 0, overflowX: 'auto' }}>
              <code>{settings.code || '{\n  "status": "ready"\n}'}</code>
            </pre>
          </div>
        );
      }

      case 'html': {
        return <div dangerouslySetInnerHTML={{ __html: settings.code || '' }} />;
      }

      default:
        return <div>Widget [{element.type}]</div>;
    }
  };

  const safeRenderWidget = () => {
    try {
      return renderWidgetContent();
    } catch (err) {
      console.error(`Error rendering widget [${element.type}]:`, err);
      return (
        <div style={{
          padding: '24px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#f87171',
          fontSize: '13px',
          textAlign: 'center'
        }}>
          <strong>Unable to display widget ({element.type})</strong>
          <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>{err.message}</div>
        </div>
      );
    }
  };

  const sectionId = settings.sectionId ? settings.sectionId.replace(/^#/, '').trim() : undefined;
  const isLocked = isElementLocked(element.id);
  
  const isHiddenOnDevice = Boolean(
    settings.hidden?.[responsiveMode] ||
    (responsiveMode === 'mobile' && settings.hideOnMobile) ||
    (responsiveMode === 'tablet' && settings.hideOnTablet) ||
    (responsiveMode === 'desktop' && settings.hideOnDesktop)
  );

  if (isHiddenOnDevice && previewMode) {
    return null;
  }

  const hiddenStyle = isHiddenOnDevice ? {
    opacity: 0.45,
    filter: 'grayscale(0.5)',
    border: '1px dashed rgba(244, 63, 94, 0.5)'
  } : {};

  // Extract advanced wrapper styles (margin, padding, zIndex, opacity, borderRadius, boxShadow, animation)
  const advancedStyles = {};
  if (settings.margin) {
    if (typeof settings.margin === 'string') {
      advancedStyles.margin = settings.margin;
    } else if (typeof settings.margin === 'object') {
      if (settings.margin.top) advancedStyles.marginTop = settings.margin.top;
      if (settings.margin.right) advancedStyles.marginRight = settings.margin.right;
      if (settings.margin.bottom) advancedStyles.marginBottom = settings.margin.bottom;
      if (settings.margin.left) advancedStyles.marginLeft = settings.margin.left;
    }
  }

  if (settings.padding) {
    if (typeof settings.padding === 'string') {
      advancedStyles.padding = settings.padding;
    } else if (typeof settings.padding === 'object') {
      if (settings.padding.top) advancedStyles.paddingTop = settings.padding.top;
      if (settings.padding.right) advancedStyles.paddingRight = settings.padding.right;
      if (settings.padding.bottom) advancedStyles.paddingBottom = settings.padding.bottom;
      if (settings.padding.left) advancedStyles.paddingLeft = settings.padding.left;
    }
  }

  if (settings.zIndex !== undefined && settings.zIndex !== '') {
    advancedStyles.zIndex = Number(settings.zIndex) || settings.zIndex;
  }

  if (settings.opacity !== undefined && settings.opacity !== '') {
    advancedStyles.opacity = Number(settings.opacity);
  }

  if (settings.borderRadius) {
    advancedStyles.borderRadius = settings.borderRadius;
  }

  if (settings.boxShadow && settings.boxShadow !== 'none') {
    advancedStyles.boxShadow = settings.boxShadow;
  }

  if (settings.animation && settings.animation !== 'none') {
    advancedStyles.animation = `${settings.animation} ${settings.animationDuration || '0.6s'} ease both`;
  }

  const elementClassName = `lb-node lb-${element.type}${settings.cssClass ? ` ${settings.cssClass}` : ''}`;

  if (element.type === 'container' || element.type === 'section') {
    return (
      <div
        id={sectionId}
        className={elementClassName}
        onClick={handleClick}
        onContextMenu={(e) => openContextMenu(e, element.id)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => !previewMode && setHoveredElementId(element.id)}
        onMouseLeave={() => !previewMode && setHoveredElementId(null)}
        style={{
          width: '100%',
          position: 'relative',
          boxSizing: 'border-box',
          ...advancedStyles,
          ...hiddenStyle
        }}
      >
        {isHovered && !isRoot && (
          <div style={{
            position: 'absolute',
            top: '-18px',
            left: '0',
            background: 'rgba(56, 189, 248, 0.95)',
            color: '#070a0f',
            fontSize: '9px',
            fontWeight: '800',
            padding: '1px 6px',
            borderRadius: '3px 3px 0 0',
            zIndex: 90,
            pointerEvents: 'none',
            textTransform: 'capitalize'
          }}>
            {element.type}
          </div>
        )}

        {isHiddenOnDevice && !previewMode && (
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: 'rgba(244, 63, 94, 0.9)',
            color: '#fff',
            fontSize: '9px',
            fontWeight: '700',
            padding: '2px 6px',
            borderRadius: '4px',
            zIndex: 100,
            pointerEvents: 'none'
          }}>
            Hidden on {responsiveMode}
          </div>
        )}

        {safeRenderWidget()}
      </div>
    );
  }

  return (
    <div
      id={sectionId}
      className={elementClassName}
      onClick={handleClick}
      onContextMenu={(e) => openContextMenu(e, element.id)}
      onMouseEnter={() => !previewMode && setHoveredElementId(element.id)}
      onMouseLeave={() => !previewMode && setHoveredElementId(null)}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%',
        ...getOutlineStyle(),
        ...advancedStyles,
        ...hiddenStyle
      }}
    >
      {isHovered && (
        <div style={{
          position: 'absolute',
          top: '-18px',
          left: '0',
          background: 'rgba(56, 189, 248, 0.95)',
          color: '#070a0f',
          fontSize: '9px',
          fontWeight: '800',
          padding: '1px 6px',
          borderRadius: '3px 3px 0 0',
          zIndex: 90,
          pointerEvents: 'none',
          textTransform: 'capitalize'
        }}>
          {element.type}
        </div>
      )}

      {isHiddenOnDevice && !previewMode && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          background: 'rgba(244, 63, 94, 0.9)',
          color: '#fff',
          fontSize: '9px',
          fontWeight: '700',
          padding: '2px 6px',
          borderRadius: '4px',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          Hidden on {responsiveMode}
        </div>
      )}

      {isSelected && <FloatingActionBar element={element} />}
      {safeRenderWidget()}
    </div>
  );
}
