/* BO-01 대시보드 — 매출(일/주/월) · 신규 가입 · 주문/결제 현황 · 인기 악보 통계 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Card, Badge, Chip } = DS;
const B = window.BO;
const A = window.AdminData;
const D = window.DrumData;

function Dashboard() {
  const [period, setPeriod] = React.useState('일');
  const stats = A.statsByPeriod[period] || [];
  const rev = A.revenue[period] || [];
  const top = [...D.sheets].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const maxSold = top.length ? top[0].sold : 1;

  return (
    <B.Shell active="dashboard" title="대시보드">
      <div data-screen-label="BO-01 대시보드" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {['일', '주', '월'].map((p) => <Chip key={p} selected={period === p} onClick={() => setPeriod(p)}>{p}간</Chip>)}
          <span className="ds-mono" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>2026.07.13 기준</span>
        </div>

        <div className="bo-stats">{stats.map((s) => <B.StatCard key={s.k} s={s} />)}</div>

        <div className="bo-dash-row">
          <Card padding={0}>
            <B.CardHead title={period + '간 매출'} right={<span className="ds-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>단위: 만원</span>} />
            <div style={{ padding: '4px 20px 20px' }}><B.BarChart data={rev} /></div>
          </Card>
          <Card padding={0}>
            <B.CardHead title="인기 악보 TOP 5" right={<a href="/bo/reports" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>리포트</a>} />
            <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {top.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="ds-mono" style={{ width: 18, fontSize: 13, fontWeight: 600, color: i === 0 ? 'var(--color-ink)' : 'var(--text-tertiary)' }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                    <div style={{ height: 4, background: '#efefef', borderRadius: 9999, marginTop: 6, overflow: 'hidden' }}>
                      <div style={{ width: (s.sold / maxSold * 100) + '%', height: '100%', background: i === 0 ? 'var(--color-ink)' : '#d4d4d4', borderRadius: 9999 }}></div>
                    </div>
                  </div>
                  <span className="ds-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.sold.toLocaleString('ko-KR')}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card padding={0}>
          <B.CardHead title="최근 주문" right={<Button variant="ghost" size="sm" iconRight="chevron-right" onClick={() => location.href = '/bo/orders'}>전체보기</Button>} />
          <div style={{ padding: '0 6px 6px' }}>
            <B.Table head={['주문번호', '주문자', '상품', { l: '금액', r: true }, '상태', { l: '시간', r: true }]}>
              {A.orders.slice(0, 5).map((o) => {
                const label = D.byId(o.items[0].id).title + (o.items.length > 1 ? ' 외 ' + (o.items.length - 1) + '건' : '');
                const amount = o.items.reduce((n, it) => n + D.byId(it.id).price * it.qty, 0);
                return (
                  <tr key={o.no}>
                    <B.Td><span style={{ ...B.mono, fontSize: 12 }}>{o.no}</span></B.Td>
                    <B.Td>{o.buyer}</B.Td>
                    <B.Td><span style={{ color: 'var(--text-secondary)' }}>{label}</span></B.Td>
                    <B.Td r><span style={B.mono}>{B.won(amount)}</span></B.Td>
                    <B.Td><Badge variant={B.ORDER_TONE[o.status]} size="sm">{o.status}</Badge></B.Td>
                    <B.Td r><span style={{ ...B.mono, fontSize: 12, color: 'var(--text-secondary)' }}>{o.date}</span></B.Td>
                  </tr>
                );
              })}
            </B.Table>
          </div>
        </Card>
      </div>
    </B.Shell>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<Dashboard />);
});
