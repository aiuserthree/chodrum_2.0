/* FO-05 장바구니 — 결제의 필수 관문 · 선택/전체 결제 · 비로그인 시 구매 방식 선택 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, IconButton, Icon, Checkbox, Card } = DS;
const F = window.FO;

function CartPage() {
  F.useStoreTick();
  const cart = Store.cart.list();
  const [sel, setSel] = React.useState(cart.map((c) => c.id));
  const [ask, setAsk] = React.useState(false); /* 비로그인 → 로그인/비회원 선택 (S-02) */
  React.useEffect(() => { setSel((p) => p.filter((id) => cart.some((c) => c.id === id))); }, [cart.length]);

  /* hydrate 이후 resolveSheet 로 제목·썸네일·가격 매핑 (미존재 시 폴백) */
  const items = cart.map((c) => F.resolveSheet(c.id, { qty: c.qty }));
  const selItems = items.filter((it) => sel.includes(it.id));
  const total = selItems.reduce((n, it) => n + (Number(it.price) || 0) * (it.qty || 1), 0);
  const allOn = sel.length === cart.length && cart.length > 0;

  const goCheckout = () => {
    alert('준비중');
  };

  if (!cart.length) {
    return (
      <F.Scaffold tab="cart" title="장바구니">
        <div data-screen-label="FO-05 장바구니 (비어있음)">
          <F.Empty icon="shopping-cart" title="담긴 악보가 없습니다" sub="마음에 드는 악보를 담아보세요. 모든 결제는 장바구니에서 시작돼요." action="악보 둘러보기" href={F.PAGES.list} />
        </div>
      </F.Scaffold>
    );
  }

  const summary = (
    <Card padding={16} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <F.KV k="선택 상품" v={<span className="ds-mono" style={{ fontSize: 13 }}>{selItems.length}건</span>} />
      <F.KV k="총 상품금액" v={<F.Money value={total} size={14} weight={500} />} />
      <F.KV k="수수료" v={<span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>무료</span>} />
      <hr className="fo-hr" style={{ margin: '4px 0' }} />
      <F.KV k={<span style={{ fontWeight: 600 }}>총 결제금액</span>} v={<F.Money value={total} size={20} />} />
      <div className="fo-desktop" style={{ marginTop: 8 }}>
        <Button variant="primary" size="lg" fullWidth disabled={!selItems.length} onClick={goCheckout}>{selItems.length ? F.won(total) + ' 결제하기' : '상품을 선택하세요'}</Button>
      </div>
      <p className="fo-caption fo-desktop">결제는 장바구니를 통해서만 진행돼요.</p>
    </Card>
  );

  return (
    <F.Scaffold tab="cart" title="장바구니"
      cta={<Button variant="primary" size="lg" fullWidth disabled={!selItems.length} onClick={goCheckout}>{selItems.length ? F.won(total) + ' 결제하기' : '상품을 선택하세요'}</Button>}>
      <div data-screen-label="FO-05 장바구니" className="fo-two" style={{ paddingTop: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
            <Checkbox checked={allOn} indeterminate={sel.length > 0 && !allOn} label={'전체 선택 (' + sel.length + '/' + cart.length + ')'} onChange={(on) => setSel(on ? cart.map((c) => c.id) : [])} />
            <Button variant="ghost" size="sm" disabled={!sel.length} onClick={() => { Store.cart.remove(sel); F.toast('선택한 악보를 삭제했어요'); }}>선택삭제</Button>
          </div>
          <div>
            {items.map((it, i) => {
              const cover = F.sheetCoverUrl(it);
              return (
                <div key={it.id} style={{ display: 'flex', gap: 10, padding: '16px 0', borderTop: i ? '1px solid var(--border-default)' : 'none', alignItems: 'flex-start', opacity: it.missing ? 0.7 : 1 }}>
                  <div style={{ paddingTop: 22 }}><Checkbox checked={sel.includes(it.id)} onChange={(on) => setSel(on ? [...sel, it.id] : sel.filter((x) => x !== it.id))} /></div>
                  <a href={it.missing ? undefined : F.sheetUrl(it)} style={{ width: 56, flex: 'none', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)', pointerEvents: it.missing ? 'none' : undefined }}>
                    <F.StaffThumb ratio="1 / 1" size={18} src={cover || undefined} alt={it.title} watermark={cover ? 'light' : false} />
                  </a>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      {it.missing
                        ? <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.3px', color: 'var(--text-secondary)' }}>{it.title}</span>
                        : <a href={F.sheetUrl(it)} style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.3px' }}>{it.title}</a>}
                      <IconButton name="x" variant="ghost" size="sm" label="삭제" onClick={() => { Store.cart.remove(it.id); F.toast('장바구니에서 삭제했어요'); }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{it.artist} · {it.level} · PDF</span>
                    <div style={{ marginTop: 2 }}>
                      <F.Money value={(Number(it.price) || 0) * (it.qty || 1)} size={15} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="fo-side-sticky">{summary}</div>
      </div>

      {/* 비로그인 결제 분기 — 로그인 / 비회원 구매 / 회원가입 */}
      <F.Dialog open={ask} onClose={() => setAsk(false)} title="어떻게 결제할까요?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="primary" size="lg" fullWidth onClick={() => location.href = F.PAGES.login}>로그인 후 결제</Button>
          <Button variant="secondary" size="lg" fullWidth onClick={() => location.href = F.PAGES.checkout + '?sel=' + sel.join(',') + '&as=guest'}>비회원으로 결제</Button>
          <Button variant="ghost" size="md" fullWidth onClick={() => location.href = F.PAGES.signup}>3초 회원가입</Button>
          <p className="fo-caption" style={{ textAlign: 'center' }}>회원은 구매 내역이 계정에 저장되고, 비회원은 주문 시 입력한 이메일로만 다운로드를 조회할 수 있어요.</p>
        </div>
      </F.Dialog>
    </F.Scaffold>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<CartPage />);
});
