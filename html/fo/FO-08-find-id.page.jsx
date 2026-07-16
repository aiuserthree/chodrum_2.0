/* FO-08 아이디 찾기 — 이름 + 생년월일 일치 시 마스킹된 이메일(ID) 안내 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Input, Icon, Card, Badge } = DS;
const F = window.FO;

/* 로컬 회원 시드 없음 — Store.user(가입/로그인)만 조회 */
const SAMPLE_MEMBERS = [];
const PROVIDER_LABEL = { email: '이메일', kakao: '카카오', naver: '네이버', google: '구글' };

/* 이메일 마스킹: 앞 2자만 남기고 * 처리 (도메인은 유지) */
function maskEmail(email) {
  const [local, domain] = email.split('@');
  const head = local.slice(0, 2);
  const stars = '*'.repeat(Math.max(2, local.length - 2));
  return head + stars + '@' + domain;
}

function FindIdPage() {
  const [name, setName] = React.useState('');
  const [birth, setBirth] = React.useState('');
  const [result, setResult] = React.useState(null); /* null | 'none' | member */
  const birthOk = /^\d{8}$/.test(birth);
  const canSubmit = name.trim().length >= 2 && birthOk;

  const search = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const db = [...SAMPLE_MEMBERS];
    const u = Store.user.get();
    if (u && u.birth) db.push(u);
    const hit = db.find((m) => m.name === name.trim() && m.birth === birth);
    setResult(hit || 'none');
  };
  const reset = () => { setResult(null); setName(''); setBirth(''); };

  return (
    <F.Scaffold title="아이디 찾기" back={F.PAGES.login} footer={false}>
      <div data-screen-label="FO-08 아이디 찾기" className="fo-container narrow" style={{ padding: '0 0 40px' }}>
        <div style={{ padding: '36px 0 20px' }}>
          <h3 style={{ fontSize: 22, letterSpacing: '-0.6px' }}>아이디를 잊으셨나요?</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.55 }}>가입 시 입력한 이름과 생년월일이 일치하면 아이디(이메일)를 알려드려요.</p>
        </div>

        {result === null ? (
          <form onSubmit={search} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="이름" placeholder="가입 시 입력한 이름" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="생년월일" inputMode="numeric" maxLength={8} placeholder="YYYYMMDD · 예: 19950413" value={birth} onChange={(e) => setBirth(e.target.value.replace(/\D/g, '').slice(0, 8))} error={birth && !birthOk ? '생년월일 8자리를 확인해주세요.' : undefined} />
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={!canSubmit}>아이디 찾기</Button>
          </form>
        ) : null}

        {result && result !== 'none' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="check" size={14} style={{ color: 'var(--status-success)' }} />
              <span style={{ fontSize: 13.5 }}>회원 정보가 확인되었어요.</span>
            </div>
            <Card padding={20} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{result.name} 님의 아이디</span>
              <span className="ds-mono" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px', wordBreak: 'break-all' }}>{maskEmail(result.email)}</span>
              <Badge variant={result.provider === 'email' ? 'neutral' : 'outline'} size="sm">{PROVIDER_LABEL[result.provider] || '이메일'} 가입</Badge>
              <p className="fo-caption">개인정보 보호를 위해 일부를 가려서 보여드려요.</p>
            </Card>
            <Button variant="primary" size="lg" fullWidth onClick={() => location.href = F.PAGES.login}>로그인하러 가기</Button>
            {result.provider === 'email'
              ? <Button variant="secondary" size="lg" fullWidth onClick={() => location.href = F.PAGES.reset}>비밀번호 찾기</Button>
              : <p className="fo-caption" style={{ textAlign: 'center' }}>{PROVIDER_LABEL[result.provider]} 간편가입 회원이에요. 비밀번호 없이 {PROVIDER_LABEL[result.provider]} 로그인으로 이용해주세요.</p>}
            <Button variant="ghost" size="md" fullWidth onClick={reset}>다시 찾기</Button>
          </div>
        ) : null}

        {result === 'none' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <F.Empty icon="user" title="일치하는 회원 정보가 없어요" sub="이름과 생년월일을 다시 확인해주세요. 입력한 정보가 가입 정보와 정확히 일치해야 해요." />
            <Button variant="primary" size="lg" fullWidth onClick={reset}>다시 입력하기</Button>
            <Button variant="secondary" size="lg" fullWidth onClick={() => location.href = F.PAGES.signup}>회원가입</Button>
          </div>
        ) : null}

        <div style={{ marginTop: 24, padding: '12px 14px', background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: 8 }}>
          <Icon name="info" size={14} style={{ color: 'var(--color-icon)', marginTop: 1, flex: 'none' }} />
          <span className="fo-caption">비회원으로 구매하셨다면 아이디가 없어요. <a href={F.PAGES.guest} style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>비회원 주문 조회</a>에서 주문 이메일로 확인해주세요.</span>
        </div>
      </div>
    </F.Scaffold>
  );
}
ReactDOM.createRoot(document.getElementById('app')).render(<FindIdPage />);
