import React, { useState } from 'react';
import { 
  Sparkles, 
  Star, 
  Shield, 
  Globe, 
  Layers, 
  Activity, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft, 
  Clock, 
  Mail, 
  MapPin, 
  ExternalLink, 
  ArrowRight, 
  FileText, 
  Phone, 
  CheckCircle2, 
  XCircle,
  X, 
  Menu,
  Share2,
  Award,
  Zap,
  Check,
  Dumbbell,
  Send,
  Building2,
  HelpCircle,
  Heart,
  Info,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { getMediaUrl } from '../utils/media';

export default function TemplateLivePreview({ content, responsiveMode = 'desktop' }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeProdTab, setActiveProdTab] = useState(0);
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!content) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
        No template preview data available.
      </div>
    );
  }

  // Helper to highlight words in titles
  const renderHighlightedTitle = (fullTitle, highlightWord, highlightColor = 'var(--primary)') => {
    if (!highlightWord || !fullTitle || !fullTitle.toLowerCase().includes(highlightWord.toLowerCase())) {
      return fullTitle;
    }
    const idx = fullTitle.toLowerCase().indexOf(highlightWord.toLowerCase());
    const before = fullTitle.slice(0, idx);
    const match = fullTitle.slice(idx, idx + highlightWord.length);
    const after = fullTitle.slice(idx + highlightWord.length);

    return (
      <>
        {before}
        <span style={{ 
          background: `linear-gradient(135deg, ${highlightColor}, #38bdf8)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '900'
        }}>
          {match}
        </span>
        {after}
      </>
    );
  };

  // Helper to format comparison row text without ugly unicode characters
  const cleanCompText = (text) => {
    if (!text) return '';
    return text.replace(/^[✓✗✔✕\s]+/, '').trim();
  };

  // Helper to render individual widgets
  const renderWidget = (node) => {
    if (!node) return null;
    const { type, settings = {} } = node;

    const isHiddenOnDevice = Boolean(
      settings.hidden?.[responsiveMode] ||
      (responsiveMode === 'mobile' && settings.hideOnMobile) ||
      (responsiveMode === 'tablet' && settings.hideOnTablet) ||
      (responsiveMode === 'desktop' && settings.hideOnDesktop)
    );

    if (isHiddenOnDevice) {
      return null;
    }

    switch (type) {
      // ── 1. NAVBAR HEADER ──
      case 'nav_header': {
        const links = (settings.links || 'About, Features, Specs, FAQ, Contact')
          .split(',')
          .map(l => l.trim())
          .filter(Boolean);

        const showCatalog = settings.showCatalogBtn !== false && Boolean(settings.catalogText && settings.catalogText.trim());
        const showCta = settings.showCtaBtn !== false && Boolean(settings.ctaText && settings.ctaText.trim());
        const isMobile = responsiveMode === 'mobile';
        const isTablet = responsiveMode === 'tablet';

        return (
          <header key={node.id} style={{
            background: settings.background || 'rgba(10, 15, 29, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: isMobile ? '10px 14px' : '14px 24px',
            position: 'relative',
            zIndex: 30,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: isMobile ? '10px' : '20px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {/* Brand */}
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
                    {settings.showBrandText !== false && settings.brandName && (
                      <span style={{
                        fontSize: isMobile ? '15px' : '18px',
                        fontWeight: '900',
                        letterSpacing: '0.5px',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {settings.brandName}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{
                      width: isMobile ? '28px' : '32px',
                      height: isMobile ? '28px' : '32px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--primary), #38bdf8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#070a0f',
                      fontWeight: '900',
                      flexShrink: 0
                    }}>
                      <Zap size={isMobile ? 15 : 18} />
                    </div>
                    {settings.showBrandText !== false && (
                      <span style={{
                        fontSize: isMobile ? '15px' : '18px',
                        fontWeight: '900',
                        letterSpacing: '0.5px',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {settings.brandName || 'BrandLogo'}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Nav Links - Desktop Only */}
              {!isMobile && (
                <nav style={{ display: 'flex', alignItems: 'center', gap: isTablet ? '12px' : '22px', flexWrap: 'wrap' }}>
                  {links.map((link, idx) => (
                    <a
                      key={idx}
                      href={`#${link.toLowerCase().replace(/\s+/g, '')}`}
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: isTablet ? '12px' : '13px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        transition: 'color 150ms ease'
                      }}
                    >
                      {link}
                    </a>
                  ))}
                </nav>
              )}

              {/* Actions & Mobile Hamburger */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {!isMobile && showCatalog && (
                  <a
                    href={settings.catalogUrl || '#'}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      padding: '8px 14px',
                      borderRadius: '8px',
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

                {showCta && (
                  <a
                    href={settings.ctaUrl || '#'}
                    style={{
                      background: 'var(--primary)',
                      color: '#070a0f',
                      padding: isMobile ? '6px 10px' : '8px 16px',
                      borderRadius: '8px',
                      fontSize: isMobile ? '11px' : '12px',
                      fontWeight: '800',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{settings.ctaText}</span>
                    <ArrowRight size={isMobile ? 11 : 13} />
                  </a>
                )}

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
                {links.map((link, idx) => (
                  <a
                    key={idx}
                    href={`#${link.toLowerCase().replace(/\s+/g, '')}`}
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
                ))}
                {showCatalog && (
                  <a
                    href={settings.catalogUrl || '#'}
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
        const slides = [
          settings.slide1Image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80',
          settings.slide2Image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80',
          settings.slide3Image || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1400&q=80'
        ].filter(Boolean);

        const currentBg = slides[activeSlide] || slides[0];

        return (
          <section key={node.id} style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            background: '#070a0f'
          }}>
            {/* Background Image */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${getMediaUrl(currentBg)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'background-image 400ms ease'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, rgba(7,10,15,0.94) 0%, rgba(7,10,15,0.75) 55%, rgba(7,10,15,0.4) 100%)'
              }} />
            </div>

            {/* Slide Content */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '1200px',
              margin: '0 auto',
              padding: responsiveMode === 'mobile' ? '40px 20px' : '70px 24px',
              width: '100%'
            }}>
              <div style={{ maxWidth: '640px' }}>
                {settings.showTag !== false && Boolean(settings.tag) && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(56, 189, 248, 0.18)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '1.2px',
                    marginBottom: '16px'
                  }}>
                    <Sparkles size={12} />
                    <span>{settings.tag}</span>
                  </span>
                )}

                <h1 style={{
                  fontSize: responsiveMode === 'mobile' ? '1.8rem' : 'clamp(2.2rem, 4vw, 3.2rem)',
                  fontWeight: '900',
                  lineHeight: '1.15',
                  color: '#ffffff',
                  marginBottom: '16px'
                }}>
                  {renderHighlightedTitle(settings.title || 'Transform Your Body, Unleash Your Potential', settings.italicWords || 'Unleash Your Potential')}
                </h1>

                {settings.showDescription !== false && Boolean(settings.description) && (
                  <p style={{
                    fontSize: responsiveMode === 'mobile' ? '14px' : '15px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: '1.6',
                    marginBottom: '24px'
                  }}>
                    {settings.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {settings.showPrimaryBtn !== false && Boolean(settings.primaryBtnText) && (
                    <a
                      href={settings.primaryBtnUrl || '#contact'}
                      style={{
                        background: 'var(--primary)',
                        color: '#070a0f',
                        padding: '12px 22px',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '13px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{settings.primaryBtnText}</span>
                      <ArrowRight size={14} />
                    </a>
                  )}

                  {settings.showSecondaryBtn !== false && Boolean(settings.secondaryBtnText) && (
                    <a
                      href={settings.secondaryBtnUrl || '#programs'}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        padding: '12px 22px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '13px',
                        textDecoration: 'none'
                      }}
                    >
                      {settings.secondaryBtnText}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Slide Navigation Controls */}
            {slides.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '24px',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <button
                  onClick={() => setActiveSlide(prev => (prev - 1 + slides.length) % slides.length)}
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

                <div style={{ display: 'flex', gap: '5px' }}>
                  {slides.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      style={{
                        width: activeSlide === idx ? '20px' : '6px',
                        height: '6px',
                        borderRadius: '3px',
                        background: activeSlide === idx ? 'var(--primary)' : 'rgba(255,255,255,0.35)',
                        cursor: 'pointer',
                        transition: 'all 200ms ease'
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setActiveSlide(prev => (prev + 1) % slides.length)}
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
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        );
      }

      // ── 3. ANIMATED STATS BAR ──
      case 'animated_stats_bar': {
        const stats = [
          { num: settings.s1Num || '15,000+', label: settings.s1Label || 'Active Members', icon: Shield },
          { num: settings.s2Num || '50+', label: settings.s2Label || 'Certified Master Coaches', icon: Award },
          { num: settings.s3Num || '120+', label: settings.s3Label || 'Weekly Group Classes', icon: Activity },
          { num: settings.s4Num || '24/7', label: settings.s4Label || 'Keycard Access & Security', icon: CheckCircle2 }
        ];

        return (
          <div key={node.id} style={{
            background: settings.background || '#0a192f',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '28px 20px',
            width: '100%'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: responsiveMode === 'mobile' ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              textAlign: 'center'
            }}>
              {stats.map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div key={idx} style={{ padding: '8px' }}>
                    <div style={{
                      fontSize: responsiveMode === 'mobile' ? '1.8rem' : '2.3rem',
                      fontWeight: '900',
                      color: 'var(--primary)',
                      lineHeight: '1.2'
                    }}>
                      {st.num}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      fontWeight: '600',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}>
                      <Icon size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
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
        const badges = (settings.techBadges || 'Hammer Strength, Eleiko Platforms, Cryotherapy, InBody BioSignature')
          .split(',')
          .map(b => b.trim())
          .filter(Boolean);

        const bullets = [
          settings.h1 || 'Olympic lifting platforms with calibrated competition plates',
          settings.h2 || 'Dedicated cardio theatre with real-time biometric tracking',
          settings.h3 || 'Infrared saunas, cold plunge tubs & hydro-massage lounges',
          settings.h4 || 'Complimentary premium towel service & organic smoothie bar'
        ].filter(b => Boolean(b && b.trim()));

        return (
          <section key={node.id} style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{
              padding: responsiveMode === 'mobile' ? '48px 20px' : '72px 24px',
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: responsiveMode === 'mobile' ? '1fr' : '1.1fr 0.9fr',
                gap: '40px',
                alignItems: 'center'
              }}>
                {/* Left Column: Details */}
                <div>
                  {settings.showBadge !== false && Boolean(settings.badge) && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: 'var(--primary)',
                      letterSpacing: '2px',
                      textTransform: 'uppercase'
                    }}>
                      {settings.badge}
                    </span>
                  )}

                  <h2 style={{
                    fontSize: responsiveMode === 'mobile' ? '1.7rem' : 'clamp(1.8rem, 3.5vw, 2.5rem)',
                    fontWeight: '900',
                    color: '#ffffff',
                    margin: '8px 0 16px'
                  }}>
                    {renderHighlightedTitle(settings.title || 'Next-Level Facilities Built for Serious Results', settings.highlightWord || 'Serious Results')}
                  </h2>

                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    lineHeight: '1.6',
                    marginBottom: '24px'
                  }}>
                    {settings.description || 'Whether your focus is powerlifting, functional HIIT, athletic conditioning, or hypertrophy, our facility delivers unmatched equipment quality.'}
                  </p>

                  {/* Tech Pills */}
                  {settings.showTechBadges !== false && badges.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                      {badges.map((badge, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: 'var(--primary)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={12} />
                          <span>{badge}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Highlights List */}
                  {settings.showBullets !== false && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {bullets.map((b, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--accent-emerald)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <CheckCircle2 size={13} />
                          </div>
                          <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>
                            {b}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Visual Image Showcase */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    border: '1px solid var(--border-glass)'
                  }}>
                    <img
                      src={getMediaUrl(settings.imageUrl || 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1000&q=80')}
                      alt="Facility Showcase"
                      style={{ width: '100%', height: '340px', objectFit: 'cover', display: 'block' }}
                    />
                  </div>

                  {settings.showBadgeCard !== false && Boolean(settings.badgeCardTitle) && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-16px',
                      left: '16px',
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Shield size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                          {settings.badgeCardTitle}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {settings.badgeCardSubtitle || 'Certified Training Facility'}
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
        const tabs = [
          {
            tab: settings.p1Tab || 'Hypertrophy & Strength',
            title: settings.p1Title || 'Progressive Overload & Strength Mastery',
            desc: settings.p1Desc || 'Structured compound lifting protocols designed by biomechanical coaches.',
            img: getMediaUrl(settings.p1Image || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'),
            specCore: settings.p1SpecCore || 'Hypertrophy & Raw Strength',
            specBarb: settings.p1SpecBarb || '60-Minute Guided Protocol',
            specCoating: settings.p1SpecCoating || 'Eleiko Platforms & Dumbbells up to 150 lbs',
            specTensile: settings.p1SpecTensile || '1:1 Coaching or Small Group (Max 4 Lifters)'
          },
          {
            tab: settings.p2Tab || 'High-Intensity HIIT',
            title: settings.p2Title || 'Metabolic Conditioning & Caloric Burn',
            desc: settings.p2Desc || 'Heart-rate tracked interval circuits that scorch calories while boosting athletic endurance.',
            img: getMediaUrl(settings.p2Image || 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'),
            specCore: settings.p2SpecCore || 'Fat Oxidation & VO2 Max Boost',
            specBarb: settings.p2SpecBarb || '45-Minute High-Tempo Circuit',
            specCoating: settings.p2SpecCoating || 'Assault AirBikes, SkiErgs & Plyo Towers',
            specTensile: settings.p2SpecTensile || 'Group Format with Live Heart Rate Monitors'
          },
          {
            tab: settings.p3Tab || 'Mobility & Recovery',
            title: settings.p3Title || 'Athletic Longevity & Postural Alignment',
            desc: settings.p3Desc || 'Myofascial release, dynamic stretch therapy, and cold plunge immersion.',
            img: getMediaUrl(settings.p3Image || 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80'),
            specCore: settings.p3SpecCore || 'Injury Prevention & Joint Decompression',
            specBarb: settings.p3SpecBarb || '50-Minute Specialist Session',
            specCoating: settings.p3SpecCoating || 'Normatec Compression, Cryo & Infrared Sauna',
            specTensile: settings.p3SpecTensile || 'Certified Physical Recovery Specialists'
          }
        ];

        const activeProduct = tabs[activeProdTab] || tabs[0];

        return (
          <section key={node.id} style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{
              padding: responsiveMode === 'mobile' ? '48px 20px' : '72px 24px',
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%'
            }}>
              {settings.showBadge !== false && Boolean(settings.badge) && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: responsiveMode === 'mobile' ? '1.7rem' : 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', color: '#fff', margin: '8px 0 24px' }}>
                {renderHighlightedTitle(settings.title || 'World-Class Training Programs', settings.highlightWord || 'Training Programs')}
              </h2>

              {/* Tab Pill Buttons */}
              <div style={{
                display: 'flex',
                gap: '6px',
                background: 'var(--bg-surface-elevated)',
                padding: '6px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '32px',
                overflowX: 'auto'
              }}>
                {tabs.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveProdTab(idx)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: responsiveMode === 'mobile' ? '1fr' : '1fr 1fr',
                gap: '32px',
                alignItems: 'center',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: responsiveMode === 'mobile' ? '20px' : '32px'
              }}>
                <div>
                  <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                    <img src={activeProduct.img} alt={activeProduct.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                    {activeProduct.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    {activeProduct.desc}
                  </p>
                </div>

                {/* Specs Table */}
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                    Program Breakdown & Specs
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Core Objective</span>
                      <span style={{ fontWeight: '700', color: '#fff' }}>{activeProduct.specCore}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Session Duration</span>
                      <span style={{ fontWeight: '700', color: '#fff' }}>{activeProduct.specBarb}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Equipment Zone</span>
                      <span style={{ fontWeight: '700', color: '#fff' }}>{activeProduct.specCoating}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Format & Ratio</span>
                      <span style={{ fontWeight: '700', color: 'var(--accent-emerald)' }}>{activeProduct.specTensile}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      // ── 6. COMPARISON TABLE ──
      case 'comparison_table': {
        const rows = [
          { feat: settings.r1Feature || 'Equipment Quality & Availability', us: settings.r1Us || '100% Eleiko & Hammer Strength (Zero Waiting)', them: settings.r1Them || 'Generic Machines (Frequently Broken & Queued)' },
          { feat: settings.r2Feature || 'Coaching & Trainer Credentials', us: settings.r2Us || 'CSCS Certified & Exercise Science Degrees', them: settings.r2Them || 'Weekend Online Certified Instructors' },
          { feat: settings.r3Feature || 'Recovery Suites (Sauna & Cold Plunge)', us: settings.r3Us || 'Unlimited Infrared Sauna & Ice Baths Included', them: settings.r3Them || 'Extra $50 - $100/Month Add-on Fee' },
          { feat: settings.r4Feature || 'Facility Cleanliness & Sanitation', us: settings.r4Us || 'Continuous Antimicrobial Air & Surface Cleaning', them: settings.r4Them || 'Overcrowded, Dirty Locker Rooms' },
          { feat: settings.r5Feature || 'Peak Hours Member Density', us: settings.r5Us || 'Strict Capacity Caps for Spaced Workouts', them: settings.r5Them || 'Oversold Memberships & Long Wait Times' }
        ];

        return (
          <section key={node.id} style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{
              padding: responsiveMode === 'mobile' ? '48px 20px' : '72px 24px',
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%'
            }}>
              {settings.showBadge !== false && Boolean(settings.badge) && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: responsiveMode === 'mobile' ? '1.7rem' : 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', color: '#fff', margin: '8px 0 32px' }}>
                {renderHighlightedTitle(settings.title || 'Why Athletes Choose Us over Generic Alternatives', settings.highlightWord || 'Generic Alternatives')}
              </h2>

              <div style={{
                background: 'var(--bg-surface)',
                borderRadius: '16px',
                border: '1px solid var(--border-glass)',
                overflowX: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}>
                <table style={{ width: '100%', minWidth: responsiveMode === 'mobile' ? '480px' : '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: '#94a3b8' }}>FEATURE</th>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--primary)', background: 'rgba(56, 189, 248, 0.08)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Star size={13} fill="var(--primary)" color="var(--primary)" />
                          <span>{settings.brandColName || 'Our Standard'}</span>
                        </span>
                      </th>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: '#fda4af' }}>
                        {settings.competitorColName || 'Competitor Chains'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                          {row.feat}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: 'var(--accent-emerald)', background: 'rgba(56, 189, 248, 0.04)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={16} style={{ flexShrink: 0, color: 'var(--accent-emerald)' }} />
                            <span>{cleanCompText(row.us)}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#fda4af' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <XCircle size={16} style={{ flexShrink: 0, color: '#f87171' }} />
                            <span>{cleanCompText(row.them)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      }

      // ── 7. APPLICATIONS GRID ──
      case 'applications_grid': {
        const apps = [
          { title: settings.a1Title || 'Highways & Infrastructure', desc: settings.a1Desc || 'Crash-resistant highway median barriers.', img: getMediaUrl(settings.a1Image || 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=600&q=80') },
          { title: settings.a2Title || 'Airports & Military Defense', desc: settings.a2Desc || 'Heavy razor concertina barriers for secure perimeter control.', img: getMediaUrl(settings.a2Image || 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80') },
          { title: settings.a3Title || 'Agricultural & Farmland', desc: settings.a3Desc || 'Long-span cattle fence and anti-wildlife barriers.', img: getMediaUrl(settings.a3Image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80') }
        ];

        return (
          <section key={node.id} style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{ padding: responsiveMode === 'mobile' ? '48px 20px' : '72px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              {settings.showBadge !== false && Boolean(settings.badge) && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: responsiveMode === 'mobile' ? '1.7rem' : 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', color: '#fff', margin: '8px 0 32px' }}>
                {renderHighlightedTitle(settings.title || 'Proven in Every High-Security Application', settings.highlightWord || 'High-Security')}
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: responsiveMode === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {apps.map((app, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ height: '180px', overflow: 'hidden' }}>
                      <img src={app.img} alt={app.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>{app.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{app.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ── 8. TECH INNOVATION ──
      case 'tech_innovation': {
        const cards = [
          { title: settings.t1Title || 'Thermal Fusion Bonding', tag: settings.t1Tag || 'THERMAL PROCESS', desc: settings.t1Desc || 'Dual-phase temperature bonding creates an molecular seal.', img: getMediaUrl(settings.t1Image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80') },
          { title: settings.t2Title || 'Automated CNC Weaving', tag: settings.t2Tag || 'ROBOTIC PRECISION', desc: settings.t2Desc || 'State-of-the-art multi-axis CNC machines guarantee uniform aperture dimensions.', img: getMediaUrl(settings.t2Image || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80') },
          { title: settings.t3Title || 'Accelerated Salt-Spray Testing', tag: settings.t3Tag || 'LAB VERIFIED', desc: settings.t3Desc || 'Subjected to 1,000+ hours of continuous ASTM B117 salt spray testing with zero rust.', img: getMediaUrl(settings.t3Image || 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=600&q=80') }
        ];

        return (
          <section key={node.id} style={{ width: '100%', background: settings.background || 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)' }}>
            <div style={{ padding: responsiveMode === 'mobile' ? '48px 20px' : '72px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              {settings.showBadge !== false && Boolean(settings.badge) && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: responsiveMode === 'mobile' ? '1.7rem' : 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', color: '#fff', margin: '8px 0 32px' }}>
                {renderHighlightedTitle(settings.title || 'Precision Metallurgy & Manufacturing Innovation', settings.highlightWord || 'Innovation')}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: responsiveMode === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {cards.map((card, idx) => (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ height: '160px', overflow: 'hidden' }}>
                      <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '20px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '1px' }}>
                        {card.tag}
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: '10px 0 8px' }}>{card.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ── 9. TESTIMONIAL GRID ──
      case 'testimonial_grid': {
        const reviews = [
          { name: settings.t1Name || 'Marcus Vance', role: settings.t1Role || 'Competitive Powerlifter', quote: settings.t1Quote || 'The calibrated Eleiko plates, multiple monolifts, and community of dedicated lifters make IronPulse the premier strength facility.', photo: settings.t1Photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: settings.t2Name || 'Sarah Jenkins', role: settings.t2Role || 'Marathoner & Triathlete', quote: settings.t2Quote || 'The recovery lounge with cold plunges and Normatec compression cut my marathon recovery time in half.', photo: settings.t2Photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
          { name: settings.t3Name || 'David Chen', role: settings.t3Role || 'Tech Executive', quote: settings.t3Quote || 'Down 28 lbs in 4 months with tailored metabolic coaching. Flexible 24/7 keycard access fits my schedule perfectly.', photo: settings.t3Photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }
        ];

        return (
          <section key={node.id} style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{ padding: responsiveMode === 'mobile' ? '48px 20px' : '72px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              {settings.showBadge !== false && Boolean(settings.badge) && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: responsiveMode === 'mobile' ? '1.7rem' : 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', color: '#fff', margin: '8px 0 32px' }}>
                {settings.title || 'Real Results from Dedicated Members'}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: responsiveMode === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {reviews.map((r, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px' }}>
                    {settings.showStars !== false && (
                      <div style={{ display: 'flex', gap: '3px', color: '#f59e0b', marginBottom: '14px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={15} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                    )}
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                      "{r.quote}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {r.photo && <img src={r.photo} alt={r.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
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

      // ── 10. FAQ ACCORDION ──
      case 'faq_section': {
        const faqs = [
          { q: settings.q1 || 'Can I try the facility before committing to a membership?', a: settings.a1 || 'Yes! We offer a 3-Day VIP All-Access Trial Pass so you can experience our equipment, recovery suites, and group training classes with zero commitment.' },
          { q: settings.q2 || 'What are your facility operating hours?', a: settings.a2 || 'Members enjoy 24/7 keycard access 365 days a year. Front desk staff, trainers, and recovery suites are staffed daily.' },
          { q: settings.q3 || 'Is personal coaching included in membership?', a: settings.a3 || 'All new memberships include two complimentary 60-minute 1-on-1 goal assessment sessions and InBody 570 biometric body composition scans.' },
          { q: settings.q4 || 'Can I freeze or cancel my membership anytime?', a: settings.a4 || 'Yes, we offer flexible month-to-month memberships with no long-term contracts and hassle-free account freezing.' }
        ];

        return (
          <section key={node.id} style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{ padding: responsiveMode === 'mobile' ? '48px 20px' : '72px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              <div style={{ maxWidth: '840px', margin: '0 auto' }}>
                {settings.showBadge !== false && Boolean(settings.badge) && (
                  <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {settings.badge}
                  </div>
                )}
                <h2 style={{ textAlign: 'center', fontSize: responsiveMode === 'mobile' ? '1.7rem' : 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', color: '#fff', marginBottom: '32px' }}>
                  {settings.title || 'Frequently Asked Questions'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {faqs.map((f, idx) => {
                    const isOpen = activeFaqIndex === idx;
                    return (
                      <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '12px', overflow: 'hidden' }}>
                        <div
                          onClick={() => setActiveFaqIndex(isOpen ? -1 : idx)}
                          style={{
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '14px',
                            color: isOpen ? 'var(--primary)' : '#fff'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <HelpCircle size={16} color="var(--primary)" />
                            <span>{f.q}</span>
                          </div>
                          <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
                        </div>
                        {isOpen && (
                          <div style={{ padding: '0 20px 18px 46px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
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

      // ── 11. CONTACT SPLIT SECTION ──
      case 'contact_split': {
        const prodOptions = (settings.productsList || '3-Day VIP Pass, 1-on-1 Personal Training, Olympic Lifting Coaching, Corporate Group Pass')
          .split(',')
          .map(p => p.trim())
          .filter(Boolean);

        return (
          <section key={node.id} style={{ width: '100%', background: settings.background || 'transparent' }}>
            <div style={{ padding: responsiveMode === 'mobile' ? '48px 20px' : '72px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              {settings.showBadge !== false && Boolean(settings.badge) && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {settings.badge}
                </span>
              )}
              <h2 style={{ fontSize: responsiveMode === 'mobile' ? '1.7rem' : 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', color: '#fff', margin: '8px 0 32px' }}>
                {renderHighlightedTitle(settings.title || 'Claim Your 3-Day VIP Pass Today', settings.highlightWord || 'VIP Pass')}
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: responsiveMode === 'mobile' ? '1fr' : '1fr 1.1fr',
                gap: '32px',
                alignItems: 'start'
              }}>
                {/* Left: Contact Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '14px', background: 'var(--bg-surface)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>Email Address</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{settings.email || 'membership@ironpulsefitness.com'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', background: 'var(--bg-surface)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>Direct Phone Hotline</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{settings.phone || '+1 (555) 839-4488'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', background: 'var(--bg-surface)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>Facility Location</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{settings.address || '742 Fitness Boulevard, Suite 100'}</div>
                    </div>
                  </div>
                </div>

                {/* Right: Lead Form */}
                <div style={{
                  background: 'var(--bg-surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-glass)',
                  padding: responsiveMode === 'mobile' ? '20px' : '28px'
                }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
                    {settings.formTitle || 'Get Your Free 3-Day VIP Pass'}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                    {settings.formSubtitle || 'Enter your details below and your instant pass will be emailed immediately.'}
                  </p>

                  <form onSubmit={(e) => { e.preventDefault(); alert('Pass request submitted! Check your email.'); }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input type="text" className="form-input" placeholder="Full Name" required />
                      <input type="email" className="form-input" placeholder="Email Address" required />
                      <input type="tel" className="form-input" placeholder="Phone Number" required />
                      
                      <select className="form-input" style={{ background: 'var(--bg-surface-elevated)' }}>
                        {prodOptions.map((opt, idx) => (
                          <option key={idx} value={opt}>{opt}</option>
                        ))}
                      </select>
                      
                      <button type="submit" className="btn btn-primary" style={{ padding: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Send size={14} />
                        <span>Claim Free Pass Now</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        );
      }

      // ── 12. ENTERPRISE FOOTER ──
      case 'enterprise_footer': {
        const col1Links = (settings.col1Links || 'Strength & Power, HIIT Conditioning, Athlete Recovery, Personal Coaching')
          .split(',').map(l => l.trim()).filter(Boolean);
        const col2Links = (settings.col2Links || 'About Club, Facilities, Class Schedule, Memberships, Free Pass')
          .split(',').map(l => l.trim()).filter(Boolean);

        return (
          <footer key={node.id} style={{
            background: settings.background || '#04060a',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '50px 24px 20px',
            width: '100%',
            color: 'var(--text-muted)'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: responsiveMode === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '32px',
              paddingBottom: '32px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              {/* Brand Column */}
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--primary)', color: '#070a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={15} />
                  </div>
                  <span>{settings.brandName || 'IronPulse Fitness'}</span>
                </div>
                <p style={{ fontSize: '12px', lineHeight: '1.6', marginBottom: '16px' }}>
                  {settings.tagline || 'Elite 24/7 strength training, functional conditioning, and athlete recovery club.'}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[Globe, Share2, Mail, ExternalLink].map((Icon, idx) => (
                    <div key={idx} style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Icon size={13} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 1 */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', marginBottom: '14px' }}>
                  {settings.col1Title || 'Programs'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  {col1Links.map((l, idx) => (
                    <span key={idx} style={{ color: 'var(--text-muted)' }}>{l}</span>
                  ))}
                </div>
              </div>

              {/* Col 2 */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', marginBottom: '14px' }}>
                  {settings.col2Title || 'Quick Links'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  {col2Links.map((l, idx) => (
                    <span key={idx} style={{ color: 'var(--text-muted)' }}>{l}</span>
                  ))}
                </div>
              </div>

              {/* Col 3 */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', marginBottom: '14px' }}>
                  {settings.col3Title || 'Location & Hours'}
                </h4>
                <div style={{ fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {settings.col3Info || '742 Fitness Boulevard, Suite 100\nPhone: +1 (555) 839-4488\n24/7 Member Keycard Access'}
                </div>
              </div>
            </div>

            <div style={{
              maxWidth: '1200px',
              margin: '16px auto 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '11px',
              color: 'var(--text-dim)'
            }}>
              <div>{settings.copyright || '© 2026 IronPulse Fitness Ltd. All rights reserved.'}</div>
              <div style={{ display: 'flex', gap: '14px' }}>
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
              </div>
            </div>
          </footer>
        );
      }

      case 'video': {
        const rawUrl = settings.url || '';
        if (!rawUrl) return null;

        const isEmbed = settings.sourceType === 'embed' || rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be') || rawUrl.includes('vimeo.com');

        const getEmbedSrc = (url) => {
          if (url.includes('youtube.com/watch?v=')) {
            return url.replace('watch?v=', 'embed/');
          }
          if (url.includes('youtu.be/')) {
            const id = url.split('youtu.be/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${id}`;
          }
          if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
            const id = url.split('vimeo.com/')[1]?.split('?')[0];
            return `https://player.vimeo.com/video/${id}`;
          }
          return url;
        };

        return (
          <div key={node.id} style={{
            width: '100%',
            maxWidth: settings.maxWidth || '100%',
            borderRadius: settings.borderRadius || '12px',
            overflow: 'hidden',
            aspectRatio: settings.aspectRatio || '16/9',
            background: '#000',
            position: 'relative',
            margin: '0 auto'
          }}>
            {isEmbed ? (
              <iframe
                src={getEmbedSrc(rawUrl)}
                title="Video player"
                style={{ width: '100%', height: '100%', border: 0, position: 'absolute', inset: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={getMediaUrl(rawUrl)}
                poster={settings.poster ? getMediaUrl(settings.poster) : undefined}
                controls={settings.controls === true || settings.controls === 'true'}
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                disableRemotePlayback
                autoPlay={settings.autoplay !== false && settings.autoplay !== 'false'}
                loop={settings.loop !== false && settings.loop !== 'false'}
                muted={settings.muted !== false && settings.muted !== 'false'}
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
          </div>
        );
      }

      // Container / Section or Root
      case 'container':
      case 'section': {
        const children = node.children || [];
        return (
          <div key={node.id} style={{ width: '100%', background: settings.background || 'transparent' }}>
            {children.map(child => renderWidget(child))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Render Root Container
  const children = content.children || [];

  return (
    <div style={{
      width: '100%',
      background: content.settings?.background || '#070a0f',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {children.map(child => renderWidget(child))}
    </div>
  );
}
