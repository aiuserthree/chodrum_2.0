/* BO 공용 크롬 — 사이드바 셸 · 테이블 · 통계 카드 · 모달 (window.BO 로 노출) */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, IconButton, Card, Badge, Icon, Input } = DS;

const boWon = (v) => '₩' + Number(v).toLocaleString('ko-KR');
const boMono = { fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' };

const BO_NAV_MAIN = [
  { k: 'dashboard', ic: 'layout-dashboard', l: '대시보드', href: '/bo/dashboard' },
  {
    k: 'main', ic: 'house', l: '메인 관리', children: [
      { k: 'banners', l: '배너 관리', href: '/bo/banners' },
      { k: 'featured', l: '추천 관리', href: '/bo/featured' },
    ],
  },
  { k: 'sheets', ic: 'music', l: '악보 관리', href: '/bo/sheets' },
  { k: 'register', ic: 'upload', l: '악보 등록', href: '/bo/sheets/register' },
  { k: 'categories', ic: 'tag', l: '카테고리 / 장르', href: '/bo/categories' },
  { k: 'pricing', ic: 'banknote', l: '가격 관리', href: '/bo/pricing' },
  { k: 'orders', ic: 'receipt', l: '주문 / 결제', href: '/bo/orders' },
  { k: 'members', ic: 'users', l: '회원 관리', href: '/bo/members' },
  { k: 'downloads', ic: 'download', l: '다운로드 관리', href: '/bo/downloads' },
  { k: 'reports', ic: 'trending-up', l: '통계 / 리포트', href: '/bo/reports' },
];
const BO_NAV_SET = [
  { k: 'settings', ic: 'settings-2', l: '사이트 설정', href: '/bo/settings' },
];

const ORDER_TONE = { 결제완료: 'success', 환불: 'danger', 취소: 'danger', 대기: 'warning' };
const ENT_TONE = { ACTIVE: 'success', EXPIRED: 'neutral', REVOKED: 'danger' };
const ENT_LABEL = { ACTIVE: '기간 내', EXPIRED: '만료', REVOKED: '회수' };

function boToast(msg) {
  let el = document.getElementById('bo-toast');
  if (!el) { el = document.createElement('div'); el.id = 'bo-toast'; el.className = 'bo-toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2000);
}

function boQp(name) {
  return new URLSearchParams(location.search).get(name) || '';
}

function boSearchRoute(raw) {
  const q = String(raw || '').trim();
  if (!q) return null;
  if (q.includes('@')) return '/bo/members?q=' + encodeURIComponent(q);
  if (/^ORD/i.test(q)) return '/bo/orders?q=' + encodeURIComponent(q);
  return '/bo/sheets?q=' + encodeURIComponent(q);
}

function boLogout() {
  var go = function () {
    location.href = (window.ChodrumBoAuth && window.ChodrumBoAuth.LOGIN_PAGE) || '/bo/login';
  };
  if (window.ChodrumBoAuth && typeof window.ChodrumBoAuth.logout === 'function') {
    Promise.resolve(window.ChodrumBoAuth.logout()).then(go).catch(go);
  } else {
    go();
  }
}

function BOShell({ active, title, actions, children }) {
  const [open, setOpen] = React.useState(false);
  const onGlobalSearch = (e) => {
    e.preventDefault();
    const q = new FormData(e.target).get('q');
    const href = boSearchRoute(q);
    if (href) location.href = href;
  };
  React.useEffect(function () {
    if (window.ChodrumBoAuth && typeof window.ChodrumBoAuth.verifyAdminSession === 'function') {
      window.ChodrumBoAuth.verifyAdminSession();
    }
  }, []);
  const NavItem = ({ n }) => {
    if (n.children) {
      const childOn = n.children.some((c) => active === c.k);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', fontSize: 14, fontWeight: childOn ? 600 : 500, color: childOn ? 'var(--color-ink)' : 'var(--text-secondary)' }}>
            <Icon name={n.ic} size={18} style={{ color: childOn ? 'var(--color-ink)' : 'var(--color-icon)' }} />{n.l}
          </div>
          {n.children.map((c) => {
            const on = active === c.k;
            return (
              <a key={c.k} href={c.href} style={{ display: 'block', padding: '7px 12px 7px 40px', borderRadius: 'var(--radius-lg)', fontSize: 13.5, fontWeight: on ? 600 : 500, background: on ? '#f1f1f1' : 'transparent', color: on ? 'var(--color-ink)' : 'var(--text-secondary)', textDecoration: 'none' }}>{c.l}</a>
            );
          })}
        </div>
      );
    }
    const on = active === n.k;
    return (
      <a href={n.href} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-lg)', textAlign: 'left', fontSize: 14, fontWeight: on ? 600 : 500, background: on ? '#f1f1f1' : 'transparent', color: on ? 'var(--color-ink)' : 'var(--text-secondary)', textDecoration: 'none' }}>
        <Icon name={n.ic} size={18} style={{ color: on ? 'var(--color-ink)' : 'var(--color-icon)' }} />{n.l}
      </a>
    );
  };
  return (
    <div className="bo-layout">
      <aside className={'bo-sidebar' + (open ? ' open' : '')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 16px' }}>
          <img src="../shared/logo.png" alt="CHODRUM 로고" style={{ width: 28, height: 28, objectFit: 'contain', display: 'block', flex: 'none' }} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.4px' }}>CHODRUM</span>
          <span style={{ ...boMono, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Admin</span>
        </div>
        {BO_NAV_MAIN.map((n) => <NavItem key={n.k} n={n} />)}
        <div style={{ ...boMono, fontSize: 10, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '18px 12px 6px' }}>설정</div>
        {BO_NAV_SET.map((n) => <NavItem key={n.k} n={n} />)}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-default)' }}>
          <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 'var(--radius-lg)', fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <Icon name="external-link" size={16} style={{ color: 'var(--color-icon)' }} />스토어 화면 보기
          </a>
          <button
            type="button"
            onClick={boLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-lg)', fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left' }}
          >
            <Icon name="log-out" size={16} style={{ color: 'var(--color-icon)' }} />로그아웃
          </button>
        </div>
      </aside>
      <div className={'bo-scrim' + (open ? ' open' : '')} onClick={() => setOpen(false)}></div>
      <div className="bo-main">
        <div className="bo-topbar">
          <span className="bo-menu-btn"><IconButton name="menu" variant="ghost" label="메뉴" onClick={() => setOpen(true)} /></span>
          <h4 style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>{title}</h4>
          <form className="bo-topsearch" onSubmit={onGlobalSearch}>
            <Input size="sm" name="q" iconLeft="search" placeholder="주문번호, 회원, 악보 검색" defaultValue={boQp('q')} />
          </form>
          <div className="bo-top-right">
            {actions}
            <span style={{ width: 34, height: 34, borderRadius: 9999, background: 'var(--surface-inverse)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flex: 'none' }} title="관리자">관</span>
            <button
              type="button"
              className="bo-logout-btn"
              onClick={boLogout}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', borderRadius: 'var(--radius-lg)', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-default)', cursor: 'pointer', flex: 'none' }}
            >
              <Icon name="log-out" size={15} style={{ color: 'var(--color-icon)' }} />로그아웃
            </button>
          </div>
        </div>
        <div className="bo-content">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ s }) {
  const up = s.delta >= 0;
  return (
    <Card padding={18} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.k}</span>
        <span style={{ color: 'var(--color-icon)' }}><Icon name={s.ic} size={18} /></span>
      </div>
      <div style={{ ...boMono, fontSize: 24, fontWeight: 600, letterSpacing: '-1px' }}>{s.unit === '₩' ? boWon(s.v) : s.v.toLocaleString('ko-KR') + s.unit}</div>
      <div style={{ fontSize: 12, color: up ? 'var(--status-success)' : 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: 3 }}>
        <Icon name={up ? 'arrow-up-right' : 'arrow-down-right'} size={13} />{Math.abs(s.delta)}%<span style={{ color: 'var(--text-tertiary)' }}>&nbsp;이전 기간 대비</span>
      </div>
    </Card>
  );
}

