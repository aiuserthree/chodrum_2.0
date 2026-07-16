#!/usr/bin/env node
/**
 * CHODRUM SEO Phase 2 — build-time prerender
 *
 * Env:
 *   SITE_URL (default https://renewal.chodrum.com)
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (preferred)
 *   SUPABASE_URL + SUPABASE_ANON_KEY (fallback — preview sign may fail)
 *
 * Outputs:
 *   html/sheets/{slug}/index.html
 *   html/home/index.html, html/fo/FO-02-sheet-list.html (head meta patch)
 *   html/sitemap.xml, html/robots.txt
 *   html/_seo/id-to-slug.json (via generate-id-slug-map.mjs)
 *
 * Fail gracefully: always writes files even when Supabase is unavailable.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'html');
const SHEETS_DIR = path.join(HTML, 'sheets');
const DETAIL_TEMPLATE = path.join(HTML, 'fo', 'FO-03-sheet-detail.html');
const HOME_FILE = path.join(HTML, 'home', 'index.html');
const LIST_FILE = path.join(HTML, 'fo', 'FO-02-sheet-list.html');
const SITEMAP_FILE = path.join(HTML, 'sitemap.xml');
const ROBOTS_FILE = path.join(HTML, 'robots.txt');

const SEO_MARKER_START = '<!-- chodrum-seo:start -->';
const SEO_MARKER_END = '<!-- chodrum-seo:end -->';
const PREVIEW_SIGN_TTL = 604800; /* 7 days for og:image */

function env(name, fallback = '') {
  const v = process.env[name];
  if (v && String(v).trim() && !/^YOUR_/i.test(v)) return String(v).trim();
  return fallback;
}

const SITE_URL = env('SITE_URL', 'https://renewal.chodrum.com').replace(/\/$/, '');

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sheetsStoragePath(urlOrPath, folderHint) {
  if (!urlOrPath) return '';
  const raw = String(urlOrPath).trim();
  if (!raw) return '';
  if (/^(pdf|preview)\//.test(raw)) return raw.split('?')[0];
  const m = raw.match(/\/storage\/v1\/object\/(?:public|sign)\/sheets\/([^?]+)/);
  if (m && m[1]) return decodeURIComponent(m[1]);
  let idx = raw.indexOf('preview/');
  if (idx >= 0) return raw.slice(idx).split('?')[0];
  idx = raw.indexOf('pdf/');
  if (idx >= 0) return raw.slice(idx).split('?')[0];
  if (folderHint && raw.indexOf('/') === -1) return folderHint + '/' + raw;
  return '';
}

function normalizePreviewUrls(row) {
  let urls = [];
  const fromArr = row.preview_urls != null ? row.preview_urls : row.previewUrls;
  if (Array.isArray(fromArr)) {
    urls = fromArr.filter(Boolean);
  } else if (typeof fromArr === 'string' && fromArr) {
    urls = [fromArr];
  }
  if (!urls.length && row.preview_url) urls = [row.preview_url];
  return urls;
}

function previewPathForSheet(row) {
  const og = row.og_image_path || row.ogImagePath;
  if (og && String(og).trim()) {
    const p = sheetsStoragePath(og, 'preview');
    if (p) return p;
  }
  const urls = normalizePreviewUrls(row);
  for (const u of urls) {
    const p = sheetsStoragePath(u, 'preview');
    if (p && p.startsWith('preview/')) return p;
  }
  return '';
}

function formatPrice(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('ko-KR');
}

function formatIsoDate(d) {
  if (!d) return new Date().toISOString().slice(0, 10);
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return new Date().toISOString().slice(0, 10);
  return t.toISOString().slice(0, 10);
}

async function fetchSheets() {
  const base = env('SUPABASE_URL').replace(/\/$/, '');
  const key = env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_ANON_KEY');
  if (!base || !key) {
    console.warn('[CHODRUM] prerender: Supabase env missing — skipping sheet fetch');
    return [];
  }

  const select =
    'id,slug,title,artist,genre,level,pages,price,code,status,seo_title,seo_description,og_image_path,preview_urls,preview_url,updated_at';
  const url =
    base +
    '/rest/v1/sheets?select=' +
    encodeURIComponent(select) +
    '&status=eq.' +
    encodeURIComponent('판매중') +
    '&slug=not.is.null&order=updated_at.desc';

  try {
    const res = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      console.warn('[CHODRUM] prerender: sheets fetch failed', res.status, await res.text().catch(() => ''));
      return [];
    }
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    console.warn('[CHODRUM] prerender: sheets fetch error', err);
    return [];
  }
}

