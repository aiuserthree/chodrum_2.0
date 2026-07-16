/**
 * CHODRUM — Supabase browser config
 *
 * 1) Create a project at https://supabase.com
 * 2) SQL Editor에서 migrations 001~014 (+ seed) 순서 실행
 *    · 011–012: 주문/다운로드 provider 분리
 *    · 013: PDF Storage private
 *    · 014: RLS 강화 (anon 쓰기 차단 · is_admin)
 * 3) Project Settings → API 에서 URL / anon key 복사 후 아래 값 교체
 * 4) Edge Functions 배포: kakao-auth, naver-auth, toss-confirm, sheet-download
 *
 * 키가 비어 있거나 YOUR_ 플레이스홀더면 로컬 data.js 데모 모드로 동작합니다.
 *
 * 카카오/네이버(bridge): Client ID(REST API 키)는 공개 값(프론트).
 * Client Secret / TOSS_SECRET_KEY / service_role 은 Edge Function 시크릿에만.
 * → docs/supabase-setup.md
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
  /* BO 관리자 — Live: Supabase Auth 이메일 + app_metadata.role=admin (014 RLS)
   * ADMIN_ID 는 로그인 폼 표시/로컬 데모용. Live 에서는 ADMIN_EMAIL 로 로그인합니다. */
  ADMIN_ID: 'admin', // 로컬 데모 로그인 ID · Live에서는 ADMIN_EMAIL로 로그인
  ADMIN_EMAIL: 'chodrumstudio@gmail.com', // TODO: Auth 관리자 이메일 예) 'admin@yourdomain.com' (Dashboard에서 생성 후 기입)
  ADMIN_PASSWORD: 'chodrum2026', // Auth 비밀번호(또는 로컬 데모). 운영 전 반드시 변경

  /* ── 토스페이먼츠 (PG) ─────────────────────────────────────────
   * 가입 후 개발자센터 https://developers.tosspayments.com 에서 발급
   * Client Key 만 프론트. Secret Key → Edge secret TOSS_SECRET_KEY 만.
   *
   * TOSS_CLIENT_KEY 가 비어 있거나 YOUR_ 로 시작하면 로컬 데모 결제창.
   * Live 키를 넣는 순간 TOSS_CONFIRM_URL(또는 자동 유도 URL) confirm 이 필수입니다.
   * 테스트 키 예: test_ck_D5GePWvyJnrK0W0k6q8gLzN9 (공식 샘플 · 변경될 수 있음)
   */
  TOSS_CLIENT_KEY: '', // 토스 가입 후 테스트/라이브 Client Key
  /* 'auto' = 키 있으면 토스 SDK / 없으면 데모 · 'demo' = 항상 데모 · 'live' = 항상 SDK */
  TOSS_MODE: 'auto',
  /* 비우면 SUPABASE_URL + /functions/v1/toss-confirm 으로 자동 유도 (함수 배포 후) */
  TOSS_CONFIRM_URL: '', // e.g. 'https://xxxx.supabase.co/functions/v1/toss-confirm'
  /* PDF 서명 URL Edge — 비우면 SUPABASE_URL + /functions/v1/sheet-download */
  SHEET_DOWNLOAD_URL: '',
};
