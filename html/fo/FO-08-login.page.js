(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Input, Divider, SocialButton, Checkbox, Icon } = DS;
  const F = window.FO;
  const Auth = window.ChodrumAuth;
  const SAVED_EMAIL_KEY = "chodrum_saved_email";
  function readSavedEmail() {
    try {
      const v = localStorage.getItem(SAVED_EMAIL_KEY);
      return v && String(v).trim() || "";
    } catch (e) {
      return "";
    }
  }
  function persistSavedEmail(checked, value) {
    try {
      if (checked && value) localStorage.setItem(SAVED_EMAIL_KEY, value);
      else localStorage.removeItem(SAVED_EMAIL_KEY);
    } catch (e) {
    }
  }
  function LoginPage() {
    const saved = readSavedEmail();
    const [email, setEmail] = React.useState(saved);
    const [pw, setPw] = React.useState("");
    const [saveId, setSaveId] = React.useState(!!saved);
    const [err, setErr] = React.useState("");
    const [busy, setBusy] = React.useState(null);
    React.useEffect(() => {
      Auth.restoreSession().then((profile) => {
        if (profile) location.replace(F.PAGES.my);
      }).catch(() => {
      });
    }, []);
    const socialLogin = async (provider) => {
      if (busy) return;
      if (!Auth.isProviderEnabled(provider)) {
        F.toast(Auth.providerReason(provider) || "\uACE7 \uC9C0\uC6D0 \uC608\uC815\uC774\uC5D0\uC694");
        return;
      }
      setBusy(provider);
      setErr("");
      try {
        const r = await Auth.signInWithOAuth(provider);
        if (!r.ok) {
          setErr(r.error || "\uC18C\uC15C \uB85C\uADF8\uC778\uC744 \uC2DC\uC791\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
          F.toast(r.error || "\uC18C\uC15C \uB85C\uADF8\uC778 \uC2E4\uD328");
          setBusy(null);
        }
      } catch (e) {
        setErr(e && e.message || "\uC18C\uC15C \uB85C\uADF8\uC778 \uC624\uB958");
        setBusy(null);
      }
    };
    const emailLogin = async (e) => {
      e.preventDefault();
      if (busy) return;
      if (!/.+@.+\..+/.test(email) || pw.length < 1) {
        setErr("\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694.");
        return;
      }
      setBusy("email");
      setErr("");
      try {
        const trimmed = email.trim();
        const r = await Auth.signInWithPassword(trimmed, pw);
        if (!r.ok) {
          setErr(r.error || "\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694.");
          setBusy(null);
          return;
        }
        persistSavedEmail(saveId, trimmed);
        location.href = F.PAGES.my;
      } catch (ex) {
        setErr(ex && ex.message || "\uB85C\uADF8\uC778 \uC624\uB958");
        setBusy(null);
      }
    };
    const socialStyle = (provider) => Auth.isProviderEnabled(provider) ? busy === provider ? { opacity: 0.7, pointerEvents: "none" } : void 0 : { opacity: 0.45, cursor: "not-allowed", filter: "grayscale(0.35)" };
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uB85C\uADF8\uC778", back: F.PAGES.home, footer: false }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-08-01 \uB85C\uADF8\uC778", className: "fo-container narrow", style: { padding: "0 0 40px" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "32px 0 22px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("img", { src: "../shared/logo.png", alt: "CHODRUM \uB85C\uACE0", style: { width: 88, height: 88, objectFit: "contain", display: "block", margin: "0 auto" } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 23, fontWeight: 600, letterSpacing: "-0.6px", marginTop: 8 } }, "CHODRUM"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: "var(--text-secondary)", marginTop: 6 } }, "\uB2E4\uC2DC \uC624\uC2E0 \uAC78 \uD658\uC601\uD574\uC694")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement(SocialButton, { provider: "kakao", style: socialStyle("kakao"), onClick: () => socialLogin("kakao") }), /* @__PURE__ */ React.createElement(SocialButton, { provider: "naver", style: socialStyle("naver"), onClick: () => socialLogin("naver") }), /* @__PURE__ */ React.createElement(SocialButton, { provider: "google", style: socialStyle("google"), onClick: () => socialLogin("google") }), !Auth.isProviderEnabled("kakao") || !Auth.isProviderEnabled("naver") ? /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { textAlign: "center" } }, !Auth.isProviderEnabled("kakao") && !Auth.isProviderEnabled("naver") ? "\uCE74\uCE74\uC624\xB7\uB124\uC774\uBC84\uB294 Client ID\uC640 Edge Function \uC124\uC815 \uD6C4 \uC774\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694. Google\uB85C \uACC4\uC18D\uD574 \uC8FC\uC138\uC694." : !Auth.isProviderEnabled("kakao") ? "\uCE74\uCE74\uC624\uB294 REST API \uD0A4\xB7Edge Function(kakao-auth) \uC124\uC815 \uD6C4 \uC774\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694." : "\uB124\uC774\uBC84\uB294 Client ID\xB7Edge Function(naver-auth) \uC124\uC815 \uD6C4 \uC774\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694.") : null), /* @__PURE__ */ React.createElement(Divider, { label: "\uB610\uB294 \uC774\uBA54\uC77C\uB85C", spacing: 20 }), /* @__PURE__ */ React.createElement("form", { onSubmit: emailLogin, style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uC774\uBA54\uC77C", type: "email", placeholder: "you@example.com", value: email, onChange: (e) => {
      setEmail(e.target.value);
      setErr("");
    } }), /* @__PURE__ */ React.createElement(Input, { label: "\uBE44\uBC00\uBC88\uD638", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: pw, onChange: (e) => {
      setPw(e.target.value);
      setErr("");
    }, error: err || void 0 }), /* @__PURE__ */ React.createElement(Checkbox, { checked: saveId, onChange: setSaveId, label: "\uC544\uC774\uB514 \uC800\uC7A5" }), /* @__PURE__ */ React.createElement(Button, { type: "submit", variant: "primary", size: "lg", fullWidth: true, disabled: busy === "email" }, busy === "email" ? "\uB85C\uADF8\uC778 \uC911\u2026" : "\uB85C\uADF8\uC778")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 18, fontSize: 13, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("a", { href: F.PAGES.signup, style: { fontWeight: 500 } }, "\uD68C\uC6D0\uAC00\uC785"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--border-strong)" } }, "\xB7"), /* @__PURE__ */ React.createElement("a", { href: F.PAGES.findId, style: { color: "var(--text-secondary)" } }, "\uC544\uC774\uB514 \uCC3E\uAE30"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--border-strong)" } }, "\xB7"), /* @__PURE__ */ React.createElement("a", { href: F.PAGES.reset, style: { color: "var(--text-secondary)" } }, "\uBE44\uBC00\uBC88\uD638 \uCC3E\uAE30"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--border-strong)" } }, "\xB7"), /* @__PURE__ */ React.createElement("a", { href: F.PAGES.guest, style: { color: "var(--text-secondary)" } }, "\uBE44\uD68C\uC6D0 \uC8FC\uBB38 \uC870\uD68C")), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { textAlign: "center", marginTop: 22 } }, "\uC18C\uC15C \uD68C\uC6D0\uC740 \uBE44\uBC00\uBC88\uD638 \uC5C6\uC774 \uAC01 \uD50C\uB7AB\uD3FC \uC778\uC99D\uC73C\uB85C \uB85C\uADF8\uC778\uD574\uC694.", /* @__PURE__ */ React.createElement("br", null), "\uBE44\uBC00\uBC88\uD638 \uCC3E\uAE30\uB294 \uC774\uBA54\uC77C\uB85C \uAC00\uC785\uD55C \uC77C\uBC18 \uD68C\uC6D0\uB9CC \uC774\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694.")));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(LoginPage, null));
  });
})();
