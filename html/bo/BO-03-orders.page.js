(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Card, Badge, Chip, Select, Checkbox, Input, Icon } = DS;
  const B = window.BO;
  const A = window.AdminData;
  const D = window.DrumData;
  const amountOf = (o) => o.items.reduce((n, it) => {
    const sheet = D.byId(it.id);
    const unit = it.price != null ? it.price : sheet ? sheet.price : 0;
    return n + unit * it.qty;
  }, 0);
  function OrdersPage() {
    const [orders, setOrders] = React.useState(A.orders);
    const [f, setF] = React.useState("\uC804\uCCB4");
    const [type, setType] = React.useState("\uC804\uCCB4");
    const [cur, setCur] = React.useState(null);
    const [refunding, setRefunding] = React.useState(false);
    const [reason, setReason] = React.useState("");
    const [revoke, setRevoke] = React.useState(true);
    const rows = orders.filter((o) => (f === "\uC804\uCCB4" || o.status === f) && (type === "\uC804\uCCB4" || (type === "\uD68C\uC6D0" ? o.member : !o.member)));
    const openDetail = (o) => {
      setCur(o);
      setRefunding(false);
      setReason("");
      setRevoke(true);
    };
    const setStatus = async (no, status) => {
      setOrders((os) => os.map((o) => o.no === no ? { ...o, status } : o));
      setCur((c) => c && c.no === no ? { ...c, status } : c);
      try {
        await window.ChodrumAPI.orders.updateStatus(no, status, { revoke });
      } catch (e) {
        console.warn(e);
        B.toast("\uC0C1\uD0DC \uB3D9\uAE30\uD654 \uC2E4\uD328");
      }
    };
    const doRefund = async () => {
      await setStatus(cur.no, "\uD658\uBD88");
      B.toast("\uD658\uBD88 \uC644\uB8CC" + (revoke ? " \xB7 \uB2E4\uC6B4\uB85C\uB4DC \uAD8C\uD55C\uC744 \uD68C\uC218\uD588\uC5B4\uC694" : ""));
      setRefunding(false);
    };
    return /* @__PURE__ */ React.createElement(B.Shell, { active: "orders", title: "\uC8FC\uBB38 / \uACB0\uC81C \uAD00\uB9AC" }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "BO-03 \uC8FC\uBB38/\uACB0\uC81C \uAD00\uB9AC", style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "bo-toolbar" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, ["\uC804\uCCB4", "\uACB0\uC81C\uC644\uB8CC", "\uB300\uAE30", "\uCDE8\uC18C", "\uD658\uBD88"].map((x) => /* @__PURE__ */ React.createElement(Chip, { key: x, selected: f === x, onClick: () => setF(x) }, x))), /* @__PURE__ */ React.createElement("div", { style: { width: 130, marginLeft: "auto" } }, /* @__PURE__ */ React.createElement(Select, { size: "sm", value: type, onChange: (e) => setType(e.target.value), options: ["\uC804\uCCB4", "\uD68C\uC6D0", "\uBE44\uD68C\uC6D0"] }))), /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement("div", { style: { padding: 6 } }, /* @__PURE__ */ React.createElement(B.Table, { minWidth: 860, head: ["\uC8FC\uBB38\uBC88\uD638", "\uC8FC\uBB38\uC790", "\uC720\uD615", "\uC0C1\uD488", "\uACB0\uC81C\uC218\uB2E8", { l: "\uAE08\uC561", r: true }, "\uC0C1\uD0DC", { l: "\uC2DC\uAC04", r: true }] }, rows.map((o) => /* @__PURE__ */ React.createElement("tr", { key: o.no, onClick: () => openDetail(o), style: { cursor: "pointer" } }, /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12 } }, o.no)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500 } }, o.buyer), /* @__PURE__ */ React.createElement("div", { style: { ...B.mono, fontSize: 11, color: "var(--text-secondary)" } }, o.email)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: o.member ? "outline" : "neutral", size: "sm" }, o.member ? "\uD68C\uC6D0" : "\uBE44\uD68C\uC6D0")), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-secondary)" } }, (D.byId(o.items[0].id) || { title: o.items[0].id }).title, o.items.length > 1 ? " \uC678 " + (o.items.length - 1) + "\uAC74" : "")), /* @__PURE__ */ React.createElement(B.Td, null, o.method), /* @__PURE__ */ React.createElement(B.Td, { r: true }, /* @__PURE__ */ React.createElement("span", { style: B.mono }, B.won(amountOf(o)))), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: B.ORDER_TONE[o.status], size: "sm" }, o.status)), /* @__PURE__ */ React.createElement(B.Td, { r: true }, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12, color: "var(--text-secondary)" } }, o.date))))))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)" } }, "\uD589\uC744 \uD074\uB9AD\uD558\uBA74 \uC8FC\uBB38 \uC0C1\uC138\uC640 \uD658\uBD88 \uCC98\uB9AC\uB97C \uC9C4\uD589\uD560 \uC218 \uC788\uC5B4\uC694. \uACB0\uC81C \uC2E4\uD328 \uC8FC\uBB38\uC740 \uC7A5\uBC14\uAD6C\uB2C8\uAC00 \uC720\uC9C0\uB41C \uC0C1\uD0DC\uB85C \uC7AC\uACB0\uC81C\uB97C \uC720\uB3C4\uD574\uC694.")), /* @__PURE__ */ React.createElement(
      B.Modal,
      {
        open: !!cur,
        onClose: () => setCur(null),
        title: cur ? "\uC8FC\uBB38 \uC0C1\uC138" : "",
        width: 600,
        footer: cur ? refunding ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => setRefunding(false) }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", disabled: !reason.trim(), onClick: doRefund }, "\uD658\uBD88 \uD655\uC815")) : /* @__PURE__ */ React.createElement(React.Fragment, null, cur.status === "\uACB0\uC81C\uC644\uB8CC" ? /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => setRefunding(true) }, "\uD658\uBD88 \uCC98\uB9AC") : null, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", onClick: () => setCur(null) }, "\uB2EB\uAE30")) : null
      },
      cur ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement(B.KVRow, { k: "\uC8FC\uBB38\uBC88\uD638", v: /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 13 } }, cur.no) }), /* @__PURE__ */ React.createElement(B.KVRow, { k: "\uC8FC\uBB38\uC790", v: /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, cur.buyer, " ", /* @__PURE__ */ React.createElement(Badge, { variant: cur.member ? "outline" : "neutral", size: "sm" }, cur.member ? "\uD68C\uC6D0" : "\uBE44\uD68C\uC6D0")) }), /* @__PURE__ */ React.createElement(B.KVRow, { k: "\uC774\uBA54\uC77C", v: /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12.5 } }, cur.email) }), /* @__PURE__ */ React.createElement(B.KVRow, { k: "\uACB0\uC81C\uC218\uB2E8 / \uC77C\uC2DC", v: /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5 } }, cur.method, " \xB7 ", /* @__PURE__ */ React.createElement("span", { style: B.mono }, cur.date)) })), /* @__PURE__ */ React.createElement("hr", { style: { height: 1, background: "var(--border-default)", border: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, cur.items.map((it) => {
        const s = D.byId(it.id);
        return /* @__PURE__ */ React.createElement(B.KVRow, { key: it.id, k: /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-primary)" } }, s.title, " \xD7", it.qty), v: /* @__PURE__ */ React.createElement("span", { style: B.mono }, B.won(s.price * it.qty)) });
      }), /* @__PURE__ */ React.createElement(B.KVRow, { k: /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text-primary)" } }, "\uCD1D \uACB0\uC81C\uAE08\uC561"), v: /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 16, fontWeight: 600 } }, B.won(amountOf(cur))) })), /* @__PURE__ */ React.createElement("hr", { style: { height: 1, background: "var(--border-default)", border: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-secondary)", flex: "none" } }, "\uACB0\uC81C \uC0C1\uD0DC"), /* @__PURE__ */ React.createElement("div", { style: { width: 140 } }, /* @__PURE__ */ React.createElement(Select, { size: "sm", value: cur.status, onChange: (e) => {
        setStatus(cur.no, e.target.value);
        B.toast("\uC0C1\uD0DC\uB97C \u300C" + e.target.value + "\u300D\uB85C \uBCC0\uACBD\uD588\uC5B4\uC694");
      }, options: ["\uACB0\uC81C\uC644\uB8CC", "\uB300\uAE30", "\uCDE8\uC18C", "\uD658\uBD88"] })), /* @__PURE__ */ React.createElement(Badge, { variant: B.ORDER_TONE[cur.status], size: "sm" }, cur.status)), refunding ? /* @__PURE__ */ React.createElement("div", { style: { padding: 14, background: "var(--surface-sunken)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600 } }, "\uD658\uBD88 \uCC98\uB9AC"), /* @__PURE__ */ React.createElement(Input, { label: "\uD658\uBD88 \uC0AC\uC720 (\uD544\uC218)", placeholder: "\uC608: \uAD6C\uB9E4\uC790 \uC694\uCCAD \u2014 \uC911\uBCF5 \uAD6C\uB9E4", value: reason, onChange: (e) => setReason(e.target.value) }), /* @__PURE__ */ React.createElement(Checkbox, { checked: revoke, onChange: setRevoke, label: "\uB2E4\uC6B4\uB85C\uB4DC \uAD8C\uD55C \uC989\uC2DC \uD68C\uC218 (REVOKED)" }), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 } }, "\uAD8C\uD55C\uC744 \uD68C\uC218\uD558\uBA74 \uAD6C\uB9E4\uC790 \uD654\uBA74\uC5D0\uC11C \uB2E4\uC6B4\uB85C\uB4DC \uBC84\uD2BC\uC774 \uC989\uC2DC \uBE44\uD65C\uC131\uD654\uB418\uACE0, \uD658\uBD88 \uC548\uB0B4 \uBA54\uC77C\uC774 \uBC1C\uC1A1\uB3FC\uC694.")) : null) : null
    ));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(OrdersPage, null));
  });
})();
