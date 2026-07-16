/* FO-01 홈 (메인) — 검색 · 추천/신규/인기 · 카테고리 바로가기 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Icon, Chip, Card, Badge, Input } = DS;
const F = window.FO;
const D = window.DrumData;

/** BO 배너 link → FO 경로 */
function resolveBannerHref(link) {
  if (!link) return null;
  const s = String(link).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^\/?list/i.test(s)) {
    const q = s.indexOf('?');
    return F.PAGES.list + (q >= 0 ? s.slice(q) : '');
  }
  if (/^\/?detail/i.test(s)) {
    const q = s.indexOf('?');
    return F.PAGES.detail + (q >= 0 ? s.slice(q) : '');
  }
  if (/\.html/i.test(s)) return s.replace(/^\//, '');
  return s.replace(/^\//, '');
}

const BANNER_AUTO_MS = 5000;
const BANNER_DRAG_THRESHOLD = 0.23; /* fraction of viewport width */
const BANNER_FLICK_VX = 0.45; /* px/ms */

function bannerHref(b) {
  if (!b) return null;
  const sheet = b.sheetId ? D.byId(b.sheetId) : null;
  return sheet
    ? (F.PAGES.detail + '?id=' + encodeURIComponent(sheet.id))
    : resolveBannerHref(b.link);
}

function BannerSlide({ banner, linkable }) {
  const href = bannerHref(banner);
  const pcSrc = banner.imgUrl || '';
  const mobileSet = banner.imgUrlMobile || pcSrc;
  const go = () => { if (href) location.href = href; };

  return (
    <div
      className={'fo-home-banner-slide' + (href && linkable ? ' is-link' : '')}
      role={href && linkable ? 'link' : undefined}
      tabIndex={href && linkable ? 0 : undefined}
      onClick={href && linkable ? go : undefined}
      onKeyDown={href && linkable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      } : undefined}
    >
      {pcSrc ? (
        <picture>
          <source media="(max-width: 767px)" srcSet={mobileSet} sizes="100vw" />
          <img
            className="fo-home-banner-img"
            src={pcSrc}
            sizes="(min-width: 1120px) 1088px, calc(100vw - 32px)"
            width={1120}
            height={220}
            alt={banner.title || '배너'}
            decoding="async"
            draggable={false}
          />
        </picture>
      ) : (
        <div className="fo-home-banner-fallback">
          <span className="ds-mono" style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Banner</span>
          <strong>{banner.title}</strong>
        </div>
      )}
    </div>
  );
}

