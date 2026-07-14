import React from 'react';

/**
 * Card — the primary content container (sheet-music cards, order summaries,
 * panels). White surface, 12px radius, hairline shadow. Set `interactive` for
 * a subtle hover lift on clickable cards.
 */
export function Card({
  children,
  padding = 16,
  elevation = 'card',
  interactive = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  let shadow = 'var(--shadow-subtle)';
  if (elevation === 'none') shadow = 'none';
  else if (elevation === 'outline') shadow = 'var(--shadow-subtle-2)';
  else if (interactive && hover) shadow = 'var(--shadow-subtle-3)';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-cards)',
        boxShadow: shadow,
        padding,
        transition: 'box-shadow 140ms ease, transform 140ms ease',
        transform: interactive && hover ? 'translateY(-1px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
