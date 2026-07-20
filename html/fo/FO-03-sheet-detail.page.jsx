/* FO-03 악보 상세 — 워터마크 미리보기 · YouTube 연동 · 곡 정보 · 찜/장바구니 (직접 결제 없음) */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, IconButton, Card, Badge, Icon } = DS;
const F = window.FO;
const D = window.DrumData;
const A = window.ChodrumAPI;

/** Thumbnail + open-on-YouTube when embed is blocked (whole surface is tappable). */
function YouTubeFallback({ id, title }) {
  const thumb = A.youtubeThumbUrl(id);
  const watch = A.youtubeWatchUrl(id);
  const label = title ? (title + ' — YouTube에서 보기') : 'YouTube에서 보기';
  return (
    <a className="fo-yt fo-yt-fallback" href={watch} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {thumb ? <img className="fo-yt-fallback-img" src={thumb} alt="" decoding="async" /> : null}
      <div className="fo-yt-fallback-scrim" aria-hidden="true" />
      <span className="fo-yt-open">YouTube에서 보기</span>
    </a>
  );
}

/** Eager YouTube iframe (no autoplay). User taps YouTube's own play control. */
function YouTubePlayer({ url, title }) {
  const id = A && A.parseYouTubeId ? A.parseYouTubeId(url) : '';
  const [mode, setMode] = React.useState(() => {
    if (!id) return 'none';
    if (A.youtubeEmbedBlockedOnHost && A.youtubeEmbedBlockedOnHost()) return 'fallback';
    return 'embed';
  });

  React.useEffect(() => {
    if (!id || mode !== 'embed' || !A.youtubeCanEmbed) return undefined;
    let cancelled = false;
    A.youtubeCanEmbed(id).then((ok) => {
      if (cancelled) return;
      if (ok === false) setMode('fallback');
    });
    return () => { cancelled = true; };
  }, [id, mode]);

  if (!id || mode === 'none') return null;
  if (mode === 'fallback') return <YouTubeFallback id={id} title={title} />;

  const embed = A.youtubeEmbedUrl(id, false);
  const label = title ? (title + ' 연동 영상') : '연동 영상';
  return (
    <div className="fo-yt" role="region" aria-label={label}>
      <iframe
        src={embed}
        title={label}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

function sheetYoutubeUrl(s) {
  if (!s) return '';
  return String(s.youtubeUrl || s.youtube_url || '').trim();
}

function sheetSlugFromPath() {
  const m = location.pathname.match(/^\/sheets\/([^/]+)\/?$/);
  if (!m) return null;
  const raw = m[1];
  if (D && typeof D.normalizeSlugKey === 'function') return D.normalizeSlugKey(raw);
  try { return decodeURIComponent(raw); } catch (_) { return raw; }
}

function useChodrumReady() {
  const [ready, setReady] = React.useState(() => !!(window.ChodrumAPI && window.ChodrumAPI.readyState && window.ChodrumAPI.readyState.ready));
  React.useEffect(() => {
    if (ready) return undefined;
    const done = () => setReady(true);
    if (window.ChodrumAPI && window.ChodrumAPI.ready) {
      window.ChodrumAPI.ready.then(done).catch(done);
    }
    window.addEventListener('chodrum:ready', done);
    return () => window.removeEventListener('chodrum:ready', done);
  }, [ready]);
  return ready;
}

function DetailPage() {
  const slugPath = sheetSlugFromPath();
  const idFromQuery = F.qp('id');
  const bootReady = useChodrumReady();
  const [, bump] = React.useState(0);
  const [fetchedSheet, setFetchedSheet] = React.useState(null);
  const [slugPending, setSlugPending] = React.useState(false);
  const [slugResolved, setSlugResolved] = React.useState(false);
  F.useStoreTick();

  React.useEffect(() => {
    const onReady = () => bump((n) => n + 1);
    window.addEventListener('chodrum:ready', onReady);
    return () => window.removeEventListener('chodrum:ready', onReady);
  }, []);

  let s = null;
  if (slugPath && typeof D.bySlug === 'function') {
    s = D.bySlug(slugPath);
  } else if (idFromQuery) {
    s = D.byId(idFromQuery);
  }
  if (!s && fetchedSheet) s = fetchedSheet;

  /* Slug URL: catalog miss → single-row Supabase fetch before 404 */
  React.useEffect(() => {
    if (!bootReady) return undefined;
    if (!slugPath || s) {
      setSlugResolved(true);
      return undefined;
    }
    if (!A || !A.sheets || typeof A.sheets.getBySlug !== 'function') {
      setSlugResolved(true);
      return undefined;
    }
    let cancelled = false;
    setSlugPending(true);
    setSlugResolved(false);
    A.sheets.getBySlug(slugPath)
      .then((row) => {
        if (!cancelled && row) setFetchedSheet(row);
      })
      .catch(() => { /* fall through to 404 */ })
      .finally(() => {
        if (!cancelled) {
          setSlugPending(false);
          setSlugResolved(true);
        }
      });
    return () => { cancelled = true; };
  }, [bootReady, slugPath, s && s.id]);

  /* Legacy ?id= → canonical slug URL (middleware handles 301 on cold load) */
  React.useEffect(() => {
    if (!idFromQuery || slugPath || !s || !s.slug) return;
    const next = F.sheetUrl(s);
    const cur = location.pathname + location.search;
    if (next && cur !== next) {
      history.replaceState(null, '', next);
    }
  }, [idFromQuery, slugPath, s && s.slug, s && s.id]);

  const [cartAsk, setCartAsk] = React.useState(false);
  const [cartMsg, setCartMsg] = React.useState('장바구니에 담았어요');

  if (!bootReady || (slugPath && !s && (slugPending || !slugResolved))) {
    return (
      <F.Scaffold title="악보 상세" back={F.PAGES.list}>
        <p className="fo-caption" style={{ textAlign: 'center', padding: '48px 16px' }}>악보 정보를 불러오는 중…</p>
      </F.Scaffold>
    );
  }

  /* 존재하지 않는 악보 ID → 404 안내 (FO-03 예외 처리) */
  if (!s) {
    return (
      <F.Scaffold title="악보 상세" back={F.PAGES.list}>
        <F.Empty icon="music" title="악보를 찾을 수 없어요" sub="판매가 종료되었거나 삭제된 악보예요. 다른 악보를 둘러보세요." action="악보 둘러보기" href={F.PAGES.list} />
      </F.Scaffold>
    );
  }

  /* 숨김/판매중지 악보는 스토어에서 차단 */
  if (s.status && s.status !== '판매중') {
    return (
      <F.Scaffold title="악보 상세" back={F.PAGES.list}>
        <F.Empty icon="eye-off" title="현재 판매하지 않는 악보예요" sub="다른 악보를 둘러보세요." action="악보 둘러보기" href={F.PAGES.list} />
      </F.Scaffold>
    );
  }

  const faved = Store.fav.has(s.id);
  const related = D.sheets.filter((x) => x.genre === s.genre && x.id !== s.id && (!x.status || x.status === '판매중')).slice(0, 4);
  const previewUrls = (s.previewUrls && s.previewUrls.length)
    ? s.previewUrls.slice(0, 2)
    : (s.previewUrl ? [s.previewUrl] : []);
  const ytUrl = sheetYoutubeUrl(s);
  const ytId = A && A.parseYouTubeId ? A.parseYouTubeId(ytUrl) : '';
  const add = () => {
    const ok = Store.cart.add(s.id, 1);
    setCartMsg(ok ? '장바구니에 담았어요' : '이미 장바구니에 있어요');
    setCartAsk(true);
  };

  const CtaButtons = ({ large }) => (
    <React.Fragment>
      <IconButton name="heart" variant="secondary" size="lg" label="찜하기"
        style={faved ? { color: 'var(--status-danger)' } : undefined}
        onClick={() => { const on = Store.fav.toggle(s.id); F.toast(on ? '찜 목록에 담았어요' : '찜을 해제했어요'); }} />
      <div style={{ flex: 1 }}><Button variant="primary" size="lg" fullWidth iconLeft="shopping-cart" onClick={add}>장바구니 담기</Button></div>
    </React.Fragment>
  );

  return (
    <F.Scaffold title="악보 상세" back={F.PAGES.list} cta={<CtaButtons />}>
      <div data-screen-label="FO-03 악보 상세" className="fo-two" style={{ paddingTop: 20 }}>
        {/* 정보 + CTA (DOM 먼저 → 모바일 상단; 데스크톱은 fo.css grid-column으로 우측) */}
        <div className="fo-side-sticky" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {s.popular ? <Badge variant="solid" size="sm">인기</Badge> : null}
            {s.isNew ? <Badge variant="solid" size="sm">NEW</Badge> : null}
            <Badge variant="outline" size="sm">{s.level}</Badge>
            <Badge variant="neutral" size="sm">{s.genre}</Badge>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)', letterSpacing: '-0.9px', lineHeight: 1.25 }}>{s.title}</h2>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            <span>{s.artist}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <F.Money value={s.price} size={28} />
            {s.orig ? <F.Money value={s.orig} size={15} strike /> : null}
            {s.orig ? <Badge variant="danger" size="sm">{Math.round((1 - s.price / s.orig) * 100)}% 할인</Badge> : null}
          </div>

          <div style={{ padding: '14px 16px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-cards)', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--surface-card)' }}>
            {[['장르', s.genre], ['난이도', s.level], ['페이지', s.pages + '페이지'], ['파일 형식', 'PDF'], ['다운로드', '결제일로부터 7일간']].map(([k, v]) => (
              <F.KV key={k} k={k} v={<span style={{ fontWeight: 500 }}>{v}</span>} />
            ))}
          </div>

          <div className="fo-desktop" style={{ display: 'flex', gap: 10, marginTop: 6 }}><CtaButtons /></div>
          <p className="fo-caption" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="info" size={13} style={{ color: 'var(--color-icon)' }} />결제는 장바구니에서 진행돼요. 바로 결제는 지원하지 않아요.
          </p>
        </div>

        {/* YouTube(있을 때) → 미리보기 */}
        <div className="fo-detail-main">
          {ytId ? (
            <div style={{ marginBottom: 16 }}>
              <Card padding={0} style={{ overflow: 'visible' }}>
                <YouTubePlayer url={ytUrl} title={s.title} />
              </Card>
              <p className="fo-caption" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="play" size={13} style={{ color: 'var(--color-icon)' }} />페이지에서 바로 재생하거나, 안 되면 YouTube에서 열 수 있어요.
              </p>
            </div>
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(previewUrls.length ? previewUrls : [null]).map((url, i) => (
              <Card key={i} padding={0} style={{ overflow: 'hidden' }}>
                <F.StaffThumb ratio="5 / 4" size={44} watermark="strong" fit="cover" src={url || undefined} alt={url ? ('미리보기 ' + (i + 1) + '페이지') : ''} />
              </Card>
            ))}
          </div>
          <p className="fo-caption" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="eye" size={13} style={{ color: 'var(--color-icon)' }} />미리보기는 1–2페이지만 제공되며, 일부만 보이도록 처리돼요.
          </p>
        </div>
      </div>

      <section style={{ marginTop: 44 }}>
        <F.SectionHeader title="관련 악보" action="더보기" href={F.PAGES.list + '?cat=' + encodeURIComponent(s.genre)} />
        <div className="fo-grid">{related.map((r) => <F.SheetCard key={r.id} s={r} />)}</div>
      </section>

      <F.CartAddedDialog open={cartAsk} onClose={() => setCartAsk(false)} message={cartMsg} />
    </F.Scaffold>
  );
}

function mountDetailPage() {
  ReactDOM.createRoot(document.getElementById('app')).render(<DetailPage />);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountDetailPage);
} else {
  mountDetailPage();
}
