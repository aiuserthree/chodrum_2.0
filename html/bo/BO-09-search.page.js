(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Card, Badge, Icon } = DS;
  const B = window.BO;
  const A = window.AdminData;
  const D = window.DrumData;
  const STATUS_TONE = { \uD310\uB9E4\uC911: "success", \uD310\uB9E4\uC911\uC9C0: "warning", \uC228\uAE40: "neutral" };
  const M_TONE = { \uC815\uC0C1: "success", \uC815\uC9C0: "warning", \uD0C8\uD1F4: "neutral" };
  const matchQ = (value, qLower) => String(value || "").toLowerCase().includes(qLower);
  const amountOf = (o) => o.items.reduce((n, it) => {
    const sheet = D.byId(it.id);
    const unit = it.price != null ? it.price : sheet ? sheet.price : 0;
    return n + unit * it.qty;
  }, 0);
  function searchAll(raw) {
    const qLower = String(raw || "").trim().toLowerCase();
    if (!qLower) {
      return { qLower: "", sheets: [], memberOrders: [], members: [], guestOrders: [] };
    }
    const sheets = D.sheets.filter((s, i) => {
      const code = s.code || "DS-" + (1042 - i);
      return matchQ(s.title, qLower) || matchQ(s.artist, qLower) || matchQ(s.id, qLower) || matchQ(code, qLower);
    }).map((s, i) => ({
      ...s,
      code: s.code || "DS-" + (1042 - i),
      status: s.status || A.sheetStatus[s.id] || "\uD310\uB9E4\uC911"
    }));
    const memberOrders = A.orders.filter((o) => o.member && [o.no, o.buyer, o.email].some((v) => matchQ(v, qLower)));
    const members = A.members.filter((m) => matchQ(m.name, qLower) || matchQ(m.email, qLower));
    const guestOrders = A.orders.filter((o) => !o.member && [o.no, o.buyer, o.email].some((v) => matchQ(v, qLower)));
    return { qLower, sheets, memberOrders, members, guestOrders };
  }
  function SectionEmpty({ text }) {
    return /* @__PURE__ */ React.createElement("p", { style: { padding: "0 18px 18px", fontSize: 13, color: "var(--text-secondary)" } }, text);
  }
  function SearchPage() {
    const q = B.qp("q");
    const { qLower, sheets, memberOrders, members, guestOrders } = searchAll(q);
    const total = sheets.length + memberOrders.length + members.length + guestOrders.length;
    const title = q ? "\uD1B5\uD569 \uAC80\uC0C9 \xB7 \u300C" + q + "\u300D" : "\uD1B5\uD569 \uAC80\uC0C9";
    const encQ = encodeURIComponent(q);
    return /* @__PURE__ */ React.createElement(B.Shell, { active: "search", title }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "BO-09 \uD1B5\uD569 \uAC80\uC0C9", style: { display: "flex", flexDirection: "column", gap: 16 } }, !qLower ? /* @__PURE__ */ React.createElement(Card, { padding: 24, style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "var(--color-icon)", marginBottom: 10 } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 28 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 600 } }, "\uAC80\uC0C9\uC5B4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.55 } }, "\uC0C1\uB2E8 \uAC80\uC0C9\uCC3D\uC5D0\uC11C \uC8FC\uBB38\uBC88\uD638, \uD68C\uC6D0 \uC774\uBA54\uC77C, \uC545\uBCF4 \uACE1\uBA85 \uB4F1\uC744 \uC785\uB825\uD558\uBA74", /* @__PURE__ */ React.createElement("br", null), "\uC545\uBCF4 \xB7 \uC8FC\uBB38 \xB7 \uD68C\uC6D0 \uACB0\uACFC\uB97C \uD55C \uBC88\uC5D0 \uBCFC \uC218 \uC788\uC5B4\uC694.")) : total === 0 ? /* @__PURE__ */ React.createElement(Card, { padding: 24, style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "var(--color-icon)", marginBottom: 10 } }, /* @__PURE__ */ React.createElement(Icon, { name: "search-x", size: 28 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 600 } }, "\u300C", q, "\u300D\uC5D0 \uB300\uD55C \uACB0\uACFC\uAC00 \uC5C6\uC5B4\uC694"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.55 } }, "\uAC80\uC0C9\uC5B4 \uC624\uD0C0\uB97C \uD655\uC778\uD558\uAC70\uB098, \uB2E4\uB978 \uD0A4\uC6CC\uB4DC\uB85C \uB2E4\uC2DC \uAC80\uC0C9\uD574\uC8FC\uC138\uC694.")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "var(--text-secondary)" } }, "\uCD1D ", /* @__PURE__ */ React.createElement("span", { style: B.mono }, total), "\uAC74 \xB7 \uC545\uBCF4 ", sheets.length, " \xB7 \uC8FC\uBB38 ", memberOrders.length, " \xB7 \uD68C\uC6D0 ", members.length, guestOrders.length ? " \xB7 \uBE44\uD68C\uC6D0 \uC8FC\uBB38 " + guestOrders.length : ""), /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement(
      B.CardHead,
      {
        title: "\uC545\uBCF4",
        right: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)" } }, sheets.length, "\uAC1C"), sheets.length ? /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => location.href = "/bo/sheets?q=" + encQ }, "\uC804\uCCB4 \uBCF4\uAE30") : null)
      }
    ), sheets.length ? /* @__PURE__ */ React.createElement("div", { style: { padding: 6 } }, /* @__PURE__ */ React.createElement(B.Table, { minWidth: 720, head: ["\uACE1\uBA85 / \uC544\uD2F0\uC2A4\uD2B8", "ID", "\uC7A5\uB974", { l: "\uAC00\uACA9", r: true }, "\uC0C1\uD0DC"] }, sheets.map((s) => /* @__PURE__ */ React.createElement("tr", { key: s.id, onClick: () => location.href = "/bo/sheets/register?id=" + encodeURIComponent(s.id), style: { cursor: "pointer" } }, /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(B.Thumb, null), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600 } }, s.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-secondary)" } }, s.artist)))), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12, color: "var(--text-secondary)" } }, s.code)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: "neutral", size: "sm" }, s.genre)), /* @__PURE__ */ React.createElement(B.Td, { r: true }, /* @__PURE__ */ React.createElement("span", { style: B.mono }, B.won(s.price))), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: STATUS_TONE[s.status], size: "sm" }, s.status)))))) : /* @__PURE__ */ React.createElement(SectionEmpty, { text: "\uC77C\uCE58\uD558\uB294 \uC545\uBCF4\uAC00 \uC5C6\uC5B4\uC694." })), /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement(
      B.CardHead,
      {
        title: "\uC8FC\uBB38",
        right: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)" } }, memberOrders.length, "\uAC74"), memberOrders.length ? /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => location.href = "/bo/orders?q=" + encQ }, "\uC804\uCCB4 \uBCF4\uAE30") : null)
      }
    ), memberOrders.length ? /* @__PURE__ */ React.createElement("div", { style: { padding: 6 } }, /* @__PURE__ */ React.createElement(B.Table, { minWidth: 760, head: ["\uC8FC\uBB38\uBC88\uD638", "\uC8FC\uBB38\uC790", "\uC0C1\uD488", { l: "\uAE08\uC561", r: true }, "\uC0C1\uD0DC", { l: "\uC2DC\uAC04", r: true }] }, memberOrders.map((o) => /* @__PURE__ */ React.createElement("tr", { key: o.no, onClick: () => location.href = "/bo/orders?q=" + encodeURIComponent(o.no), style: { cursor: "pointer" } }, /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12 } }, o.no)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500 } }, o.buyer), /* @__PURE__ */ React.createElement("div", { style: { ...B.mono, fontSize: 11, color: "var(--text-secondary)" } }, o.email)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-secondary)" } }, (D.byId(o.items[0].id) || { title: o.items[0].id }).title, o.items.length > 1 ? " \uC678 " + (o.items.length - 1) + "\uAC74" : "")), /* @__PURE__ */ React.createElement(B.Td, { r: true }, /* @__PURE__ */ React.createElement("span", { style: B.mono }, B.won(amountOf(o)))), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: B.ORDER_TONE[o.status], size: "sm" }, o.status)), /* @__PURE__ */ React.createElement(B.Td, { r: true }, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12, color: "var(--text-secondary)" } }, o.date)))))) : /* @__PURE__ */ React.createElement(SectionEmpty, { text: "\uC77C\uCE58\uD558\uB294 \uD68C\uC6D0 \uC8FC\uBB38\uC774 \uC5C6\uC5B4\uC694." })), /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement(
      B.CardHead,
      {
        title: "\uD68C\uC6D0",
        right: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)" } }, members.length, "\uBA85"), members.length ? /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => location.href = "/bo/members?q=" + encQ }, "\uC804\uCCB4 \uBCF4\uAE30") : null)
      }
    ), members.length ? /* @__PURE__ */ React.createElement("div", { style: { padding: 6 } }, /* @__PURE__ */ React.createElement(B.Table, { minWidth: 640, head: ["\uD68C\uC6D0", "\uC774\uBA54\uC77C", "\uAC00\uC785\uC720\uD615", "\uAC00\uC785\uC77C", "\uC0C1\uD0DC"] }, members.map((m) => /* @__PURE__ */ React.createElement("tr", { key: m.email, onClick: () => location.href = "/bo/members?q=" + encodeURIComponent(m.email), style: { cursor: "pointer" } }, /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, m.name)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12, color: "var(--text-secondary)" } }, m.email)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: m.type === "\uC774\uBA54\uC77C" ? "neutral" : "outline", size: "sm" }, m.type)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12 } }, m.joined)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: M_TONE[m.status], size: "sm" }, m.status)))))) : /* @__PURE__ */ React.createElement(SectionEmpty, { text: "\uC77C\uCE58\uD558\uB294 \uD68C\uC6D0\uC774 \uC5C6\uC5B4\uC694." })), guestOrders.length ? /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement(
      B.CardHead,
      {
        title: "\uBE44\uD68C\uC6D0 \uC8FC\uBB38",
        right: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)" } }, guestOrders.length, "\uAC74"), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => location.href = "/bo/members?q=" + encQ }, "\uBE44\uD68C\uC6D0 \uC870\uD68C"))
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { padding: 6 } }, /* @__PURE__ */ React.createElement(B.Table, { minWidth: 760, head: ["\uC8FC\uBB38\uBC88\uD638", "\uC774\uBA54\uC77C", "\uC0C1\uD488", { l: "\uAE08\uC561", r: true }, "\uC0C1\uD0DC", { l: "\uC2DC\uAC04", r: true }] }, guestOrders.map((o) => /* @__PURE__ */ React.createElement("tr", { key: o.no, onClick: () => location.href = "/bo/members?q=" + encodeURIComponent(o.email), style: { cursor: "pointer" } }, /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12 } }, o.no)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12, color: "var(--text-secondary)" } }, o.email)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-secondary)" } }, (D.byId(o.items[0].id) || { title: o.items[0].id }).title, o.items.length > 1 ? " \uC678 " + (o.items.length - 1) + "\uAC74" : "")), /* @__PURE__ */ React.createElement(B.Td, { r: true }, /* @__PURE__ */ React.createElement("span", { style: B.mono }, B.won(amountOf(o)))), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: B.ORDER_TONE[o.status], size: "sm" }, o.status)), /* @__PURE__ */ React.createElement(B.Td, { r: true }, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12, color: "var(--text-secondary)" } }, o.date))))))) : null)));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(SearchPage, null));
  });
})();
