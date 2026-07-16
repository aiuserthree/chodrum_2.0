/* FO 공용 크롬 — 헤더 · 탭바 · 카드 · 배지 · 다이얼로그 (window.FO 로 노출) */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, IconButton, Card, Badge, Icon, Input, Checkbox } = DS;
const DATA = window.DrumData;

/* Pretty URLs (vercel.json rewrites). authCallback은 카카오/Supabase Redirect URI와 동일하게 유지. */
const PAGES = {
  home: '/home',
  list: '/sheets',
  detail: '/sheet',
  wish: '/wishlist',
  cart: '/cart',
  checkout: '/checkout',
  complete: '/order-complete',
  paymentSuccess: '/payment/success',
  paymentFail: '/payment/fail',
  login: '/login',
  signup: '/signup',
  authCallback: '/fo/FO-08-auth-callback.html',
  oauthTerms: '/oauth-terms',
  reset: '/password-reset',
  my: '/mypage',
  downloads: '/mypage/downloads',
  edit: '/mypage/edit',
  withdraw: '/mypage/withdraw',
  guest: '/guest-lookup',
  terms: '/terms',
  privacy: '/privacy',
  marketing: '/marketing',
  guide: '/guide',
  findId: '/find-id',
};

const won = (v) => '₩' + Number(v).toLocaleString('ko-KR');
const qp = (name) => new URLSearchParams(location.search).get(name);
const goBack = (fallback) => { if (history.length > 1 && document.referrer) history.back(); else location.href = fallback || PAGES.home; };

function toast(msg, ms) {
  let el = document.getElementById('fo-toast');
  if (!el) { el = document.createElement('div'); el.id = 'fo-toast'; el.className = 'fo-toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms || 2000);
}

/* store:change 구독 → 리렌더 */
function useStoreTick() {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const f = () => force((n) => n + 1);
    window.addEventListener('store:change', f);
    return () => window.removeEventListener('store:change', f);
  }, []);
}

/** 회원 구매내역 — live면 identity-scoped Supabase orders, 아니면 identity-filtered localStorage */
async function loadPurchases(emailOrUser, opts) {
  const empty = [];
  let email = '';
  let authUserId = null;
  let provider = null;
  let fromOAuth = false;
  let type = null;
  if (emailOrUser && typeof emailOrUser === 'object') {
    email = emailOrUser.email || '';
    authUserId = emailOrUser.authId || emailOrUser.auth_user_id || null;
    provider = emailOrUser.provider || emailOrUser.auth_provider || null;
    fromOAuth = emailOrUser.fromOAuth === true;
    type = emailOrUser.type || null;
  } else {
    email = emailOrUser || '';
    opts = opts || {};
    authUserId = opts.authUserId || opts.auth_user_id || null;
    provider = opts.provider || opts.auth_provider || null;
    fromOAuth = opts.fromOAuth === true;
    type = opts.type || null;
  }
  const isSocial =
    fromOAuth ||
    type === 'social' ||
    (!!provider && provider !== 'email' && provider !== 'email_password');
  /* Social must never default provider to email — that reopens cross-account leak */
  if (isSocial && (!provider || provider === 'email')) {
    console.warn('[CHODRUM] loadPurchases: social user missing provider');
    if (Store.purchases && typeof Store.purchases.replace === 'function') Store.purchases.replace([]);
    return empty;
  }
  if (!email && !authUserId) return empty;
  try {
    if (window.ChodrumAPI && ChodrumAPI.ready) await ChodrumAPI.ready;
  } catch (e) { /* ignore */ }
  if (window.ChodrumAPI && ChodrumAPI.orders && typeof ChodrumAPI.orders.purchasesForEmail === 'function') {
    try {
      const list = await ChodrumAPI.orders.purchasesForEmail(email, {
        authUserId,
        provider: isSocial ? provider : (provider || 'email'),
        fromOAuth,
        type: type || (isSocial ? 'social' : 'email'),
      });
      if (Array.isArray(list) && Store.purchases && typeof Store.purchases.replace === 'function') {
        Store.purchases.replace(list.map((p) => ({
          id: p.id || p.sheetId,
          sheetId: p.sheetId || p.id,
          title: p.title || '',
          orderNo: p.orderNo,
          paidAt: p.paidAt || Date.now(),
          authUserId: authUserId || null,
          provider: isSocial ? provider : (provider || 'email'),
        })));
      }
      return Array.isArray(list) ? list : empty;
    } catch (e) {
      console.warn('[CHODRUM] loadPurchases', e);
      /* Do not fall back to another account's cached purchases */
      if (isSocial) {
        if (Store.purchases && typeof Store.purchases.replace === 'function') Store.purchases.replace([]);
        return empty;
      }
    }
  }
  const raw = Store.purchases.list();
  if (!Array.isArray(raw)) return empty;
  const day = 86400000;
  return raw.filter((p) => {
    if (!p || typeof p !== 'object') return false;
    const pUid = p.authUserId || p.auth_user_id || null;
    const pProv = p.provider || p.auth_provider || null;
    if (isSocial) {
      if (authUserId && pUid && pUid !== authUserId) return false;
      if (!pProv || pProv !== provider) return false;
      return true;
    }
    if (pUid && authUserId && pUid !== authUserId) return false;
    if (pProv && pProv !== 'email') return false;
    /* Untagged cache rows: email login only */
    return true;
  }).map((p) => {
    const id = (p.sheetId != null && p.sheetId !== '') ? p.sheetId : p.id;
    const paidAt = Number(p.paidAt) || Date.now();
    return {
      id, sheetId: id, title: p.title || '', orderNo: p.orderNo, paidAt,
      date: new Date(paidAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, ''),
      dday: 7 - Math.floor((Date.now() - paidAt) / day),
    };
  }).filter((p) => p.id != null && p.id !== '');
}

