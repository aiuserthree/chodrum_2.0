import React from 'react';
import { IconButton } from '../actions/IconButton.jsx';

/**
 * QuantityStepper — minus / value / plus control for the sheet-music detail and
 * cart rows. Clamps between min and max.
 */
export function QuantityStepper({
  value = 1,
  min = 1,
  max = 99,
  size = 'md',
  onChange,
  disabled = false,
  style,
}) {
  const btnSize = size === 'sm' ? 'sm' : 'md';
  const w = size === 'sm' ? 40 : 48;
  const fs = size === 'sm' ? 14 : 16;
  const set = (n) => { if (!disabled && onChange) onChange(Math.max(min, Math.min(max, n))); };

  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-buttons)',
        padding: 4, background: 'var(--surface-card)', opacity: disabled ? 0.5 : 1, ...style,
      }}
    >
      <IconButton name="minus" variant="ghost" size={btnSize} label="수량 감소" disabled={disabled || value <= min} onClick={() => set(value - 1)} />
      <span className="ds-mono" style={{ width: w, textAlign: 'center', fontSize: fs, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
      <IconButton name="plus" variant="ghost" size={btnSize} label="수량 증가" disabled={disabled || value >= max} onClick={() => set(value + 1)} />
    </div>
  );
}
