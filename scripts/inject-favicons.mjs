#!/usr/bin/env node
/**
 * Inject FO/BO favicon link tags into all html HTML files (idempotent).
 * Run: node scripts/inject-favicons.mjs
 * Wired into npm run build before prerender-seo.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_ROOT = path.join(__dirname, '..', 'html');

/** Bump when apple-touch / favicon binaries change (Safari caches hard). */
const ICON_V = '20260721c';

const MARKER_START = '<!-- chodrum-favicon:start -->';
const MARKER_END = '<!-- chodrum-favicon:end -->';

const FO_BLOCK = `${MARKER_START}
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=${ICON_V}" sizes="180x180">
<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png?v=${ICON_V}" sizes="180x180">
<link rel="apple-touch-icon" href="/apple-touch-icon-167x167.png?v=${ICON_V}" sizes="167x167">
<link rel="apple-touch-icon" href="/apple-touch-icon-152x152.png?v=${ICON_V}" sizes="152x152">
<link rel="apple-touch-icon" href="/apple-touch-icon-120x120.png?v=${ICON_V}" sizes="120x120">
<link rel="apple-touch-icon" href="/shared/apple-touch-icon-fo.png?v=${ICON_V}" sizes="180x180">
<link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png?v=${ICON_V}">
<link rel="icon" href="/shared/favicon-fo.svg?v=${ICON_V}" type="image/svg+xml">
<link rel="icon" href="/shared/favicon-fo-32.png?v=${ICON_V}" type="image/png" sizes="32x32">
<link rel="icon" href="/shared/favicon-fo-16.png?v=${ICON_V}" type="image/png" sizes="16x16">
<link rel="shortcut icon" href="/favicon.ico?v=${ICON_V}">
<meta name="apple-mobile-web-app-title" content="CHODRUM">
${MARKER_END}`;

const BO_BLOCK = `${MARKER_START}
<link rel="apple-touch-icon" href="/shared/apple-touch-icon-bo.png?v=${ICON_V}" sizes="180x180">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=${ICON_V}" sizes="180x180">
<link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png?v=${ICON_V}">
<link rel="icon" href="/shared/favicon-bo.svg?v=${ICON_V}" type="image/svg+xml">
<link rel="icon" href="/shared/favicon-bo-32.png?v=${ICON_V}" type="image/png" sizes="32x32">
<link rel="icon" href="/shared/favicon-bo-16.png?v=${ICON_V}" type="image/png" sizes="16x16">
<link rel="shortcut icon" href="/favicon.ico?v=${ICON_V}">
<meta name="apple-mobile-web-app-title" content="CHODRUM Admin">
${MARKER_END}`;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function faviconKind(filePath) {
  const rel = path.relative(HTML_ROOT, filePath).split(path.sep).join('/');
  if (rel.startsWith('bo/')) return 'bo';
  return 'fo';
}

function inject(html, block) {
  if (html.includes(MARKER_START)) {
    const re = new RegExp(
      `${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${MARKER_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'g'
    );
    return html.replace(re, block);
  }
  const anchor = /<meta\s+name="viewport"[^>]*>/i;
  if (anchor.test(html)) {
    return html.replace(anchor, (m) => `${m}\n${block}`);
  }
  return html.replace(/<head>/i, (m) => `${m}\n${block}`);
}

function main() {
  const files = walk(HTML_ROOT);
  let updated = 0;
  for (const file of files) {
    const kind = faviconKind(file);
    const block = kind === 'bo' ? BO_BLOCK : FO_BLOCK;
    const html = fs.readFileSync(file, 'utf8');
    const next = inject(html, block);
    if (next !== html) {
      fs.writeFileSync(file, next, 'utf8');
      updated += 1;
      console.log('  favicon', kind, path.relative(HTML_ROOT, file));
    }
  }
  console.log(`Favicons: ${updated} file(s) updated (${files.length} scanned).`);
}

main();
