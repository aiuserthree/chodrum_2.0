import React from 'react';
import { Icon } from '../display/Icon.jsx';

/**
 * SocialButton — account entry via Kakao / Naver / Google, or email. Uses each
 * provider's mandated brand colour (the one place colour enters the chrome).
 * Kakao & Naver glyphs load from the Simple Icons CDN (inlined as SVG); supply
 * Google's official mark via `iconUrl` for production.
 */
const PROVIDERS = {
  kakao: { bg: '#FEE500', fg: '#191919', border: false, si: 'kakaotalk', label: '카카오로 계속하기' },
  naver: { bg: '#03C75A', fg: '#FFFFFF', border: false, si: 'naver', label: '네이버로 계속하기' },
  google: { bg: '#FFFFFF', fg: '#171717', border: true, si: null, label: 'Google로 계속하기' },
  email: { bg: '#171717', fg: '#FFFFFF', border: false, lucide: 'mail', label: '이메일로 계속하기' },
};

export function SocialButton({ provider = 'kakao', children, iconUrl, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const [svg, setSvg] = React.useState('');
  const p = PROVIDERS[provider] || PROVIDERS.kakao;
  const src = iconUrl || (p.si ? 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons/' + p.si + '.svg' : null);

  React.useEffect(() => {
    if (!src) { setSvg(''); return; }
    let alive = true;
    fetch(src).then((r) => (r.ok ? r.text() : '')).then((t) => { if (alive) setSvg(t); }).catch(() => {});
    return () => { alive = false; };
  }, [src]);

  const glyph = svg
    ? svg.replace(/<svg([^>]*)>/, (_m, a) => '<svg' + a.replace(/\swidth="[^"]*"/, '').replace(/\sheight="[^"]*"/, '') + ' width="18" height="18" fill="currentColor">')
    : '';

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, width: '100%', height: 48, padding: '0 44px',
        background: p.bg, color: p.fg,
        border: p.border ? '1px solid var(--border-default)' : '1px solid transparent',
        borderRadius: 'var(--radius-buttons)', cursor: 'pointer',
        fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, letterSpacing: '-0.2px',
        filter: hover ? 'brightness(0.96)' : 'none',
        transition: 'filter 120ms ease', WebkitTapHighlightColor: 'transparent', ...style,
      }}
      {...rest}
    >
      {p.lucide ? (
        <span style={{ position: 'absolute', left: 16, display: 'inline-flex' }}><Icon name={p.lucide} size={18} /></span>
      ) : glyph ? (
        <span
          aria-hidden="true"
          style={{ position: 'absolute', left: 16, width: 18, height: 18, display: 'inline-flex', color: p.fg }}
          dangerouslySetInnerHTML={{ __html: glyph }}
        />
      ) : null}
      {children || p.label}
    </button>
  );
}
