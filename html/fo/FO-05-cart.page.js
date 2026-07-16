(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, IconButton, Icon, Checkbox, Card } = DS;
  const F = window.FO;
  function CartPage() {
    F.useStoreTick();
    const cart = Store.cart.list();
    const [sel, setSel] = React.useState(cart.map((c) => c.id));
    const [ask, setAsk] = React.useState(false);
    React.useEffect(() => {
      setSel((p) => p.filter((id) => cart.some((c) => c.id === id)));
    }, [cart.length]);
    const items = cart.map((c) => F.resolveSheet(c.id, { qty: c.qty }));
    const selItems = items.filter((it) => sel.includes(it.id));
    const total = selItems.reduce((n, it) => n + (Number(it.price) || 0) * (it.qty || 1), 0);
    const allOn = sel.length === cart.length && cart.length > 0;
    const goCheckout = () => {
      const href = F.PAGES.checkout + "?sel=" + sel.join(",");
      if (Store.user.get()) location.href = href;
      else setAsk(true);
    };
    if (!cart.length) {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { tab: "cart", title: "\uC7A5\uBC14\uAD6C\uB2C8" }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-05 \uC7A5\uBC14\uAD6C\uB2C8 (\uBE44\uC5B4\uC788\uC74C)" }, /* @__PURE__ */ React.createElement(F.Empty, { icon: "shopping-cart", title: "\uB2F4\uAE34 \uC545\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4", sub: "\uB9C8\uC74C\uC5D0 \uB4DC\uB294 \uC545\uBCF4\uB97C \uB2F4\uC544\uBCF4\uC138\uC694. \uBAA8\uB4E0 \uACB0\uC81C\uB294 \uC7A5\uBC14\uAD6C\uB2C8\uC5D0\uC11C \uC2DC\uC791\uB3FC\uC694.", action: "\uC545\uBCF4 \uB458\uB7EC\uBCF4\uAE30", href: F.PAGES.list })));
    }
    const summary = /* @__PURE__ */ React.createElement(Card, { padding: 16, style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement(F.KV, { k: "\uC120\uD0DD \uC0C1\uD488", v: /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 13 } }, selItems.length, "\uAC74") }), /* @__PURE__ */ React.createElement(F.KV, { k: "\uCD1D \uC0C1\uD488\uAE08\uC561", v: /* @__PURE__ */ React.createElement(F.Money, { value: total, size: 14, weight: 500 }) }), /* @__PURE__ */ React.createElement(F.KV, { k: "\uC218\uC218\uB8CC", v: /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: "var(--text-secondary)" } }, "\uBB34\uB8CC") }), /* @__PURE__ */ React.createElement("hr", { className: "fo-hr", style: { margin: "4px 0" } }), /* @__PURE__ */ React.createElement(F.KV, { k: /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, "\uCD1D \uACB0\uC81C\uAE08\uC561"), v: /* @__PURE__ */ React.createElement(F.Money, { value: total, size: 20 }) }), /* @__PURE__ */ React.createElement("div", { className: "fo-desktop", style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: !selItems.length, onClick: goCheckout }, selItems.length ? F.won(total) + " \uACB0\uC81C\uD558\uAE30" : "\uC0C1\uD488\uC744 \uC120\uD0DD\uD558\uC138\uC694")), /* @__PURE__ */ React.createElement("p", { className: "fo-caption fo-desktop" }, "\uACB0\uC81C\uB294 \uC7A5\uBC14\uAD6C\uB2C8\uB97C \uD1B5\uD574\uC11C\uB9CC \uC9C4\uD589\uB3FC\uC694."));
    return /* @__PURE__ */ React.createElement(
      F.Scaffold,
      {
        tab: "cart",
        title: "\uC7A5\uBC14\uAD6C\uB2C8",
        cta: /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: !selItems.length, onClick: goCheckout }, selItems.length ? F.won(total) + " \uACB0\uC81C\uD558\uAE30" : "\uC0C1\uD488\uC744 \uC120\uD0DD\uD558\uC138\uC694")
      },
      /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-05 \uC7A5\uBC14\uAD6C\uB2C8", className: "fo-two", style: { paddingTop: 16 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" } }, /* @__PURE__ */ React.createElement(Checkbox, { checked: allOn, indeterminate: sel.length > 0 && !allOn, label: "\uC804\uCCB4 \uC120\uD0DD (" + sel.length + "/" + cart.length + ")", onChange: (on) => setSel(on ? cart.map((c) => c.id) : []) }), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", disabled: !sel.length, onClick: () => {
        Store.cart.remove(sel);
        F.toast("\uC120\uD0DD\uD55C \uC545\uBCF4\uB97C \uC0AD\uC81C\uD588\uC5B4\uC694");
      } }, "\uC120\uD0DD\uC0AD\uC81C")), /* @__PURE__ */ React.createElement("div", null, items.map((it, i) => {
        const cover = F.sheetCoverUrl(it);
        return /* @__PURE__ */ React.createElement("div", { key: it.id, style: { display: "flex", gap: 10, padding: "16px 0", borderTop: i ? "1px solid var(--border-default)" : "none", alignItems: "flex-start", opacity: it.missing ? 0.7 : 1 } }, /* @__PURE__ */ React.createElement("div", { style: { paddingTop: 22 } }, /* @__PURE__ */ React.createElement(Checkbox, { checked: sel.includes(it.id), onChange: (on) => setSel(on ? [...sel, it.id] : sel.filter((x) => x !== it.id)) })), /* @__PURE__ */ React.createElement("a", { href: it.missing ? void 0 : F.PAGES.detail + "?id=" + it.id, style: { width: 56, flex: "none", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-default)", pointerEvents: it.missing ? "none" : void 0 } }, /* @__PURE__ */ React.createElement(F.StaffThumb, { ratio: "1 / 1", size: 18, src: cover || void 0, alt: it.title, watermark: cover ? "light" : false })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8 } }, it.missing ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600, letterSpacing: "-0.3px", color: "var(--text-secondary)" } }, it.title) : /* @__PURE__ */ React.createElement("a", { href: F.PAGES.detail + "?id=" + it.id, style: { fontSize: 14, fontWeight: 600, letterSpacing: "-0.3px" } }, it.title), /* @__PURE__ */ React.createElement(IconButton, { name: "x", variant: "ghost", size: "sm", label: "\uC0AD\uC81C", onClick: () => {
          Store.cart.remove(it.id);
          F.toast("\uC7A5\uBC14\uAD6C\uB2C8\uC5D0\uC11C \uC0AD\uC81C\uD588\uC5B4\uC694");
        } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-secondary)" } }, it.artist, " \xB7 ", it.level, " \xB7 PDF"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 2 } }, /* @__PURE__ */ React.createElement(F.Money, { value: (Number(it.price) || 0) * (it.qty || 1), size: 15 }))));
      }))), /* @__PURE__ */ React.createElement("div", { className: "fo-side-sticky" }, summary)),
      /* @__PURE__ */ React.createElement(F.Dialog, { open: ask, onClose: () => setAsk(false), title: "\uC5B4\uB5BB\uAC8C \uACB0\uC81C\uD560\uAE4C\uC694?" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, onClick: () => location.href = F.PAGES.login }, "\uB85C\uADF8\uC778 \uD6C4 \uACB0\uC81C"), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "lg", fullWidth: true, onClick: () => location.href = F.PAGES.checkout + "?sel=" + sel.join(",") + "&as=guest" }, "\uBE44\uD68C\uC6D0\uC73C\uB85C \uACB0\uC81C"), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "md", fullWidth: true, onClick: () => location.href = F.PAGES.signup }, "3\uCD08 \uD68C\uC6D0\uAC00\uC785"), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { textAlign: "center" } }, "\uD68C\uC6D0\uC740 \uAD6C\uB9E4 \uB0B4\uC5ED\uC774 \uACC4\uC815\uC5D0 \uC800\uC7A5\uB418\uACE0, \uBE44\uD68C\uC6D0\uC740 \uC8FC\uBB38 \uC2DC \uC785\uB825\uD55C \uC774\uBA54\uC77C\uB85C\uB9CC \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC870\uD68C\uD560 \uC218 \uC788\uC5B4\uC694.")))
    );
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(CartPage, null));
  });
})();
