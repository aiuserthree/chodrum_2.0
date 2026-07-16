(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Input, Icon, Card, Checkbox, SocialButton } = DS;
  const F = window.FO;
  function WithdrawPage() {
    F.useStoreTick();
    const user = Store.user.get();
    const social = F.isSocialUser(user);
    const provider = user && user.provider && user.provider !== "email" ? user.provider : "kakao";
    const [agree, setAgree] = React.useState(false);
    const [pw, setPw] = React.useState("");
    const [reauthed, setReauthed] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const canWithdraw = agree && (social ? reauthed : pw.length > 0);
    const withdraw = async () => {
      if (busy) return;
      setBusy(true);
      try {
        if (user && user.email && window.ChodrumAPI && ChodrumAPI.members) {
          await ChodrumAPI.members.updateStatus(user.email, "\uD0C8\uD1F4");
        }
        if (window.ChodrumAuth) await window.ChodrumAuth.signOut();
        else Store.user.clear();
        setDone(true);
      } catch (e) {
        F.toast(e && e.message || "\uD0C8\uD1F4 \uCC98\uB9AC\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694");
        setBusy(false);
      }
    };
    if (done) {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uD68C\uC6D0 \uD0C8\uD1F4", footer: false }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-09-04 \uD0C8\uD1F4 \uC644\uB8CC", className: "fo-container narrow", style: { padding: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "56px 0 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 56, height: 56, borderRadius: 9999, background: "var(--surface-sunken)", border: "1px solid var(--border-default)", color: "var(--color-icon)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 26 })), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 21, letterSpacing: "-0.5px" } }, "\uD0C8\uD1F4\uAC00 \uC644\uB8CC\uB418\uC5C8\uC5B4\uC694"), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { maxWidth: 300 } }, "\uADF8\uB3D9\uC548 \uC774\uC6A9\uD574\uC8FC\uC154\uC11C \uAC10\uC0AC\uD574\uC694. \uACC4\uC815 \uC815\uBCF4\uC640 \uAD6C\uB9E4 \uB0B4\uC5ED\uC740 \uAD00\uB828 \uBC95\uB839\uC5D0 \uB530\uB77C \uC77C\uC815 \uAE30\uAC04 \uBCF4\uAD00 \uD6C4 \uD30C\uAE30\uB3FC\uC694.")), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, onClick: () => location.href = F.PAGES.home }, "\uD648\uC73C\uB85C")));
    }
    if (!user) {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uD68C\uC6D0 \uD0C8\uD1F4", back: F.PAGES.my }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-09-04 \uD68C\uC6D0 \uD0C8\uD1F4 (\uBE44\uB85C\uADF8\uC778)", className: "fo-container narrow", style: { padding: "0 0 32px" } }, /* @__PURE__ */ React.createElement(F.Empty, { icon: "user", title: "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD574\uC694", sub: "\uD68C\uC6D0 \uD0C8\uD1F4\uB294 \uB85C\uADF8\uC778 \uD6C4 \uC774\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694.", action: "\uB85C\uADF8\uC778 / \uD68C\uC6D0\uAC00\uC785", href: F.PAGES.login })));
    }
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uD68C\uC6D0 \uD0C8\uD1F4", back: F.PAGES.edit }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-09-04 \uD68C\uC6D0 \uD0C8\uD1F4", className: "fo-container narrow", style: { padding: "0 0 32px" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "28px 0 16px" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 21, letterSpacing: "-0.5px" } }, "\uC815\uB9D0 \uD0C8\uD1F4\uD558\uC2DC\uACA0\uC5B4\uC694?"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.55 } }, "\uD0C8\uD1F4 \uC804\uC5D0 \uC544\uB798 \uB0B4\uC6A9\uC744 \uAF2D \uD655\uC778\uD574\uC8FC\uC138\uC694.")), /* @__PURE__ */ React.createElement(Card, { padding: 16, style: { display: "flex", flexDirection: "column", gap: 12 } }, [
      ["\uB0A8\uC544\uC788\uB294 \uB2E4\uC6B4\uB85C\uB4DC \uAE30\uAC04(7\uC77C)\uC774 \uC788\uC5B4\uB3C4 \uD0C8\uD1F4 \uC2DC \uB2E4\uC6B4\uB85C\uB4DC \uAD8C\uD55C\uC774 \uD568\uAED8 \uC0AC\uB77C\uC838\uC694.", "download"],
      ["\uAD6C\uB9E4 \uB0B4\uC5ED\uACFC \uCC1C \uBAA9\uB85D\uC774 \uC0AD\uC81C\uB418\uBA70 \uBCF5\uAD6C\uD560 \uC218 \uC5C6\uC5B4\uC694.", "receipt"],
      ["\uAC19\uC740 \uC774\uBA54\uC77C\uB85C \uC7AC\uAC00\uC785\uD574\uB3C4 \uC774\uC804 \uAD6C\uB9E4 \uB0B4\uC5ED\uC740 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC544\uC694.", "user"]
    ].map(([t, ic]) => /* @__PURE__ */ React.createElement("div", { key: ic, style: { display: "flex", gap: 10, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement(Icon, { name: ic, size: 15, style: { color: "var(--status-danger)", marginTop: 2, flex: "none" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, lineHeight: 1.55 } }, t)))), /* @__PURE__ */ React.createElement(F.Section, { label: "\uBCF8\uC778 \uD655\uC778" }, social ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("p", { className: "fo-caption" }, "\uC18C\uC15C \uD68C\uC6D0\uC740 \uBE44\uBC00\uBC88\uD638\uAC00 \uC5C6\uC5B4 \uD50C\uB7AB\uD3FC \uC7AC\uC778\uC99D\uC73C\uB85C \uBCF8\uC778\uC744 \uD655\uC778\uD574\uC694."), reauthed ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--status-success-bg)", borderRadius: "var(--radius-lg)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 14, style: { color: "var(--status-success)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, "\uC7AC\uC778\uC99D\uC774 \uC644\uB8CC\uB418\uC5C8\uC5B4\uC694.")) : /* @__PURE__ */ React.createElement(SocialButton, { provider, onClick: () => {
      setReauthed(true);
      F.toast("\uC18C\uC15C \uC7AC\uC778\uC99D\uC774 \uC644\uB8CC\uB418\uC5C8\uC5B4\uC694");
    } })) : /* @__PURE__ */ React.createElement(Input, { label: "\uBE44\uBC00\uBC88\uD638 \uD655\uC778", type: "password", placeholder: "\uD604\uC7AC \uBE44\uBC00\uBC88\uD638 \uC785\uB825", value: pw, onChange: (e) => setPw(e.target.value), hint: "\uBCF8\uC778 \uD655\uC778\uC744 \uC704\uD574 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694." })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18, display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement(Checkbox, { checked: agree, onChange: setAgree, label: "\uC704 \uB0B4\uC6A9\uC744 \uBAA8\uB450 \uD655\uC778\uD588\uACE0, \uD0C8\uD1F4\uC5D0 \uB3D9\uC758\uD574\uC694." }), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: !canWithdraw || busy, onClick: withdraw }, busy ? "\uCC98\uB9AC \uC911\u2026" : "\uD0C8\uD1F4\uD558\uAE30"), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "lg", fullWidth: true, onClick: () => location.href = F.PAGES.my }, "\uACC4\uC18D \uC774\uC6A9\uD558\uAE30"))));
  }
  ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(WithdrawPage, null));
})();
