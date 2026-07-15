/**
 * CHODRUM BO admin gate — local session (independent of FO Supabase auth).
 * Credentials: window.CHODRUM_CONFIG.ADMIN_ID / ADMIN_PASSWORD
 */
(function () {
  var SESSION_KEY = 'chodrum_bo_session';
  var LOGIN_PAGE = '/bo/login';
  var HOME_PAGE = '/bo/dashboard';

  function creds() {
    var c = window.CHODRUM_CONFIG || {};
    return {
      id: String(c.ADMIN_ID || 'admin').trim(),
      password: String(c.ADMIN_PASSWORD || 'chodrum2026'),
    };
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

  function isLoggedIn() {
    return !!readSession();
  }

  function login(id, password) {
    var expected = creds();
    var uid = String(id || '').trim();
    var pw = String(password || '');
    if (!uid || !pw) {
      return { ok: false, error: '아이디와 비밀번호를 입력해주세요.' };
    }
    if (uid !== expected.id || pw !== expected.password) {
      return { ok: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ ok: true, id: expected.id, at: Date.now() })
      );
    } catch (e) {
      return { ok: false, error: '세션을 저장할 수 없습니다.' };
    }
    return { ok: true };
  }

  function logout() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) { /* ignore */ }
  }

  function isLoginPage() {
    var path = location.pathname || '';
    return /\/bo\/login\/?$/i.test(path) ||
      /BO-00-login\.html$/i.test(path) ||
      /BO-00-login\.html$/i.test(location.href || '');
  }

  /** Redirect to login when not authenticated (skip on login page). */
  function requireAuth() {
    if (isLoginPage()) return true;
    if (isLoggedIn()) return true;
    location.replace(LOGIN_PAGE);
    return false;
  }

  /** On login page: if already in, go to dashboard. */
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
    redirectIfLoggedIn: redirectIfLoggedIn,
    getSession: readSession,
    LOGIN_PAGE: LOGIN_PAGE,
    HOME_PAGE: HOME_PAGE,
  };

  requireAuth();
})();
