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

  /*
   * FO and BO must not share Auth storage.
   * Guest OTP / FO logout call auth.signOut() and would wipe an admin JWT
   * if both used the default sb-*-auth-token key on the same origin.
   */
  function isBoContext() {
    try {
      var p = location.pathname || '';
      var h = location.href || '';
      return /\/bo(\/|$)/i.test(p) || /BO-\d+/i.test(p) || /BO-\d+/i.test(h);
    } catch (e) {
      return false;
    }
  }

  var bo = isBoContext();

  try {
    window.ChodrumSB.client = window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        /* BO must not consume FO OAuth PKCE / magic-link hash params */
        detectSessionInUrl: !bo,
        flowType: 'pkce',
        storageKey: bo ? 'chodrum-bo-auth' : 'chodrum-fo-auth',
      },
    });
    window.ChodrumSB.authScope = bo ? 'bo' : 'fo';
  } catch (e) {
    console.warn('[CHODRUM] Supabase client 생성 실패', e);
    window.ChodrumSB.configured = false;
    window.ChodrumSB.client = null;
  }
})();
