/**
 * CHODRUM — 토스페이먼츠 결제 승인 (서버 전용)
 *
 * 배포:
 *   supabase secrets set TOSS_SECRET_KEY=test_sk_...
 *   supabase functions deploy toss-confirm --no-verify-jwt
 *
 * config.js:
 *   TOSS_CONFIRM_URL: 'https://<REF>.supabase.co/functions/v1/toss-confirm'
 *
 * 클라이언트는 paymentKey / orderId / amount 만 전달합니다.
 * Secret Key 는 이 함수(환경변수)에만 두고, HTML/config.js 에 넣지 마세요.
 *
 * 프로덕션 권장:
 *  1) 결제 요청 전에 orders(status=대기) + amount 를 DB에 저장
 *  2) 여기서 orderId 로 조회해 amount 일치 여부 검증
 *  3) 토스 confirm 성공 후 status=결제완료 + downloads 발급
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const TOSS_CONFIRM = "https://api.tosspayments.com/v1/payments/confirm";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type, apikey",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const secret = Deno.env.get("TOSS_SECRET_KEY") || "";
  if (!secret) {
    return json({ error: "TOSS_SECRET_KEY is not configured" }, 500);
  }

  let body: { paymentKey?: string; orderId?: string; amount?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const paymentKey = body.paymentKey;
  const orderId = body.orderId;
  const amount = Number(body.amount);

  if (!paymentKey || !orderId || !Number.isFinite(amount) || amount < 1) {
    return json({ error: "paymentKey, orderId, amount are required" }, 400);
  }

  /* TODO: Supabase orders 테이블에서 orderId 조회 후 amount 대조 */

  const auth = btoa(secret + ":");
  const tossRes = await fetch(TOSS_CONFIRM, {
    method: "POST",
    headers: {
      Authorization: "Basic " + auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await tossRes.json().catch(() => ({}));
  if (!tossRes.ok) {
    return json(
      {
        error: (data && (data.message || data.code)) || "Toss confirm failed",
        toss: data,
      },
      tossRes.status
    );
  }

  /* TODO: orders status 결제완료 + downloads INSERT */

  return json({ ok: true, payment: data });
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
