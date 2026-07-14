import React from 'react';

/**
 * Divider — a 1px Line separator. Horizontal or vertical; horizontal supports a
 * centred label ("또는" between login options).
 */
export function Divider({ label, spacing = 16, orientation = 'horizontal', style }) {
  if (orientation === 'vertical') {
    return (
      <span
        style={{
          display: 'inline-block', width: 1, alignSelf: 'stretch',
          background: 'var(--border-default)', margin: `0 ${spacing}px`, ...style,
        }}
      />
    );
  }
  if (label) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: `${spacing}px 0`, ...style }}>
        <span style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
      </div>
    );
  }
  return <div style={{ height: 1, background: 'var(--border-default)', margin: `${spacing}px 0`, ...style }} />;
}
