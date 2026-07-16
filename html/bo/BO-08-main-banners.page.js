(() => {
  const DS = window.DrumSheetStoreDesignSystem_3a2462;
  const { Button, IconButton, Card, Badge, Input, Checkbox, Icon } = DS;
  const B = window.BO;
  const A = window.AdminData;
  const D = window.DrumData;
  const EMPTY_FORM = { title: "", link: "", start: "", end: "", img: "", imgUrl: "", imgMobile: "", imgUrlMobile: "", sheetId: "", on: true };
  const BANNER_IMG_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif";
  const BANNER_SIZE_PC = "2240\xD7440px";
  const BANNER_SIZE_MOBILE = "1500\xD7704px";
  const BANNER_MIN_PC = { w: 1600, h: 300 };
  const BANNER_MIN_MOBILE = { w: 750, h: 352 };
  function readImageSize(file) {
    return new Promise((resolve) => {
      if (!file || !file.type || !file.type.startsWith("image/")) {
        resolve(null);
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const size = { w: img.naturalWidth || 0, h: img.naturalHeight || 0 };
        URL.revokeObjectURL(url);
        resolve(size);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }
  function fmtPeriodDay(iso) {
    if (!iso || iso.length < 10) return iso || "";
    return iso.slice(5, 7) + "." + iso.slice(8, 10);
  }
  function parsePeriod(period) {
    if (!period || period === "\uC0C1\uC2DC") return { start: "", end: "" };
    const m = String(period).match(/^(\d{2})\.(\d{2})\s*[–\-]\s*(\d{2})\.(\d{2})$/);
    if (!m) return { start: "", end: "" };
    const y = (/* @__PURE__ */ new Date()).getFullYear();
    return {
      start: y + "-" + m[1] + "-" + m[2],
      end: y + "-" + m[3] + "-" + m[4]
    };
  }
  function periodFromForm(form) {
    return form.start && form.end ? fmtPeriodDay(form.start) + " \u2013 " + fmtPeriodDay(form.end) : "\uC0C1\uC2DC";
  }
  function sheetLabel(s) {
    if (!s) return "";
    return s.title + (s.artist ? " \xB7 " + s.artist : "");
  }
  function BannersPage() {
    const [banners, setBanners] = React.useState((A.banners || []).map((b, i) => ({
      ...b,
      id: b.id || "b" + (i + 1),
      imgUrl: b.imgUrl || "",
      imgMobile: b.imgMobile || "",
      imgUrlMobile: b.imgUrlMobile || "",
      sheetId: b.sheetId || b.sheet_id || ""
    })));
    const [modalOpen, setModalOpen] = React.useState(false);
    const [editId, setEditId] = React.useState(null);
    const [form, setForm] = React.useState(EMPTY_FORM);
    const [sheetQ, setSheetQ] = React.useState("");
    const [uploading, setUploading] = React.useState(false);
    const [uploadSlot, setUploadSlot] = React.useState(null);
    const fileRefPc = React.useRef(null);
    const fileRefMobile = React.useRef(null);
    const isEdit = !!editId;
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    const setDate = (k) => (e) => {
      const v = e.target.value;
      if (k === "start" && form.end && v && form.end < v) {
        setForm({ ...form, start: v, end: v });
      } else {
        setForm({ ...form, [k]: v });
      }
    };
    const canSave = form.title.trim().length > 0 && !uploading;
    const sheets = (D.sheets || []).slice().sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "ko"));
    const sheetFilter = sheetQ.trim().toLowerCase();
    const sheetOptions = sheetFilter ? sheets.filter((s) => (s.title + " " + (s.artist || "")).toLowerCase().includes(sheetFilter)) : sheets;
    const selectedSheet = form.sheetId ? D.byId(form.sheetId) : null;
    const pickSheet = (id) => {
      const s = id ? D.byId(id) : null;
      const nextLink = s ? "/detail?id=" + encodeURIComponent(s.id) : form.link && form.link.indexOf("/detail?id=") === 0 ? "" : form.link;
      setForm({ ...form, sheetId: id || "", link: nextLink });
    };
    const openAdd = () => {
      setEditId(null);
      setForm(EMPTY_FORM);
      setSheetQ("");
      setModalOpen(true);
    };
    const openEdit = (b) => {
      const dates = parsePeriod(b.period);
      setEditId(b.id);
      setForm({
        title: b.title || "",
        link: b.link || "",
        start: dates.start,
        end: dates.end,
        img: b.img || "",
        imgUrl: b.imgUrl || "",
        imgMobile: b.imgMobile || "",
        imgUrlMobile: b.imgUrlMobile || "",
        sheetId: b.sheetId || b.sheet_id || "",
        on: !!b.on
      });
      setSheetQ("");
      setModalOpen(true);
    };
    const closeModal = () => {
      if (uploading) return;
      setModalOpen(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      setSheetQ("");
      setUploadSlot(null);
    };
    const pickImage = async (file, slot) => {
      if (!file || uploading) return;
      setUploading(true);
      setUploadSlot(slot);
      try {
        const dims = await readImageSize(file);
        const min = slot === "mobile" ? BANNER_MIN_MOBILE : BANNER_MIN_PC;
        const soft = dims && (dims.w < min.w || dims.h < min.h);
        const r = await window.ChodrumAPI.banners.uploadImage(file);
        if (slot === "mobile") {
          setForm((prev) => ({
            ...prev,
            imgMobile: r.name || file.name,
            imgUrlMobile: r.url || ""
          }));
          B.toast(soft ? "\uC62C\uB838\uC5B4\uC694. \uBAA8\uBC14\uC77C\uC740 " + BANNER_SIZE_MOBILE + " \uAD8C\uC7A5 \u2014 \uC791\uC73C\uBA74 \uD648\uC5D0\uC11C \uD750\uB9BF\uD560 \uC218 \uC788\uC5B4\uC694" : "\uBAA8\uBC14\uC77C \uBC30\uB108 \uC774\uBBF8\uC9C0\uB97C \uC62C\uB838\uC5B4\uC694");
        } else {
          setForm((prev) => ({
            ...prev,
            img: r.name || file.name,
            imgUrl: r.url || ""
          }));
          B.toast(soft ? "\uC62C\uB838\uC5B4\uC694. PC\uB294 " + BANNER_SIZE_PC + " \uAD8C\uC7A5 \u2014 \uC791\uC73C\uBA74 \uD648\uC5D0\uC11C \uD750\uB9BF\uD560 \uC218 \uC788\uC5B4\uC694" : "PC \uBC30\uB108 \uC774\uBBF8\uC9C0\uB97C \uC62C\uB838\uC5B4\uC694");
        }
      } catch (e) {
        console.warn(e);
        B.toast(e && e.message || "\uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694");
      } finally {
        setUploading(false);
        setUploadSlot(null);
      }
    };
    const persist = async (next) => {
      setBanners(next);
      try {
        await window.ChodrumAPI.banners.save(next);
      } catch (e) {
        console.warn(e);
        B.toast("\uBC30\uB108 \uB3D9\uAE30\uD654 \uC2E4\uD328");
      }
    };
    const save = async () => {
      if (!canSave) return;
      const editing = isEdit;
      const targetId = editId;
      const period = periodFromForm(form);
      const payload = {
        title: form.title.trim(),
        link: form.link.trim(),
        period,
        img: form.img,
        imgUrl: form.imgUrl,
        imgMobile: form.imgMobile,
        imgUrlMobile: form.imgUrlMobile,
        sheetId: form.sheetId || "",
        on: form.on
      };
      const next = editing ? banners.map((b) => b.id === targetId ? { ...b, ...payload } : b) : [{ id: "b" + Date.now(), ...payload }, ...banners];
      setModalOpen(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      setSheetQ("");
      await persist(next);
      B.toast(editing ? "\uBC30\uB108\uB97C \uC218\uC815\uD588\uC5B4\uC694" : "\uBC30\uB108\uAC00 \uCD94\uAC00\uB418\uC5C8\uC5B4\uC694 \xB7 \uD648 \uCD5C\uC0C1\uB2E8\uC5D0 \uB178\uCD9C\uB3FC\uC694");
    };
    const toggle = async (id) => {
      const next = banners.map((b) => b.id === id ? { ...b, on: !b.on } : b);
      await persist(next);
    };
    const move = async (index, dir) => {
      const j = index + dir;
      if (j < 0 || j >= banners.length) return;
      const next = banners.slice();
      const tmp = next[index];
      next[index] = next[j];
      next[j] = tmp;
      await persist(next);
    };
    const remove = async (id) => {
      const next = banners.filter((b) => b.id !== id);
      await persist(next);
      B.toast("\uBC30\uB108\uB97C \uC0AD\uC81C\uD588\uC5B4\uC694");
    };
    const isLiveOnHome = (b) => !!b.on && (!window.DrumData.bannerInPeriod || window.DrumData.bannerInPeriod(b.period));
    const onCount = banners.filter(isLiveOnHome).length;
    const badgeFor = (b) => {
      if (!b.on) return { variant: "neutral", label: "\uC228\uAE40" };
      if (!isLiveOnHome(b)) return { variant: "neutral", label: "\uAE30\uAC04\uB9CC\uB8CC" };
      return { variant: "success", label: "\uB178\uCD9C\uC911" };
    };
    const renderImgUpload = (slot) => {
      const isPc = slot === "pc";
      const previewSrc = isPc ? form.imgUrl : form.imgUrlMobile;
      const fileName = isPc ? form.img : form.imgMobile;
      const sizeLabel = isPc ? BANNER_SIZE_PC : BANNER_SIZE_MOBILE;
      const title = isPc ? "PC \uBC30\uB108 \uC774\uBBF8\uC9C0" : "\uBAA8\uBC14\uC77C \uBC30\uB108 \uC774\uBBF8\uC9C0";
      const busy = uploading && uploadSlot === slot;
      const fileRef = isPc ? fileRefPc : fileRefMobile;
      const height = isPc ? 96 : 120;
      return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, title), /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 11, color: "var(--text-secondary)" } }, "\uAD8C\uC7A5 \uC0AC\uC774\uC988: ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text-primary)", fontWeight: 600 } }, sizeLabel))), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          disabled: uploading,
          onClick: () => fileRef.current && fileRef.current.click(),
          style: {
            width: "100%",
            padding: previewSrc ? 0 : "20px 16px",
            height: previewSrc ? height : void 0,
            minHeight: previewSrc ? void 0 : height,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: previewSrc || fileName ? "var(--surface-sunken)" : "var(--surface-card)",
            border: "1px dashed var(--border-strong)",
            borderRadius: "var(--radius-cards)",
            cursor: uploading ? "wait" : "pointer",
            overflow: "hidden",
            position: "relative",
            opacity: uploading && !busy ? 0.6 : busy ? 0.75 : 1
          }
        },
        previewSrc && !busy ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
          "img",
          {
            src: previewSrc,
            alt: title + " \uBBF8\uB9AC\uBCF4\uAE30",
            style: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", position: "absolute", inset: 0 }
          }
        ), /* @__PURE__ */ React.createElement("span", { style: {
          position: "absolute",
          bottom: 8,
          left: 8,
          right: 8,
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-secondary)",
          background: "rgba(255,255,255,0.92)",
          padding: "4px 8px",
          borderRadius: 4,
          textAlign: "center"
        } }, fileName || "\uC774\uBBF8\uC9C0", " \xB7 \uD074\uB9AD\uD558\uC5EC \uAD50\uCCB4")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { color: fileName ? "var(--status-success)" : "var(--color-icon)" } }, /* @__PURE__ */ React.createElement(Icon, { name: busy ? "upload" : fileName ? "check" : "image", size: 22 })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: 600 } }, busy ? "\uC5C5\uB85C\uB4DC \uC911\u2026" : fileName || (isPc ? "PC \uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC" : "\uBAA8\uBC14\uC77C \uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-secondary)" } }, busy ? "\uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694" : fileName ? "\uB2E4\uC2DC \uC120\uD0DD\uD558\uB824\uBA74 \uD074\uB9AD\uD558\uC138\uC694" : "PNG / JPG / WEBP"))
      ), !isPc ? /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.45 } }, "\uAD8C\uC7A5 \uC0AC\uC774\uC988: ", BANNER_SIZE_MOBILE, ". \uC6D0\uBCF8 \uADF8\uB300\uB85C \uC800\uC7A5 \xB7 \uBE44\uC6B0\uBA74 FO\uC5D0\uC11C PC \uC774\uBBF8\uC9C0\uB97C \uC0AC\uC6A9\uD574\uC694.") : /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.45 } }, "\uAD8C\uC7A5 \uC0AC\uC774\uC988: ", BANNER_SIZE_PC, ". \uC6D0\uBCF8 \uADF8\uB300\uB85C \uC800\uC7A5\uB3FC\uC694 (\uB9AC\uC0AC\uC774\uC988\xB7\uC555\uCD95 \uC5C6\uC74C)."));
    };
    return /* @__PURE__ */ React.createElement(
      B.Shell,
      {
        active: "banners",
        title: "\uBA54\uC778 \uAD00\uB9AC \u2014 \uBC30\uB108 \uAD00\uB9AC",
        actions: /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", iconLeft: "plus", onClick: openAdd }, "\uBC30\uB108 \uCD94\uAC00")
      },
      /* @__PURE__ */ React.createElement("div", { "data-screen-label": "BO-08 \uBC30\uB108 \uAD00\uB9AC", style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, { padding: 0 }, /* @__PURE__ */ React.createElement(B.CardHead, { title: "\uD648 \uBC30\uB108", right: /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { fontSize: 12, color: "var(--text-secondary)" } }, onCount, "\uAC1C \uB178\uCD9C\uC911 / \uCD1D ", banners.length, "\uAC1C") }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 18px 16px" } }, banners.length ? banners.map((b, i) => /* @__PURE__ */ React.createElement("div", { key: b.id, style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderTop: i ? "1px solid var(--border-default)" : "none" } }, /* @__PURE__ */ React.createElement("span", { className: "ds-mono", style: { width: 18, fontSize: 13, fontWeight: 600, color: i === 0 ? "var(--color-ink)" : "var(--text-tertiary)", flex: "none" } }, i + 1), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, b.title), /* @__PURE__ */ React.createElement("div", { className: "ds-mono", style: { fontSize: 11, color: "var(--text-secondary)", marginTop: 2 } }, b.period || "\uC0C1\uC2DC")), /* @__PURE__ */ React.createElement(Badge, { variant: badgeFor(b).variant, size: "sm" }, badgeFor(b).label), /* @__PURE__ */ React.createElement(IconButton, { name: "chevron-up", variant: "ghost", size: "sm", label: "\uC704\uB85C", disabled: i === 0, onClick: () => move(i, -1) }), /* @__PURE__ */ React.createElement(IconButton, { name: "chevron-down", variant: "ghost", size: "sm", label: "\uC544\uB798\uB85C", disabled: i === banners.length - 1, onClick: () => move(i, 1) }), /* @__PURE__ */ React.createElement(IconButton, { name: b.on ? "eye-off" : "eye", variant: "ghost", size: "sm", label: "\uB178\uCD9C \uC804\uD658", onClick: () => toggle(b.id) }), /* @__PURE__ */ React.createElement(IconButton, { name: "pencil", variant: "ghost", size: "sm", label: "\uC218\uC815", onClick: () => openEdit(b) }), /* @__PURE__ */ React.createElement(IconButton, { name: "trash-2", variant: "ghost", size: "sm", label: "\uC0AD\uC81C", onClick: () => remove(b.id) }))) : /* @__PURE__ */ React.createElement("p", { style: { padding: "8px 0 4px", fontSize: 13, color: "var(--text-secondary)" } }, "\uB4F1\uB85D\uB41C \uBC30\uB108\uAC00 \uC5C6\uC5B4\uC694. \uC6B0\uCE21 \uC0C1\uB2E8 \uBC30\uB108 \uCD94\uAC00\uB85C \uB4F1\uB85D\uD574\uC8FC\uC138\uC694."))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)" } }, "\uBC30\uB108\uB294 \uC704\uC5D0\uC11C\uBD80\uD130 \uC21C\uC11C\uB300\uB85C \uD648\uC5D0 \uC804\uD3ED \uC774\uBBF8\uC9C0\uB85C \uB178\uCD9C\uB3FC\uC694. \u25B2\u25BC \uBC84\uD2BC\uC73C\uB85C \uC21C\uC11C\uB97C \uBC14\uAFC0 \uC218 \uC788\uC5B4\uC694. PC\xB7\uBAA8\uBC14\uC77C \uC774\uBBF8\uC9C0\uB97C \uB530\uB85C \uC62C\uB9AC\uBA74 \uBDF0\uD3EC\uD2B8\uC5D0 \uB9DE\uCDB0 \uC804\uD658\uB418\uACE0, \uBAA8\uBC14\uC77C\uC744 \uBE44\uC6B0\uBA74 PC \uC774\uBBF8\uC9C0\uB97C \uC0AC\uC6A9\uD574\uC694. \uC5F0\uB3D9 \uC545\uBCF4\uAC00 \uC788\uC73C\uBA74 \uD074\uB9AD \uC2DC \uD574\uB2F9 \uC0C1\uC138\uB85C \uC774\uB3D9\uD574\uC694.")),
      /* @__PURE__ */ React.createElement(
        B.Modal,
        {
          open: modalOpen,
          onClose: closeModal,
          title: isEdit ? "\uBC30\uB108 \uC218\uC815" : "\uBC30\uB108 \uCD94\uAC00",
          width: 580,
          footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", disabled: uploading, onClick: closeModal }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Button, { variant: "primary", size: "sm", disabled: !canSave, onClick: save }, isEdit ? "\uC800\uC7A5\uD558\uAE30" : "\uCD94\uAC00\uD558\uAE30"))
        },
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uBC30\uB108 \uC81C\uBAA9 (\uD544\uC218)", placeholder: "\uC608: \uC5EC\uB984\uB9DE\uC774 \uC2E0\uACE1 \uB77C\uC778\uC5C5", value: form.title, onChange: set("title") }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 6 } }, "\uC5F0\uB3D9 \uC545\uBCF4"), /* @__PURE__ */ React.createElement(Input, { size: "sm", iconLeft: "search", placeholder: "\uACE1\uBA85 / \uC544\uD2F0\uC2A4\uD2B8 \uAC80\uC0C9", value: sheetQ, onChange: (e) => setSheetQ(e.target.value) }), /* @__PURE__ */ React.createElement("div", { style: {
          marginTop: 8,
          maxHeight: 168,
          overflowY: "auto",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-cards)",
          background: "var(--surface-card)"
        } }, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => pickSheet(""),
            style: {
              width: "100%",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              border: 0,
              borderBottom: "1px solid var(--border-default)",
              background: !form.sheetId ? "var(--surface-sunken)" : "transparent",
              cursor: "pointer"
            }
          },
          /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-secondary)" } }, "\uC120\uD0DD \uC548 \uD568 (\uC5F0\uACB0 \uB9C1\uD06C \uC0AC\uC6A9)")
        ), sheetOptions.slice(0, 40).map((s) => {
          const on = form.sheetId === s.id;
          return /* @__PURE__ */ React.createElement(
            "button",
            {
              key: s.id,
              type: "button",
              onClick: () => pickSheet(s.id),
              style: {
                width: "100%",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                border: 0,
                borderBottom: "1px solid var(--border-default)",
                background: on ? "var(--surface-sunken)" : "transparent",
                cursor: "pointer"
              }
            },
            /* @__PURE__ */ React.createElement(B.Thumb, null),
            /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: 13.5, fontWeight: on ? 600 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, s.title), /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: 12, color: "var(--text-secondary)" } }, s.artist, " \xB7 ", s.genre)),
            on ? /* @__PURE__ */ React.createElement(Badge, { variant: "solid", size: "sm" }, "\uC120\uD0DD") : null
          );
        }), !sheetOptions.length ? /* @__PURE__ */ React.createElement("p", { style: { padding: "12px", fontSize: 13, color: "var(--text-secondary)", margin: 0 } }, "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC5B4\uC694.") : null), selectedSheet ? /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)", marginTop: 8 } }, "\uD074\uB9AD \uC2DC \uC774\uB3D9: ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text-primary)", fontWeight: 600 } }, sheetLabel(selectedSheet)), " ", "\xB7 \uC5F0\uACB0 \uB9C1\uD06C\uAC00 \uC0C1\uC138\uB85C \uB9DE\uCDB0\uC838\uC694.") : /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)", marginTop: 8 } }, "\uC5F0\uB3D9 \uC545\uBCF4\uB97C \uACE0\uB974\uBA74 \uD648 \uBC30\uB108 \uD074\uB9AD \uC2DC \uD574\uB2F9 \uC545\uBCF4 \uC0C1\uC138\uB85C \uC774\uB3D9\uD574\uC694.")), /* @__PURE__ */ React.createElement(Input, { label: "\uC5F0\uACB0 \uB9C1\uD06C", placeholder: "\uC608: /list?cat=\uB77D (\uC545\uBCF4 \uC120\uD0DD \uC2DC \uC0C1\uC138\uB85C \uC790\uB3D9 \uC124\uC815)", value: form.link, onChange: set("link") }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Input, { label: "\uB178\uCD9C \uC2DC\uC791\uC77C", type: "date", value: form.start, onChange: setDate("start"), max: form.end || void 0 }), /* @__PURE__ */ React.createElement(Input, { label: "\uB178\uCD9C \uC885\uB8CC\uC77C", type: "date", value: form.end, onChange: setDate("end"), min: form.start || void 0 })), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "var(--text-secondary)", marginTop: -6 } }, "\uB2EC\uB825\uC5D0\uC11C \uC120\uD0DD\uD558\uC138\uC694. \uAE30\uAC04\uC744 \uBE44\uC6B0\uBA74 \uC0C1\uC2DC \uB178\uCD9C\uB3FC\uC694."), /* @__PURE__ */ React.createElement(
          "input",
          {
            ref: fileRefPc,
            type: "file",
            accept: BANNER_IMG_ACCEPT,
            style: { display: "none" },
            onChange: (e) => {
              const f = e.target.files && e.target.files[0];
              e.target.value = "";
              if (f) pickImage(f, "pc");
            }
          }
        ), /* @__PURE__ */ React.createElement(
          "input",
          {
            ref: fileRefMobile,
            type: "file",
            accept: BANNER_IMG_ACCEPT,
            style: { display: "none" },
            onChange: (e) => {
              const f = e.target.files && e.target.files[0];
              e.target.value = "";
              if (f) pickImage(f, "mobile");
            }
          }
        ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, renderImgUpload("pc"), renderImgUpload("mobile")), /* @__PURE__ */ React.createElement(
          Checkbox,
          {
            checked: form.on,
            onChange: (on) => setForm({ ...form, on }),
            label: isEdit ? "\uD648\uC5D0 \uB178\uCD9C" : "\uB4F1\uB85D \uC989\uC2DC \uB178\uCD9C"
          }
        ))
      )
    );
  }
  window.ChodrumBoot.whenReady(() => {
    ReactDOM.createRoot(document.getElementById("app")).render(/* @__PURE__ */ React.createElement(BannersPage, null));
  });
})();
