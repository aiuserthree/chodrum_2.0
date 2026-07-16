(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Card, Badge } = DS;
  const F = window.FO;
  function PrivacyPage() {
    const doc = F.legalDoc("privacy") || { name: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68", ver: "v1.0", date: "2026.07.14", body: "" };
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68", back: F.PAGES.home, width: "mid" }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-11 \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68", style: { padding: "28px 0 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "clamp(22px, 3vw, 28px)", letterSpacing: "-0.9px" } }, doc.name), /* @__PURE__ */ React.createElement(Badge, { variant: "outline", size: "sm" }, doc.ver)), /* @__PURE__ */ React.createElement("p", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-tertiary)", marginTop: 8 } }, "\uC2DC\uD589\uC77C ", doc.date), /* @__PURE__ */ React.createElement(Card, { padding: 20, style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, lineHeight: 1.8, color: "var(--text-secondary)", whiteSpace: "pre-wrap" } }, doc.body))));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(PrivacyPage, null));
  });
})();
