import React, { useState } from 'react';
import { 
  TextControl, 
  NumberControl, 
  ColorControl, 
  SelectControl, 
  ToggleControl 
} from './BasicControls';
import { 
  SpacingControl, 
  TypographyControl, 
  BorderControl, 
  ImageControl, 
  ResponsiveControl,
  RepeaterControl 
} from './AdvancedControls';
import { Sliders, Paintbrush, Cog, Trash2, Copy, Layers, Monitor, Tablet, Smartphone } from 'lucide-react';

export default function DynamicControlPanel({ 
  element, 
  widgetDef, 
  onUpdateSettings, 
  onDelete, 
  onDuplicate,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('content');

  if (!element || !widgetDef) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
        <Layers size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
        <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)' }}>No Element Selected</h4>
        <p style={{ fontSize: '12px', marginTop: '4px' }}>Click any element on the canvas to customize its content and styles.</p>
      </div>
    );
  }

  const settings = element.settings || {};

  const handleControlChange = (name, value) => {
    onUpdateSettings({
      ...settings,
      [name]: value
    });
  };

  const controls = widgetDef.controls || [];
  const contentControls = controls.filter(c => !c.tab || c.tab === 'content');
  const styleControls = controls.filter(c => c.tab === 'style');
  const advancedControls = controls.filter(c => c.tab === 'advanced');

  // Common advanced controls (margin, padding, CSS class, zIndex, opacity, shadow, animation, visibility)
  const renderCommonAdvanced = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SpacingControl
        label="Margin"
        value={settings.margin || {}}
        onChange={(val) => handleControlChange('margin', val)}
      />

      <SpacingControl
        label="Padding"
        value={settings.padding || {}}
        onChange={(val) => handleControlChange('padding', val)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Z-Index</label>
          <input
            type="number"
            className="form-input"
            placeholder="0"
            value={settings.zIndex !== undefined ? settings.zIndex : ''}
            onChange={(e) => handleControlChange('zIndex', e.target.value)}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">CSS Class</label>
          <input
            type="text"
            className="form-input"
            placeholder="custom-class"
            value={settings.cssClass || ''}
            onChange={(e) => handleControlChange('cssClass', e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Opacity</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            className="form-input"
            placeholder="1"
            value={settings.opacity !== undefined ? settings.opacity : ''}
            onChange={(e) => handleControlChange('opacity', e.target.value)}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Border Radius</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 12px"
            value={settings.borderRadius || ''}
            onChange={(e) => handleControlChange('borderRadius', e.target.value)}
          />
        </div>
      </div>

      <SelectControl
        label="Box Shadow / Glow"
        value={settings.boxShadow || 'none'}
        options={[
          { label: 'None', value: 'none' },
          { label: 'Subtle Soft', value: '0 4px 12px rgba(0,0,0,0.1)' },
          { label: 'Medium Elevated', value: '0 8px 24px rgba(0,0,0,0.25)' },
          { label: 'Large Deep', value: '0 16px 40px rgba(0,0,0,0.4)' },
          { label: 'Cyan Neon Glow', value: '0 0 25px rgba(56, 189, 248, 0.3)' },
          { label: 'Purple Neon Glow', value: '0 0 25px rgba(168, 85, 247, 0.3)' },
          { label: 'Card Inset Shadow', value: 'inset 0 1px 0 rgba(255,255,255,0.1)' }
        ]}
        onChange={(val) => handleControlChange('boxShadow', val)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <SelectControl
          label="Entrance Animation"
          value={settings.animation || 'none'}
          options={[
            { label: 'None', value: 'none' },
            { label: 'Fade In', value: 'fadeIn' },
            { label: 'Slide Up', value: 'slideUp' },
            { label: 'Slide In Left', value: 'slideLeft' },
            { label: 'Slide In Right', value: 'slideRight' },
            { label: 'Zoom In', value: 'zoomIn' },
            { label: 'Pulse', value: 'pulse' }
          ]}
          onChange={(val) => handleControlChange('animation', val)}
        />

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Anim Duration</label>
          <input
            type="text"
            className="form-input"
            placeholder="0.6s"
            value={settings.animationDuration || ''}
            onChange={(e) => handleControlChange('animationDuration', e.target.value)}
          />
        </div>
      </div>

      {/* Responsive Device Visibility */}
      <div style={{
        marginTop: '8px',
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Monitor size={14} color="var(--primary)" />
          <span>Responsive Visibility</span>
        </div>

        <ToggleControl
          label="Hide on Desktop"
          checked={Boolean(settings.hideOnDesktop)}
          onChange={(checked) => handleControlChange('hideOnDesktop', checked)}
        />

        <ToggleControl
          label="Hide on Tablet"
          checked={Boolean(settings.hideOnTablet)}
          onChange={(checked) => handleControlChange('hideOnTablet', checked)}
        />

        <ToggleControl
          label="Hide on Mobile"
          checked={Boolean(settings.hideOnMobile)}
          onChange={(checked) => handleControlChange('hideOnMobile', checked)}
        />
      </div>
    </div>
  );

  const renderControl = (ctrl) => {
    const val = settings[ctrl.name] !== undefined ? settings[ctrl.name] : ctrl.default;

    switch (ctrl.type) {
      case 'text':
        return (
          <TextControl
            key={ctrl.name}
            label={ctrl.label}
            value={val}
            placeholder={ctrl.placeholder}
            multiline={ctrl.multiline || false}
            rows={ctrl.rows || 2}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'textarea':
        return (
          <TextControl
            key={ctrl.name}
            label={ctrl.label}
            value={val}
            placeholder={ctrl.placeholder}
            multiline={true}
            rows={ctrl.rows || 3}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'responsive_text':
        return (
          <TextControl
            key={ctrl.name}
            label={ctrl.label}
            value={typeof val === 'object' ? (val.desktop || '') : val}
            placeholder={ctrl.placeholder}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'number':
        return (
          <NumberControl
            key={ctrl.name}
            label={ctrl.label}
            value={val}
            min={ctrl.min}
            max={ctrl.max}
            step={ctrl.step}
            unit={ctrl.unit}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'color':
        return (
          <ColorControl
            key={ctrl.name}
            label={ctrl.label}
            value={val}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'select':
        return (
          <SelectControl
            key={ctrl.name}
            label={ctrl.label}
            value={val}
            options={ctrl.options}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'toggle':
        return (
          <ToggleControl
            key={ctrl.name}
            label={ctrl.label}
            value={val}
            description={ctrl.description}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'spacing':
        return (
          <SpacingControl
            key={ctrl.name}
            label={ctrl.label}
            value={val || {}}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'typography':
        return (
          <TypographyControl
            key={ctrl.name}
            value={val || {}}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'border':
        return (
          <BorderControl
            key={ctrl.name}
            value={val || {}}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'image':
        return (
          <ImageControl
            key={ctrl.name}
            label={ctrl.label}
            value={val}
            altValue={settings[`${ctrl.name}_alt`] || ''}
            onAltChange={(alt) => handleControlChange(`${ctrl.name}_alt`, alt)}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'repeater':
        return (
          <RepeaterControl
            key={ctrl.name}
            label={ctrl.label}
            value={val || []}
            itemLabel={ctrl.itemLabel || 'Item'}
            fields={ctrl.fields || []}
            defaultItem={ctrl.defaultItem || {}}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      case 'responsive':
        return (
          <ResponsiveControl
            key={ctrl.name}
            label={ctrl.label}
            value={val}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );

      default:
        return (
          <TextControl
            key={ctrl.name}
            label={ctrl.label || ctrl.name}
            value={val}
            placeholder={ctrl.placeholder}
            onChange={(newVal) => handleControlChange(ctrl.name, newVal)}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Widget Header Banner */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontSize: '11px',
            fontWeight: '700'
          }}>
            {widgetDef.icon || 'W'}
          </div>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '700' }}>{widgetDef.name}</h3>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              #{element.id.slice(0, 8)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              title="Duplicate Element"
              className="btn btn-secondary"
              style={{ padding: '4px 6px' }}
            >
              <Copy size={13} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              title="Delete Element"
              className="btn btn-danger"
              style={{ padding: '4px 6px' }}
            >
              <Trash2 size={13} />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              title="Collapse Settings Panel"
              className="btn btn-secondary"
              style={{ padding: '4px 6px', marginLeft: '4px' }}
            >
              <Trash2 size={0} style={{ display: 'none' }} />
              <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)'
      }}>
        {[
          { key: 'content', label: 'Content', icon: Sliders },
          { key: 'style', label: 'Style', icon: Paintbrush },
          { key: 'advanced', label: 'Advanced', icon: Cog }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 4px',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-dim)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
        {activeTab === 'content' && (
          <div>
            {contentControls.length > 0 ? (
              contentControls.map(renderControl)
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>
                No content settings for this widget.
              </p>
            )}
          </div>
        )}

        {activeTab === 'style' && (
          <div>
            {styleControls.length > 0 ? (
              styleControls.map(renderControl)
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>
                No style settings for this widget.
              </p>
            )}
          </div>
        )}

        {activeTab === 'advanced' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {advancedControls.map(renderControl)}
            {renderCommonAdvanced()}

            {onDelete && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={onDelete}
                  className="btn btn-danger"
                  style={{ width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700' }}
                >
                  <Trash2 size={16} />
                  <span>Delete This Element</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
