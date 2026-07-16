/**
 * CHODRUM — 토스페이먼츠 결제 승인 + 주문 확정 (서버 전용)
 *
 * 배포:
 *   supabase secrets set TOSS_SECRET_KEY=test_sk_...
 *   supabase functions deploy toss-confirm --no-verify-jwt
 *
 * config.js:
 *   TOSS_CONFIRM_URL: 'https://<REF>.supabase.co/functions/v1/toss-confirm'
 *   (비우면 클라이언트가 SUPABASE_URL 기준으로 자동 유도)
 *
 * Live:
 *   { paymentKey, orderId, amount }
 *   → DB 대기 주문 amount 대조 → Toss confirm → 결제완료 + downloads
 *
 * Demo (키 없을 때 / demo=1):
 *   { demo: true, order: { no, buyer, email, member, ... } }
 *   → Toss API 생략, service role로 주문·다운로드 생성
 *
 * Secret Key / service_role 은 HTML에 넣지 마세요.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const TOSS_CONFIRM = 'https://api.tosspayments.com/v1/payments/confirm';

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

function normalizeProvider(p: string | null | undefined): string {
  const v = String(p || 'email').toLowerCase().trim();
  if (v === '카카오' || v === 'kakao') return 'kakao';
  if (v === '네이버' || v === 'naver') return 'naver';
  if (v === '구글' || v === 'google') return 'google';
  if (v === '소셜' || v === 'social') return 'social';
  return 'email';
}

type OrderPayload = {
  no?: string;
  buyer?: string;
  email?: string;
  member?: boolean;
  method?: string;
  total?: number;
  items?: Array<{ id?: string; sheetId?: string; qty?: number; price?: number; title?: string }>;
  authUserId?: string | null;
  auth_user_id?: string | null;
  provider?: string | null;
  auth_provider?: string | null;
};

async function markPaidAndGrantDownloads(
  admin: ReturnType<typeof createClient>,
  opts: {
    orderNo: string;
    amount: number;
    buyer: string;
    email: string;
    isMember: boolean;
    method: string;
    authUserId: string | null;
    authProvider: string | null;
    items: Array<{ sheetId: string; qty: number; price: number }>;
    paymentKey?: string | null;
  },
) {
  const expires = new Date(Date.now() + 7 * 86400000).toISOString();

  const { data: existing } = await admin
    .from('orders')
    .select('id, status, total, order_no')
    .eq('order_no', opts.orderNo)
    .maybeSingle();

  let orderId: string;

  if (existing?.id) {
    if (existing.status === '결제완료') {
      return { orderId: existing.id, alreadyPaid: true };
    }
    if (Number(existing.total) !== Number(opts.amount)) {
      throw new Error('주문 금액이 결제 금액과 달라요');
    }
    const { error: upErr } = await admin
      .from('orders')
      .update({
        status: '결제완료',
        method: opts.method || '신용카드',
        buyer_name: opts.buyer,
        email: opts.email,
        is_member: opts.isMember,
        auth_user_id: opts.isMember ? opts.authUserId : null,
        auth_provider: opts.isMember ? opts.authProvider : null,
      })
      .eq('id', existing.id);
    if (upErr) throw upErr;
    orderId = existing.id;

    /* Ensure line items exist (pending may already have them) */
    const { data: existingItems } = await admin
      .from('order_items')
      .select('id')
      .eq('order_id', orderId)
      .limit(1);
    if (!existingItems?.length && opts.items.length) {
      const { error: itemErr } = await admin.from('order_items').insert(
        opts.items.map((it) => ({
          order_id: orderId,
          sheet_id: it.sheetId,
          qty: it.qty || 1,
          price: it.price || 0,
        })),
      );
      if (itemErr) throw itemErr;
    }
  } else {
    const orderRow: Record<string, unknown> = {
      order_no: opts.orderNo,
      buyer_name: opts.buyer,
      email: opts.email,
      is_member: opts.isMember,
      method: opts.method || '신용카드',
      status: '결제완료',
      total: opts.amount,
    };
    if (opts.isMember && opts.authUserId) orderRow.auth_user_id = opts.authUserId;
    if (opts.isMember && opts.authProvider) orderRow.auth_provider = opts.authProvider;

    const { data: inserted, error: insErr } = await admin
      .from('orders')
      .insert(orderRow)
      .select('id')
      .single();
    if (insErr) throw insErr;
    orderId = inserted.id;

    if (opts.items.length) {
      const { error: itemErr } = await admin.from('order_items').insert(
        opts.items.map((it) => ({
          order_id: orderId,
          sheet_id: it.sheetId,
          qty: it.qty || 1,
          price: it.price || 0,
        })),
      );
      if (itemErr) throw itemErr;
    }
  }

  /* Upsert-ish downloads: delete prior for this order then insert ACTIVE */
  await admin.from('downloads').delete().eq('order_no', opts.orderNo);

  if (opts.items.length) {
    const dls = opts.items.map((it) => {
      const row: Record<string, unknown> = {
        email: opts.email,
        is_member: opts.isMember,
        sheet_id: it.sheetId,
        order_no: opts.orderNo,
        status: 'ACTIVE',
        expires_at: expires,
      };
      if (opts.isMember && opts.authUserId) row.auth_user_id = opts.authUserId;
      if (opts.isMember && opts.authProvider) row.auth_provider = opts.authProvider;
      return row;
    });
    const { error: dlErr } = await admin.from('downloads').insert(dls);
    if (dlErr) throw dlErr;
  }

  if (opts.isMember && opts.email) {
    try {
      let memQ = admin.from('members').select('id, orders_count, auth_user_id');
      if (opts.authUserId) memQ = memQ.eq('auth_user_id', opts.authUserId);
      else {
        memQ = memQ
          .ilike('email', opts.email)
          .eq('auth_provider', opts.authProvider || 'email');
      }
      const { data: mem } = await memQ.maybeSingle();
      if (mem?.id) {
        await admin
          .from('members')
          .update({ orders_count: (mem.orders_count || 0) + 1 })
          .eq('id', mem.id);
      }
    } catch {
      /* non-fatal */
    }
  }

  return { orderId, alreadyPaid: false, paymentKey: opts.paymentKey || null };
}

