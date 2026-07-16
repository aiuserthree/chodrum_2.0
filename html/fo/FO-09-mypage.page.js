(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Icon, Card, Badge } = DS;
  const F = window.FO;
  const PROVIDER_LABEL = { email: "\uC774\uBA54\uC77C", kakao: "\uCE74\uCE74\uC624", naver: "\uB124\uC774\uBC84", google: "\uAD6C\uAE00" };
  function MenuRow({ label, href, icon, muted, onClick }) {
    return /* @__PURE__ */ React.createElement("a", { href, onClick, style: { display: "flex", alignItems: "center", gap: 10, padding: "15px 2px", borderTop: "1px solid var(--border-default)", fontSize: 14.5, color: muted ? "var(--text-secondary)" : "var(--text-primary)", fontWeight: 500 } }, /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 17, style: { color: "var(--color-icon)" } }), label, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 16, style: { color: "var(--color-icon)", marginLeft: "auto" } }));
  }
  function MyPage() {
    F.useStoreTick();
    const user = Store.user.get();
    const [purchases, setPurchases] = React.useState([]);
    const [purchasesReady, setPurchasesReady] = React.useState(false);
    React.useEffect(() => {
      let cancelled = false;
      if (!user || !user.email && !user.authId) {
        setPurchases([]);
        setPurchasesReady(true);
        return void 0;
      }
      setPurchasesReady(false);
      F.loadPurchases(user).then((list) => {
        if (cancelled) return;
        setPurchases(Array.isArray(list) ? list : []);
        setPurchasesReady(true);
      }).catch(() => {
        if (cancelled) return;
        setPurchases([]);
        setPurchasesReady(true);
      });
      return () => {
        cancelled = true;
      };
    }, [user && user.email, user && user.authId, user && user.provider]);
    if (!user) {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { tab: "my", title: "\uB9C8\uC774\uD398\uC774\uC9C0" }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-09 \uB9C8\uC774\uD398\uC774\uC9C0 (\uBE44\uB85C\uADF8\uC778)", className: "fo-container mid", style: { padding: 0 } }, /* @__PURE__ */ React.createElement(F.Empty, { icon: "user", title: "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD574\uC694", sub: "\uAD6C\uB9E4 \uB0B4\uC5ED\uACFC \uB2E4\uC6B4\uB85C\uB4DC\uB294 \uB85C\uADF8\uC778 \uD6C4 \uC774\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694." }), /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 420, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, onClick: () => location.href = F.PAGES.login }, "\uB85C\uADF8\uC778 / \uD68C\uC6D0\uAC00\uC785"), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "lg", fullWidth: true, onClick: () => location.href = F.PAGES.guest }, "\uBE44\uD68C\uC6D0 \uC8FC\uBB38 \uC870\uD68C"))));
    }
    const active = purchases.filter((p) => p.dday >= 0).length;
    const favN = Store.fav.list().length;
    return /* @__PURE__ */ React.createElement(F.Scaffold, { tab: "my", title: "\uB9C8\uC774\uD398\uC774\uC9C0" }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-09 \uB9C8\uC774\uD398\uC774\uC9C0", className: "fo-two", style: { paddingTop: 20 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Card, { padding: 18, style: { display: "flex", alignItems: "center", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 17, fontWeight: 600, letterSpacing: "-0.4px" } }, user.name), /* @__PURE__ */ React.createElement(Badge, { variant: user.type === "email" ? "neutral" : "outline", size: "sm" }, PROVIDER_LABEL[user.provider] || "\uC774\uBA54\uC77C", " \uD68C\uC6D0")), /* @__PURE__ */ React.createElement("div", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis" } }, user.email)), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", onClick: async () => {
      await window.ChodrumAuth.signOut();
      F.toast("\uB85C\uADF8\uC544\uC6C3\uB418\uC5C8\uC5B4\uC694");
    } }, "\uB85C\uADF8\uC544\uC6C3")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 } }, /* @__PURE__ */ React.createElement(Card, { interactive: true, padding: 14, onClick: () => location.href = F.PAGES.downloads }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-secondary)" } }, "\uB2E4\uC6B4\uB85C\uB4DC \uAC00\uB2A5"), /* @__PURE__ */ React.createElement("div", { className: "ds-mono", style: { fontSize: 22, fontWeight: 600, marginTop: 4 } }, purchasesReady ? active : "\xB7", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" } }, " \uAC74"))), /* @__PURE__ */ React.createElement(Card, { interactive: true, padding: 14, onClick: () => location.href = F.PAGES.wish }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-secondary)" } }, "\uCC1C\uD55C \uC545\uBCF4"), /* @__PURE__ */ React.createElement("div", { className: "ds-mono", style: { fontSize: 22, fontWeight: 600, marginTop: 4 } }, favN, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" } }, " \uAC1C")))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement(MenuRow, { label: "\uAD6C\uB9E4 \uB0B4\uC5ED / \uB2E4\uC6B4\uB85C\uB4DC", href: F.PAGES.downloads, icon: "download" }), /* @__PURE__ */ React.createElement(MenuRow, { label: "\uCC1C \uBAA9\uB85D", href: F.PAGES.wish, icon: "heart" }), /* @__PURE__ */ React.createElement(MenuRow, { label: "\uB0B4 \uC815\uBCF4 \uC218\uC815", href: F.PAGES.edit, icon: "user" }), /* @__PURE__ */ React.createElement(MenuRow, { label: "\uD68C\uC6D0 \uD0C8\uD1F4", href: F.PAGES.withdraw, icon: "log-out", muted: true }))), /* @__PURE__ */ React.createElement("div", { className: "fo-desktop" }, /* @__PURE__ */ React.createElement(Card, { padding: 18, style: { marginTop: 0 } }, /* @__PURE__ */ React.createElement(F.SectionHeader, { title: "\uCD5C\uADFC \uAD6C\uB9E4", action: "\uC804\uCCB4\uBCF4\uAE30", href: F.PAGES.downloads, style: { marginBottom: 6 } }), !purchasesReady ? /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { marginTop: 8 } }, "\uAD6C\uB9E4 \uB0B4\uC5ED\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\u2026") : purchases.length ? purchases.slice(0, 3).map((p, i) => {
      const snap = p && p.title || "";
      const s = F && typeof F.resolveSheet === "function" ? F.resolveSheet(p.id, { title: snap || "\uC545\uBCF4" }) : { id: p.id, title: snap || "\uC545\uBCF4" };
      const title = F && typeof F.lineTitle === "function" ? F.lineTitle(p, s) : snap || s && s.title || "\uC545\uBCF4";
      const row = Object.assign({}, s || {}, { title });
      return /* @__PURE__ */ React.createElement("div", { key: String(p.orderNo) + String(p.id) + i, style: { borderTop: i ? "1px solid var(--border-default)" : "none" } }, /* @__PURE__ */ React.createElement(
        F.SheetRow,
        {
          s: row,
          href: null,
          sub: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 2 } }, /* @__PURE__ */ React.createElement(F.DdayBadge, { dday: p.dday }), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11, color: "var(--text-secondary)" } }, p.date)),
          right: /* @__PURE__ */ React.createElement(Button, { variant: p.dday < 0 ? "secondary" : "primary", size: "sm", iconLeft: "download", disabled: p.dday < 0, onClick: () => F.downloadSheetPdf(p.id, { title, expired: p.dday < 0, orderNo: p.orderNo }) }, p.dday < 0 ? "\uB9CC\uB8CC" : "PDF")
        }
      ));
    }) : /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { marginTop: 8 } }, "\uCD5C\uADFC \uAD6C\uB9E4 \uB0B4\uC5ED\uC774 \uC5C6\uC5B4\uC694."), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { marginTop: 8 } }, "\uB2E4\uC6B4\uB85C\uB4DC\uB294 \uACB0\uC81C\uC77C\uB85C\uBD80\uD130 7\uC77C\uAC04 \uAC00\uB2A5\uD574\uC694.")))));
  }
  ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(MyPage, null));
})();