function BarChart({ data, note, height = 140 }) {
  const rows = data || [];
  if (!rows.length) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
        표시할 데이터가 없어요
      </div>
    );
  }
  const max = Math.max(...rows.map((r) => r.v), 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height }}>
        {rows.map((r, i) => (
          <div key={r.d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: 34, height: (r.v / max * 100) + '%', background: i === rows.length - 1 ? 'var(--color-ink)' : '#e0e0e0', borderRadius: 4, transition: 'height 400ms ease' }}></div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.d}</span>
          </div>
        ))}
      </div>
      {note ? <div style={{ ...boMono, fontSize: 11, color: 'var(--text-tertiary)', marginTop: 10, textAlign: 'right' }}>{note}</div> : null}
    </div>
  );
}

function BOTable({ head, children, minWidth = 640 }) {
  return (
    <div className="bo-tablewrap">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth }}>
        <thead>
          <tr>{head.map((h, i) => <th key={i} style={{ textAlign: h && h.r ? 'right' : 'left', padding: '10px 12px', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-default)', whiteSpace: 'nowrap' }}>{h && typeof h === 'object' ? (h.l || '') : h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function Td({ children, r, style }) {
  return <td style={{ padding: '12px', borderBottom: '1px solid var(--border-default)', textAlign: r ? 'right' : 'left', verticalAlign: 'middle', ...style }}>{children}</td>;
}
function Thumb() {
  return <span style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid var(--border-default)', background: '#f6f6f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#c9c9c9', flex: 'none' }}><Icon name="music" size={15} /></span>;
}

function BOModal({ open, onClose, title, children, footer, width = 560 }) {
  if (!open) return null;
  return (
    <div className="bo-modal-scrim" onClick={onClose}>
      <div className="bo-modal" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.4px' }}>{title}</span>
          <IconButton name="x" variant="ghost" size="sm" label="닫기" onClick={onClose} />
        </div>
        <div style={{ padding: 20 }}>{children}</div>
        {footer ? <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div> : null}
      </div>
    </div>
  );
}

function Labeled({ label, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
      {children}
      {hint ? <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{hint}</span> : null}
    </div>
  );
}

function CardHead({ title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
      {right}
    </div>
  );
}

function KVRow({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 14 }}>
      <span style={{ color: 'var(--text-secondary)' }}>{k}</span>{v}
    </div>
  );
}

window.BO = { NAV_MAIN: BO_NAV_MAIN, won: boWon, mono: boMono, toast: boToast, qp: boQp, searchRoute: boSearchRoute, ORDER_TONE, ENT_TONE, ENT_LABEL, Shell: BOShell, StatCard, BarChart, Table: BOTable, Td, Thumb, Modal: BOModal, Labeled, CardHead, KVRow };
