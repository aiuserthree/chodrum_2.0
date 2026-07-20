/* BO-03 주문/결제 관리 — 회원/비회원 필터 · 주문 상세 · 환불 처리(권한 회수 연동) */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Card, Badge, Chip, Select, Checkbox, Input, Icon } = DS;
const B = window.BO;
const A = window.AdminData;
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

const amountOf = (o) => o.items.reduce((n, it) => {
  const sheet = D.byId(it.id);
  const unit = it.price != null ? it.price : (sheet ? sheet.price : 0);
  return n + unit * it.qty;
}, 0);

function OrdersPage() {
  const [orders, setOrders] = React.useState(A.orders);
  const [q, setQ] = React.useState(B.qp('q'));
  const [f, setF] = React.useState('전체');
  const [type, setType] = React.useState('전체');
  const [page, setPage] = React.useState(1);
  const [cur, setCur] = React.useState(null); /* 상세 모달 대상 */
  const [refunding, setRefunding] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [revoke, setRevoke] = React.useState(true);

  const qLower = q.trim().toLowerCase();
  const rows = orders.filter((o) =>
    (f === '전체' || o.status === f) &&
    (type === '전체' || (type === '회원' ? o.member : !o.member)) &&
    (!qLower || [o.no, o.buyer, o.email].some((v) => String(v || '').toLowerCase().includes(qLower))));
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pages = pageWindow(safePage, totalPages, 5);

  React.useEffect(() => { setPage(1); }, [q, f, type]);
  React.useEffect(() => { if (page !== safePage) setPage(safePage); }, [page, safePage]);

  const openDetail = (o) => { setCur(o); setRefunding(false); setReason(''); setRevoke(true); };
  const setStatus = async (no, status) => {
    setOrders((os) => os.map((o) => o.no === no ? { ...o, status } : o));
    setCur((c) => c && c.no === no ? { ...c, status } : c);
    try { await window.ChodrumAPI.orders.updateStatus(no, status, { revoke }); }
    catch (e) { console.warn(e); B.toast('상태 동기화 실패'); }
  };
  const doRefund = async () => {
    await setStatus(cur.no, '환불');
    B.toast('환불 완료' + (revoke ? ' · 다운로드 권한을 회수했어요' : ''));
    setRefunding(false);
  };

  return (
    <B.Shell active="orders" title="주문 / 결제 관리">
      <div data-screen-label="BO-03 주문/결제 관리" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="bo-toolbar">
          <div style={{ width: 240, maxWidth: '100%' }}><Input size="sm" iconLeft="search" placeholder="주문번호 / 주문자 / 이메일" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['전체', '결제완료', '대기', '취소', '환불'].map((x) => <Chip key={x} selected={f === x} onClick={() => setF(x)}>{x}</Chip>)}
          </div>
          <div style={{ width: 130, marginLeft: 'auto' }}><Select size="sm" value={type} onChange={(e) => setType(e.target.value)} options={['전체', '회원', '비회원']} /></div>
          <span className="ds-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{rows.length}건</span>
        </div>

        <Card padding={0}>
          <div style={{ padding: 6 }}>
            <B.Table minWidth={860} head={['주문번호', '주문자', '유형', '상품', '결제수단', { l: '금액', r: true }, '상태', { l: '시간', r: true }]}>
              {pageRows.map((o) => (
                <tr key={o.no} onClick={() => openDetail(o)} style={{ cursor: 'pointer' }}>
                  <B.Td><span style={{ ...B.mono, fontSize: 12 }}>{o.no}</span></B.Td>
                  <B.Td>
                    <div style={{ fontWeight: 500 }}>{o.buyer}</div>
                    <div style={{ ...B.mono, fontSize: 11, color: 'var(--text-secondary)' }}>{o.email}</div>
                  </B.Td>
                  <B.Td><Badge variant={o.member ? 'outline' : 'neutral'} size="sm">{o.member ? '회원' : '비회원'}</Badge></B.Td>
                  <B.Td><span style={{ color: 'var(--text-secondary)' }}>{(D.byId(o.items[0].id) || { title: o.items[0].id }).title}{o.items.length > 1 ? ' 외 ' + (o.items.length - 1) + '건' : ''}</span></B.Td>
                  <B.Td>{o.method}</B.Td>
                  <B.Td r><span style={B.mono}>{B.won(amountOf(o))}</span></B.Td>
                  <B.Td><Badge variant={B.ORDER_TONE[o.status]} size="sm">{o.status}</Badge></B.Td>
                  <B.Td r><span style={{ ...B.mono, fontSize: 12, color: 'var(--text-secondary)' }}>{o.date}</span></B.Td>
                </tr>
              ))}
            </B.Table>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 18px', borderTop: '1px solid var(--border-default)' }}>
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
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>행을 클릭하면 주문 상세와 환불 처리를 진행할 수 있어요. 결제 실패 주문은 장바구니가 유지된 상태로 재결제를 유도해요.</p>
      </div>

      {/* 주문 상세 모달 (BO-03) */}
      <B.Modal open={!!cur} onClose={() => setCur(null)} title={cur ? '주문 상세' : ''} width={600}
        footer={cur ? (
          refunding ? (
            <React.Fragment>
              <Button variant="secondary" size="sm" onClick={() => setRefunding(false)}>취소</Button>
              <Button variant="primary" size="sm" disabled={!reason.trim()} onClick={doRefund}>환불 확정</Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {cur.status === '결제완료' ? <Button variant="secondary" size="sm" onClick={() => setRefunding(true)}>환불 처리</Button> : null}
              <Button variant="primary" size="sm" onClick={() => setCur(null)}>닫기</Button>
            </React.Fragment>
          )
        ) : null}>
        {cur ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <B.KVRow k="주문번호" v={<span style={{ ...B.mono, fontSize: 13 }}>{cur.no}</span>} />
              <B.KVRow k="주문자" v={<span style={{ fontWeight: 500 }}>{cur.buyer} <Badge variant={cur.member ? 'outline' : 'neutral'} size="sm">{cur.member ? '회원' : '비회원'}</Badge></span>} />
              <B.KVRow k="이메일" v={<span style={{ ...B.mono, fontSize: 12.5 }}>{cur.email}</span>} />
              <B.KVRow k="결제수단 / 일시" v={<span style={{ fontSize: 13.5 }}>{cur.method} · <span style={B.mono}>{cur.date}</span></span>} />
            </div>
            <hr style={{ height: 1, background: 'var(--border-default)', border: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cur.items.map((it) => {
                const s = D.byId(it.id);
                return <B.KVRow key={it.id} k={<span style={{ color: 'var(--text-primary)' }}>{s.title} ×{it.qty}</span>} v={<span style={B.mono}>{B.won(s.price * it.qty)}</span>} />;
              })}
              <B.KVRow k={<b style={{ color: 'var(--text-primary)' }}>총 결제금액</b>} v={<span style={{ ...B.mono, fontSize: 16, fontWeight: 600 }}>{B.won(amountOf(cur))}</span>} />
            </div>
            <hr style={{ height: 1, background: 'var(--border-default)', border: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 'none' }}>결제 상태</span>
              <div style={{ width: 140 }}>
                <Select size="sm" value={cur.status} onChange={(e) => { setStatus(cur.no, e.target.value); B.toast('상태를 「' + e.target.value + '」로 변경했어요'); }} options={['결제완료', '대기', '취소', '환불']} />
              </div>
              <Badge variant={B.ORDER_TONE[cur.status]} size="sm">{cur.status}</Badge>
            </div>

            {refunding ? (
              <div style={{ padding: 14, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>환불 처리</span>
                <Input label="환불 사유 (필수)" placeholder="예: 구매자 요청 — 중복 구매" value={reason} onChange={(e) => setReason(e.target.value)} />
                <Checkbox checked={revoke} onChange={setRevoke} label="다운로드 권한 즉시 회수 (REVOKED)" />
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>권한을 회수하면 구매자 화면에서 다운로드 버튼이 즉시 비활성화되고, 환불 안내 메일이 발송돼요.</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </B.Modal>
    </B.Shell>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<OrdersPage />);
});
