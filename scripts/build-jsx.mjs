#!/usr/bin/env node
/**
 * Precompile JSX to plain JS so pages do not need Babel Standalone (~3MB)
 * or in-browser transpile of fo-shared / bo-shared / page scripts.
 *
 * Source of truth:
 *   - html/fo/fo-shared.jsx, html/bo/bo-shared.jsx
 *   - html/fo|bo|home *.page.jsx (extracted once from inline text/babel blocks)
 *
 * Run: npm run build  (also Vercel buildCommand)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const HTML_ROOT = path.join(ROOT, 'html');

const REACT_PROD = {
  react:
    'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  reactIntegrity:
    'sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z',
  reactDom:
    'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  reactDomIntegrity:
    'sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1',
};

const DEV_REACT_RE =
  /https:\/\/unpkg\.com\/react@18\.3\.1\/umd\/react\.development\.js[^"']*/g;
const DEV_REACT_DOM_RE =
  /https:\/\/unpkg\.com\/react-dom@18\.3\.1\/umd\/react-dom\.development\.js[^"']*/g;
const BABEL_SCRIPT_RE =
  /\s*<script[^>]*src="https:\/\/unpkg\.com\/@babel\/standalone@[^"]+"[^>]*><\/script>\s*/g;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function relUrlFromHtml(htmlFile, targetAbs) {
  let rel = path.relative(path.dirname(htmlFile), targetAbs).split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

/**
 * Extract inline text/babel (no src=) → sibling .page.jsx.
 * Prefer the last opening tag without src through its closing </script>.
 */
function extractInlineBabel(htmlFile, html) {
  const pageJsx = htmlFile.replace(/\.html$/i, '.page.jsx');
  /* Match script tags that are type=text/babel and do NOT have a src attribute */
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  let inline = null;
  let count = 0;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] || '';
    if (!/type\s*=\s*["']text\/babel["']/i.test(attrs)) continue;
    if (/\bsrc\s*=/i.test(attrs)) continue;
    count += 1;
    inline = m[2];
  }
  if (count > 1) {
    throw new Error(`Multiple inline text/babel blocks in ${htmlFile}`);
  }
  if (inline != null && !fs.existsSync(pageJsx)) {
    fs.writeFileSync(pageJsx, inline.replace(/^\n/, ''), 'utf8');
    console.log('  extracted', path.relative(ROOT, pageJsx));
  }
  return pageJsx;
}

