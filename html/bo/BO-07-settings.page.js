(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, IconButton, Card, Badge, Chip, Select, Input, Checkbox, Icon } = DS;
  const B = window.BO;
  const A = window.AdminData;
  const textareaStyle = { width: "100%", minHeight: 140, padding: "10px 12px", fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.65, color: "var(--text-primary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-inputs)", background: "var(--surface-card)", outline: "none", resize: "vertical" };
  const bodyPreviewStyle = { ...textareaStyle, minHeight: 280, background: "var(--surface-sunken)", whiteSpace: "pre-wrap", resize: "vertical" };
  function nextVer(v) {
    const m = /^v(\d+)\.(\d+)$/.exec(v);
    return m ? "v" + m[1] + "." + (Number(m[2]) + 1) : "v1.0";
  }
  function syncTerms(list) {
    if (A) A.terms = list;
    return list;
  }
  function TermsTab() {
    const [terms, setTerms] = React.useState(() => A.terms && A.terms.length ? A.terms.slice() : []);
    const [open, setOpen] = React.useState(false);
    const [view, setView] = React.useState(null);
    const first = terms[0] || { name: "", ver: "v1.0" };
    const [doc, setDoc] = React.useState(first.name);
    const [ver, setVer] = React.useState(terms.length ? nextVer(first.ver) : "v1.0");
    const [date, setDate] = React.useState("2026.07.14");
    const [memo, setMemo] = React.useState("");
    const [body, setBody] = React.useState(first && first.body || "");
    const pickDoc = (name) => {
      setDoc(name);
      const cur = terms.find((t) => t.name === name);
      setVer(nextVer(cur && cur.ver || "v1.0"));
      setBody(cur && cur.body || "");
    };
    const canSave = terms.length > 0 && /^v\d+\.\d+$/.test(ver) && /^\d{4}\.\d{2}\.\d{2}$/.test(date) && memo.trim().length > 0;
    const register = () => {
      setTerms((ts) => syncTerms(ts.map((t) => t.name === doc ? { ...t, ver, date, body: body || t.body, memo: memo.trim() } : t)));
      setOpen(false);
      setMemo("");
      B.toast(doc + " " + ver + " \uB4F1\uB85D \uC644\uB8CC \xB7 \uC2DC\uD589\uC77C\uBD80\uD130 \uC801\uC6A9\uB3FC\uC694");
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement(B.CardHead, { title: "\uC57D\uAD00 \uBB38\uC11C", right: /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", iconLeft: "plus", disabled: !terms.length, onClick: () => {
      if (!terms.length) return;
      pickDoc(terms[0].name);
      setOpen(true);
    } }, "\uC0C8 \uBC84\uC804 \uB4F1\uB85D") }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 6px 6px" } }, terms.length === 0 ? /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "var(--text-secondary)", padding: "12px 12px 18px", margin: 0 } }, "\uB4F1\uB85D\uB41C \uC57D\uAD00 \uBB38\uC11C\uAC00 \uC5C6\uC5B4\uC694. legal-docs.js \uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694.") : /* @__PURE__ */ React.createElement(B.Table, { minWidth: 640, head: ["\uBB38\uC11C", "\uAD6C\uBD84", "\uBC84\uC804", "\uC2DC\uD589\uC77C", ""] }, terms.map((t) => /* @__PURE__ */ React.createElement("tr", { key: t.name }, /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, t.name), t.summary ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-tertiary)" } }, t.summary) : null)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: t.required ? "outline" : "neutral", size: "sm" }, t.required ? "\uD544\uC218" : "\uC120\uD0DD")), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: "outline", size: "sm" }, t.ver)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12 } }, t.date)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 2, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", iconLeft: "eye", onClick: () => setView(t) }, "\uBCF4\uAE30"), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", iconLeft: "plus", onClick: () => {
      pickDoc(t.name);
      setOpen(true);
    } }, "\uC0C8 \uBC84\uC804"))))))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)", padding: "10px 18px 16px" } }, "\uC57D\uAD00\uC740 \uBC84\uC804\uC73C\uB85C \uAD00\uB9AC\uB418\uBA70, \uC0C8 \uBC84\uC804 \uC2DC\uD589 \uC2DC \uAE30\uC874 \uB3D9\uC758 \uC774\uB825\uC740 \uBCF4\uC874\uB3FC\uC694. \uC774\uC6A9\uC790\uC5D0\uAC8C \uBD88\uB9AC\uD55C \uBCC0\uACBD\uC740 \uC2DC\uD589 30\uC77C \uC804 \uACF5\uC9C0\uAC00 \uD544\uC694\uD574\uC694.")), /* @__PURE__ */ React.createElement(
      B.Modal,
      {
        open,
        onClose: () => setOpen(false),
        title: "\uC57D\uAD00 \uC0C8 \uBC84\uC804 \uB4F1\uB85D",
        width: 560,
        footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => setOpen(false) }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", disabled: !canSave, onClick: register }, "\uB4F1\uB85D\uD558\uAE30"))
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement(B.Labeled, { label: "\uB300\uC0C1 \uBB38\uC11C" }, /* @__PURE__ */ React.createElement(Select, { value: doc, onChange: (e) => pickDoc(e.target.value), options: terms.map((t) => t.name) })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uC0C8 \uBC84\uC804", value: ver, onChange: (e) => setVer(e.target.value), error: ver && !/^v\d+\.\d+$/.test(ver) ? "v1.3 \uD615\uC2DD\uC73C\uB85C \uC785\uB825\uD574\uC8FC\uC138\uC694." : void 0, hint: "\uD604\uC7AC " + ((terms.find((t) => t.name === doc) || {}).ver || "\u2014") }), /* @__PURE__ */ React.createElement(Input, { label: "\uC2DC\uD589\uC77C", placeholder: "YYYY.MM.DD", value: date, onChange: (e) => setDate(e.target.value), error: date && !/^\d{4}\.\d{2}\.\d{2}$/.test(date) ? "YYYY.MM.DD \uD615\uC2DD\uC73C\uB85C \uC785\uB825\uD574\uC8FC\uC138\uC694." : void 0 })), /* @__PURE__ */ React.createElement(B.Labeled, { label: "\uBCC0\uACBD \uB0B4\uC6A9 \uC694\uC57D (\uD544\uC218 \xB7 \uACF5\uC9C0\uC0AC\uD56D\uC5D0 \uAC8C\uC2DC)" }, /* @__PURE__ */ React.createElement("textarea", { style: textareaStyle, placeholder: "\uC608: \uC81C7\uC870 \uB2E4\uC6B4\uB85C\uB4DC \uAE30\uAC04 \uC7AC\uBD80\uC5EC \uC808\uCC28 \uAD6C\uCCB4\uD654", value: memo, onChange: (e) => setMemo(e.target.value) })), /* @__PURE__ */ React.createElement(B.Labeled, { label: "\uC57D\uAD00 \uBCF8\uBB38 (\uC120\uD0DD \xB7 \uC218\uC815 \uC2DC \uC0C8 \uBC84\uC804\uC5D0 \uBC18\uC601)" }, /* @__PURE__ */ React.createElement("textarea", { style: { ...textareaStyle, minHeight: 200 }, value: body, onChange: (e) => setBody(e.target.value) })))
    ), /* @__PURE__ */ React.createElement(
      B.Modal,
      {
        open: !!view,
        onClose: () => setView(null),
        title: view ? view.name + " \xB7 " + view.ver : "\uC57D\uAD00 \uBCF4\uAE30",
        width: 640,
        footer: /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => setView(null) }, "\uB2EB\uAE30")
      },
      view ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement(Badge, { variant: "outline", size: "sm" }, view.ver), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-tertiary)" } }, "\uC2DC\uD589\uC77C ", view.date), /* @__PURE__ */ React.createElement(Badge, { variant: view.required ? "outline" : "neutral", size: "sm" }, view.required ? "\uD544\uC218 \uB3D9\uC758" : "\uC120\uD0DD \uB3D9\uC758")), view.memo ? /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12.5, color: "var(--text-secondary)", margin: 0 } }, "\uBA54\uBAA8 \xB7 ", view.memo) : null, /* @__PURE__ */ React.createElement("div", { style: bodyPreviewStyle }, view.body || "\uBCF8\uBB38\uC774 \uC5C6\uC5B4\uC694.")) : null
    ));
  }
  function PgTab() {
    const [test, setTest] = React.useState(true);
    const ck = window.CHODRUM_CONFIG && window.CHODRUM_CONFIG.TOSS_CLIENT_KEY || "test_ck_\u2026";
    return /* @__PURE__ */ React.createElement(Card, { padding: 18, style: { maxWidth: 560, display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, "PG \uC5F0\uB3D9"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12.5, lineHeight: 1.55, color: "var(--text-secondary)", margin: 0 } }, "FO \uACB0\uC81C\uB294 ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text-primary)" } }, "\uD1A0\uC2A4\uD398\uC774\uBA3C\uCE20"), " SDK\uB85C \uC5F0\uB3D9\uB3FC \uC788\uC5B4\uC694. Client Key\uB294 ", /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11.5 } }, "config.js TOSS_CLIENT_KEY"), "(\uBE44\uC6B0\uBA74 \uB370\uBAA8). Secret Key\uB294 Edge ", /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11.5 } }, "TOSS_SECRET_KEY"), "\uB9CC. Live \uACB0\uC81C\uB294 ", /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11.5 } }, "toss-confirm"), " \uBC30\uD3EC\uAC00 \uD544\uC218\uC608\uC694(\uC2B9\uC778 \uC5C6\uC774 \uACB0\uC81C\uC644\uB8CC \uBD88\uAC00)."), /* @__PURE__ */ React.createElement(B.Labeled, { label: "PG\uC0AC" }, /* @__PURE__ */ React.createElement(Select, { value: "\uD1A0\uC2A4\uD398\uC774\uBA3C\uCE20", onChange: () => {
    }, options: ["\uD1A0\uC2A4\uD398\uC774\uBA3C\uCE20", "KG\uC774\uB2C8\uC2DC\uC2A4", "\uB098\uC774\uC2A4\uD398\uC774\uBA3C\uCE20"] })), /* @__PURE__ */ React.createElement(Input, { label: "Client Key (config.js)", value: ck, onChange: () => {
    }, hint: "\uBE44\uC5B4 \uC788\uC73C\uBA74 \uB370\uBAA8 \uACB0\uC81C\uCC3D. \uD1A0\uC2A4 \uAC00\uC785 \uD6C4 \uD14C\uC2A4\uD2B8/\uB77C\uC774\uBE0C \uD0A4\uB97C \uB123\uC73C\uC138\uC694." }), /* @__PURE__ */ React.createElement(Input, { label: "Confirm URL", value: window.CHODRUM_CONFIG && CHODRUM_CONFIG.TOSS_CONFIRM_URL || "(SUPABASE_URL/functions/v1/toss-confirm \uC790\uB3D9)", onChange: () => {
    }, hint: "\uBE44\uC6B0\uBA74 SUPABASE_URL \uAE30\uC900\uC73C\uB85C \uC790\uB3D9 \uC720\uB3C4. Edge \uBBF8\uBC30\uD3EC \uC2DC Live \uACB0\uC81C\uB294 \uC2E4\uD328\uD569\uB2C8\uB2E4." }), /* @__PURE__ */ React.createElement(Input, { label: "Secret Key", type: "password", value: "****************************", onChange: () => {
    }, hint: "\uBE0C\uB77C\uC6B0\uC800\uC5D0 \uB450\uC9C0 \uB9C8\uC138\uC694. supabase secrets set TOSS_SECRET_KEY=..." }), /* @__PURE__ */ React.createElement(B.Labeled, { label: "\uC0AC\uC6A9\uD560 \uACB0\uC81C \uC218\uB2E8" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, paddingTop: 2 } }, /* @__PURE__ */ React.createElement(Checkbox, { checked: true, onChange: () => {
    }, label: "\uC2E0\uC6A9 / \uCCB4\uD06C\uCE74\uB4DC" }), /* @__PURE__ */ React.createElement(Checkbox, { checked: true, onChange: () => {
    }, label: "\uCE74\uCE74\uC624\uD398\uC774" }), /* @__PURE__ */ React.createElement(Checkbox, { checked: true, onChange: () => {
    }, label: "\uB124\uC774\uBC84\uD398\uC774" }), /* @__PURE__ */ React.createElement(Checkbox, { checked: true, onChange: () => {
    }, label: "\uACC4\uC88C\uC774\uCCB4" }))), /* @__PURE__ */ React.createElement(Checkbox, { checked: test, onChange: setTest, label: /* @__PURE__ */ React.createElement("span", null, "\uD14C\uC2A4\uD2B8 \uBAA8\uB4DC ", test ? /* @__PURE__ */ React.createElement(Badge, { variant: "warning", size: "sm" }, "TEST") : null) }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", iconLeft: "check", onClick: () => B.toast("\uC2E4\uC81C \uC124\uC815\uC740 config.js \xB7 Edge Function\uC5D0\uC11C \uAD00\uB9AC\uD574\uC694") }, "\uD655\uC778")));
  }
  const EMAIL_DEFAULTS = [
    { k: "\uC778\uC99D\uCF54\uB4DC \uBC1C\uC1A1", d: "\uD68C\uC6D0\uAC00\uC785 \xB7 \uBE44\uD68C\uC6D0 \uC8FC\uBB38 \uC870\uD68C \uC778\uC99D", subject: "[CHODRUM] \uC778\uC99D\uCF54\uB4DC\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694", body: "\uC548\uB155\uD558\uC138\uC694, {\uC774\uB984}\uB2D8.\n\n\uC694\uCCAD\uD558\uC2E0 \uC778\uC99D\uCF54\uB4DC\uB294 \uC544\uB798\uC640 \uAC19\uC544\uC694.\n\n\uC778\uC99D\uCF54\uB4DC: {\uC778\uC99D\uCF54\uB4DC}\n\n\uCF54\uB4DC\uB294 \uBC1C\uC1A1 \uC2DC\uC810\uBD80\uD130 10\uBD84\uAC04 \uC720\uD6A8\uD574\uC694.\n\uBCF8\uC778\uC774 \uC694\uCCAD\uD558\uC9C0 \uC54A\uC558\uB2E4\uBA74 \uC774 \uBA54\uC77C\uC744 \uBB34\uC2DC\uD574\uC8FC\uC138\uC694." },
    { k: "\uACB0\uC81C \uC644\uB8CC \uC548\uB0B4", d: "\uC8FC\uBB38 \uB0B4\uC5ED + \uB2E4\uC6B4\uB85C\uB4DC \uC548\uB0B4", subject: "[CHODRUM] \uACB0\uC81C\uAC00 \uC644\uB8CC\uB418\uC5C8\uC5B4\uC694 ({\uC8FC\uBB38\uBC88\uD638})", body: "{\uC774\uB984}\uB2D8, \uACB0\uC81C\uAC00 \uC644\uB8CC\uB418\uC5C8\uC5B4\uC694.\n\n\uC8FC\uBB38\uBC88\uD638: {\uC8FC\uBB38\uBC88\uD638}\n\uC8FC\uBB38 \uC0C1\uD488: {\uC0C1\uD488\uBA85}\n\uACB0\uC81C \uAE08\uC561: {\uAE08\uC561}\n\n\uAD6C\uB9E4\uD55C \uC545\uBCF4\uB294 \uACB0\uC81C\uC77C\uB85C\uBD80\uD130 7\uC77C\uAC04 PDF\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD560 \uC218 \uC788\uC5B4\uC694.\n\uD68C\uC6D0\uC740 \uB9C8\uC774\uD398\uC774\uC9C0 > \uAD6C\uB9E4 \uB0B4\uC5ED\uC5D0\uC11C, \uBE44\uD68C\uC6D0\uC740 \uC8FC\uBB38 \uC2DC \uC785\uB825\uD55C \uC774\uBA54\uC77C\uB85C \uBE44\uD68C\uC6D0 \uC8FC\uBB38 \uC870\uD68C\uC5D0\uC11C \uBC1B\uC744 \uC218 \uC788\uC5B4\uC694." },
    { k: "\uB2E4\uC6B4\uB85C\uB4DC \uB9CC\uB8CC \uC784\uBC15 (D-1)", d: "\uB9CC\uB8CC \uD558\uB8E8 \uC804 \uB9AC\uB9C8\uC778\uB4DC", subject: "[CHODRUM] \uB2E4\uC6B4\uB85C\uB4DC \uAE30\uAC04\uC774 \uD558\uB8E8 \uB0A8\uC558\uC5B4\uC694", body: "{\uC774\uB984}\uB2D8, \uAD6C\uB9E4\uD558\uC2E0 \uC545\uBCF4\uC758 \uB2E4\uC6B4\uB85C\uB4DC \uAE30\uAC04\uC774 \uACE7 \uB9CC\uB8CC\uB3FC\uC694.\n\n\uB300\uC0C1 \uC545\uBCF4: {\uC0C1\uD488\uBA85}\n\uB9CC\uB8CC \uC77C\uC2DC: {\uB9CC\uB8CC\uC77C\uC2DC}\n\n\uAE30\uAC04\uC774 \uC9C0\uB098\uBA74 \uB2E4\uC6B4\uB85C\uB4DC \uBC84\uD2BC\uC774 \uBE44\uD65C\uC131\uD654\uB3FC\uC694. \uC78A\uAE30 \uC804\uC5D0 \uC9C0\uAE08 \uBC1B\uC544\uB450\uC138\uC694." },
    { k: "\uD658\uBD88 \uC644\uB8CC \uC548\uB0B4", d: "\uD658\uBD88 \uCC98\uB9AC + \uAD8C\uD55C \uD68C\uC218 \uACE0\uC9C0", subject: "[CHODRUM] \uD658\uBD88 \uCC98\uB9AC\uAC00 \uC644\uB8CC\uB418\uC5C8\uC5B4\uC694 ({\uC8FC\uBB38\uBC88\uD638})", body: "{\uC774\uB984}\uB2D8, \uC694\uCCAD\uD558\uC2E0 \uD658\uBD88\uC774 \uC644\uB8CC\uB418\uC5C8\uC5B4\uC694.\n\n\uC8FC\uBB38\uBC88\uD638: {\uC8FC\uBB38\uBC88\uD638}\n\uD658\uBD88 \uAE08\uC561: {\uAE08\uC561}\n\n\uD658\uBD88 \uC815\uCC45\uC5D0 \uB530\uB77C \uD574\uB2F9 \uC545\uBCF4\uC758 \uB2E4\uC6B4\uB85C\uB4DC \uAD8C\uD55C\uC740 \uD68C\uC218\uB418\uC5C8\uC5B4\uC694.\n\uD658\uBD88 \uAE08\uC561\uC740 \uACB0\uC81C \uC218\uB2E8\uC5D0 \uB530\uB77C 3~5\uC601\uC5C5\uC77C \uB0B4 \uC785\uAE08\uB3FC\uC694." }
  ];
  function EmailPreview({ t, from }) {
    return /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--border-default)", borderRadius: "var(--radius-cards)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "13px 16px", borderBottom: "1px solid var(--border-default)", background: "var(--surface-sunken)" } }, /* @__PURE__ */ React.createElement("div", { className: "ds-mono", style: { fontSize: 11.5, color: "var(--text-secondary)" } }, "FROM \u2014 CHODRUM <", from, ">"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14.5, fontWeight: 600, marginTop: 6, letterSpacing: "-0.2px" } }, t.subject)), /* @__PURE__ */ React.createElement("div", { style: { padding: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, borderBottom: "1px solid var(--border-default)", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("img", { src: "../shared/logo.png", alt: "CHODRUM \uB85C\uACE0", style: { width: 22, height: 22, objectFit: "contain" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.2px" } }, "CHODRUM")), /* @__PURE__ */ React.createElement("div", { style: { whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.75, color: "var(--text-primary)" } }, t.body), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border-default)", fontSize: 11.5, color: "var(--text-tertiary)", lineHeight: 1.6 } }, "\uBCF8 \uBA54\uC77C\uC740 \uBC1C\uC2E0 \uC804\uC6A9\uC774\uC5D0\uC694. \uBB38\uC758\uB294 chodrumstudio@gmail.com \uC73C\uB85C \uBCF4\uB0B4\uC8FC\uC138\uC694.", /* @__PURE__ */ React.createElement("br", null), "\xA9 \uC870\uB4DC\uB7FC\uB2F7\uCEF4")));
  }
  function EmailTab() {
    const [from, setFrom] = React.useState("no-reply@chodrum.example");
    const [sender, setSender] = React.useState("CHODRUM");
    const [templates, setTemplates] = React.useState(EMAIL_DEFAULTS);
    const [preview, setPreview] = React.useState(null);
    const [editIdx, setEditIdx] = React.useState(null);
    const [draft, setDraft] = React.useState({ subject: "", body: "" });
    const openEdit = (i) => {
      setEditIdx(i);
      setDraft({ subject: templates[i].subject, body: templates[i].body });
    };
    const saveEdit = () => {
      setTemplates((ts) => ts.map((t, i) => i === editIdx ? { ...t, subject: draft.subject, body: draft.body } : t));
      setEditIdx(null);
      B.toast("\uD15C\uD50C\uB9BF\uC744 \uC800\uC7A5\uD588\uC5B4\uC694");
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 } }, /* @__PURE__ */ React.createElement(Card, { padding: 18, style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, "\uBC1C\uC2E0 \uC124\uC815"), /* @__PURE__ */ React.createElement(Input, { label: "\uBC1C\uC2E0 \uC774\uBA54\uC77C", value: from, onChange: (e) => setFrom(e.target.value) }), /* @__PURE__ */ React.createElement(Input, { label: "\uBC1C\uC2E0\uC790 \uC774\uB984", value: sender, onChange: (e) => setSender(e.target.value) })), /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement(B.CardHead, { title: "\uBA54\uC77C \uD15C\uD50C\uB9BF" }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 18px 12px" } }, templates.map((t, i) => /* @__PURE__ */ React.createElement("div", { key: t.k, style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderTop: i ? "1px solid var(--border-default)" : "none", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(Icon, { name: "mail", size: 16, style: { color: "var(--color-icon)", flex: "none" } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 160 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600 } }, t.k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-secondary)", marginTop: 2 } }, t.d)), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", iconLeft: "eye", onClick: () => setPreview(i) }, "\uBBF8\uB9AC\uBCF4\uAE30"), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", iconLeft: "pencil", onClick: () => openEdit(i) }, "\uC218\uC815")))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)", padding: "4px 18px 16px" } }, "{\uC774\uB984} {\uC8FC\uBB38\uBC88\uD638} {\uAE08\uC561}", " \uAC19\uC740 \uC911\uAD04\uD638 \uBCC0\uC218\uB294 \uBC1C\uC1A1 \uC2DC \uC2E4\uC81C \uAC12\uC73C\uB85C \uC790\uB3D9 \uCE58\uD658\uB3FC\uC694."))), /* @__PURE__ */ React.createElement(
      B.Modal,
      {
        open: preview !== null,
        onClose: () => setPreview(null),
        title: preview !== null ? "\uBBF8\uB9AC\uBCF4\uAE30 \u2014 " + templates[preview].k : "",
        width: 560,
        footer: preview !== null ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", iconLeft: "pencil", onClick: () => {
          const i = preview;
          setPreview(null);
          openEdit(i);
        } }, "\uC218\uC815\uD558\uAE30"), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", onClick: () => setPreview(null) }, "\uB2EB\uAE30")) : null
      },
      preview !== null ? /* @__PURE__ */ React.createElement(EmailPreview, { t: templates[preview], from }) : null
    ), /* @__PURE__ */ React.createElement(
      B.Modal,
      {
        open: editIdx !== null,
        onClose: () => setEditIdx(null),
        title: editIdx !== null ? "\uD15C\uD50C\uB9BF \uC218\uC815 \u2014 " + templates[editIdx].k : "",
        width: 560,
        footer: editIdx !== null ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => setEditIdx(null) }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", disabled: !draft.subject.trim() || !draft.body.trim(), onClick: saveEdit }, "\uC800\uC7A5")) : null
      },
      editIdx !== null ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uBA54\uC77C \uC81C\uBAA9", value: draft.subject, onChange: (e) => setDraft({ ...draft, subject: e.target.value }) }), /* @__PURE__ */ React.createElement(B.Labeled, { label: "\uBCF8\uBB38", hint: "{\uC774\uB984} {\uC8FC\uBB38\uBC88\uD638} {\uC0C1\uD488\uBA85} {\uAE08\uC561} {\uC778\uC99D\uCF54\uB4DC} {\uB9CC\uB8CC\uC77C\uC2DC} \uBCC0\uC218\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694." }, /* @__PURE__ */ React.createElement("textarea", { style: { ...textareaStyle, minHeight: 200 }, value: draft.body, onChange: (e) => setDraft({ ...draft, body: e.target.value }) }))) : null
    ));
  }
  function SettingsPage() {
    const [tab, setTab] = React.useState("\uC57D\uAD00 \uAD00\uB9AC");
    const tabs = ["\uC57D\uAD00 \uAD00\uB9AC", "PG \uC124\uC815", "\uC774\uBA54\uC77C \uC124\uC815"];
    return /* @__PURE__ */ React.createElement(B.Shell, { active: "settings", title: "\uC0AC\uC774\uD2B8 \uC124\uC815" }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "BO-07 \uC0AC\uC774\uD2B8 \uC124\uC815", style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } }, tabs.map((t) => /* @__PURE__ */ React.createElement(Chip, { key: t, selected: tab === t, onClick: () => setTab(t) }, t)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-tertiary)", marginLeft: "auto" } }, "\uBC30\uB108 \xB7 \uCD94\uCC9C \uC124\uC815\uC740 ", /* @__PURE__ */ React.createElement("a", { href: "/bo/banners", style: { color: "var(--text-secondary)", textDecoration: "underline", textUnderlineOffset: 2 } }, "\uBA54\uC778 \uAD00\uB9AC"), "\uB85C \uC774\uB3D9\uD588\uC5B4\uC694")), tab === "\uC57D\uAD00 \uAD00\uB9AC" ? /* @__PURE__ */ React.createElement(TermsTab, null) : null, tab === "PG \uC124\uC815" ? /* @__PURE__ */ React.createElement(PgTab, null) : null, tab === "\uC774\uBA54\uC77C \uC124\uC815" ? /* @__PURE__ */ React.createElement(EmailTab, null) : null));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(SettingsPage, null));
  });
})();
