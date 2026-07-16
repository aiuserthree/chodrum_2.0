/* FO-08-01 로그인 — Supabase OAuth(구글) + 카카오/네이버 bridge + 이메일 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Input, Divider, SocialButton, Checkbox, Icon } = DS;
const F = window.FO;
const Auth = window.ChodrumAuth;
const SAVED_EMAIL_KEY = 'chodrum_saved_email';

function readSavedEmail() {
  try {
    const v = localStorage.getItem(SAVED_EMAIL_KEY);
    return (v && String(v).trim()) || '';
  } catch (e) {
    return '';
  }
}

function persistSavedEmail(checked, value) {
  try {
    if (checked && value) localStorage.setItem(SAVED_EMAIL_KEY, value);
    else localStorage.removeItem(SAVED_EMAIL_KEY);
  } catch (e) {}
}

function LoginPage() {
  const saved = readSavedEmail();
  const [email, setEmail] = React.useState(saved);
  const [pw, setPw] = React.useState('');
  const [saveId, setSaveId] = React.useState(!!saved);
  const [err, setErr] = React.useState('');
  const [busy, setBusy] = React.useState(null);

  React.useEffect(() => {
    Auth.restoreSession().then((profile) => {
      if (profile) location.replace(F.PAGES.my);
    }).catch(() => {});
  }, []);

  const socialLogin = async (provider) => {
    if (busy) return;
    if (!Auth.isProviderEnabled(provider)) {
      F.toast(Auth.providerReason(provider) || '곧 지원 예정이에요');
      return;
    }
    setBusy(provider);
    setErr('');
    try {
      const r = await Auth.signInWithOAuth(provider);
      if (!r.ok) {
        setErr(r.error || '소셜 로그인을 시작할 수 없습니다.');
        F.toast(r.error || '소셜 로그인 실패');
        setBusy(null);
      }
      /* ok → browser redirects to provider */
    } catch (e) {
      setErr((e && e.message) || '소셜 로그인 오류');
      setBusy(null);
    }
  };

  const emailLogin = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!/.+@.+\..+/.test(email) || pw.length < 1) { setErr('이메일 또는 비밀번호를 확인해주세요.'); return; }
    setBusy('email');
    setErr('');
    try {
      const trimmed = email.trim();
      const r = await Auth.signInWithPassword(trimmed, pw);
      if (!r.ok) {
        setErr(r.error || '이메일 또는 비밀번호를 확인해주세요.');
        setBusy(null);
        return;
      }
      persistSavedEmail(saveId, trimmed);
      location.href = F.PAGES.my;
    } catch (ex) {
      setErr((ex && ex.message) || '로그인 오류');
      setBusy(null);
    }
  };

  const socialStyle = (provider) =>
    Auth.isProviderEnabled(provider)
      ? (busy === provider ? { opacity: 0.7, pointerEvents: 'none' } : undefined)
      : { opacity: 0.45, cursor: 'not-allowed', filter: 'grayscale(0.35)' };

  return (
    <F.Scaffold title="로그인" back={F.PAGES.home} footer={false}>
      <div data-screen-label="FO-08-01 로그인" className="fo-container narrow" style={{ padding: '0 0 40px' }}>
        <div style={{ padding: '32px 0 22px', textAlign: 'center' }}>
          <img src="../shared/logo.png" alt="CHODRUM 로고" style={{ width: 88, height: 88, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
          <div style={{ fontSize: 23, fontWeight: 600, letterSpacing: '-0.6px', marginTop: 8 }}>CHODRUM</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>다시 오신 걸 환영해요</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SocialButton provider="kakao" style={socialStyle('kakao')} onClick={() => socialLogin('kakao')} />
          <SocialButton provider="naver" style={socialStyle('naver')} onClick={() => socialLogin('naver')} />
          <SocialButton provider="google" style={socialStyle('google')} onClick={() => socialLogin('google')} />
          {(!Auth.isProviderEnabled('kakao') || !Auth.isProviderEnabled('naver')) ? (
            <p className="fo-caption" style={{ textAlign: 'center' }}>
              {!Auth.isProviderEnabled('kakao') && !Auth.isProviderEnabled('naver')
                ? '카카오·네이버는 Client ID와 Edge Function 설정 후 이용할 수 있어요. Google로 계속해 주세요.'
                : !Auth.isProviderEnabled('kakao')
                  ? '카카오는 REST API 키·Edge Function(kakao-auth) 설정 후 이용할 수 있어요.'
                  : '네이버는 Client ID·Edge Function(naver-auth) 설정 후 이용할 수 있어요.'}
            </p>
          ) : null}
        </div>

        <Divider label="또는 이메일로" spacing={20} />

        <form onSubmit={emailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="이메일" type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} />
          <Input label="비밀번호" type="password" placeholder="••••••••" value={pw} onChange={(e) => { setPw(e.target.value); setErr(''); }} error={err || undefined} />
          <Checkbox checked={saveId} onChange={setSaveId} label="아이디 저장" />
          <Button type="submit" variant="primary" size="lg" fullWidth disabled={busy === 'email'}>{busy === 'email' ? '로그인 중…' : '로그인'}</Button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 18, fontSize: 13, flexWrap: 'wrap' }}>
          <a href={F.PAGES.signup} style={{ fontWeight: 500 }}>회원가입</a>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <a href={F.PAGES.findId} style={{ color: 'var(--text-secondary)' }}>아이디 찾기</a>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <a href={F.PAGES.reset} style={{ color: 'var(--text-secondary)' }}>비밀번호 찾기</a>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <a href={F.PAGES.guest} style={{ color: 'var(--text-secondary)' }}>비회원 주문 조회</a>
        </div>

        <p className="fo-caption" style={{ textAlign: 'center', marginTop: 22 }}>
          소셜 회원은 비밀번호 없이 각 플랫폼 인증으로 로그인해요.<br />비밀번호 찾기는 이메일로 가입한 일반 회원만 이용할 수 있어요.
        </p>
      </div>
    </F.Scaffold>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<LoginPage />);
});
