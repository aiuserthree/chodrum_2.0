/* CHODRUM — Supabase client (CDN @supabase/supabase-js) */
(function () {
  var cfg = window.CHODRUM_CONFIG || {};
  var url = (cfg.SUPABASE_URL || '').trim();
  var key = (cfg.SUPABASE_ANON_KEY || '').trim();
  var placeholder = !url || !key || /YOUR_/i.test(url) || /YOUR_/i.test(key);

  window.ChodrumSB = {
    configured: !placeholder && typeof window.supabase !== 'undefined',
    client: null,
  };

  if (!window.ChodrumSB.configured) {
    if (!placeholder && typeof window.supabase === 'undefined') {
      console.warn('[CHODRUM] supabase-js CDN이 로드되지 않았습니다.');
    }
    return;
  }

  try {
    window.ChodrumSB.client = window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  } catch (e) {
    console.warn('[CHODRUM] Supabase client 생성 실패', e);
    window.ChodrumSB.configured = false;
    window.ChodrumSB.client = null;
  }
})();
