/**
 * Naver OAuth → Supabase session bridge
 *
 * Supabase has no built-in Naver provider. This function:
 * 1) exchanges authorization code with Naver
 * 2) loads profile (/v1/nid/me)
 * 3) creates/updates Auth user scoped by naver_id (NOT by contact email)
 * 4) returns hashed_token for client verifyOtp
 *
 * Same contact email as Kakao/email must NOT reuse another Auth user —
 * Naver identity is always separate (provider-scoped auth email + naver_id).
 *
 * Deploy:
 *   supabase functions deploy naver-auth --no-verify-jwt
 * Secrets:
 *   supabase secrets set NAVER_CLIENT_ID=... NAVER_CLIENT_SECRET=...
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const NAVER_TOKEN_URL = 'https://nid.naver.com/oauth2.0/token';
const NAVER_ME_URL = 'https://openapi.naver.com/v1/nid/me';
const AUTH_EMAIL_DOMAIN = 'oauth.chodrum.local';

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

function oauthAuthEmail(provider: string, providerId: string) {
  const id = String(providerId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  return `${provider}_${id}@${AUTH_EMAIL_DOMAIN}`;
}

async function findUserByMeta(
  admin: ReturnType<typeof createClient>,
  key: string,
  value: string,
) {
  const target = String(value);
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = (data && data.users) || [];
    const found = users.find((u) => {
      const meta = u.user_metadata || {};
      return String(meta[key] || '') === target;
    });
    if (found) return found;
    if (users.length < 200) break;
  }
  return null;
}

async function findUserByAuthEmail(
  admin: ReturnType<typeof createClient>,
  email: string,
) {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = (data && data.users) || [];
    const found = users.find((u) => (u.email || '').toLowerCase() === target);
    if (found) return found;
    if (users.length < 200) break;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const code = body && body.code;
    const redirect_uri = body && body.redirect_uri;
    const state = body && body.state;
    if (!code || !redirect_uri) {
      return json({ error: 'code와 redirect_uri가 필요합니다.' }, 400);
    }

    const clientId = Deno.env.get('NAVER_CLIENT_ID') || '';
    const clientSecret = Deno.env.get('NAVER_CLIENT_SECRET') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!clientId || !clientSecret) {
      return json({ error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 시크릿이 없습니다.' }, 500);
    }
    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'Supabase 서비스 환경변수가 없습니다.' }, 500);
    }

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: String(code),
      state: state != null ? String(state) : '',
    });

    const tokenRes = await fetch(NAVER_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      return json({
        error: tokenJson.error_description || tokenJson.error || '네이버 토큰 교환 실패',
      }, 400);
    }

    const meRes = await fetch(NAVER_ME_URL, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const meJson = await meRes.json();
    if (!meRes.ok || meJson.resultcode !== '00' || !meJson.response) {
      return json({ error: meJson.message || '네이버 프로필 조회 실패' }, 502);
    }

    const profile = meJson.response;
    const contactEmail = String(profile.email || '').trim();
    if (!contactEmail) {
      return json({
        error: '네이버 앱에서 이메일을 필수 동의로 설정하고, 사용자 동의를 받아주세요.',
      }, 400);
    }

    const naverId = String(profile.id || '');
    if (!naverId) {
      return json({ error: '네이버 사용자 ID를 받지 못했어요.' }, 502);
    }

    const name =
      profile.name ||
      profile.nickname ||
      String(contactEmail).split('@')[0] ||
      '네이버 회원';
    const avatar = profile.profile_image || '';
    const authEmail = oauthAuthEmail('naver', naverId);

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    /* Provider-scoped identity only — never match Auth users by contact email */
    let user =
      (await findUserByMeta(admin, 'naver_id', naverId)) ||
      (await findUserByAuthEmail(admin, authEmail));

    const meta = {
      full_name: name,
      name,
      avatar_url: avatar,
      picture: avatar,
      email: contactEmail,
      contact_email: contactEmail,
      auth_provider: 'naver',
      provider: 'naver',
      naver_id: naverId,
    };

    if (!user) {
      const created = await admin.auth.admin.createUser({
        email: authEmail,
        email_confirm: true,
        user_metadata: meta,
        app_metadata: { provider: 'naver', providers: ['naver'] },
      });
      if (created.error) {
        user =
          (await findUserByMeta(admin, 'naver_id', naverId)) ||
          (await findUserByAuthEmail(admin, authEmail));
        if (!user) {
          return json({ error: created.error.message || '회원 생성 실패' }, 500);
        }
      } else {
        user = created.data.user;
      }
    }

    if (user) {
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: Object.assign({}, user.user_metadata || {}, meta),
        app_metadata: {
          ...(user.app_metadata || {}),
          provider: 'naver',
          providers: ['naver'],
        },
      });
    }

    const linkEmail = (user && user.email) || authEmail;
    const link = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: linkEmail,
    });
    if (link.error) {
      return json({ error: link.error.message || '세션 토큰 생성 실패' }, 500);
    }

    const hashed =
      (link.data && link.data.properties && link.data.properties.hashed_token) || '';
    if (!hashed) {
      return json({ error: 'hashed_token을 받지 못했습니다.' }, 500);
    }

    return json({
      ok: true,
      token_hash: hashed,
      email: contactEmail,
      profile: { name, email: contactEmail, avatar, provider: 'naver' },
    });
  } catch (e) {
    return json({ error: (e && (e as Error).message) || '네이버 인증 처리 오류' }, 500);
  }
});
