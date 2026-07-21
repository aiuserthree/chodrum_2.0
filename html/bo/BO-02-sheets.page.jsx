/* BO-02-02/05 악보 목록 — 검색/필터 · 일괄 상태 변경 · 수정/삭제 · 노출 관리 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, IconButton, Card, Badge, Chip, Select, Input, Checkbox } = DS;
const B = window.BO;
const A = window.AdminData;
const D = window.DrumData;

const STATUS_TONE = { 판매중: 'success', 판매중지: 'warning', 숨김: 'neutral' };
const PAGE_SIZE = 20;
const SORT_OPTIONS = ['최신순', '이름 오름차순', '이름 내림차순'];

function pageWindow(cur, total, span) {
  if (total <= 1) return [1];
  const half = Math.floor(span / 2);
  let start = Math.max(1, cur - half);
  let end = Math.min(total, start + span - 1);
  start = Math.max(1, end - span + 1);
  const pages = [];
  for (let n = start; n <= end; n++) pages.push(n);
  return pages;
}

function SheetsPage() {
  const [rows, setRows] = React.useState(D.sheets.map((s, i) => ({
    ...s,
    code: s.code || ('DS-' + (1042 - i)),
    status: s.status || A.sheetStatus[s.id] || '판매중',
  })));
  const [q, setQ] = React.useState(B.qp('q'));
  const [genre, setGenre] = React.useState('전체');
  const [status, setStatus] = React.useState('전체');
  const [sel, setSel] = React.useState([]);
  const [bulk, setBulk] = React.useState('판매중');
  const [sort, setSort] = React.useState('최신순');
  const [page, setPage] = React.useState(1);

  const sheetTime = (s) => {
    const raw = s.createdAt || s.created_at;
    if (raw) {
      const t = new Date(raw).getTime();
      if (!Number.isNaN(t)) return t;
    }
    if (typeof s.id === 'string' && /^s\d+$/.test(s.id)) return Number(s.id.slice(1)) || 0;
    return 0;
  };
  const qCompact = String(q || '').toLowerCase().replace(/\s+/g, '');
  const list = rows.filter((s) =>
    (genre === '전체' || s.genre === genre) &&
    (status === '전체' || s.status === status) &&
    (!qCompact || (s.title + s.artist).toLowerCase().replace(/\s+/g, '').includes(qCompact))
  ).sort((a, b) => {
    if (sort === '이름 오름차순') return String(a.title || '').localeCompare(String(b.title || ''), 'ko');
    if (sort === '이름 내림차순') return String(b.title || '').localeCompare(String(a.title || ''), 'ko');
    return sheetTime(b) - sheetTime(a);
  });
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const allOn = pageRows.length > 0 && pageRows.every((s) => sel.includes(s.id));
  const pages = pageWindow(safePage, totalPages, 5);

  React.useEffect(() => { setPage(1); }, [q, genre, status, sort]);
  React.useEffect(() => { if (page !== safePage) setPage(safePage); }, [page, safePage]);

  const setRow = (id, patch) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, ...patch } : r));
  const applyBulk = async () => {
    setRows((rs) => rs.map((r) => sel.includes(r.id) ? { ...r, status: bulk } : r));
    try { await window.ChodrumAPI.sheets.setStatus(sel, bulk); B.toast(sel.length + '개 악보를 「' + bulk + '」 상태로 변경했어요'); }
    catch (e) { console.warn(e); B.toast('상태 변경 저장 실패'); }
    setSel([]);
  };
  const removeSel = async () => {
    const ids = sel.slice();
    setRows((rs) => rs.filter((r) => !sel.includes(r.id)));
    try { await window.ChodrumAPI.sheets.remove(ids); B.toast(ids.length + '개 악보를 삭제했어요'); }
    catch (e) { console.warn(e); B.toast('삭제 동기화 실패'); }
    setSel([]);
  };
  const toggleStatus = async (s) => {
    const next = s.status === '판매중' ? '숨김' : '판매중';
    setRow(s.id, { status: next });
    try { await window.ChodrumAPI.sheets.setStatus([s.id], next); B.toast('「' + s.title + '」 → ' + next); }
    catch (e) { console.warn(e); B.toast('상태 변경 실패'); }
  };
  const removeOne = async (id) => {
    setRows((rs) => rs.filter((r) => r.id !== id));
    try { await window.ChodrumAPI.sheets.remove([id]); B.toast('삭제했어요'); }
    catch (e) { console.warn(e); B.toast('삭제 실패'); }
  };

  return (
    <B.Shell active="sheets" title="악보 관리" actions={<Button variant="primary" size="sm" iconLeft="plus" onClick={() => location.href = '/bo/sheets/register'}>악보 등록</Button>}>
      <div data-screen-label="BO-02 악보 관리" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="bo-toolbar">
          <div style={{ width: 240, maxWidth: '100%' }}><Input size="sm" iconLeft="search" placeholder="곡명 / 아티스트" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div style={{ width: 140 }}><Select size="sm" value={genre} onChange={(e) => setGenre(e.target.value)} options={['전체', ...D.genres]} /></div>
          <div style={{ width: 130 }}><Select size="sm" value={status} onChange={(e) => setStatus(e.target.value)} options={['전체', '판매중', '판매중지', '숨김']} /></div>
          <div style={{ width: 140 }}><Select size="sm" value={sort} onChange={(e) => setSort(e.target.value)} options={SORT_OPTIONS} /></div>
          <span className="ds-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>{list.length}개</span>
        </div>

        {sel.length ? (
          <Card padding={12} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{sel.length}개 선택</span>
            <div style={{ width: 130 }}><Select size="sm" value={bulk} onChange={(e) => setBulk(e.target.value)} options={['판매중', '판매중지', '숨김']} /></div>
            <Button variant="secondary" size="sm" onClick={applyBulk}>일괄 상태 변경</Button>
            <Button variant="ghost" size="sm" iconLeft="trash-2" onClick={removeSel}>삭제</Button>
            <Button variant="ghost" size="sm" onClick={() => setSel([])}>선택 해제</Button>
          </Card>
        ) : null}

        <Card padding={0}>
          <div style={{ padding: 6 }}>
            <B.Table minWidth={860} head={[{ l: '' }, '곡명 / 아티스트', 'ID', '장르', '난이도', { l: '가격', r: true }, { l: '판매', r: true }, '상태', '']}>
              {pageRows.map((s) => (
                <tr key={s.id}>
                  <B.Td style={{ width: 40 }}><Checkbox checked={sel.includes(s.id)} onChange={(on) => setSel(on ? [...sel, s.id] : sel.filter((x) => x !== s.id))} /></B.Td>
                  <B.Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <B.Thumb />
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.artist} · {s.pages}p</div>
                      </div>
                    </div>
                  </B.Td>
                  <B.Td><span style={{ ...B.mono, fontSize: 12, color: 'var(--text-secondary)' }}>{s.code}</span></B.Td>
                  <B.Td><Badge variant="neutral" size="sm">{s.genre}</Badge></B.Td>
                  <B.Td><Badge variant="outline" size="sm">{s.level}</Badge></B.Td>
                  <B.Td r><span style={B.mono}>{B.won(s.price)}</span></B.Td>
                  <B.Td r><span style={B.mono}>{s.sold.toLocaleString('ko-KR')}</span></B.Td>
                  <B.Td><Badge variant={STATUS_TONE[s.status]} size="sm">{s.status}</Badge></B.Td>
                  <B.Td>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <IconButton name="pencil" variant="ghost" size="sm" label="수정" onClick={() => location.href = '/bo/sheets/register?id=' + encodeURIComponent(s.id)} />
                      <IconButton name={s.status === '판매중' ? 'eye-off' : 'eye'} variant="ghost" size="sm" label="노출 전환"
                        onClick={() => toggleStatus(s)} />
                      <IconButton name="trash-2" variant="ghost" size="sm" label="삭제" onClick={() => removeOne(s.id)} />
                    </div>
                  </B.Td>
                </tr>
              ))}
            </B.Table>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid var(--border-default)' }}>
            <Checkbox
              checked={allOn}
              indeterminate={pageRows.some((s) => sel.includes(s.id)) && !allOn}
              label="전체 선택"
              onChange={(on) => {
                const ids = pageRows.map((s) => s.id);
                setSel(on ? Array.from(new Set([...sel, ...ids])) : sel.filter((id) => !ids.includes(id)));
              }}
            />
            <div className="ds-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 12, alignItems: 'center', userSelect: 'none' }}>
              <span
                role="button"
                tabIndex={0}
                aria-label="이전 페이지"
                style={{ cursor: safePage > 1 ? 'pointer' : 'default', opacity: safePage > 1 ? 1 : 0.35 }}
                onClick={() => safePage > 1 && setPage(safePage - 1)}
                onKeyDown={(e) => e.key === 'Enter' && safePage > 1 && setPage(safePage - 1)}
              >‹</span>
              {pages.map((n) => (
                <span
                  key={n}
                  role="button"
                  tabIndex={0}
                  aria-current={n === safePage ? 'page' : undefined}
                  style={{
                    cursor: 'pointer',
                    fontWeight: n === safePage ? 600 : 400,
                    color: n === safePage ? 'var(--color-ink)' : undefined,
                  }}
                  onClick={() => setPage(n)}
                  onKeyDown={(e) => e.key === 'Enter' && setPage(n)}
                >{n}</span>
              ))}
              <span
                role="button"
                tabIndex={0}
                aria-label="다음 페이지"
                style={{ cursor: safePage < totalPages ? 'pointer' : 'default', opacity: safePage < totalPages ? 1 : 0.35 }}
                onClick={() => safePage < totalPages && setPage(safePage + 1)}
                onKeyDown={(e) => e.key === 'Enter' && safePage < totalPages && setPage(safePage + 1)}
              >›</span>
            </div>
          </div>
        </Card>

        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>판매중지 · 숨김 상태의 악보는 스토어에 노출되지 않지만, 이미 구매한 사용자의 다운로드 권한은 유지돼요.</p>
      </div>
    </B.Shell>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<SheetsPage />);
});
