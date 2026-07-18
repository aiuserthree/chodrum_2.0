(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, IconButton, Card, Badge, Icon, Input } = DS;
  const boWon = (v) => "\u20A9" + Number(v).toLocaleString("ko-KR");
  const boMono = { fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" };
  const BO_NAV_MAIN = [
    { k: "dashboard", ic: "layout-dashboard", l: "\uB300\uC2DC\uBCF4\uB4DC", href: "/bo/dashboard" },
    {
      k: "main",
      ic: "house",
      l: "\uBA54\uC778 \uAD00\uB9AC",
      children: [
        { k: "banners", l: "\uBC30\uB108 \uAD00\uB9AC", href: "/bo/banners" },
        { k: "featured", l: "\uCD94\uCC9C \uAD00\uB9AC", href: "/bo/featured" }
      ]
    },
    { k: "sheets", ic: "music", l: "\uC545\uBCF4 \uAD00\uB9AC", href: "/bo/sheets" },
    { k: "register", ic: "upload", l: "\uC545\uBCF4 \uB4F1\uB85D", href: "/bo/sheets/register" },
    { k: "categories", ic: "tag", l: "\uCE74\uD14C\uACE0\uB9AC / \uC7A5\uB974", href: "/bo/categories" },
    { k: "pricing", ic: "banknote", l: "\uAC00\uACA9 \uAD00\uB9AC", href: "/bo/pricing" },
    { k: "orders", ic: "receipt", l: "\uC8FC\uBB38 / \uACB0\uC81C", href: "/bo/orders" },
    { k: "members", ic: "users", l: "\uD68C\uC6D0 \uAD00\uB9AC", href: "/bo/members" },
    { k: "downloads", ic: "download", l: "\uB2E4\uC6B4\uB85C\uB4DC \uAD00\uB9AC", href: "/bo/downloads" },
    { k: "reports", ic: "trending-up", l: "\uD1B5\uACC4 / \uB9AC\uD3EC\uD2B8", href: "/bo/reports" }
  ];
  const BO_NAV_SET = [
    { k: "settings", ic: "settings-2", l: "\uC0AC\uC774\uD2B8 \uC124\uC815", href: "/bo/settings" }
  ];
  const ORDER_TONE = { \uACB0\uC81C\uC644\uB8CC: "success", \uD658\uBD88: "danger", \uCDE8\uC18C: "danger", \uB300\uAE30: "warning" };
  const ENT_TONE = { ACTIVE: "success", EXPIRED: "neutral", REVOKED: "danger" };
  const ENT_LABEL = { ACTIVE: "\uAE30\uAC04 \uB0B4", EXPIRED: "\uB9CC\uB8CC", REVOKED: "\uD68C\uC218" };
  function boToast(msg) {
    let el = document.getElementById("bo-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "bo-toast";
      el.className = "bo-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2e3);
  }
  function boQp(name) {
    return new URLSearchParams(location.search).get(name) || "";
  }
  function boSearchRoute(raw) {
    const q = String(raw || "").trim();
    if (!q) return null;
    return "/bo/search?q=" + encodeURIComponent(q);
  }
  function boLogout() {
    var go = function() {
      location.href = window.ChodrumBoAuth && window.ChodrumBoAuth.LOGIN_PAGE || "/bo/login";
    };
    if (window.ChodrumBoAuth && typeof window.ChodrumBoAuth.logout === "function") {
      Promise.resolve(window.ChodrumBoAuth.logout()).then(go).catch(go);
    } else {
      go();
    }
  }
  function BOShell({ active, title, actions, children }) {
    const [open, setOpen] = React.useState(false);
    const onGlobalSearch = (e) => {
      e.preventDefault();
      const q = new FormData(e.target).get("q");
      const href = boSearchRoute(q);
      if (href) location.href = href;
    };
    React.useEffect(function() {
      if (window.ChodrumBoAuth && typeof window.ChodrumBoAuth.verifyAdminSession === "function") {
        window.ChodrumBoAuth.verifyAdminSession();
      }
    }, []);
    const NavItem = ({ n }) => {
      if (n.children) {
        const childOn = n.children.some((c) => active === c.k);
        return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", fontSize: 14, fontWeight: childOn ? 600 : 500, color: childOn ? "var(--color-ink)" : "var(--text-secondary)" } }, /* @__PURE__ */ React.createElement(Icon, { name: n.ic, size: 18, style: { color: childOn ? "var(--color-ink)" : "var(--color-icon)" } }), n.l), n.children.map((c) => {
          const on2 = active === c.k;
          return /* @__PURE__ */ React.createElement("a", { key: c.k, href: c.href, style: { display: "block", padding: "7px 12px 7px 40px", borderRadius: "var(--radius-lg)", fontSize: 13.5, fontWeight: on2 ? 600 : 500, background: on2 ? "#f1f1f1" : "transparent", color: on2 ? "var(--color-ink)" : "var(--text-secondary)", textDecoration: "none" } }, c.l);
        }));
      }
      const on = active === n.k;
      return /* @__PURE__ */ React.createElement("a", { href: n.href, style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: "var(--radius-lg)", textAlign: "left", fontSize: 14, fontWeight: on ? 600 : 500, background: on ? "#f1f1f1" : "transparent", color: on ? "var(--color-ink)" : "var(--text-secondary)", textDecoration: "none" } }, /* @__PURE__ */ React.createElement(Icon, { name: n.ic, size: 18, style: { color: on ? "var(--color-ink)" : "var(--color-icon)" } }), n.l);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "bo-layout" }, /* @__PURE__ */ React.createElement("aside", { className: "bo-sidebar" + (open ? " open" : "") }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 16px" } }, /* @__PURE__ */ React.createElement("img", { src: "../shared/logo.png", alt: "CHODRUM \uB85C\uACE0", style: { width: 28, height: 28, objectFit: "contain", display: "block", flex: "none" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, fontWeight: 600, letterSpacing: "-0.4px" } }, "CHODRUM"), /* @__PURE__ */ React.createElement("span", { style: { ...boMono, fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-secondary)" } }, "Admin")), BO_NAV_MAIN.map((n) => /* @__PURE__ */ React.createElement(NavItem, { key: n.k, n })), /* @__PURE__ */ React.createElement("div", { style: { ...boMono, fontSize: 10, letterSpacing: "0.6px", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "18px 12px 6px" } }, "\uC124\uC815"), BO_NAV_SET.map((n) => /* @__PURE__ */ React.createElement(NavItem, { key: n.k, n })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border-default)" } }, /* @__PURE__ */ React.createElement("a", { href: "/home", style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: "var(--radius-lg)", fontSize: 13.5, fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none" } }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", size: 16, style: { color: "var(--color-icon)" } }), "\uC2A4\uD1A0\uC5B4 \uD654\uBA74 \uBCF4\uAE30"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: boLogout,
        style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: "var(--radius-lg)", fontSize: 13.5, fontWeight: 500, color: "var(--text-secondary)", background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "log-out", size: 16, style: { color: "var(--color-icon)" } }),
      "\uB85C\uADF8\uC544\uC6C3"
    ))), /* @__PURE__ */ React.createElement("div", { className: "bo-scrim" + (open ? " open" : ""), onClick: () => setOpen(false) }), /* @__PURE__ */ React.createElement("div", { className: "bo-main" }, /* @__PURE__ */ React.createElement("div", { className: "bo-topbar" }, /* @__PURE__ */ React.createElement("span", { className: "bo-menu-btn" }, /* @__PURE__ */ React.createElement(IconButton, { name: "menu", variant: "ghost", label: "\uBA54\uB274", onClick: () => setOpen(true) })), /* @__PURE__ */ React.createElement("h4", { style: { fontSize: 19, fontWeight: 600, letterSpacing: "-0.5px", whiteSpace: "nowrap" } }, title), /* @__PURE__ */ React.createElement("form", { className: "bo-topsearch", onSubmit: onGlobalSearch }, /* @__PURE__ */ React.createElement(Input, { size: "sm", name: "q", iconLeft: "search", placeholder: "\uC8FC\uBB38\uBC88\uD638, \uD68C\uC6D0, \uC545\uBCF4 \uAC80\uC0C9", defaultValue: boQp("q") })), /* @__PURE__ */ React.createElement("div", { className: "bo-top-right" }, actions, /* @__PURE__ */ React.createElement("span", { style: { width: 34, height: 34, borderRadius: 9999, background: "var(--surface-inverse)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flex: "none" }, title: "\uAD00\uB9AC\uC790" }, "\uAD00"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "bo-logout-btn",
        onClick: boLogout,
        style: { display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: "var(--radius-lg)", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", background: "transparent", border: "1px solid var(--border-default)", cursor: "pointer", flex: "none" }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "log-out", size: 15, style: { color: "var(--color-icon)" } }),
      "\uB85C\uADF8\uC544\uC6C3"
    ))), /* @__PURE__ */ React.createElement("div", { className: "bo-content" }, children)));
  }
  function StatCard({ s }) {
    const up = s.delta >= 0;
    return /* @__PURE__ */ React.createElement(Card, { padding: 18, style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-secondary)" } }, s.k), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--color-icon)" } }, /* @__PURE__ */ React.createElement(Icon, { name: s.ic, size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { ...boMono, fontSize: 24, fontWeight: 600, letterSpacing: "-1px" } }, s.unit === "\u20A9" ? boWon(s.v) : s.v.toLocaleString("ko-KR") + s.unit), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: up ? "var(--status-success)" : "var(--status-danger)", display: "flex", alignItems: "center", gap: 3 } }, /* @__PURE__ */ React.createElement(Icon, { name: up ? "arrow-up-right" : "arrow-down-right", size: 13 }), Math.abs(s.delta), "%", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-tertiary)" } }, "\xA0\uC774\uC804 \uAE30\uAC04 \uB300\uBE44")));
  }
  function BarChart({ data, note, height = 140 }) {
    const rows = data || [];
    if (!rows.length) {
      return /* @__PURE__ */ React.createElement("div", { style: { height, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--text-secondary)" } }, "\uD45C\uC2DC\uD560 \uB370\uC774\uD130\uAC00 \uC5C6\uC5B4\uC694");
    }
    const max = Math.max(...rows.map((r) => r.v), 1);
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 12, height } }, rows.map((r, i) => /* @__PURE__ */ React.createElement("div", { key: r.d, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: 34, height: r.v / max * 100 + "%", background: i === rows.length - 1 ? "var(--color-ink)" : "#e0e0e0", borderRadius: 4, transition: "height 400ms ease" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap" } }, r.d)))), note ? /* @__PURE__ */ React.createElement("div", { style: { ...boMono, fontSize: 11, color: "var(--text-tertiary)", marginTop: 10, textAlign: "right" } }, note) : null);
  }
  function BOTable({ head, children, minWidth = 640 }) {
    return /* @__PURE__ */ React.createElement("div", { className: "bo-tablewrap" }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, head.map((h, i) => /* @__PURE__ */ React.createElement("th", { key: i, style: { textAlign: h && h.r ? "right" : "left", padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)", whiteSpace: "nowrap" } }, h && typeof h === "object" ? h.l || "" : h)))), /* @__PURE__ */ React.createElement("tbody", null, children)));
  }
  function Td({ children, r, style }) {
    return /* @__PURE__ */ React.createElement("td", { style: { padding: "12px", borderBottom: "1px solid var(--border-default)", textAlign: r ? "right" : "left", verticalAlign: "middle", ...style } }, children);
  }
  function Thumb() {
    return /* @__PURE__ */ React.createElement("span", { style: { width: 34, height: 34, borderRadius: 6, border: "1px solid var(--border-default)", background: "#f6f6f6", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#c9c9c9", flex: "none" } }, /* @__PURE__ */ React.createElement(Icon, { name: "music", size: 15 }));
  }
  function BOModal({ open, onClose, title, children, footer, width = 560 }) {
    if (!open) return null;
    return /* @__PURE__ */ React.createElement("div", { className: "bo-modal-scrim", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "bo-modal", style: { maxWidth: width }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border-default)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, fontWeight: 600, letterSpacing: "-0.4px" } }, title), /* @__PURE__ */ React.createElement(IconButton, { name: "x", variant: "ghost", size: "sm", label: "\uB2EB\uAE30", onClick: onClose })), /* @__PURE__ */ React.createElement("div", { style: { padding: 20 } }, children), footer ? /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 20px", borderTop: "1px solid var(--border-default)", display: "flex", justifyContent: "flex-end", gap: 8 } }, footer) : null));
  }
  function Labeled({ label, children, hint }) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 500, color: "var(--text-primary)" } }, label), children, hint ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-secondary)" } }, hint) : null);
  }
  function CardHead({ title, right }) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, title), right);
  }
  function KVRow({ k, v }) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-secondary)" } }, k), v);
  }
  window.BO = { NAV_MAIN: BO_NAV_MAIN, won: boWon, mono: boMono, toast: boToast, qp: boQp, searchRoute: boSearchRoute, ORDER_TONE, ENT_TONE, ENT_LABEL, Shell: BOShell, StatCard, BarChart, Table: BOTable, Td, Thumb, Modal: BOModal, Labeled, CardHead, KVRow };
})();