function Money({ value, size = 16, weight = 600, color = 'var(--text-primary)', strike = false }) {
  return (
    <span className="ds-mono" style={{ fontSize: size, fontWeight: strike ? 400 : weight, color: strike ? 'var(--text-tertiary)' : color, textDecoration: strike ? 'line-through' : 'none' }}>{won(value)}</span>
  );
}

function Stars({ value, size = 12 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--color-ink)' }}>
      <Icon name="star" size={size} />
      <span className="ds-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{value.toFixed(1)}</span>
    </span>
  );
}

/** First preview image URL for list/home covers */
function sheetCoverUrl(s) {
  if (!s) return '';
  if (s.previewUrls && s.previewUrls.length && s.previewUrls[0]) return s.previewUrls[0];
  return s.previewUrl || '';
}

function StaffThumb({ ratio = '1 / 1', icon = 'music', size = 30, watermark = false, fill = false, src, alt = '', fit = 'cover', position = 'top center' }) {
  const wmStrong = watermark === 'strong' || watermark === true;
  const wmLight = watermark === 'light';
  const showWm = wmStrong || wmLight;
  /* Stamp bakes full + veil watermarks; CSS mirrors: light full mark + larger mark on veil */
  const fullOpacity = wmLight ? 0.035 : 0.05;
  const fullSize = wmLight ? 9 : 12;
  const veilOpacity = wmLight ? 0.065 : 0.09;
  const veilSize = wmLight ? 14 : 18;
  return (
    <div style={{ position: 'relative', width: '100%', height: fill ? '100%' : 'auto', aspectRatio: fill ? 'auto' : ratio, background: '#f6f6f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {src ? (
        <img src={src} alt={alt} style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: fit, objectPosition: position, background: '#fff' }} />
      ) : (
        <React.Fragment>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 15px, #e7e7e7 15px 16px)', backgroundPosition: '0 14px' }}></div>
          <Icon name={icon} size={size} style={{ color: '#cccccc', position: 'relative' }} />
        </React.Fragment>
      )}
      {showWm ? (
        <React.Fragment>
          {/* Full-image subtle watermark */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: fullSize, fontWeight: 500,
            letterSpacing: 1.5, color: 'rgba(0,0,0,' + fullOpacity + ')', whiteSpace: 'nowrap',
            userSelect: 'none',
          }}>
            <span style={{ transform: 'rotate(-18deg)' }}>CHODRUM PREVIEW</span>
          </div>
          {wmStrong ? (
            <div aria-hidden="true" style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: '78%', zIndex: 4, pointerEvents: 'none',
              background: 'linear-gradient(180deg, rgba(252,252,252,0) 0%, rgba(250,250,250,0.75) 14%, rgba(248,248,248,0.95) 40%, rgba(246,246,246,0.985) 100%)',
            }} />
          ) : null}
          {/* Larger mark on veil zone only (bottom ~78%) */}
          <div aria-hidden="true" style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: '78%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            fontFamily: 'var(--font-mono)', fontSize: veilSize, fontWeight: 600,
            letterSpacing: 2, color: 'rgba(0,0,0,' + veilOpacity + ')', whiteSpace: 'nowrap',
            pointerEvents: 'none', zIndex: 5, userSelect: 'none',
          }}>
            <span style={{ transform: 'rotate(-18deg)' }}>CHODRUM PREVIEW</span>
          </div>
        </React.Fragment>
      ) : null}
    </div>
  );
}

/* 다운로드 잔여기간 뱃지 — 7~4일 녹색 / 3~2일 주황 / 1일 이하 빨강 / 만료 회색 */
function DdayBadge({ dday }) {
  if (dday === null || dday === undefined) return <Badge variant="neutral" size="sm">회수됨</Badge>;
  if (dday < 0) return <Badge variant="neutral" size="sm">기간 만료</Badge>;
  const v = dday >= 4 ? 'success' : dday >= 2 ? 'warning' : 'danger';
  return <Badge variant={v} size="sm">D-{dday}</Badge>;
}

