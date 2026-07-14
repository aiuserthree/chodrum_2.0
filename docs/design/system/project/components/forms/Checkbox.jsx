import React from 'react';
import { Icon } from '../display/Icon.jsx';

/**
 * Checkbox — square control for cart selection and terms agreement. Solid Ink
 * when checked, 1px Line when empty. Supports an indeterminate ("select all")
 * state.
 */
export function Checkbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  onChange,
  size = 18,
  style,
  ...rest
}) {
  const on = checked || indeterminate;
  return (
    <label
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        userSelect: 'none', ...style,
      }}
    >
      <span
        onClick={() => { if (!disabled && onChange) onChange(!checked); }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: size, height: size, flex: 'none', borderRadius: 'var(--radius-md)',
          background: on ? 'var(--color-ink)' : 'var(--surface-card)',
          border: on ? '1px solid var(--color-ink)' : '1px solid var(--border-strong)',
          color: 'var(--color-paper-white)',
          transition: 'background 100ms ease, border-color 100ms ease',
        }}
        {...rest}
      >
        {indeterminate ? <Icon name="minus" size={size - 6} /> : checked ? <Icon name="check" size={size - 5} /> : null}
      </span>
      {label ? <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{label}</span> : null}
    </label>
  );
}
