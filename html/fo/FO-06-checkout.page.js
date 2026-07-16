(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Icon, Input, Checkbox, Card, Badge } = DS;
  const F = window.FO;
  const D = window.DrumData;
  function CheckoutPage() {
    F.useStoreTick();
    const user = Store.user.get();
    const selParam = F.qp("sel");
    const cart = Store.cart.list();
    const ids = (selParam ? selParam.split(",") : cart.map((c) => c.id)).filter((id) => cart.some((c) => c.id === id));
    const items = ids.map((id) => {
      const c = cart.find((x) => x.id === id);
      return F.resolveSheet(id, { qty: c.qty });
    });
    const total = items.reduce((n, it) => n + (Number(it.price) || 0) * it.qty, 0);
    const member = !!user;
    const [name, setName] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [email2, setEmail2] = React.useState("");
    const [pay, setPay] = React.useState("card");
    const [a1, setA1] = React.useState(false);
    const [a2, setA2] = React.useState(false);
    const [a3, setA3] = React.useState(false);
    const [doc, setDoc] = React.useState(null);
    const [paying, setPaying] = React.useState(false);
    const pgDemo = window.ChodrumPayments && ChodrumPayments.isDemoMode();
    if (!items.length) {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uC8FC\uBB38 / \uACB0\uC81C", back: F.PAGES.cart }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-06 \uC8FC\uBB38/\uACB0\uC81C (\uC9C4\uC785 \uCC28\uB2E8)" }, /* @__PURE__ */ React.createElement(F.Empty, { icon: "shopping-cart", title: "\uC7A5\uBC14\uAD6C\uB2C8\uB97C \uD1B5\uD574 \uACB0\uC81C\uB97C \uC9C4\uD589\uD574\uC8FC\uC138\uC694", sub: "\uACB0\uC81C\uD560 \uC0C1\uD488\uC774 \uC120\uD0DD\uB418\uC9C0 \uC54A\uC558\uC5B4\uC694. \uBAA8\uB4E0 \uACB0\uC81C\uB294 \uC7A5\uBC14\uAD6C\uB2C8\uB97C \uAC70\uCCD0\uC57C \uD574\uC694.", action: "\uC7A5\uBC14\uAD6C\uB2C8\uB85C \uC774\uB3D9", href: F.PAGES.cart })));
    }
    const emailOk = /.+@.+\..+/.test(email);
    const emailMatch = email2.length > 0 && email === email2;
    const guestOk = name.trim().length > 0 && emailOk && emailMatch;
    const canPay = (member || guestOk) && a1 && a2;
    const allAgree = a1 && a2 && a3;
    const setAll = (on) => {
      setA1(on);
      setA2(on);
      setA3(on);
    };
    const doPay = async () => {
      if (paying || !canPay) return;
      setPaying(true);
      const order = {
        no: window.orderNo(),
        date: (/* @__PURE__ */ new Date()).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
        /* title 스냅샷 필수 — 완료/다운로드 페이지가 시트 hydrate 전에 렌더돼도 이름 유지 */
        items: items.map((it) => ({
          id: it.id,
          sheetId: it.id,
          qty: it.qty,
          price: it.price,
          title: it.title && it.title !== "\uC0AD\uC81C\uB418\uC5C8\uAC70\uB098 \uCC3E\uC744 \uC218 \uC5C6\uB294 \uC545\uBCF4" ? it.title : "\uC545\uBCF4"
        })),
        total,
        method: { card: "\uC2E0\uC6A9 / \uCCB4\uD06C\uCE74\uB4DC", kakao: "\uCE74\uCE74\uC624\uD398\uC774", naver: "\uB124\uC774\uBC84\uD398\uC774", bank: "\uACC4\uC88C\uC774\uCCB4" }[pay],
        guest: !member,
        email: member ? user.email : email,
        buyer: member ? user.name : name,
        phone: member ? "" : phone,
        cartIds: ids.slice(),
        authUserId: member ? user.authId || user.auth_user_id || null : null,
        provider: member ? user.provider || user.auth_provider || "email" : null,
        auth_provider: member ? user.provider || user.auth_provider || "email" : null
      };
      try {
        await window.ChodrumPayments.requestCheckout(order, pay);
      } catch (e) {
        console.warn(e);
        F.toast(e && e.message || "\uACB0\uC81C \uC694\uCCAD\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694");
        setPaying(false);
      }
    };
    const payBtn = (size) => /* @__PURE__ */ React.createElement(Button, { variant: "primary", size, fullWidth: true, disabled: !canPay || paying, onClick: doPay }, paying ? "\uACB0\uC81C\uCC3D \uC5EC\uB294 \uC911\u2026" : F.won(total) + " \uACB0\uC81C\uD558\uAE30");
    const docTitle = doc === "purchase" ? "\uAD6C\uB9E4\uC870\uAC74 \uBC0F \uACB0\uC81C \uC9C4\uD589 \uB3D9\uC758" : doc === "refund" ? "\uB514\uC9C0\uD138 \uCF58\uD150\uCE20 \xB7 \uD658\uBD88 \uC815\uCC45 \uB3D9\uC758" : "\uB9C8\uCF00\uD305 \uC218\uC2E0 \uB3D9\uC758";
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uC8FC\uBB38 / \uACB0\uC81C", back: F.PAGES.cart, cta: payBtn("lg") }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-06 \uC8FC\uBB38/\uACB0\uC81C", className: "fo-two", style: { paddingTop: 4 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(F.Section, { label: "\uC8FC\uBB38\uC790 \uC815\uBCF4", first: true }, member ? /* @__PURE__ */ React.createElement(Card, { padding: 16, style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement(F.KV, { k: "\uC774\uB984", v: /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, user.name) }), /* @__PURE__ */ React.createElement(F.KV, { k: "\uC774\uBA54\uC77C", v: /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 13 } }, user.email) }), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 13, style: { color: "var(--status-success)" } }), "\uD68C\uC6D0 \uC815\uBCF4\uB85C \uC790\uB3D9 \uC785\uB825\uB418\uC5C8\uC5B4\uC694. \uAD6C\uB9E4 \uB0B4\uC5ED\uC740 \uB9C8\uC774\uD398\uC774\uC9C0\uC5D0 \uC800\uC7A5\uB3FC\uC694.")) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uC774\uB984", placeholder: "\uC8FC\uBB38\uC790 \uC774\uB984", value: name, onChange: (e) => setName(e.target.value) }), /* @__PURE__ */ React.createElement(Input, { label: "\uC5F0\uB77D\uCC98 (\uC120\uD0DD)", type: "tel", placeholder: "010-0000-0000", value: phone, onChange: (e) => setPhone(e.target.value) }), /* @__PURE__ */ React.createElement(Input, { label: "\uC774\uBA54\uC77C (\uB2E4\uC6B4\uB85C\uB4DC \uC870\uD68C\uC6A9)", type: "email", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), hint: "\uBE44\uD68C\uC6D0\uC740 \uC774 \uC774\uBA54\uC77C\uB85C\uB9CC \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC870\uD68C\uD560 \uC218 \uC788\uC5B4\uC694." }), /* @__PURE__ */ React.createElement(Input, { label: "\uC774\uBA54\uC77C \uC7AC\uD655\uC778", type: "email", placeholder: "\uC774\uBA54\uC77C\uC744 \uD55C \uBC88 \uB354 \uC785\uB825\uD558\uC138\uC694", value: email2, onChange: (e) => setEmail2(e.target.value), error: email2 && !emailMatch ? "\uC774\uBA54\uC77C\uC774 \uC11C\uB85C \uB2EC\uB77C\uC694. \uB2E4\uC2DC \uD655\uC778\uD574\uC8FC\uC138\uC694." : void 0, hint: emailMatch ? "\uC774\uBA54\uC77C\uC774 \uC77C\uCE58\uD574\uC694." : void 0 }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, padding: "12px 14px", background: "var(--status-warning-bg)", borderRadius: "var(--radius-lg)", alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement(Icon, { name: "triangle-alert", size: 15, style: { color: "var(--status-warning)", marginTop: 1, flex: "none" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, lineHeight: 1.55, color: "var(--text-primary)" } }, "\uC774\uBA54\uC77C\uC744 \uC798\uBABB \uC785\uB825\uD558\uBA74 ", /* @__PURE__ */ React.createElement("b", null, "\uAD6C\uB9E4\uD55C \uC545\uBCF4\uB97C \uC870\uD68C\uD560 \uC218 \uC5C6\uC5B4\uC694."), " \uACB0\uC81C \uC804 \uAF2D \uB2E4\uC2DC \uD655\uC778\uD574\uC8FC\uC138\uC694.")))), /* @__PURE__ */ React.createElement(F.Section, { label: "\uC8FC\uBB38 \uC0C1\uD488 " + items.length + "\uAC74" }, /* @__PURE__ */ React.createElement(Card, { padding: 16, style: { display: "flex", flexDirection: "column", gap: 8 } }, items.map((it) => /* @__PURE__ */ React.createElement("div", { key: it.id, className: "fo-kv" }, /* @__PURE__ */ React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 } }, it.title, " ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-secondary)" } }, "\xD7", it.qty)), /* @__PURE__ */ React.createElement(F.Money, { value: it.price * it.qty, size: 14, weight: 500 }))), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { marginTop: 2 } }, "PDF \xB7 \uACB0\uC81C\uC77C\uB85C\uBD80\uD130 7\uC77C\uAC04 \uB2E4\uC6B4\uB85C\uB4DC"))), /* @__PURE__ */ React.createElement(F.Section, { label: "\uACB0\uC81C \uC218\uB2E8" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement(F.PayOption, { id: "card", label: "\uC2E0\uC6A9 / \uCCB4\uD06C\uCE74\uB4DC", cur: pay, onPick: setPay }), /* @__PURE__ */ React.createElement(F.PayOption, { id: "kakao", label: "\uCE74\uCE74\uC624\uD398\uC774", cur: pay, onPick: setPay }), /* @__PURE__ */ React.createElement(F.PayOption, { id: "naver", label: "\uB124\uC774\uBC84\uD398\uC774", cur: pay, onPick: setPay }), /* @__PURE__ */ React.createElement(F.PayOption, { id: "bank", label: "\uACC4\uC88C\uC774\uCCB4", cur: pay, onPick: setPay })), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { marginTop: 8 } }, "\uD1A0\uC2A4\uD398\uC774\uBA3C\uCE20 \uACB0\uC81C\uCC3D\uC73C\uB85C \uC774\uB3D9\uD574 \uC548\uC804\uD558\uAC8C \uACB0\uC81C\uB3FC\uC694.", pgDemo ? /* @__PURE__ */ React.createElement("span", { style: { display: "block", marginTop: 4 } }, "\uD604\uC7AC ", /* @__PURE__ */ React.createElement("b", null, "\uB370\uBAA8 \uBAA8\uB4DC"), "\uC608\uC694. Client Key\uB97C \uB123\uC73C\uBA74 \uC2E4\uC81C \uD14C\uC2A4\uD2B8 \uACB0\uC81C\uCC3D\uC774 \uC5F4\uB824\uC694.") : null)), /* @__PURE__ */ React.createElement(F.Section, { label: "\uC57D\uAD00 \uB3D9\uC758" }, /* @__PURE__ */ React.createElement(Card, { padding: 16, style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Checkbox, { checked: allAgree, onChange: setAll, label: /* @__PURE__ */ React.createElement("b", { style: { fontWeight: 600 } }, "\uC804\uCCB4 \uB3D9\uC758") }), /* @__PURE__ */ React.createElement("hr", { className: "fo-hr" }), /* @__PURE__ */ React.createElement(F.LegalTermRow, { checked: a1, onChange: setA1, kind: "purchase", label: "(\uD544\uC218) \uAD6C\uB9E4\uC870\uAC74 \uBC0F \uACB0\uC81C \uC9C4\uD589 \uB3D9\uC758", onView: () => setDoc("purchase") }), /* @__PURE__ */ React.createElement(F.LegalTermRow, { checked: a2, onChange: setA2, kind: "refund", label: "(\uD544\uC218) \uB514\uC9C0\uD138 \uCF58\uD150\uCE20 \xB7 \uD658\uBD88 \uC815\uCC45 \uB3D9\uC758", onView: () => setDoc("refund") }), /* @__PURE__ */ React.createElement(F.LegalTermRow, { checked: a3, onChange: setA3, kind: "marketing", label: "(\uC120\uD0DD) \uC2E0\uBCF4 \uC18C\uC2DD \xB7 \uD61C\uD0DD \uC54C\uB9BC \uC218\uC2E0 \uB3D9\uC758", onView: () => setDoc("marketing") })))), /* @__PURE__ */ React.createElement("div", { className: "fo-side-sticky" }, /* @__PURE__ */ React.createElement(Card, { padding: 16, style: { display: "flex", flexDirection: "column", gap: 8, marginTop: 20 } }, /* @__PURE__ */ React.createElement(F.KV, { k: "\uCD1D \uC0C1\uD488\uAE08\uC561", v: /* @__PURE__ */ React.createElement(F.Money, { value: total, size: 14, weight: 500 }) }), /* @__PURE__ */ React.createElement(F.KV, { k: "\uC218\uC218\uB8CC", v: /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: "var(--text-secondary)" } }, "\uBB34\uB8CC") }), /* @__PURE__ */ React.createElement("hr", { className: "fo-hr", style: { margin: "4px 0" } }), /* @__PURE__ */ React.createElement(F.KV, { k: /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, "\uCD1D \uACB0\uC81C\uAE08\uC561"), v: /* @__PURE__ */ React.createElement(F.Money, { value: total, size: 20 }) }), /* @__PURE__ */ React.createElement("div", { className: "fo-desktop", style: { marginTop: 8 } }, payBtn("lg")), /* @__PURE__ */ React.createElement("p", { className: "fo-caption" }, "\uACB0\uC81C \uC644\uB8CC \uC2DC\uC810\uBD80\uD130 7\uC77C \uB2E4\uC6B4\uB85C\uB4DC \uAE30\uAC04\uC774 \uC2DC\uC791\uB3FC\uC694. \uACB0\uC81C \uC2E4\uD328 \uC2DC \uC7A5\uBC14\uAD6C\uB2C8\uB294 \uADF8\uB300\uB85C \uC720\uC9C0\uB3FC\uC694.")))), /* @__PURE__ */ React.createElement(F.Dialog, { open: !!doc, onClose: () => setDoc(null), title: docTitle, wide: true }, doc ? /* @__PURE__ */ React.createElement(F.LegalDocBody, { kind: doc }) : null));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(CheckoutPage, null));
  });
})();
