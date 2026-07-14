import React from 'react';
import { Icon } from '../display/Icon.jsx';

const SIZES = { sm: { h: 36, fs: 14, px: 12 }, md: { h: 44, fs: 16, px: 14 }, lg: { h: 50, fs: 16, px: 16 } };

/**
 * Input — single-line text field. 12px radius, 1px Line border, Subtext
 * placeholder, subtle outer glow on focus. Optional label / hint / error.
 */
export function Input({
  label,
  hint,
  error,
  iconLeft,
  size = 'md',
  disabled = false,
  fullWidth = true,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const uid = id || React.useId();
  const borderColor = error ? 'var(--status-danger)' : focus ? 'var(--color-ink)' : 'var(--border-default)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: fullWidth ? '100%' : 'auto', ...style }}>
      {label ? (
        <label htmlFor={uid} style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</label>
      ) : null}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: s.h, padding: `0 ${s.px}px`,
          background: disabled ? 'var(--action-disabled-bg)' : 'var(--surface-card)',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-inputs)',
          boxShadow: focus && !error ? '0 0 0 3px var(--focus-ring)' : 'none',
          transition: 'border-color 120ms ease, box-shadow 120ms ease',
        }}
      >
        {iconLeft ? <Icon name={iconLeft} size={18} style={{ color: 'var(--color-icon)' }} /> : null}
        <input
          id={uid}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-sans)', fontSize: s.fs, color: 'var(--text-primary)',
            padding: 0, lineHeight: 1.3,
          }}
          {...rest}
        />
      </div>
      {error ? (
        <span style={{ fontSize: 12, color: 'var(--status-danger)' }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{hint}</span>
      ) : null}
    </div>
  );
}
