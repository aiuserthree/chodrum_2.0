(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Input, Icon } = DS;
  const F = window.FO;
  const Auth = window.ChodrumAuth;
  function ResetPage() {
    const [step, setStep] = React.useState(1);
    const [email, setEmail] = React.useState("");
    const [code, setCode] = React.useState("");
    const [pw, setPw] = React.useState("");
    const [pw2, setPw2] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState("");
    const emailOk = /.+@.+\..+/.test(email);
    const pwCheck = Auth.validatePassword(pw);
    const sendCode = async () => {
      if (!emailOk || busy) return;
      setBusy(true);
      setErr("");
      try {
        const r = await Auth.sendPasswordRecovery(email.trim());
        if (!r.ok) {
          setErr(r.error || "\uC778\uC99D\uCF54\uB4DC\uB97C \uBCF4\uB0B4\uC9C0 \uBABB\uD588\uC5B4\uC694");
          F.toast(r.error || "\uBC1C\uC1A1 \uC2E4\uD328");
          setBusy(false);
          return;
        }
        setStep(2);
        F.toast("\uC778\uC99D\uCF54\uB4DC\uB97C \uBCF4\uB0C8\uC5B4\uC694. \uBA54\uC77C\uD568\xB7\uC2A4\uD338\uD568\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
      } catch (e) {
        setErr(e && e.message || "\uBC1C\uC1A1 \uC624\uB958");
      }
      setBusy(false);
    };
    const verify = async () => {
      if (busy || code.trim().length !== 6) return;
      setBusy(true);
      setErr("");
      try {
        const r = await Auth.verifyRecoveryOtp(email.trim(), code.trim());
        if (!r.ok) {
          setErr(r.error || "\uC778\uC99D\uCF54\uB4DC\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC544\uC694");
          setBusy(false);
          return;
        }
        setStep(3);
      } catch (e) {
        setErr(e && e.message || "\uC778\uC99D \uC624\uB958");
      }
      setBusy(false);
    };
    const changePw = async () => {
      if (busy) return;
      if (!pwCheck.ok) {
        setErr(pwCheck.error);
        return;
      }
      if (pw !== pw2) {
        setErr("\uBE44\uBC00\uBC88\uD638\uAC00 \uC11C\uB85C \uB2EC\uB77C\uC694.");
        return;
      }
      setBusy(true);
      setErr("");
      try {
        const r = await Auth.updatePassword(pw);
        if (!r.ok) {
          setErr(r.error || "\uBE44\uBC00\uBC88\uD638\uB97C \uBCC0\uACBD\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694");
          setBusy(false);
          return;
        }
        setStep(4);
      } catch (e) {
        setErr(e && e.message || "\uBCC0\uACBD \uC624\uB958");
      }
      setBusy(false);
    };
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uBE44\uBC00\uBC88\uD638 \uCC3E\uAE30", back: F.PAGES.login, footer: false }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-08 \uBE44\uBC00\uBC88\uD638 \uCC3E\uAE30", className: "fo-container narrow", style: { padding: "0 0 40px" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "36px 0 20px" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 22, letterSpacing: "-0.6px" } }, "\uBE44\uBC00\uBC88\uD638\uB97C \uC78A\uC73C\uC168\uB098\uC694?"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.55 } }, "\uAC00\uC785\uD55C \uC774\uBA54\uC77C\uB85C \uC778\uC99D\uD558\uBA74 \uC0C8 \uBE44\uBC00\uBC88\uD638\uB97C \uC124\uC815\uD560 \uC218 \uC788\uC5B4\uC694.")), step === 1 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uAC00\uC785 \uC774\uBA54\uC77C", type: "email", placeholder: "you@example.com", value: email, onChange: (e) => {
      setEmail(e.target.value);
      setErr("");
    }, error: err || void 0 }), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: !emailOk || busy, onClick: sendCode }, busy ? "\uBC1C\uC1A1 \uC911\u2026" : "\uC778\uC99D\uCF54\uB4DC \uBC1B\uAE30")) : null, step === 2 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uC778\uC99D\uCF54\uB4DC", placeholder: "6\uC790\uB9AC \uCF54\uB4DC", value: code, onChange: (e) => {
      setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
      setErr("");
    }, error: err || void 0, hint: email + " \uB85C \uCF54\uB4DC\uB97C \uBCF4\uB0C8\uC5B4\uC694. \uC2A4\uD338\uD568\uB3C4 \uD655\uC778\uD574\uBCF4\uC138\uC694." }), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: code.trim().length !== 6 || busy, onClick: verify }, busy ? "\uD655\uC778 \uC911\u2026" : "\uC778\uC99D \uD655\uC778"), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "md", fullWidth: true, disabled: busy, onClick: sendCode }, "\uCF54\uB4DC \uC7AC\uBC1C\uC1A1")) : null, step === 3 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uC0C8 \uBE44\uBC00\uBC88\uD638", type: "password", placeholder: Auth.passwordHint(), value: pw, onChange: (e) => {
      setPw(e.target.value);
      setErr("");
    }, error: pw && !pwCheck.ok ? pwCheck.error : err || void 0, hint: Auth.passwordHint() }), /* @__PURE__ */ React.createElement(Input, { label: "\uC0C8 \uBE44\uBC00\uBC88\uD638 \uD655\uC778", type: "password", placeholder: "\uD55C \uBC88 \uB354 \uC785\uB825", value: pw2, onChange: (e) => setPw2(e.target.value), error: pw2 && pw !== pw2 ? "\uBE44\uBC00\uBC88\uD638\uAC00 \uC11C\uB85C \uB2EC\uB77C\uC694." : void 0 }), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: !(pwCheck.ok && pw === pw2) || busy, onClick: changePw }, busy ? "\uBCC0\uACBD \uC911\u2026" : "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD")) : null, step === 4 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center", padding: "20px 0" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 56, height: 56, borderRadius: 9999, background: "var(--status-success-bg)", color: "var(--status-success)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 28 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 600, letterSpacing: "-0.4px" } }, "\uBE44\uBC00\uBC88\uD638\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC5B4\uC694"), /* @__PURE__ */ React.createElement("p", { className: "fo-caption" }, "\uC0C8 \uBE44\uBC00\uBC88\uD638\uB85C \uB2E4\uC2DC \uB85C\uADF8\uC778\uD574\uC8FC\uC138\uC694."), /* @__PURE__ */ React.createElement("div", { style: { width: "100%" } }, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, onClick: () => location.href = F.PAGES.login }, "\uB85C\uADF8\uC778\uD558\uB7EC \uAC00\uAE30"))) : null, /* @__PURE__ */ React.createElement("div", { style: { marginTop: 24, padding: "12px 14px", background: "var(--surface-sunken)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "info", size: 14, style: { color: "var(--color-icon)", marginTop: 1, flex: "none" } }), /* @__PURE__ */ React.createElement("span", { className: "fo-caption" }, "\uCE74\uCE74\uC624 \xB7 \uB124\uC774\uBC84 \xB7 \uAD6C\uAE00\uB85C \uAC00\uC785\uD55C \uC18C\uC15C \uD68C\uC6D0\uC740 \uBE44\uBC00\uBC88\uD638\uAC00 \uC5C6\uC5B4\uC694. \uAC01 \uD50C\uB7AB\uD3FC\uC758 \uC18C\uC15C \uB85C\uADF8\uC778\uC744 \uC774\uC6A9\uD574\uC8FC\uC138\uC694."))));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(ResetPage, null));
  });
})();