function rewriteHtml(htmlFile, html) {
  const pageJsx = extractInlineBabel(htmlFile, html);
  const pageJs = pageJsx.replace(/\.page\.jsx$/i, '.page.js');
  const hasPage = fs.existsSync(pageJsx);

  let out = html;

  /* Production React */
  out = out.replace(
    /<script src="https:\/\/unpkg\.com\/react@18\.3\.1\/umd\/react\.development\.js"[^>]*><\/script>/g,
    `<script src="${REACT_PROD.react}" integrity="${REACT_PROD.reactIntegrity}" crossorigin="anonymous"></script>`
  );
  out = out.replace(
    /<script src="https:\/\/unpkg\.com\/react-dom@18\.3\.1\/umd\/react-dom\.development\.js"[^>]*><\/script>/g,
    `<script src="${REACT_PROD.reactDom}" integrity="${REACT_PROD.reactDomIntegrity}" crossorigin="anonymous"></script>`
  );
  /* Also rewrite if already production but wrong integrity / leftover babel */
  out = out.replace(DEV_REACT_RE, REACT_PROD.react);
  out = out.replace(DEV_REACT_DOM_RE, REACT_PROD.reactDom);
  out = out.replace(BABEL_SCRIPT_RE, '\n');

  /* Shared jsx → compiled js */
  out = out.replace(
    /<script\s+type="text\/babel"\s+src="(\/fo\/fo-shared)\.jsx"><\/script>/g,
    (_, base) => {
      /* Prefer relative path from this HTML for local serve */
      const abs = path.join(HTML_ROOT, 'fo', 'fo-shared.js');
      const href = htmlFile.includes(`${path.sep}home${path.sep}`)
        ? '/fo/fo-shared.js'
        : relUrlFromHtml(htmlFile, abs);
      return `<script src="${href}"></script>`;
    }
  );
  out = out.replace(
    /<script\s+type="text\/babel"\s+src="(\/bo\/bo-shared)\.jsx"><\/script>/g,
    () => {
      const abs = path.join(HTML_ROOT, 'bo', 'bo-shared.js');
      return `<script src="${relUrlFromHtml(htmlFile, abs)}"></script>`;
    }
  );
  /* Already rewritten shared but still .jsx */
  out = out.replace(
    /(<script\s+src=")([^"]*fo-shared)\.jsx("><\/script>)/g,
    '$1$2.js$3'
  );
  out = out.replace(
    /(<script\s+src=")([^"]*bo-shared)\.jsx("><\/script>)/g,
    '$1$2.js$3'
  );

  /* Inline babel → page.js */
  if (hasPage) {
    const href = relUrlFromHtml(htmlFile, pageJs);
    out = out.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs) => {
      if (!/type\s*=\s*["']text\/babel["']/i.test(attrs || '')) return full;
      if (/\bsrc\s*=/i.test(attrs || '')) return full;
      return `<script src="${href}"></script>`;
    });
  }

  /* Strip any remaining type="text/babel" on src scripts */
  out = out.replace(
    /<script\s+type="text\/babel"\s+src="([^"]+\.jsx)"><\/script>/gi,
    (_, src) => `<script src="${src.replace(/\.jsx$/i, '.js')}"></script>`
  );

  if (out !== html) {
    fs.writeFileSync(htmlFile, out, 'utf8');
    console.log('  patched', path.relative(ROOT, htmlFile));
  }
  return hasPage ? pageJsx : null;
}

async function compileJsx(entry, outfile) {
  await esbuild.build({
    entryPoints: [entry],
    outfile,
    bundle: false,
    format: 'iife',
    platform: 'browser',
    target: ['es2018'],
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    loader: { '.jsx': 'jsx', '.js': 'jsx' },
    logLevel: 'warning',
  });
}

async function main() {
  const watch = process.argv.includes('--watch');
  console.log('CHODRUM JSX build' + (watch ? ' (watch)' : ''));

  const htmlFiles = walk(HTML_ROOT).filter((f) => f.endsWith('.html'));
  const pageEntries = [];

  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    if (!/text\/babel|react\.development|@babel\/standalone|fo-shared\.jsx|bo-shared\.jsx/.test(html)
        && !fs.existsSync(htmlFile.replace(/\.html$/i, '.page.jsx'))) {
      continue;
    }
    const pageJsx = rewriteHtml(htmlFile, html);
    if (pageJsx) pageEntries.push(pageJsx);
  }

  const shared = [
    path.join(HTML_ROOT, 'fo', 'fo-shared.jsx'),
    path.join(HTML_ROOT, 'bo', 'bo-shared.jsx'),
  ];

  const allJsx = [
    ...shared.filter((f) => fs.existsSync(f)),
    ...pageEntries.filter((f) => fs.existsSync(f)),
    ...walk(HTML_ROOT).filter((f) => f.endsWith('.page.jsx')),
  ];
  const uniq = [...new Set(allJsx)];

  async function buildAll() {
    for (const entry of uniq) {
      const outfile = entry.replace(/\.jsx$/i, '.js');
      await compileJsx(entry, outfile);
      console.log('  built', path.relative(ROOT, outfile));
    }
  }

  await buildAll();
  console.log(`Done (${uniq.length} modules).`);

  if (watch) {
    console.log('Watching html/**/*.jsx …');
    for (const entry of uniq) {
      fs.watch(entry, { persistent: true }, async () => {
        try {
          await compileJsx(entry, entry.replace(/\.jsx$/i, '.js'));
          console.log('  rebuilt', path.relative(ROOT, entry));
        } catch (e) {
          console.error(e);
        }
      });
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
