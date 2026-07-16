(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, IconButton, Card, Badge, Input, Checkbox, Icon } = DS;
  const B = window.BO;
  const D = window.DrumData;
  const MAX = 4;
  function FeaturedPage() {
    const [reco, setReco] = React.useState(D.recommended.slice());
    const [q, setQ] = React.useState("");
    const list = D.sheets.filter((s) => (s.title + s.artist).toLowerCase().includes(q.toLowerCase()));
    const toggle = (id) => setReco((r) => {
      if (r.includes(id)) return r.filter((x) => x !== id);
      if (r.length >= MAX) {
        B.toast("\uCD94\uCC9C \uC545\uBCF4\uB294 \uCD5C\uB300 " + MAX + "\uAC1C\uAE4C\uC9C0\uC608\uC694");
        return r;
      }
      return [...r, id];
    });
    return /* @__PURE__ */ React.createElement(
      B.Shell,
      {
        active: "featured",
        title: "\uBA54\uC778 \uAD00\uB9AC \u2014 \uCD94\uCC9C \uAD00\uB9AC",
        actions: /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", iconLeft: "check", onClick: async () => {
          try {
            await window.ChodrumAPI.featured.save(reco);
            B.toast("\uCD94\uCC9C \uC545\uBCF4 \uC124\uC815\uC744 \uC800\uC7A5\uD588\uC5B4\uC694 \xB7 \uD648 \u300C\uCD94\uCC9C \uC545\uBCF4\u300D\uC5D0 \uBC18\uC601\uB3FC\uC694");
          } catch (e) {
            console.warn(e);
            B.toast("\uC800\uC7A5 \uC2E4\uD328");
          }
        } }, "\uC800\uC7A5")
      },
      /* @__PURE__ */ React.createElement("div", { "data-screen-label": "BO-08 \uCD94\uCC9C \uAD00\uB9AC", style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement(B.CardHead, { title: "\uD648 \uB178\uCD9C \uC21C\uC11C", right: /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)" } }, reco.length, "/", MAX) }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 18px 16px" } }, reco.length ? reco.map((id, i) => {
        const s = D.byId(id);
        return /* @__PURE__ */ React.createElement("div", { key: id, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: i ? "1px solid var(--border-default)" : "none" } }, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { width: 18, fontSize: 13, fontWeight: 600, color: i === 0 ? "var(--color-ink)" : "var(--text-tertiary)" } }, i + 1), /* @__PURE__ */ React.createElement(B.Thumb, null), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, s.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-secondary)" } }, s.artist, " \xB7 ", s.genre)), /* @__PURE__ */ React.createElement(IconButton, { name: "chevron-up", variant: "ghost", size: "sm", label: "\uC704\uB85C", onClick: () => i > 0 && setReco((r) => {
          const n = r.slice();
          [n[i - 1], n[i]] = [n[i], n[i - 1]];
          return n;
        }) }), /* @__PURE__ */ React.createElement(IconButton, { name: "chevron-down", variant: "ghost", size: "sm", label: "\uC544\uB798\uB85C", onClick: () => i < reco.length - 1 && setReco((r) => {
          const n = r.slice();
          [n[i + 1], n[i]] = [n[i], n[i + 1]];
          return n;
        }) }), /* @__PURE__ */ React.createElement(IconButton, { name: "x", variant: "ghost", size: "sm", label: "\uC81C\uC678", onClick: () => toggle(id) }));
      }) : /* @__PURE__ */ React.createElement("p", { style: { padding: "8px 0 4px", fontSize: 13, color: "var(--text-secondary)" } }, "\uC120\uD0DD\uB41C \uCD94\uCC9C \uC545\uBCF4\uAC00 \uC5C6\uC5B4\uC694. \uC544\uB798 \uBAA9\uB85D\uC5D0\uC11C \uC120\uD0DD\uD574\uC8FC\uC138\uC694."))), /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement(B.CardHead, { title: "\uC545\uBCF4 \uC120\uD0DD", right: /* @__PURE__ */ React.createElement("div", { style: { width: 220 } }, /* @__PURE__ */ React.createElement(Input, { size: "sm", iconLeft: "search", placeholder: "\uACE1\uBA85 / \uC544\uD2F0\uC2A4\uD2B8", value: q, onChange: (e) => setQ(e.target.value) })) }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 18px 14px" } }, list.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: s.id, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: i ? "1px solid var(--border-default)" : "none" } }, /* @__PURE__ */ React.createElement(Checkbox, { checked: reco.includes(s.id), onChange: () => toggle(s.id) }), /* @__PURE__ */ React.createElement(B.Thumb, null), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, s.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-secondary)" } }, s.artist, " \xB7 ", s.genre, " \xB7 ", s.level)), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)" } }, "\uD310\uB9E4 ", s.sold.toLocaleString("ko-KR")), reco.includes(s.id) ? /* @__PURE__ */ React.createElement(Badge, { variant: "solid", size: "sm" }, "\uD648 \uB178\uCD9C") : null)), !list.length ? /* @__PURE__ */ React.createElement("p", { style: { padding: "12px 0", fontSize: 13, color: "var(--text-secondary)" } }, "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC5B4\uC694.") : null)), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)" } }, "\uCD94\uCC9C \uC545\uBCF4\uB294 \uD648 \u300C\uCD94\uCC9C \uC545\uBCF4\u300D \uC601\uC5ED\uC5D0 \uC21C\uC11C\uB300\uB85C \uB178\uCD9C\uB3FC\uC694. \uD310\uB9E4\uC911\uC9C0\xB7\uC228\uAE40 \uC0C1\uD0DC\uC758 \uC545\uBCF4\uB294 \uC790\uB3D9\uC73C\uB85C \uC81C\uC678\uB3FC\uC694."))
    );
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(FeaturedPage, null));
  });
})();
