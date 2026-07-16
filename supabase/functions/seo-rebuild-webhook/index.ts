/**
 * CHODRUM SEO — debounced Vercel redeploy after sheets change
 *
 * Setup:
 *   1. Vercel → Settings → Deploy Hooks → create "seo-rebuild" hook
 *   2. supabase secrets set VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
 *   3. Dashboard → Database Webhooks → sheets INSERT/UPDATE/DELETE → this function URL
 *
 * Deploy:
 *   supabase functions deploy seo-rebuild-webhook --no-verify-jwt
 *
 * Debounce: 120s module-level timer (best-effort; cold starts reset timer).
 * Manual fallback: run `npm run build` locally or trigger Deploy Hook from Vercel dashboard.
 */
const DEBOUNCE_MS = 120_000;

let pendingTimer: ReturnType<typeof setTimeout> | null = null;

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

async function triggerDeploy(hookUrl: string) {
  const res = await fetch(hookUrl, { method: 'POST' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('Deploy hook failed ' + res.status + ' ' + text);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const hookUrl = (Deno.env.get('VERCEL_DEPLOY_HOOK_URL') || '').trim();
  if (!hookUrl) {
    return json(
      {
        ok: false,
        error: 'VERCEL_DEPLOY_HOOK_URL not set — configure Deploy Hook or run npm run build manually',
      },
      503
    );
  }

  /* Optional: consume webhook payload (ignored for debounce-only flow) */
  try {
    await req.json();
  } catch {
    /* empty body is fine */
  }

  if (pendingTimer) {
    clearTimeout(pendingTimer);
  }

  pendingTimer = setTimeout(async () => {
    pendingTimer = null;
    try {
      await triggerDeploy(hookUrl);
      console.log('[CHODRUM] seo-rebuild-webhook: deploy hook triggered');
    } catch (err) {
      console.error('[CHODRUM] seo-rebuild-webhook: deploy failed', err);
    }
  }, DEBOUNCE_MS);

  return json({
    ok: true,
    debounced: true,
    deployInSeconds: DEBOUNCE_MS / 1000,
  });
});
