/* FO-09-03 내 정보 수정 — 일반: 기본정보+비밀번호 / 소셜: 비밀번호 메뉴 미노출 (실제 로그인 계정 기준) */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Input, Icon, Card, Badge } = DS;
const F = window.FO;
const Auth = window.ChodrumAuth;

const PROVIDER_LABEL = { kakao: '카카오', naver: '네이버', google: '구글' };

function EditPage() {
  F.useStoreTick();
  const user = Store.user.get();
  const social = F.isSocialUser(user);
  const provider = (user && user.provider) || 'email';
  const providerLabel = PROVIDER_LABEL[provider] || '소셜';

  const [name, setName] = React.useState(user ? (user.name || '') : '');
  const [birth, setBirth] = React.useState(user && user.birth ? user.birth : '');
  const [pw0, setPw0] = React.useState('');
  const [pw1, setPw1] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const syncedKey = React.useRef('');

  React.useEffect(() => {
    if (!user) return;
    const key = [user.email || '', user.name || '', user.birth || '', user.provider || ''].join('|');
    if (syncedKey.current === key) return;
    syncedKey.current = key;
    setName(user.name || '');
    setBirth(user.birth || '');
  }, [user]);

  if (!user) {
    return (
      <F.Scaffold title="내 정보 수정" back={F.PAGES.my}>
        <F.MyPageLayout active="edit" label="FO-09-03 내 정보 수정 (비로그인)">
          <F.Empty icon="user" title="로그인이 필요해요" sub="내 정보 수정은 로그인 후 이용할 수 있어요." action="로그인 / 회원가입" href={F.PAGES.login} />
        </F.MyPageLayout>
      </F.Scaffold>
    );
  }

  const [saving, setSaving] = React.useState(false);
  const saveProfile = async () => {
    const nameTrim = name.trim();
    if (!nameTrim) { F.toast('이름을 입력해주세요.'); return; }
    if (birth && !/^\d{8}$/.test(birth)) { F.toast('생년월일 8자리를 확인해주세요.'); return; }
    setSaving(true);
    try {
      const r = await Auth.updateBasicProfile({ name: nameTrim, birth: birth || '' });
      if (!r.ok) { F.toast(r.error || '저장에 실패했어요'); return; }
      F.toast('내 정보가 저장되었어요');
    } catch (e) {
      F.toast((e && e.message) || '저장에 실패했어요');
    } finally {
      setSaving(false);
    }
  };

  return (
    <F.Scaffold title="내 정보 수정" back={F.PAGES.my}>
      <F.MyPageLayout active="edit" label="FO-09-03 내 정보 수정">
        <div style={{ maxWidth: 480 }}>
          <F.Section label="기본 정보" first>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="이메일 (로그인 ID)" value={user.email || ''} disabled hint="로그인 ID는 변경할 수 없어요." />
              <Input label="생년월일" inputMode="numeric" maxLength={8} placeholder="YYYYMMDD" value={birth} onChange={(e) => setBirth(e.target.value.replace(/\D/g, '').slice(0, 8))} error={birth && !/^\d{8}$/.test(birth) ? '생년월일 8자리를 확인해주세요.' : undefined} />
            </div>
          </F.Section>

          {social ? (
            /* 소셜 회원 — 비밀번호 변경 메뉴 미노출 (원천 차단) */
            <F.Section label="로그인 방식">
              <Card padding={16} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Icon name="lock" size={16} style={{ color: 'var(--color-icon)', marginTop: 2, flex: 'none' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{providerLabel} 계정으로 로그인 중</span>
                    <Badge variant="outline" size="sm">소셜 회원</Badge>
                  </div>
                  <p className="fo-caption" style={{ marginTop: 6 }}>소셜 회원은 비밀번호가 없어 비밀번호 변경 메뉴가 표시되지 않아요. 로그인은 항상 {providerLabel} 인증으로 진행돼요.</p>
                </div>
              </Card>
            </F.Section>
          ) : (
            <F.Section label="비밀번호 변경">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input label="현재 비밀번호" type="password" placeholder="••••••••" value={pw0} onChange={(e) => setPw0(e.target.value)} />
                <Input label="새 비밀번호" type="password" placeholder={Auth.passwordHint()} value={pw1} onChange={(e) => setPw1(e.target.value)} error={pw1 && !Auth.validatePassword(pw1).ok ? Auth.validatePassword(pw1).error : undefined} hint={Auth.passwordHint()} />
                <Input label="새 비밀번호 확인" type="password" placeholder="한 번 더 입력" value={pw2} onChange={(e) => setPw2(e.target.value)} error={pw2 && pw1 !== pw2 ? '비밀번호가 서로 달라요.' : undefined} />
                <div><Button variant="secondary" size="md" disabled={!(pw0 && Auth.validatePassword(pw1).ok && pw1 === pw2)} onClick={async () => {
                  const r = await Auth.changePassword(pw0, pw1);
                  if (!r.ok) { F.toast(r.error || '변경 실패'); return; }
                  setPw0(''); setPw1(''); setPw2('');
                  F.toast('비밀번호가 변경되었어요');
                }}>비밀번호 변경</Button></div>
              </div>
            </F.Section>
          )}

          <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
            <Button variant="primary" size="lg" fullWidth disabled={saving} onClick={saveProfile}>{saving ? '저장 중…' : '저장하기'}</Button>
          </div>
          <p className="fo-caption" style={{ marginTop: 16, textAlign: 'center' }}>계정을 삭제하려면 <a href={F.PAGES.withdraw} style={{ color: 'var(--text-secondary)', textDecoration: 'underline', textUnderlineOffset: 2 }}>회원 탈퇴</a>로 이동하세요.</p>
        </div>
      </F.MyPageLayout>
    </F.Scaffold>
  );
}
ReactDOM.createRoot(document.getElementById('app')).render(<EditPage />);
