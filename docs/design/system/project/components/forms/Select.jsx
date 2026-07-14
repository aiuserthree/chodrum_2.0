import React from 'react';
import { Icon } from '../display/Icon.jsx';

const SIZES = { sm: { h: 36, fs: 14, px: 12 }, md: { h: 44, fs: 16, px: 14 } };

/**
 * Select — native dropdown styled to match Input (used for sort order, genre,
 * difficulty filters). Chevron affordance on the right.
 */
export function Select({
  label,
  options = [],
  size = 'md',
  disabled = false,
  fullWidth = true,
  placeholder,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const uid = id || React.useId();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: fullWidth ? '100%' : 'auto', ...style }}>
      {label ? <label htmlFor={uid} style={{ fontSize: 13, fontWeight: 500 }}>{label}</label> : null}
      <div
        style={{
          position: 'relative', display: 'flex', alignItems: 'center',
          height: s.h, borderRadius: 'var(--radius-inputs)',
          border: `1px solid ${focus ? 'var(--color-ink)' : 'var(--border-default)'}`,
          background: disabled ? 'var(--action-disabled-bg)' : 'var(--surface-card)',
          boxShadow: focus ? '0 0 0 3px var(--focus-ring)' : 'none',
          transition: 'border-color 120ms ease, box-shadow 120ms ease',
        }}
      >
        <select
          id={uid}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
            flex: 1, height: '100%', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-sans)', fontSize: s.fs, color: 'var(--text-primary)',
            padding: `0 ${s.px + 22}px 0 ${s.px}px`, cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          {...rest}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((o) => {
            const value = typeof o === 'string' ? o : o.value;
            const labelText = typeof o === 'string' ? o : o.label;
            return <option key={value} value={value}>{labelText}</option>;
          })}
        </select>
        <Icon name="chevron-down" size={16} style={{ position: 'absolute', right: s.px, color: 'var(--color-icon)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}
