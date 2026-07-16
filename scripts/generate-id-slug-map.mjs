#!/usr/bin/env node
/**
 * Build-time id → slug map for Vercel middleware legacy 301 redirects.
 *
 * Env (optional):
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (preferred)
 *   SUPABASE_URL + SUPABASE_ANON_KEY (fallback)
 *
 * Output: html/_seo/id-to-slug.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'html', '_seo');
const OUT_FILE = path.join(OUT_DIR, 'id-to-slug.json');

function env(name) {
  const v = process.env[name];
  return v && String(v).trim() && !/^YOUR_/i.test(v) ? String(v).trim() : '';
}

async function fetchFromSupabase() {
  const base = env('SUPABASE_URL').replace(/\/$/, '');
  const key = env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_ANON_KEY');
  if (!base || !key) return null;

  const url = base + '/rest/v1/sheets?select=id,slug&slug=not.is.null&order=id';
  const res = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    console.warn('[CHODRUM] id-to-slug Supabase fetch failed', res.status, await res.text().catch(() => ''));
    return null;
  }
  const rows = await res.json();
  if (!Array.isArray(rows)) return null;
  const map = {};
  rows.forEach((row) => {
    if (row && row.id && row.slug) map[String(row.id)] = String(row.slug);
  });
  return map;
}

function writeMap(map) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(map, null, 0) + '\n', 'utf8');
}

async function main() {
  let map = {};
  try {
    map = (await fetchFromSupabase()) || {};
    if (!Object.keys(map).length) {
      console.warn('[CHODRUM] id-to-slug: no Supabase data — writing empty map (middleware 301 inactive until migration + rebuild)');
    } else {
      console.log('[CHODRUM] id-to-slug: ' + Object.keys(map).length + ' entries');
    }
  } catch (err) {
    console.warn('[CHODRUM] id-to-slug: fetch failed — writing empty map fallback', err);
    map = {};
  }
  writeMap(map);
}

main().catch((err) => {
  console.error('[CHODRUM] generate-id-slug-map failed — writing empty map fallback', err);
  try {
    writeMap({});
  } catch (writeErr) {
    console.error('[CHODRUM] generate-id-slug-map could not write fallback', writeErr);
    process.exit(1);
  }
});
