/* FO-07 결제 완료 — 주문번호/내역 · 회원=마이페이지 안내 · 비회원=이메일 조회 안내 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Icon, Card } = DS;
const F = window.FO;
const MISSING = (F && F.MISSING_SHEET_TITLE) || '삭제되었거나 찾을 수 없는 악보';

function itemSheetId(it) {
  if (!it || typeof it !== 'object') return '';
  if (it.id != null && it.id !== '') return it.id;
  if (it.sheetId != null && it.sheetId !== '') return it.sheetId;
  return '';
}

function itemDisplayTitle(it) {
  const snap = (it && (it.title || it.name)) || '';
  if (snap && snap !== MISSING) return snap;
  const id = itemSheetId(it);
  let resolved = null;
  try {
    if (F && typeof F.resolveSheet === 'function') {
      resolved = F.resolveSheet(id, { title: snap || '악보' });
    }
  } catch (e) { resolved = null; }
  if (F && typeof F.lineTitle === 'function') return F.lineTitle(it || {}, resolved);
  const t = resolved && resolved.title;
  if (t && t !== MISSING) return t;
  return snap || '악보';
}

function CompletePage() {
  F.useStoreTick();
  const [, setReadyTick] = React.useState(0);
  React.useEffect(() => {
    const bump = () => setReadyTick((n) => n + 1);
    window.addEventListener('chodrum:ready', bump);
    if (window.ChodrumAPI && ChodrumAPI.readyState && ChodrumAPI.readyState.ready) bump();
    return () => window.removeEventListener('chodrum:ready', bump);
  }, []);

  const order = Store.lastOrder.get();
  const user = Store.user.get();
  /* 실제 결제 유형 + 로그인 상태 (미리보기 토글 없음) */
  const guest = order ? (!!order.guest || !user) : !user;

  if (!order) {
    return (
      <F.Scaffold title="결제 완료" back={F.PAGES.home}>
        <div data-screen-label="FO-07 결제 완료 (없음)" className="fo-container narrow" style={{ padding: 0 }}>
          <F.Empty icon="receipt" title="표시할 주문이 없어요" sub="결제를 완료하면 주문 내역이 여기에 표시돼요." action="홈으로" href={F.PAGES.home} />
        </div>
      </F.Scaffold>
    );
  }

  const goDownload = () => {
    if (guest) {
      const email = order.email || '';
      location.href = F.PAGES.guest + (email ? '?email=' + encodeURIComponent(email) : '');
      return;
    }
    location.href = F.PAGES.downloads;
  };

  const lines = Array.isArray(order.items) ? order.items.filter(Boolean) : [];

  return (
    <F.Scaffold title="결제 완료" back={F.PAGES.home}>
      <div data-screen-label="FO-07 결제 완료" className="fo-container narrow" style={{ padding: 0 }}>
        <div style={{ padding: '44px 0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <span style={{ width: 60, height: 60, borderRadius: 9999, background: 'var(--status-success-bg)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={30} /></span>
          <h3 style={{ fontSize: 22, letterSpacing: '-0.6px' }}>결제가 완료되었어요</h3>
          <span className="ds-mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.no}</span>
        </div>

        <Card padding={18} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lines.map((it, i) => {
            const id = itemSheetId(it);
            const title = itemDisplayTitle(it);
            const price = (it && it.price != null) ? it.price : 0;
            return (
              <F.KV key={String(id) + '-' + i}
                k={<span style={{ color: 'var(--text-primary)' }}>{title}</span>}
                v={<F.Money value={price} size={14} weight={500} />} />
            );
          })}
          <hr className="fo-hr" style={{ margin: '2px 0' }} />
          <F.KV k="결제 수단" v={<span style={{ fontSize: 14, fontWeight: 500 }}>{order.method}</span>} />
          <F.KV k="결제 일시" v={<span className="ds-mono" style={{ fontSize: 13 }}>{order.date}</span>} />
          <F.KV k={<span style={{ fontWeight: 600 }}>총 결제금액</span>} v={<F.Money value={order.total} size={18} />} />
        </Card>

        <div style={{ margin: '16px 0', padding: '14px 16px', background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-cards)' }}>
          {guest ? (
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              비회원 주문이 완료되었어요. <b style={{ color: 'var(--text-primary)' }} className="ds-mono">{order.email}</b> 주소로만 다운로드를 조회할 수 있으니 이메일을 꼭 기억해주세요. 결제일로부터 <b style={{ color: 'var(--text-primary)' }}>7일간</b> 다운로드할 수 있어요.
            </p>
          ) : (
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              구매한 악보는 <b style={{ color: 'var(--text-primary)' }}>마이페이지 &gt; 구매 내역 / 다운로드</b>에 저장되었어요. 결제일로부터 <b style={{ color: 'var(--text-primary)' }}>7일간</b> PDF를 다운로드할 수 있어요.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12 }}>
          {guest
            ? <Button variant="primary" size="lg" fullWidth iconLeft="download" onClick={goDownload}>비회원 주문 조회하기</Button>
            : <Button variant="primary" size="lg" fullWidth iconLeft="download" onClick={goDownload}>다운로드 하러 가기</Button>}
          <Button variant="secondary" size="lg" fullWidth onClick={() => location.href = F.PAGES.home}>홈으로</Button>
        </div>
      </div>
    </F.Scaffold>
  );
}
ReactDOM.createRoot(document.getElementById('app')).render(<CompletePage />);
