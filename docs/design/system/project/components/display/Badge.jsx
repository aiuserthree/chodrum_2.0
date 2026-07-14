import React from 'react';
import { Icon } from './Icon.jsx';

const TONES = {
  neutral: { bg: '#f1f1f1', color: 'var(--text-secondary)', border: 'transparent' },
  solid:   { bg: 'var(--color-ink)', color: 'var(--color-paper-white)', border: 'transparent' },
  outline: { bg: 'transparent', color: 'var(--text-primary)', border: 'var(--border-strong)' },
  success: { bg: 'var(--status-success-bg)', color: 'var(--status-success)', border: 'transparent' },
  warning: { bg: 'var(--status-warning-bg)', color: 'var(--status-warning)', border: 'transparent' },
  danger:  { bg: 'var(--status-danger-bg)', color: 'var(--status-danger)', border: 'transparent' },
};

/**
 * Badge — a small non-interactive label. `solid` for 인기 / NEW, `outline` for
 * difficulty/genre, and the status tones for order & download state.
 */
export function Badge({ children, variant = 'neutral', size = 'md', icon, style }) {
  const s = size === 'sm' ? { fs: 11, pad: '2px 6px' } : { fs: 12, pad: '3px 8px' };
  const t = TONES[variant] || TONES.neutral;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontFamily: 'var(--font-sans)', fontSize: s.fs, fontWeight: 500, lineHeight: 1.3,
        padding: s.pad, borderRadius: 'var(--radius-chips)',
        background: t.bg, color: t.color, border: `1px solid ${t.border}`,
        whiteSpace: 'nowrap', ...style,
      }}
    >
      {icon ? <Icon name={icon} size={s.fs + 1} /> : null}
      {children}
    </span>
  );
}
