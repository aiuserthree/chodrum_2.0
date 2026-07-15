/**
 * CHODRUM — Supabase browser config
 *
 * 1) Create a project at https://supabase.com
 * 2) SQL Editor에서 001_init.sql → seed.sql → 002_member_consent.sql → 003_sheet_files.sql → 004_preview_urls.sql 실행
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
  NAVER_CLIENT_ID: '',
  /* 'bridge' = Edge Function naver-auth (기본) | 'custom' = Dashboard Custom Provider */
  NAVER_OAUTH_MODE: 'bridge',
  /* BO 관리자 로그인 (FO 회원 인증과 별도). html/bo/BO-00-login.html */
  ADMIN_ID: 'admin',
  ADMIN_PASSWORD: 'chodrum2026',
};
