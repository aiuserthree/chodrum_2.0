import React from 'react';
import { Icon } from '../display/Icon.jsx';

const SIZES = {
  sm: { padding: '6px 10px', fontSize: 13, icon: 15, gap: 6 },
  md: { padding: '8px 12px', fontSize: 14, icon: 16, gap: 6 },
  lg: { padding: '11px 16px', fontSize: 16, icon: 18, gap: 8 },
};

/**
 * Button — the brand's action control. Solid Ink for primary, bordered white
 * for secondary, text-only for ghost. 8px radius, weight 500, never a shadow.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  type = 'button',
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const s = SIZES[size] || SIZES.md;

  const base = {
    display: fullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    fontFamily: 'var(--font-sans)',
    fontSize: s.fontSize,
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.1px',
    padding: s.padding,
    borderRadius: 'var(--radius-buttons)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease, transform 80ms ease',
    transform: active && !disabled ? 'scale(0.985)' : 'none',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  };

  let look;
  if (disabled) {
    look = { background: 'var(--action-disabled-bg)', color: 'var(--action-disabled-text)' };
  } else if (variant === 'secondary') {
    look = {
      background: 'var(--action-secondary-bg)',
      color: 'var(--action-secondary-text)',
      borderColor: hover ? 'var(--border-strong)' : 'var(--border-default)',
    };
  } else if (variant === 'ghost') {
    look = {
      background: hover ? 'rgba(0,0,0,0.04)' : 'transparent',
      color: hover ? 'var(--action-ghost-hover)' : 'var(--action-ghost-text)',
    };
  } else {
    look = {
      background: hover ? 'var(--action-primary-hover)' : 'var(--action-primary)',
      color: 'var(--action-primary-text)',
    };
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{ ...base, ...look, ...style }}
      {...rest}
    >
      {iconLeft ? <Icon name={iconLeft} size={s.icon} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={s.icon} /> : null}
    </button>
  );
}
