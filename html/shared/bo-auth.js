/**
 * CHODRUM BO admin gate
 *
 * Live (Supabase): signInWithPassword + app_metadata.role === 'admin'
 *   → RLS is_admin() allows catalog/storage writes. Anon key alone cannot write.
 * Demo (no Supabase): local ADMIN_ID / ADMIN_PASSWORD session (UI only).
 *
 * Create admin Auth user, then:
 *   update auth.users set raw_app_meta_data =
 *     coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}'::jsonb
 *   where email = 'YOUR_ADMIN_EMAIL';
 */
(function () {
  var SESSION_KEY = 'chodrum_bo_session';
  var LOGIN_PAGE = '/bo/login';
  var HOME_PAGE = '/bo/dashboard';

  function cfg() {
    return window.CHODRUM_CONFIG || {};
  }

  function creds() {
    var c = cfg();
    return {
      id: String(c.ADMIN_ID || 'admin').trim(),
      email: String(c.ADMIN_EMAIL || '').trim(),
      password: String(c.ADMIN_PASSWORD || ''),
    };
  }

  function resolveAdminEmail(idOrEmail) {
    var c = creds();
    var raw = String(idOrEmail || '').trim();
    if (raw.indexOf('@') !== -1) return raw;
    if (c.email) return c.email;
    if (raw) return raw + '@chodrum.admin';
    return c.id + '@chodrum.admin';
  }

  function sbLive() {
    return !!(window.ChodrumSB && window.ChodrumSB.configured && window.ChodrumSB.client);
  }

  function readSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.ok || !s.id) return null;
      return s;
    } catch (e) {
      return null;
    }
  }

  function writeSession(id, meta) {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          ok: true,
          id: id,
          at: Date.now(),
          mode: (meta && meta.mode) || 'local',
          email: (meta && meta.email) || null,
        })
      );
    } catch (e) { /* ignore */ }
  }

  function isLoggedIn() {
    return !!readSession();
  }

  function isAdminUser(user) {
    if (!user) return false;
    var role = (user.app_metadata && user.app_metadata.role) || '';
    return String(role).toLowerCase() === 'admin';
  }

  /**
   * @returns {Promise<{ ok: boolean, error?: string }>}
   */
  async function login(id, password) {
    var expected = creds();
    var uid = String(id || '').trim();
    var pw = String(password || '');
    if (!uid || !pw) {
      return { ok: false, error: '아이디와 비밀번호를 입력해주세요.' };
    }

    if (sbLive()) {
      var email = resolveAdminEmail(uid);
      try {
        var client = window.ChodrumSB.client;
        var res = await client.auth.signInWithPassword({ email: email, password: pw });
        if (res.error) {
          return { ok: false, error: res.error.message || '아이디 또는 비밀번호가 올바르지 않습니다.' };
        }
        var user = res.data && res.data.user;
        if (!isAdminUser(user)) {
          try { await client.auth.signOut(); } catch (_) { /* ignore */ }
          return {
            ok: false,
            error: '관리자 권한이 없습니다. Auth 사용자의 app_metadata.role 을 admin 으로 설정하세요.',
          };
        }
        writeSession(expected.id || email, { mode: 'supabase', email: email });
        return { ok: true, mode: 'supabase' };
      } catch (e) {
        return { ok: false, error: (e && e.message) || '로그인에 실패했습니다.' };
      }
    }

    /* Local demo gate (no Supabase) */
    if (!expected.password) {
      return { ok: false, error: 'ADMIN_PASSWORD 가 config.js 에 없습니다.' };
    }
    if (uid !== expected.id || pw !== expected.password) {
      return { ok: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }
    writeSession(expected.id, { mode: 'local' });
    return { ok: true, mode: 'local' };
  }

  async function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
    if (sbLive()) {
      try { await window.ChodrumSB.client.auth.signOut(); } catch (e) { /* ignore */ }
    }
  }

  function isLoginPage() {
    var path = location.pathname || '';
    return /\/bo\/login\/?$/i.test(path) ||
      /BO-00-login\.html$/i.test(path) ||
      /BO-00-login\.html$/i.test(location.href || '');
  }

  function requireAuth() {
    if (isLoginPage()) return true;
    if (isLoggedIn()) return true;
    location.replace(LOGIN_PAGE);
    return false;
  }

  /**
   * Live: confirm Supabase session still has admin role (RLS depends on JWT).
   * Call after supabase-client.js loads on BO pages.
   */
  async function verifyAdminSession() {
    if (isLoginPage()) return true;
    if (!sbLive()) return isLoggedIn();
    try {
      var client = window.ChodrumSB.client;
      var sess = await client.auth.getSession();
      var user = sess.data && sess.data.session && sess.data.session.user;
      if (isAdminUser(user)) {
        var c = creds();
        if (!isLoggedIn()) writeSession(c.id || user.email, { mode: 'supabase', email: user.email });
        return true;
      }
    } catch (e) {
      console.warn('[CHODRUM BO] verifyAdminSession', e);
    }
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e2) { /* ignore */ }
    if (!isLoginPage()) location.replace(LOGIN_PAGE);
    return false;
  }

  function redirectIfLoggedIn() {
    if (isLoginPage() && isLoggedIn()) {
      location.replace(HOME_PAGE);
      return true;
    }
    return false;
  }

  window.ChodrumBoAuth = {
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    requireAuth: requireAuth,
    verifyAdminSession: verifyAdminSession,
    redirectIfLoggedIn: redirectIfLoggedIn,
    getSession: readSession,
    resolveAdminEmail: resolveAdminEmail,
    LOGIN_PAGE: LOGIN_PAGE,
    HOME_PAGE: HOME_PAGE,
  };

  requireAuth();
})();
