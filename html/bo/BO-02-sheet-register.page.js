(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, Card, Icon, Input, Select, Badge, Checkbox } = DS;
  const B = window.BO;
  const D = window.DrumData;
  const EMPTY_PREVIEW = () => ({ name: "", url: "", thumb: "" });
  const PREVIEW_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif";
  function queryEditId() {
    try {
      const p = new URLSearchParams(location.search);
      return (p.get("id") || p.get("edit") || "").trim();
    } catch (_) {
      return "";
    }
  }
  function fileNameFromUrl(url) {
    if (!url) return "";
    try {
      const path = String(url).split("?")[0];
      const seg = path.split("/").filter(Boolean).pop() || "";
      return decodeURIComponent(seg) || "\uB4F1\uB85D\uB41C \uD30C\uC77C";
    } catch (_) {
      return "\uB4F1\uB85D\uB41C \uD30C\uC77C";
    }
  }
  function revokeThumb(slot) {
    if (slot && slot.thumb && String(slot.thumb).indexOf("blob:") === 0) {
      try {
        URL.revokeObjectURL(slot.thumb);
      } catch (_) {
      }
    }
  }
  function FileDrop({ icon, title, sub, fileName, accept, uploading, onFile }) {
    const inputRef = React.useRef(null);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept,
        style: { display: "none" },
        onChange: (e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = "";
          if (f) onFile(f);
        }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: uploading,
        onClick: () => inputRef.current && inputRef.current.click(),
        style: {
          width: "100%",
          padding: "26px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          background: fileName ? "var(--surface-sunken)" : "var(--surface-card)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--radius-cards)",
          cursor: uploading ? "wait" : "pointer",
          textAlign: "center",
          opacity: uploading ? 0.75 : 1
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: { color: fileName ? "var(--status-success)" : "var(--color-icon)" } }, /* @__PURE__ */ React.createElement(Icon, { name: uploading ? "upload" : fileName ? "check" : icon, size: 26 })),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600 } }, uploading ? "\uC5C5\uB85C\uB4DC \uC911\u2026" : fileName || title),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 } }, uploading ? "\uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694" : fileName ? "\uB2E4\uC2DC \uC120\uD0DD\uD558\uB824\uBA74 \uD074\uB9AD\uD558\uC138\uC694" : sub)
    ));
  }
  function PreviewSlot({ page, slot, uploading, onFile, onClear }) {
    const inputRef = React.useRef(null);
    const src = slot.thumb || slot.url;
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600 } }, "\uBBF8\uB9AC\uBCF4\uAE30 ", page, "\uD398\uC774\uC9C0"), src ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onClear,
        style: { fontSize: 12, color: "var(--text-secondary)", background: "none", border: 0, cursor: "pointer", padding: 0 }
      },
      "\uC0AD\uC81C"
    ) : null), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: PREVIEW_ACCEPT,
        style: { display: "none" },
        onChange: (e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = "";
          if (f) onFile(f);
        }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: uploading,
        onClick: () => inputRef.current && inputRef.current.click(),
        style: {
          width: "100%",
          aspectRatio: "5 / 6",
          padding: src ? 0 : 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          background: src ? "#fff" : "var(--surface-card)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--radius-cards)",
          cursor: uploading ? "wait" : "pointer",
          overflow: "hidden",
          position: "relative",
          opacity: uploading ? 0.75 : 1
        }
      },
      src ? /* @__PURE__ */ React.createElement(
        "img",
        {
          src,
          alt: "\uBBF8\uB9AC\uBCF4\uAE30 " + page + "\uD398\uC774\uC9C0",
          style: { width: "100%", height: "100%", objectFit: "contain" }
        }
      ) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--color-icon)" } }, /* @__PURE__ */ React.createElement(Icon, { name: uploading ? "upload" : "image", size: 22 })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600 } }, uploading ? "\uC5C5\uB85C\uB4DC \uC911\u2026" : "\uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-secondary)" } }, "PNG / JPG / WEBP")),
      src && !uploading ? /* @__PURE__ */ React.createElement("span", { style: {
        position: "absolute",
        bottom: 8,
        left: 8,
        right: 8,
        fontSize: 11,
        fontWeight: 500,
        color: "var(--text-secondary)",
        background: "rgba(255,255,255,0.92)",
        padding: "4px 6px",
        borderRadius: 4
      } }, "\uD074\uB9AD\uD558\uC5EC \uAD50\uCCB4") : null
    ), slot.name ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, slot.name) : null);
  }
  function RegisterPage() {
    const editId = React.useMemo(() => queryEditId(), []);
    const isEdit = !!editId;
    const existingRef = React.useRef(null);
    const [hydrated, setHydrated] = React.useState(!editId);
    const [pdf, setPdf] = React.useState({ name: "", url: "" });
    const [previews, setPreviews] = React.useState([EMPTY_PREVIEW(), EMPTY_PREVIEW()]);
    const [busy, setBusy] = React.useState({ pdf: false, img0: false, img1: false, save: false });
    const [form, setForm] = React.useState({ title: "", artist: "", genre: D.genres[0], level: D.levels[1], pages: "", price: "", orig: "", status: "\uD310\uB9E4\uC911", preview: "2\uD398\uC774\uC9C0", popular: false, youtubeUrl: "" });
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    const imgBusy = busy.img0 || busy.img1;
    const canSave = hydrated && pdf.url && form.title.trim() && form.artist.trim() && form.price && !busy.pdf && !imgBusy && !busy.save;
    React.useEffect(() => () => {
      previews.forEach(revokeThumb);
    }, []);
    React.useEffect(() => {
      if (!editId) return;
      const s = D.byId(editId);
      if (!s) {
        B.toast("\uD574\uB2F9 \uC545\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC5B4\uC694");
        setHydrated(true);
        return;
      }
      existingRef.current = s;
      const urls = Array.isArray(s.previewUrls) && s.previewUrls.length ? s.previewUrls.filter(Boolean).slice(0, 2) : s.previewUrl ? [s.previewUrl] : [];
      setPdf({
        name: fileNameFromUrl(s.pdfUrl) || (s.pdfUrl ? "\uB4F1\uB85D\uB41C PDF" : ""),
        url: s.pdfUrl || ""
      });
      setPreviews([
        urls[0] ? { name: fileNameFromUrl(urls[0]), url: urls[0], thumb: urls[0] } : EMPTY_PREVIEW(),
        urls[1] ? { name: fileNameFromUrl(urls[1]), url: urls[1], thumb: urls[1] } : EMPTY_PREVIEW()
      ]);
      const previewCount = urls.length >= 2 ? "2\uD398\uC774\uC9C0" : urls.length === 1 ? "1\uD398\uC774\uC9C0" : "2\uD398\uC774\uC9C0";
      setForm({
        title: s.title || "",
        artist: s.artist || "",
        genre: s.genre || D.genres[0],
        level: s.level || D.levels[1],
        pages: s.pages != null ? String(s.pages) : "",
        price: s.price != null ? String(s.price) : "",
        orig: s.orig != null ? String(s.orig) : "",
        status: s.status || "\uD310\uB9E4\uC911",
        preview: previewCount,
        popular: !!s.popular,
        youtubeUrl: s.youtubeUrl || ""
      });
      setHydrated(true);
      document.title = "CHODRUM Admin \u2014 \uC545\uBCF4 \uC218\uC815";
    }, [editId]);
    const pickPdf = async (file) => {
      setBusy((b) => ({ ...b, pdf: true }));
      try {
        const r = await window.ChodrumAPI.sheets.uploadFile(file, "pdf");
        setPdf({ name: r.name || file.name, url: r.url });
        B.toast(isEdit ? "PDF \uC6D0\uBCF8\uC744 \uAD50\uCCB4\uD588\uC5B4\uC694" : "PDF \uC6D0\uBCF8\uC744 \uC62C\uB838\uC5B4\uC694");
      } catch (e) {
        console.warn(e);
        B.toast(e && e.message || "PDF \uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694");
      } finally {
        setBusy((b) => ({ ...b, pdf: false }));
      }
    };
    const pickPreview = (index) => async (file) => {
      const key = index === 0 ? "img0" : "img1";
      setBusy((b) => ({ ...b, [key]: true }));
      try {
        const r = await window.ChodrumAPI.sheets.uploadFile(file, "preview");
        setPreviews((prev) => {
          const next = prev.slice();
          revokeThumb(next[index]);
          next[index] = { name: r.name || file.name, url: r.url, thumb: r.url };
          return next;
        });
        B.toast("\uBBF8\uB9AC\uBCF4\uAE30 " + (index + 1) + "\uD398\uC774\uC9C0\uB97C \uC62C\uB838\uC5B4\uC694 (\uC0C1\uB2E8 \uC77C\uBD80\uB9CC \uACF5\uAC1C)");
      } catch (e) {
        console.warn(e);
        B.toast(e && e.message || "\uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694");
      } finally {
        setBusy((b) => ({ ...b, [key]: false }));
      }
    };
    const clearPreview = (index) => {
      setPreviews((prev) => {
        const next = prev.slice();
        revokeThumb(next[index]);
        next[index] = EMPTY_PREVIEW();
        return next;
      });
      B.toast("\uBBF8\uB9AC\uBCF4\uAE30 " + (index + 1) + "\uD398\uC774\uC9C0\uB97C \uC0AD\uC81C\uD588\uC5B4\uC694");
    };
    const save = async () => {
      if (!canSave) return;
      setBusy((b) => ({ ...b, save: true }));
      const previewUrls = previews.map((p) => p.url).filter(Boolean).slice(0, 2);
      const prev = existingRef.current || {};
      const sheet = {
        id: isEdit ? editId : "s" + Date.now(),
        code: prev.code || void 0,
        title: form.title.trim(),
        artist: form.artist.trim(),
        genre: form.genre,
        level: form.level,
        pages: Number(form.pages) || 0,
        price: Number(form.price) || 0,
        orig: form.orig ? Number(form.orig) : void 0,
        status: form.status,
        popular: !!form.popular,
        isNew: isEdit ? !!prev.isNew : true,
        rating: isEdit ? prev.rating || 0 : 0,
        sold: isEdit ? prev.sold || 0 : 0,
        pdfUrl: pdf.url,
        previewUrl: previewUrls[0] || "",
        previewUrls,
        youtubeUrl: (form.youtubeUrl || "").trim()
      };
      try {
        const mapped = await window.ChodrumAPI.sheets.upsert(sheet);
        if (mapped && mapped._warn) {
          B.toast(mapped._warn);
          setBusy((b) => ({ ...b, save: false }));
          return;
        }
        B.toast(isEdit ? "\u300C" + form.title + "\u300D \uC545\uBCF4\uB97C \uC800\uC7A5\uD588\uC5B4\uC694" : "\u300C" + form.title + "\u300D \uC545\uBCF4\uAC00 \uB4F1\uB85D\uB418\uC5C8\uC5B4\uC694");
        setTimeout(() => location.href = "/bo/sheets", 900);
      } catch (e) {
        console.warn(e);
        B.toast(e && e.message || (isEdit ? "\uC800\uC7A5 \uC2E4\uD328 \u2014 Supabase \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uC138\uC694" : "\uB4F1\uB85D \uC2E4\uD328 \u2014 Supabase \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uC138\uC694"));
        setBusy((b) => ({ ...b, save: false }));
      }
    };
    const filledPreviews = previews.filter((p) => p.thumb || p.url);
    const pageTitle = isEdit ? "\uC545\uBCF4 \uC218\uC815" : "\uC545\uBCF4 \uB4F1\uB85D";
    const saveLabel = busy.save ? isEdit ? "\uC800\uC7A5 \uC911\u2026" : "\uB4F1\uB85D \uC911\u2026" : isEdit ? "\uC800\uC7A5\uD558\uAE30" : "\uB4F1\uB85D\uD558\uAE30";
    return /* @__PURE__ */ React.createElement(
      B.Shell,
      {
        active: isEdit ? "sheets" : "register",
        title: pageTitle,
        actions: /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", iconLeft: "chevron-left", onClick: () => location.href = "/bo/sheets" }, "\uBAA9\uB85D\uC73C\uB85C")
      },
      /* @__PURE__ */ React.createElement("div", { "data-screen-label": isEdit ? "BO-02-01 \uC545\uBCF4 \uC218\uC815" : "BO-02-01 \uC545\uBCF4 \uB4F1\uB85D", className: "bo-form-cols" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, { padding: 18, style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, "\uC6D0\uBCF8 \uD30C\uC77C"), /* @__PURE__ */ React.createElement(
        FileDrop,
        {
          icon: "upload",
          title: "PDF \uC6D0\uBCF8 \uC5C5\uB85C\uB4DC",
          sub: "\uAD6C\uB9E4\uC790\uC5D0\uAC8C \uC81C\uACF5\uB418\uB294 \uD30C\uC77C \xB7 PDF\uB9CC \uAC00\uB2A5",
          accept: "application/pdf,.pdf",
          fileName: pdf.name,
          uploading: busy.pdf,
          onFile: pickPdf
        }
      )), /* @__PURE__ */ React.createElement(Card, { padding: 18, style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, "\uBBF8\uB9AC\uBCF4\uAE30 \uC774\uBBF8\uC9C0"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-secondary)" } }, "\uCD5C\uB300 2\uC7A5 \xB7 \uC0C1\uB2E8 \uC77C\uBD80\uB9CC \uACF5\uAC1C\uB418\uB3C4\uB85D \uCC98\uB9AC\uB3FC\uC694")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(
        PreviewSlot,
        {
          page: 1,
          slot: previews[0],
          uploading: busy.img0,
          onFile: pickPreview(0),
          onClear: () => clearPreview(0)
        }
      ), /* @__PURE__ */ React.createElement(
        PreviewSlot,
        {
          page: 2,
          slot: previews[1],
          uploading: busy.img1,
          onFile: pickPreview(1),
          onClear: () => clearPreview(1)
        }
      ))), /* @__PURE__ */ React.createElement(Card, { padding: 18, style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, "\uBBF8\uB9AC\uBCF4\uAE30 \uD655\uC778"), filledPreviews.length ? /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: filledPreviews.length > 1 ? "1fr 1fr" : "1fr", gap: 10 } }, previews.map((p, i) => {
        const src = p.thumb || p.url;
        if (!src) return null;
        return /* @__PURE__ */ React.createElement("div", { key: i, style: { borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-default)", position: "relative", background: "#f6f6f6", aspectRatio: "5 / 6", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(
          "img",
          {
            src,
            alt: "\uBBF8\uB9AC\uBCF4\uAE30 " + (i + 1) + "\uD398\uC774\uC9C0",
            style: { position: "relative", zIndex: 1, width: "100%", height: "100%", objectFit: "contain", background: "#fff" }
          }
        ), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-16deg)", fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500, letterSpacing: 2, color: "rgba(0,0,0,0.06)", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 2 } }, "PREVIEW"), /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", top: 8, left: 8, zIndex: 3, fontSize: 11, fontWeight: 600, background: "rgba(255,255,255,0.92)", padding: "2px 6px", borderRadius: 4 } }, i + 1, "\uD398\uC774\uC9C0"));
      })) : /* @__PURE__ */ React.createElement("div", { style: { borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-default)", position: "relative", background: "#f6f6f6", aspectRatio: "5 / 6", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(180deg, transparent 0 15px, #e7e7e7 15px 16px)", backgroundPosition: "0 14px" } }), /* @__PURE__ */ React.createElement(Icon, { name: "music", size: 40, style: { color: "#cccccc", position: "relative" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-16deg)", fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 500, letterSpacing: 3, color: "rgba(0,0,0,0.06)", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 2 } }, "PREVIEW")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-secondary)" } }, filledPreviews.length ? "\uC5C5\uB85C\uB4DC\uD55C " + filledPreviews.length + "\uC7A5\uC774 \uC2A4\uD1A0\uC5B4 \uC0C1\uC138\uC5D0 \uB178\uCD9C\uB3FC\uC694. \uD558\uB2E8\uC740 \uAC00\uB824\uC838 \uC804\uCCB4 \uC545\uBCF4\uAC00 \uBCF4\uC774\uC9C0 \uC54A\uC544\uC694." : "\uC2A4\uD1A0\uC5B4 \uC0C1\uC138\uC5D0 \uB178\uCD9C\uB3FC\uC694. \uD558\uB2E8 \uAC00\uB9BC + \uC740\uC740\uD55C \uC6CC\uD130\uB9C8\uD06C\uB85C \uC77C\uBD80\uB9CC \uBCF4\uC774\uAC8C \uCC98\uB9AC\uB429\uB2C8\uB2E4. (\uCD5C\uB300 2\uC7A5)"))), /* @__PURE__ */ React.createElement(Card, { padding: 18, style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, "\uC545\uBCF4 \uC815\uBCF4"), /* @__PURE__ */ React.createElement(Input, { label: "\uACE1\uBA85", placeholder: "\uC608: Snare Groove No.8", value: form.title, onChange: set("title") }), /* @__PURE__ */ React.createElement(Input, { label: "\uC544\uD2F0\uC2A4\uD2B8", placeholder: "\uC608: The Metronomes", value: form.artist, onChange: set("artist") }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(B.Labeled, { label: "\uC7A5\uB974" }, /* @__PURE__ */ React.createElement(Select, { value: form.genre, onChange: set("genre"), options: D.genres })), /* @__PURE__ */ React.createElement(B.Labeled, { label: "\uB09C\uC774\uB3C4" }, /* @__PURE__ */ React.createElement(Select, { value: form.level, onChange: set("level"), options: D.levels }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uD398\uC774\uC9C0 \uC218", type: "number", placeholder: "6", value: form.pages, onChange: set("pages") }), /* @__PURE__ */ React.createElement(B.Labeled, { label: "\uBBF8\uB9AC\uBCF4\uAE30 \uBC94\uC704", hint: "\uC77C\uBD80\uB9CC \uBCF4\uC774\uB3C4\uB85D \uCC98\uB9AC\uB418\uB294 \uD398\uC774\uC9C0 \uC218" }, /* @__PURE__ */ React.createElement(Select, { value: form.preview, onChange: set("preview"), options: ["1\uD398\uC774\uC9C0", "2\uD398\uC774\uC9C0"] }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uD310\uB9E4\uAC00 (\u20A9)", type: "number", placeholder: "4500", value: form.price, onChange: set("price") }), /* @__PURE__ */ React.createElement(Input, { label: "\uC815\uAC00 (\u20A9 \xB7 \uC120\uD0DD)", type: "number", placeholder: "\uD560\uC778 \uC2DC\uC5D0\uB9CC \uC785\uB825", value: form.orig, onChange: set("orig") })), /* @__PURE__ */ React.createElement(
        Input,
        {
          label: "YouTube URL (\uC120\uD0DD)",
          placeholder: "https://www.youtube.com/watch?v=\u2026 \uB610\uB294 youtu.be/\u2026",
          value: form.youtubeUrl,
          onChange: set("youtubeUrl")
        }
      ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-secondary)", marginTop: -6, lineHeight: 1.45 } }, "\uC2A4\uD1A0\uC5B4 \uC0C1\uC138\uC5D0\uC11C \uD074\uB9AD \uC2DC \uD398\uC774\uC9C0 \uC548\uC5D0\uC11C \uC7AC\uC0DD\uB3FC\uC694. \uBE44\uC6B0\uBA74 \uD50C\uB808\uC774\uC5B4\uB294 \uC228\uACA8\uC9D1\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement(B.Labeled, { label: "\uB178\uCD9C \uC0C1\uD0DC", hint: "\uC228\uAE40/\uD310\uB9E4\uC911\uC9C0 \uC0C1\uD0DC\uB294 \uC2A4\uD1A0\uC5B4\uC5D0 \uB178\uCD9C\uB418\uC9C0 \uC54A\uC544\uC694." }, /* @__PURE__ */ React.createElement(Select, { value: form.status, onChange: set("status"), options: ["\uD310\uB9E4\uC911", "\uD310\uB9E4\uC911\uC9C0", "\uC228\uAE40"] })), /* @__PURE__ */ React.createElement(B.Labeled, { label: "\uB178\uCD9C \uC635\uC158", hint: "\uCCB4\uD06C\uD558\uBA74 \uD648 \u300C\uC778\uAE30 \uC545\uBCF4\u300D\uC640 \uBAA9\uB85D \u300C\uC778\uAE30\uC21C\u300D\uC5D0 \uC6B0\uC120 \uB178\uCD9C\uB3FC\uC694." }, /* @__PURE__ */ React.createElement(
        Checkbox,
        {
          checked: !!form.popular,
          onChange: (on) => setForm({ ...form, popular: !!on }),
          label: "\uC778\uAE30\uC545\uBCF4"
        }
      )), /* @__PURE__ */ React.createElement("hr", { style: { height: 1, background: "var(--border-default)", border: 0, margin: "4px 0" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" } }, !isEdit ? /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "md", onClick: () => B.toast("\uC784\uC2DC\uC800\uC7A5\uD588\uC5B4\uC694") }, "\uC784\uC2DC\uC800\uC7A5") : null, /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "md", iconLeft: "check", disabled: !canSave, onClick: save }, saveLabel))))
    );
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(RegisterPage, null));
  });
})();