async function signPreviewPaths(paths) {
  const base = env('SUPABASE_URL').replace(/\/$/, '');
  const key = env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_ANON_KEY');
  if (!base || !key || !paths.length) return {};

  function absolutizeSignedUrl(url) {
    if (!url) return '';
    const u = String(url).trim();
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith('/object/')) return base + '/storage/v1' + u;
    if (u.startsWith('/storage/')) return base + u;
    return u;
  }

  const signedMap = {};
  const CHUNK = 100;
  for (let c = 0; c < paths.length; c += CHUNK) {
    const chunk = paths.slice(c, c + CHUNK);
    try {
      const res = await fetch(base + '/storage/v1/object/sign/sheets', {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: 'Bearer ' + key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paths: chunk, expiresIn: PREVIEW_SIGN_TTL }),
      });
      if (!res.ok) {
        console.warn('[CHODRUM] prerender: sign batch failed', res.status, await res.text().catch(() => ''));
        continue;
      }
      const data = await res.json();
      const items = Array.isArray(data) ? data : data?.data || [];
      items.forEach((item) => {
        if (!item) return;
        const p = item.path || item.name || '';
        const url = absolutizeSignedUrl(item.signedUrl || item.signedURL || '');
        if (p && url && !item.error) signedMap[p] = url;
      });
    } catch (err) {
      console.warn('[CHODRUM] prerender: sign error', err);
    }
  }
  return signedMap;
}

function buildSeoBlock({ title, description, canonical, ogType, ogImage }) {
  const lines = [
    SEO_MARKER_START,
    '<title>' + escapeHtml(title) + '</title>',
    '<meta name="description" content="' + escapeHtml(description) + '">',
    '<link rel="canonical" href="' + escapeHtml(canonical) + '">',
    '<meta property="og:type" content="' + escapeHtml(ogType) + '">',
    '<meta property="og:title" content="' + escapeHtml(title) + '">',
    '<meta property="og:description" content="' + escapeHtml(description) + '">',
    '<meta property="og:url" content="' + escapeHtml(canonical) + '">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + escapeHtml(title) + '">',
    '<meta name="twitter:description" content="' + escapeHtml(description) + '">',
  ];
  if (ogImage) {
    lines.push('<meta property="og:image" content="' + escapeHtml(ogImage) + '">');
    lines.push('<meta name="twitter:image" content="' + escapeHtml(ogImage) + '">');
  }
  lines.push(SEO_MARKER_END);
  return lines.join('\n');
}

function patchHeadSeo(html, seoBlock) {
  const blockRe = new RegExp(
    SEO_MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      '[\\s\\S]*?' +
      SEO_MARKER_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'i'
  );
  if (blockRe.test(html)) {
    return html.replace(blockRe, seoBlock);
  }
  html = html.replace(/<title>[^<]*<\/title>\s*/i, '');
  return html.replace(
    /(<meta name="viewport"[^>]*>)/i,
    '$1\n' + seoBlock
  );
}

function sheetTitle(s) {
  if (s.seo_title) return s.seo_title;
  return (s.title || '악보') + ' — ' + (s.artist || '') + ' | CHODRUM';
}

function sheetDescription(s) {
  if (s.seo_description) return s.seo_description;
  const parts = [
    s.artist || '',
    s.title || '',
    '드럼 악보 PDF.',
    [s.level, s.genre].filter(Boolean).join(' · '),
    s.pages ? s.pages + '페이지' : '',
    '₩' + formatPrice(s.price),
  ].filter(Boolean);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function buildJsonLd(s, canonical, imageUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: s.title || '',
    description: sheetDescription(s),
    image: imageUrl ? [imageUrl] : [],
    brand: { '@type': 'Brand', name: s.artist || '' },
    sku: s.code || s.id || '',
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'KRW',
      price: String(Number(s.price) || 0),
      availability: 'https://schema.org/InStock',
    },
  };
}

