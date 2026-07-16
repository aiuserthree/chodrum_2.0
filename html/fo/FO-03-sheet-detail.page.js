(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, IconButton, Card, Badge, Icon } = DS;
  const F = window.FO;
  const D = window.DrumData;
  const A = window.ChodrumAPI;
  function YouTubeFallback({ id, title }) {
    const thumb = A.youtubeThumbUrl(id);
    const watch = A.youtubeWatchUrl(id);
    const label = title ? title + " \u2014 YouTube\uC5D0\uC11C \uBCF4\uAE30" : "YouTube\uC5D0\uC11C \uBCF4\uAE30";
    return /* @__PURE__ */ React.createElement("div", { className: "fo-yt fo-yt-fallback", role: "region", "aria-label": label }, thumb ? /* @__PURE__ */ React.createElement("img", { className: "fo-yt-fallback-img", src: thumb, alt: "", decoding: "async" }) : null, /* @__PURE__ */ React.createElement("div", { className: "fo-yt-fallback-scrim", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("a", { className: "fo-yt-open", href: watch, target: "_blank", rel: "noopener noreferrer" }, "YouTube\uC5D0\uC11C \uBCF4\uAE30"));
  }
  function YouTubePlayer({ url, title }) {
    const id = A && A.parseYouTubeId ? A.parseYouTubeId(url) : "";
    const [mode, setMode] = React.useState(() => {
      if (!id) return "none";
      if (A.youtubeEmbedBlockedOnHost && A.youtubeEmbedBlockedOnHost()) return "fallback";
      return "embed";
    });
    React.useEffect(() => {
      if (!id || mode !== "embed" || !A.youtubeCanEmbed) return void 0;
      let cancelled = false;
      A.youtubeCanEmbed(id).then((ok) => {
        if (cancelled) return;
        if (ok === false) setMode("fallback");
      });
      return () => {
        cancelled = true;
      };
    }, [id, mode]);
    if (!id || mode === "none") return null;
    if (mode === "fallback") return /* @__PURE__ */ React.createElement(YouTubeFallback, { id, title });
    const embed = A.youtubeEmbedUrl(id, false);
    const label = title ? title + " \uC5F0\uB3D9 \uC601\uC0C1" : "\uC5F0\uB3D9 \uC601\uC0C1";
    return /* @__PURE__ */ React.createElement("div", { className: "fo-yt", role: "region", "aria-label": label }, /* @__PURE__ */ React.createElement(
      "iframe",
      {
        src: embed,
        title: label,
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        allowFullScreen: true,
        referrerPolicy: "strict-origin-when-cross-origin"
      }
    ));
  }
  function sheetYoutubeUrl(s) {
    if (!s) return "";
    return String(s.youtubeUrl || s.youtube_url || "").trim();
  }
  function DetailPage() {
    const slugPath = F.detailSlugFromPath();
    const idFromQuery = F.qp("id");
    const [sheet, setSheet] = React.useState(null);
    const [loadState, setLoadState] = React.useState("loading");
    F.useStoreTick();
    React.useEffect(() => {
      let cancelled = false;
      async function resolveSheet() {
        if (!slugPath && !idFromQuery) {
          if (!cancelled) {
            setSheet(null);
            setLoadState("missing");
          }
          return;
        }
        try {
          if (window.ChodrumAPI && ChodrumAPI.ready) await ChodrumAPI.ready;
        } catch (_) {
        }
        const D2 = window.DrumData;
        let s2 = null;
        if (slugPath && D2 && typeof D2.bySlug === "function") {
          s2 = D2.bySlug(slugPath);
        }
        if (!s2 && idFromQuery && D2 && typeof D2.byId === "function") {
          s2 = D2.byId(idFromQuery);
        }
        if (!s2 && slugPath && window.ChodrumAPI && ChodrumAPI.sheets && typeof ChodrumAPI.sheets.getBySlug === "function") {
          try {
            s2 = await ChodrumAPI.sheets.getBySlug(slugPath);
          } catch (e) {
            console.warn("[FO-03] getBySlug", e);
          }
        }
        if (cancelled) return;
        if (!s2) {
          setSheet(null);
          setLoadState("missing");
          return;
        }
        if (s2.status && s2.status !== "\uD310\uB9E4\uC911") {
          setSheet(s2);
          setLoadState("stopped");
          return;
        }
        setSheet(s2);
        setLoadState("ok");
      }
      setLoadState("loading");
      resolveSheet();
      window.addEventListener("chodrum:ready", resolveSheet);
      return () => {
        cancelled = true;
        window.removeEventListener("chodrum:ready", resolveSheet);
      };
    }, [slugPath, idFromQuery]);
    React.useEffect(() => {
      if (!idFromQuery || slugPath || !sheet || !sheet.slug) return;
      const next = F.sheetUrl(sheet);
      const cur = location.pathname + location.search;
      if (next && cur !== next) {
        history.replaceState(null, "", next);
      }
    }, [idFromQuery, slugPath, sheet && sheet.slug, sheet && sheet.id]);
    const [cartAsk, setCartAsk] = React.useState(false);
    const [cartMsg, setCartMsg] = React.useState("\uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uB2F4\uC558\uC5B4\uC694");
    if (loadState === "loading") {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uC545\uBCF4 \uC0C1\uC138", back: F.PAGES.list }, /* @__PURE__ */ React.createElement("div", { style: { padding: "64px 24px", textAlign: "center", color: "var(--text-secondary)", fontSize: 14 } }, "\uC545\uBCF4 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\u2026"));
    }
    if (loadState === "missing" || !sheet) {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uC545\uBCF4 \uC0C1\uC138", back: F.PAGES.list }, /* @__PURE__ */ React.createElement(F.Empty, { icon: "music", title: "\uC545\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC5B4\uC694", sub: "\uD310\uB9E4\uAC00 \uC885\uB8CC\uB418\uC5C8\uAC70\uB098 \uC0AD\uC81C\uB41C \uC545\uBCF4\uC608\uC694. \uB2E4\uB978 \uC545\uBCF4\uB97C \uB458\uB7EC\uBCF4\uC138\uC694.", action: "\uC545\uBCF4 \uB458\uB7EC\uBCF4\uAE30", href: F.PAGES.list }));
    }
    if (loadState === "stopped" || sheet.status && sheet.status !== "\uD310\uB9E4\uC911") {
      return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uC545\uBCF4 \uC0C1\uC138", back: F.PAGES.list }, /* @__PURE__ */ React.createElement(F.Empty, { icon: "eye-off", title: "\uD604\uC7AC \uD310\uB9E4\uD558\uC9C0 \uC54A\uB294 \uC545\uBCF4\uC608\uC694", sub: "\uB2E4\uB978 \uC545\uBCF4\uB97C \uB458\uB7EC\uBCF4\uC138\uC694.", action: "\uC545\uBCF4 \uB458\uB7EC\uBCF4\uAE30", href: F.PAGES.list }));
    }
    const s = sheet;
    const faved = Store.fav.has(s.id);
    const related = D.sheets.filter((x) => x.genre === s.genre && x.id !== s.id && (!x.status || x.status === "\uD310\uB9E4\uC911")).slice(0, 4);
    const previewUrls = s.previewUrls && s.previewUrls.length ? s.previewUrls.slice(0, 2) : s.previewUrl ? [s.previewUrl] : [];
    const ytUrl = sheetYoutubeUrl(s);
    const ytId = A && A.parseYouTubeId ? A.parseYouTubeId(ytUrl) : "";
    const add = () => {
      const ok = Store.cart.add(s.id, 1);
      setCartMsg(ok ? "\uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uB2F4\uC558\uC5B4\uC694" : "\uC774\uBBF8 \uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uC788\uC5B4\uC694");
      setCartAsk(true);
    };
    const CtaButtons = ({ large }) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      IconButton,
      {
        name: "heart",
        variant: "secondary",
        size: "lg",
        label: "\uCC1C\uD558\uAE30",
        style: faved ? { color: "var(--status-danger)" } : void 0,
        onClick: () => {
          const on = Store.fav.toggle(s.id);
          F.toast(on ? "\uCC1C \uBAA9\uB85D\uC5D0 \uB2F4\uC558\uC5B4\uC694" : "\uCC1C\uC744 \uD574\uC81C\uD588\uC5B4\uC694");
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, iconLeft: "shopping-cart", onClick: add }, "\uC7A5\uBC14\uAD6C\uB2C8 \uB2F4\uAE30")));
    return /* @__PURE__ */ React.createElement(F.Scaffold, { title: "\uC545\uBCF4 \uC0C1\uC138", back: F.PAGES.list, cta: /* @__PURE__ */ React.createElement(CtaButtons, null) }, /* @__PURE__ */ React.createElement("div", { "data-screen-label": "FO-03 \uC545\uBCF4 \uC0C1\uC138", className: "fo-two", style: { paddingTop: 20 } }, /* @__PURE__ */ React.createElement("div", null, ytId ? /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement(Card, { padding: 0, style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement(YouTubePlayer, { url: ytUrl, title: s.title })), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { marginTop: 10, display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "play", size: 13, style: { color: "var(--color-icon)" } }), "\uD398\uC774\uC9C0\uC5D0\uC11C \uBC14\uB85C \uC7AC\uC0DD\uD558\uAC70\uB098, \uC548 \uB418\uBA74 YouTube\uC5D0\uC11C \uC5F4 \uC218 \uC788\uC5B4\uC694.")) : null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, (previewUrls.length ? previewUrls : [null]).map((url, i) => /* @__PURE__ */ React.createElement(Card, { key: i, padding: 0, style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement(F.StaffThumb, { ratio: "5 / 4", size: 44, watermark: "strong", fit: "cover", src: url || void 0, alt: url ? "\uBBF8\uB9AC\uBCF4\uAE30 " + (i + 1) + "\uD398\uC774\uC9C0" : "" })))), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { marginTop: 10, display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "eye", size: 13, style: { color: "var(--color-icon)" } }), "\uBBF8\uB9AC\uBCF4\uAE30\uB294 1\u20132\uD398\uC774\uC9C0\uB9CC \uC81C\uACF5\uB418\uBA70, \uC77C\uBD80\uB9CC \uBCF4\uC774\uB3C4\uB85D \uCC98\uB9AC\uB3FC\uC694.")), /* @__PURE__ */ React.createElement("div", { className: "fo-side-sticky", style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, s.popular ? /* @__PURE__ */ React.createElement(Badge, { variant: "solid", size: "sm" }, "\uC778\uAE30") : null, s.isNew ? /* @__PURE__ */ React.createElement(Badge, { variant: "solid", size: "sm" }, "NEW") : null, /* @__PURE__ */ React.createElement(Badge, { variant: "outline", size: "sm" }, s.level), /* @__PURE__ */ React.createElement(Badge, { variant: "neutral", size: "sm" }, s.genre)), /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "clamp(22px, 3vw, 28px)", letterSpacing: "-0.9px", lineHeight: 1.25 } }, s.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: "var(--text-secondary)" } }, /* @__PURE__ */ React.createElement("span", null, s.artist)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8 } }, /* @__PURE__ */ React.createElement(F.Money, { value: s.price, size: 28 }), s.orig ? /* @__PURE__ */ React.createElement(F.Money, { value: s.orig, size: 15, strike: true }) : null, s.orig ? /* @__PURE__ */ React.createElement(Badge, { variant: "danger", size: "sm" }, Math.round((1 - s.price / s.orig) * 100), "% \uD560\uC778") : null), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-cards)", display: "flex", flexDirection: "column", gap: 10, background: "var(--surface-card)" } }, [["\uC7A5\uB974", s.genre], ["\uB09C\uC774\uB3C4", s.level], ["\uD398\uC774\uC9C0", s.pages + "\uD398\uC774\uC9C0"], ["\uD30C\uC77C \uD615\uC2DD", "PDF"], ["\uB2E4\uC6B4\uB85C\uB4DC", "\uACB0\uC81C\uC77C\uB85C\uBD80\uD130 7\uC77C\uAC04"]].map(([k, v]) => /* @__PURE__ */ React.createElement(F.KV, { key: k, k, v: /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500 } }, v) }))), /* @__PURE__ */ React.createElement("div", { className: "fo-desktop", style: { display: "flex", gap: 10, marginTop: 6 } }, /* @__PURE__ */ React.createElement(CtaButtons, null)), /* @__PURE__ */ React.createElement("p", { className: "fo-caption", style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "info", size: 13, style: { color: "var(--color-icon)" } }), "\uACB0\uC81C\uB294 \uC7A5\uBC14\uAD6C\uB2C8\uC5D0\uC11C \uC9C4\uD589\uB3FC\uC694. \uBC14\uB85C \uACB0\uC81C\uB294 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC544\uC694."))), /* @__PURE__ */ React.createElement("section", { style: { marginTop: 44 } }, /* @__PURE__ */ React.createElement(F.SectionHeader, { title: "\uAD00\uB828 \uC545\uBCF4", action: "\uB354\uBCF4\uAE30", href: F.PAGES.list + "?cat=" + encodeURIComponent(s.genre) }), /* @__PURE__ */ React.createElement("div", { className: "fo-grid" }, related.map((r) => /* @__PURE__ */ React.createElement(F.SheetCard, { key: r.id, s: r })))), /* @__PURE__ */ React.createElement(F.CartAddedDialog, { open: cartAsk, onClose: () => setCartAsk(false), message: cartMsg }));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(DetailPage, null));
  });
})();
