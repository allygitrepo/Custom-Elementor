/**
 * LightBuilder - Full Widget Registry & Control Definitions
 */

export const WIDGET_CATEGORIES = [
  { id: 'layout', name: 'Layout' },
  { id: 'basic', name: 'Basic' },
  { id: 'media', name: 'Media' },
  { id: 'interactive', name: 'Interactive' },
  { id: 'advanced', name: 'Advanced' }
];

export const WIDGET_REGISTRY = {
  // CONTAINER
  container: {
    type: 'container',
    name: 'Container',
    category: 'layout',
    icon: 'Box',
    isContainer: true,
    defaultSettings: {
      direction: 'column',
      align: 'stretch',
      justify: 'flex-start',
      wrap: 'nowrap',
      gap: '16px',
      padding: { top: '24px', right: '24px', bottom: '24px', left: '24px' },
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      background: 'transparent',
      minHeight: 'auto',
      maxWidth: '100%',
      borderRadius: '0px',
      borderStyle: 'none'
    },
    controls: [
      {
        name: 'direction',
        label: 'Flex Direction',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'Column (Vertical)', value: 'column' },
          { label: 'Row (Horizontal)', value: 'row' },
          { label: 'Row Reverse', value: 'row-reverse' },
          { label: 'Column Reverse', value: 'column-reverse' }
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
      {
        name: 'justify',
        label: 'Justify Content',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'flex-end' },
          { label: 'Space Between', value: 'space-between' },
          { label: 'Space Around', value: 'space-around' },
          { label: 'Space Evenly', value: 'space-evenly' }
        ]
      },
      {
        name: 'wrap',
        label: 'Wrap Children',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'No Wrap', value: 'nowrap' },
          { label: 'Wrap', value: 'wrap' }
        ]
      },
      {
        name: 'gap',
        label: 'Gap Between Items',
        type: 'text',
        tab: 'content',
        placeholder: '16px'
      },
      {
        name: 'minHeight',
        label: 'Min Height',
        type: 'text',
        tab: 'content',
        placeholder: 'auto, 50vh, 400px'
      },
      {
        name: 'maxWidth',
        label: 'Max Width',
        type: 'text',
        tab: 'content',
        placeholder: '100%, 1200px'
      },
      {
        name: 'background',
        label: 'Background Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'borderStyle',
        label: 'Border Style',
        type: 'select',
        tab: 'style',
        options: ['none', 'solid', 'dashed', 'dotted']
      },
      {
        name: 'borderColor',
        label: 'Border Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'text',
        tab: 'style',
        placeholder: '8px'
      },
      {
        name: 'boxShadow',
        label: 'Box Shadow',
        type: 'text',
        tab: 'style',
        placeholder: '0 4px 6px rgba(0,0,0,0.1)'
      }
    ]
  },

  // SPACER
  spacer: {
    type: 'spacer',
    name: 'Spacer',
    category: 'layout',
    icon: 'Maximize2',
    defaultSettings: {
      height: '40px'
    },
    controls: [
      {
        name: 'height',
        label: 'Height',
        type: 'text',
        tab: 'content',
        placeholder: '40px'
      }
    ]
  },

  // DIVIDER
  divider: {
    type: 'divider',
    name: 'Divider',
    category: 'layout',
    icon: 'Minus',
    defaultSettings: {
      style: 'solid',
      weight: '1px',
      color: 'rgba(255,255,255,0.12)',
      width: '100%',
      align: 'center'
    },
    controls: [
      {
        name: 'style',
        label: 'Line Style',
        type: 'select',
        tab: 'content',
        options: ['solid', 'dashed', 'dotted', 'double']
      },
      {
        name: 'weight',
        label: 'Line Weight',
        type: 'text',
        tab: 'content',
        placeholder: '1px'
      },
      {
        name: 'width',
        label: 'Divider Width',
        type: 'text',
        tab: 'content',
        placeholder: '100%'
      },
      {
        name: 'color',
        label: 'Color',
        type: 'color',
        tab: 'style'
      }
    ]
  },

  // HEADING
  heading: {
    type: 'heading',
    name: 'Heading',
    category: 'basic',
    icon: 'Heading',
    defaultSettings: {
      text: 'Design Anything with Ease',
      tag: 'h2',
      align: 'left',
      color: '#ffffff',
      fontSize: { desktop: '36px', tablet: '28px', mobile: '24px' },
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '0px'
    },
    controls: [
      {
        name: 'text',
        label: 'Heading Text',
        type: 'text',
        tab: 'content',
        multiline: true,
        placeholder: 'Enter heading text...'
      },
      {
        name: 'tag',
        label: 'HTML Tag',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'H1 (Main Title)', value: 'h1' },
          { label: 'H2 (Section Heading)', value: 'h2' },
          { label: 'H3 (Subheading)', value: 'h3' },
          { label: 'H4', value: 'h4' },
          { label: 'H5', value: 'h5' },
          { label: 'H6', value: 'h6' },
          { label: 'Div', value: 'div' },
          { label: 'Span (Inline)', value: 'span' }
        ]
      },
      {
        name: 'color',
        label: 'Text Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'fontSize',
        label: 'Responsive Font Size',
        type: 'responsive',
        tab: 'style'
      },
      {
        name: 'fontWeight',
        label: 'Font Weight',
        type: 'select',
        tab: 'style',
        options: ['300', '400', '500', '600', '700', '800', '900']
      },
      {
        name: 'align',
        label: 'Text Alignment',
        type: 'select',
        tab: 'style',
        options: ['left', 'center', 'right', 'justify']
      },
      {
        name: 'letterSpacing',
        label: 'Letter Spacing',
        type: 'text',
        tab: 'style',
        placeholder: '0px or 1px'
      }
    ]
  },

  // TEXT
  text: {
    type: 'text',
    name: 'Text Block',
    category: 'basic',
    icon: 'AlignLeft',
    defaultSettings: {
      text: '<p>LightBuilder gives you complete creative freedom to construct pixel-perfect visual layouts with zero runtime dependencies.</p>',
      color: '#94a3b8',
      fontSize: { desktop: '16px', tablet: '15px', mobile: '14px' },
      lineHeight: '1.6',
      align: 'left',
      maxWidth: '100%'
    },
    controls: [
      {
        name: 'text',
        label: 'Content (HTML/Text)',
        type: 'text',
        tab: 'content',
        multiline: true,
        rows: 5,
        placeholder: 'Enter paragraph text...'
      },
      {
        name: 'color',
        label: 'Text Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'fontSize',
        label: 'Font Size',
        type: 'responsive',
        tab: 'style'
      },
      {
        name: 'lineHeight',
        label: 'Line Height',
        type: 'text',
        tab: 'style',
        placeholder: '1.6'
      },
      {
        name: 'align',
        label: 'Text Alignment',
        type: 'select',
        tab: 'style',
        options: ['left', 'center', 'right', 'justify']
      },
      {
        name: 'maxWidth',
        label: 'Max Content Width',
        type: 'text',
        tab: 'style',
        placeholder: '100% or 600px'
      }
    ]
  },

  // IMAGE
  image: {
    type: 'image',
    name: 'Image',
    category: 'basic',
    icon: 'Image',
    defaultSettings: {
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
      alt: 'Scenic abstract artwork',
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: '8px',
      linkUrl: ''
    },
    controls: [
      {
        name: 'url',
        label: 'Image Source',
        type: 'image',
        tab: 'content'
      },
      {
        name: 'linkUrl',
        label: 'Click Action (Link URL)',
        type: 'text',
        tab: 'content',
        placeholder: 'https://...'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'text',
        tab: 'style',
        placeholder: '100%'
      },
      {
        name: 'maxWidth',
        label: 'Max Width',
        type: 'text',
        tab: 'style',
        placeholder: '100%'
      },
      {
        name: 'height',
        label: 'Height',
        type: 'text',
        tab: 'style',
        placeholder: 'auto'
      },
      {
        name: 'objectFit',
        label: 'Object Fit',
        type: 'select',
        tab: 'style',
        options: ['cover', 'contain', 'fill', 'none']
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'text',
        tab: 'style',
        placeholder: '8px'
      }
    ]
  },

  // BUTTON
  button: {
    type: 'button',
    name: 'Button',
    category: 'basic',
    icon: 'MousePointerClick',
    defaultSettings: {
      text: 'Explore Features',
      url: '#',
      target: '_self',
      background: '#38bdf8',
      textColor: '#0f172a',
      borderRadius: '8px',
      padding: { top: '12px', right: '24px', bottom: '12px', left: '24px' },
      fontWeight: '600',
      fontSize: '14px',
      hoverBackground: '#0ea5e9',
      hoverTextColor: '#0f172a',
      borderStyle: 'none'
    },
    controls: [
      {
        name: 'text',
        label: 'Button Text',
        type: 'text',
        tab: 'content',
        placeholder: 'Button Text'
      },
      {
        name: 'url',
        label: 'Target URL',
        type: 'text',
        tab: 'content',
        placeholder: 'https://...'
      },
      {
        name: 'target',
        label: 'Open In',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'Same Window (_self)', value: '_self' },
          { label: 'New Tab (_blank)', value: '_blank' }
        ]
      },
      {
        name: 'background',
        label: 'Background Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'textColor',
        label: 'Text Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'text',
        tab: 'style',
        placeholder: '8px'
      },
      {
        name: 'padding',
        label: 'Button Padding',
        type: 'spacing',
        tab: 'style'
      }
    ]
  },

  // ICON
  icon: {
    type: 'icon',
    name: 'Icon',
    category: 'basic',
    icon: 'Star',
    defaultSettings: {
      iconName: 'Sparkles',
      size: '32px',
      color: '#38bdf8',
      align: 'left'
    },
    controls: [
      {
        name: 'iconName',
        label: 'Icon Symbol',
        type: 'select',
        tab: 'content',
        options: ['Sparkles', 'Star', 'Heart', 'Check', 'Zap', 'Shield', 'Globe', 'Layers', 'Send', 'Activity']
      },
      {
        name: 'size',
        label: 'Icon Size',
        type: 'text',
        tab: 'style',
        placeholder: '32px'
      },
      {
        name: 'color',
        label: 'Icon Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'align',
        label: 'Alignment',
        type: 'select',
        tab: 'style',
        options: ['left', 'center', 'right']
      }
    ]
  },

  // ICON BOX
  iconbox: {
    type: 'iconbox',
    name: 'Icon Box',
    category: 'basic',
    icon: 'Sparkles',
    defaultSettings: {
      iconName: 'Zap',
      iconColor: '#38bdf8',
      iconSize: '36px',
      title: 'Ultra High Performance',
      description: 'Zero bloat architecture compiles directly to static HTML and lightning fast CSS.',
      align: 'center',
      background: 'rgba(255, 255, 255, 0.03)',
      padding: { top: '24px', right: '20px', bottom: '24px', left: '20px' },
      borderRadius: '12px'
    },
    controls: [
      {
        name: 'iconName',
        label: 'Icon',
        type: 'select',
        tab: 'content',
        options: ['Zap', 'Sparkles', 'Star', 'Shield', 'Globe', 'Heart', 'Activity']
      },
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        tab: 'content',
        placeholder: 'Feature Title'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'text',
        tab: 'content',
        multiline: true,
        placeholder: 'Feature description...'
      },
      {
        name: 'align',
        label: 'Alignment',
        type: 'select',
        tab: 'content',
        options: ['left', 'center', 'right']
      },
      {
        name: 'iconColor',
        label: 'Icon Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'background',
        label: 'Background',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'text',
        tab: 'style',
        placeholder: '12px'
      }
    ]
  },

  // VIDEO
  video: {
    type: 'video',
    name: 'Video',
    category: 'media',
    icon: 'Video',
    defaultSettings: {
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      aspectRatio: '16/9',
      borderRadius: '8px'
    },
    controls: [
      {
        name: 'url',
        label: 'Video URL (YouTube/Vimeo Embed)',
        type: 'text',
        tab: 'content',
        placeholder: 'https://www.youtube.com/embed/...'
      },
      {
        name: 'aspectRatio',
        label: 'Aspect Ratio',
        type: 'select',
        tab: 'style',
        options: ['16/9', '4/3', '1/1', '21/9']
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'text',
        tab: 'style',
        placeholder: '8px'
      }
    ]
  },

  // IMAGE GALLERY
  gallery: {
    type: 'gallery',
    name: 'Image Gallery',
    category: 'media',
    icon: 'Image',
    defaultSettings: {
      columns: 3,
      gap: '12px',
      borderRadius: '8px',
      images: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&q=80',
        'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80'
      ]
    },
    controls: [
      {
        name: 'columns',
        label: 'Grid Columns',
        type: 'select',
        tab: 'content',
        options: [
          { label: '2 Columns', value: 2 },
          { label: '3 Columns', value: 3 },
          { label: '4 Columns', value: 4 }
        ]
      },
      {
        name: 'gap',
        label: 'Grid Gap',
        type: 'text',
        tab: 'style',
        placeholder: '12px'
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'text',
        tab: 'style',
        placeholder: '8px'
      }
    ]
  },

  // ACCORDION
  accordion: {
    type: 'accordion',
    name: 'Accordion',
    category: 'interactive',
    icon: 'ListCollapse',
    defaultSettings: {
      items: [
        { title: 'What is LightBuilder?', content: 'LightBuilder is a modern, lightweight, self-hosted website builder.' },
        { title: 'Does it require WordPress or Laravel?', content: 'No, LightBuilder is completely standalone and runs on native PHP and SQLite.' },
        { title: 'Can I export clean HTML?', content: 'Yes, LightBuilder compiles your pages into clean static HTML and CSS.' }
      ],
      activeColor: '#38bdf8',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '8px'
    },
    controls: [
      {
        name: 'activeColor',
        label: 'Active Title Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'background',
        label: 'Item Background',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'text',
        tab: 'style',
        placeholder: '8px'
      }
    ]
  },

  // TABS
  tabs: {
    type: 'tabs',
    name: 'Tabs',
    category: 'interactive',
    icon: 'Layers',
    defaultSettings: {
      tabs: [
        { title: 'Overview', content: 'LightBuilder gives designers and developers a unified, lightning fast visual editor.' },
        { title: 'Performance', content: 'All published websites achieve 95+ Google Lighthouse scores with clean static output.' },
        { title: 'Security', content: 'SQLite databases and sensitive code are protected behind strict server rules.' }
      ],
      activeColor: '#38bdf8',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '8px'
    },
    controls: [
      {
        name: 'activeColor',
        label: 'Active Tab Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'background',
        label: 'Container Background',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'text',
        tab: 'style',
        placeholder: '8px'
      }
    ]
  },

  // COUNTER
  counter: {
    type: 'counter',
    name: 'Counter',
    category: 'interactive',
    icon: 'Hash',
    defaultSettings: {
      number: 99,
      prefix: '',
      suffix: '%',
      label: 'Performance Score',
      numberColor: '#38bdf8',
      labelColor: '#94a3b8'
    },
    controls: [
      {
        name: 'number',
        label: 'Target Number',
        type: 'text',
        tab: 'content',
        placeholder: '100'
      },
      {
        name: 'prefix',
        label: 'Prefix',
        type: 'text',
        tab: 'content',
        placeholder: '$ or +'
      },
      {
        name: 'suffix',
        label: 'Suffix',
        type: 'text',
        tab: 'content',
        placeholder: '% or +'
      },
      {
        name: 'label',
        label: 'Label',
        type: 'text',
        tab: 'content',
        placeholder: 'Happy Clients'
      },
      {
        name: 'numberColor',
        label: 'Number Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'labelColor',
        label: 'Label Color',
        type: 'color',
        tab: 'style'
      }
    ]
  },

  // PROGRESS BAR
  progress: {
    type: 'progress',
    name: 'Progress Bar',
    category: 'interactive',
    icon: 'Activity',
    defaultSettings: {
      percent: 85,
      label: 'Design Completion',
      barColor: '#38bdf8',
      trackColor: 'rgba(255,255,255,0.1)',
      height: '10px',
      borderRadius: '9999px'
    },
    controls: [
      {
        name: 'percent',
        label: 'Percentage (0-100)',
        type: 'number',
        tab: 'content',
        min: 0,
        max: 100,
        step: 1,
        unit: '%'
      },
      {
        name: 'label',
        label: 'Progress Label',
        type: 'text',
        tab: 'content',
        placeholder: 'Skill Level'
      },
      {
        name: 'barColor',
        label: 'Fill Color',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'height',
        label: 'Bar Height',
        type: 'text',
        tab: 'style',
        placeholder: '10px'
      }
    ]
  },

  // TESTIMONIAL
  testimonial: {
    type: 'testimonial',
    name: 'Testimonial',
    category: 'advanced',
    icon: 'Star',
    defaultSettings: {
      name: 'Sarah Jenkins',
      role: 'Head of Product, TechFlow',
      quote: '"LightBuilder transformed how our team deploys landing pages. The visual editor is effortless and published sites load instantly."',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      rating: 5,
      background: 'rgba(255, 255, 255, 0.03)',
      padding: { top: '24px', right: '24px', bottom: '24px', left: '24px' },
      borderRadius: '12px'
    },
    controls: [
      {
        name: 'name',
        label: 'Author Name',
        type: 'text',
        tab: 'content',
        placeholder: 'Sarah Jenkins'
      },
      {
        name: 'role',
        label: 'Role / Company',
        type: 'text',
        tab: 'content',
        placeholder: 'CEO, Company'
      },
      {
        name: 'quote',
        label: 'Quote',
        type: 'text',
        tab: 'content',
        multiline: true,
        rows: 4,
        placeholder: 'Enter testimonial...'
      },
      {
        name: 'photo',
        label: 'Avatar Photo',
        type: 'image',
        tab: 'content'
      },
      {
        name: 'background',
        label: 'Card Background',
        type: 'color',
        tab: 'style'
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'text',
        tab: 'style',
        placeholder: '12px'
      }
    ]
  },

  // ALERT
  alert: {
    type: 'alert',
    name: 'Alert Box',
    category: 'advanced',
    icon: 'Shield',
    defaultSettings: {
      type: 'info',
      title: 'Note & Update',
      message: 'This is a prominent alert banner for critical notifications and highlights.',
      borderRadius: '8px'
    },
    controls: [
      {
        name: 'type',
        label: 'Alert Type',
        type: 'select',
        tab: 'content',
        options: [
          { label: 'Info (Cyan)', value: 'info' },
          { label: 'Success (Green)', value: 'success' },
          { label: 'Warning (Amber)', value: 'warning' },
          { label: 'Error (Rose)', value: 'error' }
        ]
      },
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        tab: 'content',
        placeholder: 'Alert Title'
      },
      {
        name: 'message',
        label: 'Message',
        type: 'text',
        tab: 'content',
        multiline: true,
        placeholder: 'Alert message content...'
      }
    ]
  },

  // HTML
  html: {
    type: 'html',
    name: 'HTML / Embed',
    category: 'advanced',
    icon: 'Code2',
    defaultSettings: {
      code: '<div style="padding: 16px; background: rgba(56,189,248,0.1); border-radius: 8px; color: #38bdf8; text-align: center;">⚡ Custom HTML Block</div>'
    },
    controls: [
      {
        name: 'code',
        label: 'Custom HTML Code',
        type: 'text',
        tab: 'content',
        multiline: true,
        rows: 8,
        placeholder: '<div>Custom markup</div>'
      }
    ]
  }
};
