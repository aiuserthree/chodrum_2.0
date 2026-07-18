/* BO-09 통합 검색 — 악보 · 주문 · 회원 · 비회원 주문 한 화면 결과 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Card, Badge, Icon } = DS;
const B = window.BO;
const A = window.AdminData;
const D = window.DrumData;

const STATUS_TONE = { 판매중: 'success', 판매중지: 'warning', 숨김: 'neutral' };
const M_TONE = { 정상: 'success', 정지: 'warning', 탈퇴: 'neutral' };

const matchQ = (value, qLower) => String(value || '').toLowerCase().includes(qLower);

const amountOf = (o) => o.items.reduce((n, it) => {
  const sheet = D.byId(it.id);
  const unit = it.price != null ? it.price : (sheet ? sheet.price : 0);
  return n + unit * it.qty;
}, 0);

function searchAll(raw) {
  const qLower = String(raw || '').trim().toLowerCase();
  if (!qLower) {
    return { qLower: '', sheets: [], memberOrders: [], members: [], guestOrders: [] };
  }

  const sheets = D.sheets.filter((s, i) => {
    const code = s.code || ('DS-' + (1042 - i));
    return matchQ(s.title, qLower) || matchQ(s.artist, qLower) ||
      matchQ(s.id, qLower) || matchQ(code, qLower);
  }).map((s, i) => ({
    ...s,
    code: s.code || ('DS-' + (1042 - i)),
    status: s.status || A.sheetStatus[s.id] || '판매중',
  }));

  const memberOrders = A.orders.filter((o) =>
    o.member && [o.no, o.buyer, o.email].some((v) => matchQ(v, qLower)));

  const members = A.members.filter((m) =>
    matchQ(m.name, qLower) || matchQ(m.email, qLower));

  const guestOrders = A.orders.filter((o) =>
    !o.member && [o.no, o.buyer, o.email].some((v) => matchQ(v, qLower)));

  return { qLower, sheets, memberOrders, members, guestOrders };
}

function SectionEmpty({ text }) {
  return (
    <p style={{ padding: '0 18px 18px', fontSize: 13, color: 'var(--text-secondary)' }}>{text}</p>
  );
}

function SearchPage() {
  const q = B.qp('q');
  const { qLower, sheets, memberOrders, members, guestOrders } = searchAll(q);
  const total = sheets.length + memberOrders.length + members.length + guestOrders.length;
  const title = q ? '통합 검색 · 「' + q + '」' : '통합 검색';
  const encQ = encodeURIComponent(q);

  return (
    <B.Shell active="search" title={title}>
      <div data-screen-label="BO-09 통합 검색" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!qLower ? (
          <Card padding={24} style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--color-icon)', marginBottom: 10 }}><Icon name="search" size={28} /></div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>검색어를 입력해주세요</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.55 }}>
              상단 검색창에서 주문번호, 회원 이메일, 악보 곡명 등을 입력하면<br />악보 · 주문 · 회원 결과를 한 번에 볼 수 있어요.
            </p>
          </Card>
        ) : total === 0 ? (
          <Card padding={24} style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--color-icon)', marginBottom: 10 }}><Icon name="search-x" size={28} /></div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>「{q}」에 대한 결과가 없어요</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.55 }}>
              검색어 오타를 확인하거나, 다른 키워드로 다시 검색해주세요.
            </p>
          </Card>
        ) : (
          <React.Fragment>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              총 <span style={B.mono}>{total}</span>건 · 악보 {sheets.length} · 주문 {memberOrders.length} · 회원 {members.length}
              {guestOrders.length ? ' · 비회원 주문 ' + guestOrders.length : ''}
            </p>

            <Card padding={0}>
              <B.CardHead
                title="악보"
                right={
                  <React.Fragment>
                    <span className="ds-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sheets.length}개</span>
                    {sheets.length ? <Button variant="ghost" size="sm" onClick={() => location.href = '/bo/sheets?q=' + encQ}>전체 보기</Button> : null}
                  </React.Fragment>
                }
              />
              {sheets.length ? (
                <div style={{ padding: 6 }}>
                  <B.Table minWidth={720} head={['곡명 / 아티스트', 'ID', '장르', { l: '가격', r: true }, '상태']}>
                    {sheets.map((s) => (
                      <tr key={s.id} onClick={() => location.href = '/bo/sheets/register?id=' + encodeURIComponent(s.id)} style={{ cursor: 'pointer' }}>
                        <B.Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <B.Thumb />
                            <div>
                              <div style={{ fontWeight: 600 }}>{s.title}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.artist}</div>
                            </div>
                          </div>
                        </B.Td>
                        <B.Td><span style={{ ...B.mono, fontSize: 12, color: 'var(--text-secondary)' }}>{s.code}</span></B.Td>
                        <B.Td><Badge variant="neutral" size="sm">{s.genre}</Badge></B.Td>
                        <B.Td r><span style={B.mono}>{B.won(s.price)}</span></B.Td>
                        <B.Td><Badge variant={STATUS_TONE[s.status]} size="sm">{s.status}</Badge></B.Td>
                      </tr>
                    ))}
                  </B.Table>
                </div>
              ) : (
                <SectionEmpty text="일치하는 악보가 없어요." />
              )}
            </Card>

            <Card padding={0}>
              <B.CardHead
                title="주문"
                right={
                  <React.Fragment>
                    <span className="ds-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{memberOrders.length}건</span>
                    {memberOrders.length ? <Button variant="ghost" size="sm" onClick={() => location.href = '/bo/orders?q=' + encQ}>전체 보기</Button> : null}
                  </React.Fragment>
                }
              />
              {memberOrders.length ? (
                <div style={{ padding: 6 }}>
                  <B.Table minWidth={760} head={['주문번호', '주문자', '상품', { l: '금액', r: true }, '상태', { l: '시간', r: true }]}>
                    {memberOrders.map((o) => (
                      <tr key={o.no} onClick={() => location.href = '/bo/orders?q=' + encodeURIComponent(o.no)} style={{ cursor: 'pointer' }}>
                        <B.Td><span style={{ ...B.mono, fontSize: 12 }}>{o.no}</span></B.Td>
                        <B.Td>
                          <div style={{ fontWeight: 500 }}>{o.buyer}</div>
                          <div style={{ ...B.mono, fontSize: 11, color: 'var(--text-secondary)' }}>{o.email}</div>
                        </B.Td>
                        <B.Td><span style={{ color: 'var(--text-secondary)' }}>{(D.byId(o.items[0].id) || { title: o.items[0].id }).title}{o.items.length > 1 ? ' 외 ' + (o.items.length - 1) + '건' : ''}</span></B.Td>
                        <B.Td r><span style={B.mono}>{B.won(amountOf(o))}</span></B.Td>
                        <B.Td><Badge variant={B.ORDER_TONE[o.status]} size="sm">{o.status}</Badge></B.Td>
                        <B.Td r><span style={{ ...B.mono, fontSize: 12, color: 'var(--text-secondary)' }}>{o.date}</span></B.Td>
                      </tr>
                    ))}
                  </B.Table>
                </div>
              ) : (
                <SectionEmpty text="일치하는 회원 주문이 없어요." />
              )}
            </Card>

            <Card padding={0}>
              <B.CardHead
                title="회원"
                right={
                  <React.Fragment>
                    <span className="ds-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{members.length}명</span>
                    {members.length ? <Button variant="ghost" size="sm" onClick={() => location.href = '/bo/members?q=' + encQ}>전체 보기</Button> : null}
                  </React.Fragment>
                }
              />
              {members.length ? (
                <div style={{ padding: 6 }}>
                  <B.Table minWidth={640} head={['회원', '이메일', '가입유형', '가입일', '상태']}>
                    {members.map((m) => (
                      <tr key={m.email} onClick={() => location.href = '/bo/members?q=' + encodeURIComponent(m.email)} style={{ cursor: 'pointer' }}>
                        <B.Td><span style={{ fontWeight: 600 }}>{m.name}</span></B.Td>
                        <B.Td><span style={{ ...B.mono, fontSize: 12, color: 'var(--text-secondary)' }}>{m.email}</span></B.Td>
                        <B.Td><Badge variant={m.type === '이메일' ? 'neutral' : 'outline'} size="sm">{m.type}</Badge></B.Td>
                        <B.Td><span style={{ ...B.mono, fontSize: 12 }}>{m.joined}</span></B.Td>
                        <B.Td><Badge variant={M_TONE[m.status]} size="sm">{m.status}</Badge></B.Td>
                      </tr>
                    ))}
                  </B.Table>
                </div>
              ) : (
                <SectionEmpty text="일치하는 회원이 없어요." />
              )}
            </Card>

            {guestOrders.length ? (
              <Card padding={0}>
                <B.CardHead
                  title="비회원 주문"
                  right={
                    <React.Fragment>
                      <span className="ds-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{guestOrders.length}건</span>
                      <Button variant="ghost" size="sm" onClick={() => location.href = '/bo/members?q=' + encQ}>비회원 조회</Button>
                    </React.Fragment>
                  }
                />
                <div style={{ padding: 6 }}>
                  <B.Table minWidth={760} head={['주문번호', '이메일', '상품', { l: '금액', r: true }, '상태', { l: '시간', r: true }]}>
                    {guestOrders.map((o) => (
                      <tr key={o.no} onClick={() => location.href = '/bo/members?q=' + encodeURIComponent(o.email)} style={{ cursor: 'pointer' }}>
                        <B.Td><span style={{ ...B.mono, fontSize: 12 }}>{o.no}</span></B.Td>
                        <B.Td><span style={{ ...B.mono, fontSize: 12, color: 'var(--text-secondary)' }}>{o.email}</span></B.Td>
                        <B.Td><span style={{ color: 'var(--text-secondary)' }}>{(D.byId(o.items[0].id) || { title: o.items[0].id }).title}{o.items.length > 1 ? ' 외 ' + (o.items.length - 1) + '건' : ''}</span></B.Td>
                        <B.Td r><span style={B.mono}>{B.won(amountOf(o))}</span></B.Td>
                        <B.Td><Badge variant={B.ORDER_TONE[o.status]} size="sm">{o.status}</Badge></B.Td>
                        <B.Td r><span style={{ ...B.mono, fontSize: 12, color: 'var(--text-secondary)' }}>{o.date}</span></B.Td>
                      </tr>
                    ))}
                  </B.Table>
                </div>
              </Card>
            ) : null}
          </React.Fragment>
        )}
      </div>
    </B.Shell>
  );
}

window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<SearchPage />);
});
