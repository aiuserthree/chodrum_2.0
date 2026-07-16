(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Input, Icon, Card, Badge } = DS;
  const F = window.FO;
  const Auth = window.ChodrumAuth;
  function GuestLookupPage() {
    const [step, setStep] = React.useState(1);
    const [email, setEmail] = React.useState(F.qp("email") || "");
    const [code, setCode] = React.useState("");
    const [codeErr, setCodeErr] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [sent, setSent] = React.useState(false);
    const emailOk = /.+@.+\..+/.test(email);
    const codeOk = /^\d{6}$/.test(code.trim());
    const [remoteOrders, setRemoteOrders] = React.useState(null);
    const [ordersLoading, setOrdersLoading] = React.useState(false);
    React.useEffect(() => {
      if (step !== 3) return;
      let cancelled = false;
      setOrdersLoading(true);
      setRemoteOrders(null);
      (async () => {
        try {
          const list = await window.ChodrumAPI.orders.forEmail(email);
          if (!cancelled) setRemoteOrders(list || []);
        } catch (e) {
          console.warn(e);
          if (!cancelled) setRemoteOrders([]);
        } finally {
          if (!cancelled) setOrdersLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [step, email]);
    const orders = React.useMemo(() => {
      if (step !== 3) return [];
      if (remoteOrders && remoteOrders.length) return remoteOrders;
      const mine = Store.guestOrders.forEmail(email);
      if (mine.length) return mine;
      return remoteOrders || [];
    }, [step, email, remoteOrders]);
    const sendCode = async () => {
      if (!emailOk || busy) return;
      setBusy(true);
      setCodeErr("");
      try {
        if (!Auth.live()) {
          setSent(true);
          setStep(2);
          setCode("");
          F.toast("\uC778\uC99D\uCF54\uB4DC\uB97C \uBCF4\uB0C8\uC5B4\uC694. (\uC624\uD504\uB77C\uC778 \uB370\uBAA8 \u2014 \uC544\uBB34 6\uC790\uB9AC)");
          setBusy(false);
          return;
        }
        const r = await Auth.sendGuestLookupOtp(email.trim());
        if (!r.ok) {
          F.toast(r.error || "\uC778\uC99D\uCF54\uB4DC\uB97C \uBCF4\uB0B4\uC9C0 \uBABB\uD588\uC5B4\uC694");
          setBusy(false);
          return;
        }
        setSent(true);
        setStep(2);
        setCode("");
        F.toast("\uC778\uC99D\uCF54\uB4DC\uB97C \uBCF4\uB0C8\uC5B4\uC694. \uBA54\uC77C\uD568\xB7\uC2A4\uD338\uD568\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
      } catch (e) {
        F.toast(e && e.message || "\uC778\uC99D\uCF54\uB4DC \uBC1C\uC1A1 \uC624\uB958");
      }
      setBusy(false);
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
      setBusy(true);
      setCodeErr("");
      try {
        if (!Auth.live()) {
          setStep(3);
          setBusy(false);
          return;
        }
        const r = await Auth.verifyGuestLookupOtp(email.trim(), code.trim());
        if (!r.ok) {
          setCodeErr(r.error || "\uC778\uC99D\uCF54\uB4DC\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC544\uC694.");
          setBusy(false);
          return;
        }
        setStep(3);
      } catch (e) {
        setCodeErr(e && e.message || "\uC778\uC99D \uC624\uB958");
      }
      setBusy(false);
    };
    const resetLookup = () => {
      setStep(1);
      setCode("");
      setCodeErr("");
      setSent(false);
      setRemoteOrders(null);
    };
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uBE44\uD68C\uC6D0 \uC8FC\uBB38 \uC870\uD68C", back: F.PAGES.home }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-10 \uBE44\uD68C\uC6D0 \uC8FC\uBB38 \uC870\uD68C", className: "fo-container narrow", style: { padding: "0 0 40px" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "32px 0 18px" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 22, letterSpacing: "-0.6px" } }, "\uBE44\uD68C\uC6D0 \uC8FC\uBB38 \uC870\uD68C"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.55 } }, "\uC8FC\uBB38 \uC2DC \uC785\uB825\uD55C \uC774\uBA54\uC77C\uB85C \uC778\uC99D\uD558\uBA74 \uAD6C\uB9E4\uD55C \uC545\uBCF4\uB97C \uD655\uC778\uD558\uACE0 \uB2E4\uC6B4\uB85C\uB4DC\uD560 \uC218 \uC788\uC5B4\uC694.")), step === 1 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uC8FC\uBB38 \uC774\uBA54\uC77C", type: "email", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), hint: "\uC8FC\uBB38 \uC2DC \uC785\uB825\uD55C \uC774\uBA54\uC77C\uB9CC \uC870\uD68C\uD560 \uC218 \uC788\uC5B4\uC694." }), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: !emailOk || busy, onClick: sendCode }, busy ? "\uBC1C\uC1A1 \uC911\u2026" : "\uC778\uC99D\uCF54\uB4DC \uBC1B\uAE30"), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { textAlign: "center" } }, "\uBE44\uD68C\uC6D0 \uACB0\uC81C \uC2DC \uC785\uB825\uD55C \uC774\uBA54\uC77C\uB85C \uC870\uD68C\uD560 \uC218 \uC788\uC5B4\uC694.")) : null, step === 2 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uC778\uC99D\uCF54\uB4DC", placeholder: "6\uC790\uB9AC \uCF54\uB4DC", value: code, onChange: (e) => {
      setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
      setCodeErr("");
    }, error: codeErr || void 0, hint: email + " \uB85C \uCF54\uB4DC\uB97C \uBCF4\uB0C8\uC5B4\uC694. \uC2A4\uD338\uD568\uB3C4 \uD655\uC778\uD574\uBCF4\uC138\uC694." }), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, disabled: !codeOk || busy, onClick: verify }, busy ? "\uD655\uC778 \uC911\u2026" : "\uC778\uC99D\uD558\uACE0 \uC870\uD68C\uD558\uAE30"), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "md", fullWidth: true, disabled: busy, onClick: sendCode }, "\uCF54\uB4DC \uC7AC\uBC1C\uC1A1")) : null, step === 3 ? ordersLoading && !orders.length ? /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { textAlign: "center", padding: "40px 0" } }, "\uC8FC\uBB38 \uB0B4\uC5ED\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\u2026") : orders.length ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 14, style: { color: "var(--status-success)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5 } }, /* @__PURE__ */ React.createElement("b", { className: "ds-mono" }, email), " \uC778\uC99D \uC644\uB8CC")), orders.map((o) => /* @__PURE__ */ React.createElement(Card, { key: o.orderNo, padding: 16 }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12.5, fontWeight: 600 } }, o.orderNo), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11.5, color: "var(--text-secondary)" } }, o.date)), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4 } }, (Array.isArray(o.items) ? o.items : []).filter(Boolean).map((it, i) => {
      const id = it.sheetId != null && it.sheetId !== "" ? it.sheetId : it.id;
      const snap = it.title && it.title !== "\uC0AD\uC81C\uB418\uC5C8\uAC70\uB098 \uCC3E\uC744 \uC218 \uC5C6\uB294 \uC545\uBCF4" ? it.title : "";
      const s = F && typeof F.resolveSheet === "function" ? F.resolveSheet(id, { title: snap || "\uC545\uBCF4" }) : { id, title: snap || "\uC545\uBCF4" };
      const title = F && typeof F.lineTitle === "function" ? F.lineTitle(it, s) : snap || s && s.title || "\uC545\uBCF4";
      const expired = it.dday < 0;
      const cover = F && typeof F.sheetCoverUrl === "function" ? F.sheetCoverUrl(s) || "" : "";
      return /* @__PURE__ */ React.createElement("div", { key: String(id) + i, style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderTop: i ? "1px solid var(--border-default)" : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 44, flex: "none", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-default)" } }, /* @__PURE__ */ React.createElement(F.StaffThumb, { ratio: "1 / 1", size: 15, src: cover || void 0, alt: title })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 600, letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, title), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4 } }, /* @__PURE__ */ React.createElement(F.DdayBadge, { dday: it.dday }))), /* @__PURE__ */ React.createElement(
        Button,
        {
          variant: expired ? "secondary" : "primary",
          size: "sm",
          iconLeft: "download",
          disabled: expired,
          onClick: () => F.downloadSheetPdf(id, { title, expired, email, orderNo: o.orderNo })
        },
        expired ? "\uB9CC\uB8CC" : "PDF"
      ));
    })))), /* @__PURE__ */ React.createElement("p", { className: "fo-caption" }, "\uB2E4\uC6B4\uB85C\uB4DC\uB294 \uACB0\uC81C\uC77C\uB85C\uBD80\uD130 7\uC77C\uAC04 \uAC00\uB2A5\uD574\uC694. \uB9CC\uB8CC\uB41C \uC545\uBCF4\uB294 \uACE0\uAC1D\uC13C\uD130\uC5D0\uC11C \uC7AC\uBC1C\uAE09\uC744 \uC694\uCCAD\uD560 \uC218 \uC788\uC5B4\uC694.")) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(F.Empty, { icon: "mail", title: "\uD574\uB2F9 \uC774\uBA54\uC77C\uB85C \uC8FC\uBB38 \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4", sub: "\uC8FC\uBB38 \uC2DC \uC785\uB825\uD55C \uC774\uBA54\uC77C\uC774 \uB9DE\uB294\uC9C0 \uB2E4\uC2DC \uD655\uC778\uD574\uC8FC\uC138\uC694. \uC774\uBA54\uC77C\uC774 \uB2E4\uB974\uBA74 \uC870\uD68C\uD560 \uC218 \uC5C6\uC5B4\uC694.", action: "\uB2E4\uB978 \uC774\uBA54\uC77C\uB85C \uC870\uD68C", onAction: resetLookup })) : null));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(GuestLookupPage, null));
  });
})();
