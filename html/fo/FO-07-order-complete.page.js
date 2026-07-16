(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Icon, Card } = DS;
  const F = window.FO;
  const MISSING = F && F.MISSING_SHEET_TITLE || "\uC0AD\uC81C\uB418\uC5C8\uAC70\uB098 \uCC3E\uC744 \uC218 \uC5C6\uB294 \uC545\uBCF4";
  function itemSheetId(it) {
    if (!it || typeof it !== "object") return "";
    if (it.id != null && it.id !== "") return it.id;
    if (it.sheetId != null && it.sheetId !== "") return it.sheetId;
    return "";
  }
  function itemDisplayTitle(it) {
    const snap = it && (it.title || it.name) || "";
    if (snap && snap !== MISSING) return snap;
    const id = itemSheetId(it);
    let resolved = null;
    try {
      if (F && typeof F.resolveSheet === "function") {
        resolved = F.resolveSheet(id, { title: snap || "\uC545\uBCF4" });
      }
    } catch (e) {
      resolved = null;
    }
    if (F && typeof F.lineTitle === "function") return F.lineTitle(it || {}, resolved);
    const t = resolved && resolved.title;
    if (t && t !== MISSING) return t;
    return snap || "\uC545\uBCF4";
  }
  function CompletePage() {
    F.useStoreTick();
    const [, setReadyTick] = React.useState(0);
    React.useEffect(() => {
      const bump = () => setReadyTick((n) => n + 1);
      window.addEventListener("chodrum:ready", bump);
      if (window.ChodrumAPI && ChodrumAPI.readyState && ChodrumAPI.readyState.ready) bump();
      return () => window.removeEventListener("chodrum:ready", bump);
    }, []);
    const order = Store.lastOrder.get();
    const user = Store.user.get();
    const guest = order ? !!order.guest || !user : !user;
    if (!order) {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uACB0\uC81C \uC644\uB8CC", back: F.PAGES.home }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-07 \uACB0\uC81C \uC644\uB8CC (\uC5C6\uC74C)", className: "fo-container narrow", style: { padding: 0 } }, /* @__PURE__ */ React.createElement(F.Empty, { icon: "receipt", title: "\uD45C\uC2DC\uD560 \uC8FC\uBB38\uC774 \uC5C6\uC5B4\uC694", sub: "\uACB0\uC81C\uB97C \uC644\uB8CC\uD558\uBA74 \uC8FC\uBB38 \uB0B4\uC5ED\uC774 \uC5EC\uAE30\uC5D0 \uD45C\uC2DC\uB3FC\uC694.", action: "\uD648\uC73C\uB85C", href: F.PAGES.home })));
    }
    const goDownload = () => {
      if (guest) {
        const email = order.email || "";
        location.href = F.PAGES.guest + (email ? "?email=" + encodeURIComponent(email) : "");
        return;
      }
      location.href = F.PAGES.downloads;
    };
    const lines = Array.isArray(order.items) ? order.items.filter(Boolean) : [];
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uACB0\uC81C \uC644\uB8CC", back: F.PAGES.home }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-07 \uACB0\uC81C \uC644\uB8CC", className: "fo-container narrow", style: { padding: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "44px 0 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 60, height: 60, borderRadius: 9999, background: "var(--status-success-bg)", color: "var(--status-success)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 30 })), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 22, letterSpacing: "-0.6px" } }, "\uACB0\uC81C\uAC00 \uC644\uB8CC\uB418\uC5C8\uC5B4\uC694"), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 13, color: "var(--text-secondary)" } }, order.no)), /* @__PURE__ */ React.createElement(Card, { padding: 18, style: { display: "flex", flexDirection: "column", gap: 10 } }, lines.map((it, i) => {
      const id = itemSheetId(it);
      const title = itemDisplayTitle(it);
      const price = it && it.price != null ? it.price : 0;
      return /* @__PURE__ */ React.createElement(
        F.KV,
        {
          key: String(id) + "-" + i,
          k: /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-primary)" } }, title),
          v: /* @__PURE__ */ React.createElement(F.Money, { value: price, size: 14, weight: 500 })
        }
      );
    }), /* @__PURE__ */ React.createElement("hr", { className: "fo-hr", style: { margin: "2px 0" } }), /* @__PURE__ */ React.createElement(F.KV, { k: "\uACB0\uC81C \uC218\uB2E8", v: /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 500 } }, order.method) }), /* @__PURE__ */ React.createElement(F.KV, { k: "\uACB0\uC81C \uC77C\uC2DC", v: /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 13 } }, order.date) }), /* @__PURE__ */ React.createElement(F.KV, { k: /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, "\uCD1D \uACB0\uC81C\uAE08\uC561"), v: /* @__PURE__ */ React.createElement(F.Money, { value: order.total, size: 18 }) })), /* @__PURE__ */ React.createElement("div", { style: { margin: "16px 0", padding: "14px 16px", background: "var(--surface-sunken)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-cards)" } }, guest ? /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13.5, lineHeight: 1.6, color: "var(--text-secondary)" } }, "\uBE44\uD68C\uC6D0 \uC8FC\uBB38\uC774 \uC644\uB8CC\uB418\uC5C8\uC5B4\uC694. ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text-primary)" }, className: "ds-mono" }, order.email), " \uC8FC\uC18C\uB85C\uB9CC \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC870\uD68C\uD560 \uC218 \uC788\uC73C\uB2C8 \uC774\uBA54\uC77C\uC744 \uAF2D \uAE30\uC5B5\uD574\uC8FC\uC138\uC694. \uACB0\uC81C\uC77C\uB85C\uBD80\uD130 ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text-primary)" } }, "7\uC77C\uAC04"), " \uB2E4\uC6B4\uB85C\uB4DC\uD560 \uC218 \uC788\uC5B4\uC694.") : /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13.5, lineHeight: 1.6, color: "var(--text-secondary)" } }, "\uAD6C\uB9E4\uD55C \uC545\uBCF4\uB294 ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text-primary)" } }, "\uB9C8\uC774\uD398\uC774\uC9C0 > \uAD6C\uB9E4 \uB0B4\uC5ED / \uB2E4\uC6B4\uB85C\uB4DC"), "\uC5D0 \uC800\uC7A5\uB418\uC5C8\uC5B4\uC694. \uACB0\uC81C\uC77C\uB85C\uBD80\uD130 ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text-primary)" } }, "7\uC77C\uAC04"), " PDF\uB97C \uB2E4\uC6B4\uB85C\uB4DC\uD560 \uC218 \uC788\uC5B4\uC694.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, paddingBottom: 12 } }, guest ? /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, iconLeft: "download", onClick: goDownload }, "\uBE44\uD68C\uC6D0 \uC8FC\uBB38 \uC870\uD68C\uD558\uAE30") : /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, iconLeft: "download", onClick: goDownload }, "\uB2E4\uC6B4\uB85C\uB4DC \uD558\uB7EC \uAC00\uAE30"), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "lg", fullWidth: true, onClick: () => location.href = F.PAGES.home }, "\uD648\uC73C\uB85C"))));
  }
  ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(CompletePage, null));
})();
