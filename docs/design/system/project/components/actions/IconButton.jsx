import React from 'react';
import { Icon } from '../display/Icon.jsx';

const SIZES = {
  sm: { box: 32, icon: 16 },
  md: { box: 38, icon: 18 },
  lg: { box: 46, icon: 20 },
};

/**
 * IconButton — a square, label-less action (favourite, close, menu, quantity).
 * Same hierarchy language as Button: solid / bordered / ghost.
 */
export function IconButton({
  name = 'circle',
  variant = 'ghost',
  size = 'md',
  disabled = false,
  round = false,
  label,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const s = SIZES[size] || SIZES.md;

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: s.box,
    height: s.box,
    padding: 0,
    borderRadius: round ? 'var(--radius-pill)' : 'var(--radius-buttons)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease, transform 80ms ease',
    transform: active && !disabled ? 'scale(0.94)' : 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  let look;
  if (disabled) {
    look = { background: 'var(--action-disabled-bg)', color: 'var(--action-disabled-text)' };
  } else if (variant === 'primary') {
    look = { background: hover ? 'var(--action-primary-hover)' : 'var(--action-primary)', color: 'var(--action-primary-text)' };
  } else if (variant === 'secondary') {
    look = { background: 'var(--surface-card)', color: 'var(--color-ink)', borderColor: hover ? 'var(--border-strong)' : 'var(--border-default)' };
  } else {
    look = { background: hover ? 'rgba(0,0,0,0.04)' : 'transparent', color: hover ? 'var(--color-ink)' : 'var(--color-icon)' };
  }

  return (
    <button
      type="button"
      aria-label={label || name}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{ ...base, ...look, ...style }}
      {...rest}
    >
      <Icon name={name} size={s.icon} />
    </button>
  );
}
