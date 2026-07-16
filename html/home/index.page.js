(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Icon, Chip, Card, Badge, Input } = DS;
  const F = window.FO;
  const D = window.DrumData;
  function resolveBannerHref(link) {
    if (!link) return null;
    const s = String(link).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    if (/^\/?list/i.test(s)) {
      const q = s.indexOf("?");
      return F.PAGES.list + (q >= 0 ? s.slice(q) : "");
    }
    if (/^\/?detail/i.test(s)) {
      const q = s.indexOf("?");
      return F.PAGES.detail + (q >= 0 ? s.slice(q) : "");
    }
    if (/\.html/i.test(s)) return s.replace(/^\//, "");
    return s.replace(/^\//, "");
  }
  const BANNER_AUTO_MS = 5e3;
  const BANNER_DRAG_THRESHOLD = 0.23;
  const BANNER_FLICK_VX = 0.45;
  function bannerHref(b) {
    if (!b) return null;
    const sheet = b.sheetId ? D.byId(b.sheetId) : null;
    return sheet ? F.PAGES.detail + "?id=" + encodeURIComponent(sheet.id) : resolveBannerHref(b.link);
  }
  function BannerSlide({ banner, linkable }) {
    const href = bannerHref(banner);
    const pcSrc = banner.imgUrl || "";
    const mobileSet = banner.imgUrlMobile || pcSrc;
    const go = () => {
      if (href) location.href = href;
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "fo-home-banner-slide" + (href && linkable ? " is-link" : ""),
        role: href && linkable ? "link" : void 0,
        tabIndex: href && linkable ? 0 : void 0,
        onClick: href && linkable ? go : void 0,
        onKeyDown: href && linkable ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            go();
          }
        } : void 0
      },
      pcSrc ? /* @__PURE__ */ React.createElement("picture", null, /* @__PURE__ */ React.createElement("source", { media: "(max-width: 767px)", srcSet: mobileSet, sizes: "100vw" }), /* @__PURE__ */ React.createElement(
        "img",
        {
          className: "fo-home-banner-img",
          src: pcSrc,
          sizes: "(min-width: 1120px) 1088px, calc(100vw - 32px)",
          width: 1120,
          height: 220,
          alt: banner.title || "\uBC30\uB108",
          decoding: "async",
          draggable: false
        }
      )) : /* @__PURE__ */ React.createElement("div", { className: "fo-home-banner-fallback" }, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-tertiary)" } }, "Banner"), /* @__PURE__ */ React.createElement("strong", null, banner.title))
    );
  }
  function HomeBanners() {
    const [tick, setTick] = React.useState(0);
    const [trackIdx, setTrackIdx] = React.useState(1);
    const [dragPx, setDragPx] = React.useState(0);
    const [animating, setAnimating] = React.useState(false);
    const [paused, setPaused] = React.useState(false);
    const [dragging, setDragging] = React.useState(false);
    const [progressKey, setProgressKey] = React.useState(0);
    const viewportRef = React.useRef(null);
    const trackIdxRef = React.useRef(1);
    const suppressClick = React.useRef(false);
    const dragRef = React.useRef(null);
    React.useEffect(() => {
      const refresh = () => setTick((n2) => n2 + 1);
      window.addEventListener("chodrum:ready", refresh);
      return () => window.removeEventListener("chodrum:ready", refresh);
    }, []);
    const banners = React.useMemo(() => {
      void tick;
      return (D.activeHomeBanners ? D.activeHomeBanners() : []).filter(Boolean).map((b) => ({
        ...b,
        imgUrl: b.imgUrl || b.image_url || "",
        imgUrlMobile: b.imgUrlMobile || b.image_url_mobile || "",
        sheetId: b.sheetId || b.sheet_id || ""
      }));
    }, [tick]);
    const n = banners.length;
    const multi = n > 1;
    const slides = React.useMemo(() => {
      if (!n) return [];
      if (n === 1) return [banners[0]];
      return [banners[n - 1], ...banners, banners[0]];
    }, [banners, n]);
    React.useEffect(() => {
      trackIdxRef.current = trackIdx;
    }, [trackIdx]);
    React.useEffect(() => {
      if (!n) return;
      if (n === 1) {
        setTrackIdx(0);
        trackIdxRef.current = 0;
        return;
      }
      setTrackIdx(1);
      trackIdxRef.current = 1;
      setDragPx(0);
      setAnimating(false);
    }, [n]);
    const realIdx = !n ? 0 : n === 1 ? 0 : (trackIdx - 1 + n) % n;
    const bumpProgress = React.useCallback(() => {
      setProgressKey((k) => k + 1);
    }, []);
    const stepTrack = React.useCallback((dir) => {
      if (!multi) return;
      setAnimating(true);
      setDragPx(0);
      setTrackIdx((i) => {
        const next = i + dir;
        trackIdxRef.current = next;
        return next;
      });
      bumpProgress();
    }, [multi, bumpProgress]);
    const goPrev = React.useCallback((e) => {
      if (e) e.stopPropagation();
      stepTrack(-1);
    }, [stepTrack]);
    const goNext = React.useCallback((e) => {
      if (e) e.stopPropagation();
      stepTrack(1);
    }, [stepTrack]);
    const onProgressEnd = React.useCallback(() => {
      if (!multi || paused || dragging) return;
      stepTrack(1);
    }, [multi, paused, dragging, stepTrack]);
    const onTrackTransitionEnd = React.useCallback((e) => {
      if (e.target !== e.currentTarget) return;
      if (!multi) return;
      const i = trackIdxRef.current;
      if (i === 0) {
        setAnimating(false);
        setTrackIdx(n);
        trackIdxRef.current = n;
      } else if (i === n + 1) {
        setAnimating(false);
        setTrackIdx(1);
        trackIdxRef.current = 1;
      } else {
        setAnimating(false);
      }
    }, [multi, n]);
    const endDrag = React.useCallback(() => {
      const d = dragRef.current;
      if (!d || !d.active) return;
      dragRef.current = null;
      setDragging(false);
      const dx = d.dx;
      if (d.axis !== "x" || Math.abs(dx) < 4) {
        setDragPx(0);
        setAnimating(false);
        return;
      }
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 320);
      const width = viewportRef.current && viewportRef.current.offsetWidth || 1;
      const dt = Math.max(1, d.lastT - d.prevT);
      const vx = (d.lastX - d.prevX) / dt;
      const passed = Math.abs(dx) >= width * BANNER_DRAG_THRESHOLD;
      const flicked = Math.abs(dx) >= 36 && (dx < 0 && vx <= -BANNER_FLICK_VX || dx > 0 && vx >= BANNER_FLICK_VX);
      if (passed || flicked) {
        stepTrack(dx < 0 ? 1 : -1);
      } else {
        setAnimating(true);
        setDragPx(0);
      }
    }, [stepTrack]);
    const onPointerDown = React.useCallback((e) => {
      if (!multi) return;
      if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
      if (e.target.closest && e.target.closest(".fo-home-banner-nav")) return;
      const x = e.clientX;
      const y = e.clientY;
      dragRef.current = {
        active: true,
        pointerId: e.pointerId,
        startX: x,
        startY: y,
        dx: 0,
        axis: null,
        prevX: x,
        prevT: performance.now(),
        lastX: x,
        lastT: performance.now()
      };
      setAnimating(false);
      setDragging(true);
      setDragPx(0);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) {
      }
    }, [multi]);
    const onPointerMove = React.useCallback((e) => {
      const d = dragRef.current;
      if (!d || !d.active || d.pointerId !== e.pointerId) return;
      const x = e.clientX;
      const y = e.clientY;
      const dx = x - d.startX;
      const dy = y - d.startY;
      if (!d.axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (d.axis === "y") return;
      }
      if (d.axis !== "x") return;
      d.prevX = d.lastX;
      d.prevT = d.lastT;
      d.lastX = x;
      d.lastT = performance.now();
      d.dx = dx;
      setDragPx(dx);
    }, []);
    const onPointerUp = React.useCallback((e) => {
      const d = dragRef.current;
      if (!d || d.pointerId !== e.pointerId) return;
      endDrag();
    }, [endDrag]);
    const onPointerCancel = React.useCallback((e) => {
      const d = dragRef.current;
      if (!d || d.pointerId !== e.pointerId) return;
      dragRef.current = null;
      setDragging(false);
      setAnimating(true);
      setDragPx(0);
    }, []);
    const onClickCapture = React.useCallback((e) => {
      if (!suppressClick.current) return;
      e.preventDefault();
      e.stopPropagation();
    }, []);
    if (!n) return null;
    const hold = paused || dragging;
    const transform = multi ? "translate3d(calc(" + -trackIdx * 100 + "% + " + dragPx + "px),0,0)" : "translate3d(0,0,0)";
    return /* @__PURE__ */ React.createElement(
      "section",
      {
        className: "fo-home-banners" + (hold ? " is-paused" : "") + (dragging ? " is-dragging" : ""),
        "aria-label": "\uD648 \uBC30\uB108",
        "aria-roledescription": multi ? "carousel" : void 0,
        onMouseEnter: () => {
          if (multi) setPaused(true);
        },
        onMouseLeave: () => {
          if (multi) setPaused(false);
        },
        onFocusCapture: () => {
          if (multi) setPaused(true);
        },
        onBlurCapture: (e) => {
          if (!multi) return;
          if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
        }
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          ref: viewportRef,
          className: "fo-home-banner",
          onPointerDown: multi ? onPointerDown : void 0,
          onPointerMove: multi ? onPointerMove : void 0,
          onPointerUp: multi ? onPointerUp : void 0,
          onPointerCancel: multi ? onPointerCancel : void 0,
          onClickCapture: multi ? onClickCapture : void 0
        },
        /* @__PURE__ */ React.createElement(
          "div",
          {
            className: "fo-home-banner-track" + (animating && !dragging ? " is-animating" : ""),
            style: { transform },
            onTransitionEnd: multi ? onTrackTransitionEnd : void 0
          },
          slides.map((b, i) => /* @__PURE__ */ React.createElement(BannerSlide, { key: (b.id || b.title || "b") + "-" + i, banner: b, linkable: !dragging }))
        ),
        multi ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: "fo-home-banner-nav fo-home-banner-nav-prev",
            "aria-label": "\uC774\uC804 \uBC30\uB108",
            onClick: goPrev
          },
          /* @__PURE__ */ React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M15 5l-7 7 7 7", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }))
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: "fo-home-banner-nav fo-home-banner-nav-next",
            "aria-label": "\uB2E4\uC74C \uBC30\uB108",
            onClick: goNext
          },
          /* @__PURE__ */ React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M9 5l7 7-7 7", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }))
        ), /* @__PURE__ */ React.createElement("div", { className: "fo-home-banner-progress", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(
          "div",
          {
            key: realIdx + "-" + progressKey,
            className: "fo-home-banner-progress-fill",
            style: { animationDuration: BANNER_AUTO_MS + "ms" },
            onAnimationEnd: onProgressEnd
          }
        ))) : null
      )
    );
  }
  function HomePage() {
    const search = (e) => {
      e.preventDefault();
      const q = new FormData(e.target).get("q");
      location.href = F.PAGES.list + (q ? "?q=" + encodeURIComponent(q) : "");
    };
    const visible = D.visibleSheets ? D.visibleSheets() : D.sheets.filter((s) => !s.status || s.status === "\uD310\uB9E4\uC911");
    const reco = D.recommended.map(D.byId).filter(Boolean).filter((s) => !s.status || s.status === "\uD310\uB9E4\uC911");
    const fresh = visible.filter((s) => s.isNew).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 8);
    const popular = [...visible].filter((s) => s.popular).sort((a, b) => b.sold - a.sold).slice(0, 8);
    const bannerSheet = D.banner && D.banner.sheetId ? D.byId(D.banner.sheetId) : null;
    return /* @__PURE__ */ React.createElement(F.Scaffold, { tab: "home" }, /* @__PURE__ */ React.createElement("section", { "data-screen-label": "FO-01 \uD648", style: { padding: "32px 0 6px", maxWidth: 620, margin: "0 auto", textAlign: "center" } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "clamp(24px, 4.4vw, 34px)", letterSpacing: "-1.4px", lineHeight: 1.2 } }, "\uB4DC\uB7FC \uC545\uBCF4, \uAC80\uC0C9\uD558\uACE0", /* @__PURE__ */ React.createElement("br", { className: "fo-mobile" }), " \uBC14\uB85C \uB2E4\uC6B4\uB85C\uB4DC"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--text-secondary)", marginTop: 10 } }, "\uACB0\uC81C\uC77C\uB85C\uBD80\uD130 7\uC77C\uAC04 PDF\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD560 \uC218 \uC788\uC5B4\uC694."), /* @__PURE__ */ React.createElement("form", { onSubmit: search, style: { marginTop: 18, maxWidth: 480, marginLeft: "auto", marginRight: "auto" } }, /* @__PURE__ */ React.createElement(Input, { name: "q", iconLeft: "search", placeholder: "\uACE1\uBA85, \uC544\uD2F0\uC2A4\uD2B8 \uAC80\uC0C9" }))), /* @__PURE__ */ React.createElement("div", { className: "fo-chips", style: { padding: "16px 0 6px", justifyContent: "safe center" } }, /* @__PURE__ */ React.createElement(Chip, { onClick: () => location.href = F.PAGES.list }, "\uC804\uCCB4"), D.genres.map((c) => /* @__PURE__ */ React.createElement(Chip, { key: c, onClick: () => location.href = F.PAGES.list + "?cat=" + encodeURIComponent(c) }, c))), /* @__PURE__ */ React.createElement(HomeBanners, null), bannerSheet ? /* @__PURE__ */ React.createElement("section", { style: { marginTop: 24 } }, /* @__PURE__ */ React.createElement(Card, { interactive: true, padding: 0, onClick: () => location.href = F.PAGES.detail + "?id=" + bannerSheet.id, style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "stretch" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" } }, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--text-tertiary)" } }, D.banner.label), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "clamp(19px, 2.6vw, 24px)", letterSpacing: "-0.7px" } }, D.banner.title), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: 420 } }, D.banner.copy), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginTop: 6 } }, /* @__PURE__ */ React.createElement(F.Money, { value: bannerSheet.price, size: 18 }), bannerSheet.orig ? /* @__PURE__ */ React.createElement(F.Money, { value: bannerSheet.orig, size: 13, strike: true }) : null, /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto" } })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4 } }, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", iconRight: "chevron-right" }, "\uC545\uBCF4 \uBCF4\uB7EC\uAC00\uAE30"))), /* @__PURE__ */ React.createElement("div", { style: { width: 150, flex: "none", borderLeft: "1px solid var(--border-default)", alignSelf: "stretch" }, className: "fo-desktop" }, /* @__PURE__ */ React.createElement(F.StaffThumb, { fill: true, icon: "music", size: 34, src: F.sheetCoverUrl(bannerSheet) || void 0, alt: bannerSheet.title, watermark: F.sheetCoverUrl(bannerSheet) ? "light" : false }))))) : null, /* @__PURE__ */ React.createElement("section", { style: { marginTop: 36 } }, /* @__PURE__ */ React.createElement(F.SectionHeader, { title: "\uCD94\uCC9C \uC545\uBCF4", action: "\uC804\uCCB4\uBCF4\uAE30", href: F.PAGES.list }), /* @__PURE__ */ React.createElement("div", { className: "fo-grid" }, reco.map((s) => /* @__PURE__ */ React.createElement(F.SheetCard, { key: s.id, s })))), /* @__PURE__ */ React.createElement("section", { style: { marginTop: 36 } }, /* @__PURE__ */ React.createElement(F.SectionHeader, { title: "\uC2E0\uADDC \uC545\uBCF4", action: "\uC804\uCCB4\uBCF4\uAE30", href: F.PAGES.list + "?sort=" + encodeURIComponent("\uCD5C\uC2E0\uC21C") }), /* @__PURE__ */ React.createElement("div", { className: "fo-grid" }, fresh.map((s) => /* @__PURE__ */ React.createElement(F.SheetCard, { key: s.id, s })))), /* @__PURE__ */ React.createElement("section", { style: { marginTop: 36 } }, /* @__PURE__ */ React.createElement(F.SectionHeader, { title: "\uC778\uAE30 \uC545\uBCF4", action: "\uC804\uCCB4\uBCF4\uAE30", href: F.PAGES.list + "?sort=" + encodeURIComponent("\uC778\uAE30\uC21C") }), /* @__PURE__ */ React.createElement("div", { className: "fo-grid" }, popular.map((s) => /* @__PURE__ */ React.createElement(F.SheetCard, { key: s.id, s })))), /* @__PURE__ */ React.createElement("section", { style: { marginTop: 40 } }, /* @__PURE__ */ React.createElement(F.SectionHeader, { title: "\uCE74\uD14C\uACE0\uB9AC \uBC14\uB85C\uAC00\uAE30" }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 } }, D.genres.map((g) => {
      const n = visible.filter((s) => s.genre === g).length;
      return /* @__PURE__ */ React.createElement(Card, { key: g, interactive: true, padding: 14, onClick: () => location.href = F.PAGES.list + "?cat=" + encodeURIComponent(g) }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 3 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600, letterSpacing: "-0.3px" } }, g), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11, color: "var(--text-tertiary)" } }, n, "\uACE1")), /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 16, style: { color: "var(--color-icon)" } })));
    }), /* @__PURE__ */ React.createElement(Card, { interactive: true, padding: 14, onClick: () => location.href = F.PAGES.list }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 3 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600, letterSpacing: "-0.3px" } }, "\uB09C\uC774\uB3C4\uBCC4 \uCC3E\uAE30"), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11, color: "var(--text-tertiary)" } }, "\uC785\uBB38 \u2013 \uACE0\uAE09")), /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 16, style: { color: "var(--color-icon)" } }))))));
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(HomePage, null));
  });
})();
