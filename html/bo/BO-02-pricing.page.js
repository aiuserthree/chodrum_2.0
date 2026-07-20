(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Card, Badge, Input, Checkbox } = DS;
  const B = window.BO;
  const D = window.DrumData;
  const PAGE_SIZE = 20;
  function pageWindow(cur, total, span) {
    if (total <= 1) return [1];
    const half = Math.floor(span / 2);
    let start = Math.max(1, cur - half);
    let end = Math.min(total, start + span - 1);
    start = Math.max(1, end - span + 1);
    const pages = [];
    for (let n = start; n <= end; n++) pages.push(n);
    return pages;
  }
  function priceInput(value, onChange) {
    return /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        value,
        onChange,
        style: { width: 92, padding: "7px 10px", fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "right", border: "1px solid var(--border-default)", borderRadius: 8, background: "var(--surface-card)", color: "var(--text-primary)", outline: "none" },
        onFocus: (e) => e.target.style.boxShadow = "0 0 0 3px var(--focus-ring)",
        onBlur: (e) => e.target.style.boxShadow = "none"
      }
    );
  }
  function PricingPage() {
    const [rows, setRows] = React.useState(D.sheets.map((s) => ({ id: s.id, title: s.title, artist: s.artist, orig: s.orig || s.price, price: s.price })));
    const [sel, setSel] = React.useState([]);
    const [pct, setPct] = React.useState("10");
    const [page, setPage] = React.useState(1);
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const allOn = pageRows.length > 0 && pageRows.every((r) => sel.includes(r.id));
    const pages = pageWindow(safePage, totalPages, 5);
    React.useEffect(() => {
      if (page !== safePage) setPage(safePage);
    }, [page, safePage]);
    const setRow = (id, patch) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, ...patch } : r));
    const applyDiscount = () => {
      const p = Math.min(90, Math.max(0, Number(pct) || 0));
      setRows((rs) => rs.map((r) => sel.includes(r.id) ? { ...r, price: Math.round(r.orig * (1 - p / 100) / 100) * 100 } : r));
      B.toast(sel.length + "\uAC1C \uC545\uBCF4\uC5D0 " + p + "% \uD560\uC778\uC744 \uC801\uC6A9\uD588\uC5B4\uC694");
    };
    return /* @__PURE__ */ React.createElement(
      B.Shell,
      {
        active: "pricing",
        title: "\uAC00\uACA9 \uAD00\uB9AC",
        actions: /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", iconLeft: "check", onClick: () => B.toast("\uAC00\uACA9 \uBCC0\uACBD\uC0AC\uD56D\uC744 \uC800\uC7A5\uD588\uC5B4\uC694") }, "\uC800\uC7A5")
      },
      /* @__PURE__ */ React.createElement("div", { "data-screen-label": "BO-02-04 \uAC00\uACA9 \uAD00\uB9AC", style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, { padding: 12, style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: 600 } }, sel.length ? sel.length + "\uAC1C \uC120\uD0DD" : "\uC77C\uAD04 \uD560\uC778"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("input", { type: "number", value: pct, onChange: (e) => setPct(e.target.value), style: { width: 64, padding: "7px 10px", fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "right", border: "1px solid var(--border-default)", borderRadius: 8, outline: "none" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-secondary)" } }, "% \uD560\uC778")), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", disabled: !sel.length, onClick: applyDiscount }, "\uC120\uD0DD \uD56D\uBAA9\uC5D0 \uC801\uC6A9"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-secondary)", marginLeft: "auto" } }, "\uC815\uAC00 \uAE30\uC900\uC73C\uB85C \uACC4\uC0B0\uB418\uACE0 100\uC6D0 \uB2E8\uC704\uB85C \uBC18\uC62C\uB9BC\uB3FC\uC694.")), /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement("div", { style: { padding: 6 } }, /* @__PURE__ */ React.createElement(B.Table, { minWidth: 720, head: [{ l: "" }, "\uACE1\uBA85 / \uC544\uD2F0\uC2A4\uD2B8", { l: "\uC815\uAC00", r: true }, { l: "\uD310\uB9E4\uAC00", r: true }, { l: "\uD560\uC778\uC728", r: true }, "\uD45C\uC2DC"] }, pageRows.map((r) => {
        const disc = r.orig > r.price ? Math.round((1 - r.price / r.orig) * 100) : 0;
        return /* @__PURE__ */ React.createElement("tr", { key: r.id }, /* @__PURE__ */ React.createElement(B.Td, { style: { width: 40 } }, /* @__PURE__ */ React.createElement(Checkbox, { checked: sel.includes(r.id), onChange: (on) => setSel(on ? [...sel, r.id] : sel.filter((x) => x !== r.id)) })), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(B.Thumb, null), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600 } }, r.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-secondary)" } }, r.artist)))), /* @__PURE__ */ React.createElement(B.Td, { r: true }, priceInput(r.orig, (e) => setRow(r.id, { orig: Number(e.target.value) || 0 }))), /* @__PURE__ */ React.createElement(B.Td, { r: true }, priceInput(r.price, (e) => setRow(r.id, { price: Number(e.target.value) || 0 }))), /* @__PURE__ */ React.createElement(B.Td, { r: true }, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 13, color: disc ? "var(--status-danger)" : "var(--text-tertiary)" } }, disc ? "-" + disc + "%" : "\u2014")), /* @__PURE__ */ React.createElement(B.Td, null, disc ? /* @__PURE__ */ React.createElement(Badge, { variant: "danger", size: "sm" }, "\uD560\uC778\uC911") : /* @__PURE__ */ React.createElement(Badge, { variant: "neutral", size: "sm" }, "\uC815\uAC00")));
      }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid var(--border-default)" } }, /* @__PURE__ */ React.createElement(
        Checkbox,
        {
          checked: allOn,
          indeterminate: pageRows.some((r) => sel.includes(r.id)) && !allOn,
          label: "\uC804\uCCB4 \uC120\uD0DD",
          onChange: (on) => {
            const ids = pageRows.map((r) => r.id);
            setSel(on ? Array.from(/* @__PURE__ */ new Set([...sel, ...ids])) : sel.filter((id) => !ids.includes(id)));
          }
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 12, alignItems: "center", userSelect: "none" } }, /* @__PURE__ */ React.createElement(
        "span",
        {
          role: "button",
          tabIndex: 0,
          "aria-label": "\uC774\uC804 \uD398\uC774\uC9C0",
          style: { cursor: safePage > 1 ? "pointer" : "default", opacity: safePage > 1 ? 1 : 0.35 },
          onClick: () => safePage > 1 && setPage(safePage - 1),
          onKeyDown: (e) => e.key === "Enter" && safePage > 1 && setPage(safePage - 1)
        },
        "\u2039"
      ), pages.map((n) => /* @__PURE__ */ React.createElement(
        "span",
        {
          key: n,
          role: "button",
          tabIndex: 0,
          "aria-current": n === safePage ? "page" : void 0,
          style: {
            cursor: "pointer",
            fontWeight: n === safePage ? 600 : 400,
            color: n === safePage ? "var(--color-ink)" : void 0
          },
          onClick: () => setPage(n),
          onKeyDown: (e) => e.key === "Enter" && setPage(n)
        },
        n
      )), /* @__PURE__ */ React.createElement(
        "span",
        {
          role: "button",
          tabIndex: 0,
          "aria-label": "\uB2E4\uC74C \uD398\uC774\uC9C0",
          style: { cursor: safePage < totalPages ? "pointer" : "default", opacity: safePage < totalPages ? 1 : 0.35 },
          onClick: () => safePage < totalPages && setPage(safePage + 1),
          onKeyDown: (e) => e.key === "Enter" && safePage < totalPages && setPage(safePage + 1)
        },
        "\u203A"
      )))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)" } }, "\uD560\uC778 \uC911\uC778 \uC545\uBCF4\uB294 \uC2A4\uD1A0\uC5B4\uC5D0 \uC815\uAC00\uC640 \uD560\uC778\uAC00\uAC00 \uD568\uAED8 \uD45C\uC2DC\uB3FC\uC694."))
    );
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(PricingPage, null));
  });
})();
