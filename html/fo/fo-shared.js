(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, IconButton, Card, Badge, Icon, Input, Checkbox } = DS;
  const DATA = window.DrumData;
  const PAGES = {
    home: "/home",
    list: "/sheets",
    detail: "/sheet",
    wish: "/wishlist",
    cart: "/cart",
    checkout: "/checkout",
    complete: "/order-complete",
    paymentSuccess: "/payment/success",
    paymentFail: "/payment/fail",
    login: "/login",
    signup: "/signup",
    authCallback: "/fo/FO-08-auth-callback.html",
    oauthTerms: "/oauth-terms",
    reset: "/password-reset",
    my: "/mypage",
    downloads: "/mypage/downloads",
    edit: "/mypage/edit",
    withdraw: "/mypage/withdraw",
    guest: "/guest-lookup",
    terms: "/terms",
    privacy: "/privacy",
    marketing: "/marketing",
    guide: "/guide",
    findId: "/find-id"
  };
  const won = (v) => "\u20A9" + Number(v).toLocaleString("ko-KR");
  const qp = (name) => new URLSearchParams(location.search).get(name);
  const goBack = (fallback) => {
    if (history.length > 1 && document.referrer) history.back();
    else location.href = fallback || PAGES.home;
  };
  function toast(msg, ms) {
    let el = document.getElementById("fo-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "fo-toast";
      el.className = "fo-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), ms || 2e3);
  }
  function useStoreTick() {
    const [, force] = React.useState(0);
    React.useEffect(() => {
      const f = () => force((n) => n + 1);
      window.addEventListener("store:change", f);
      return () => window.removeEventListener("store:change", f);
    }, []);
  }
  async function loadPurchases(emailOrUser, opts) {
    const empty = [];
    let email = "";
    let authUserId = null;
    let provider = null;
    let fromOAuth = false;
    let type = null;
    if (emailOrUser && typeof emailOrUser === "object") {
      email = emailOrUser.email || "";
      authUserId = emailOrUser.authId || emailOrUser.auth_user_id || null;
      provider = emailOrUser.provider || emailOrUser.auth_provider || null;
      fromOAuth = emailOrUser.fromOAuth === true;
      type = emailOrUser.type || null;
    } else {
      email = emailOrUser || "";
      opts = opts || {};
      authUserId = opts.authUserId || opts.auth_user_id || null;
      provider = opts.provider || opts.auth_provider || null;
      fromOAuth = opts.fromOAuth === true;
      type = opts.type || null;
    }
    const isSocial = fromOAuth || type === "social" || !!provider && provider !== "email" && provider !== "email_password";
    if (isSocial && (!provider || provider === "email")) {
      console.warn("[CHODRUM] loadPurchases: social user missing provider");
      if (Store.purchases && typeof Store.purchases.replace === "function") Store.purchases.replace([]);
      return empty;
    }
    if (!email && !authUserId) return empty;
    try {
      if (window.ChodrumAPI && ChodrumAPI.ready) await ChodrumAPI.ready;
    } catch (e) {
    }
    if (window.ChodrumAPI && ChodrumAPI.orders && typeof ChodrumAPI.orders.purchasesForEmail === "function") {
      try {
        const list = await ChodrumAPI.orders.purchasesForEmail(email, {
          authUserId,
          provider: isSocial ? provider : provider || "email",
          fromOAuth,
          type: type || (isSocial ? "social" : "email")
        });
        if (Array.isArray(list) && Store.purchases && typeof Store.purchases.replace === "function") {
          Store.purchases.replace(list.map((p) => ({
            id: p.id || p.sheetId,
            sheetId: p.sheetId || p.id,
            title: p.title || "",
            orderNo: p.orderNo,
            paidAt: p.paidAt || Date.now(),
            authUserId: authUserId || null,
            provider: isSocial ? provider : provider || "email"
          })));
        }
        return Array.isArray(list) ? list : empty;
      } catch (e) {
        console.warn("[CHODRUM] loadPurchases", e);
        if (isSocial) {
          if (Store.purchases && typeof Store.purchases.replace === "function") Store.purchases.replace([]);
          return empty;
        }
      }
    }
    const raw = Store.purchases.list();
    if (!Array.isArray(raw)) return empty;
    const day = 864e5;
    return raw.filter((p) => {
      if (!p || typeof p !== "object") return false;
      const pUid = p.authUserId || p.auth_user_id || null;
      const pProv = p.provider || p.auth_provider || null;
      if (isSocial) {
        if (authUserId && pUid && pUid !== authUserId) return false;
        if (!pProv || pProv !== provider) return false;
        return true;
      }
      if (pUid && authUserId && pUid !== authUserId) return false;
      if (pProv && pProv !== "email") return false;
      return true;
    }).map((p) => {
      const id = p.sheetId != null && p.sheetId !== "" ? p.sheetId : p.id;
      const paidAt = Number(p.paidAt) || Date.now();
      return {
        id,
        sheetId: id,
        title: p.title || "",
        orderNo: p.orderNo,
        paidAt,
        date: new Date(paidAt).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, ""),
        dday: 7 - Math.floor((Date.now() - paidAt) / day)
      };
    }).filter((p) => p.id != null && p.id !== "");
  }
  function Money({ value, size = 16, weight = 600, color = "var(--text-primary)", strike = false }) {
    return /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: size, fontWeight: strike ? 400 : weight, color: strike ? "var(--text-tertiary)" : color, textDecoration: strike ? "line-through" : "none" } }, won(value));
  }
  function Stars({ value, size = 12 }) {
    return /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, color: "var(--color-ink)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "star", size }), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)" } }, value.toFixed(1)));
  }
  function sheetCoverUrl(s) {
    if (!s) return "";
    if (s.previewUrls && s.previewUrls.length && s.previewUrls[0]) return s.previewUrls[0];
    return s.previewUrl || "";
  }
  function StaffThumb({ ratio = "1 / 1", icon = "music", size = 30, watermark = false, fill = false, src, alt = "", fit = "cover", position = "top center" }) {
    const wmStrong = watermark === "strong" || watermark === true;
    const wmLight = watermark === "light";
    const showWm = wmStrong || wmLight;
    const fullOpacity = wmLight ? 0.035 : 0.05;
    const fullSize = wmLight ? 9 : 12;
    const veilOpacity = wmLight ? 0.065 : 0.09;
    const veilSize = wmLight ? 14 : 18;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "100%", height: fill ? "100%" : "auto", aspectRatio: fill ? "auto" : ratio, background: "#f6f6f6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" } }, src ? /* @__PURE__ */ React.createElement("img", { src, alt, style: { position: "relative", zIndex: 1, width: "100%", height: "100%", objectFit: fit, objectPosition: position, background: "#fff" } }) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(180deg, transparent 0 15px, #e7e7e7 15px 16px)", backgroundPosition: "0 14px" } }), /* @__PURE__ */ React.createElement(Icon, { name: icon, size, style: { color: "#cccccc", position: "relative" } })), showWm ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: {
      position: "absolute",
      inset: 0,
      zIndex: 3,
      pointerEvents: "none",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-mono)",
      fontSize: fullSize,
      fontWeight: 500,
      letterSpacing: 1.5,
      color: "rgba(0,0,0," + fullOpacity + ")",
      whiteSpace: "nowrap",
      userSelect: "none"
    } }, /* @__PURE__ */ React.createElement("span", { style: { transform: "rotate(-18deg)" } }, "CHODRUM PREVIEW")), wmStrong ? /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "78%",
      zIndex: 4,
      pointerEvents: "none",
      background: "linear-gradient(180deg, rgba(252,252,252,0) 0%, rgba(250,250,250,0.75) 14%, rgba(248,248,248,0.95) 40%, rgba(246,246,246,0.985) 100%)"
    } }) : null, /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "78%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      fontFamily: "var(--font-mono)",
      fontSize: veilSize,
      fontWeight: 600,
      letterSpacing: 2,
      color: "rgba(0,0,0," + veilOpacity + ")",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      zIndex: 5,
      userSelect: "none"
    } }, /* @__PURE__ */ React.createElement("span", { style: { transform: "rotate(-18deg)" } }, "CHODRUM PREVIEW"))) : null);
  }
  function DdayBadge({ dday }) {
    if (dday === null || dday === void 0) return /* @__PURE__ */ React.createElement(Badge, { variant: "neutral", size: "sm" }, "\uD68C\uC218\uB428");
    if (dday < 0) return /* @__PURE__ */ React.createElement(Badge, { variant: "neutral", size: "sm" }, "\uAE30\uAC04 \uB9CC\uB8CC");
    const v = dday >= 4 ? "success" : dday >= 2 ? "warning" : "danger";
    return /* @__PURE__ */ React.createElement(Badge, { variant: v, size: "sm" }, "D-", dday);
  }
  function CartIcon() {
    useStoreTick();
    const n = Store.cart.count();
    return /* @__PURE__ */ React.createElement("a", { href: PAGES.cart, style: { position: "relative", display: "inline-flex" }, "aria-label": "\uC7A5\uBC14\uAD6C\uB2C8" }, /* @__PURE__ */ React.createElement(IconButton, { name: "shopping-cart", variant: "ghost", label: "\uC7A5\uBC14\uAD6C\uB2C8" }), n ? /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 9999, background: "var(--color-ink)", color: "#fff", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" } }, n) : null);
  }
  async function foSignOut() {
    if (window.ChodrumAuth && typeof window.ChodrumAuth.signOut === "function") {
      await window.ChodrumAuth.signOut();
      return;
    }
    if (window.ChodrumSB && window.ChodrumSB.client) {
      try {
        await window.ChodrumSB.client.auth.signOut();
      } catch (e) {
        console.warn("[CHODRUM] signOut", e);
      }
    }
    if (window.Store && Store.user) Store.user.clear();
  }
  function UserMenu({ user }) {
    const [open, setOpen] = React.useState(false);
    const items = [
      ["\uAD6C\uB9E4\uB0B4\uC5ED / \uB2E4\uC6B4\uB85C\uB4DC", "download", PAGES.downloads],
      ["\uCC1C \uBAA9\uB85D", "heart", PAGES.wish],
      ["\uB0B4 \uC815\uBCF4 \uC218\uC815", "user", PAGES.edit]
    ];
    const itemStyle = {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 10px",
      borderRadius: 8,
      fontSize: 13.5,
      fontWeight: 500,
      color: "var(--text-primary)",
      textDecoration: "none",
      background: "transparent",
      border: "none",
      width: "100%",
      cursor: "pointer",
      textAlign: "left",
      fontFamily: "inherit",
      transition: "background 100ms ease"
    };
    const hoverOn = (e) => {
      e.currentTarget.style.background = "rgba(0,0,0,0.04)";
    };
    const hoverOff = (e) => {
      e.currentTarget.style.background = "transparent";
    };
    const logout = async (e) => {
      e.preventDefault();
      await foSignOut();
      toast("\uB85C\uADF8\uC544\uC6C3\uB418\uC5C8\uC5B4\uC694");
      location.href = PAGES.home;
    };
    return /* @__PURE__ */ React.createElement("span", { style: { position: "relative", display: "inline-flex" }, onMouseEnter: () => setOpen(true), onMouseLeave: () => setOpen(false) }, /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", iconLeft: "user", iconRight: "chevron-down", onClick: () => location.href = PAGES.my }, user.name), open ? /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "100%", right: 0, paddingTop: 6, zIndex: 60 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 208, background: "var(--surface-card)", border: "1px solid var(--border-default)", borderRadius: 12, boxShadow: "var(--shadow-xl)", padding: 6, display: "flex", flexDirection: "column" } }, items.map(([l, ic, href]) => /* @__PURE__ */ React.createElement("a", { key: l, href, style: itemStyle, onMouseEnter: hoverOn, onMouseLeave: hoverOff }, /* @__PURE__ */ React.createElement(Icon, { name: ic, size: 16, style: { color: "var(--color-icon)" } }), l)), /* @__PURE__ */ React.createElement("div", { style: { height: 1, background: "var(--border-default)", margin: "4px 6px" } }), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: logout, style: { ...itemStyle, color: "var(--text-secondary)" }, onMouseEnter: hoverOn, onMouseLeave: hoverOff }, /* @__PURE__ */ React.createElement(Icon, { name: "log-out", size: 16, style: { color: "var(--color-icon)" } }), "\uB85C\uADF8\uC544\uC6C3"))) : null);
  }
  function MobileNav({ open, onClose, tab, user }) {
    React.useEffect(() => {
      if (!open) return void 0;
      const onKey = (e) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }, [open, onClose]);
    React.useEffect(() => {
      const mq = window.matchMedia("(min-width: 768px)");
      const onChange = () => {
        if (mq.matches) onClose();
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else mq.addListener(onChange);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", onChange);
        else mq.removeListener(onChange);
      };
    }, [onClose]);
    const logout = async () => {
      onClose();
      await foSignOut();
      toast("\uB85C\uADF8\uC544\uC6C3\uB418\uC5C8\uC5B4\uC694");
      location.href = PAGES.home;
    };
    const links = [
      { href: PAGES.home, label: "\uD648", k: "home" },
      { href: PAGES.list, label: "\uC545\uBCF4", k: "list" },
      user ? { href: PAGES.my, label: "\uB9C8\uC774\uD398\uC774\uC9C0", k: "my" } : { href: PAGES.guest, label: "\uBE44\uD68C\uC6D0 \uC8FC\uBB38 \uC870\uD68C" }
    ];
    const node = /* @__PURE__ */ React.createElement("div", { className: "fo-mnav-root" + (open ? " open" : ""), "aria-hidden": !open }, /* @__PURE__ */ React.createElement("div", { className: "fo-mnav-scrim", onClick: onClose }), /* @__PURE__ */ React.createElement("aside", { className: "fo-mnav", role: "dialog", "aria-modal": "true", "aria-label": "\uBA54\uB274" }, /* @__PURE__ */ React.createElement("nav", { className: "fo-mnav-links" }, links.map((l) => /* @__PURE__ */ React.createElement(
      "a",
      {
        key: l.href + l.label,
        href: l.href,
        className: l.k && tab === l.k ? "on" : "",
        onClick: onClose
      },
      l.label
    ))), /* @__PURE__ */ React.createElement("div", { className: "fo-mnav-auth" }, user ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "fo-mnav-user" }, user.name, "\uB2D8"), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "lg", fullWidth: true, onClick: logout }, "\uB85C\uADF8\uC544\uC6C3")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, onClick: () => {
      onClose();
      location.href = PAGES.login;
    } }, "\uB85C\uADF8\uC778"), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "lg", fullWidth: true, onClick: () => {
      onClose();
      location.href = PAGES.signup;
    } }, "\uD68C\uC6D0\uAC00\uC785")))));
    return ReactDOM.createPortal(node, document.body);
  }
  function Header({ tab, title, back }) {
    useStoreTick();
    const [menuOpen, setMenuOpen] = React.useState(false);
    const closeMenu = React.useCallback(() => setMenuOpen(false), []);
    const user = Store.user.get();
    const isHome = tab === "home";
    const pageTitle = title || ({ list: "\uC545\uBCF4", cart: "\uC7A5\uBC14\uAD6C\uB2C8", my: "\uB9C8\uC774\uD398\uC774\uC9C0" }[tab] || "");
    const search = (e) => {
      e.preventDefault();
      const q = new FormData(e.target).get("q");
      location.href = PAGES.list + (q ? "?q=" + encodeURIComponent(q) : "");
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("header", { className: "fo-header" + (menuOpen ? " fo-header-menu-open" : "") }, /* @__PURE__ */ React.createElement("div", { className: "fo-header-in" }, !isHome ? /* @__PURE__ */ React.createElement("span", { className: "fo-mobile fo-header-back", style: { display: "inline-flex", alignItems: "center", gap: 0, flex: "none", zIndex: 1 } }, /* @__PURE__ */ React.createElement(IconButton, { name: "chevron-left", variant: "ghost", label: "\uB4A4\uB85C", onClick: () => goBack(back) }), /* @__PURE__ */ React.createElement("a", { href: PAGES.home, "aria-label": "\uD648" }, /* @__PURE__ */ React.createElement(IconButton, { name: "house", variant: "ghost", label: "\uD648" }))) : null, /* @__PURE__ */ React.createElement("a", { href: PAGES.home, className: "fo-wordmark" + (isHome ? "" : " fo-desktop") }, /* @__PURE__ */ React.createElement("img", { src: "../shared/logo.png", alt: "CHODRUM \uB85C\uACE0", style: { width: 32, height: 32, objectFit: "contain", display: "block", flex: "none" } }), "CHODRUM"), !isHome && pageTitle ? /* @__PURE__ */ React.createElement("span", { className: "fo-header-title" }, pageTitle) : null, /* @__PURE__ */ React.createElement("nav", { className: "fo-nav" }, /* @__PURE__ */ React.createElement("a", { href: PAGES.home, className: tab === "home" ? "on" : "" }, "\uD648"), /* @__PURE__ */ React.createElement("a", { href: PAGES.list, className: tab === "list" ? "on" : "" }, "\uC545\uBCF4"), user ? /* @__PURE__ */ React.createElement("a", { href: PAGES.my, className: tab === "my" ? "on" : "" }, "\uB9C8\uC774\uD398\uC774\uC9C0") : /* @__PURE__ */ React.createElement("a", { href: PAGES.guest }, "\uBE44\uD68C\uC6D0 \uC8FC\uBB38 \uC870\uD68C")), /* @__PURE__ */ React.createElement("form", { className: "fo-header-search", onSubmit: search }, /* @__PURE__ */ React.createElement(Input, { size: "sm", name: "q", iconLeft: "search", placeholder: "\uACE1\uBA85, \uC544\uD2F0\uC2A4\uD2B8 \uAC80\uC0C9" })), /* @__PURE__ */ React.createElement("div", { className: "fo-header-icons" }, /* @__PURE__ */ React.createElement("span", { className: "fo-mobile", style: { display: "inline-flex" } }, /* @__PURE__ */ React.createElement("a", { href: PAGES.list, "aria-label": "\uAC80\uC0C9" }, /* @__PURE__ */ React.createElement(IconButton, { name: "search", variant: "ghost", label: "\uAC80\uC0C9" }))), /* @__PURE__ */ React.createElement("span", { className: "fo-desktop", style: { display: "inline-flex" } }, /* @__PURE__ */ React.createElement("a", { href: PAGES.wish, "aria-label": "\uCC1C \uBAA9\uB85D" }, /* @__PURE__ */ React.createElement(IconButton, { name: "heart", variant: "ghost", label: "\uCC1C \uBAA9\uB85D" }))), /* @__PURE__ */ React.createElement("span", { className: "fo-desktop", style: { display: "inline-flex" } }, /* @__PURE__ */ React.createElement(CartIcon, null)), /* @__PURE__ */ React.createElement("span", { className: "fo-desktop", style: { display: "inline-flex", marginLeft: 6 } }, user ? /* @__PURE__ */ React.createElement(UserMenu, { user }) : /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => location.href = PAGES.login }, "\uB85C\uADF8\uC778")), /* @__PURE__ */ React.createElement("span", { className: "fo-mobile fo-mnav-toggle", style: { display: "inline-flex" } }, /* @__PURE__ */ React.createElement(
      IconButton,
      {
        name: menuOpen ? "x" : "menu",
        variant: "ghost",
        label: menuOpen ? "\uBA54\uB274 \uB2EB\uAE30" : "\uBA54\uB274",
        onClick: () => setMenuOpen((o) => !o)
      }
    ))))), /* @__PURE__ */ React.createElement(MobileNav, { open: menuOpen, onClose: closeMenu, tab, user }));
  }
  function TabBar({ active }) {
    useStoreTick();
    const n = Store.cart.count();
    const [hidden, setHidden] = React.useState(false);
    const tabs = [
      { k: "home", ic: "house", l: "\uD648", href: PAGES.home },
      { k: "list", ic: "search", l: "\uC545\uBCF4", href: PAGES.list },
      { k: "cart", ic: "shopping-cart", l: "\uC7A5\uBC14\uAD6C\uB2C8", href: PAGES.cart },
      { k: "my", ic: "user", l: "\uB9C8\uC774", href: PAGES.my }
    ];
    React.useEffect(() => {
      const mq = window.matchMedia("(max-width: 767px)");
      let lastY = window.scrollY || 0;
      let isHidden = false;
      const THRESHOLD = 8;
      const apply = (next) => {
        if (isHidden === next) return;
        isHidden = next;
        setHidden(next);
        document.body.classList.toggle("tabbar-scrolled-away", next);
      };
      const onScroll = () => {
        if (!mq.matches) {
          apply(false);
          lastY = window.scrollY || 0;
          return;
        }
        const y = window.scrollY || 0;
        const delta = y - lastY;
        if (y <= 8) {
          apply(false);
        } else if (delta > THRESHOLD) {
          apply(true);
        } else if (delta < -THRESHOLD) {
          apply(false);
        }
        lastY = y;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      const onMq = () => onScroll();
      if (mq.addEventListener) mq.addEventListener("change", onMq);
      else mq.addListener(onMq);
      return () => {
        window.removeEventListener("scroll", onScroll);
        if (mq.removeEventListener) mq.removeEventListener("change", onMq);
        else mq.removeListener(onMq);
        document.body.classList.remove("tabbar-scrolled-away");
      };
    }, []);
    return /* @__PURE__ */ React.createElement("nav", { className: "fo-tabbar" + (hidden ? " is-hidden" : ""), "aria-hidden": hidden || void 0 }, tabs.map((t) => /* @__PURE__ */ React.createElement("a", { key: t.k, href: t.href, className: "fo-tab" + (active === t.k ? " on" : ""), tabIndex: hidden ? -1 : void 0 }, /* @__PURE__ */ React.createElement("span", { style: { position: "relative", display: "inline-flex" } }, /* @__PURE__ */ React.createElement(Icon, { name: t.ic, size: 22 }), t.k === "cart" && n ? /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { position: "absolute", top: -4, right: -8, minWidth: 15, height: 15, padding: "0 3px", borderRadius: 9999, background: "var(--color-ink)", color: "#fff", fontSize: 9, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" } }, n) : null), /* @__PURE__ */ React.createElement("span", null, t.l))));
  }
  function Footer() {
    const FRow = ({ k, v, mono }) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, fontSize: 12.5, lineHeight: 1.6 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 116, flex: "none", color: "var(--text-tertiary)" } }, k), /* @__PURE__ */ React.createElement("span", { className: mono ? "ds-mono" : "", style: { color: "var(--text-secondary)" } }, v));
    const FTitle = ({ children }) => /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" } }, children);
    return /* @__PURE__ */ React.createElement("footer", { className: "fo-footer" }, /* @__PURE__ */ React.createElement("div", { className: "fo-footer-in" }, /* @__PURE__ */ React.createElement("div", { className: "fo-footer-top" }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("img", { src: "../shared/logo.png", alt: "CHODRUM \uB85C\uACE0", style: { width: 24, height: 24, objectFit: "contain", display: "block" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px" } }, "CHODRUM")), /* @__PURE__ */ React.createElement("div", { className: "fo-footer-links" }, /* @__PURE__ */ React.createElement("a", { href: PAGES.terms }, "\uC774\uC6A9\uC57D\uAD00"), /* @__PURE__ */ React.createElement("a", { href: PAGES.privacy, style: { fontWeight: 600, color: "var(--text-primary)" } }, "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68"), /* @__PURE__ */ React.createElement("a", { href: PAGES.marketing }, "\uB9C8\uCF00\uD305 \uC218\uC2E0 \uB3D9\uC758"), /* @__PURE__ */ React.createElement("a", { href: PAGES.guide }, "\uC774\uC6A9\uC548\uB0B4"))), /* @__PURE__ */ React.createElement("div", { className: "fo-footer-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(FTitle, null, "\uC1FC\uD551\uBAB0 \uAE30\uBCF8\uC815\uBCF4"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5 } }, /* @__PURE__ */ React.createElement(FRow, { k: "\uC0C1\uD638\uBA85", v: "\uC870\uB4DC\uB7FC\uB2F7\uCEF4" }), /* @__PURE__ */ React.createElement(FRow, { k: "\uB300\uD45C\uC790\uBA85", v: "\uC870\uC900\uD615" }), /* @__PURE__ */ React.createElement(FRow, { k: "\uC0AC\uC5C5\uC7A5 \uC8FC\uC18C", v: "14238 \uACBD\uAE30\uB3C4 \uAD11\uBA85\uC2DC \uB514\uC9C0\uD138\uB85C 63" }), /* @__PURE__ */ React.createElement(FRow, { k: "\uB300\uD45C \uC804\uD654", v: "010-9872-5784", mono: true }), /* @__PURE__ */ React.createElement(FRow, { k: "\uC0AC\uC5C5\uC790 \uB4F1\uB85D\uBC88\uD638", v: /* @__PURE__ */ React.createElement("span", { className: "ds-mono" }, "3663101280 ", /* @__PURE__ */ React.createElement("a", { href: "https://www.ftc.go.kr/bizCommPop.do?wrkr_no=3663101280", target: "_blank", rel: "noopener noreferrer", style: { fontSize: 12, whiteSpace: "nowrap" } }, "[\uC0AC\uC5C5\uC790\uC815\uBCF4\uD655\uC778]")) }), /* @__PURE__ */ React.createElement(FRow, { k: "\uD1B5\uC2E0\uD310\uB9E4\uC5C5 \uC2E0\uACE0\uBC88\uD638", v: "2023-\uACBD\uAE30\uAD11\uBA85-0200", mono: true }), /* @__PURE__ */ React.createElement(FRow, { k: "\uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uCC45\uC784\uC790", v: "\uC870\uC900\uD615" }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(FTitle, null, "\uACE0\uAC1D\uC13C\uD130 \uC815\uBCF4"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5 } }, /* @__PURE__ */ React.createElement(FRow, { k: "\uC0C1\uB2F4/\uC8FC\uBB38 \uC804\uD654", v: "010-9872-5784", mono: true }), /* @__PURE__ */ React.createElement(FRow, { k: "\uC0C1\uB2F4/\uC8FC\uBB38 \uC774\uBA54\uC77C", v: "chodrumstudio@gmail.com", mono: true }), /* @__PURE__ */ React.createElement(FRow, { k: "CS\uC6B4\uC601\uC2DC\uAC04", v: /* @__PURE__ */ React.createElement("span", null, "\uD3C9\uC77C 09:00 ~ 18:00", /* @__PURE__ */ React.createElement("br", null), "(\uC8FC\uB9D0, \uACF5\uD734\uC77C \uC81C\uC678)") }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(FTitle, null, "\uACB0\uC81C\uC815\uBCF4"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5 } }, /* @__PURE__ */ React.createElement(FRow, { k: "\uBB34\uD1B5\uC7A5 \uACC4\uC88C\uC815\uBCF4", v: /* @__PURE__ */ React.createElement("span", null, "\uAD6D\uBBFC\uC740\uD589 ", /* @__PURE__ */ React.createElement("span", { className: "ds-mono" }, "82133700013678"), /* @__PURE__ */ React.createElement("br", null), "\uC870\uC900\uD615(\uC870\uB4DC\uB7FC\uB2F7\uCEF4)") })))), /* @__PURE__ */ React.createElement("div", { className: "fo-footer-bottom" }, /* @__PURE__ */ React.createElement("span", { className: "fo-caption" }, "Copyright \xA9 \uC870\uB4DC\uB7FC\uB2F7\uCEF4. All Rights Reserved."), /* @__PURE__ */ React.createElement("nav", { className: "fo-footer-sns", "aria-label": "SNS" }, /* @__PURE__ */ React.createElement("a", { href: "https://instagram.com/cho.drum", target: "_blank", rel: "noreferrer", "aria-label": "Instagram", title: "Instagram" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" }))), /* @__PURE__ */ React.createElement("a", { href: "https://youtube.com/@chodrum", target: "_blank", rel: "noreferrer", "aria-label": "YouTube", title: "YouTube" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }))), /* @__PURE__ */ React.createElement("a", { href: "https://pf.kakao.com/_hxdVWxj", target: "_blank", rel: "noreferrer", "aria-label": "\uCE74\uCE74\uC624\uD1A1 \uCC44\uB110", title: "\uCE74\uCE74\uC624\uD1A1 \uCC44\uB110" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M12 3c-5.522 0-10 3.537-10 7.9 0 2.812 1.87 5.29 4.686 6.695-.194.726-.667 2.632-.765 3.045-.12.51.187.489.394.356.163-.104 2.597-1.766 3.62-2.464.67.094 1.36.143 2.065.143 5.522 0 10-3.537 10-7.9S17.522 3 12 3zm-4.218 9.427c-.496 0-.898-.402-.898-.897s.402-.898.898-.898.898.402.898.898-.402.897-.898.897zm4.218 0c-.496 0-.898-.402-.898-.897s.402-.898.898-.898.898.402.898.898-.402.897-.898.897zm4.218 0c-.496 0-.898-.402-.898-.897s.402-.898.898-.898.898.402.898.898-.402.897-.898.897z" })))))));
  }
  function Scaffold({ tab, title, back, width, cta, children, footer = true }) {
    React.useEffect(() => {
      document.body.classList.toggle("has-tabbar", !!tab);
      document.body.classList.toggle("has-cta", !!cta);
    }, [tab, !!cta]);
    return /* @__PURE__ */ React.createElement("div", { className: "fo-page" }, /* @__PURE__ */ React.createElement(Header, { tab, title, back }), /* @__PURE__ */ React.createElement("main", { className: "fo-main" }, /* @__PURE__ */ React.createElement("div", { className: "fo-container" + (width ? " " + width : "") }, children)), footer ? /* @__PURE__ */ React.createElement(Footer, null) : null, tab ? /* @__PURE__ */ React.createElement(TabBar, { active: tab }) : null, cta ? /* @__PURE__ */ React.createElement("div", { className: "fo-ctabar" + (tab ? " above-tabbar" : "") }, cta) : null);
  }
  function isSocialUser(user) {
    if (!user) return false;
    return user.type === "social" || user.fromOAuth === true || user.provider && user.provider !== "email";
  }
  const MYPAGE_NAV_ITEMS = [
    { k: "downloads", label: "\uAD6C\uB9E4\uB0B4\uC5ED / \uB2E4\uC6B4\uB85C\uB4DC", icon: "download", href: PAGES.downloads },
    { k: "wish", label: "\uCC1C \uBAA9\uB85D", icon: "heart", href: PAGES.wish },
    { k: "edit", label: "\uB0B4 \uC815\uBCF4 \uC218\uC815", icon: "user", href: PAGES.edit }
  ];
  function MyPageNav({ active }) {
    return /* @__PURE__ */ React.createElement("nav", { className: "fo-mypage-nav", "aria-label": "\uB9C8\uC774\uD398\uC774\uC9C0 \uBA54\uB274" }, MYPAGE_NAV_ITEMS.map((item) => /* @__PURE__ */ React.createElement(
      "a",
      {
        key: item.k,
        href: item.href,
        className: "fo-mypage-nav-item" + (active === item.k ? " on" : ""),
        "aria-current": active === item.k ? "page" : void 0
      },
      /* @__PURE__ */ React.createElement(Icon, { name: item.icon, size: 16, style: { color: "var(--color-icon)", flex: "none" } }),
      item.label
    )));
  }
  function MyPageLayout({ active, children, label }) {
    return /* @__PURE__ */ React.createElement("div", { "data-screen-label": label, className: "fo-mypage-layout" }, /* @__PURE__ */ React.createElement(MyPageNav, { active }), /* @__PURE__ */ React.createElement("div", { className: "fo-mypage-content" }, children));
  }
  function FavButton({ id, size = "sm" }) {
    useStoreTick();
    const on = Store.fav.has(id);
    return /* @__PURE__ */ React.createElement(
      IconButton,
      {
        name: "heart",
        round: true,
        size,
        variant: "secondary",
        label: "\uCC1C\uD558\uAE30",
        style: on ? { color: "var(--status-danger)" } : void 0,
        onClick: (e) => {
          e.stopPropagation();
          const added = Store.fav.toggle(id);
          toast(added ? "\uCC1C \uBAA9\uB85D\uC5D0 \uB2F4\uC558\uC5B4\uC694" : "\uCC1C\uC744 \uD574\uC81C\uD588\uC5B4\uC694");
        }
      }
    );
  }
  function SheetCard({ s }) {
    const cover = sheetCoverUrl(s);
    return /* @__PURE__ */ React.createElement(Card, { interactive: true, padding: 0, onClick: () => location.href = PAGES.detail + "?id=" + s.id, style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(StaffThumb, { src: cover || void 0, alt: s.title, watermark: cover ? "light" : false }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 8, left: 8, display: "flex", gap: 4, zIndex: 4 } }, s.popular ? /* @__PURE__ */ React.createElement(Badge, { variant: "solid", size: "sm" }, "\uC778\uAE30") : null, s.isNew ? /* @__PURE__ */ React.createElement(Badge, { variant: "solid", size: "sm" }, "NEW") : null), /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", top: 6, right: 6, zIndex: 4 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(FavButton, { id: s.id }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 5 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 600, letterSpacing: "-0.3px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, s.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-secondary)" } }, s.artist), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, marginTop: 1 } }, /* @__PURE__ */ React.createElement(Badge, { variant: "outline", size: "sm" }, s.level), /* @__PURE__ */ React.createElement(Badge, { variant: "neutral", size: "sm" }, s.genre)), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 3, display: "flex", alignItems: "baseline", gap: 6 } }, /* @__PURE__ */ React.createElement(Money, { value: s.price, size: 16 }), s.orig ? /* @__PURE__ */ React.createElement(Money, { value: s.orig, size: 12, strike: true }) : null)));
  }
  function SheetRow({ s, right, sub, href }) {
    const sheet = s && typeof s === "object" ? s : { id: "", title: "\uC545\uBCF4", artist: "\u2014", genre: "" };
    const title = sheet.title || "\uC545\uBCF4";
    const open = href === null ? void 0 : () => location.href = href || PAGES.detail + "?id=" + sheet.id;
    const cover = sheetCoverUrl(sheet);
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, padding: "14px 0", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { onClick: open, style: { width: 56, flex: "none", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-default)", cursor: open ? "pointer" : "default" } }, /* @__PURE__ */ React.createElement(StaffThumb, { ratio: "1 / 1", size: 20, src: cover || void 0, alt: title, watermark: cover ? "light" : false })), /* @__PURE__ */ React.createElement("div", { onClick: open, style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3, cursor: open ? "pointer" : "default" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 600, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, title), sub !== void 0 ? sub : /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text-secondary)" } }, sheet.artist || "\u2014", " \xB7 ", sheet.genre || "")), right);
  }
  function SectionHeader({ title, action, href, style }) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, ...style } }, /* @__PURE__ */ React.createElement("h4", { style: { fontSize: 18, fontWeight: 600, letterSpacing: "-0.4px" } }, title), action ? /* @__PURE__ */ React.createElement("a", { href, style: { color: "var(--text-secondary)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 1 } }, action, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", size: 14 })) : null);
  }
  function Section({ label, children, first }) {
    return /* @__PURE__ */ React.createElement("section", { style: { paddingTop: first ? 20 : 26 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, letterSpacing: "-0.2px" } }, label), children);
  }
  function KV({ k, v }) {
    return /* @__PURE__ */ React.createElement("div", { className: "fo-kv" }, /* @__PURE__ */ React.createElement("span", { style: { color: typeof k === "string" ? "var(--text-secondary)" : "inherit" } }, k), v);
  }
  function Empty({ icon, title, sub, action, href, onAction }) {
    return /* @__PURE__ */ React.createElement("div", { style: { padding: "64px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--color-icon)", opacity: 0.6 } }, /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 40 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, title), sub ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: 300 } }, sub) : null, action ? /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "md", onClick: onAction || (() => location.href = href) }, action)) : null);
  }
  function PayOption({ id, label, sub, cur, onPick }) {
    const on = cur === id;
    return /* @__PURE__ */ React.createElement("button", { onClick: () => onPick(id), style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "13px 14px", textAlign: "left", background: "var(--surface-card)", border: "1px solid " + (on ? "var(--color-ink)" : "var(--border-default)"), borderRadius: "var(--radius-lg)", cursor: "pointer", boxShadow: on ? "0 0 0 3px var(--focus-ring)" : "none", transition: "border-color 100ms ease" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 18, height: 18, flex: "none", borderRadius: 9999, border: "2px solid " + (on ? "var(--color-ink)" : "var(--border-strong)"), display: "flex", alignItems: "center", justifyContent: "center" } }, on ? /* @__PURE__ */ React.createElement("span", { style: { width: 9, height: 9, borderRadius: 9999, background: "var(--color-ink)" } }) : null), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 500 } }, label), sub ? /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto", fontSize: 12, color: "var(--text-secondary)" } }, sub) : null);
  }
  function Dialog({ open, onClose, title, children, wide }) {
    React.useEffect(() => {
      if (!open) return void 0;
      const onKey = (e) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }, [open, onClose]);
    if (!open) return null;
    return /* @__PURE__ */ React.createElement("div", { className: "fo-scrim", onClick: onClose, role: "presentation" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "fo-dialog" + (wide ? " fo-dialog-wide" : ""),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": typeof title === "string" ? title : void 0,
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flex: "none", gap: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 17, fontWeight: 600, letterSpacing: "-0.4px" } }, title), /* @__PURE__ */ React.createElement(IconButton, { name: "x", variant: "ghost", size: "sm", label: "\uB2EB\uAE30", onClick: onClose })),
      /* @__PURE__ */ React.createElement("div", { className: "fo-dialog-body" }, children)
    ));
  }
  const MISSING_SHEET_TITLE = "\uC0AD\uC81C\uB418\uC5C8\uAC70\uB098 \uCC3E\uC744 \uC218 \uC5C6\uB294 \uC545\uBCF4";
  function resolveSheet(id, extra) {
    const snap = extra && (extra.title || extra.name);
    const snapTitle = snap && String(snap).trim() && snap !== MISSING_SHEET_TITLE ? String(snap).trim() : "";
    const fallback = Object.assign({
      id,
      title: snapTitle || MISSING_SHEET_TITLE,
      artist: "\u2014",
      level: "\u2014",
      genre: "",
      price: 0,
      previewUrl: "",
      previewUrls: [],
      missing: true
    }, extra || {});
    if (snapTitle) fallback.title = snapTitle;
    try {
      const byId = window.DrumData && typeof window.DrumData.byId === "function" ? window.DrumData.byId : DATA && typeof DATA.byId === "function" ? DATA.byId : null;
      const s = byId ? byId(id) : null;
      if (s && typeof s === "object") {
        const liveTitle = s.title || snapTitle || fallback.title;
        return Object.assign({}, s, extra || {}, {
          missing: false,
          title: liveTitle
        });
      }
    } catch (e) {
    }
    return fallback;
  }
  function lineTitle(item, resolved) {
    const snap = item && (item.title || item.name);
    if (snap && String(snap).trim() && snap !== MISSING_SHEET_TITLE) return String(snap).trim();
    const t = resolved && resolved.title;
    if (t && t !== MISSING_SHEET_TITLE) return t;
    return snap ? String(snap) : "\uC545\uBCF4";
  }
  function pdfFileName(title) {
    const base = String(title || "\uC545\uBCF4").replace(/\.pdf$/i, "").replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim().slice(0, 80);
    return (base || "\uC545\uBCF4") + ".pdf";
  }
  function isLikelyMobile() {
    try {
      if (navigator.userAgentData && typeof navigator.userAgentData.mobile === "boolean") {
        return navigator.userAgentData.mobile;
      }
    } catch (_) {
    }
    const ua = navigator.userAgent || "";
    if (/Android|iPhone|iPod|Mobile/i.test(ua)) return true;
    if (/iPad/i.test(ua)) return true;
    if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
    return false;
  }
  function clickDownloadAnchor(href, filename) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function asPdfBlob(blob) {
    if (blob && blob.type === "application/pdf") return blob;
    return new Blob([blob], { type: "application/pdf" });
  }
  let pdfDownloadBusy = false;
  async function downloadSheetPdf(sheetOrId, opts) {
    opts = opts || {};
    if (opts.expired) {
      toast("\uB2E4\uC6B4\uB85C\uB4DC \uAE30\uAC04\uC774 \uB9CC\uB8CC\uB418\uC5C8\uC5B4\uC694");
      return;
    }
    if (pdfDownloadBusy) {
      toast("\uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC900\uBE44 \uC911\uC774\uC5D0\uC694");
      return;
    }
    let sheet = null;
    let sheetId = null;
    if (sheetOrId && typeof sheetOrId === "object") {
      sheetId = sheetOrId.sheetId != null && sheetOrId.sheetId !== "" ? sheetOrId.sheetId : sheetOrId.id;
      const urlHint = sheetOrId.pdfUrl || sheetOrId.pdf_url || "";
      sheet = sheetId != null && sheetId !== "" ? resolveSheet(sheetId, sheetOrId) : Object.assign({}, sheetOrId);
      if (urlHint && !(sheet.pdfUrl || sheet.pdf_url)) {
        sheet = Object.assign({}, sheet, { pdfUrl: urlHint });
      }
    } else if (sheetOrId != null && sheetOrId !== "") {
      sheetId = sheetOrId;
      sheet = resolveSheet(sheetOrId);
    }
    if (sheetId == null && sheet) sheetId = sheet.id;
    const title = String(opts.title || sheet && sheet.title || "\uC545\uBCF4").trim() || "\uC545\uBCF4";
    const filename = pdfFileName(title);
    const mobile = isLikelyMobile();
    pdfDownloadBusy = true;
    toast("\u300C" + title + "\u300D \uB2E4\uC6B4\uB85C\uB4DC \uC900\uBE44 \uC911\u2026", 4e3);
    try {
      let url = "";
      const live = window.ChodrumAPI && ChodrumAPI.isLive && ChodrumAPI.isLive();
      if (live && ChodrumAPI.downloads && typeof ChodrumAPI.downloads.signedPdfUrl === "function") {
        const signed = await ChodrumAPI.downloads.signedPdfUrl({
          sheetId,
          email: opts.email || null,
          orderNo: opts.orderNo || null
        });
        url = signed && signed.url;
      } else {
        url = sheet && (sheet.pdfUrl || sheet.pdf_url) || "";
      }
      if (!url) {
        toast("\u300C" + title + "\u300D PDF\uAC00 \uC5C6\uC5B4\uC694");
        return;
      }
      const res = await fetch(url, { mode: "cors", credentials: "omit" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const blob = asPdfBlob(await res.blob());
      if (mobile && typeof navigator.canShare === "function" && typeof navigator.share === "function") {
        const file = new File([blob], filename, { type: "application/pdf" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: filename });
            toast("\u300C" + title + "\u300D \uC800\uC7A5\uD588\uC5B4\uC694", 2500);
            return;
          } catch (shareErr) {
            if (shareErr && shareErr.name === "AbortError") return;
            if (shareErr && shareErr.name === "NotAllowedError") {
              const ok = window.confirm("\u300C" + title + "\u300D PDF\uB97C \uAE30\uAE30\uC5D0 \uC800\uC7A5\uD560\uAE4C\uC694?");
              if (!ok) return;
              try {
                await navigator.share({ files: [file], title: filename });
                toast("\u300C" + title + "\u300D \uC800\uC7A5\uD588\uC5B4\uC694", 2500);
                return;
              } catch (shareErr2) {
                if (shareErr2 && shareErr2.name === "AbortError") return;
                console.warn("[CHODRUM] PDF share retry failed", shareErr2);
              }
            } else {
              console.warn("[CHODRUM] PDF share failed, trying anchor download", shareErr);
            }
          }
        }
      }
      if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, filename);
        toast("\u300C" + title + "\u300D \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC2DC\uC791\uD588\uC5B4\uC694", 2500);
        return;
      }
      const objUrl = URL.createObjectURL(blob);
      clickDownloadAnchor(objUrl, filename);
      setTimeout(function() {
        try {
          URL.revokeObjectURL(objUrl);
        } catch (_) {
        }
      }, 4e3);
      toast("\u300C" + title + "\u300D \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC2DC\uC791\uD588\uC5B4\uC694", 2500);
    } catch (e) {
      console.warn("[CHODRUM] PDF download failed", e);
      toast(e && e.message || "PDF \uB2E4\uC6B4\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694. \uB124\uD2B8\uC6CC\uD06C\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.", 3500);
    } finally {
      pdfDownloadBusy = false;
    }
  }
  function CartAddedDialog({ open, onClose, message = "\uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uB2F4\uC558\uC5B4\uC694" }) {
    return /* @__PURE__ */ React.createElement(Dialog, { open, onClose, title: message }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "lg", fullWidth: true, iconLeft: "shopping-cart", onClick: () => {
      location.href = PAGES.cart;
    } }, "\uC7A5\uBC14\uAD6C\uB2C8\uB85C \uC774\uB3D9"), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "lg", fullWidth: true, onClick: onClose }, "\uACC4\uC18D \uC1FC\uD551")));
  }
  function PreviewToggle({ label = "\uD654\uBA74 \uC0C1\uD0DC \uBBF8\uB9AC\uBCF4\uAE30", options, value, onChange }) {
    const { Chip } = DS;
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "10px 12px", background: "var(--surface-sunken)", border: "1px dashed var(--border-strong)", borderRadius: 8, marginTop: 16 } }, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.4px" } }, label), options.map((o) => /* @__PURE__ */ React.createElement(Chip, { key: o, selected: value === o, onClick: () => onChange(o) }, o)));
  }
  function legalDoc(id) {
    return window.ChodrumLegal && ChodrumLegal.byId(id) || null;
  }
  function legalVer(id) {
    const d = legalDoc(id);
    return d && d.ver || "v1.0";
  }
  function LegalDocBody({ kind }) {
    const doc = legalDoc(kind);
    if (!doc) {
      return /* @__PURE__ */ React.createElement("p", { style: { margin: 0, color: "var(--text-secondary)" } }, "\uC57D\uAD00 \uBCF8\uBB38\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694. legal-docs.js \uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694.");
    }
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14, fontSize: 13.5, lineHeight: 1.75, color: "var(--text-secondary)" } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-tertiary)", margin: 0 } }, doc.name, " \xB7 ", /* @__PURE__ */ React.createElement("span", { className: "ds-mono" }, doc.ver), " \xB7 \uC2DC\uD589\uC77C ", doc.date), /* @__PURE__ */ React.createElement("div", { style: { whiteSpace: "pre-wrap", margin: 0 } }, doc.body));
  }
  function LegalTermRow({ checked, onChange, label, kind, onView }) {
    const ver = legalVer(kind);
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(
      Checkbox,
      {
        checked,
        onChange,
        label: /* @__PURE__ */ React.createElement("span", null, label, " ", /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500 } }, ver))
      }
    )), onView ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onView,
        style: { fontSize: 12.5, color: "var(--text-secondary)", textDecoration: "underline", textUnderlineOffset: 2, flex: "none", padding: "2px 0", background: "none", border: 0, cursor: "pointer", fontFamily: "inherit" }
      },
      "\uBCF4\uAE30"
    ) : null);
  }
  window.FO = { PAGES, won, qp, goBack, toast, useStoreTick, loadPurchases, Money, Stars, StaffThumb, sheetCoverUrl, DdayBadge, Header, TabBar, Footer, Scaffold, isSocialUser, MyPageNav, MyPageLayout, FavButton, SheetCard, SheetRow, SectionHeader, Section, KV, Empty, PayOption, Dialog, CartAddedDialog, resolveSheet, lineTitle, downloadSheetPdf, pdfFileName, MISSING_SHEET_TITLE, PreviewToggle, legalDoc, legalVer, LegalDocBody, LegalTermRow };
})();
