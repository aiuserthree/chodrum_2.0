(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, IconButton, Card, Badge, Chip, Select, Input, Checkbox } = DS;
  const B = window.BO;
  const A = window.AdminData;
  const D = window.DrumData;
  const STATUS_TONE = { \uD310\uB9E4\uC911: "success", \uD310\uB9E4\uC911\uC9C0: "warning", \uC228\uAE40: "neutral" };
  const PAGE_SIZE = 20;
  const SORT_OPTIONS = ["\uCD5C\uC2E0\uC21C", "\uC774\uB984 \uC624\uB984\uCC28\uC21C", "\uC774\uB984 \uB0B4\uB9BC\uCC28\uC21C"];
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
  function SheetsPage() {
    const [rows, setRows] = React.useState(D.sheets.map((s, i) => ({
      ...s,
      code: s.code || "DS-" + (1042 - i),
      status: s.status || A.sheetStatus[s.id] || "\uD310\uB9E4\uC911"
    })));
    const [q, setQ] = React.useState(B.qp("q"));
    const [genre, setGenre] = React.useState("\uC804\uCCB4");
    const [status, setStatus] = React.useState("\uC804\uCCB4");
    const [sel, setSel] = React.useState([]);
    const [bulk, setBulk] = React.useState("\uD310\uB9E4\uC911");
    const [sort, setSort] = React.useState("\uCD5C\uC2E0\uC21C");
    const [page, setPage] = React.useState(1);
    const sheetTime = (s) => {
      const raw = s.createdAt || s.created_at;
      if (raw) {
        const t = new Date(raw).getTime();
        if (!Number.isNaN(t)) return t;
      }
      if (typeof s.id === "string" && /^s\d+$/.test(s.id)) return Number(s.id.slice(1)) || 0;
      return 0;
    };
    const list = rows.filter(
      (s) => (genre === "\uC804\uCCB4" || s.genre === genre) && (status === "\uC804\uCCB4" || s.status === status) && (s.title + s.artist).toLowerCase().includes(q.toLowerCase())
    ).sort((a, b) => {
      if (sort === "\uC774\uB984 \uC624\uB984\uCC28\uC21C") return String(a.title || "").localeCompare(String(b.title || ""), "ko");
      if (sort === "\uC774\uB984 \uB0B4\uB9BC\uCC28\uC21C") return String(b.title || "").localeCompare(String(a.title || ""), "ko");
      return sheetTime(b) - sheetTime(a);
    });
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const allOn = pageRows.length > 0 && pageRows.every((s) => sel.includes(s.id));
    const pages = pageWindow(safePage, totalPages, 5);
    React.useEffect(() => {
      setPage(1);
    }, [q, genre, status, sort]);
    React.useEffect(() => {
      if (page !== safePage) setPage(safePage);
    }, [page, safePage]);
    const setRow = (id, patch) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, ...patch } : r));
    const applyBulk = async () => {
      setRows((rs) => rs.map((r) => sel.includes(r.id) ? { ...r, status: bulk } : r));
      try {
        await window.ChodrumAPI.sheets.setStatus(sel, bulk);
        B.toast(sel.length + "\uAC1C \uC545\uBCF4\uB97C \u300C" + bulk + "\u300D \uC0C1\uD0DC\uB85C \uBCC0\uACBD\uD588\uC5B4\uC694");
      } catch (e) {
        console.warn(e);
        B.toast("\uC0C1\uD0DC \uBCC0\uACBD \uC800\uC7A5 \uC2E4\uD328");
      }
      setSel([]);
    };
    const removeSel = async () => {
      const ids = sel.slice();
      setRows((rs) => rs.filter((r) => !sel.includes(r.id)));
      try {
        await window.ChodrumAPI.sheets.remove(ids);
        B.toast(ids.length + "\uAC1C \uC545\uBCF4\uB97C \uC0AD\uC81C\uD588\uC5B4\uC694");
      } catch (e) {
        console.warn(e);
        B.toast("\uC0AD\uC81C \uB3D9\uAE30\uD654 \uC2E4\uD328");
      }
      setSel([]);
    };
    const toggleStatus = async (s) => {
      const next = s.status === "\uD310\uB9E4\uC911" ? "\uC228\uAE40" : "\uD310\uB9E4\uC911";
      setRow(s.id, { status: next });
      try {
        await window.ChodrumAPI.sheets.setStatus([s.id], next);
        B.toast("\u300C" + s.title + "\u300D \u2192 " + next);
      } catch (e) {
        console.warn(e);
        B.toast("\uC0C1\uD0DC \uBCC0\uACBD \uC2E4\uD328");
      }
    };
    const removeOne = async (id) => {
      setRows((rs) => rs.filter((r) => r.id !== id));
      try {
        await window.ChodrumAPI.sheets.remove([id]);
        B.toast("\uC0AD\uC81C\uD588\uC5B4\uC694");
      } catch (e) {
        console.warn(e);
        B.toast("\uC0AD\uC81C \uC2E4\uD328");
      }
    };
    return /* @__PURE__ */ React.createElement(B.Shell, { active: "sheets", title: "\uC545\uBCF4 \uAD00\uB9AC", actions: /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", iconLeft: "plus", onClick: () => location.href = "/bo/sheets/register" }, "\uC545\uBCF4 \uB4F1\uB85D") }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "BO-02 \uC545\uBCF4 \uAD00\uB9AC", style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "bo-toolbar" }, /* @__PURE__ */ React.createElement("div", { style: { width: 240, maxWidth: "100%" } }, /* @__PURE__ */ React.createElement(Input, { size: "sm", iconLeft: "search", placeholder: "\uACE1\uBA85 / \uC544\uD2F0\uC2A4\uD2B8", value: q, onChange: (e) => setQ(e.target.value) })), /* @__PURE__ */ React.createElement("div", { style: { width: 140 } }, /* @__PURE__ */ React.createElement(Select, { size: "sm", value: genre, onChange: (e) => setGenre(e.target.value), options: ["\uC804\uCCB4", ...D.genres] })), /* @__PURE__ */ React.createElement("div", { style: { width: 130 } }, /* @__PURE__ */ React.createElement(Select, { size: "sm", value: status, onChange: (e) => setStatus(e.target.value), options: ["\uC804\uCCB4", "\uD310\uB9E4\uC911", "\uD310\uB9E4\uC911\uC9C0", "\uC228\uAE40"] })), /* @__PURE__ */ React.createElement("div", { style: { width: 140 } }, /* @__PURE__ */ React.createElement(Select, { size: "sm", value: sort, onChange: (e) => setSort(e.target.value), options: SORT_OPTIONS })), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)", marginLeft: "auto" } }, list.length, "\uAC1C")), sel.length ? /* @__PURE__ */ React.createElement(Card, { padding: 12, style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: 600 } }, sel.length, "\uAC1C \uC120\uD0DD"), /* @__PURE__ */ React.createElement("div", { style: { width: 130 } }, /* @__PURE__ */ React.createElement(Select, { size: "sm", value: bulk, onChange: (e) => setBulk(e.target.value), options: ["\uD310\uB9E4\uC911", "\uD310\uB9E4\uC911\uC9C0", "\uC228\uAE40"] })), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", onClick: applyBulk }, "\uC77C\uAD04 \uC0C1\uD0DC \uBCC0\uACBD"), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", iconLeft: "trash-2", onClick: removeSel }, "\uC0AD\uC81C"), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => setSel([]) }, "\uC120\uD0DD \uD574\uC81C")) : null, /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement("div", { style: { padding: 6 } }, /* @__PURE__ */ React.createElement(B.Table, { minWidth: 860, head: [{ l: "" }, "\uACE1\uBA85 / \uC544\uD2F0\uC2A4\uD2B8", "ID", "\uC7A5\uB974", "\uB09C\uC774\uB3C4", { l: "\uAC00\uACA9", r: true }, { l: "\uD310\uB9E4", r: true }, "\uC0C1\uD0DC", ""] }, pageRows.map((s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement(B.Td, { style: { width: 40 } }, /* @__PURE__ */ React.createElement(Checkbox, { checked: sel.includes(s.id), onChange: (on) => setSel(on ? [...sel, s.id] : sel.filter((x) => x !== s.id)) })), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(B.Thumb, null), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600 } }, s.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-secondary)" } }, s.artist, " \xB7 ", s.pages, "p")))), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("span", { style: { ...B.mono, fontSize: 12, color: "var(--text-secondary)" } }, s.code)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: "neutral", size: "sm" }, s.genre)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: "outline", size: "sm" }, s.level)), /* @__PURE__ */ React.createElement(B.Td, { r: true }, /* @__PURE__ */ React.createElement("span", { style: B.mono }, B.won(s.price))), /* @__PURE__ */ React.createElement(B.Td, { r: true }, /* @__PURE__ */ React.createElement("span", { style: B.mono }, s.sold.toLocaleString("ko-KR"))), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement(Badge, { variant: STATUS_TONE[s.status], size: "sm" }, s.status)), /* @__PURE__ */ React.createElement(B.Td, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 2 } }, /* @__PURE__ */ React.createElement(IconButton, { name: "pencil", variant: "ghost", size: "sm", label: "\uC218\uC815", onClick: () => location.href = "/bo/sheets/register?id=" + encodeURIComponent(s.id) }), /* @__PURE__ */ React.createElement(
      IconButton,
      {
        name: s.status === "\uD310\uB9E4\uC911" ? "eye-off" : "eye",
        variant: "ghost",
        size: "sm",
        label: "\uB178\uCD9C \uC804\uD658",
        onClick: () => toggleStatus(s)
      }
    ), /* @__PURE__ */ React.createElement(IconButton, { name: "trash-2", variant: "ghost", size: "sm", label: "\uC0AD\uC81C", onClick: () => removeOne(s.id) }))))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid var(--border-default)" } }, /* @__PURE__ */ React.createElement(
      Checkbox,
      {
        checked: allOn,
        indeterminate: pageRows.some((s) => sel.includes(s.id)) && !allOn,
        label: "\uC804\uCCB4 \uC120\uD0DD",
        onChange: (on) => {
          const ids = pageRows.map((s) => s.id);
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
    )))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)" } }, "\uD310\uB9E4\uC911\uC9C0 \xB7 \uC228\uAE40 \uC0C1\uD0DC\uC758 \uC545\uBCF4\uB294 \uC2A4\uD1A0\uC5B4\uC5D0 \uB178\uCD9C\uB418\uC9C0 \uC54A\uC9C0\uB9CC, \uC774\uBBF8 \uAD6C\uB9E4\uD55C \uC0AC\uC6A9\uC790\uC758 \uB2E4\uC6B4\uB85C\uB4DC \uAD8C\uD55C\uC740 \uC720\uC9C0\uB3FC\uC694.")));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(SheetsPage, null));
  });
})();
