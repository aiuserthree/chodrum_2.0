/**
 * CHODRUM — Supabase browser config
 *
 * 1) Create a project at https://supabase.com
 * 2) SQL Editor에서 supabase/migrations/001_init.sql → seed.sql 실행
 * 3) Project Settings → API 에서 URL / anon key 복사 후 아래 값 교체
 *
 * 키가 비어 있거나 YOUR_ 플레이스홀더면 로컬 data.js 데모 모드로 동작합니다.
 *
 * 네이버(bridge 모드): NAVER_CLIENT_ID 는 공개 값(프론트). Client Secret 은
 * Edge Function 시크릿에만 넣으세요. 자세한 설정은 docs/supabase-setup.md
 */
window.CHODRUM_CONFIG = {
  SUPABASE_URL: 'https://lofnqvpfmbdchuezfdxs.supabase.co', // e.g. 'https://xxxx.supabase.co'
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvZm5xdnBmbWJkY2h1ZXpmZHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NjExMzQsImV4cCI6MjA5OTUzNzEzNH0.TzTyQoQjsSLjW3VKDxkFXsE4G_tY78CaCD-yl6qZNxU', // e.g. 'eyJhbGciOi...'
  /* 네이버 Developers → 애플리케이션 → Client ID (공개). Secret은 Edge Function만. */
  NAVER_CLIENT_ID: '',
  /* 'bridge' = Edge Function naver-auth (기본) | 'custom' = Dashboard Custom Provider */
  NAVER_OAUTH_MODE: 'bridge',
};
