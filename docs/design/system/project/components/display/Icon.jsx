import React from 'react';

/**
 * Icon — thin-stroke glyphs from the Lucide set, fetched once from CDN and
 * inlined as real <svg> (so they inherit `currentColor`, size freely, and
 * render in screenshots / PPTX / PDF exports as well as live browsers).
 * Use Lucide names (e.g. "heart", "shopping-cart").
 */
const _iconCache = {};
const _iconPending = {};

function _loadIcon(name) {
  if (name in _iconCache) return Promise.resolve(_iconCache[name]);
  if (_iconPending[name]) return _iconPending[name];
  const url = 'https://cdn.jsdelivr.net/npm/lucide-static/icons/' + name + '.svg';
  _iconPending[name] = fetch(url)
    .then((r) => (r.ok ? r.text() : ''))
    .then((txt) => { _iconCache[name] = txt || ''; return _iconCache[name]; })
    .catch(() => { _iconCache[name] = ''; return ''; });
  return _iconPending[name];
}

export function Icon({ name = 'circle', size = 18, label, style, ...rest }) {
  const [svg, setSvg] = React.useState(name in _iconCache ? _iconCache[name] : '');
  React.useEffect(() => {
    let alive = true;
    if (name in _iconCache) { setSvg(_iconCache[name]); return; }
    _loadIcon(name).then((s) => { if (alive) setSvg(s); });
    return () => { alive = false; };
  }, [name]);

  const markup = svg
    ? svg.replace(/<svg([^>]*)>/, (_m, attrs) => {
        const cleaned = attrs.replace(/\swidth="[^"]*"/, '').replace(/\sheight="[^"]*"/, '');
        return '<svg' + cleaned + ' width="100%" height="100%">';
      })
    : '';

  return (
    <span
      role="img"
      aria-label={label || name}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flex: 'none', lineHeight: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: markup }}
      {...rest}
    />
  );
}
