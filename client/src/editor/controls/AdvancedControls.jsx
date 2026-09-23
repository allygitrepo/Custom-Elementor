import React, { useState } from 'react';
import { Link2, Unlink, Monitor, Tablet, Smartphone, Image as ImageIcon, Sparkles, Upload, Plus, Trash2, Copy, ChevronDown, ChevronUp, Layers, Film } from 'lucide-react';
import MediaPickerModal from '../../components/MediaPickerModal';
import { getMediaUrl } from '../../utils/media';

export function SpacingControl({ label = 'Spacing', value = {}, onChange, unit = 'px' }) {
  const [isLinked, setIsLinked] = useState(true);

  const top = value.top || '';
  const right = value.right || '';
  const bottom = value.bottom || '';
  const left = value.left || '';

  const handleValueChange = (side, rawVal) => {
    const formatted = rawVal === '' ? '' : `${rawVal}${unit}`;
    if (isLinked) {
      onChange({
        top: formatted,
        right: formatted,
        bottom: formatted,
        left: formatted
      });
    } else {
      onChange({
        ...value,
        [side]: formatted
      });
    }
  };

  const parseNum = (val) => {
    if (!val) return '';
    return parseInt(val, 10) || 0;
  };

  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label className="form-label" style={{ margin: 0 }}>{label}</label>
        <button
          type="button"
          onClick={() => setIsLinked(!isLinked)}
          title={isLinked ? 'Unlink values' : 'Link values'}
          style={{
            background: isLinked ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface-elevated)',
            color: isLinked ? 'var(--primary)' : 'var(--text-dim)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px'
          }}
        >
          {isLinked ? <Link2 size={12} /> : <Unlink size={12} />}
          <span>{isLinked ? 'Linked' : 'Unlinked'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
        {['top', 'right', 'bottom', 'left'].map((side) => (
          <div key={side} style={{ textAlign: 'center' }}>
            <input
              type="number"
              className="form-input"
              style={{ textAlign: 'center', padding: '6px 4px', fontSize: '12px' }}
              value={parseNum(value[side])}
              onChange={(e) => handleValueChange(side, e.target.value)}
              placeholder="0"
            />
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>
              {side}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TypographyControl({ value = {}, onChange }) {
  const fontWeights = [
    { label: 'Normal (400)', value: '400' },
    { label: 'Medium (500)', value: '500' },
    { label: 'Semi-Bold (600)', value: '600' },
    { label: 'Bold (700)', value: '700' },
    { label: 'Extra Bold (800)', value: '800' }
  ];

  const textAligns = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
    { label: 'Justify', value: 'justify' }
  ];

  const fontFamilies = [
    { label: 'Default (Plus Jakarta Sans)', value: 'var(--font-sans)' },
    { label: 'Inter', value: "'Inter', sans-serif" },
    { label: 'Roboto', value: "'Roboto', sans-serif" },
    { label: 'Playfair Display', value: "'Playfair Display', serif" },
    { label: 'JetBrains Mono', value: 'var(--font-mono)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label">Font Family</label>
        <select
          className="form-input"
          value={value.fontFamily || ''}
          onChange={(e) => onChange({ ...value, fontFamily: e.target.value })}
        >
          {fontFamilies.map((f, i) => (
            <option key={i} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Font Weight</label>
          <select
            className="form-input"
            value={value.fontWeight || '400'}
            onChange={(e) => onChange({ ...value, fontWeight: e.target.value })}
          >
            {fontWeights.map((w, i) => (
              <option key={i} value={w.value}>{w.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Alignment</label>
          <select
            className="form-input"
            value={value.align || 'left'}
            onChange={(e) => onChange({ ...value, align: e.target.value })}
          >
            {textAligns.map((a, i) => (
              <option key={i} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Line Height</label>
          <input
            type="text"
            className="form-input"
            placeholder="1.5 or 24px"
            value={value.lineHeight || ''}
            onChange={(e) => onChange({ ...value, lineHeight: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Letter Spacing</label>
          <input
            type="text"
            className="form-input"
            placeholder="0px or 1px"
            value={value.letterSpacing || ''}
            onChange={(e) => onChange({ ...value, letterSpacing: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export function BorderControl({ value = {}, onChange }) {
  const borderStyles = ['none', 'solid', 'dashed', 'dotted', 'double'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Border Style</label>
          <select
            className="form-input"
            value={value.borderStyle || 'none'}
            onChange={(e) => onChange({ ...value, borderStyle: e.target.value })}
          >
            {borderStyles.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Border Width</label>
          <input
            type="text"
            className="form-input"
            placeholder="1px"
            value={value.borderWidth || ''}
            onChange={(e) => onChange({ ...value, borderWidth: e.target.value })}
          />
        </div>
      </div>

      {value.borderStyle && value.borderStyle !== 'none' && (
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Border Color</label>
          <input
            type="text"
            className="form-input"
            placeholder="#334155"
            value={value.borderColor || ''}
            onChange={(e) => onChange({ ...value, borderColor: e.target.value })}
          />
        </div>
      )}

      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label">Border Radius</label>
        <input
          type="text"
          className="form-input"
          placeholder="8px or 9999px"
          value={value.borderRadius || ''}
          onChange={(e) => onChange({ ...value, borderRadius: e.target.value })}
        />
      </div>
    </div>
  );
}

export function ImageControl({ label = 'Image', value = '', onChange, onAltChange, altValue = '' }) {
  const [modalOpen, setModalOpen] = useState(false);

  const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.split('?')[0].toLowerCase();
    return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || 
           clean.endsWith('.mkv') || clean.endsWith('.avi') || clean.endsWith('.m4v') || 
           clean.endsWith('.ogv') || clean.endsWith('.wmv') || clean.endsWith('.flv') || 
           clean.endsWith('.3gp') || clean.includes('youtube.com') || clean.includes('youtu.be') || clean.includes('vimeo.com');
  };

  const isVideo = isVideoUrl(value);

  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      <label className="form-label">{label}</label>

      <div style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {value ? (
          <div style={{
            position: 'relative',
            width: '100%',
            height: '130px',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isVideo ? (
              <video
                src={getMediaUrl(value)}
                controls
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                muted
                preload="metadata"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <img
                src={getMediaUrl(value)}
                alt={altValue || 'Widget preview'}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        ) : (
          <div style={{
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dim)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <ImageIcon size={24} style={{ marginBottom: '4px', opacity: 0.6 }} />
            <span style={{ fontSize: '12px' }}>No media selected</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn btn-primary"
            style={{ flex: 1, padding: '6px 12px', fontSize: '12px' }}
          >
            <Upload size={14} />
            <span>{value ? (isVideo ? 'Change Video' : 'Change Image') : 'Select Media / Video'}</span>
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--accent-rose)' }}
            >
              Remove
            </button>
          )}
        </div>

        {/* URL Direct Input */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            style={{ fontSize: '11px', padding: '5px 8px' }}
            placeholder="Or enter media / embed URL..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>

        {onAltChange && !isVideo && (
          <input
            type="text"
            className="form-input"
            style={{ fontSize: '12px', padding: '6px 10px' }}
            placeholder="Alt text (SEO & Accessibility)"
            value={altValue}
            onChange={(e) => onAltChange(e.target.value)}
          />
        )}
      </div>

      <MediaPickerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedUrl={value}
        onSelect={(url) => onChange(url)}
      />
    </div>
  );
}

export function ResponsiveControl({ label, value = {}, onChange, controlType = 'text', options = [] }) {
  const [activeDevice, setActiveDevice] = useState('desktop');

  const devices = [
    { key: 'desktop', icon: Monitor, label: 'Desktop' },
    { key: 'tablet', icon: Tablet, label: 'Tablet' },
    { key: 'mobile', icon: Smartphone, label: 'Mobile' }
  ];

  const rawVal = typeof value === 'object' && value !== null ? value[activeDevice] || '' : (activeDevice === 'desktop' ? value : '');

  const handleChange = (newVal) => {
    if (typeof value === 'object' && value !== null) {
      onChange({
        ...value,
        [activeDevice]: newVal
      });
    } else {
      onChange({
        desktop: activeDevice === 'desktop' ? newVal : (value || ''),
        [activeDevice]: newVal
      });
    }
  };

  return (
    <div className="form-group" style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label className="form-label" style={{ margin: 0 }}>{label}</label>

        <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-surface)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          {devices.map((d) => {
            const Icon = d.icon;
            const isSelected = activeDevice === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setActiveDevice(d.key)}
                title={d.label}
                style={{
                  background: isSelected ? 'var(--primary)' : 'transparent',
                  color: isSelected ? '#0f172a' : 'var(--text-dim)',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '3px 5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={12} />
              </button>
            );
          })}
        </div>
      </div>

      <input
        type="text"
        className="form-input"
        placeholder={`Value for ${activeDevice} (e.g. 32px)`}
        value={rawVal}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}

export function RepeaterControl({ label = 'Items', value = [], onChange, itemLabel = 'Item', fields = [], defaultItem = {} }) {
  const [openIdx, setOpenIdx] = useState(0);

  const items = Array.isArray(value) ? value : [];

  const handleAdd = () => {
    const newItem = { ...defaultItem };
    const updated = [...items, newItem];
    onChange(updated);
    setOpenIdx(updated.length - 1);
  };

  const handleRemove = (idx, e) => {
    e.stopPropagation();
    if (items.length <= 1) {
      alert('At least one item is required.');
      return;
    }
    const updated = items.filter((_, i) => i !== idx);
    onChange(updated);
    if (openIdx >= updated.length) {
      setOpenIdx(updated.length - 1);
    }
  };

  const handleDuplicate = (idx, e) => {
    e.stopPropagation();
    const cloned = { ...items[idx] };
    const updated = [...items];
    updated.splice(idx + 1, 0, cloned);
    onChange(updated);
    setOpenIdx(idx + 1);
  };

  const handleFieldChange = (itemIdx, fieldName, val) => {
    const updated = items.map((item, idx) => {
      if (idx === itemIdx) {
        return { ...item, [fieldName]: val };
      }
      return item;
    });
    onChange(updated);
  };

  return (
    <div className="form-group" style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <label className="form-label" style={{ margin: 0, fontWeight: '700' }}>{label} ({items.length})</label>
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-primary"
          style={{ padding: '4px 10px', fontSize: '11px', gap: '4px' }}
        >
          <Plus size={13} />
          <span>+ Add {itemLabel}</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          const displayTitle = item.title || item.tab || item.q || item.feat || item.name || item.num || `${itemLabel} #${idx + 1}`;

          return (
            <div
              key={idx}
              style={{
                border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                overflow: 'hidden',
                transition: 'border-color 150ms ease'
              }}
            >
              {/* Item Header */}
              <div
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: isOpen ? 'var(--bg-surface-elevated)' : 'transparent',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: isOpen ? 'var(--primary)' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ opacity: 0.6, fontSize: '11px' }}>#{idx + 1}</span>
                  <span>{displayTitle}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={(e) => handleDuplicate(idx, e)}
                    title="Duplicate item"
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '3px' }}
                  >
                    <Copy size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleRemove(idx, e)}
                    title="Delete item"
                    style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '3px' }}
                  >
                    <Trash2 size={13} />
                  </button>

                  <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', color: 'var(--text-dim)', transition: 'transform 150ms ease' }} />
                </div>
              </div>

              {/* Item Body (Fields) */}
              {isOpen && (
                <div style={{ padding: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(15, 23, 42, 0.5)' }}>
                  {fields.map((f) => {
                    const fVal = item[f.name] !== undefined ? item[f.name] : (f.default || '');

                    if (f.type === 'image') {
                      return (
                        <ImageControl
                          key={f.name}
                          label={f.label}
                          value={fVal}
                          onChange={(val) => handleFieldChange(idx, f.name, val)}
                        />
                      );
                    }

                    if (f.type === 'textarea') {
                      return (
                        <div key={f.name} className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>{f.label}</label>
                          <textarea
                            className="form-input"
                            rows={f.rows || 3}
                            value={fVal}
                            placeholder={f.placeholder}
                            onChange={(e) => handleFieldChange(idx, f.name, e.target.value)}
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={f.name} className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>{f.label}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={fVal}
                          placeholder={f.placeholder}
                          onChange={(e) => handleFieldChange(idx, f.name, e.target.value)}
                          style={{ fontSize: '12px' }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
