/**
 * LightBuilder - Enterprise Widget Registry & Section Definitions
 */

export const WIDGET_CATEGORIES = [
  { id: 'layout', name: 'Layout & Sections' },
  { id: 'sections', name: 'Enterprise Sections' },
  { id: 'social', name: 'Social Proof & FAQ' },
  { id: 'basic', name: 'Basic Elements' },
  { id: 'advanced', name: 'Advanced & Code' }
];

export const WIDGET_REGISTRY = {
  // ── 0. SECTION (Primary Multi-Section Container) ──
  section: {
    type: 'section',
    name: 'Section',
    category: 'layout',
    icon: 'Layers',
    isContainer: true,
    defaultSettings: {
      sectionId: '',
      direction: 'column',
      align: 'stretch',
      justify: 'flex-start',
      gap: '0px',
      padding: { top: '60px', right: '24px', bottom: '60px', left: '24px' },
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      background: '#070a0f',
      bgImage: '',
      bgSize: 'cover',
      bgPosition: 'center',
      minHeight: 'auto',
      maxWidth: '100%',
      borderRadius: '0px'
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content', placeholder: 'e.g. hero, about, contact' },
      {
        name: 'direction',
        label: 'Layout Direction',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'Vertical (Column)', value: 'column' },
          { label: 'Horizontal (Row)', value: 'row' }
        ]
      },
      {
        name: 'align',
        label: 'Align Items',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'Stretch', value: 'stretch' },
          { label: 'Start (Left / Top)', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'End (Right / Bottom)', value: 'flex-end' }
        ]
      },
      {
        name: 'justify',
        label: 'Justify Content',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'Space Between', value: 'space-between' },
          { label: 'End', value: 'flex-end' }
        ]
      },
      { name: 'gap', label: 'Item Spacing (Gap)', type: 'text', tab: 'content', placeholder: '0px' },
      { name: 'minHeight', label: 'Minimum Height', type: 'text', tab: 'content', placeholder: 'auto or 100vh' },
      { name: 'maxWidth', label: 'Max Content Width', type: 'text', tab: 'content', placeholder: '100% or 1200px' },
      { name: 'background', label: 'Background Color', type: 'color', tab: 'style' },
      { name: 'bgImage', label: 'Background Image URL', type: 'image', tab: 'style' },
      { name: 'padding', label: 'Section Padding', type: 'spacing', tab: 'style' },
      { name: 'margin', label: 'Section Margin', type: 'spacing', tab: 'style' },
      { name: 'borderRadius', label: 'Corner Radius', type: 'text', tab: 'style', placeholder: '0px' }
    ]
  },

  // ── CONTAINER (Layout Container) ──
  container: {
    type: 'container',
    name: 'Container',
    category: 'layout',
    icon: 'Box',
    isContainer: true,
    defaultSettings: {
      sectionId: '',
      direction: 'column',
      align: 'stretch',
      justify: 'flex-start',
      gap: '0px',
      padding: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      background: 'transparent',
      minHeight: 'auto',
      maxWidth: '100%',
      borderRadius: '0px'
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content', placeholder: 'e.g. section-1' },
      {
        name: 'direction',
        label: 'Flex Direction',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'Column (Vertical)', value: 'column' },
          { label: 'Row (Horizontal)', value: 'row' }
        ]
      },
      {
        name: 'align',
        label: 'Align Items',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'Stretch', value: 'stretch' },
          { label: 'Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'flex-end' }
        ]
      },
      { name: 'gap', label: 'Gap Between Items', type: 'text', tab: 'content', placeholder: '0px' },
      { name: 'background', label: 'Background Color', type: 'color', tab: 'style' },
      { name: 'padding', label: 'Padding', type: 'spacing', tab: 'style' },
      { name: 'margin', label: 'Margin', type: 'spacing', tab: 'style' }
    ]
  },

  // ── 1. NAV HEADER ──
  nav_header: {
    type: 'nav_header',
    name: 'Navbar Header',
    category: 'sections',
    icon: 'Globe',
    defaultSettings: {
      sectionId: 'navbar',
      brandName: 'BrandName',
      logoUrl: '',
      showBrandText: true,
      links: 'About, Products, Features, Contact',
      showCatalogBtn: true,
      catalogText: 'Brochure',
      catalogUrl: '#contact',
      showCtaBtn: true,
      ctaText: 'Get Quote',
      ctaUrl: '#contact',
      background: 'rgba(15, 23, 42, 0.85)',
      isSticky: true,
      logoHeight: '38px',
      logoWidth: '160px',
      logoFit: 'contain'
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'brandName', label: 'Brand Name', type: 'text', tab: 'content' },
      { name: 'showBrandText', label: 'Show Brand Name Text', type: 'toggle', tab: 'content' },
      { name: 'logoUrl', label: 'Logo Image URL', type: 'image', tab: 'content' },
      { name: 'links', label: 'Navigation Links (comma separated)', type: 'text', tab: 'content' },
      { name: 'showCatalogBtn', label: 'Show Brochure / Secondary Button', type: 'toggle', tab: 'content' },
      { name: 'catalogText', label: 'Brochure Button Text', type: 'text', tab: 'content' },
      { name: 'catalogUrl', label: 'Brochure Button URL', type: 'text', tab: 'content' },
      { name: 'showCtaBtn', label: 'Show Primary CTA Button', type: 'toggle', tab: 'content' },
      { name: 'ctaText', label: 'Primary CTA Text', type: 'text', tab: 'content' },
      { name: 'ctaUrl', label: 'Primary CTA URL', type: 'text', tab: 'content' },
      { name: 'isSticky', label: 'Sticky Header on Scroll', type: 'toggle', tab: 'style' },
      { name: 'background', label: 'Navbar Background', type: 'color', tab: 'style' },
      { name: 'logoHeight', label: 'Logo Height (e.g. 38px, 45px)', type: 'text', tab: 'advanced' },
      { name: 'logoWidth', label: 'Logo Max Width (e.g. 160px, 200px, auto)', type: 'text', tab: 'advanced' },
      { name: 'logoFit', label: 'Logo Object Fit', type: 'select', options: [
        { label: 'Contain (Recommended)', value: 'contain' },
        { label: 'Cover', value: 'cover' },
        { label: 'Fill', value: 'fill' },
        { label: 'Scale Down', value: 'scale-down' }
      ], tab: 'advanced' }
    ]
  },

  // ── 2. HERO SLIDER ──
  hero_slider: {
    type: 'hero_slider',
    name: 'Hero Slider',
    category: 'sections',
    icon: 'Sparkles',
    defaultSettings: {
      sectionId: 'hero',
      showTag: true,
      tag: 'WELCOME TO OUR PLATFORM',
      title: 'Build Your Next Digital Experience',
      italicWords: 'Digital Experience',
      showDescription: true,
      description: 'Create high-converting landing experiences with modern layout architecture, blazing performance, and beautiful components.',
      showPrimaryBtn: true,
      primaryBtnText: 'Get Started',
      primaryBtnUrl: '#products',
      showSecondaryBtn: true,
      secondaryBtnText: 'Contact Us',
      secondaryBtnUrl: '#contact',
      showSlideControls: true,
      slides: [
        { image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80', title: 'High Tensile Fencing', subtitle: 'Superior rust protection with epoxy polymer technology' },
        { image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80', title: 'Modular Industrial Mesh', subtitle: 'Engineered for extreme durability and precision standards' },
        { image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=80', title: 'Perimeter Defense Solutions', subtitle: 'Trusted across nationwide infrastructure projects' }
      ]
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'showTag', label: 'Show Eyebrow Badge', type: 'toggle', tab: 'content' },
      { name: 'tag', label: 'Eyebrow Tag', type: 'text', tab: 'content' },
      { name: 'title', label: 'Hero Headline', type: 'text', tab: 'content' },
      { name: 'italicWords', label: 'Highlighted Span Text', type: 'text', tab: 'content' },
      { name: 'showDescription', label: 'Show Subtitle Description', type: 'toggle', tab: 'content' },
      { name: 'description', label: 'Subtitle Description', type: 'textarea', tab: 'content' },
      { name: 'showPrimaryBtn', label: 'Show Primary CTA Button', type: 'toggle', tab: 'content' },
      { name: 'primaryBtnText', label: 'Primary CTA Text', type: 'text', tab: 'content' },
      { name: 'primaryBtnUrl', label: 'Primary CTA URL', type: 'text', tab: 'content' },
      { name: 'showSecondaryBtn', label: 'Show Secondary Action Button', type: 'toggle', tab: 'content' },
      { name: 'secondaryBtnText', label: 'Secondary CTA Text', type: 'text', tab: 'content' },
      { name: 'secondaryBtnUrl', label: 'Secondary CTA URL', type: 'text', tab: 'content' },
      { name: 'showSlideControls', label: 'Show Slide Navigation (Arrows & Dots)', type: 'toggle', tab: 'content' },
      {
        name: 'slides',
        label: 'Slides & Media',
        type: 'repeater',
        tab: 'content',
        itemTitleField: 'title',
        defaultItem: { image: '', title: 'New Slide', subtitle: 'Slide description' },
        fields: [
          { name: 'title', label: 'Slide Title / Caption', type: 'text' },
          { name: 'subtitle', label: 'Slide Subtitle', type: 'text' },
          { name: 'image', label: 'Slide Background Image / Video Poster', type: 'image' }
        ]
      }
    ]
  },

  // ── 3. ANIMATED STATS BAR ──
  animated_stats_bar: {
    type: 'animated_stats_bar',
    name: 'Stats Metric Bar',
    category: 'sections',
    icon: 'Activity',
    defaultSettings: {
      sectionId: 'stats',
      background: '#0f172a',
      stats: [
        { number: '10K+', label: 'Active Clients' },
        { number: '99.9%', label: 'Satisfaction Rate' },
        { number: '500+', label: 'Projects Completed' },
        { number: '24/7', label: 'Dedicated Support' }
      ]
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'background', label: 'Background Color', type: 'color', tab: 'style' },
      {
        name: 'stats',
        label: 'Metric Counters',
        type: 'repeater',
        tab: 'content',
        itemTitleField: 'label',
        defaultItem: { number: '100+', label: 'Metric Name' },
        fields: [
          { name: 'number', label: 'Metric Value', type: 'text' },
          { name: 'label', label: 'Metric Label', type: 'text' }
        ]
      }
    ]
  },

  // ── 4. ABOUT SHOWCASE ──
  about_showcase: {
    type: 'about_showcase',
    name: 'About Showcase',
    category: 'sections',
    icon: 'Shield',
    defaultSettings: {
      sectionId: 'about',
      showBadge: true,
      badge: 'ABOUT OUR COMPANY',
      title: 'Delivering Quality and Scalable Solutions',
      highlightWord: 'Scalable Solutions',
      description: 'We provide cutting-edge solutions designed to help your business scale efficiently with high reliability and top-tier performance.',
      showTechBadges: true,
      techBadges: 'Certified Quality, Secure Architecture, Fast Deployment, 24/7 Support',
      showBullets: true,
      h1: 'Enterprise-grade reliability and security standards',
      h2: 'Custom infrastructure built for your exact needs',
      h3: 'Precision engineered with modern methodologies',
      h4: 'Dedicated team of industry domain specialists',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      showBadgeCard: true,
      badgeCardTitle: 'Industry Certified',
      badgeCardSubtitle: 'International Quality Standards'
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'showBadge', label: 'Show Eyebrow Badge', type: 'toggle', tab: 'content' },
      { name: 'badge', label: 'Eyebrow Badge', type: 'text', tab: 'content' },
      { name: 'title', label: 'Section Headline', type: 'text', tab: 'content' },
      { name: 'highlightWord', label: 'Highlighted Span Text', type: 'text', tab: 'content' },
      { name: 'description', label: 'Main Paragraph', type: 'textarea', tab: 'content' },
      { name: 'showTechBadges', label: 'Show Tech Chips Row', type: 'toggle', tab: 'content' },
      { name: 'techBadges', label: 'Tech Badges (comma separated)', type: 'text', tab: 'content' },
      { name: 'showBullets', label: 'Show Highlight Bullet List', type: 'toggle', tab: 'content' },
      { name: 'h1', label: 'Highlight Bullet 1', type: 'text', tab: 'content' },
      { name: 'h2', label: 'Highlight Bullet 2', type: 'text', tab: 'content' },
      { name: 'h3', label: 'Highlight Bullet 3', type: 'text', tab: 'content' },
      { name: 'h4', label: 'Highlight Bullet 4', type: 'text', tab: 'content' },
      { name: 'imageUrl', label: 'Showcase Image / Video URL', type: 'image', tab: 'content' },
      { name: 'showBadgeCard', label: 'Show Quality Badge Card', type: 'toggle', tab: 'content' },
      { name: 'badgeCardTitle', label: 'Overlay Badge Title', type: 'text', tab: 'content' },
      { name: 'badgeCardSubtitle', label: 'Overlay Badge Subtitle', type: 'text', tab: 'content' }
    ]
  },

  // ── 5. PRODUCT TABS SHOWCASE ──
  product_tabs_showcase: {
    type: 'product_tabs_showcase',
    name: 'Product Tabs Catalog',
    category: 'sections',
    icon: 'Box',
    defaultSettings: {
      sectionId: 'products',
      showBadge: true,
      badge: 'OUR CORE PRODUCTS',
      title: 'Engineered Solutions for Every Project',
      highlightWord: 'Every Project',
      showDatasheetBtn: true,
      showSpecsTable: true,
      tabs: [
        {
          tabName: 'Barbed Wire',
          title: 'High-Tensile Epoxy Barbed Wire',
          description: 'Engineered for border security and industrial facilities with 4-point sharp barbs.',
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          specCore: '2.50mm High Carbon Galvanized',
          specBarb: '2.00mm 4-Point Staggered',
          specCoating: 'Epoxy Polymer / Heavy Zinc (275 gsm)',
          specTensile: '1150 - 1350 MPa'
        },
        {
          tabName: 'Chainlink Fence',
          title: 'Heavy-Duty Diamond Chainlink Mesh',
          description: 'Interwoven diamond pattern delivering maximum structural elasticity and impact absorption.',
          image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
          specCore: '3.15mm - 4.00mm Steel Wire',
          specBarb: 'Knuckled & Barbed Edge Selvage',
          specCoating: 'PVC / Fusion Bonded Epoxy',
          specTensile: '450 - 600 MPa'
        },
        {
          tabName: 'Concertina Coil',
          title: 'Reinforced Razor Concertina Coil',
          description: 'Maximum deterrent concertina razor wire with continuous spiral helical coils.',
          image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80',
          specCore: '2.50mm Spring Steel Wire',
          specBarb: '0.50mm Stainless Steel Razor Blades',
          specCoating: 'Hot Dip Galvanized (Class A)',
          specTensile: '1400 - 1600 MPa'
        }
      ]
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'showBadge', label: 'Show Eyebrow Badge', type: 'toggle', tab: 'content' },
      { name: 'badge', label: 'Eyebrow Badge', type: 'text', tab: 'content' },
      { name: 'title', label: 'Section Headline', type: 'text', tab: 'content' },
      { name: 'highlightWord', label: 'Highlighted Span Text', type: 'text', tab: 'content' },
      { name: 'showDatasheetBtn', label: 'Show Datasheet Button', type: 'toggle', tab: 'content' },
      { name: 'showSpecsTable', label: 'Show Specifications Table', type: 'toggle', tab: 'content' },
      {
        name: 'tabs',
        label: 'Product Catalog Items',
        type: 'repeater',
        tab: 'content',
        itemTitleField: 'tabName',
        defaultItem: {
          tabName: 'New Product',
          title: 'Product Title',
          description: 'Product specifications and details',
          image: '',
          specCore: 'Standard Spec',
          specCoating: 'Protective Finish',
          specTensile: 'High Durability'
        },
        fields: [
          { name: 'tabName', label: 'Tab Button Name', type: 'text' },
          { name: 'title', label: 'Product Title', type: 'text' },
          { name: 'description', label: 'Product Description', type: 'textarea' },
          { name: 'image', label: 'Product Image URL', type: 'image' },
          { name: 'specCore', label: 'Core Specification', type: 'text' },
          { name: 'specCoating', label: 'Coating / Finish Spec', type: 'text' },
          { name: 'specTensile', label: 'Tensile / Rating Spec', type: 'text' }
        ]
      }
    ]
  },

  // ── 6. APPLICATIONS GRID ──
  applications_grid: {
    type: 'applications_grid',
    name: 'Applications Grid',
    category: 'sections',
    icon: 'Grid',
    defaultSettings: {
      sectionId: 'applications',
      showBadge: true,
      badge: 'APPLICATIONS',
      title: 'Versatile Solutions Across Multiple Industries',
      highlightWord: 'Multiple Industries',
      cards: [
        {
          title: 'Commercial & Infrastructure',
          description: 'Built for high-demand commercial operations with robust long-term reliability and compliance.',
          image: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Security & Enterprise',
          description: 'Maximum perimeter protection and access control for restricted installations and properties.',
          image: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Industrial & Large Acreage',
          description: 'Cost-effective, durable barriers designed for expansive perimeters with minimal maintenance.',
          image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'showBadge', label: 'Show Eyebrow Badge', type: 'toggle', tab: 'content' },
      { name: 'badge', label: 'Eyebrow Badge', type: 'text', tab: 'content' },
      { name: 'title', label: 'Section Headline', type: 'text', tab: 'content' },
      { name: 'highlightWord', label: 'Highlighted Word', type: 'text', tab: 'content' },
      {
        name: 'cards',
        label: 'Application Cards',
        type: 'repeater',
        tab: 'content',
        itemTitleField: 'title',
        defaultItem: {
          title: 'New Industry Application',
          description: 'Description of the use case and industry requirements.',
          image: ''
        },
        fields: [
          { name: 'title', label: 'Card Title', type: 'text' },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'image', label: 'Photo URL', type: 'image' }
        ]
      }
    ]
  },

  // ── 7. WHY US COMPARISON TABLE ──
  comparison_table: {
    type: 'comparison_table',
    name: 'Comparison Table (Why Us)',
    category: 'sections',
    icon: 'ListCollapse',
    defaultSettings: {
      sectionId: 'whyus',
      showBadge: true,
      badge: 'THE ADVANTAGE',
      title: 'Why Industry Leaders Choose Our Solutions',
      highlightWord: 'Our Solutions',
      brandColName: 'Our Platform',
      competitorColName: 'Standard Alternatives',
      rows: [
        { feature: 'Anti-Rust Coating Technology', us: '✓ Advanced Epoxy Fusion Barrier', them: '✗ Basic Electro-Galvanized (Fades in 1 yr)' },
        { feature: 'Tensile Breaking Strength', us: '✓ 1250 - 1450 MPa High Carbon', them: '✗ 350 - 500 MPa Mild Steel' },
        { feature: 'Certified Lifespan Guarantee', us: '✓ 20 to 25 Years Tested Lifespan', them: '✗ 2 to 4 Years Before Rusting' },
        { feature: 'Uniform Wire Gauge Tolerance', us: '✓ ±0.02mm Strict Laser Quality Tested', them: '✗ Inconsistent Thickness & Spliced' },
        { feature: 'Factory Direct Testing & ISO Audit', us: '✓ ISO 9001:2015 Certified Lab Reports', them: '✗ No Testing Certifications Provided' }
      ]
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'showBadge', label: 'Show Eyebrow Badge', type: 'toggle', tab: 'content' },
      { name: 'badge', label: 'Eyebrow Badge', type: 'text', tab: 'content' },
      { name: 'title', label: 'Section Headline', type: 'text', tab: 'content' },
      { name: 'highlightWord', label: 'Highlighted Word', type: 'text', tab: 'content' },
      { name: 'brandColName', label: 'Our Brand Column Title', type: 'text', tab: 'content' },
      { name: 'competitorColName', label: 'Competitor Column Title', type: 'text', tab: 'content' },
      {
        name: 'rows',
        label: 'Comparison Rows',
        type: 'repeater',
        tab: 'content',
        itemTitleField: 'feature',
        defaultItem: { feature: 'New Feature', us: '✓ High Performance', them: '✗ Subpar Alternative' },
        fields: [
          { name: 'feature', label: 'Feature / Performance Metric', type: 'text' },
          { name: 'us', label: 'Our Brand Advantage (✓)', type: 'text' },
          { name: 'them', label: 'Competitor Limitation (✗)', type: 'text' }
        ]
      }
    ]
  },

  // ── 8. TECH INNOVATION CARDS ──
  tech_innovation: {
    type: 'tech_innovation',
    name: 'Technology & Innovation',
    category: 'sections',
    icon: 'Zap',
    defaultSettings: {
      sectionId: 'technology',
      showBadge: true,
      badge: 'R&D AND ENGINEERING',
      title: 'Modern Architecture & Continuous Innovation',
      highlightWord: 'Continuous Innovation',
      cards: [
        {
          title: 'Modular Core Engine',
          tag: 'PERFORMANCE',
          description: 'Engineered for high throughput and effortless integration into existing enterprise workflows.',
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Automated Quality Control',
          tag: 'PRECISION',
          description: 'Automated precision checks and strict tolerance testing at every stage of production.',
          image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Rigorous Stress Testing',
          tag: 'VERIFIED',
          description: 'Tested under extreme industrial environmental conditions to guarantee maximum lifespan.',
          image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'showBadge', label: 'Show Eyebrow Badge', type: 'toggle', tab: 'content' },
      { name: 'badge', label: 'Eyebrow Badge', type: 'text', tab: 'content' },
      { name: 'title', label: 'Section Headline', type: 'text', tab: 'content' },
      { name: 'highlightWord', label: 'Highlighted Word', type: 'text', tab: 'content' },
      {
        name: 'cards',
        label: 'Technology & Innovation Items',
        type: 'repeater',
        tab: 'content',
        itemTitleField: 'title',
        defaultItem: {
          title: 'New Innovation Item',
          tag: 'INNOVATION',
          description: 'Engineered for exceptional reliability and performance.',
          image: ''
        },
        fields: [
          { name: 'title', label: 'Card Title', type: 'text' },
          { name: 'tag', label: 'Badge Tag', type: 'text' },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'image', label: 'Card Photo URL', type: 'image' }
        ]
      }
    ]
  },

  // ── 9. CONTACT SPLIT SECTION ──
  contact_split: {
    type: 'contact_split',
    name: 'Contact & Lead Enquiry',
    category: 'sections',
    icon: 'MousePointerClick',
    defaultSettings: {
      sectionId: 'contact',
      showBadge: true,
      badge: 'GET IN TOUCH',
      title: 'Connect with Our Sales & Support Team',
      highlightWord: 'Sales & Support',
      showInfoCards: true,
      email: 'contact@example.com',
      phone: '+1 (555) 123-4567',
      address: '100 Innovation Blvd, Tech District, City',
      hours: 'Mon - Fri: 9:00 AM - 6:00 PM',
      showLeadForm: true,
      formTitle: 'Request an Instant Quote',
      formSubtitle: 'Fill out your requirements and our team will get back to you promptly.',
      productsList: 'Option 1, Option 2, Option 3, Custom Project'
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'showBadge', label: 'Show Eyebrow Badge', type: 'toggle', tab: 'content' },
      { name: 'badge', label: 'Eyebrow Badge', type: 'text', tab: 'content' },
      { name: 'title', label: 'Section Headline', type: 'text', tab: 'content' },
      { name: 'highlightWord', label: 'Highlighted Word', type: 'text', tab: 'content' },
      { name: 'showInfoCards', label: 'Show Contact Details Column', type: 'toggle', tab: 'content' },
      { name: 'email', label: 'Contact Email', type: 'text', tab: 'content' },
      { name: 'phone', label: 'Contact Phone', type: 'text', tab: 'content' },
      { name: 'address', label: 'Office / Facility Address', type: 'textarea', tab: 'content' },
      { name: 'hours', label: 'Working Hours', type: 'text', tab: 'content' },
      { name: 'showLeadForm', label: 'Show Lead / Quote Request Form', type: 'toggle', tab: 'content' },
      { name: 'formTitle', label: 'Form Title', type: 'text', tab: 'content' },
      { name: 'formSubtitle', label: 'Form Subtitle', type: 'textarea', tab: 'content' },
      { name: 'productsList', label: 'Dropdown Options (comma separated)', type: 'text', tab: 'content' }
    ]
  },

  // ── 10. ENTERPRISE FOOTER ──
  enterprise_footer: {
    type: 'enterprise_footer',
    name: 'Enterprise Footer',
    category: 'sections',
    icon: 'Minus',
    defaultSettings: {
      sectionId: 'footer',
      brandName: 'BrandName',
      tagline: 'Delivering modern, scalable, and high-performance digital solutions worldwide.',
      showSocialLinks: true,
      showCol1: true,
      col1Title: 'Products',
      col1Links: 'Solution A, Solution B, Solution C, Documentation',
      showCol2: true,
      col2Title: 'Quick Links',
      col2Links: 'About Us, Applications, Why Us, Technology, Contact',
      showCol3: true,
      col3Title: 'Head Office',
      col3Info: "100 Innovation Blvd\nPhone: +1 (555) 123-4567\nEmail: contact@example.com",
      showLegalLinks: true,
      copyright: '© 2026 BrandName. All rights reserved.'
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'brandName', label: 'Brand Name', type: 'text', tab: 'content' },
      { name: 'tagline', label: 'Brand Tagline', type: 'textarea', tab: 'content' },
      { name: 'showSocialLinks', label: 'Show Social Links', type: 'toggle', tab: 'content' },
      { name: 'showCol1', label: 'Show Column 1 (Products)', type: 'toggle', tab: 'content' },
      { name: 'col1Title', label: 'Column 1 Title', type: 'text', tab: 'content' },
      { name: 'col1Links', label: 'Column 1 Links (comma separated)', type: 'text', tab: 'content' },
      { name: 'showCol2', label: 'Show Column 2 (Quick Links)', type: 'toggle', tab: 'content' },
      { name: 'col2Title', label: 'Column 2 Title', type: 'text', tab: 'content' },
      { name: 'col2Links', label: 'Column 2 Links (comma separated)', type: 'text', tab: 'content' },
      { name: 'showCol3', label: 'Show Column 3 (Head Office)', type: 'toggle', tab: 'content' },
      { name: 'col3Title', label: 'Column 3 Title', type: 'text', tab: 'content' },
      { name: 'col3Info', label: 'Column 3 Info Lines', type: 'textarea', tab: 'content' },
      { name: 'showLegalLinks', label: 'Show Legal / Terms Links', type: 'toggle', tab: 'content' },
      { name: 'copyright', label: 'Copyright Notice', type: 'text', tab: 'content' }
    ]
  },

  // ── 11. TESTIMONIAL GRID ──
  testimonial_grid: {
    type: 'testimonial_grid',
    name: 'Testimonial Reviews Grid',
    category: 'social',
    icon: 'Star',
    defaultSettings: {
      sectionId: 'testimonials',
      showBadge: true,
      badge: 'CLIENT SUCCESS',
      title: 'Trusted by Industry Leaders Worldwide',
      showStars: true,
      reviews: [
        {
          name: 'Rajesh Sharma',
          role: 'Chief Project Engineer',
          quote: 'Tensile consistency and epoxy coating durability exceeded our strict highway safety compliance audits.',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        },
        {
          name: 'Ananya Verma',
          role: 'Procurement Director',
          quote: 'Installed across 450 acres of solar farmland in harsh coastal humidity. Zero rust.',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
        },
        {
          name: 'Vikram Patel',
          role: 'Managing Director',
          quote: 'Superb knuckled selvage finish and on-time dispatch. Best enterprise supplier.',
          photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
        }
      ]
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'showBadge', label: 'Show Eyebrow Badge', type: 'toggle', tab: 'content' },
      { name: 'badge', label: 'Eyebrow Badge', type: 'text', tab: 'content' },
      { name: 'title', label: 'Headline', type: 'text', tab: 'content' },
      { name: 'showStars', label: 'Show Rating Stars', type: 'toggle', tab: 'content' },
      {
        name: 'reviews',
        label: 'Client Testimonials',
        type: 'repeater',
        tab: 'content',
        itemTitleField: 'name',
        defaultItem: { name: 'Client Name', role: 'Company Role', quote: 'Great product and service!', photo: '' },
        fields: [
          { name: 'name', label: 'Reviewer Name', type: 'text' },
          { name: 'role', label: 'Reviewer Role / Title', type: 'text' },
          { name: 'quote', label: 'Testimonial Quote', type: 'textarea' },
          { name: 'photo', label: 'Avatar Photo URL', type: 'image' }
        ]
      }
    ]
  },

  // ── 12. FAQ SECTION ──
  faq_section: {
    type: 'faq_section',
    name: 'FAQ Accordion',
    category: 'social',
    icon: 'ListCollapse',
    defaultSettings: {
      sectionId: 'faq',
      showBadge: true,
      badge: 'FREQUENTLY ASKED',
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'What makes your epoxy coating superior to regular galvanized wire?',
          answer: 'Our fusion-bonded epoxy creates an impermeable polymer barrier that prevents oxygen and moisture from contacting steel core.'
        },
        {
          question: 'Do you provide test certificates with bulk dispatch?',
          answer: 'Yes, every batch is dispatched with comprehensive mill test certificates (MTC).'
        },
        {
          question: 'Can you manufacture custom wire gauges and mesh roll sizes?',
          answer: 'Yes, our automated CNC weaving lines allow customized wire gauges (1.6mm - 4.5mm).'
        },
        {
          question: 'What is the minimum order quantity for enterprise projects?',
          answer: 'We accommodate both standard wholesale quantities and full container loads.'
        }
      ]
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'showBadge', label: 'Show Eyebrow Badge', type: 'toggle', tab: 'content' },
      { name: 'badge', label: 'Eyebrow Badge', type: 'text', tab: 'content' },
      { name: 'title', label: 'Headline', type: 'text', tab: 'content' },
      {
        name: 'items',
        label: 'FAQ Items',
        type: 'repeater',
        tab: 'content',
        itemTitleField: 'question',
        defaultItem: { question: 'New Question?', answer: 'Answer explanation here.' },
        fields: [
          { name: 'question', label: 'Question', type: 'text' },
          { name: 'answer', label: 'Answer Content', type: 'textarea' }
        ]
      }
    ]
  },

  // ── 13. BASIC HEADING ──
  heading: {
    type: 'heading',
    name: 'Heading',
    category: 'basic',
    icon: 'Heading',
    defaultSettings: {
      text: 'Section Title',
      tag: 'h2',
      align: 'left',
      color: '#f8fafc',
      fontSize: { desktop: '36px', tablet: '30px', mobile: '24px' },
      fontWeight: '800'
    },
    controls: [
      { name: 'text', label: 'Heading Text', type: 'text', tab: 'content' },
      {
        name: 'tag',
        label: 'HTML Tag',
        type: 'select',
        tab: 'content',
        options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      },
      {
        name: 'align',
        label: 'Alignment',
        type: 'select',
        tab: 'content',
        options: ['left', 'center', 'right']
      },
      { name: 'color', label: 'Text Color', type: 'color', tab: 'style' },
      { name: 'fontSize', label: 'Font Size', type: 'responsive_text', tab: 'style', placeholder: '36px' }
    ]
  },

  // ── 14. BASIC TEXT ──
  text: {
    type: 'text',
    name: 'Text Block',
    category: 'basic',
    icon: 'AlignLeft',
    defaultSettings: {
      text: '<p>Add descriptive paragraph text here to inform and engage your visitors.</p>',
      align: 'left',
      color: '#94a3b8',
      fontSize: { desktop: '16px', tablet: '15px', mobile: '14px' }
    },
    controls: [
      { name: 'text', label: 'HTML Content', type: 'textarea', tab: 'content' },
      { name: 'color', label: 'Text Color', type: 'color', tab: 'style' },
      { name: 'fontSize', label: 'Font Size', type: 'responsive_text', tab: 'style' }
    ]
  },

  // ── 15. BASIC BUTTON ──
  button: {
    type: 'button',
    name: 'Button',
    category: 'basic',
    icon: 'MousePointerClick',
    defaultSettings: {
      text: 'Click Here',
      url: '#',
      variant: 'primary',
      size: 'medium',
      align: 'left'
    },
    controls: [
      { name: 'text', label: 'Button Text', type: 'text', tab: 'content' },
      { name: 'url', label: 'Link URL', type: 'text', tab: 'content' },
      {
        name: 'variant',
        label: 'Button Style',
        type: 'select',
        tab: 'style',
        options: ['primary', 'secondary', 'outline']
      },
      {
        name: 'align',
        label: 'Alignment',
        type: 'select',
        tab: 'content',
        options: ['left', 'center', 'right']
      }
    ]
  },

  // ── 16. BASIC IMAGE ──
  image: {
    type: 'image',
    name: 'Image',
    category: 'basic',
    icon: 'Image',
    defaultSettings: {
      url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80',
      alt: 'Image showcase',
      borderRadius: '12px',
      maxWidth: '100%'
    },
    controls: [
      { name: 'url', label: 'Image URL', type: 'image', tab: 'content' },
      { name: 'alt', label: 'Alt Text', type: 'text', tab: 'content' },
      { name: 'borderRadius', label: 'Border Radius', type: 'text', tab: 'style' }
    ]
  },

  // ── 16B. VIDEO PLAYER / EMBED ──
  video: {
    type: 'video',
    name: 'Video Player',
    category: 'basic',
    icon: 'Video',
    defaultSettings: {
      sourceType: 'upload', // 'upload' or 'embed'
      url: '',
      poster: '',
      autoplay: true,
      loop: true,
      muted: true,
      controls: false,
      aspectRatio: '16/9',
      borderRadius: '12px',
      maxWidth: '100%'
    },
    controls: [
      {
        name: 'sourceType',
        label: 'Source Type',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'Upload / Direct MP4 URL', value: 'upload' },
          { label: 'YouTube / Vimeo Embed URL', value: 'embed' }
        ]
      },
      { name: 'url', label: 'Video File or Embed URL', type: 'image', tab: 'content' },
      { name: 'poster', label: 'Video Poster Image (Thumbnail)', type: 'image', tab: 'content' },
      {
        name: 'controls',
        label: 'Show Player Controls',
        type: 'boolean',
        tab: 'content'
      },
      {
        name: 'autoplay',
        label: 'Autoplay Video',
        type: 'boolean',
        tab: 'content'
      },
      {
        name: 'loop',
        label: 'Loop Video',
        type: 'boolean',
        tab: 'content'
      },
      {
        name: 'muted',
        label: 'Mute Audio',
        type: 'boolean',
        tab: 'content'
      },
      {
        name: 'aspectRatio',
        label: 'Aspect Ratio',
        type: 'select',
        tab: 'style',
        options: ['16/9', '4/3', '1/1', '21/9', 'auto']
      },
      { name: 'borderRadius', label: 'Border Radius', type: 'text', tab: 'style', placeholder: '12px' },
      { name: 'maxWidth', label: 'Max Width', type: 'text', tab: 'style', placeholder: '100%' }
    ]
  },

  // ── 17. MAP EMBED ──
  map_embed: {
    type: 'map_embed',
    name: 'Google Map',
    category: 'basic',
    icon: 'Globe',
    defaultSettings: {
      sectionId: 'location',
      query: 'San Francisco, CA',
      height: '350px'
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'query', label: 'Location Query / City', type: 'text', tab: 'content' },
      { name: 'height', label: 'Map Height', type: 'text', tab: 'style' }
    ]
  },

  // ── 18. DIVIDER ──
  divider: {
    type: 'divider',
    name: 'Divider Line',
    category: 'layout',
    icon: 'Minus',
    defaultSettings: {
      color: 'rgba(255, 255, 255, 0.1)',
      style: 'solid',
      thickness: '1px',
      margin: '0px'
    },
    controls: [
      { name: 'color', label: 'Line Color', type: 'color', tab: 'style' },
      { name: 'thickness', label: 'Thickness', type: 'text', tab: 'style' }
    ]
  },

  // ── 19. SPACER ──
  spacer: {
    type: 'spacer',
    name: 'Spacer Gap',
    category: 'layout',
    icon: 'Maximize2',
    defaultSettings: {
      height: '40px'
    },
    controls: [
      { name: 'height', label: 'Height (px / vh)', type: 'text', tab: 'content' }
    ]
  },

  // ── 20. CODE BLOCK ──
  code_block: {
    type: 'code_block',
    name: 'Syntax Code Block',
    category: 'advanced',
    icon: 'Code2',
    defaultSettings: {
      sectionId: 'code',
      filename: 'config.json',
      language: 'json',
      code: '{\n  "status": "success",\n  "version": "1.0.0"\n}'
    },
    controls: [
      { name: 'sectionId', label: 'Section Anchor ID', type: 'text', tab: 'content' },
      { name: 'filename', label: 'File Tab Title', type: 'text', tab: 'content' },
      { name: 'language', label: 'Language Label', type: 'text', tab: 'content' },
      { name: 'code', label: 'Code Snippet', type: 'textarea', tab: 'content' }
    ]
  },

  // ── 21. HTML EMBED ──
  html_embed: {
    type: 'html',
    name: 'Custom HTML / Embed',
    category: 'advanced',
    icon: 'Code2',
    defaultSettings: {
      code: '<div style="padding: 20px; text-align: center; border: 1px dashed rgba(56,189,248,0.4); border-radius: 8px;">Custom HTML Snippet</div>'
    },
    controls: [
      { name: 'code', label: 'HTML / JS / Embed Code', type: 'textarea', tab: 'content' }
    ]
  }
};
