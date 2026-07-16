(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, IconButton, Card, Badge, Input, Checkbox, Icon } = DS;
  const B = window.BO;
  const D = window.DrumData;
  function ManageList({ title, hint, items, setItems, countOf, showExpose }) {
    const [input, setInput] = React.useState("");
    const add = () => {
      const v = input.trim();
      if (!v) return;
      if (items.some((it) => it.name === v)) {
        B.toast("\uC774\uBBF8 \uC788\uB294 \uD56D\uBAA9\uC774\uC5D0\uC694");
        return;
      }
      setItems([...items, { name: v, on: true }]);
      setInput("");
      B.toast("\u300C" + v + "\u300D \uD56D\uBAA9\uC744 \uCD94\uAC00\uD588\uC5B4\uC694");
    };
    return /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement(B.CardHead, { title, right: /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)" } }, items.length, "\uAC1C") }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 18px 6px", display: "flex", flexDirection: "column" } }, items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: it.name, style: { display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderTop: i ? "1px solid var(--border-default)" : "none" } }, /* @__PURE__ */ React.createElement(Icon, { name: "grip-vertical", size: 14, style: { color: "var(--color-icon)", opacity: 0.6 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 500, flex: 1 } }, it.name), countOf ? /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11.5, color: "var(--text-tertiary)" } }, countOf(it.name), "\uACE1") : null, showExpose ? /* @__PURE__ */ React.createElement(Checkbox, { checked: it.on, onChange: (on) => setItems(items.map((x) => x.name === it.name ? { ...x, on } : x)), label: /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-secondary)" } }, "\uD648 \uB178\uCD9C") }) : null, /* @__PURE__ */ React.createElement(IconButton, { name: "trash-2", variant: "ghost", size: "sm", label: "\uC0AD\uC81C", onClick: () => {
      setItems(items.filter((x) => x.name !== it.name));
      B.toast("\uC0AD\uC81C\uD588\uC5B4\uC694");
    } })))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, padding: "12px 18px 16px", borderTop: "1px solid var(--border-default)" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(Input, { size: "sm", placeholder: "\uC0C8 \uD56D\uBAA9 \uC774\uB984", value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => e.key === "Enter" && add() })), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", iconLeft: "plus", onClick: add }, "\uCD94\uAC00")), hint ? /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)", padding: "0 18px 16px", lineHeight: 1.5 } }, hint) : null);
  }
  function CategoriesPage() {
    const [genres, setGenres] = React.useState(D.genres.map((g) => ({ name: g, on: true })));
    const [levels, setLevels] = React.useState(D.levels.map((l) => ({ name: l, on: true })));
    return /* @__PURE__ */ React.createElement(B.Shell, { active: "categories", title: "\uCE74\uD14C\uACE0\uB9AC / \uC7A5\uB974 \uAD00\uB9AC" }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "BO-02-03 \uCE74\uD14C\uACE0\uB9AC \uAD00\uB9AC", style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "bo-cards2" }, /* @__PURE__ */ React.createElement(
      ManageList,
      {
        title: "\uC7A5\uB974",
        items: genres,
        setItems: setGenres,
        showExpose: true,
        countOf: (g) => D.sheets.filter((s) => s.genre === g).length,
        hint: "\uC7A5\uB974\uB97C \uC0AD\uC81C\uD574\uB3C4 \uD574\uB2F9 \uC545\uBCF4\uB294 \uC0AD\uC81C\uB418\uC9C0 \uC54A\uC544\uC694. \uBBF8\uBD84\uB958 \uC0C1\uD0DC\uAC00 \uB418\uBA70 \uC545\uBCF4 \uAD00\uB9AC\uC5D0\uC11C \uC7AC\uC9C0\uC815\uD560 \uC218 \uC788\uC5B4\uC694."
      }
    ), /* @__PURE__ */ React.createElement(
      ManageList,
      {
        title: "\uB09C\uC774\uB3C4",
        items: levels,
        setItems: setLevels,
        countOf: (l) => D.sheets.filter((s) => s.level === l).length,
        hint: "\uB09C\uC774\uB3C4\uB294 \uBAA9\uB85D \uD544\uD130\uC640 \uC545\uBCF4 \uCE74\uB4DC \uBC43\uC9C0\uC5D0 \uC0AC\uC6A9\uB3FC\uC694. \uC21C\uC11C\uB300\uB85C \uB178\uCD9C\uB3FC\uC694."
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "md", iconLeft: "check", onClick: () => B.toast("\uCE74\uD14C\uACE0\uB9AC \uC124\uC815\uC744 \uC800\uC7A5\uD588\uC5B4\uC694") }, "\uBCC0\uACBD\uC0AC\uD56D \uC800\uC7A5"))));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(CategoriesPage, null));
  });
})();