function HomeBanners() {
  const [tick, setTick] = React.useState(0);
  const [trackIdx, setTrackIdx] = React.useState(1);
  const [dragPx, setDragPx] = React.useState(0);
  const [animating, setAnimating] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [progressKey, setProgressKey] = React.useState(0);
  const viewportRef = React.useRef(null);
  const trackIdxRef = React.useRef(1);
  const suppressClick = React.useRef(false);
  const dragRef = React.useRef(null);

  React.useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    window.addEventListener('chodrum:ready', refresh);
    return () => window.removeEventListener('chodrum:ready', refresh);
  }, []);

  const banners = React.useMemo(() => {
    void tick;
    return (D.activeHomeBanners ? D.activeHomeBanners() : []).filter(Boolean).map((b) => ({
      ...b,
      imgUrl: b.imgUrl || b.image_url || '',
      imgUrlMobile: b.imgUrlMobile || b.image_url_mobile || '',
      sheetId: b.sheetId || b.sheet_id || '',
    }));
  }, [tick]);

  const n = banners.length;
  const multi = n > 1;
  /* Loop strip: [last clone] + banners + [first clone] */
  const slides = React.useMemo(() => {
    if (!n) return [];
    if (n === 1) return [banners[0]];
    return [banners[n - 1], ...banners, banners[0]];
  }, [banners, n]);

  React.useEffect(() => {
    trackIdxRef.current = trackIdx;
  }, [trackIdx]);

  React.useEffect(() => {
    if (!n) return;
    if (n === 1) {
      setTrackIdx(0);
      trackIdxRef.current = 0;
      return;
    }
    setTrackIdx(1);
    trackIdxRef.current = 1;
    setDragPx(0);
    setAnimating(false);
  }, [n]);

  const realIdx = !n ? 0 : (n === 1 ? 0 : ((trackIdx - 1 + n) % n));

  const bumpProgress = React.useCallback(() => {
    setProgressKey((k) => k + 1);
  }, []);

  const stepTrack = React.useCallback((dir) => {
    if (!multi) return;
    setAnimating(true);
    setDragPx(0);
    setTrackIdx((i) => {
      const next = i + dir;
      trackIdxRef.current = next;
      return next;
    });
    bumpProgress();
  }, [multi, bumpProgress]);

  const goPrev = React.useCallback((e) => {
    if (e) e.stopPropagation();
    stepTrack(-1);
  }, [stepTrack]);

  const goNext = React.useCallback((e) => {
    if (e) e.stopPropagation();
    stepTrack(1);
  }, [stepTrack]);

  const onProgressEnd = React.useCallback(() => {
    if (!multi || paused || dragging) return;
    stepTrack(1);
  }, [multi, paused, dragging, stepTrack]);

  const onTrackTransitionEnd = React.useCallback((e) => {
    if (e.target !== e.currentTarget) return;
    if (!multi) return;
    const i = trackIdxRef.current;
    if (i === 0) {
      setAnimating(false);
      setTrackIdx(n);
      trackIdxRef.current = n;
    } else if (i === n + 1) {
      setAnimating(false);
      setTrackIdx(1);
      trackIdxRef.current = 1;
    } else {
      setAnimating(false);
    }
  }, [multi, n]);

  const endDrag = React.useCallback(() => {
    const d = dragRef.current;
    if (!d || !d.active) return;
    dragRef.current = null;
    setDragging(false);

    const dx = d.dx;
    if (d.axis !== 'x' || Math.abs(dx) < 4) {
      setDragPx(0);
      setAnimating(false);
      return;
    }

    suppressClick.current = true;
    window.setTimeout(() => { suppressClick.current = false; }, 320);

    const width = (viewportRef.current && viewportRef.current.offsetWidth) || 1;
    const dt = Math.max(1, d.lastT - d.prevT);
    const vx = (d.lastX - d.prevX) / dt;
    const passed = Math.abs(dx) >= width * BANNER_DRAG_THRESHOLD;
    const flicked = Math.abs(dx) >= 36 && (
      (dx < 0 && vx <= -BANNER_FLICK_VX) || (dx > 0 && vx >= BANNER_FLICK_VX)
    );
    if (passed || flicked) {
      stepTrack(dx < 0 ? 1 : -1);
    } else {
      setAnimating(true);
      setDragPx(0);
    }
  }, [stepTrack]);

  const onPointerDown = React.useCallback((e) => {
    if (!multi) return;
    /* Mouse: no drag — click must open the banner link. Touch/pen keep swipe. */
    if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
    if (e.target.closest && e.target.closest('.fo-home-banner-nav')) return;
    const x = e.clientX;
    const y = e.clientY;
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: x,
      startY: y,
      dx: 0,
      axis: null,
      prevX: x,
      prevT: performance.now(),
      lastX: x,
      lastT: performance.now(),
    };
    setAnimating(false);
    setDragging(true);
    setDragPx(0);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  }, [multi]);

  const onPointerMove = React.useCallback((e) => {
    const d = dragRef.current;
    if (!d || !d.active || d.pointerId !== e.pointerId) return;
    const x = e.clientX;
    const y = e.clientY;
    const dx = x - d.startX;
    const dy = y - d.startY;
    if (!d.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (d.axis === 'y') return;
    }
    if (d.axis !== 'x') return;
    d.prevX = d.lastX;
    d.prevT = d.lastT;
    d.lastX = x;
    d.lastT = performance.now();
    d.dx = dx;
    setDragPx(dx);
  }, []);

  const onPointerUp = React.useCallback((e) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    endDrag();
  }, [endDrag]);

  const onPointerCancel = React.useCallback((e) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    setAnimating(true);
    setDragPx(0);
  }, []);

  const onClickCapture = React.useCallback((e) => {
    if (!suppressClick.current) return;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  if (!n) return null;

  const hold = paused || dragging;
  const transform = multi
    ? 'translate3d(calc(' + (-trackIdx * 100) + '% + ' + dragPx + 'px),0,0)'
    : 'translate3d(0,0,0)';

  return (
    <section
      className={'fo-home-banners' + (hold ? ' is-paused' : '') + (dragging ? ' is-dragging' : '')}
      aria-label="홈 배너"
      aria-roledescription={multi ? 'carousel' : undefined}
      onMouseEnter={() => { if (multi) setPaused(true); }}
      onMouseLeave={() => { if (multi) setPaused(false); }}
      onFocusCapture={() => { if (multi) setPaused(true); }}
      onBlurCapture={(e) => {
        if (!multi) return;
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div
        ref={viewportRef}
        className="fo-home-banner"
        onPointerDown={multi ? onPointerDown : undefined}
        onPointerMove={multi ? onPointerMove : undefined}
        onPointerUp={multi ? onPointerUp : undefined}
        onPointerCancel={multi ? onPointerCancel : undefined}
        onClickCapture={multi ? onClickCapture : undefined}
      >
        <div
          className={'fo-home-banner-track' + (animating && !dragging ? ' is-animating' : '')}
          style={{ transform }}
          onTransitionEnd={multi ? onTrackTransitionEnd : undefined}
        >
          {slides.map((b, i) => (
            <BannerSlide key={(b.id || b.title || 'b') + '-' + i} banner={b} linkable={!dragging} />
          ))}
        </div>

        {multi ? (
          <>
            <button
              type="button"
              className="fo-home-banner-nav fo-home-banner-nav-prev"
              aria-label="이전 배너"
              onClick={goPrev}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="fo-home-banner-nav fo-home-banner-nav-next"
              aria-label="다음 배너"
              onClick={goNext}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="fo-home-banner-progress" aria-hidden="true">
              <div
                key={realIdx + '-' + progressKey}
                className="fo-home-banner-progress-fill"
                style={{ animationDuration: BANNER_AUTO_MS + 'ms' }}
                onAnimationEnd={onProgressEnd}
              />
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function HomePage() {
  const search = (e) => { e.preventDefault(); const q = new FormData(e.target).get('q'); location.href = F.PAGES.list + (q ? '?q=' + encodeURIComponent(q) : ''); };
  const visible = (D.visibleSheets ? D.visibleSheets() : D.sheets.filter((s) => !s.status || s.status === '판매중'));
  const reco = D.recommended.map(D.byId).filter(Boolean).filter((s) => !s.status || s.status === '판매중');
  const fresh = visible
    .filter((s) => s.isNew)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 8);
  const popular = [...visible].filter((s) => s.popular).sort((a, b) => b.sold - a.sold).slice(0, 8);
  const bannerSheet = D.banner && D.banner.sheetId ? D.byId(D.banner.sheetId) : null;

  return (
    <F.Scaffold tab="home">
      <section data-screen-label="FO-01 홈" style={{ padding: '32px 0 6px', maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4.4vw, 34px)', letterSpacing: '-1.4px', lineHeight: 1.2 }}>드럼 악보, 검색하고<br className="fo-mobile" /> 바로 다운로드</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 10 }}>결제일로부터 7일간 PDF로 다운로드할 수 있어요.</p>
        <form onSubmit={search} style={{ marginTop: 18, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          <Input name="q" iconLeft="search" placeholder="곡명, 아티스트 검색" />
        </form>
      </section>

      <div className="fo-chips" style={{ padding: '16px 0 6px', justifyContent: 'safe center' }}>
        <Chip onClick={() => location.href = F.PAGES.list}>전체</Chip>
        {D.genres.map((c) => <Chip key={c} onClick={() => location.href = F.PAGES.list + '?cat=' + encodeURIComponent(c)}>{c}</Chip>)}
      </div>

      {/* 메인 배너 (BO-08) — 검색·카테고리 칩 아래, 추천 악보 위 */}
      <HomeBanners />

      {/* 추천 배너 (BO 설정 큐레이션 · home_promo) */}
      {bannerSheet ? (
      <section style={{ marginTop: 24 }}>
        <Card interactive padding={0} onClick={() => location.href = F.PAGES.detail + '?id=' + bannerSheet.id} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ flex: 1, padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
              <span className="ds-mono" style={{ fontSize: 11, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{D.banner.label}</span>
              <h3 style={{ fontSize: 'clamp(19px, 2.6vw, 24px)', letterSpacing: '-0.7px' }}>{D.banner.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 420 }}>{D.banner.copy}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <F.Money value={bannerSheet.price} size={18} />
                {bannerSheet.orig ? <F.Money value={bannerSheet.orig} size={13} strike /> : null}
                <span style={{ marginLeft: 'auto' }}></span>
              </div>
              <div style={{ marginTop: 4 }}><Button variant="secondary" size="sm" iconRight="chevron-right">악보 보러가기</Button></div>
            </div>
            <div style={{ width: 150, flex: 'none', borderLeft: '1px solid var(--border-default)', alignSelf: 'stretch' }} className="fo-desktop">
              <F.StaffThumb fill icon="music" size={34} src={F.sheetCoverUrl(bannerSheet) || undefined} alt={bannerSheet.title} watermark={F.sheetCoverUrl(bannerSheet) ? 'light' : false} />
            </div>
          </div>
        </Card>
      </section>
      ) : null}

      <section style={{ marginTop: 36 }}>
        <F.SectionHeader title="추천 악보" action="전체보기" href={F.PAGES.list} />
        <div className="fo-grid">{reco.map((s) => <F.SheetCard key={s.id} s={s} />)}</div>
      </section>

      <section style={{ marginTop: 36 }}>
        <F.SectionHeader title="신규 악보" action="전체보기" href={F.PAGES.list + '?sort=' + encodeURIComponent('최신순')} />
        <div className="fo-grid">{fresh.map((s) => <F.SheetCard key={s.id} s={s} />)}</div>
      </section>

      <section style={{ marginTop: 36 }}>
        <F.SectionHeader title="인기 악보" action="전체보기" href={F.PAGES.list + '?sort=' + encodeURIComponent('인기순')} />
        <div className="fo-grid">{popular.map((s) => <F.SheetCard key={s.id} s={s} />)}</div>
      </section>

      <section style={{ marginTop: 40 }}>
        <F.SectionHeader title="카테고리 바로가기" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {D.genres.map((g) => {
            const n = visible.filter((s) => s.genre === g).length;
            return (
              <Card key={g} interactive padding={14} onClick={() => location.href = F.PAGES.list + '?cat=' + encodeURIComponent(g)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.3px' }}>{g}</span>
                    <span className="ds-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{n}곡</span>
                  </div>
                  <Icon name="chevron-right" size={16} style={{ color: 'var(--color-icon)' }} />
                </div>
              </Card>
            );
          })}
          <Card interactive padding={14} onClick={() => location.href = F.PAGES.list}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.3px' }}>난이도별 찾기</span>
                <span className="ds-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>입문 – 고급</span>
              </div>
              <Icon name="chevron-right" size={16} style={{ color: 'var(--color-icon)' }} />
            </div>
          </Card>
        </div>
      </section>
    </F.Scaffold>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<HomePage />);
});
