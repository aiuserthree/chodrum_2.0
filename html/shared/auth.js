/**
 * CHODRUM — FO Supabase Auth
 * Email OTP signup / password policy / Google·Kakao OAuth / Naver (Edge Function bridge)
 *
 * Social onboarding: OAuth session alone is not app login.
 * New users must accept terms (FO-08-oauth-terms) before members upsert + Store.user.
 */
(function () {
  var PROVIDER_META = {
    google: { enabled: true, authType: '구글', label: 'Google' },
    kakao: { enabled: true, authType: '카카오', label: '카카오' },
    naver: {
      enabled: true,
      authType: '네이버',
      label: '네이버',
      reason: '',
    },
  };

  var PENDING_KEY = 'chodrum_oauth_pending';
  var NAVER_STATE_KEY = 'chodrum_naver_oauth_state';
  var OAUTH_FLOW_KEY = 'chodrum_oauth_flow';

  function cfg() {
    return window.CHODRUM_CONFIG || {};
  }

  function client() {
    return window.ChodrumSB && window.ChodrumSB.client;
  }

  function live() {
    return !!(window.ChodrumSB && window.ChodrumSB.configured && client());
  }

  function callbackUrl() {
    var base = (location.origin || '').replace(/\/$/, '');
    return base + '/fo/FO-08-auth-callback.html';
  }

  function naverClientId() {
    return String(cfg().NAVER_CLIENT_ID || '').trim();
  }

  function naverMode() {
    /* 'bridge' (default): Edge Function naver-auth
       'custom': Supabase Custom OAuth provider custom:naver */
    var m = String(cfg().NAVER_OAUTH_MODE || 'bridge').trim().toLowerCase();
    return m === 'custom' ? 'custom' : 'bridge';
  }

  function isNaverReady() {
    if (!live()) return false;
    if (naverMode() === 'custom') return true;
    return !!naverClientId();
  }

  function refreshNaverMeta() {
    if (!isNaverReady()) {
      PROVIDER_META.naver.enabled = false;
      PROVIDER_META.naver.reason = !live()
        ? 'Supabase가 설정되지 않았습니다.'
        : '네이버 Client ID 또는 Edge Function이 필요합니다. docs/supabase-setup.md 를 확인해주세요.';
    } else {
      PROVIDER_META.naver.enabled = true;
      PROVIDER_META.naver.reason = '';
    }
  }

  function setPendingProfile(profile) {
    try {
      if (profile) sessionStorage.setItem(PENDING_KEY, JSON.stringify(profile));
      else sessionStorage.removeItem(PENDING_KEY);
    } catch (e) { /* ignore */ }
  }

  function getPendingProfile() {
    try {
      return JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function clearPendingProfile() {
    setPendingProfile(null);
  }

  function normalizeProvider(raw) {
    if (!raw) return 'email';
    var p = String(raw).toLowerCase();
    if (p === 'custom:naver' || p.indexOf('naver') !== -1) return 'naver';
    if (p.indexOf('kakao') !== -1) return 'kakao';
    if (p.indexOf('google') !== -1) return 'google';
    return p;
  }

  /**
   * Password: English letters + numbers + special chars, min 8.
   * Returns { ok, error } with Korean message.
   */
  function validatePassword(pw) {
    var s = String(pw || '');
    if (s.length < 8) {
      return { ok: false, error: '비밀번호는 8자 이상이어야 해요.' };
    }
    if (!/[A-Za-z]/.test(s)) {
      return { ok: false, error: '영문자를 1자 이상 포함해주세요.' };
    }
    if (!/[0-9]/.test(s)) {
      return { ok: false, error: '숫자를 1자 이상 포함해주세요.' };
    }
    if (!/[^A-Za-z0-9]/.test(s)) {
      return { ok: false, error: '특수문자를 1자 이상 포함해주세요.' };
    }
    return { ok: true, error: '' };
  }

  function passwordHint() {
    return '영문+숫자+특수문자 조합 8자 이상';
  }

  function profileFromUser(user) {
    if (!user) return null;
    var meta = user.user_metadata || {};
    var identities = user.identities || [];
    var rawProvider =
      meta.auth_provider ||
      meta.provider ||
      (identities[0] && identities[0].provider) ||
      (user.app_metadata && user.app_metadata.provider) ||
      'email';
    var provider = normalizeProvider(rawProvider);
    if (provider === 'email' || provider === 'email_password') {
      return {
        type: 'email',
        provider: 'email',
        name: meta.full_name || meta.name || (user.email || '').split('@')[0] || '회원',
        email: user.email || '',
        birth: meta.birth || '',
        fromOAuth: false,
        authId: user.id,
      };
    }
    var name =
      meta.full_name ||
      meta.name ||
      meta.user_name ||
      meta.preferred_username ||
      meta.nickname ||
      (user.email || '').split('@')[0] ||
      (PROVIDER_META[provider] && PROVIDER_META[provider].label + ' 회원') ||
      '소셜 회원';
    return {
      type: 'social',
      provider: provider,
      name: name,
      email: user.email || meta.email || '',
      fromOAuth: true,
      authId: user.id,
      avatar: meta.avatar_url || meta.picture || '',
    };
  }

  function memberPayload(profile) {
    var authType =
      (PROVIDER_META[profile.provider] && PROVIDER_META[profile.provider].authType) ||
      (profile.type === 'social' ? '소셜' : '이메일');
    var out = {
      name: profile.name,
      email: profile.email,
      type: authType,
      auth_type: authType,
    };
    if (profile.terms_agreed_at) out.terms_agreed_at = profile.terms_agreed_at;
    if (profile.privacy_agreed_at) out.privacy_agreed_at = profile.privacy_agreed_at;
    if (Object.prototype.hasOwnProperty.call(profile, 'marketing_agreed_at')) {
      out.marketing_agreed_at = profile.marketing_agreed_at;
    }
    return out;
  }

  function metaHasConsent(meta) {
    return !!(meta && meta.terms_agreed_at && meta.privacy_agreed_at);
  }

  async function fetchConsentFromSession(email) {
    if (!live()) return false;
    try {
      var sessionRes = await client().auth.getSession();
      var user = sessionRes.data && sessionRes.data.session && sessionRes.data.session.user;
      if (!user) return false;
      var meta = user.user_metadata || {};
      if (!metaHasConsent(meta)) return false;
      if (!email) return true;
      var userEmail = String(user.email || meta.email || '').toLowerCase();
      return userEmail === String(email).toLowerCase();
    } catch (e) {
      return false;
    }
  }

  async function fetchConsentForEmail(email) {
    if (email && window.ChodrumAPI && ChodrumAPI.members) {
      try {
        var row = await ChodrumAPI.members.getByEmail(email);
        if (ChodrumAPI.members.hasConsent(row)) return true;
      } catch (e) {
        console.warn('[CHODRUM] consent check', e);
      }
    }
    return fetchConsentFromSession(email);
  }

  async function persistConsentMetadata(consent) {
    if (!live()) return;
    try {
      var res = await client().auth.updateUser({
        data: {
          terms_agreed_at: consent.terms_agreed_at || null,
          privacy_agreed_at: consent.privacy_agreed_at || null,
          marketing_agreed_at: consent.marketing_agreed_at || null,
        },
      });
      if (res.error) console.warn('[CHODRUM] consent metadata', res.error);
    } catch (e) {
      console.warn('[CHODRUM] consent metadata', e);
    }
  }

  async function applyProfile(profile, opts) {
    opts = opts || {};
    if (!profile) return null;
    if (window.Store && Store.user) Store.user.set(profile);
    /*
     * members upsert ONLY for consented users.
     * Email OTP mid-signup has a session but no terms yet — must not create BO rows.
     */
    if (opts.upsert !== false && profile.email && window.ChodrumAPI && ChodrumAPI.members) {
      var canUpsert =
        metaHasConsent(profile) ||
        !!(profile.terms_agreed_at && profile.privacy_agreed_at);
      if (!canUpsert) {
        try {
          canUpsert = await fetchConsentForEmail(profile.email);
        } catch (e) {
          canUpsert = false;
        }
      }
      if (canUpsert) {
        try {
          await ChodrumAPI.members.upsert(memberPayload(profile));
        } catch (e) {
          console.warn('[CHODRUM] member upsert after auth', e);
        }
      }
    }
    clearPendingProfile();
    return profile;
  }

  async function restoreSession() {
    if (!live()) return null;
    var res = await client().auth.getSession();
    var session = res.data && res.data.session;
    if (session && session.user) {
      var profile = profileFromUser(session.user);
      /*
       * Auth session alone ≠ app membership.
       * Email: OTP/password steps keep a session before step-3 terms — do not
       * Store.user.set / members.upsert until consent exists.
       * OAuth: same gate; park profile as pending for FO-08-oauth-terms.
       */
      var consented = await fetchConsentForEmail(profile && profile.email);
      if (!consented) {
        if (profile && profile.fromOAuth) {
          setPendingProfile(profile);
        }
        var u = window.Store && Store.user && Store.user.get();
        if (u) Store.user.clear();
        return null;
      }
      return applyProfile(profile);
    }
    var existing = window.Store && Store.user && Store.user.get();
    if (existing && existing.fromOAuth) Store.user.clear();
    return null;
  }

  /* ---------- Email OTP / password ---------- */

  var ALREADY_MEMBER_MSG = '이미 가입된 이메일이에요. 로그인해 주세요.';

  async function findExistingMember(email) {
    var addr = String(email || '').trim();
    if (!addr || !window.ChodrumAPI || !ChodrumAPI.members) return null;
    try {
      var row = (await ChodrumAPI.members.getByEmail(addr)) || null;
      /* 약관 동의 전 고스트 행은 완료 회원이 아님 — 재가입 허용 */
      if (row && !ChodrumAPI.members.hasConsent(row)) return null;
      return row;
    } catch (e) {
      console.warn('[CHODRUM] member lookup', e);
      return null;
    }
  }

  /**
   * Signup OTP via signInWithOtp (NOT signUp).
   * Hosted Supabase: first mail for an unconfirmed new user uses the
   * "Confirm sign up" template; later mails use "Magic Link".
   * Paste {{ .Token }} into BOTH Dashboard templates.
   *
   * opts.forSignup: block send when members row already exists (completed signup).
   * Password-reset must call without forSignup so existing emails still get OTP.
   */
  async function sendEmailOtp(email, opts) {
    opts = opts || {};
    if (!live()) {
      return { ok: false, error: 'Supabase가 설정되지 않았습니다. config.js를 확인해주세요.' };
    }
    var addr = String(email || '').trim();
    if (opts.forSignup) {
      var existing = await findExistingMember(addr);
      if (existing) {
        return { ok: false, alreadyMember: true, error: ALREADY_MEMBER_MSG };
      }
    }
    var res = await client().auth.signInWithOtp({
      email: addr,
      options: {
        shouldCreateUser: true,
      },
    });
    if (res.error) {
      return { ok: false, error: res.error.message || '인증코드를 보내지 못했어요.' };
    }
    return { ok: true };
  }

  async function verifyEmailOtp(email, token, opts) {
    opts = opts || {};
    if (!live()) {
      return { ok: false, error: 'Supabase가 설정되지 않았습니다.' };
    }
    var code = String(token || '').trim();
    if (!/^\d{6}$/.test(code)) {
      return { ok: false, error: '6자리 인증코드를 입력해주세요.' };
    }
    var addr = String(email || '').trim();
    if (opts.forSignup) {
      var existingBefore = await findExistingMember(addr);
      if (existingBefore) {
        return { ok: false, alreadyMember: true, error: ALREADY_MEMBER_MSG };
      }
    }
    /* New signup OTP often arrives as confirmation → type signup first */
    var types = ['signup', 'email', 'magiclink'];
    var lastErr = null;
    var session = null;
    for (var i = 0; i < types.length; i++) {
      var res = await client().auth.verifyOtp({
        email: addr,
        token: code,
        type: types[i],
      });
      if (!res.error) {
        session = res.data && res.data.session;
        if (!session) {
          var sr = await client().auth.getSession();
          session = sr.data && sr.data.session;
        }
        /* Successful verifyOtp call — stop trying other types */
        lastErr = null;
        break;
      }
      lastErr = res.error;
    }
    if (lastErr || !session || !session.user) {
      /* Do not treat a pre-existing browser session as OTP success */
      return { ok: false, error: (lastErr && lastErr.message) || '인증코드가 올바르지 않아요.' };
    }
    if (String(session.user.email || '').toLowerCase() !== addr.toLowerCase()) {
      try { await client().auth.signOut(); } catch (e) { /* ignore */ }
      return { ok: false, error: '인증코드가 올바르지 않아요.' };
    }
    if (opts.forSignup) {
      var existingAfter = await findExistingMember(addr);
      if (existingAfter) {
        try { await client().auth.signOut(); } catch (e) { /* ignore */ }
        return { ok: false, alreadyMember: true, error: ALREADY_MEMBER_MSG };
      }
    }
    return { ok: true, session: session };
  }

  async function completeEmailSignup(opts) {
    opts = opts || {};
    if (!live()) {
      return { ok: false, error: 'Supabase가 설정되지 않았습니다.' };
    }
    var nameTrim = String(opts.name || '').trim();
    if (!nameTrim) {
      return { ok: false, error: '이름을 입력해주세요.' };
    }
    if (nameTrim.length < 2) {
      return { ok: false, error: '이름을 2자 이상 입력해주세요.' };
    }
    var pwCheck = validatePassword(opts.password);
    if (!pwCheck.ok) return { ok: false, error: pwCheck.error };

    var sessionRes = await client().auth.getSession();
    var session = sessionRes.data && sessionRes.data.session;
    if (!session || !session.user) {
      return { ok: false, error: '이메일 인증 세션이 없어요. 인증을 다시 진행해주세요.' };
    }

    var sessionEmail = String(session.user.email || '').trim();
    if (!sessionEmail) {
      return { ok: false, error: '이메일 인증 세션이 없어요. 인증을 다시 진행해주세요.' };
    }

    var existing = await findExistingMember(sessionEmail);
    if (existing) {
      return { ok: false, alreadyMember: true, error: ALREADY_MEMBER_MSG };
    }

    var now = new Date().toISOString();
    var consent = {
      terms_agreed_at: now,
      privacy_agreed_at: now,
      marketing_agreed_at: opts.marketing ? now : null,
    };

    var upd = await client().auth.updateUser({
      password: opts.password,
      data: {
        full_name: nameTrim,
        name: nameTrim,
        birth: opts.birth || '',
        auth_provider: 'email',
        terms_agreed_at: consent.terms_agreed_at,
        privacy_agreed_at: consent.privacy_agreed_at,
        marketing_agreed_at: consent.marketing_agreed_at,
      },
    });
    if (upd.error) {
      return { ok: false, error: upd.error.message || '회원 정보를 저장하지 못했어요.' };
    }

    var profile = profileFromUser(upd.data.user || session.user);
    profile.name = nameTrim;
    if (opts.birth) profile.birth = opts.birth;
    profile = Object.assign({}, profile, consent);

    if (window.ChodrumAPI && ChodrumAPI.members) {
      try {
        await ChodrumAPI.members.upsert(memberPayload(profile));
      } catch (e) {
        console.warn('[CHODRUM] email signup upsert', e);
        return { ok: false, error: '회원 정보를 저장하지 못했어요. 잠시 후 다시 시도해주세요.' };
      }
    }

    /* 가입 완료 후 자동 로그인하지 않음 — 세션 종료 후 로그인 유도 */
    await signOut();
    return { ok: true, profile: profile };
  }

  async function signInWithPassword(email, password) {
    if (!live()) {
      return { ok: false, error: 'Supabase가 설정되지 않았습니다. config.js를 확인해주세요.' };
    }
    var res = await client().auth.signInWithPassword({
      email: String(email || '').trim(),
      password: String(password || ''),
    });
    if (res.error) {
      return { ok: false, error: res.error.message || '이메일 또는 비밀번호를 확인해주세요.' };
    }
    var profile = profileFromUser(res.data.session && res.data.session.user);
    await applyProfile(profile);
    return { ok: true, profile: profile };
  }

  async function sendPasswordRecovery(email) {
    if (!live()) {
      return { ok: false, error: 'Supabase가 설정되지 않았습니다.' };
    }
    /* Recovery OTP shares Magic Link / Recovery template — use {{ .Token }} */
    var res = await client().auth.resetPasswordForEmail(String(email || '').trim(), {
      redirectTo: callbackUrl(),
    });
    if (res.error) {
      return { ok: false, error: res.error.message || '인증코드를 보내지 못했어요.' };
    }
    return { ok: true };
  }

  async function verifyRecoveryOtp(email, token) {
    if (!live()) {
      return { ok: false, error: 'Supabase가 설정되지 않았습니다.' };
    }
    var code = String(token || '').trim();
    var res = await client().auth.verifyOtp({
      email: String(email || '').trim(),
      token: code,
      type: 'recovery',
    });
    if (res.error) {
      return { ok: false, error: res.error.message || '인증코드가 올바르지 않아요.' };
    }
    return { ok: true };
  }

  async function updatePassword(newPassword) {
    if (!live()) {
      return { ok: false, error: 'Supabase가 설정되지 않았습니다.' };
    }
    var pwCheck = validatePassword(newPassword);
    if (!pwCheck.ok) return { ok: false, error: pwCheck.error };
    var res = await client().auth.updateUser({ password: newPassword });
    if (res.error) {
      return { ok: false, error: res.error.message || '비밀번호를 변경하지 못했어요.' };
    }
    return { ok: true };
  }

  async function changePassword(currentPassword, newPassword) {
    if (!live()) {
      return { ok: false, error: 'Supabase가 설정되지 않았습니다.' };
    }
    var pwCheck = validatePassword(newPassword);
    if (!pwCheck.ok) return { ok: false, error: pwCheck.error };

    var sessionRes = await client().auth.getSession();
    var user = sessionRes.data && sessionRes.data.session && sessionRes.data.session.user;
    if (!user || !user.email) {
      return { ok: false, error: '로그인이 필요해요.' };
    }

    var re = await client().auth.signInWithPassword({
      email: user.email,
      password: String(currentPassword || ''),
    });
    if (re.error) {
      return { ok: false, error: '현재 비밀번호가 올바르지 않아요.' };
    }
    return updatePassword(newPassword);
  }

  /* ---------- OAuth ---------- */

  function randomState() {
    try {
      var arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      return Array.from(arr, function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    } catch (e) {
      return String(Date.now()) + Math.random().toString(36).slice(2);
    }
  }

  function setOAuthFlow(name) {
    try {
      if (name) sessionStorage.setItem(OAUTH_FLOW_KEY, name);
      else sessionStorage.removeItem(OAUTH_FLOW_KEY);
    } catch (e) { /* ignore */ }
  }

  function getOAuthFlow() {
    try {
      return sessionStorage.getItem(OAUTH_FLOW_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  async function startNaverBridge() {
    var clientId = naverClientId();
    if (!clientId) {
      return {
        ok: false,
        skipped: true,
        error: 'NAVER_CLIENT_ID가 config.js에 없습니다.',
      };
    }
    var state = randomState();
    try {
      sessionStorage.setItem(NAVER_STATE_KEY, state);
      setOAuthFlow('naver');
    } catch (e) { /* ignore */ }
    var url =
      'https://nid.naver.com/oauth2.0/authorize' +
      '?response_type=code' +
      '&client_id=' + encodeURIComponent(clientId) +
      '&redirect_uri=' + encodeURIComponent(callbackUrl()) +
      '&state=' + encodeURIComponent(state);
    location.href = url;
    return { ok: true };
  }

  async function finishNaverBridge(params) {
    var code = params.get('code');
    var state = params.get('state');
    var err = params.get('error');
    if (err) {
      return { ok: false, error: params.get('error_description') || err };
    }
    if (!code) {
      return { ok: false, error: '네이버 인증 코드가 없습니다.' };
    }

    var saved = '';
    try {
      saved = sessionStorage.getItem(NAVER_STATE_KEY) || '';
      sessionStorage.removeItem(NAVER_STATE_KEY);
      setOAuthFlow(null);
    } catch (e) { /* ignore */ }
    if (saved && state && saved !== state) {
      return { ok: false, error: '네이버 로그인 상태 값이 일치하지 않아요. 다시 시도해주세요.' };
    }

    var base = String(cfg().SUPABASE_URL || '').replace(/\/$/, '');
    var anon = String(cfg().SUPABASE_ANON_KEY || '');
    if (!base || !anon) {
      return { ok: false, error: 'Supabase 설정이 없습니다.' };
    }

    var fnRes = await fetch(base + '/functions/v1/naver-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + anon,
        apikey: anon,
      },
      body: JSON.stringify({
        code: code,
        redirect_uri: callbackUrl(),
        state: state || '',
      }),
    });

    var payload = null;
    try {
      payload = await fnRes.json();
    } catch (e) {
      return { ok: false, error: '네이버 인증 서버 응답을 읽지 못했어요.' };
    }
    if (!fnRes.ok || !payload || !payload.token_hash) {
      return {
        ok: false,
        error: (payload && payload.error) || '네이버 로그인에 실패했어요. Edge Function 배포·시크릿을 확인해주세요.',
      };
    }

    var verified = await client().auth.verifyOtp({
      token_hash: payload.token_hash,
      type: 'magiclink',
    });
    if (verified.error) {
      var verified2 = await client().auth.verifyOtp({
        token_hash: payload.token_hash,
        type: 'email',
      });
      if (verified2.error) {
        return { ok: false, error: verified.error.message || '세션을 만들지 못했어요.' };
      }
    }

    /* Ensure metadata marks Naver even if verifyOtp reset provider */
    try {
      await client().auth.updateUser({
        data: {
          auth_provider: 'naver',
          provider: 'naver',
          full_name: (payload.profile && payload.profile.name) || undefined,
          avatar_url: (payload.profile && payload.profile.avatar) || undefined,
        },
      });
    } catch (e) {
      console.warn('[CHODRUM] naver metadata', e);
    }

    var sessionRes = await client().auth.getSession();
    var session = sessionRes.data && sessionRes.data.session;
    if (!session || !session.user) {
      return { ok: false, error: '로그인 세션을 받지 못했습니다.' };
    }

    var profile = profileFromUser(session.user);
    if (payload.profile && payload.profile.name) profile.name = payload.profile.name;
    profile.provider = 'naver';
    profile.type = 'social';
    profile.fromOAuth = true;

    var consented = await fetchConsentForEmail(profile.email);
    if (!consented) {
      setPendingProfile(profile);
      var cur = window.Store && Store.user && Store.user.get();
      if (cur && cur.fromOAuth) Store.user.clear();
      return { ok: true, needsTerms: true, profile: profile };
    }

    profile = await applyProfile(profile);
    return { ok: true, needsTerms: false, profile: profile };
  }

  /**
   * Start OAuth. Returns { ok, error, skipped }.
   */
  async function signInWithOAuth(provider) {
    refreshNaverMeta();
    var meta = PROVIDER_META[provider];
    if (!meta || !meta.enabled) {
      return {
        ok: false,
        skipped: true,
        error: (meta && meta.reason) || '지원하지 않는 로그인입니다.',
      };
    }
    if (!live()) {
      return {
        ok: false,
        skipped: true,
        error: 'Supabase가 설정되지 않았습니다. config.js를 확인해주세요.',
      };
    }

    if (provider === 'naver') {
      if (naverMode() === 'custom') {
        setOAuthFlow('naver-custom');
        var customRes = await client().auth.signInWithOAuth({
          provider: 'custom:naver',
          options: { redirectTo: callbackUrl() },
        });
        if (customRes.error) {
          setOAuthFlow(null);
          return {
            ok: false,
            error: customRes.error.message || '네이버(Custom Provider) 로그인을 시작할 수 없습니다.',
          };
        }
        return { ok: true };
      }
      return startNaverBridge();
    }

    setOAuthFlow(provider);
    try {
      sessionStorage.removeItem(NAVER_STATE_KEY);
    } catch (e) { /* ignore */ }

    var opts = {
      provider: provider,
      options: {
        redirectTo: callbackUrl(),
      },
    };
    if (provider === 'google') {
      opts.options.queryParams = { access_type: 'offline', prompt: 'select_account' };
    }
    var res = await client().auth.signInWithOAuth(opts);
    if (res.error) {
      return { ok: false, error: res.error.message || '소셜 로그인을 시작할 수 없습니다.' };
    }
    return { ok: true };
  }

  /** After redirect to callback page — pick up session; may require terms. */
  async function finishOAuthRedirect() {
    if (!live()) {
      return { ok: false, error: 'Supabase가 설정되지 않았습니다.' };
    }

    var params = new URLSearchParams(location.search);
    var hashParams = new URLSearchParams((location.hash || '').replace(/^#/, ''));
    var err = params.get('error') || hashParams.get('error');
    var errDesc = params.get('error_description') || hashParams.get('error_description');
    if (err) {
      return { ok: false, error: decodeURIComponent(errDesc || err) };
    }

    /* Naver bridge only when this tab started Naver (avoid stealing Google/Kakao PKCE code) */
    if (params.get('code') && getOAuthFlow() === 'naver' && naverMode() !== 'custom') {
      return finishNaverBridge(params);
    }

    var sessionRes = await client().auth.getSession();
    var session = sessionRes.data && sessionRes.data.session;

    var code = params.get('code');
    if (!session && code) {
      var exchanged = await client().auth.exchangeCodeForSession(code);
      if (exchanged.error) {
        return { ok: false, error: exchanged.error.message || '인증 코드를 교환하지 못했습니다.' };
      }
      session = exchanged.data && exchanged.data.session;
    }
    try {
      setOAuthFlow(null);
    } catch (e) { /* ignore */ }

    if (!session || !session.user) {
      await new Promise(function (r) { setTimeout(r, 500); });
      sessionRes = await client().auth.getSession();
      session = sessionRes.data && sessionRes.data.session;
    }
    if (!session || !session.user) {
      return { ok: false, error: '로그인 세션을 받지 못했습니다. 다시 시도해주세요.' };
    }

    var profile = profileFromUser(session.user);
    if (profile && profile.fromOAuth) {
      var consented = await fetchConsentForEmail(profile.email);
      if (!consented) {
        setPendingProfile(profile);
        var cur = window.Store && Store.user && Store.user.get();
        if (cur && cur.fromOAuth) Store.user.clear();
        return { ok: true, needsTerms: true, profile: profile };
      }
    }

    profile = await applyProfile(profile);
    return { ok: true, needsTerms: false, profile: profile };
  }

  async function completeTermsConsent(opts) {
    opts = opts || {};
    var profile = getPendingProfile();
    if (!profile && live()) {
      var sessionRes = await client().auth.getSession();
      var user = sessionRes.data && sessionRes.data.session && sessionRes.data.session.user;
      profile = profileFromUser(user);
    }
    if (!profile || !profile.email) {
      return { ok: false, error: '가입 정보가 없어요. 소셜 로그인을 다시 시도해주세요.' };
    }

    var now = new Date().toISOString();
    var consent = {
      terms_agreed_at: now,
      privacy_agreed_at: now,
      marketing_agreed_at: opts.marketing ? now : null,
    };
    var enriched = Object.assign({}, profile, consent);

    await persistConsentMetadata(consent);

    if (window.ChodrumAPI && ChodrumAPI.members) {
      try {
        await ChodrumAPI.members.upsert(memberPayload(enriched));
      } catch (e) {
        console.warn('[CHODRUM] consent upsert', e);
        return { ok: false, error: '회원 정보를 저장하지 못했어요. 잠시 후 다시 시도해주세요.' };
      }
    }

    await applyProfile(profile, { upsert: false });
    return { ok: true, profile: profile };
  }

  async function declineTermsConsent() {
    clearPendingProfile();
    await signOut();
  }

  async function signOut() {
    if (live()) {
      try {
        await client().auth.signOut();
      } catch (e) {
        console.warn('[CHODRUM] signOut', e);
      }
    }
    clearPendingProfile();
    if (window.Store && Store.user) Store.user.clear();
  }

  function isProviderEnabled(provider) {
    refreshNaverMeta();
    return !!(PROVIDER_META[provider] && PROVIDER_META[provider].enabled);
  }

  function providerReason(provider) {
    refreshNaverMeta();
    return (PROVIDER_META[provider] && PROVIDER_META[provider].reason) || '';
  }

  refreshNaverMeta();

  window.ChodrumAuth = {
    providers: PROVIDER_META,
    callbackUrl: callbackUrl,
    isProviderEnabled: isProviderEnabled,
    providerReason: providerReason,
    profileFromUser: profileFromUser,
    validatePassword: validatePassword,
    passwordHint: passwordHint,
    sendEmailOtp: sendEmailOtp,
    verifyEmailOtp: verifyEmailOtp,
    completeEmailSignup: completeEmailSignup,
    signInWithPassword: signInWithPassword,
    sendPasswordRecovery: sendPasswordRecovery,
    verifyRecoveryOtp: verifyRecoveryOtp,
    updatePassword: updatePassword,
    changePassword: changePassword,
    signInWithOAuth: signInWithOAuth,
    finishOAuthRedirect: finishOAuthRedirect,
    completeTermsConsent: completeTermsConsent,
    declineTermsConsent: declineTermsConsent,
    getPendingProfile: getPendingProfile,
    hasConsentForEmail: fetchConsentForEmail,
    restoreSession: restoreSession,
    signOut: signOut,
    live: live,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      restoreSession().catch(function () {});
    });
  } else {
    restoreSession().catch(function () {});
  }
})();
