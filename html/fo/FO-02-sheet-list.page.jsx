/* FO-02 악보 목록 — 카테고리/난이도 필터 · 정렬 · 검색 결과 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Icon, Chip, Select, Input, Checkbox } = DS;
const F = window.FO;
const D = window.DrumData;
const PAGE_SIZE = 20;

function FilterGroup({ label, children }) {
  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function ListPage() {
  const [q, setQ] = React.useState(F.qp('q') || '');
  const [cat, setCat] = React.useState(F.qp('cat') || '전체');
  const [levels, setLevels] = React.useState([]);
  const [sort, setSort] = React.useState(F.qp('sort') || '인기순');
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  React.useEffect(() => { setVisibleCount(PAGE_SIZE); }, [q, cat, levels, sort]);

  const toggleLevel = (l) => setLevels((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l]);
  const reset = () => { setQ(''); setCat('전체'); setLevels([]); setSort('인기순'); setVisibleCount(PAGE_SIZE); };

  const catalog = D.visibleSheets ? D.visibleSheets() : D.sheets.filter((s) => !s.status || s.status === '판매중');
  let list = catalog
    .filter((s) => cat === '전체' || s.genre === cat)
    .filter((s) => !levels.length || levels.includes(s.level))
    .filter((s) => !q || (s.title + s.artist).toLowerCase().includes(q.toLowerCase()));
  list = [...list].sort((a, b) =>
    sort === '가격순' ? a.price - b.price :
    sort === '이름순' ? a.title.localeCompare(b.title, 'ko') :
    sort === '최신순' ? (
      /* 최신순: created_at 내림차순 (NEW 배지와 별개) */
      (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    ) :
    /* 인기순: 관리자 「인기악보」 체크 우선, 같으면 판매량 */
    (Number(!!b.popular) - Number(!!a.popular)) || (b.sold - a.sold));

  const visibleList = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;
  const reco = [...catalog].filter((s) => s.popular).slice(0, 4);
  const cats = ['전체', ...D.genres];

  return (
    <F.Scaffold tab="list" title="악보">
      <div data-screen-label="FO-02 악보 목록" className="fo-list-layout" style={{ paddingTop: 20 }}>
        {/* 데스크톱 필터 */}
        <aside className="fo-filters">
          <FilterGroup label="카테고리 / 장르">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '7px 10px', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: cat === c ? 600 : 500, background: cat === c ? '#f1f1f1' : 'transparent', color: cat === c ? 'var(--color-ink)' : 'var(--text-secondary)' }}>
                {c}
                <span className="ds-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{c === '전체' ? catalog.length : catalog.filter((s) => s.genre === c).length}</span>
              </button>
            ))}
          </FilterGroup>
          <FilterGroup label="난이도">
            {D.levels.map((l) => <Checkbox key={l} checked={levels.includes(l)} onChange={() => toggleLevel(l)} label={l} />)}
          </FilterGroup>
          <Button variant="ghost" size="sm" iconLeft="x" onClick={reset}>필터 초기화</Button>
        </aside>

        <div className="fo-list-main">
          <div style={{ maxWidth: 480 }} className="fo-mobile">
            <Input iconLeft="search" placeholder="곡명, 아티스트 검색" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {/* 모바일 필터 칩 */}
          <div className="fo-mobile-filters">
            <div className="fo-chips" style={{ padding: '12px 0 2px' }}>
              {cats.map((c) => <Chip key={c} selected={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
            </div>
            <div className="fo-chips" style={{ padding: '8px 0 2px' }}>
              {D.levels.map((l) => <Chip key={l} selected={levels.includes(l)} onClick={() => toggleLevel(l)}>{l}</Chip>)}
            </div>
          </div>

          <div className="fo-list-toolbar">
            <span className="ds-mono fo-list-toolbar-meta">{list.length}개의 악보{q ? <span> · ‘{q}’ 검색 결과</span> : null}</span>
            <div className="fo-list-toolbar-sort"><Select size="sm" value={sort} onChange={(e) => setSort(e.target.value)} options={D.sorts} /></div>
          </div>

          {list.length ? (
            <React.Fragment>
              <div className="fo-grid">{visibleList.map((s) => <F.SheetCard key={s.id} s={s} />)}</div>
              {hasMore ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 28 }}>
                  <Button variant="secondary" size="md" iconRight="chevron-down" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>더보기</Button>
                </div>
              ) : null}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <F.Empty icon="search" title="검색 결과가 없습니다" sub="다른 검색어나 필터로 다시 시도해보세요." action="필터 초기화" onAction={reset} />
              <F.SectionHeader title="이런 악보는 어때요?" />
              <div className="fo-grid">{reco.map((s) => <F.SheetCard key={s.id} s={s} />)}</div>
            </React.Fragment>
          )}
        </div>
      </div>
    </F.Scaffold>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<ListPage />);
});