function buildDetailHtml(s, signedImage) {
  const slug = s.slug;
  const canonical = SITE_URL + '/sheets/' + encodeURIComponent(slug);
  const title = sheetTitle(s);
  const description = sheetDescription(s);
  const seoBlock = buildSeoBlock({
    title,
    description,
    canonical,
    ogType: 'product',
    ogImage: signedImage || '',
  });
  const jsonLd = buildJsonLd(s, canonical, signedImage);

  let html = fs.readFileSync(DETAIL_TEMPLATE, 'utf8');
  html = patchHeadSeo(html, seoBlock);

  const jsonLdScript =
    '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>';
  html = html.replace(/<\/head>/i, jsonLdScript + '\n</head>');

  const noscript = [
    '<noscript>',
    '  <article>',
    '    <h1>' + escapeHtml(s.title) + '</h1>',
    '    <p>' + escapeHtml(s.artist) + '</p>',
    '    <p>₩' + escapeHtml(formatPrice(s.price)) + '</p>',
    signedImage
      ? '    <img src="' + escapeHtml(signedImage) + '" alt="' + escapeHtml(s.title) + ' 미리보기" width="400">'
      : '',
    '  </article>',
    '</noscript>',
  ]
    .filter(Boolean)
    .join('\n');

  html = html.replace(
    /<div id="app"><\/div>/i,
    noscript + '\n<div id="app" data-slug="' + escapeHtml(slug) + '" data-sheet-id="' + escapeHtml(s.id) + '"></div>'
  );

  return html;
}

function buildHomeSeoBlock() {
  return buildSeoBlock({
    title: 'CHODRUM — 드럼 악보 PDF 다운로드',
    description: '드럼 악보를 검색하고 결제 후 7일간 PDF로 다운로드하세요.',
    canonical: SITE_URL + '/home',
    ogType: 'website',
    ogImage: '',
  });
}

function buildListSeoBlock() {
  return buildSeoBlock({
    title: '드럼 악보 목록 | CHODRUM',
    description: '장르·난이도별 드럼 악보 카탈로그',
    canonical: SITE_URL + '/sheets',
    ogType: 'website',
    ogImage: '',
  });
}

function buildSitemap(sheets) {
  const urls = [
    { loc: SITE_URL + '/home', priority: '1.0', changefreq: 'daily' },
    { loc: SITE_URL + '/sheets', priority: '0.9', changefreq: 'daily' },
  ];
  sheets.forEach((s) => {
    if (!s.slug) return;
    urls.push({
      loc: SITE_URL + '/sheets/' + encodeURIComponent(s.slug),
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: formatIsoDate(s.updated_at),
    });
  });

  const body = urls
    .map((u) => {
      let entry = '  <url>\n    <loc>' + escapeXml(u.loc) + '</loc>\n';
      if (u.lastmod) entry += '    <lastmod>' + escapeXml(u.lastmod) + '</lastmod>\n';
      entry += '    <changefreq>' + escapeXml(u.changefreq) + '</changefreq>\n';
      entry += '    <priority>' + escapeXml(u.priority) + '</priority>\n';
      entry += '  </url>';
      return entry;
    })
    .join('\n');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body +
    '\n</urlset>\n'
  );
}

function buildRobots() {
  return (
    'User-agent: *\n' +
    'Allow: /home\n' +
    'Allow: /sheets\n' +
    'Disallow: /bo/\n' +
    'Disallow: /cart\n' +
    'Disallow: /checkout\n' +
    'Disallow: /mypage\n' +
    'Disallow: /login\n' +
    'Sitemap: ' +
    SITE_URL +
    '/sitemap.xml\n'
  );
}

function cleanStaleSheetDirs(activeSlugs) {
  if (!fs.existsSync(SHEETS_DIR)) return;
  const active = new Set(activeSlugs);
  for (const name of fs.readdirSync(SHEETS_DIR)) {
    if (name.startsWith('_')) continue;
    if (!active.has(name)) {
      const dir = path.join(SHEETS_DIR, name);
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log('[CHODRUM] prerender: removed stale ' + name);
      } catch (err) {
        console.warn('[CHODRUM] prerender: could not remove stale dir', name, err);
      }
    }
  }
}