/* ---------------- 헤더 / 탭바 / 푸터 ---------------- */
function CartIcon() {
  useStoreTick();
  const n = Store.cart.count();
  return (
    <a href={PAGES.cart} style={{ position: 'relative', display: 'inline-flex' }} aria-label="장바구니">
      <IconButton name="shopping-cart" variant="ghost" label="장바구니" />
      {n ? <span className="ds-mono" style={{ position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 9999, background: 'var(--color-ink)', color: '#fff', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>{n}</span> : null}
    </a>
  );
}

async function foSignOut() {
  if (window.ChodrumAuth && typeof window.ChodrumAuth.signOut === 'function') {
    await window.ChodrumAuth.signOut();
    return;
  }
  if (window.ChodrumSB && window.ChodrumSB.client) {
    try { await window.ChodrumSB.client.auth.signOut(); } catch (e) { console.warn('[CHODRUM] signOut', e); }
  }
  if (window.Store && Store.user) Store.user.clear();
}

/* GNB 프로필 호버 드롭다운 (데스크톱) */
function UserMenu({ user }) {
  const [open, setOpen] = React.useState(false);
  const items = [
    ['구매내역 / 다운로드', 'download', PAGES.downloads],
    ['찜 목록', 'heart', PAGES.wish],
    ['내 정보 수정', 'user', PAGES.edit],
  ];
  const itemStyle = {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8,
    fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none',
    background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left',
    fontFamily: 'inherit', transition: 'background 100ms ease',
  };
  const hoverOn = (e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; };
  const hoverOff = (e) => { e.currentTarget.style.background = 'transparent'; };
  const logout = async (e) => {
    e.preventDefault();
    await foSignOut();
    toast('로그아웃되었어요');
    location.href = PAGES.home;
  };
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Button variant="ghost" size="sm" iconLeft="user" iconRight="chevron-down" onClick={() => location.href = PAGES.my}>{user.name}</Button>
      {open ? (
        <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: 6, zIndex: 60 }}>
          <div style={{ width: 208, background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 12, boxShadow: 'var(--shadow-xl)', padding: 6, display: 'flex', flexDirection: 'column' }}>
            {items.map(([l, ic, href]) => (
              <a key={l} href={href} style={itemStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                <Icon name={ic} size={16} style={{ color: 'var(--color-icon)' }} />{l}
              </a>
            ))}
            <div style={{ height: 1, background: 'var(--border-default)', margin: '4px 6px' }} />
            <button type="button" onClick={logout} style={{ ...itemStyle, color: 'var(--text-secondary)' }} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
              <Icon name="log-out" size={16} style={{ color: 'var(--color-icon)' }} />로그아웃
            </button>
          </div>
        </div>
      ) : null}
    </span>
  );
}

