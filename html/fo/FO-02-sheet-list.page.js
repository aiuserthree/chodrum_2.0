(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Icon, Chip, Select, Input, Checkbox } = DS;
  const F = window.FO;
  const D = window.DrumData;
  function FilterGroup({ label, children }) {
    return /* @__PURE__ */ React.createElement("div", { style: { paddingBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 } }, label), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, children));
  }
  function ListPage() {
    const [q, setQ] = React.useState(F.qp("q") || "");
    const [cat, setCat] = React.useState(F.qp("cat") || "\uC804\uCCB4");
    const [levels, setLevels] = React.useState([]);
    const [sort, setSort] = React.useState(F.qp("sort") || "\uC778\uAE30\uC21C");
    const toggleLevel = (l) => setLevels((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l]);
    const reset = () => {
      setQ("");
      setCat("\uC804\uCCB4");
      setLevels([]);
      setSort("\uC778\uAE30\uC21C");
    };
    const catalog = D.visibleSheets ? D.visibleSheets() : D.sheets.filter((s) => !s.status || s.status === "\uD310\uB9E4\uC911");
    let list = catalog.filter((s) => cat === "\uC804\uCCB4" || s.genre === cat).filter((s) => !levels.length || levels.includes(s.level)).filter((s) => !q || (s.title + s.artist).toLowerCase().includes(q.toLowerCase()));
    list = [...list].sort((a, b) => sort === "\uAC00\uACA9\uC21C" ? a.price - b.price : sort === "\uC774\uB984\uC21C" ? a.title.localeCompare(b.title, "ko") : sort === "\uCD5C\uC2E0\uC21C" ? (
      /* 최신순: created_at 내림차순 (NEW 배지와 별개) */
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ) : (
      /* 인기순: 관리자 「인기악보」 체크 우선, 같으면 판매량 */
      Number(!!b.popular) - Number(!!a.popular) || b.sold - a.sold
    ));
    const reco = [...catalog].filter((s) => s.popular).slice(0, 4);
    const cats = ["\uC804\uCCB4", ...D.genres];
    return /* @__PURE__ */ React.createElement(F.Scaffold, { tab: "list", title: "\uC545\uBCF4" }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-02 \uC545\uBCF4 \uBAA9\uB85D", className: "fo-list-layout", style: { paddingTop: 20 } }, /* @__PURE__ */ React.createElement("aside", { className: "fo-filters" }, /* @__PURE__ */ React.createElement(FilterGroup, { label: "\uCE74\uD14C\uACE0\uB9AC / \uC7A5\uB974" }, cats.map((c) => /* @__PURE__ */ React.createElement("button", { key: c, onClick: () => setCat(c), style: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 10px", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: cat === c ? 600 : 500, background: cat === c ? "#f1f1f1" : "transparent", color: cat === c ? "var(--color-ink)" : "var(--text-secondary)" } }, c, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11, color: "var(--text-tertiary)" } }, c === "\uC804\uCCB4" ? catalog.length : catalog.filter((s) => s.genre === c).length)))), /* @__PURE__ */ React.createElement(FilterGroup, { label: "\uB09C\uC774\uB3C4" }, D.levels.map((l) => /* @__PURE__ */ React.createElement(Checkbox, { key: l, checked: levels.includes(l), onChange: () => toggleLevel(l), label: l }))), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", iconLeft: "x", onClick: reset }, "\uD544\uD130 \uCD08\uAE30\uD654")), /* @__PURE__ */ React.createElement("div", { className: "fo-list-main" }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 480 }, className: "fo-mobile" }, /* @__PURE__ */ React.createElement(Input, { iconLeft: "search", placeholder: "\uACE1\uBA85, \uC544\uD2F0\uC2A4\uD2B8 \uAC80\uC0C9", value: q, onChange: (e) => setQ(e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "fo-mobile-filters" }, /* @__PURE__ */ React.createElement("div", { className: "fo-chips", style: { padding: "12px 0 2px" } }, cats.map((c) => /* @__PURE__ */ React.createElement(Chip, { key: c, selected: cat === c, onClick: () => setCat(c) }, c))), /* @__PURE__ */ React.createElement("div", { className: "fo-chips", style: { padding: "8px 0 2px" } }, D.levels.map((l) => /* @__PURE__ */ React.createElement(Chip, { key: l, selected: levels.includes(l), onClick: () => toggleLevel(l) }, l)))), /* @__PURE__ */ React.createElement("div", { className: "fo-list-toolbar" }, /* @__PURE__ */ React.createElement("span", { className: "ds-mono fo-list-toolbar-meta" }, list.length, "\uAC1C\uC758 \uC545\uBCF4", q ? /* @__PURE__ */ React.createElement("span", null, " \xB7 \u2018", q, "\u2019 \uAC80\uC0C9 \uACB0\uACFC") : null), /* @__PURE__ */ React.createElement("div", { className: "fo-list-toolbar-sort" }, /* @__PURE__ */ React.createElement(Select, { size: "sm", value: sort, onChange: (e) => setSort(e.target.value), options: D.sorts }))), list.length ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "fo-grid" }, list.map((s) => /* @__PURE__ */ React.createElement(F.SheetCard, { key: s.id, s }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", paddingTop: 28 } }, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "md", iconRight: "chevron-down", onClick: () => F.toast("\uB9C8\uC9C0\uB9C9 \uD398\uC774\uC9C0\uC608\uC694") }, "\uB354\uBCF4\uAE30"))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(F.Empty, { icon: "search", title: "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4", sub: "\uB2E4\uB978 \uAC80\uC0C9\uC5B4\uB098 \uD544\uD130\uB85C \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uBCF4\uC138\uC694.", action: "\uD544\uD130 \uCD08\uAE30\uD654", onAction: reset }), /* @__PURE__ */ React.createElement(F.SectionHeader, { title: "\uC774\uB7F0 \uC545\uBCF4\uB294 \uC5B4\uB54C\uC694?" }), /* @__PURE__ */ React.createElement("div", { className: "fo-grid" }, reco.map((s) => /* @__PURE__ */ React.createElement(F.SheetCard, { key: s.id, s })))))));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(ListPage, null));
  });
})();
