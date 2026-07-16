(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Checkbox } = DS;
  const F = window.FO;
  const Auth = window.ChodrumAuth;
  function OAuthTermsPage() {
    const [profile, setProfile] = React.useState(null);
    const [ready, setReady] = React.useState(false);
    const [t1, setT1] = React.useState(false);
    const [t2, setT2] = React.useState(false);
    const [t3, setT3] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState("");
    const [doc, setDoc] = React.useState(null);
    React.useEffect(() => {
      let cancelled = false;
      (async () => {
        let p = Auth.getPendingProfile && Auth.getPendingProfile();
        if (Auth.live && Auth.live()) {
          try {
            const restored = await Auth.restoreSession();
            if (cancelled) return;
            if (restored) {
              location.replace(F.PAGES.my);
              return;
            }
          } catch (e) {
          }
          p = p || Auth.getPendingProfile && Auth.getPendingProfile();
        }
        if (cancelled) return;
        if (!p || !p.email) {
          location.replace(F.PAGES.login);
          return;
        }
        if (Auth.hasOAuthConsentForProfile || Auth.hasOAuthConsentForEmail) {
          try {
            const ok = Auth.hasOAuthConsentForProfile ? await Auth.hasOAuthConsentForProfile(p) : await Auth.hasOAuthConsentForEmail(p.email);
            if (ok) {
              await Auth.restoreSession();
              location.replace(F.PAGES.my);
              return;
            }
          } catch (e) {
          }
        }
        setProfile(p);
        setReady(true);
      })();
      return () => {
        cancelled = true;
      };
    }, []);
    const submit = async () => {
      if (!(t1 && t2) || busy) return;
      setBusy(true);
      setErr("");
      try {
        const r = await Auth.completeTermsConsent({ marketing: t3 });
        if (!r || !r.ok) {
          setErr(r && r.error || "\uB3D9\uC758\uB97C \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694.");
          setBusy(false);
          return;
        }
        location.replace(F.PAGES.my);
      } catch (e) {
        setErr(e && e.message || "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958");
        setBusy(false);
      }
    };
    const decline = async () => {
      if (busy) return;
      setBusy(true);
      try {
        await Auth.declineTermsConsent();
      } catch (e) {
      }
      location.replace(F.PAGES.login);
    };
    if (!ready) {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uC57D\uAD00 \uB3D9\uC758", footer: false }, /* @__PURE__ */ React.createElement("div", { className: "fo-container narrow", style: { padding: "48px 0", textAlign: "center" } }, /* @__PURE__ */ React.createElement("p", { className: "fo-caption" }, "\uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694\u2026")));
    }
    const docTitle = doc === "privacy" ? "\uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1 \xB7 \uC774\uC6A9 \uB3D9\uC758" : doc === "marketing" ? "\uB9C8\uCF00\uD305 \uC218\uC2E0 \uB3D9\uC758" : "\uC774\uC6A9\uC57D\uAD00";
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uC57D\uAD00 \uB3D9\uC758", footer: false }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-08 \uC18C\uC15C \uC57D\uAD00 \uB3D9\uC758", className: "fo-container narrow", style: { padding: "0 0 40px" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "28px 0 18px" } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: 22, letterSpacing: "-0.6px", margin: 0 } }, "\uC57D\uAD00\uC5D0 \uB3D9\uC758\uD574 \uC8FC\uC138\uC694"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.55, margin: "10px 0 0" } }, profile.name ? /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", { style: { fontWeight: 600, color: "var(--color-ink)" } }, profile.name), "\uB2D8, ") : null, "\uC18C\uC15C \uACC4\uC815\uC73C\uB85C \uAC00\uC785\uC744 \uB9C8\uCE58\uB824\uBA74 \uD544\uC218 \uC57D\uAD00\uC5D0 \uB3D9\uC758\uAC00 \uD544\uC694\uD574\uC694."), profile.email ? /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { marginTop: 8 } }, "\uB85C\uADF8\uC778 ID \xB7 ", /* @__PURE__ */ React.createElement("span", { className: "ds-mono" }, profile.email)) : null), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(
      Checkbox,
      {
        checked: t1 && t2 && t3,
        onChange: (on) => {
          setT1(on);
          setT2(on);
          setT3(on);
        },
        label: /* @__PURE__ */ React.createElement("b", { style: { fontWeight: 600 } }, "\uC804\uCCB4 \uB3D9\uC758")
      }
    ), /* @__PURE__ */ React.createElement("hr", { className: "fo-hr" }), /* @__PURE__ */ React.createElement(F.LegalTermRow, { checked: t1, onChange: setT1, kind: "terms", label: "(\uD544\uC218) \uC774\uC6A9\uC57D\uAD00 \uB3D9\uC758", onView: () => setDoc("terms") }), /* @__PURE__ */ React.createElement(F.LegalTermRow, { checked: t2, onChange: setT2, kind: "privacy", label: "(\uD544\uC218) \uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1 \xB7 \uC774\uC6A9 \uB3D9\uC758", onView: () => setDoc("privacy") }), /* @__PURE__ */ React.createElement(F.LegalTermRow, { checked: t3, onChange: setT3, kind: "marketing", label: "(\uC120\uD0DD) \uC2E0\uBCF4 \uC18C\uC2DD \xB7 \uD61C\uD0DD \uC54C\uB9BC \uC218\uC2E0 \uB3D9\uC758", onView: () => setDoc("marketing") }), err ? /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "var(--status-danger)", margin: 0 } }, err) : null, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: !(t1 && t2) || busy, onClick: submit }, busy ? "\uCC98\uB9AC \uC911\u2026" : "\uB3D9\uC758\uD558\uACE0 \uC2DC\uC791\uD558\uAE30"), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "md", fullWidth: true, disabled: busy, onClick: decline }, "\uB3D9\uC758\uD558\uC9C0 \uC54A\uC74C"), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { textAlign: "center" } }, "\uB3D9\uC758\uD558\uC9C0 \uC54A\uC73C\uBA74 \uAC00\uC785\uC774 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC73C\uBA70, \uB85C\uADF8\uC778 \uC0C1\uD0DC\uB85C \uB0A8\uC9C0 \uC54A\uC544\uC694."))), /* @__PURE__ */ React.createElement(F.Dialog, { open: !!doc, onClose: () => setDoc(null), title: docTitle, wide: true }, doc ? /* @__PURE__ */ React.createElement(F.LegalDocBody, { kind: doc }) : null));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(OAuthTermsPage, null));
  });
})();
