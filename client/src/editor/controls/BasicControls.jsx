import React from 'react';

export function TextControl({ label, value, onChange, placeholder, multiline = false, rows = 3 }) {
  return (
    <div className="form-group" style={{ marginBottom: '14px' }}>
      {label && <label className="form-label">{label}</label>}
      {multiline ? (
        <textarea
          className="form-input"
          style={{ resize: 'vertical', minHeight: '60px' }}
          rows={rows}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className="form-input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export function NumberControl({ label, value, onChange, min = 0, max = 1000, step = 1, unit = 'px' }) {
  const numVal = parseInt(value, 10) || 0;

  return (
    <div className="form-group" style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        {label && <label className="form-label" style={{ margin: 0 }}>{label}</label>}
        <span style={{ fontSize: '12px', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
          {value || `0${unit}`}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numVal}
          onChange={(e) => onChange(`${e.target.value}${unit}`)}
          style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
        />
        <input
          type="number"
          className="form-input"
          style={{ width: '70px', padding: '6px 8px', fontSize: '12px', textAlign: 'center' }}
          value={numVal}
          onChange={(e) => onChange(`${e.target.value}${unit}`)}
        />
      </div>
    </div>
  );
}

export function ColorControl({ label, value, onChange }) {
  const presetColors = [
    '#ffffff', '#f8fafc', '#94a3b8', '#334155', '#0f172a', '#000000',
    '#38bdf8', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
    '#f59e0b', '#10b981', '#14b8a6', 'transparent'
  ];

  return (
    <div className="form-group" style={{ marginBottom: '14px' }}>
      {label && <label className="form-label">{label}</label>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <input
          type="color"
          value={value && value.startsWith('#') ? value : '#38bdf8'}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '34px',
            height: '34px',
            padding: 0,
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            background: 'none'
          }}
        />
        <input
          type="text"
          className="form-input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#38bdf8 or transparent"
          style={{ flex: 1, fontSize: '13px', fontFamily: 'var(--font-mono)' }}
        />
      </div>

      {/* Color Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {presetColors.map((color, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(color)}
            title={color}
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              background: color === 'transparent' 
                ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' 
                : color,
              backgroundSize: '8px 8px',
              border: value === color ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              padding: 0
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function SelectControl({ label, value, onChange, options = [] }) {
  return (
    <div className="form-group" style={{ marginBottom: '14px' }}>
      {label && <label className="form-label">{label}</label>}
      <select
        className="form-input"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ cursor: 'pointer' }}
      >
        {options.map((opt, i) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={i} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function ToggleControl({ label, value, onChange, description }) {
  const isChecked = Boolean(value);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      marginBottom: '10px'
    }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{label}</div>
        {description && <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{description}</div>}
      </div>

      <button
        type="button"
        onClick={() => onChange(!isChecked)}
        style={{
          width: '38px',
          height: '22px',
          borderRadius: '12px',
          background: isChecked ? 'var(--primary)' : 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background-color var(--transition-fast)',
          padding: 0
        }}
      >
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: isChecked ? '#0f172a' : '#ffffff',
          position: 'absolute',
          top: '2px',
          left: isChecked ? '18px' : '2px',
          transition: 'left var(--transition-fast)'
        }} />
      </button>
    </div>
  );
}
