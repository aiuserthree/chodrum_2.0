/* FO-09-04 회원 탈퇴 — 실제 로그인 회원 유형(일반/소셜)에 따라 본인 확인 UI 분기 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Input, Icon, Card, Checkbox, SocialButton } = DS;
const F = window.FO;

function WithdrawPage() {
  F.useStoreTick();
  const user = Store.user.get();
  const social = F.isSocialUser(user);
  const provider = (user && user.provider && user.provider !== 'email') ? user.provider : 'kakao';
  const [agree, setAgree] = React.useState(false);
  const [pw, setPw] = React.useState('');
  const [reauthed, setReauthed] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const canWithdraw = agree && (social ? reauthed : pw.length > 0);

  const withdraw = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (user && user.email && window.ChodrumAPI && ChodrumAPI.members) {
        await ChodrumAPI.members.updateStatus(user.email, '탈퇴');
      }
      if (window.ChodrumAuth) await window.ChodrumAuth.signOut();
      else Store.user.clear();
      setDone(true);
    } catch (e) {
      F.toast((e && e.message) || '탈퇴 처리에 실패했어요');
      setBusy(false);
    }
  };

  if (done) {
    return (
      <F.Scaffold title="회원 탈퇴" footer={false}>
        <div data-screen-label="FO-09-04 탈퇴 완료" className="fo-container narrow" style={{ padding: 0 }}>
          <div style={{ padding: '56px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
            <span style={{ width: 56, height: 56, borderRadius: 9999, background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', color: 'var(--color-icon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={26} /></span>
            <h3 style={{ fontSize: 21, letterSpacing: '-0.5px' }}>탈퇴가 완료되었어요</h3>
            <p className="fo-caption" style={{ maxWidth: 300 }}>그동안 이용해주셔서 감사해요. 계정 정보와 구매 내역은 관련 법령에 따라 일정 기간 보관 후 파기돼요.</p>
          </div>
          <Button variant="primary" size="lg" fullWidth onClick={() => location.href = F.PAGES.home}>홈으로</Button>
        </div>
      </F.Scaffold>
    );
  }

  if (!user) {
    return (
      <F.Scaffold title="회원 탈퇴" back={F.PAGES.my}>
        <div data-screen-label="FO-09-04 회원 탈퇴 (비로그인)" className="fo-container narrow" style={{ padding: '0 0 32px' }}>
          <F.Empty icon="user" title="로그인이 필요해요" sub="회원 탈퇴는 로그인 후 이용할 수 있어요." action="로그인 / 회원가입" href={F.PAGES.login} />
        </div>
      </F.Scaffold>
    );
  }

  return (
    <F.Scaffold title="회원 탈퇴" back={F.PAGES.edit}>
      <div data-screen-label="FO-09-04 회원 탈퇴" className="fo-container narrow" style={{ padding: '0 0 32px' }}>
        <div style={{ padding: '28px 0 16px' }}>
          <h3 style={{ fontSize: 21, letterSpacing: '-0.5px' }}>정말 탈퇴하시겠어요?</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.55 }}>탈퇴 전에 아래 내용을 꼭 확인해주세요.</p>
        </div>

        <Card padding={16} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['남아있는 다운로드 기간(7일)이 있어도 탈퇴 시 다운로드 권한이 함께 사라져요.', 'download'],
            ['구매 내역과 찜 목록이 삭제되며 복구할 수 없어요.', 'receipt'],
            ['같은 이메일로 재가입해도 이전 구매 내역은 연결되지 않아요.', 'user'],
          ].map(([t, ic]) => (
            <div key={ic} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon name={ic} size={15} style={{ color: 'var(--status-danger)', marginTop: 2, flex: 'none' }} />
              <span style={{ fontSize: 13.5, lineHeight: 1.55 }}>{t}</span>
            </div>
          ))}
        </Card>

        <F.Section label="본인 확인">
          {social ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p className="fo-caption">소셜 회원은 비밀번호가 없어 플랫폼 재인증으로 본인을 확인해요.</p>
              {reauthed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--status-success-bg)', borderRadius: 'var(--radius-lg)' }}>
                  <Icon name="check" size={14} style={{ color: 'var(--status-success)' }} />
                  <span style={{ fontSize: 13 }}>재인증이 완료되었어요.</span>
                </div>
              ) : (
                <SocialButton provider={provider} onClick={() => { setReauthed(true); F.toast('소셜 재인증이 완료되었어요'); }} />
              )}
            </div>
          ) : (
            <Input label="비밀번호 확인" type="password" placeholder="현재 비밀번호 입력" value={pw} onChange={(e) => setPw(e.target.value)} hint="본인 확인을 위해 비밀번호를 입력해주세요." />
          )}
        </F.Section>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Checkbox checked={agree} onChange={setAgree} label="위 내용을 모두 확인했고, 탈퇴에 동의해요." />
          <Button variant="primary" size="lg" fullWidth disabled={!canWithdraw || busy} onClick={withdraw}>{busy ? '처리 중…' : '탈퇴하기'}</Button>
          <Button variant="secondary" size="lg" fullWidth onClick={() => location.href = F.PAGES.my}>계속 이용하기</Button>
        </div>
      </div>
    </F.Scaffold>
  );
}
ReactDOM.createRoot(document.getElementById('app')).render(<WithdrawPage />);
