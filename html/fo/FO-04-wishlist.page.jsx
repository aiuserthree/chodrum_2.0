/* FO-04 찜 목록 — 장바구니 담기 · 찜 해제 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, IconButton, Icon } = DS;
const F = window.FO;

function WishlistPage() {
  F.useStoreTick();
  const user = Store.user.get();
  const items = Store.fav.list().map((id) => F.resolveSheet(id)).filter(Boolean);
  const [cartAsk, setCartAsk] = React.useState(false);
  const [cartMsg, setCartMsg] = React.useState('장바구니에 담았어요');

  const addOne = (id) => {
    const ok = Store.cart.add(id, 1);
    setCartMsg(ok ? '장바구니에 담았어요' : '이미 장바구니에 있어요');
    setCartAsk(true);
  };
  const addAll = () => {
    if (!items.length) return;
    let n = 0;
    items.forEach((s) => { if (Store.cart.add(s.id, 1)) n++; });
    setCartMsg(n ? '찜한 악보 ' + n + '개를 장바구니에 담았어요' : '이미 장바구니에 있어요');
    setCartAsk(true);
  };

  return (
    <F.Scaffold title="찜 목록" back={F.PAGES.my}>
      <F.MyPageLayout active="wish" label="FO-04 찜 목록">
        {items.length ? (
          <React.Fragment>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0 6px' }}>
              <span className="ds-mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>찜한 악보 {items.length}개</span>
              <Button variant="secondary" size="sm" iconLeft="shopping-cart" onClick={addAll}>전체 담기</Button>
            </div>
            <div>
              {items.map((s, i) => (
                <div key={s.id} style={{ borderTop: i ? '1px solid var(--border-default)' : 'none', opacity: s.missing ? 0.7 : 1 }}>
                  <F.SheetRow s={s}
                    sub={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.artist} · {s.level}</span><F.Money value={s.price} size={14} /></div>}
                    right={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                        <IconButton name="x" variant="ghost" size="sm" label="찜 해제" onClick={() => { Store.fav.toggle(s.id); F.toast('찜을 해제했어요'); }} />
                        {!s.missing ? <Button variant="secondary" size="sm" iconLeft="shopping-cart" onClick={() => addOne(s.id)}>담기</Button> : null}
                      </div>
                    } />
                </div>
              ))}
            </div>
            <p className="fo-caption" style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 16 }}>
              <Icon name="info" size={13} style={{ color: 'var(--color-icon)' }} />
              {user ? '찜 목록은 계정에 저장되어 어디서나 동일하게 보여요.' : '로그인하지 않으면 찜 목록은 이 브라우저에만 임시 저장돼요.'}
            </p>
          </React.Fragment>
        ) : (
          <F.Empty icon="heart" title="찜한 악보가 없어요" sub="악보 카드의 하트를 눌러 관심 악보를 저장해보세요." action="악보 둘러보기" href={F.PAGES.list} />
        )}
      </F.MyPageLayout>
      <F.CartAddedDialog open={cartAsk} onClose={() => setCartAsk(false)} message={cartMsg} />
    </F.Scaffold>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<WishlistPage />);
});
