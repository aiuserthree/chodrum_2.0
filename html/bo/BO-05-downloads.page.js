(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Card, Badge, Chip, Input, Icon } = DS;
  const B = window.BO;
  const A = window.AdminData;
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
  function DownloadsPage() {
    const [rows, setRows] = React.useState(A.downloads);
    const [f, setF] = React.useState("\uC804\uCCB4");
    const [page, setPage] = React.useState(1);
    const [days, setDays] = React.useState("7");
    const [target, setTarget] = React.useState(null);
    const [reDays, setReDays] = React.useState("7");
    const [reason, setReason] = React.useState("");
    const list = rows.filter((r) => f === "\uC804\uCCB4" || r.status === f);
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const pages = pageWindow(safePage, totalPages, 5);
    React.useEffect(() => {
      setPage(1);
    }, [f]);
    React.useEffect(() => {
      if (page !== safePage) setPage(safePage);
    }, [page, safePage]);
    const regrant = () => {
      setRows((rs) => rs.map((r) => r === target ? { ...r, status: "ACTIVE", dday: Number(reDays) || 7 } : r));
      B.toast("\uB2E4\uC6B4\uB85C\uB4DC \uAE30\uAC04\uC744 \uC7AC\uBD80\uC5EC\uD588\uC5B4\uC694 (\uC0AC\uC720\uAC00 \uAC10\uC0AC \uB85C\uADF8\uC5D0 \uAE30\uB85D\uB3FC\uC694)");
      setTarget(null);
      setReason("");
    };
    return /* @__PURE__ */ React.createElement(B.Shell, { active: "downloads", title: "\uB2E4\uC6B4\uB85C\uB4DC \uAD00\uB9AC" }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "BO-05 \uB2E4\uC6B4\uB85C\uB4DC \uAD00\uB9AC", style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, { padding: 18, style: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 220 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 600 } }, "\uB2E4\uC6B4\uB85C\uB4DC \uAE30\uAC04 \uC815\uCC45"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 } }, "\uACB0\uC81C \uC644\uB8CC \uC2DC\uC810\uBD80\uD130 \uC801\uC6A9\uB418\uB294 \uAE30\uBCF8 \uB2E4\uC6B4\uB85C\uB4DC \uAC00\uB2A5 \uAE30\uAC04\uC774\uC5D0\uC694. \uAE30\uAC04 \uB0B4 \uC7AC\uB2E4\uC6B4\uB85C\uB4DC\uB294 \uBB34\uC81C\uD55C \uD5C8\uC6A9\uB3FC\uC694.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("input", { type: "number", value: days, onChange: (e) => setDays(e.target.value), style: { width: 64, padding: "8px 10px", fontFamily: "var(--font-mono)", fontSize: 14, textAlign: "right", border: "1px solid var(--border-default)", borderRadius: 8, outline: "none" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: "var(--text-secondary)" } }, "\uC77C (\uAE30\uBCF8 7\uC77C = 168\uC2DC\uAC04)"), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => B.toast("\uC815\uCC45\uC744 \uC800\uC7A5\uD588\uC5B4\uC694 \xB7 \uC774\uD6C4 \uACB0\uC81C\uBD80\uD130 \uC801\uC6A9\uB3FC\uC694") }, "\uC800\uC7A5"))), /* @__PURE__ */ React.createElement("div", { className: "bo-toolbar" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, ["\uC804\uCCB4", "ACTIVE", "EXPIRED", "REVOKED"].map((x) => /* @__PURE__ */ React.createElement(Chip, { key: x, selected: f === x, onClick: () => setF(x) }, x === "\uC804\uCCB4" ? "\uC804\uCCB4" : B.ENT_LABEL[x]))), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)", marginLeft: "auto" } }, list.length, "\uAC74")), /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement("div", { style: { padding: 6 } }, /* @__PURE__ */ React.createElement(B.Table, { minWidth: 880, head: [{ l: "\uC77C\uC2DC" }, "\uC0AC\uC6A9\uC790", "\uC545\uBCF4", "\uC8FC\uBB38\uBC88\uD638", "\uC0C1\uD0DC", { l: "\uC794\uC5EC", r: true }, ""] }, pageRows.map((r, i) => /* @__PURE__ */ React.createElement("tr", { key: (safePage - 1) * PAGE_SIZE + i }, /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12, color: "var(--text-secondary)" } }, r.at)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("div", { style: { ...B.mono, fontSize: 12 } }, r.email), /* @__PURE__ */ React.createElement(Badge, { variant: r.member ? "outline" : "neutral", size: "sm" }, r.member ? "\uD68C\uC6D0" : "\uBE44\uD68C\uC6D0")), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, D.byId(r.sheetId).title)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12, color: "var(--text-secondary)" } }, r.orderNo)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: B.ENT_TONE[r.status], size: "sm" }, B.ENT_LABEL[r.status])), /* @__PURE__ */ React.createElement(B.Td, { r: true }, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12.5, color: r.status === "ACTIVE" ? "var(--text-primary)" : "var(--text-tertiary)" } }, r.status === "ACTIVE" ? "D-" + r.dday : r.status === "EXPIRED" ? "\uB9CC\uB8CC " + Math.abs(r.dday) + "\uC77C \uACBD\uACFC" : "\u2014")), /* @__PURE__ */ React.createElement(B.Td, null, r.status !== "ACTIVE" ? /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", iconLeft: "refresh-cw", onClick: () => {
      setTarget(r);
      setReDays("7");
      setReason("");
    } }, "\uC7AC\uBD80\uC5EC") : null))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "12px 18px", borderTop: "1px solid var(--border-default)" } }, /* @__PURE__ */ React.createElement("div", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 12, alignItems: "center", userSelect: "none" } }, /* @__PURE__ */ React.createElement(
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
    )))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)" } }, "\uC7AC\uBD80\uC5EC\uB294 \uC608\uC678 \uCC98\uB9AC\uC774\uBA70 \uBC18\uB4DC\uC2DC \uC0AC\uC720\uAC00 \uAE30\uB85D\uB3FC\uC694. \uD658\uBD88\uB85C \uD68C\uC218(REVOKED)\uB41C \uAD8C\uD55C\uB3C4 \uC815\uCC45\uC5D0 \uB530\uB77C \uC7AC\uBD80\uC5EC\uD560 \uC218 \uC788\uC5B4\uC694.")), /* @__PURE__ */ React.createElement(
      B.Modal,
      {
        open: !!target,
        onClose: () => setTarget(null),
        title: "\uB2E4\uC6B4\uB85C\uB4DC \uAE30\uAC04 \uC7AC\uBD80\uC5EC",
        width: 480,
        footer: target ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => setTarget(null) }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", disabled: !reason.trim(), onClick: regrant }, "\uC7AC\uBD80\uC5EC \uD655\uC815")) : null
      },
      target ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement(B.KVRow, { k: "\uB300\uC0C1", v: /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, D.byId(target.sheetId).title) }), /* @__PURE__ */ React.createElement(B.KVRow, { k: "\uC0AC\uC6A9\uC790", v: /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12.5 } }, target.email) }), /* @__PURE__ */ React.createElement(B.KVRow, { k: "\uD604\uC7AC \uC0C1\uD0DC", v: /* @__PURE__ */ React.createElement(Badge, { variant: B.ENT_TONE[target.status], size: "sm" }, B.ENT_LABEL[target.status]) })), /* @__PURE__ */ React.createElement("hr", { style: { height: 1, background: "var(--border-default)", border: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: 500, flex: "none" } }, "\uC7AC\uBD80\uC5EC \uAE30\uAC04"), /* @__PURE__ */ React.createElement("input", { type: "number", value: reDays, onChange: (e) => setReDays(e.target.value), style: { width: 64, padding: "7px 10px", fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "right", border: "1px solid var(--border-default)", borderRadius: 8, outline: "none" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-secondary)" } }, "\uC77C")), /* @__PURE__ */ React.createElement(Input, { label: "\uC7AC\uBD80\uC5EC \uC0AC\uC720 (\uD544\uC218 \xB7 \uAC10\uC0AC \uB85C\uADF8 \uAE30\uB85D)", placeholder: "\uC608: \uAE30\uAC04 \uB0B4 \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328 \uBB38\uC758 \u2014 CS-2260", value: reason, onChange: (e) => setReason(e.target.value) })) : null
    ));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(DownloadsPage, null));
  });
})();
