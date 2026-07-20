/* BO-02-04 가격 관리 — 정가/판매가 · 할인율 · 선택 항목 일괄 할인 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Card, Badge, Input, Checkbox } = DS;
const B = window.BO;
const D = window.DrumData;

const PAGE_SIZE = 20;

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

function priceInput(value, onChange) {
  return (
    <input type="number" value={value} onChange={onChange}
      style={{ width: 92, padding: '7px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'right', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--surface-card)', color: 'var(--text-primary)', outline: 'none' }}
      onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px var(--focus-ring)'}
      onBlur={(e) => e.target.style.boxShadow = 'none'} />
  );
}

function PricingPage() {
  const [rows, setRows] = React.useState(D.sheets.map((s) => ({ id: s.id, title: s.title, artist: s.artist, orig: s.orig || s.price, price: s.price })));
  const [sel, setSel] = React.useState([]);
  const [pct, setPct] = React.useState('10');
  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const allOn = pageRows.length > 0 && pageRows.every((r) => sel.includes(r.id));
  const pages = pageWindow(safePage, totalPages, 5);

  React.useEffect(() => { if (page !== safePage) setPage(safePage); }, [page, safePage]);

  const setRow = (id, patch) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, ...patch } : r));

  const applyDiscount = () => {
    const p = Math.min(90, Math.max(0, Number(pct) || 0));
    setRows((rs) => rs.map((r) => sel.includes(r.id) ? { ...r, price: Math.round(r.orig * (1 - p / 100) / 100) * 100 } : r));
    B.toast(sel.length + '개 악보에 ' + p + '% 할인을 적용했어요');
  };

  return (
    <B.Shell active="pricing" title="가격 관리"
      actions={<Button variant="primary" size="sm" iconLeft="check" onClick={() => B.toast('가격 변경사항을 저장했어요')}>저장</Button>}>
      <div data-screen-label="BO-02-04 가격 관리" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card padding={12} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{sel.length ? sel.length + '개 선택' : '일괄 할인'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="number" value={pct} onChange={(e) => setPct(e.target.value)} style={{ width: 64, padding: '7px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'right', border: '1px solid var(--border-default)', borderRadius: 8, outline: 'none' }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>% 할인</span>
          </div>
          <Button variant="secondary" size="sm" disabled={!sel.length} onClick={applyDiscount}>선택 항목에 적용</Button>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>정가 기준으로 계산되고 100원 단위로 반올림돼요.</span>
        </Card>

        <Card padding={0}>
          <div style={{ padding: 6 }}>
            <B.Table minWidth={720} head={[{ l: '' }, '곡명 / 아티스트', { l: '정가', r: true }, { l: '판매가', r: true }, { l: '할인율', r: true }, '표시']}>
              {pageRows.map((r) => {
                const disc = r.orig > r.price ? Math.round((1 - r.price / r.orig) * 100) : 0;
                return (
                  <tr key={r.id}>
                    <B.Td style={{ width: 40 }}><Checkbox checked={sel.includes(r.id)} onChange={(on) => setSel(on ? [...sel, r.id] : sel.filter((x) => x !== r.id))} /></B.Td>
                    <B.Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <B.Thumb />
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.artist}</div>
                        </div>
                      </div>
                    </B.Td>
                    <B.Td r>{priceInput(r.orig, (e) => setRow(r.id, { orig: Number(e.target.value) || 0 }))}</B.Td>
                    <B.Td r>{priceInput(r.price, (e) => setRow(r.id, { price: Number(e.target.value) || 0 }))}</B.Td>
                    <B.Td r><span style={{ ...B.mono, fontSize: 13, color: disc ? 'var(--status-danger)' : 'var(--text-tertiary)' }}>{disc ? '-' + disc + '%' : '—'}</span></B.Td>
                    <B.Td>{disc ? <Badge variant="danger" size="sm">할인중</Badge> : <Badge variant="neutral" size="sm">정가</Badge>}</B.Td>
                  </tr>
                );
              })}
            </B.Table>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid var(--border-default)' }}>
            <Checkbox
              checked={allOn}
              indeterminate={pageRows.some((r) => sel.includes(r.id)) && !allOn}
              label="전체 선택"
              onChange={(on) => {
                const ids = pageRows.map((r) => r.id);
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

        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>할인 중인 악보는 스토어에 정가와 할인가가 함께 표시돼요.</p>
      </div>
    </B.Shell>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<PricingPage />);
});
