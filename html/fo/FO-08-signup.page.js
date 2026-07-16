(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Input, Divider, SocialButton, Checkbox, Icon, Badge } = DS;
  const F = window.FO;
  const Auth = window.ChodrumAuth;
  function Steps({ cur }) {
    const items = ["\uC774\uBA54\uC77C \uC778\uC99D", "\uC815\uBCF4 \uC785\uB825", "\uC57D\uAD00 \uB3D9\uC758"];
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 0, padding: "4px 0 24px" } }, items.map((l, i) => {
      const n = i + 1;
      const on = cur === n, done = cur > n;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, i ? /* @__PURE__ */ React.createElement("span", { style: { flex: 1, height: 1, background: done || on ? "var(--color-ink)" : "var(--border-default)", margin: "0 8px" } }) : null, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 7 } }, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { width: 22, height: 22, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, background: on || done ? "var(--color-ink)" : "transparent", color: on || done ? "#fff" : "var(--text-tertiary)", border: on || done ? "none" : "1px solid var(--border-strong)" } }, done ? /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 12 }) : n), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, fontWeight: on ? 600 : 500, color: on ? "var(--color-ink)" : "var(--text-tertiary)", whiteSpace: "nowrap" } }, l)));
    }));
  }
  function SignupPage() {
    const [step, setStep] = React.useState(1);
    const [email, setEmail] = React.useState("");
    const [sent, setSent] = React.useState(false);
    const [emailVerified, setEmailVerified] = React.useState(false);
    const [code, setCode] = React.useState("");
    const [codeErr, setCodeErr] = React.useState("");
    const [emailErr, setEmailErr] = React.useState("");
    const [pw, setPw] = React.useState("");
    const [pw2, setPw2] = React.useState("");
    const [name, setName] = React.useState("");
    const [birth, setBirth] = React.useState("");
    const [t1, setT1] = React.useState(false);
    const [t2, setT2] = React.useState(false);
    const [t3, setT3] = React.useState(false);
    const [doc, setDoc] = React.useState(null);
    const [done, setDone] = React.useState(false);
    const [busy, setBusy] = React.useState(null);
    const [pwErr, setPwErr] = React.useState("");
    const [nameErr, setNameErr] = React.useState("");
    const emailOk = /.+@.+\..+/.test(email);
    const codeOk = /^\d{6}$/.test(code.trim());
    const pwCheck = Auth.validatePassword(pw);
    const pwOk = pwCheck.ok && pw === pw2;
    const nameOk = name.trim().length >= 2;
    const birthOk = /^\d{8}$/.test(birth) && +birth.slice(4, 6) >= 1 && +birth.slice(4, 6) <= 12 && +birth.slice(6, 8) >= 1 && +birth.slice(6, 8) <= 31;
    const uiStep = emailVerified ? step : 1;
    const onEmailChange = (v) => {
      setEmail(v);
      setEmailErr("");
      if (emailVerified || sent || step !== 1) {
        setSent(false);
        setEmailVerified(false);
        setCode("");
        setCodeErr("");
        setStep(1);
      }
    };
    const goLogin = () => {
      location.href = F.PAGES.login;
    };
    const socialSignup = async (provider) => {
      if (busy) return;
      if (!Auth.isProviderEnabled(provider)) {
        F.toast(Auth.providerReason(provider) || "\uACE7 \uC9C0\uC6D0 \uC608\uC815\uC774\uC5D0\uC694");
        return;
      }
      setBusy(provider);
      try {
        const r = await Auth.signInWithOAuth(provider);
        if (!r.ok) {
          F.toast(r.error || "\uC18C\uC15C \uAC00\uC785\uC744 \uC2DC\uC791\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
          setBusy(null);
        }
      } catch (e) {
        F.toast(e && e.message || "\uC18C\uC15C \uAC00\uC785 \uC624\uB958");
        setBusy(null);
      }
    };
    const socialStyle = (provider) => Auth.isProviderEnabled(provider) ? busy === provider ? { opacity: 0.7, pointerEvents: "none" } : void 0 : { opacity: 0.45, cursor: "not-allowed", filter: "grayscale(0.35)" };
    const sendCode = async () => {
      if (!emailOk || busy) return;
      setBusy("otp");
      setCodeErr("");
      setEmailErr("");
      setEmailVerified(false);
      try {
        const r = await Auth.sendEmailOtp(email.trim(), { forSignup: true });
        if (!r.ok) {
          if (r.alreadyMember) {
            setEmailErr(r.error || "\uC774\uBBF8 \uAC00\uC785\uB41C \uC774\uBA54\uC77C\uC774\uC5D0\uC694. \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.");
            setSent(false);
            F.toast(r.error || "\uC774\uBBF8 \uAC00\uC785\uB41C \uC774\uBA54\uC77C\uC774\uC5D0\uC694. \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.");
          } else {
            F.toast(r.error || "\uC778\uC99D\uCF54\uB4DC\uB97C \uBCF4\uB0B4\uC9C0 \uBABB\uD588\uC5B4\uC694");
          }
          setBusy(null);
          return;
        }
        setSent(true);
        setCode("");
        F.toast("\uC778\uC99D\uCF54\uB4DC\uB97C \uBCF4\uB0C8\uC5B4\uC694. \uBA54\uC77C\uD568\xB7\uC2A4\uD338\uD568\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
      } catch (e) {
        F.toast(e && e.message || "\uC778\uC99D\uCF54\uB4DC \uBC1C\uC1A1 \uC624\uB958");
      }
      setBusy(null);
    };
    const verify = async () => {
      if (busy) return;
      if (!sent) {
        setCodeErr("\uBA3C\uC800 \uC778\uC99D\uCF54\uB4DC\uB97C \uBC1B\uC544\uC8FC\uC138\uC694.");
        return;
      }
      if (!codeOk) {
        setCodeErr("6\uC790\uB9AC \uC778\uC99D\uCF54\uB4DC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
        return;
      }
      setBusy("verify");
      setCodeErr("");
      setEmailErr("");
      try {
        const r = await Auth.verifyEmailOtp(email.trim(), code.trim(), { forSignup: true });
        if (!r.ok) {
          setEmailVerified(false);
          if (r.alreadyMember) {
            setEmailErr(r.error || "\uC774\uBBF8 \uAC00\uC785\uB41C \uC774\uBA54\uC77C\uC774\uC5D0\uC694. \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.");
            setSent(false);
            setCode("");
            F.toast(r.error || "\uC774\uBBF8 \uAC00\uC785\uB41C \uC774\uBA54\uC77C\uC774\uC5D0\uC694. \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.");
          } else {
            setCodeErr(r.error || "\uC778\uC99D\uCF54\uB4DC\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC544\uC694.");
          }
          setBusy(null);
          return;
        }
        if (!r.session) {
          setEmailVerified(false);
          setCodeErr("\uC778\uC99D\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694. \uCF54\uB4DC\uB97C \uB2E4\uC2DC \uD655\uC778\uD574\uC8FC\uC138\uC694.");
          setBusy(null);
          return;
        }
        setEmailVerified(true);
        setStep(2);
      } catch (e) {
        setEmailVerified(false);
        setCodeErr(e && e.message || "\uC778\uC99D\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694.");
      }
      setBusy(null);
    };
    const goInfoNext = () => {
      if (!emailVerified) {
        F.toast("\uC774\uBA54\uC77C \uC778\uC99D\uC744 \uBA3C\uC800 \uC644\uB8CC\uD574\uC8FC\uC138\uC694.");
        setStep(1);
        return;
      }
      if (!name.trim()) {
        setNameErr("\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
        return;
      }
      if (!nameOk) {
        setNameErr("\uC774\uB984\uC744 2\uC790 \uC774\uC0C1 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
        return;
      }
      setNameErr("");
      const v = Auth.validatePassword(pw);
      if (!v.ok) {
        setPwErr(v.error);
        return;
      }
      if (pw !== pw2) {
        setPwErr("\uBE44\uBC00\uBC88\uD638\uAC00 \uC11C\uB85C \uB2EC\uB77C\uC694.");
        return;
      }
      setPwErr("");
      setStep(3);
    };
    const finish = async () => {
      if (busy || !(t1 && t2)) return;
      if (!emailVerified) {
        F.toast("\uC774\uBA54\uC77C \uC778\uC99D\uC744 \uBA3C\uC800 \uC644\uB8CC\uD574\uC8FC\uC138\uC694.");
        setStep(1);
        return;
      }
      if (!name.trim() || !nameOk) {
        F.toast(!name.trim() ? "\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694." : "\uC774\uB984\uC744 2\uC790 \uC774\uC0C1 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
        setStep(2);
        return;
      }
      setBusy("finish");
      try {
        const r = await Auth.completeEmailSignup({
          name: name.trim(),
          birth,
          password: pw,
          marketing: !!t3
        });
        if (!r.ok) {
          if (r.alreadyMember) {
            F.toast(r.error || "\uC774\uBBF8 \uAC00\uC785\uB41C \uC774\uBA54\uC77C\uC774\uC5D0\uC694. \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.");
            setTimeout(goLogin, 800);
          } else {
            F.toast(r.error || "\uAC00\uC785\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694");
          }
          setBusy(null);
          return;
        }
        setDone(true);
      } catch (e) {
        F.toast(e && e.message || "\uAC00\uC785 \uC624\uB958");
        setBusy(null);
      }
    };
    if (done) {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uD68C\uC6D0\uAC00\uC785", footer: false }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-08-02 \uAC00\uC785 \uC644\uB8CC", className: "fo-container narrow", style: { padding: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "56px 0 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 60, height: 60, borderRadius: 9999, background: "var(--status-success-bg)", color: "var(--status-success)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 30 })), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 22, letterSpacing: "-0.6px" } }, "\uAC00\uC785\uC774 \uC644\uB8CC\uB418\uC5C8\uC5B4\uC694"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 } }, /* @__PURE__ */ React.createElement("span", { className: "ds-mono" }, email), " \uACC4\uC815\uC73C\uB85C", /* @__PURE__ */ React.createElement("br", null), "\uAC00\uC785\uD588\uC5B4\uC694. \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, onClick: goLogin }, "\uB85C\uADF8\uC778"))));
    }
    const docTitle = doc === "privacy" ? "\uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1 \xB7 \uC774\uC6A9 \uB3D9\uC758" : doc === "marketing" ? "\uB9C8\uCF00\uD305 \uC218\uC2E0 \uB3D9\uC758" : "\uC774\uC6A9\uC57D\uAD00";
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uD68C\uC6D0\uAC00\uC785", back: F.PAGES.login, footer: false }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-08-02 \uD68C\uC6D0\uAC00\uC785", className: "fo-container narrow", style: { padding: "0 0 40px" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "28px 0 18px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("img", { src: "../shared/logo.png", alt: "CHODRUM \uB85C\uACE0", style: { width: 80, height: 80, objectFit: "contain", display: "block", margin: "0 auto" } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 23, fontWeight: 600, letterSpacing: "-0.6px", marginTop: 8 } }, "CHODRUM"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: "var(--text-secondary)", marginTop: 6 } }, "3\uCD08 \uB9CC\uC5D0 \uC2DC\uC791\uD558\uC138\uC694")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement(SocialButton, { provider: "kakao", style: socialStyle("kakao"), onClick: () => socialSignup("kakao") }), /* @__PURE__ */ React.createElement(SocialButton, { provider: "naver", style: socialStyle("naver"), onClick: () => socialSignup("naver") }), /* @__PURE__ */ React.createElement(SocialButton, { provider: "google", style: socialStyle("google"), onClick: () => socialSignup("google") }), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { textAlign: "center" } }, "\uC18C\uC15C \uAC04\uD3B8\uAC00\uC785\uC740 \uBE44\uBC00\uBC88\uD638 \uC5C6\uC774 \uD50C\uB7AB\uD3FC \uACC4\uC815\uC774 \uB85C\uADF8\uC778 ID\uAC00 \uB3FC\uC694.", !Auth.isProviderEnabled("kakao") || !Auth.isProviderEnabled("naver") ? " \uCE74\uCE74\uC624\xB7\uB124\uC774\uBC84\uB294 Client ID\uC640 Edge Function \uC124\uC815 \uD6C4 \uD65C\uC131\uD654\uB3FC\uC694." : "")), /* @__PURE__ */ React.createElement(Divider, { label: "\uB610\uB294 \uC774\uBA54\uC77C\uB85C \uAC00\uC785", spacing: 20 }), /* @__PURE__ */ React.createElement(Steps, { cur: uiStep }), uiStep === 1 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uC774\uBA54\uC77C", type: "email", placeholder: "you@example.com", value: email, onChange: (e) => onEmailChange(e.target.value), error: emailErr || void 0 })), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "md", style: { height: 44, flex: "none" }, disabled: !emailOk || !!busy, onClick: sendCode }, sent ? "\uC7AC\uBC1C\uC1A1" : "\uC778\uC99D\uCF54\uB4DC \uBC1B\uAE30")), emailErr ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--status-danger, #c0392b)" } }, emailErr, " ", /* @__PURE__ */ React.createElement("a", { href: F.PAGES.login, style: { fontWeight: 600, textDecoration: "underline" } }, "\uB85C\uADF8\uC778")) : /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-secondary)" } }, "\uC778\uC99D\uD55C \uC774\uBA54\uC77C\uC774 \uB85C\uADF8\uC778 ID\uAC00 \uB3FC\uC694. \uBA54\uC77C\uC5D0 \uC628 6\uC790\uB9AC \uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694.")), sent ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Input, { label: "\uC778\uC99D\uCF54\uB4DC", placeholder: "6\uC790\uB9AC \uCF54\uB4DC", value: code, onChange: (e) => {
      setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
      setCodeErr("");
    }, error: codeErr || void 0, hint: "\uBA54\uC77C\uB85C \uBC1B\uC740 6\uC790\uB9AC \uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694. \uC778\uC99D \uC644\uB8CC \uC804\uC5D0\uB294 \uAC00\uC785\uD560 \uC218 \uC5C6\uC5B4\uC694." }), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: !codeOk || busy === "verify", onClick: verify }, busy === "verify" ? "\uD655\uC778 \uC911\u2026" : "\uC778\uC99D \uC644\uB8CC")) : null) : null, uiStep === 2 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--status-success-bg)", borderRadius: "var(--radius-lg)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 14, style: { color: "var(--status-success)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, "\uC778\uC99D \uC644\uB8CC \u2014 ", /* @__PURE__ */ React.createElement("b", { className: "ds-mono" }, email), " \uC774 \uB85C\uADF8\uC778 ID\uB85C \uD655\uC815\uB418\uC5C8\uC5B4\uC694.")), /* @__PURE__ */ React.createElement(
      Input,
      {
        label: "\uC774\uB984 (\uD544\uC218)",
        placeholder: "\uC2E4\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694",
        value: name,
        onChange: (e) => {
          setName(e.target.value);
          setNameErr("");
        },
        error: nameErr || (name && !nameOk ? "\uC774\uB984\uC744 2\uC790 \uC774\uC0C1 \uC785\uB825\uD574\uC8FC\uC138\uC694." : void 0)
      }
    ), /* @__PURE__ */ React.createElement(Input, { label: "\uC0DD\uB144\uC6D4\uC77C (\uD544\uC218)", inputMode: "numeric", maxLength: 8, placeholder: "YYYYMMDD \xB7 \uC608: 19950413", value: birth, onChange: (e) => setBirth(e.target.value.replace(/\D/g, "").slice(0, 8)), error: birth && !birthOk ? "\uC0DD\uB144\uC6D4\uC77C 8\uC790\uB9AC\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694." : void 0, hint: birthOk ? void 0 : "\uC22B\uC790 8\uC790\uB9AC\uB85C \uC785\uB825\uD574\uC8FC\uC138\uC694." }), /* @__PURE__ */ React.createElement(Input, { label: "\uBE44\uBC00\uBC88\uD638", type: "password", placeholder: Auth.passwordHint(), value: pw, onChange: (e) => {
      setPw(e.target.value);
      setPwErr("");
    }, error: pw && !pwCheck.ok ? pwCheck.error : pwErr || void 0, hint: Auth.passwordHint() }), /* @__PURE__ */ React.createElement(Input, { label: "\uBE44\uBC00\uBC88\uD638 \uD655\uC778", type: "password", placeholder: "\uD55C \uBC88 \uB354 \uC785\uB825", value: pw2, onChange: (e) => setPw2(e.target.value), error: pw2 && pw !== pw2 ? "\uBE44\uBC00\uBC88\uD638\uAC00 \uC11C\uB85C \uB2EC\uB77C\uC694." : void 0 }), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: !(pwOk && nameOk && birthOk), onClick: goInfoNext }, "\uB2E4\uC74C")) : null, uiStep === 3 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Checkbox, { checked: t1 && t2 && t3, onChange: (on) => {
      setT1(on);
      setT2(on);
      setT3(on);
    }, label: /* @__PURE__ */ React.createElement("b", { style: { fontWeight: 600 } }, "\uC804\uCCB4 \uB3D9\uC758") }), /* @__PURE__ */ React.createElement("hr", { className: "fo-hr" }), /* @__PURE__ */ React.createElement(F.LegalTermRow, { checked: t1, onChange: setT1, kind: "terms", label: "(\uD544\uC218) \uC774\uC6A9\uC57D\uAD00 \uB3D9\uC758", onView: () => setDoc("terms") }), /* @__PURE__ */ React.createElement(F.LegalTermRow, { checked: t2, onChange: setT2, kind: "privacy", label: "(\uD544\uC218) \uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1 \xB7 \uC774\uC6A9 \uB3D9\uC758", onView: () => setDoc("privacy") }), /* @__PURE__ */ React.createElement(F.LegalTermRow, { checked: t3, onChange: setT3, kind: "marketing", label: "(\uC120\uD0DD) \uC2E0\uBCF4 \uC18C\uC2DD \xB7 \uD61C\uD0DD \uC54C\uB9BC \uC218\uC2E0 \uB3D9\uC758", onView: () => setDoc("marketing") }), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: !(t1 && t2) || busy === "finish", onClick: finish }, busy === "finish" ? "\uAC00\uC785 \uC911\u2026" : "\uAC00\uC785 \uC644\uB8CC")) : null, /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { textAlign: "center", marginTop: 22 } }, "\uC774\uBBF8 \uACC4\uC815\uC774 \uC788\uB098\uC694? ", /* @__PURE__ */ React.createElement("a", { href: F.PAGES.login, style: { fontWeight: 500 } }, "\uB85C\uADF8\uC778"))), /* @__PURE__ */ React.createElement(F.Dialog, { open: !!doc, onClose: () => setDoc(null), title: docTitle, wide: true }, doc ? /* @__PURE__ */ React.createElement(F.LegalDocBody, { kind: doc }) : null));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(SignupPage, null));
  });
})();
