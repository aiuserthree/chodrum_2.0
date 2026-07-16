(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Input, Icon, Card, Badge } = DS;
  const F = window.FO;
  const Auth = window.ChodrumAuth;
  const PROVIDER_LABEL = { kakao: "\uCE74\uCE74\uC624", naver: "\uB124\uC774\uBC84", google: "\uAD6C\uAE00" };
  function EditPage() {
    F.useStoreTick();
    const user = Store.user.get();
    const social = F.isSocialUser(user);
    const provider = user && user.provider || "email";
    const providerLabel = PROVIDER_LABEL[provider] || "\uC18C\uC15C";
    const [name, setName] = React.useState(user ? user.name || "" : "");
    const [birth, setBirth] = React.useState(user && user.birth ? user.birth : "");
    const [pw0, setPw0] = React.useState("");
    const [pw1, setPw1] = React.useState("");
    const [pw2, setPw2] = React.useState("");
    const syncedKey = React.useRef("");
    React.useEffect(() => {
      if (!user) return;
      const key = [user.email || "", user.name || "", user.birth || "", user.provider || ""].join("|");
      if (syncedKey.current === key) return;
      syncedKey.current = key;
      setName(user.name || "");
      setBirth(user.birth || "");
    }, [user]);
    if (!user) {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uB0B4 \uC815\uBCF4 \uC218\uC815", back: F.PAGES.my }, /* @__PURE__ */ React.createElement(F.MyPageLayout, { active: "edit", label: "FO-09-03 \uB0B4 \uC815\uBCF4 \uC218\uC815 (\uBE44\uB85C\uADF8\uC778)" }, /* @__PURE__ */ React.createElement(F.Empty, { icon: "user", title: "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD574\uC694", sub: "\uB0B4 \uC815\uBCF4 \uC218\uC815\uC740 \uB85C\uADF8\uC778 \uD6C4 \uC774\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694.", action: "\uB85C\uADF8\uC778 / \uD68C\uC6D0\uAC00\uC785", href: F.PAGES.login })));
    }
    const [saving, setSaving] = React.useState(false);
    const saveProfile = async () => {
      const nameTrim = name.trim();
      if (!nameTrim) {
        F.toast("\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
        return;
      }
      if (birth && !/^\d{8}$/.test(birth)) {
        F.toast("\uC0DD\uB144\uC6D4\uC77C 8\uC790\uB9AC\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694.");
        return;
      }
      setSaving(true);
      try {
        const r = await Auth.updateBasicProfile({ name: nameTrim, birth: birth || "" });
        if (!r.ok) {
          F.toast(r.error || "\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694");
          return;
        }
        F.toast("\uB0B4 \uC815\uBCF4\uAC00 \uC800\uC7A5\uB418\uC5C8\uC5B4\uC694");
      } catch (e) {
        F.toast(e && e.message || "\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694");
      } finally {
        setSaving(false);
      }
    };
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uB0B4 \uC815\uBCF4 \uC218\uC815", back: F.PAGES.my }, /* @__PURE__ */ React.createElement(F.MyPageLayout, { active: "edit", label: "FO-09-03 \uB0B4 \uC815\uBCF4 \uC218\uC815" }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 480 } }, /* @__PURE__ */ React.createElement(F.Section, { label: "\uAE30\uBCF8 \uC815\uBCF4", first: true }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uC774\uB984", value: name, onChange: (e) => setName(e.target.value) }), /* @__PURE__ */ React.createElement(Input, { label: "\uC774\uBA54\uC77C (\uB85C\uADF8\uC778 ID)", value: user.email || "", disabled: true, hint: "\uB85C\uADF8\uC778 ID\uB294 \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC5B4\uC694." }), /* @__PURE__ */ React.createElement(Input, { label: "\uC0DD\uB144\uC6D4\uC77C", inputMode: "numeric", maxLength: 8, placeholder: "YYYYMMDD", value: birth, onChange: (e) => setBirth(e.target.value.replace(/\D/g, "").slice(0, 8)), error: birth && !/^\d{8}$/.test(birth) ? "\uC0DD\uB144\uC6D4\uC77C 8\uC790\uB9AC\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694." : void 0 }))), social ? (
      /* 소셜 회원 — 비밀번호 변경 메뉴 미노출 (원천 차단) */
      /* @__PURE__ */ React.createElement(F.Section, { label: "\uB85C\uADF8\uC778 \uBC29\uC2DD" }, /* @__PURE__ */ React.createElement(Card, { padding: 16, style: { display: "flex", gap: 12, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement(Icon, { name: "lock", size: 16, style: { color: "var(--color-icon)", marginTop: 2, flex: "none" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600 } }, providerLabel, " \uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778 \uC911"), /* @__PURE__ */ React.createElement(Badge, { variant: "outline", size: "sm" }, "\uC18C\uC15C \uD68C\uC6D0")), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { marginTop: 6 } }, "\uC18C\uC15C \uD68C\uC6D0\uC740 \uBE44\uBC00\uBC88\uD638\uAC00 \uC5C6\uC5B4 \uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD \uBA54\uB274\uAC00 \uD45C\uC2DC\uB418\uC9C0 \uC54A\uC544\uC694. \uB85C\uADF8\uC778\uC740 \uD56D\uC0C1 ", providerLabel, " \uC778\uC99D\uC73C\uB85C \uC9C4\uD589\uB3FC\uC694."))))
    ) : /* @__PURE__ */ React.createElement(F.Section, { label: "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uD604\uC7AC \uBE44\uBC00\uBC88\uD638", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: pw0, onChange: (e) => setPw0(e.target.value) }), /* @__PURE__ */ React.createElement(Input, { label: "\uC0C8 \uBE44\uBC00\uBC88\uD638", type: "password", placeholder: Auth.passwordHint(), value: pw1, onChange: (e) => setPw1(e.target.value), error: pw1 && !Auth.validatePassword(pw1).ok ? Auth.validatePassword(pw1).error : void 0, hint: Auth.passwordHint() }), /* @__PURE__ */ React.createElement(Input, { label: "\uC0C8 \uBE44\uBC00\uBC88\uD638 \uD655\uC778", type: "password", placeholder: "\uD55C \uBC88 \uB354 \uC785\uB825", value: pw2, onChange: (e) => setPw2(e.target.value), error: pw2 && pw1 !== pw2 ? "\uBE44\uBC00\uBC88\uD638\uAC00 \uC11C\uB85C \uB2EC\uB77C\uC694." : void 0 }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "md", disabled: !(pw0 && Auth.validatePassword(pw1).ok && pw1 === pw2), onClick: async () => {
      const r = await Auth.changePassword(pw0, pw1);
      if (!r.ok) {
        F.toast(r.error || "\uBCC0\uACBD \uC2E4\uD328");
        return;
      }
      setPw0("");
      setPw1("");
      setPw2("");
      F.toast("\uBE44\uBC00\uBC88\uD638\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC5B4\uC694");
    } }, "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD")))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 28, display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: saving, onClick: saveProfile }, saving ? "\uC800\uC7A5 \uC911\u2026" : "\uC800\uC7A5\uD558\uAE30")), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { marginTop: 16, textAlign: "center" } }, "\uACC4\uC815\uC744 \uC0AD\uC81C\uD558\uB824\uBA74 ", /* @__PURE__ */ React.createElement("a", { href: F.PAGES.withdraw, style: { color: "var(--text-secondary)", textDecoration: "underline", textUnderlineOffset: 2 } }, "\uD68C\uC6D0 \uD0C8\uD1F4"), "\uB85C \uC774\uB3D9\uD558\uC138\uC694."))));
  }
  ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(EditPage, null));
})();
