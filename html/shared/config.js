/**
 * CHODRUM — Supabase browser config
 *
 * 1) Create a project at https://supabase.com
 * 2) SQL Editor에서 001~010 migrations (+ seed) 실행 — 009는 카카오/네이버 동일 이메일 회원 분리, 010은 생년월일
 * 3) Project Settings → API 에서 URL / anon key 복사 후 아래 값 교체
 *
 * 키가 비어 있거나 YOUR_ 플레이스홀더면 로컬 data.js 데모 모드로 동작합니다.
 *
 * 카카오/네이버(bridge): Client ID(REST API 키)는 공개 값(프론트).
 * Client Secret 은 Edge Function 시크릿에만 넣으세요. → docs/supabase-setup.md
 */

/* YouTube embeds: Referer from http://127.0.0.1 → "재생할 수 없음";
 * http://localhost is accepted. Rewrite before any iframe loads.
 * Only runs on 127.0.0.1 — production (renewal.chodrum.com / *.vercel.app) is unaffected. */
(function () {
  try {
    if (location.hostname === '127.0.0.1') {
      location.replace(location.href.replace('://127.0.0.1', '://localhost'));
    }
  } catch (_) { /* ignore */ }
})();

window.CHODRUM_CONFIG = {
  SUPABASE_URL: 'https://lofnqvpfmbdchuezfdxs.supabase.co', // e.g. 'https://xxxx.supabase.co'
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvZm5xdnBmbWJkY2h1ZXpmZHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NjExMzQsImV4cCI6MjA5OTUzNzEzNH0.TzTyQoQjsSLjW3VKDxkFXsE4G_tY78CaCD-yl6qZNxU', // e.g. 'eyJhbGciOi...'
  /* 카카오 Developers → 앱 → REST API 키 (공개). Secret은 Edge Function만. */
  KAKAO_CLIENT_ID: '2325d639f1426121883047929eece08f',
  /* 'bridge' = Edge Function kakao-auth (기본) | 'supabase' = Dashboard Kakao Provider */
  KAKAO_OAUTH_MODE: 'bridge',
  /* 네이버 Developers → 애플리케이션 → Client ID (공개). Secret은 Edge Function만. */
  NAVER_CLIENT_ID: 'lLQxr7LyzWMJ59p1uGbG',
  /* 'bridge' = Edge Function naver-auth (기본) | 'custom' = Dashboard Custom Provider */
  NAVER_OAUTH_MODE: 'bridge',
  /* BO 관리자 로그인 (FO 회원 인증과 별도). html/bo/BO-00-login.html */
  ADMIN_ID: 'admin',
  ADMIN_PASSWORD: 'chodrum2026',

  /* ── 토스페이먼츠 (PG) ─────────────────────────────────────────
   * 개발자센터 https://developers.tosspayments.com 에서 발급
   * Client Key 만 프론트에 둡니다. Secret Key 는 절대 HTML에 넣지 마세요.
   * 승인(confirm)은 서버(Edge Function 등)에서 Secret Key 로 호출해야 합니다.
   *
   * TOSS_CLIENT_KEY 가 비어 있거나 YOUR_ 로 시작하면 로컬 데모 결제창으로 동작합니다.
   * 테스트 키 예: test_ck_D5GePWvyJnrK0W0k6q8gLzN9 (공식 문서 샘플 · 변경될 수 있음)
   */
  TOSS_CLIENT_KEY: 'test_ck_D5GePWvyJnrK0W0k6q8gLzN9',
  /* 'auto' = 키 있으면 토스 SDK / 없으면 데모 · 'demo' = 항상 데모 · 'live' = 항상 SDK */
  TOSS_MODE: 'auto',
  /* 결제 승인 Edge Function URL (배포 후 설정). 비어 있으면 프로토타입은 confirm 생략 */
  TOSS_CONFIRM_URL: '', // e.g. 'https://xxxx.supabase.co/functions/v1/toss-confirm'
};
