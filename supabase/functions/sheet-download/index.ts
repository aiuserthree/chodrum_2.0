/**
 * CHODRUM — PDF signed URL after entitlement check
 *
 * Deploy:
 *   supabase functions deploy sheet-download --no-verify-jwt
 *
 * Body (member):
 *   { sheetId } + Authorization: Bearer <user access token>
 *
 * Body (guest):
 *   { sheetId, email, orderNo }
 *
 * Returns: { ok: true, url, expiresIn, filename? }
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function storagePathFromPdfUrl(pdfUrl: string | null | undefined): string | null {
  if (!pdfUrl) return null;
  const raw = String(pdfUrl).trim();
  if (!raw) return null;
  if (raw.startsWith('pdf/')) return raw;
  /* Legacy public / signed URLs */
  const m = raw.match(/\/storage\/v1\/object\/(?:public|sign)\/sheets\/([^?]+)/);
  if (m && m[1]) return decodeURIComponent(m[1]);
  if (raw.includes('/')) {
    const idx = raw.indexOf('pdf/');
    if (idx >= 0) return raw.slice(idx).split('?')[0];
  }
  return null;
}

function isActiveDownload(row: {
  status?: string;
  expires_at?: string | null;
}): boolean {
  if (!row || row.status !== 'ACTIVE') return false;
  if (row.expires_at) {
    const t = new Date(row.expires_at).getTime();
    if (Number.isFinite(t) && t < Date.now()) return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  if (!supabaseUrl || !serviceKey) {
    return json({ error: 'Supabase env missing' }, 500);
  }

  let body: {
    sheetId?: string;
    email?: string;
    orderNo?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const sheetId = String(body.sheetId || '').trim();
  if (!sheetId) return json({ error: 'sheetId is required' }, 400);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.get('Authorization') || '';
  let userId: string | null = null;
  if (authHeader.toLowerCase().startsWith('bearer ') && anonKey) {
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data } = await userClient.auth.getUser();
    userId = data?.user?.id || null;
  }

  const email = String(body.email || '').trim().toLowerCase();
  const orderNo = String(body.orderNo || '').trim();

  let entitled = false;

  if (userId) {
    const { data: byUid, error: uidErr } = await admin
      .from('downloads')
      .select('id, status, expires_at, auth_user_id, sheet_id, email, auth_provider')
      .eq('sheet_id', sheetId)
      .eq('auth_user_id', userId)
      .eq('status', 'ACTIVE')
      .limit(20);
    if (uidErr) return json({ error: uidErr.message }, 500);
    entitled = (byUid || []).some(isActiveDownload);

    if (!entitled) {
      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      const userEmail = authUser?.user?.email || '';
      const contactOk =
        !!userEmail && !String(userEmail).endsWith('@oauth.chodrum.local');
      if (contactOk) {
        const { data: byEmail, error: emErr } = await admin
          .from('downloads')
          .select('id, status, expires_at, auth_user_id, sheet_id, email, auth_provider')
          .eq('sheet_id', sheetId)
          .ilike('email', userEmail)
          .eq('is_member', true)
          .eq('status', 'ACTIVE')
          .is('auth_user_id', null)
          .limit(20);
        if (emErr) return json({ error: emErr.message }, 500);
        entitled = (byEmail || []).some((row) => {
          if (!isActiveDownload(row)) return false;
          const p = row.auth_provider;
          return !p || p === '' || p === 'email';
        });
      }
    }
  } else if (email && orderNo) {
    const { data: rows, error } = await admin
      .from('downloads')
      .select('id, status, expires_at, email, order_no, is_member, sheet_id')
      .eq('sheet_id', sheetId)
      .eq('order_no', orderNo)
      .ilike('email', email)
      .eq('is_member', false)
      .eq('status', 'ACTIVE')
      .limit(5);
    if (error) return json({ error: error.message }, 500);
    entitled = (rows || []).some(isActiveDownload);
  } else {
    return json(
      { error: '로그인이 필요하거나 비회원은 email + orderNo가 필요해요.' },
      401,
    );
  }

  if (!entitled) {
    return json({ error: '다운로드 권한이 없거나 만료되었어요.' }, 403);
  }

  const { data: sheet, error: sheetErr } = await admin
    .from('sheets')
    .select('id, title, pdf_url')
    .eq('id', sheetId)
    .maybeSingle();
  if (sheetErr) return json({ error: sheetErr.message }, 500);
  if (!sheet) return json({ error: '악보를 찾을 수 없어요.' }, 404);

  const path = storagePathFromPdfUrl(sheet.pdf_url);
  if (!path) {
    return json({ error: 'PDF 파일이 등록되지 않았어요.' }, 404);
  }

  const expiresIn = 120; /* seconds */
  const { data: signed, error: signErr } = await admin.storage
    .from('sheets')
    .createSignedUrl(path, expiresIn);
  if (signErr || !signed?.signedUrl) {
    return json(
      { error: signErr?.message || '서명 URL을 만들지 못했어요.' },
      500,
    );
  }

  return json({
    ok: true,
    url: signed.signedUrl,
    expiresIn,
    title: sheet.title || null,
  });
});