function itemsFromPayload(order: OrderPayload) {
  return (order.items || [])
    .map((it) => ({
      sheetId: String(it.sheetId || it.id || ''),
      qty: Number(it.qty) || 1,
      price: Number(it.price) || 0,
    }))
    .filter((it) => it.sheetId);
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
  if (!supabaseUrl || !serviceKey) {
    return json({ error: 'Supabase env missing' }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let body: {
    paymentKey?: string;
    orderId?: string;
    amount?: number;
    demo?: boolean;
    order?: OrderPayload;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  /* ── Demo finalize (no Toss Secret / no real charge) ── */
  if (body.demo === true) {
    const order = body.order || {};
    const orderNo = String(order.no || body.orderId || '').trim();
    const amount = Number(order.total != null ? order.total : body.amount);
    if (!orderNo || !Number.isFinite(amount) || amount < 1) {
      return json({ error: 'demo order.no / total required' }, 400);
    }
    const isMember = !!order.member;
    const authUserId = (order.authUserId || order.auth_user_id || null) as string | null;
    const authProvider = isMember
      ? normalizeProvider(order.auth_provider || order.provider || 'email')
      : null;
    try {
      const result = await markPaidAndGrantDownloads(admin, {
        orderNo,
        amount,
        buyer: String(order.buyer || '게스트'),
        email: String(order.email || '').trim(),
        isMember,
        method: String(order.method || '데모결제'),
        authUserId,
        authProvider,
        items: itemsFromPayload(order),
        paymentKey: body.paymentKey || null,
      });
      return json({ ok: true, demo: true, ...result });
    } catch (e) {
      return json({ error: (e as Error).message || 'demo finalize failed' }, 500);
    }
  }

  /* ── Live Toss confirm ── */
  const secret = Deno.env.get('TOSS_SECRET_KEY') || '';
  if (!secret) {
    return json({ error: 'TOSS_SECRET_KEY is not configured' }, 500);
  }

  const paymentKey = body.paymentKey;
  const orderId = String(body.orderId || '').trim();
  const amount = Number(body.amount);

  if (!paymentKey || !orderId || !Number.isFinite(amount) || amount < 1) {
    return json({ error: 'paymentKey, orderId, amount are required' }, 400);
  }

  const { data: pending, error: pendErr } = await admin
    .from('orders')
    .select('id, order_no, total, status, buyer_name, email, is_member, method, auth_user_id, auth_provider, order_items(sheet_id, qty, price)')
    .eq('order_no', orderId)
    .maybeSingle();

  if (pendErr) return json({ error: pendErr.message }, 500);
  if (!pending) {
    return json(
      { error: '대기 주문이 없어요. 결제 전에 주문이 생성되어야 합니다.' },
      400,
    );
  }
  if (pending.status === '결제완료') {
    return json({ ok: true, alreadyPaid: true, orderId: pending.id });
  }
  if (pending.status !== '대기') {
    return json({ error: '결제할 수 없는 주문 상태예요: ' + pending.status }, 400);
  }
  if (Number(pending.total) !== amount) {
    return json(
      {
        error: '결제 금액이 주문과 달라요 (금액 위변조 방지)',
        expected: pending.total,
        got: amount,
      },
      400,
    );
  }

  const auth = btoa(secret + ':');
  const tossRes = await fetch(TOSS_CONFIRM, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const tossData = await tossRes.json().catch(() => ({}));
  if (!tossRes.ok) {
    return json(
      {
        error: (tossData && (tossData.message || tossData.code)) || 'Toss confirm failed',
        toss: tossData,
      },
      tossRes.status,
    );
  }

  const items = ((pending.order_items || []) as Array<{
    sheet_id: string;
    qty: number;
    price: number;
  }>).map((it) => ({
    sheetId: it.sheet_id,
    qty: it.qty || 1,
    price: it.price || 0,
  }));

  /* Client may also send items in body.order as fallback */
  const fallbackItems = body.order ? itemsFromPayload(body.order) : [];
  const finalItems = items.length ? items : fallbackItems;

  try {
    const result = await markPaidAndGrantDownloads(admin, {
      orderNo: orderId,
      amount,
      buyer: pending.buyer_name,
      email: pending.email,
      isMember: !!pending.is_member,
      method: pending.method || '신용카드',
      authUserId: pending.auth_user_id || null,
      authProvider: pending.auth_provider
        ? normalizeProvider(pending.auth_provider)
        : null,
      items: finalItems,
      paymentKey,
    });
    return json({ ok: true, payment: tossData, ...result });
  } catch (e) {
    return json(
      {
        error: (e as Error).message || '주문 확정 실패 (결제는 승인됨 — 고객센터 문의)',
        payment: tossData,
      },
      500,
    );
  }
});