function writeSheetPages(sheets, signedMap) {
  fs.mkdirSync(SHEETS_DIR, { recursive: true });
  const slugs = [];
  sheets.forEach((s) => {
    if (!s.slug) return;
    slugs.push(s.slug);
    const previewPath = previewPathForSheet(s);
    const signedImage = previewPath ? signedMap[previewPath] || '' : '';
    const outDir = path.join(SHEETS_DIR, s.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), buildDetailHtml(s, signedImage), 'utf8');
  });
  cleanStaleSheetDirs(slugs);
  return slugs.length;
}

function patchStaticPages() {
  if (fs.existsSync(HOME_FILE)) {
    const home = fs.readFileSync(HOME_FILE, 'utf8');
    fs.writeFileSync(HOME_FILE, patchHeadSeo(home, buildHomeSeoBlock()), 'utf8');
  }
  if (fs.existsSync(LIST_FILE)) {
    const list = fs.readFileSync(LIST_FILE, 'utf8');
    fs.writeFileSync(LIST_FILE, patchHeadSeo(list, buildListSeoBlock()), 'utf8');
  }
}

function runIdSlugMap() {
  try {
    execSync('node scripts/generate-id-slug-map.mjs', { cwd: ROOT, stdio: 'inherit' });
  } catch (err) {
    console.warn('[CHODRUM] prerender: id-to-slug map generation failed', err.message || err);
  }
}

async function main() {
  console.log('[CHODRUM] prerender-seo: SITE_URL=' + SITE_URL);

  let sheets = [];
  try {
    sheets = await fetchSheets();
  } catch (err) {
    console.warn('[CHODRUM] prerender: unexpected fetch error', err);
  }

  const pathSet = {};
  sheets.forEach((s) => {
    const p = previewPathForSheet(s);
    if (p && !pathSet[p]) pathSet[p] = true;
  });
  const paths = Object.keys(pathSet);

  let signedMap = {};
  try {
    signedMap = await signPreviewPaths(paths);
    if (paths.length) {
      console.log(
        '[CHODRUM] prerender: signed ' + Object.keys(signedMap).length + '/' + paths.length + ' preview paths'
      );
    }
  } catch (err) {
    console.warn('[CHODRUM] prerender: preview sign failed', err);
  }

  let count = 0;
  try {
    count = writeSheetPages(sheets, signedMap);
  } catch (err) {
    console.warn('[CHODRUM] prerender: sheet pages write failed', err);
    fs.mkdirSync(SHEETS_DIR, { recursive: true });
  }

  try {
    patchStaticPages();
  } catch (err) {
    console.warn('[CHODRUM] prerender: static page patch failed', err);
  }

  try {
    fs.writeFileSync(SITEMAP_FILE, buildSitemap(sheets), 'utf8');
    fs.writeFileSync(ROBOTS_FILE, buildRobots(), 'utf8');
  } catch (err) {
    console.warn('[CHODRUM] prerender: sitemap/robots write failed', err);
    fs.writeFileSync(SITEMAP_FILE, buildSitemap([]), 'utf8');
    fs.writeFileSync(ROBOTS_FILE, buildRobots(), 'utf8');
  }

  runIdSlugMap();

  console.log(
    '[CHODRUM] prerender-seo done: ' +
      count +
      ' sheet pages, sitemap.xml, robots.txt' +
      (sheets.length ? '' : ' (no Supabase data — minimal output)')
  );
}

main().catch((err) => {
  console.error('[CHODRUM] prerender-seo fatal — writing minimal fallbacks', err);
  try {
    fs.mkdirSync(SHEETS_DIR, { recursive: true });
    fs.writeFileSync(SITEMAP_FILE, buildSitemap([]), 'utf8');
    fs.writeFileSync(ROBOTS_FILE, buildRobots(), 'utf8');
    runIdSlugMap();
  } catch (writeErr) {
    console.error('[CHODRUM] prerender-seo fallback write failed', writeErr);
    process.exit(1);
  }
});
