(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Icon, Chip, Card } = DS;
  const F = window.FO;
  const MISSING = F && F.MISSING_SHEET_TITLE || "\uC0AD\uC81C\uB418\uC5C8\uAC70\uB098 \uCC3E\uC744 \uC218 \uC5C6\uB294 \uC545\uBCF4";
  function purchaseSheetId(p) {
    if (!p || typeof p !== "object") return "";
    if (p.sheetId != null && p.sheetId !== "") return p.sheetId;
    if (p.id != null && p.id !== "") return p.id;
    return "";
  }
  function purchaseDisplay(p) {
    const row = p && typeof p === "object" ? p : {};
    const id = purchaseSheetId(row);
    let snap = row.title && row.title !== MISSING ? String(row.title) : "";
    if (!snap) {
      try {
        const order = Store.lastOrder.get();
        const items = order && Array.isArray(order.items) ? order.items : [];
        const hit = items.find((it) => {
          if (!it) return false;
          const iid = it.sheetId != null && it.sheetId !== "" ? it.sheetId : it.id;
          return String(iid) === String(id);
        });
        if (hit && hit.title && hit.title !== MISSING) snap = String(hit.title);
      } catch (e) {
      }
    }
    let cover = "";
    let title = snap || "\uC545\uBCF4";
    try {
      const resolved = F && typeof F.resolveSheet === "function" ? F.resolveSheet(id, { title: snap || "\uC545\uBCF4" }) : null;
      if (F && typeof F.lineTitle === "function") title = F.lineTitle({ title: snap }, resolved);
      else {
        const t = resolved && resolved.title;
        title = snap && snap !== MISSING ? snap : t && t !== MISSING ? t : snap || "\uC545\uBCF4";
      }
      if (F && typeof F.sheetCoverUrl === "function") cover = F.sheetCoverUrl(resolved) || "";
    } catch (e) {
      title = snap || "\uC545\uBCF4";
      cover = "";
    }
    if (!title || title === MISSING) title = snap || "\uC545\uBCF4";
    return { id, title, cover };
  }
  function DownloadsPage() {
    F.useStoreTick();
    const user = Store.user.get();
    const [filter, setFilter] = React.useState("\uC804\uCCB4");
    const [purchases, setPurchases] = React.useState([]);
    const [dataReady, setDataReady] = React.useState(false);
    React.useEffect(() => {
      let cancelled = false;
      if (!user || !user.email && !user.authId) {
        setPurchases([]);
        setDataReady(true);
        return void 0;
      }
      setDataReady(false);
      F.loadPurchases(user).then((list2) => {
        if (cancelled) return;
        setPurchases(Array.isArray(list2) ? list2 : []);
        setDataReady(true);
      }).catch(() => {
        if (cancelled) return;
        setPurchases([]);
        setDataReady(true);
      });
      return () => {
        cancelled = true;
      };
    }, [user && user.email, user && user.authId, user && user.provider]);
    if (!user) {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uAD6C\uB9E4 \uB0B4\uC5ED / \uB2E4\uC6B4\uB85C\uB4DC", back: F.PAGES.my }, /* @__PURE__ */ React.createElement(F.MyPageLayout, { active: "downloads", label: "FO-09-01 \uAD6C\uB9E4\uB0B4\uC5ED (\uBE44\uB85C\uADF8\uC778)" }, /* @__PURE__ */ React.createElement(F.Empty, { icon: "user", title: "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD574\uC694", sub: "\uAD6C\uB9E4 \uB0B4\uC5ED\uACFC \uB2E4\uC6B4\uB85C\uB4DC\uB294 \uB85C\uADF8\uC778 \uD6C4 \uC774\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694.", action: "\uB85C\uADF8\uC778 / \uD68C\uC6D0\uAC00\uC785", href: F.PAGES.login })));
    }
    const list = purchases.filter((p) => filter === "\uC804\uCCB4" || (filter === "\uB2E4\uC6B4\uB85C\uB4DC \uAC00\uB2A5" ? p.dday >= 0 : p.dday < 0));
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uAD6C\uB9E4 \uB0B4\uC5ED / \uB2E4\uC6B4\uB85C\uB4DC", back: F.PAGES.my }, /* @__PURE__ */ React.createElement(F.MyPageLayout, { active: "downloads", label: "FO-09-01 \uAD6C\uB9E4 \uB0B4\uC5ED / \uB2E4\uC6B4\uB85C\uB4DC" }, /* @__PURE__ */ React.createElement("div", { className: "fo-chips", style: { padding: "2px 0 6px" } }, ["\uC804\uCCB4", "\uB2E4\uC6B4\uB85C\uB4DC \uAC00\uB2A5", "\uAE30\uAC04 \uB9CC\uB8CC"].map((k) => /* @__PURE__ */ React.createElement(Chip, { key: k, selected: filter === k, onClick: () => setFilter(k) }, k))), !dataReady ? /* @__PURE__ */ React.createElement("div", { style: { padding: "48px 16px", textAlign: "center", color: "var(--text-secondary)", fontSize: 14 } }, "\uAD6C\uB9E4 \uB0B4\uC5ED\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\u2026") : list.length ? /* @__PURE__ */ React.createElement("div", null, list.map((p, i) => {
      const disp = purchaseDisplay(p);
      const title = disp && disp.title || p && p.title || "\uC545\uBCF4";
      const cover = disp && disp.cover || "";
      const expired = !!(p && p.dday < 0);
      const rowKey = String(p && p.orderNo || "") + String(p && p.id || "") + String(i);
      return /* @__PURE__ */ React.createElement("div", { key: rowKey, style: { display: "flex", gap: 12, padding: "16px 0", borderTop: i ? "1px solid var(--border-default)" : "none", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 52, flex: "none", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-default)" } }, /* @__PURE__ */ React.createElement(F.StaffThumb, { ratio: "1 / 1", size: 17, src: cover || void 0, alt: title })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14.5, fontWeight: 600, letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, title), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7, marginTop: 5, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(F.DdayBadge, { dday: p.dday }), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11, color: "var(--text-secondary)" } }, p.date), /* @__PURE__ */ React.createElement("span", { className: "ds-mono fo-desktop", style: { fontSize: 11, color: "var(--text-tertiary)" } }, p.orderNo)), expired ? /* @__PURE__ */ React.createElement("div", { className: "fo-caption", style: { marginTop: 4 } }, "\uB2E4\uC6B4\uB85C\uB4DC \uAE30\uAC04\uC774 \uB9CC\uB8CC\uB418\uC5C8\uC5B4\uC694. \uACE0\uAC1D\uC13C\uD130\uC5D0\uC11C \uC7AC\uBC1C\uAE09\uC744 \uC694\uCCAD\uD560 \uC218 \uC788\uC5B4\uC694.") : null), /* @__PURE__ */ React.createElement(
        Button,
        {
          variant: expired ? "secondary" : "primary",
          size: "sm",
          iconLeft: "download",
          disabled: expired,
          onClick: () => F.downloadSheetPdf(disp.id || p.id, { title, expired, orderNo: p.orderNo })
        },
        expired ? "\uB9CC\uB8CC" : "PDF"
      ));
    })) : /* @__PURE__ */ React.createElement(F.Empty, { icon: "download", title: filter === "\uAE30\uAC04 \uB9CC\uB8CC" ? "\uB9CC\uB8CC\uB41C \uD56D\uBAA9\uC774 \uC5C6\uC5B4\uC694" : "\uAD6C\uB9E4\uD55C \uC545\uBCF4\uAC00 \uC5C6\uC5B4\uC694", sub: "\uACB0\uC81C\uAC00 \uC644\uB8CC\uB41C \uC545\uBCF4\uAC00 \uC5EC\uAE30\uC5D0 \uD45C\uC2DC\uB3FC\uC694.", action: "\uC545\uBCF4 \uB458\uB7EC\uBCF4\uAE30", href: F.PAGES.list }), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 20, padding: "12px 14px", background: "var(--surface-sunken)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "info", size: 14, style: { color: "var(--color-icon)", marginTop: 1, flex: "none" } }), /* @__PURE__ */ React.createElement("span", { className: "fo-caption" }, "\uB2E4\uC6B4\uB85C\uB4DC\uB294 ", /* @__PURE__ */ React.createElement("b", null, "\uACB0\uC81C\uC77C\uB85C\uBD80\uD130 7\uC77C(168\uC2DC\uAC04)"), " \uB3D9\uC548 \uAC00\uB2A5\uD558\uACE0, \uAE30\uAC04 \uB0B4\uC5D0\uB294 \uC5EC\uB7EC \uBC88 \uBC1B\uC744 \uC218 \uC788\uC5B4\uC694. PDF \uD30C\uC77C\uB85C \uC800\uC7A5\uB3FC\uC694."))));
  }
  ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(DownloadsPage, null));
})();