/* 모바일 드로어 — body 포털 (헤더 backdrop-filter가 fixed 자식을 가두는 버그 방지) */
function MobileNav({ open, onClose, tab, user }) {
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => { if (mq.matches) onClose(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, [onClose]);

  const logout = async () => {
    onClose();
    await foSignOut();
    toast('로그아웃되었어요');
    location.href = PAGES.home;
  };

  const links = [
    { href: PAGES.home, label: '홈', k: 'home' },
    { href: PAGES.list, label: '악보', k: 'list' },
    user
      ? { href: PAGES.my, label: '마이페이지', k: 'my' }
      : { href: PAGES.guest, label: '비회원 주문 조회' },
  ];

  const node = (
    <div className={'fo-mnav-root' + (open ? ' open' : '')} aria-hidden={!open}>
      <div className="fo-mnav-scrim" onClick={onClose} />
      <aside className="fo-mnav" role="dialog" aria-modal="true" aria-label="메뉴">
        <nav className="fo-mnav-links">
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              className={l.k && tab === l.k ? 'on' : ''}
              onClick={onClose}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="fo-mnav-auth">
          {user ? (
            <>
              <div className="fo-mnav-user">{user.name}님</div>
              <Button variant="secondary" size="lg" fullWidth onClick={logout}>로그아웃</Button>
            </>
          ) : (
            <>
              <Button variant="primary" size="lg" fullWidth onClick={() => { onClose(); location.href = PAGES.login; }}>로그인</Button>
              <Button variant="secondary" size="lg" fullWidth onClick={() => { onClose(); location.href = PAGES.signup; }}>회원가입</Button>
            </>
          )}
        </div>
      </aside>
    </div>
  );

  return ReactDOM.createPortal(node, document.body);
}

function Header({ tab, title, back }) {
  useStoreTick();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = React.useCallback(() => setMenuOpen(false), []);
  const user = Store.user.get();
  const isHome = tab === 'home';
  const pageTitle = title || ({ list: '악보', cart: '장바구니', my: '마이페이지' }[tab] || '');
  const search = (e) => { e.preventDefault(); const q = new FormData(e.target).get('q'); location.href = PAGES.list + (q ? '?q=' + encodeURIComponent(q) : ''); };
  return (
    <>
      <header className={'fo-header' + (menuOpen ? ' fo-header-menu-open' : '')}>
        <div className="fo-header-in">
          {!isHome ? (
            <span className="fo-mobile fo-header-back" style={{ display: 'inline-flex', alignItems: 'center', gap: 0, flex: 'none', zIndex: 1 }}>
              <IconButton name="chevron-left" variant="ghost" label="뒤로" onClick={() => goBack(back)} />
              <a href={PAGES.home} aria-label="홈"><IconButton name="house" variant="ghost" label="홈" /></a>
            </span>
          ) : null}
          <a href={PAGES.home} className={'fo-wordmark' + (isHome ? '' : ' fo-desktop')}>
            <img src="../shared/logo.png" alt="CHODRUM 로고" style={{ width: 32, height: 32, objectFit: 'contain', display: 'block', flex: 'none' }} />
            CHODRUM
          </a>
          {!isHome && pageTitle ? <span className="fo-header-title">{pageTitle}</span> : null}
          <nav className="fo-nav">
            <a href={PAGES.home} className={tab === 'home' ? 'on' : ''}>홈</a>
            <a href={PAGES.list} className={tab === 'list' ? 'on' : ''}>악보</a>
            {user
              ? <a href={PAGES.my} className={tab === 'my' ? 'on' : ''}>마이페이지</a>
              : <a href={PAGES.guest}>비회원 주문 조회</a>}
          </nav>
          <form className="fo-header-search" onSubmit={search}>
            <Input size="sm" name="q" iconLeft="search" placeholder="곡명, 아티스트 검색" />
          </form>
          <div className="fo-header-icons">
            <span className="fo-mobile" style={{ display: 'inline-flex' }}><a href={PAGES.list} aria-label="검색"><IconButton name="search" variant="ghost" label="검색" /></a></span>
            <span className="fo-desktop" style={{ display: 'inline-flex' }}>
              <a href={PAGES.wish} aria-label="찜 목록"><IconButton name="heart" variant="ghost" label="찜 목록" /></a>
            </span>
            <span className="fo-desktop" style={{ display: 'inline-flex' }}><CartIcon /></span>
            <span className="fo-desktop" style={{ display: 'inline-flex', marginLeft: 6 }}>
              {user
                ? <UserMenu user={user} />
                : <Button variant="secondary" size="sm" onClick={() => location.href = PAGES.login}>로그인</Button>}
            </span>
            <span className="fo-mobile fo-mnav-toggle" style={{ display: 'inline-flex' }}>
              <IconButton
                name={menuOpen ? 'x' : 'menu'}
                variant="ghost"
                label={menuOpen ? '메뉴 닫기' : '메뉴'}
                onClick={() => setMenuOpen((o) => !o)}
              />
            </span>
          </div>
        </div>
      </header>
      <MobileNav open={menuOpen} onClose={closeMenu} tab={tab} user={user} />
    </>
  );
}

function TabBar({ active }) {
  useStoreTick();
  const n = Store.cart.count();
  const [hidden, setHidden] = React.useState(false);
  const tabs = [
    { k: 'home', ic: 'house', l: '홈', href: PAGES.home },
    { k: 'list', ic: 'search', l: '악보', href: PAGES.list },
    { k: 'cart', ic: 'shopping-cart', l: '장바구니', href: PAGES.cart },
    { k: 'my', ic: 'user', l: '마이', href: PAGES.my },
  ];

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    let lastY = window.scrollY || 0;
    let isHidden = false;
    const THRESHOLD = 8;

    const apply = (next) => {
      if (isHidden === next) return;
      isHidden = next;
      setHidden(next);
      document.body.classList.toggle('tabbar-scrolled-away', next);
    };

    const onScroll = () => {
      if (!mq.matches) {
        apply(false);
        lastY = window.scrollY || 0;
        return;
      }
      const y = window.scrollY || 0;
      const delta = y - lastY;
      if (y <= 8) {
        apply(false);
      } else if (delta > THRESHOLD) {
        apply(true);
      } else if (delta < -THRESHOLD) {
        apply(false);
      }
      lastY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const onMq = () => onScroll();
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else mq.addListener(onMq);

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (mq.removeEventListener) mq.removeEventListener('change', onMq);
      else mq.removeListener(onMq);
      document.body.classList.remove('tabbar-scrolled-away');
    };
  }, []);

  return (
    <nav className={'fo-tabbar' + (hidden ? ' is-hidden' : '')} aria-hidden={hidden || undefined}>
      {tabs.map((t) => (
        <a key={t.k} href={t.href} className={'fo-tab' + (active === t.k ? ' on' : '')} tabIndex={hidden ? -1 : undefined}>
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <Icon name={t.ic} size={22} />
            {t.k === 'cart' && n ? <span className="ds-mono" style={{ position: 'absolute', top: -4, right: -8, minWidth: 15, height: 15, padding: '0 3px', borderRadius: 9999, background: 'var(--color-ink)', color: '#fff', fontSize: 9, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span> : null}
          </span>
          <span>{t.l}</span>
        </a>
      ))}
    </nav>
  );
}

function Footer() {
  const FRow = ({ k, v, mono }) => (
    <div style={{ display: 'flex', gap: 10, fontSize: 12.5, lineHeight: 1.6 }}>
      <span style={{ width: 116, flex: 'none', color: 'var(--text-tertiary)' }}>{k}</span>
      <span className={mono ? 'ds-mono' : ''} style={{ color: 'var(--text-secondary)' }}>{v}</span>
    </div>
  );
  const FTitle = ({ children }) => <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>{children}</div>;
  return (
    <footer className="fo-footer">
      <div className="fo-footer-in">
        <div className="fo-footer-top">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <img src="../shared/logo.png" alt="CHODRUM 로고" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px' }}>CHODRUM</span>
          </span>
          <div className="fo-footer-links">
            <a href={PAGES.terms}>이용약관</a>
            <a href={PAGES.privacy} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>개인정보처리방침</a>
            <a href={PAGES.marketing}>마케팅 수신 동의</a>
            <a href={PAGES.guide}>이용안내</a>
          </div>
        </div>

        <div className="fo-footer-grid">
          <div>
            <FTitle>쇼핑몰 기본정보</FTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <FRow k="상호명" v="조드럼닷컴" />
              <FRow k="대표자명" v="조준형" />
              <FRow k="사업장 주소" v="14238 경기도 광명시 디지털로 63" />
              <FRow k="대표 전화" v="010-9872-5784" mono />
              <FRow k="사업자 등록번호" v={<span className="ds-mono">3663101280 <a href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=3663101280" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>[사업자정보확인]</a></span>} />
              <FRow k="통신판매업 신고번호" v="2023-경기광명-0200" mono />
              <FRow k="개인정보보호책임자" v="조준형" />
            </div>
          </div>
          <div>
            <FTitle>고객센터 정보</FTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <FRow k="상담/주문 전화" v="010-9872-5784" mono />
              <FRow k="상담/주문 이메일" v="chodrumstudio@gmail.com" mono />
              <FRow k="CS운영시간" v={<span>평일 09:00 ~ 18:00<br />(주말, 공휴일 제외)</span>} />
            </div>
          </div>
          <div>
            <FTitle>결제정보</FTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <FRow k="무통장 계좌정보" v={<span>국민은행 <span className="ds-mono">82133700013678</span><br />조준형(조드럼닷컴)</span>} />
            </div>
          </div>
        </div>

        <div className="fo-footer-bottom">
          <span className="fo-caption">Copyright © 조드럼닷컴. All Rights Reserved.</span>
          <nav className="fo-footer-sns" aria-label="SNS">
            <a href="https://instagram.com/cho.drum" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="https://youtube.com/@chodrum" target="_blank" rel="noreferrer" aria-label="YouTube" title="YouTube">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a href="https://pf.kakao.com/_hxdVWxj" target="_blank" rel="noreferrer" aria-label="카카오톡 채널" title="카카오톡 채널">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M12 3c-5.522 0-10 3.537-10 7.9 0 2.812 1.87 5.29 4.686 6.695-.194.726-.667 2.632-.765 3.045-.12.51.187.489.394.356.163-.104 2.597-1.766 3.62-2.464.67.094 1.36.143 2.065.143 5.522 0 10-3.537 10-7.9S17.522 3 12 3zm-4.218 9.427c-.496 0-.898-.402-.898-.897s.402-.898.898-.898.898.402.898.898-.402.897-.898.897zm4.218 0c-.496 0-.898-.402-.898-.897s.402-.898.898-.898.898.402.898.898-.402.897-.898.897zm4.218 0c-.496 0-.898-.402-.898-.897s.402-.898.898-.898.898.402.898.898-.402.897-.898.897z" />
              </svg>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- 페이지 스캐폴드 ---------------- */
function Scaffold({ tab, title, back, width, cta, children, footer = true }) {
  React.useEffect(() => {
    document.body.classList.toggle('has-tabbar', !!tab);
    document.body.classList.toggle('has-cta', !!cta);
  }, [tab, !!cta]);
  return (
    <div className="fo-page">
      <Header tab={tab} title={title} back={back} />
      <main className="fo-main">
        <div className={'fo-container' + (width ? ' ' + width : '')}>{children}</div>
      </main>
      {footer ? <Footer /> : null}
      {tab ? <TabBar active={tab} /> : null}
      {cta ? <div className={'fo-ctabar' + (tab ? ' above-tabbar' : '')}>{cta}</div> : null}
    </div>
  );
}

/** 소셜(카카오/네이버/구글) 회원 여부 — Store.user 기준 */
function isSocialUser(user) {
  if (!user) return false;
  return user.type === 'social' || user.fromOAuth === true || (user.provider && user.provider !== 'email');
}

/* 마이페이지 서브페이지 좌측(모바일: 상단 가로) 메뉴 */
const MYPAGE_NAV_ITEMS = [
  { k: 'downloads', label: '구매내역 / 다운로드', icon: 'download', href: PAGES.downloads },
  { k: 'wish', label: '찜 목록', icon: 'heart', href: PAGES.wish },
  { k: 'edit', label: '내 정보 수정', icon: 'user', href: PAGES.edit },
];

function MyPageNav({ active }) {
  return (
    <nav className="fo-mypage-nav" aria-label="마이페이지 메뉴">
      {MYPAGE_NAV_ITEMS.map((item) => (
        <a
          key={item.k}
          href={item.href}
          className={'fo-mypage-nav-item' + (active === item.k ? ' on' : '')}
          aria-current={active === item.k ? 'page' : undefined}
        >
          <Icon name={item.icon} size={16} style={{ color: 'var(--color-icon)', flex: 'none' }} />
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function MyPageLayout({ active, children, label }) {
  return (
    <div data-screen-label={label} className="fo-mypage-layout">
      <MyPageNav active={active} />
      <div className="fo-mypage-content">{children}</div>
    </div>
  );
}

/* ---------------- 상품 블록 ---------------- */
function FavButton({ id, size = 'sm' }) {
  useStoreTick();
  const on = Store.fav.has(id);
  return (
    <IconButton name="heart" round size={size} variant="secondary" label="찜하기"
      style={on ? { color: 'var(--status-danger)' } : undefined}
      onClick={(e) => { e.stopPropagation(); const added = Store.fav.toggle(id); toast(added ? '찜 목록에 담았어요' : '찜을 해제했어요'); }} />
  );
}

function SheetCard({ s }) {
  const cover = sheetCoverUrl(s);
  return (
    <Card interactive padding={0} onClick={() => location.href = PAGES.detail + '?id=' + s.id} style={{ overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <StaffThumb src={cover || undefined} alt={s.title} watermark={cover ? 'light' : false} />
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, zIndex: 4 }}>
          {s.popular ? <Badge variant="solid" size="sm">인기</Badge> : null}
          {s.isNew ? <Badge variant="solid" size="sm">NEW</Badge> : null}
        </div>
        <span style={{ position: 'absolute', top: 6, right: 6, zIndex: 4 }} onClick={(e) => e.stopPropagation()}><FavButton id={s.id} /></span>
      </div>
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.3px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.artist}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 1 }}>
          <Badge variant="outline" size="sm">{s.level}</Badge>
          <Badge variant="neutral" size="sm">{s.genre}</Badge>
        </div>
        <div style={{ marginTop: 3, display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <Money value={s.price} size={16} />
          {s.orig ? <Money value={s.orig} size={12} strike /> : null}
        </div>
      </div>
    </Card>
  );
}

function SheetRow({ s, right, sub, href }) {
  const sheet = s && typeof s === 'object' ? s : { id: '', title: '악보', artist: '—', genre: '' };
  const title = sheet.title || '악보';
  const open = href === null ? undefined : () => location.href = href || (PAGES.detail + '?id=' + sheet.id);
  const cover = sheetCoverUrl(sheet);
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0', alignItems: 'center' }}>
      <div onClick={open} style={{ width: 56, flex: 'none', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)', cursor: open ? 'pointer' : 'default' }}>
        <StaffThumb ratio="1 / 1" size={20} src={cover || undefined} alt={title} watermark={cover ? 'light' : false} />
      </div>
      <div onClick={open} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3, cursor: open ? 'pointer' : 'default' }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub !== undefined ? sub : <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sheet.artist || '—'} · {sheet.genre || ''}</div>}
      </div>
      {right}
    </div>
  );
}

function SectionHeader({ title, action, href, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, ...style }}>
      <h4 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.4px' }}>{title}</h4>
      {action ? (
        <a href={href} style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          {action}<Icon name="chevron-right" size={14} />
        </a>
      ) : null}
    </div>
  );
}

function Section({ label, children, first }) {
  return (
    <section style={{ paddingTop: first ? 20 : 26 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '-0.2px' }}>{label}</div>
      {children}
    </section>
  );
}

function KV({ k, v }) {
  return (
    <div className="fo-kv">
      <span style={{ color: typeof k === 'string' ? 'var(--text-secondary)' : 'inherit' }}>{k}</span>{v}
    </div>
  );
}

function Empty({ icon, title, sub, action, href, onAction }) {
  return (
    <div style={{ padding: '64px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
      <span style={{ color: 'var(--color-icon)', opacity: 0.6 }}><Icon name={icon} size={40} /></span>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
      {sub ? <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 300 }}>{sub}</div> : null}
      {action ? <div style={{ marginTop: 8 }}><Button variant="secondary" size="md" onClick={onAction || (() => location.href = href)}>{action}</Button></div> : null}
    </div>
  );
}

function PayOption({ id, label, sub, cur, onPick }) {
  const on = cur === id;
  return (
    <button onClick={() => onPick(id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '13px 14px', textAlign: 'left', background: 'var(--surface-card)', border: '1px solid ' + (on ? 'var(--color-ink)' : 'var(--border-default)'), borderRadius: 'var(--radius-lg)', cursor: 'pointer', boxShadow: on ? '0 0 0 3px var(--focus-ring)' : 'none', transition: 'border-color 100ms ease' }}>
      <span style={{ width: 18, height: 18, flex: 'none', borderRadius: 9999, border: '2px solid ' + (on ? 'var(--color-ink)' : 'var(--border-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on ? <span style={{ width: 9, height: 9, borderRadius: 9999, background: 'var(--color-ink)' }}></span> : null}</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
      {sub ? <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-secondary)' }}>{sub}</span> : null}
    </button>
  );
}

function Dialog({ open, onClose, title, children, wide }) {
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fo-scrim" onClick={onClose} role="presentation">
      <div
        className={'fo-dialog' + (wide ? ' fo-dialog-wide' : '')}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flex: 'none', gap: 12 }}>
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.4px' }}>{title}</span>
          <IconButton name="x" variant="ghost" size="sm" label="닫기" onClick={onClose} />
        </div>
        <div className="fo-dialog-body">{children}</div>
      </div>
    </div>
  );
}

const MISSING_SHEET_TITLE = '삭제되었거나 찾을 수 없는 악보';

/** cart/fav/purchase id → 시트 정보 (미존재·예외 시에도 항상 객체 반환) */
function resolveSheet(id, extra) {
  const snap = extra && (extra.title || extra.name);
  const snapTitle = (snap && String(snap).trim() && snap !== MISSING_SHEET_TITLE) ? String(snap).trim() : '';
  const fallback = Object.assign({
    id: id,
    title: snapTitle || MISSING_SHEET_TITLE,
    artist: '—',
    level: '—',
    genre: '',
    price: 0,
    previewUrl: '',
    previewUrls: [],
    missing: true,
  }, extra || {});
  if (snapTitle) fallback.title = snapTitle;
  try {
    /* 항상 최신 DrumData.byId 사용 (hydrate 후 교체된 함수) */
    const byId = (window.DrumData && typeof window.DrumData.byId === 'function')
      ? window.DrumData.byId
      : (DATA && typeof DATA.byId === 'function' ? DATA.byId : null);
    const s = byId ? byId(id) : null;
    if (s && typeof s === 'object') {
      const liveTitle = s.title || snapTitle || fallback.title;
      return Object.assign({}, s, extra || {}, {
        missing: false,
        title: liveTitle,
      });
    }
  } catch (e) { /* ignore */ }
  return fallback;
}

/** 주문/구매 라인 표시명 — 스냅샷 우선, placeholder 문구는 스냅샷·실데이터가 있을 때 쓰지 않음 */
function lineTitle(item, resolved) {
  const snap = item && (item.title || item.name);
  if (snap && String(snap).trim() && snap !== MISSING_SHEET_TITLE) return String(snap).trim();
  const t = resolved && resolved.title;
  if (t && t !== MISSING_SHEET_TITLE) return t;
  return snap ? String(snap) : '악보';
}

/** OS 저장용 PDF 파일명 */
function pdfFileName(title) {
  const base = String(title || '악보')
    .replace(/\.pdf$/i, '')
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return (base || '악보') + '.pdf';
}

/** 모바일(또는 iPadOS) — 브라우저 미리보기 대신 저장/공유 흐름을 우선 */
function isLikelyMobile() {
  try {
    if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
      return navigator.userAgentData.mobile;
    }
  } catch (_) { /* ignore */ }
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPod|Mobile/i.test(ua)) return true;
  /* iPadOS 13+ 는 MacIntel + touch */
  if (/iPad/i.test(ua)) return true;
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
  return false;
}

function clickDownloadAnchor(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function asPdfBlob(blob) {
  if (blob && blob.type === 'application/pdf') return blob;
  return new Blob([blob], { type: 'application/pdf' });
}

let pdfDownloadBusy = false;

/**
 * 구매한 악보 PDF를 기기에 저장.
 * Live: Edge sheet-download 가 ACTIVE 권한 확인 후 단기 signed URL 발급.
 * (public pdf_url 직접 fetch 금지 — Storage private)
 * @param {string|object} sheetOrId
 * @param {{ title?: string, expired?: boolean, email?: string, orderNo?: string }} [opts]
 */
async function downloadSheetPdf(sheetOrId, opts) {
  opts = opts || {};
  if (opts.expired) {
    toast('다운로드 기간이 만료되었어요');
    return;
  }
  if (pdfDownloadBusy) {
    toast('다운로드를 준비 중이에요');
    return;
  }

  let sheet = null;
  let sheetId = null;
  if (sheetOrId && typeof sheetOrId === 'object') {
    sheetId = (sheetOrId.sheetId != null && sheetOrId.sheetId !== '')
      ? sheetOrId.sheetId
      : sheetOrId.id;
    const urlHint = sheetOrId.pdfUrl || sheetOrId.pdf_url || '';
    sheet = sheetId != null && sheetId !== ''
      ? resolveSheet(sheetId, sheetOrId)
      : Object.assign({}, sheetOrId);
    if (urlHint && !(sheet.pdfUrl || sheet.pdf_url)) {
      sheet = Object.assign({}, sheet, { pdfUrl: urlHint });
    }
  } else if (sheetOrId != null && sheetOrId !== '') {
    sheetId = sheetOrId;
    sheet = resolveSheet(sheetOrId);
  }
  if (sheetId == null && sheet) sheetId = sheet.id;

  const title = String(opts.title || (sheet && sheet.title) || '악보').trim() || '악보';
  const filename = pdfFileName(title);
  const mobile = isLikelyMobile();
  pdfDownloadBusy = true;
  toast('「' + title + '」 다운로드 준비 중…', 4000);

  try {
    let url = '';
    const live = window.ChodrumAPI && ChodrumAPI.isLive && ChodrumAPI.isLive();
    if (live && ChodrumAPI.downloads && typeof ChodrumAPI.downloads.signedPdfUrl === 'function') {
      const signed = await ChodrumAPI.downloads.signedPdfUrl({
        sheetId: sheetId,
        email: opts.email || null,
        orderNo: opts.orderNo || null,
      });
      url = signed && signed.url;
    } else {
      url = (sheet && (sheet.pdfUrl || sheet.pdf_url)) || '';
    }
    if (!url) {
      toast('「' + title + '」 PDF가 없어요');
      return;
    }

    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const blob = asPdfBlob(await res.blob());

    /* iOS/Android: 공유 시트 →「파일에 저장」이 미리보기보다 안정적 */
    if (mobile && typeof navigator.canShare === 'function' && typeof navigator.share === 'function') {
      const file = new File([blob], filename, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: filename });
          toast('「' + title + '」 저장했어요', 2500);
          return;
        } catch (shareErr) {
          if (shareErr && shareErr.name === 'AbortError') return; /* 사용자가 공유 취소 */
          /* fetch 이후 user gesture 소실(NotAllowedError) → 한 번 더 탭해 공유 */
          if (shareErr && shareErr.name === 'NotAllowedError') {
            const ok = window.confirm('「' + title + '」 PDF를 기기에 저장할까요?');
            if (!ok) return;
            try {
              await navigator.share({ files: [file], title: filename });
              toast('「' + title + '」 저장했어요', 2500);
              return;
            } catch (shareErr2) {
              if (shareErr2 && shareErr2.name === 'AbortError') return;
              console.warn('[CHODRUM] PDF share retry failed', shareErr2);
            }
          } else {
            console.warn('[CHODRUM] PDF share failed, trying anchor download', shareErr);
          }
        }
      }
    }

    /* Android Chrome·데스크톱: blob URL + download 속성 */
    if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
      toast('「' + title + '」 다운로드를 시작했어요', 2500);
      return;
    }

    const objUrl = URL.createObjectURL(blob);
    clickDownloadAnchor(objUrl, filename);
    setTimeout(function () {
      try { URL.revokeObjectURL(objUrl); } catch (_) {}
    }, 4000);
    toast('「' + title + '」 다운로드를 시작했어요', 2500);
  } catch (e) {
    console.warn('[CHODRUM] PDF download failed', e);
    toast((e && e.message) || 'PDF 다운로드에 실패했어요. 네트워크를 확인해 주세요.', 3500);
  } finally {
    pdfDownloadBusy = false;
  }
}

