(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, IconButton, Icon } = DS;
  const F = window.FO;
  function WishlistPage() {
    F.useStoreTick();
    const user = Store.user.get();
    const items = Store.fav.list().map((id) => F.resolveSheet(id)).filter(Boolean);
    const [cartAsk, setCartAsk] = React.useState(false);
    const [cartMsg, setCartMsg] = React.useState("\uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uB2F4\uC558\uC5B4\uC694");
    const addOne = (id) => {
      const ok = Store.cart.add(id, 1);
      setCartMsg(ok ? "\uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uB2F4\uC558\uC5B4\uC694" : "\uC774\uBBF8 \uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uC788\uC5B4\uC694");
      setCartAsk(true);
    };
    const addAll = () => {
      if (!items.length) return;
      let n = 0;
      items.forEach((s) => {
        if (Store.cart.add(s.id, 1)) n++;
      });
      setCartMsg(n ? "\uCC1C\uD55C \uC545\uBCF4 " + n + "\uAC1C\uB97C \uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uB2F4\uC558\uC5B4\uC694" : "\uC774\uBBF8 \uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uC788\uC5B4\uC694");
      setCartAsk(true);
    };
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uCC1C \uBAA9\uB85D", back: F.PAGES.my }, /* @__PURE__ */ React.createElement(F.MyPageLayout, { active: "wish", label: "FO-04 \uCC1C \uBAA9\uB85D" }, items.length ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0 6px" } }, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 13, color: "var(--text-secondary)" } }, "\uCC1C\uD55C \uC545\uBCF4 ", items.length, "\uAC1C"), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", iconLeft: "shopping-cart", onClick: addAll }, "\uC804\uCCB4 \uB2F4\uAE30")), /* @__PURE__ */ React.createElement("div", null, items.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: s.id, style: { borderTop: i ? "1px solid var(--border-default)" : "none", opacity: s.missing ? 0.7 : 1 } }, /* @__PURE__ */ React.createElement(
      F.SheetRow,
      {
        s,
        sub: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-secondary)" } }, s.artist, " \xB7 ", s.level), /* @__PURE__ */ React.createElement(F.Money, { value: s.price, size: 14 })),
        right: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement(IconButton, { name: "x", variant: "ghost", size: "sm", label: "\uCC1C \uD574\uC81C", onClick: () => {
          Store.fav.toggle(s.id);
          F.toast("\uCC1C\uC744 \uD574\uC81C\uD588\uC5B4\uC694");
        } }), !s.missing ? /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", iconLeft: "shopping-cart", onClick: () => addOne(s.id) }, "\uB2F4\uAE30") : null)
      }
    )))), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { display: "flex", alignItems: "center", gap: 6, paddingTop: 16 } }, /* @__PURE__ */ React.createElement(Icon, { name: "info", size: 13, style: { color: "var(--color-icon)" } }), user ? "\uCC1C \uBAA9\uB85D\uC740 \uACC4\uC815\uC5D0 \uC800\uC7A5\uB418\uC5B4 \uC5B4\uB514\uC11C\uB098 \uB3D9\uC77C\uD558\uAC8C \uBCF4\uC5EC\uC694." : "\uB85C\uADF8\uC778\uD558\uC9C0 \uC54A\uC73C\uBA74 \uCC1C \uBAA9\uB85D\uC740 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uB9CC \uC784\uC2DC \uC800\uC7A5\uB3FC\uC694.")) : /* @__PURE__ */ React.createElement(F.Empty, { icon: "heart", title: "\uCC1C\uD55C \uC545\uBCF4\uAC00 \uC5C6\uC5B4\uC694", sub: "\uC545\uBCF4 \uCE74\uB4DC\uC758 \uD558\uD2B8\uB97C \uB20C\uB7EC \uAD00\uC2EC \uC545\uBCF4\uB97C \uC800\uC7A5\uD574\uBCF4\uC138\uC694.", action: "\uC545\uBCF4 \uB458\uB7EC\uBCF4\uAE30", href: F.PAGES.list })), /* @__PURE__ */ React.createElement(F.CartAddedDialog, { open: cartAsk, onClose: () => setCartAsk(false), message: cartMsg }));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(WishlistPage, null));
  });
})();
