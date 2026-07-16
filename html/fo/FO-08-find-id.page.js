(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Input, Icon, Card, Badge } = DS;
  const F = window.FO;
  const SAMPLE_MEMBERS = [];
  const PROVIDER_LABEL = { email: "\uC774\uBA54\uC77C", kakao: "\uCE74\uCE74\uC624", naver: "\uB124\uC774\uBC84", google: "\uAD6C\uAE00" };
  function maskEmail(email) {
    const [local, domain] = email.split("@");
    const head = local.slice(0, 2);
    const stars = "*".repeat(Math.max(2, local.length - 2));
    return head + stars + "@" + domain;
  }
  function FindIdPage() {
    const [name, setName] = React.useState("");
    const [birth, setBirth] = React.useState("");
    const [result, setResult] = React.useState(null);
    const birthOk = /^\d{8}$/.test(birth);
    const canSubmit = name.trim().length >= 2 && birthOk;
    const search = (e) => {
      e.preventDefault();
      if (!canSubmit) return;
      const db = [...SAMPLE_MEMBERS];
      const u = Store.user.get();
      if (u && u.birth) db.push(u);
      const hit = db.find((m) => m.name === name.trim() && m.birth === birth);
      setResult(hit || "none");
    };
    const reset = () => {
      setResult(null);
      setName("");
      setBirth("");
    };
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uC544\uC774\uB514 \uCC3E\uAE30", back: F.PAGES.login, footer: false }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-08 \uC544\uC774\uB514 \uCC3E\uAE30", className: "fo-container narrow", style: { padding: "0 0 40px" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "36px 0 20px" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 22, letterSpacing: "-0.6px" } }, "\uC544\uC774\uB514\uB97C \uC78A\uC73C\uC168\uB098\uC694?"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.55 } }, "\uAC00\uC785 \uC2DC \uC785\uB825\uD55C \uC774\uB984\uACFC \uC0DD\uB144\uC6D4\uC77C\uC774 \uC77C\uCE58\uD558\uBA74 \uC544\uC774\uB514(\uC774\uBA54\uC77C)\uB97C \uC54C\uB824\uB4DC\uB824\uC694.")), result === null ? /* @__PURE__ */ React.createElement("form", { onSubmit: search, style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uC774\uB984", placeholder: "\uAC00\uC785 \uC2DC \uC785\uB825\uD55C \uC774\uB984", value: name, onChange: (e) => setName(e.target.value) }), /* @__PURE__ */ React.createElement(Input, { label: "\uC0DD\uB144\uC6D4\uC77C", inputMode: "numeric", maxLength: 8, placeholder: "YYYYMMDD \xB7 \uC608: 19950413", value: birth, onChange: (e) => setBirth(e.target.value.replace(/\D/g, "").slice(0, 8)), error: birth && !birthOk ? "\uC0DD\uB144\uC6D4\uC77C 8\uC790\uB9AC\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694." : void 0 }), /* @__PURE__ */ React.createElement(Button, { type: "submit", variant: "primary", size: "lg", fullWidth: true, disabled: !canSubmit }, "\uC544\uC774\uB514 \uCC3E\uAE30")) : null, result && result !== "none" ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 14, style: { color: "var(--status-success)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5 } }, "\uD68C\uC6D0 \uC815\uBCF4\uAC00 \uD655\uC778\uB418\uC5C8\uC5B4\uC694.")), /* @__PURE__ */ React.createElement(Card, { padding: 20, style: { textAlign: "center", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-secondary)" } }, result.name, " \uB2D8\uC758 \uC544\uC774\uB514"), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 20, fontWeight: 600, letterSpacing: "-0.3px", wordBreak: "break-all" } }, maskEmail(result.email)), /* @__PURE__ */ React.createElement(Badge, { variant: result.provider === "email" ? "neutral" : "outline", size: "sm" }, PROVIDER_LABEL[result.provider] || "\uC774\uBA54\uC77C", " \uAC00\uC785"), /* @__PURE__ */ React.createElement("p", { className: "fo-caption" }, "\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uB97C \uC704\uD574 \uC77C\uBD80\uB97C \uAC00\uB824\uC11C \uBCF4\uC5EC\uB4DC\uB824\uC694.")), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, onClick: () => location.href = F.PAGES.login }, "\uB85C\uADF8\uC778\uD558\uB7EC \uAC00\uAE30"), result.provider === "email" ? /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "lg", fullWidth: true, onClick: () => location.href = F.PAGES.reset }, "\uBE44\uBC00\uBC88\uD638 \uCC3E\uAE30") : /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { textAlign: "center" } }, PROVIDER_LABEL[result.provider], " \uAC04\uD3B8\uAC00\uC785 \uD68C\uC6D0\uC774\uC5D0\uC694. \uBE44\uBC00\uBC88\uD638 \uC5C6\uC774 ", PROVIDER_LABEL[result.provider], " \uB85C\uADF8\uC778\uC73C\uB85C \uC774\uC6A9\uD574\uC8FC\uC138\uC694."), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "md", fullWidth: true, onClick: reset }, "\uB2E4\uC2DC \uCC3E\uAE30")) : null, result === "none" ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement(F.Empty, { icon: "user", title: "\uC77C\uCE58\uD558\uB294 \uD68C\uC6D0 \uC815\uBCF4\uAC00 \uC5C6\uC5B4\uC694", sub: "\uC774\uB984\uACFC \uC0DD\uB144\uC6D4\uC77C\uC744 \uB2E4\uC2DC \uD655\uC778\uD574\uC8FC\uC138\uC694. \uC785\uB825\uD55C \uC815\uBCF4\uAC00 \uAC00\uC785 \uC815\uBCF4\uC640 \uC815\uD655\uD788 \uC77C\uCE58\uD574\uC57C \uD574\uC694." }), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, onClick: reset }, "\uB2E4\uC2DC \uC785\uB825\uD558\uAE30"), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "lg", fullWidth: true, onClick: () => location.href = F.PAGES.signup }, "\uD68C\uC6D0\uAC00\uC785")) : null, /* @__PURE__ */ React.createElement("div", { style: { marginTop: 24, padding: "12px 14px", background: "var(--surface-sunken)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "info", size: 14, style: { color: "var(--color-icon)", marginTop: 1, flex: "none" } }), /* @__PURE__ */ React.createElement("span", { className: "fo-caption" }, "\uBE44\uD68C\uC6D0\uC73C\uB85C \uAD6C\uB9E4\uD558\uC168\uB2E4\uBA74 \uC544\uC774\uB514\uAC00 \uC5C6\uC5B4\uC694. ", /* @__PURE__ */ React.createElement("a", { href: F.PAGES.guest, style: { textDecoration: "underline", textUnderlineOffset: 2 } }, "\uBE44\uD68C\uC6D0 \uC8FC\uBB38 \uC870\uD68C"), "\uC5D0\uC11C \uC8FC\uBB38 \uC774\uBA54\uC77C\uB85C \uD655\uC778\uD574\uC8FC\uC138\uC694."))));
  }
  ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(FindIdPage, null));
})();
