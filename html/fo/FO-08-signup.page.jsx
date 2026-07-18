/* FO-08-02/03 회원가입 — 이메일 OTP 인증 → 비밀번호 → 약관 + 소셜 OAuth */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Input, Divider, SocialButton, Checkbox, Icon, Badge } = DS;
const F = window.FO;
const Auth = window.ChodrumAuth;

function Steps({ cur }) {
  const items = ['이메일 인증', '정보 입력', '약관 동의'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '4px 0 24px' }}>
      {items.map((l, i) => {
        const n = i + 1;
        const on = cur === n, done = cur > n;
        return (
          <React.Fragment key={l}>
            {i ? <span style={{ flex: 1, height: 1, background: done || on ? 'var(--color-ink)' : 'var(--border-default)', margin: '0 8px' }}></span> : null}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span className="ds-mono" style={{ width: 22, height: 22, borderRadius: 9999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, background: on || done ? 'var(--color-ink)' : 'transparent', color: on || done ? '#fff' : 'var(--text-tertiary)', border: on || done ? 'none' : '1px solid var(--border-strong)' }}>{done ? <Icon name="check" size={12} /> : n}</span>
              <span style={{ fontSize: 12.5, fontWeight: on ? 600 : 500, color: on ? 'var(--color-ink)' : 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{l}</span>
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SignupPage() {
  const [step, setStep] = React.useState(1);
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [emailVerified, setEmailVerified] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [codeErr, setCodeErr] = React.useState('');
  const [emailErr, setEmailErr] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const [name, setName] = React.useState('');
  const [birth, setBirth] = React.useState('');
  const [t1, setT1] = React.useState(false);
  const [t2, setT2] = React.useState(false);
  const [t3, setT3] = React.useState(false);
  const [doc, setDoc] = React.useState(null); /* 'terms' | 'privacy' | 'marketing' | null */
  const [done, setDone] = React.useState(false);
  const [busy, setBusy] = React.useState(null);
  const [pwErr, setPwErr] = React.useState('');
  const [nameErr, setNameErr] = React.useState('');

  const emailOk = /.+@.+\..+/.test(email);
  const codeOk = /^\d{6}$/.test(code.trim());
  const pwCheck = Auth.validatePassword(pw);
  const pwOk = pwCheck.ok && pw === pw2;
  const nameOk = name.trim().length >= 2;
  const birthOk = /^\d{8}$/.test(birth) && +birth.slice(4, 6) >= 1 && +birth.slice(4, 6) <= 12 && +birth.slice(6, 8) >= 1 && +birth.slice(6, 8) <= 31;
  /* OTP 성공 전에는 항상 1단계 UI — step 숫자만으로 2·3단계 진입 불가 */
  const uiStep = emailVerified ? step : 1;

  const onEmailChange = (v) => {
    setEmail(v);
    setEmailErr('');
    if (emailVerified || sent || step !== 1) {
      setSent(false);
      setEmailVerified(false);
      setCode('');
      setCodeErr('');
      setStep(1);
    }
  };

  const goLogin = () => { location.href = F.PAGES.login; };

  const socialSignup = async (provider) => {
    if (busy) return;
    if (!Auth.isProviderEnabled(provider)) {
      F.toast(Auth.providerReason(provider) || '곧 지원 예정이에요');
      return;
    }
    setBusy(provider);
    try {
      const r = await Auth.signInWithOAuth(provider);
      if (!r.ok) {
        F.toast(r.error || '소셜 가입을 시작할 수 없습니다.');
        setBusy(null);
      }
    } catch (e) {
      F.toast((e && e.message) || '소셜 가입 오류');
      setBusy(null);
    }
  };

  const socialStyle = (provider) =>
    Auth.isProviderEnabled(provider)
      ? (busy === provider ? { opacity: 0.7, pointerEvents: 'none' } : undefined)
      : { opacity: 0.45, cursor: 'not-allowed', filter: 'grayscale(0.35)' };

  const sendCode = async () => {
    if (!emailOk || busy) return;
    setBusy('otp');
    setCodeErr('');
    setEmailErr('');
    setEmailVerified(false);
    try {
      const r = await Auth.sendEmailOtp(email.trim(), { forSignup: true });
      if (!r.ok) {
        if (r.alreadyMember) {
          setEmailErr(r.error || '이미 가입된 이메일이에요. 로그인해 주세요.');
          setSent(false);
          F.toast(r.error || '이미 가입된 이메일이에요. 로그인해 주세요.');
        } else {
          F.toast(r.error || '인증코드를 보내지 못했어요');
        }
        setBusy(null);
        return;
      }
      setSent(true);
      setCode('');
      F.toast('인증코드를 보냈어요. 메일함·스팸함을 확인해주세요.');
    } catch (e) {
      F.toast((e && e.message) || '인증코드 발송 오류');
    }
    setBusy(null);
  };

  const verify = async () => {
    if (busy) return;
    if (!sent) { setCodeErr('먼저 인증코드를 받아주세요.'); return; }
    if (!codeOk) { setCodeErr('6자리 인증코드를 입력해주세요.'); return; }
    setBusy('verify');
    setCodeErr('');
    setEmailErr('');
    try {
      const r = await Auth.verifyEmailOtp(email.trim(), code.trim(), { forSignup: true });
      if (!r.ok) {
        setEmailVerified(false);
        if (r.alreadyMember) {
          setEmailErr(r.error || '이미 가입된 이메일이에요. 로그인해 주세요.');
          setSent(false);
          setCode('');
          F.toast(r.error || '이미 가입된 이메일이에요. 로그인해 주세요.');
        } else {
          setCodeErr(r.error || '인증코드가 올바르지 않아요.');
        }
        setBusy(null);
        return;
      }
      if (!r.session) {
        setEmailVerified(false);
        setCodeErr('인증에 실패했어요. 코드를 다시 확인해주세요.');
        setBusy(null);
        return;
      }
      setEmailVerified(true);
      setStep(2);
    } catch (e) {
      setEmailVerified(false);
      setCodeErr((e && e.message) || '인증에 실패했어요.');
    }
    setBusy(null);
  };

  const goInfoNext = () => {
    if (!emailVerified) {
      F.toast('이메일 인증을 먼저 완료해주세요.');
      setStep(1);
      return;
    }
    if (!name.trim()) {
      setNameErr('이름을 입력해주세요.');
      return;
    }
    if (!nameOk) {
      setNameErr('이름을 2자 이상 입력해주세요.');
      return;
    }
    setNameErr('');
    const v = Auth.validatePassword(pw);
    if (!v.ok) { setPwErr(v.error); return; }
    if (pw !== pw2) { setPwErr('비밀번호가 서로 달라요.'); return; }
    setPwErr('');
    setStep(3);
  };

  const finish = async () => {
    if (busy || !(t1 && t2)) return;
    if (!emailVerified) {
      F.toast('이메일 인증을 먼저 완료해주세요.');
      setStep(1);
      return;
    }
    if (!name.trim() || !nameOk) {
      F.toast(!name.trim() ? '이름을 입력해주세요.' : '이름을 2자 이상 입력해주세요.');
      setStep(2);
      return;
    }
    setBusy('finish');
    try {
      const r = await Auth.completeEmailSignup({
        name: name.trim(),
        birth,
        password: pw,
        marketing: !!t3,
      });
      if (!r.ok) {
        if (r.alreadyMember) {
          F.toast(r.error || '이미 가입된 이메일이에요. 로그인해 주세요.');
          setTimeout(goLogin, 800);
        } else {
          F.toast(r.error || '가입에 실패했어요');
        }
        setBusy(null);
        return;
      }
      setDone(true);
    } catch (e) {
      F.toast((e && e.message) || '가입 오류');
      setBusy(null);
    }
  };

  if (done) {
    return (
      <F.Scaffold title="회원가입" footer={false}>
        <div data-screen-label="FO-08-02 가입 완료" className="fo-container narrow" style={{ padding: 0 }}>
          <div style={{ padding: '56px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
            <span style={{ width: 60, height: 60, borderRadius: 9999, background: 'var(--status-success-bg)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={30} /></span>
            <h3 style={{ fontSize: 22, letterSpacing: '-0.6px' }}>가입이 완료되었어요</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}><span className="ds-mono">{email}</span> 계정으로<br />가입했어요. 로그인해 주세요.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="primary" size="lg" fullWidth onClick={goLogin}>로그인</Button>
          </div>
        </div>
      </F.Scaffold>
    );
  }

  const docTitle =
    doc === 'privacy' ? '개인정보 수집 · 이용 동의'
      : doc === 'marketing' ? '마케팅 수신 동의'
        : '이용약관';

  return (
    <F.Scaffold title="회원가입" back={F.PAGES.login} footer={false}>
      <div data-screen-label="FO-08-02 회원가입" className="fo-container narrow" style={{ padding: '0 0 40px' }}>
        <div style={{ padding: '28px 0 18px', textAlign: 'center' }}>
          <img src="../shared/logo.png" alt="CHODRUM 로고" style={{ width: 80, height: 80, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
          <div style={{ fontSize: 23, fontWeight: 600, letterSpacing: '-0.6px', marginTop: 8 }}>CHODRUM</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>3초 만에 시작하세요</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SocialButton provider="kakao" style={socialStyle('kakao')} onClick={() => socialSignup('kakao')} />
          <SocialButton provider="naver" style={socialStyle('naver')} onClick={() => socialSignup('naver')} />
          <SocialButton provider="google" style={socialStyle('google')} onClick={() => socialSignup('google')} />
          <p className="fo-caption" style={{ textAlign: 'center' }}>
            소셜 간편가입은 비밀번호 없이 플랫폼 계정이 로그인 ID가 돼요.
            {!Auth.isProviderEnabled('kakao') || !Auth.isProviderEnabled('naver')
              ? ' 카카오·네이버는 Client ID와 Edge Function 설정 후 활성화돼요.'
              : ''}
          </p>
        </div>

        <Divider label="또는 이메일로 가입" spacing={20} />
        <Steps cur={uiStep} />

        {uiStep === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}><Input label="이메일" type="email" placeholder="you@example.com" value={email} onChange={(e) => onEmailChange(e.target.value)} error={emailErr || undefined} /></div>
                <Button variant="secondary" size="md" style={{ height: 44, flex: 'none' }} disabled={!emailOk || !!busy} onClick={sendCode}>{busy === 'otp' ? '발송 중…' : (sent ? '재발송' : '인증코드 받기')}</Button>
              </div>
              {emailErr ? (
                <span style={{ fontSize: 12.5, color: 'var(--status-danger, #c0392b)' }}>
                  {emailErr}{' '}
                  <a href={F.PAGES.login} style={{ fontWeight: 600, textDecoration: 'underline' }}>로그인</a>
                </span>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>인증한 이메일이 로그인 ID가 돼요. 메일에 온 6자리 코드를 입력하세요.</span>
              )}
            </div>
            {sent ? (
              <React.Fragment>
                <Input label="인증코드" placeholder="6자리 코드" value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setCodeErr(''); }} error={codeErr || undefined} hint="메일로 받은 6자리 코드를 입력하세요. 인증 완료 전에는 가입할 수 없어요." />
                <Button variant="primary" size="lg" fullWidth disabled={!codeOk || busy === 'verify'} onClick={verify}>{busy === 'verify' ? '확인 중…' : '인증 완료'}</Button>
              </React.Fragment>
            ) : null}
          </div>
        ) : null}

        {uiStep === 2 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--status-success-bg)', borderRadius: 'var(--radius-lg)' }}>
              <Icon name="check" size={14} style={{ color: 'var(--status-success)' }} />
              <span style={{ fontSize: 13 }}>인증 완료 — <b className="ds-mono">{email}</b> 이 로그인 ID로 확정되었어요.</span>
            </div>
            <Input
              label="이름 (필수)"
              placeholder="실명을 입력하세요"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameErr(''); }}
              error={nameErr || (name && !nameOk ? '이름을 2자 이상 입력해주세요.' : undefined)}
            />
            <Input label="생년월일 (필수)" inputMode="numeric" maxLength={8} placeholder="YYYYMMDD · 예: 19950413" value={birth} onChange={(e) => setBirth(e.target.value.replace(/\D/g, '').slice(0, 8))} error={birth && !birthOk ? '생년월일 8자리를 확인해주세요.' : undefined} hint={birthOk ? undefined : '숫자 8자리로 입력해주세요.'} />
            <Input label="비밀번호" type="password" placeholder={Auth.passwordHint()} value={pw} onChange={(e) => { setPw(e.target.value); setPwErr(''); }} error={pw && !pwCheck.ok ? pwCheck.error : (pwErr || undefined)} hint={Auth.passwordHint()} />
            <Input label="비밀번호 확인" type="password" placeholder="한 번 더 입력" value={pw2} onChange={(e) => setPw2(e.target.value)} error={pw2 && pw !== pw2 ? '비밀번호가 서로 달라요.' : undefined} />
            <Button variant="primary" size="lg" fullWidth disabled={!(pwOk && nameOk && birthOk)} onClick={goInfoNext}>다음</Button>
          </div>
        ) : null}

        {uiStep === 3 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Checkbox checked={t1 && t2 && t3} onChange={(on) => { setT1(on); setT2(on); setT3(on); }} label={<b style={{ fontWeight: 600 }}>전체 동의</b>} />
            <hr className="fo-hr" />
            <F.LegalTermRow checked={t1} onChange={setT1} kind="terms" label="(필수) 이용약관 동의" onView={() => setDoc('terms')} />
            <F.LegalTermRow checked={t2} onChange={setT2} kind="privacy" label="(필수) 개인정보 수집 · 이용 동의" onView={() => setDoc('privacy')} />
            <F.LegalTermRow checked={t3} onChange={setT3} kind="marketing" label="(선택) 신보 소식 · 혜택 알림 수신 동의" onView={() => setDoc('marketing')} />
            <Button variant="primary" size="lg" fullWidth disabled={!(t1 && t2) || busy === 'finish'} onClick={finish}>{busy === 'finish' ? '가입 중…' : '가입 완료'}</Button>
          </div>
        ) : null}

        <p className="fo-caption" style={{ textAlign: 'center', marginTop: 22 }}>이미 계정이 있나요? <a href={F.PAGES.login} style={{ fontWeight: 500 }}>로그인</a></p>
      </div>

      <F.Dialog open={!!doc} onClose={() => setDoc(null)} title={docTitle} wide>
        {doc ? <F.LegalDocBody kind={doc} /> : null}
      </F.Dialog>
    </F.Scaffold>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<SignupPage />);
});
