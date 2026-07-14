import React from 'react';
import { Icon } from './Icon.jsx';

/**
 * Chip — a pill-shaped filter / category toggle (카테고리, 장르, 난이도) and
 * suggestion chip. Solid Ink when selected, bordered white when not.
 */
export function Chip({ children, selected = false, icon, count, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const borderColor = selected ? 'var(--color-ink)' : hover ? 'var(--border-strong)' : 'var(--border-faint)';
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 34, padding: '0 14px', borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, lineHeight: 1,
        background: selected ? 'var(--color-ink)' : 'var(--surface-card)',
        color: selected ? 'var(--color-paper-white)' : 'var(--text-primary)',
        border: `1px solid ${borderColor}`,
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
        WebkitTapHighlightColor: 'transparent', ...style,
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
      {count != null ? (
        <span style={{ opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      ) : null}
    </button>
  );
}