/* 장바구니 담기 성공 — 이동 / 계속 쇼핑 */
function CartAddedDialog({ open, onClose, message = '장바구니에 담았어요' }) {
  return (
    <Dialog open={open} onClose={onClose} title={message}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="primary" size="lg" fullWidth iconLeft="shopping-cart" onClick={() => { location.href = PAGES.cart; }}>장바구니로 이동</Button>
        <Button variant="secondary" size="lg" fullWidth onClick={onClose}>계속 쇼핑</Button>
      </div>
    </Dialog>
  );
}

/* 화면 상태 미리보기 토글 (설계 검토용) */
function PreviewToggle({ label = '화면 상태 미리보기', options, value, onChange }) {
  const { Chip } = DS;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '10px 12px', background: 'var(--surface-sunken)', border: '1px dashed var(--border-strong)', borderRadius: 8, marginTop: 16 }}>
      <span className="ds-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.4px' }}>{label}</span>
      {options.map((o) => <Chip key={o} selected={value === o} onClick={() => onChange(o)}>{o}</Chip>)}
    </div>
  );
}

/* 약관 — ChodrumLegal (legal-docs.js) 단일 소스 */
function legalDoc(id) {
  return (window.ChodrumLegal && ChodrumLegal.byId(id)) || null;
}
function legalVer(id) {
  const d = legalDoc(id);
  return (d && d.ver) || 'v1.0';
}
function LegalDocBody({ kind }) {
  const doc = legalDoc(kind);
  if (!doc) {
    return <p style={{ margin: 0, color: 'var(--text-secondary)' }}>약관 본문을 불러오지 못했어요. legal-docs.js 를 확인해주세요.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5, lineHeight: 1.75, color: 'var(--text-secondary)' }}>
      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
        {doc.name} · <span className="ds-mono">{doc.ver}</span> · 시행일 {doc.date}
      </p>
      <div style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{doc.body}</div>
    </div>
  );
}
function LegalTermRow({ checked, onChange, label, kind, onView }) {
  const ver = legalVer(kind);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <Checkbox
          checked={checked}
          onChange={onChange}
          label={
            <span>
              {label}{' '}
              <span className="ds-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>{ver}</span>
            </span>
          }
        />
      </div>
      {onView ? (
        <button
          type="button"
          onClick={onView}
          style={{ fontSize: 12.5, color: 'var(--text-secondary)', textDecoration: 'underline', textUnderlineOffset: 2, flex: 'none', padding: '2px 0', background: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          보기
        </button>
      ) : null}
    </div>
  );
}

window.FO = { PAGES, won, qp, goBack, toast, useStoreTick, loadPurchases, Money, Stars, StaffThumb, sheetCoverUrl, DdayBadge, Header, TabBar, Footer, Scaffold, isSocialUser, MyPageNav, MyPageLayout, FavButton, SheetCard, SheetRow, SectionHeader, Section, KV, Empty, PayOption, Dialog, CartAddedDialog, resolveSheet, lineTitle, downloadSheetPdf, pdfFileName, MISSING_SHEET_TITLE, PreviewToggle, legalDoc, legalVer, LegalDocBody, LegalTermRow };
