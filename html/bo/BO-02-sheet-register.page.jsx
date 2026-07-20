/* BO-02-01 악보 등록/수정 — PDF 원본 · 워터마크 미리보기(최대 2장) · 정보 입력 · 노출 상태
   수정: BO-02-sheet-register.html?id=<sheetId> (또는 ?edit=) */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, Card, Icon, Input, Select, Badge, Checkbox } = DS;
const B = window.BO;
const D = window.DrumData;

const EMPTY_PREVIEW = () => ({ name: '', url: '', thumb: '' });
const PREVIEW_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif';

/** Required preview image count from 「미리보기 범위」 (1페이지 | 2페이지). */
function previewRangeCount(label) {
  const n = parseInt(String(label || '').replace(/\D/g, ''), 10);
  if (n === 1) return 1;
  if (n >= 2) return 2;
  return 2;
}

function queryEditId() {
  try {
    const p = new URLSearchParams(location.search);
    return (p.get('id') || p.get('edit') || '').trim();
  } catch (_) {
    return '';
  }
}

function fileNameFromUrl(url) {
  if (!url) return '';
  try {
    const path = String(url).split('?')[0];
    const seg = path.split('/').filter(Boolean).pop() || '';
    return decodeURIComponent(seg) || '등록된 파일';
  } catch (_) {
    return '등록된 파일';
  }
}

function revokeThumb(slot) {
  if (slot && slot.thumb && String(slot.thumb).indexOf('blob:') === 0) {
    try { URL.revokeObjectURL(slot.thumb); } catch (_) {}
  }
}

/** True when value is usable as <img src> (not a bare storage path). */
function isImgSrc(url) {
  return /^(https?:|blob:|data:)/i.test(String(url || ''));
}

function FileDrop({ icon, title, sub, fileName, accept, uploading, onFile }) {
  const inputRef = React.useRef(null);
  return (
    <React.Fragment>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = '';
          if (f) onFile(f);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current && inputRef.current.click()}
        style={{
          width: '100%',
          padding: '26px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          background: fileName ? 'var(--surface-sunken)' : 'var(--surface-card)',
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--radius-cards)',
          cursor: uploading ? 'wait' : 'pointer',
          textAlign: 'center',
          opacity: uploading ? 0.75 : 1,
        }}
      >
        <span style={{ color: fileName ? 'var(--status-success)' : 'var(--color-icon)' }}>
          <Icon name={uploading ? 'upload' : (fileName ? 'check' : icon)} size={26} />
        </span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          {uploading ? '업로드 중…' : (fileName || title)}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {uploading ? '잠시만 기다려 주세요' : (fileName ? '다시 선택하려면 클릭하세요' : sub)}
        </span>
      </button>
    </React.Fragment>
  );
}

function PreviewSlot({ page, slot, uploading, onFile, onClear }) {
  const inputRef = React.useRef(null);
  const src = isImgSrc(slot.thumb) ? slot.thumb : (isImgSrc(slot.url) ? slot.url : '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>미리보기 {page}페이지</span>
        {src ? (
          <button
            type="button"
            onClick={onClear}
            style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
          >
            삭제
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={PREVIEW_ACCEPT}
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = '';
          if (f) onFile(f);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current && inputRef.current.click()}
        style={{
          width: '100%',
          aspectRatio: '5 / 6',
          padding: src ? 0 : 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          background: src ? '#fff' : 'var(--surface-card)',
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--radius-cards)',
          cursor: uploading ? 'wait' : 'pointer',
          overflow: 'hidden',
          position: 'relative',
          opacity: uploading ? 0.75 : 1,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={'미리보기 ' + page + '페이지'}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <React.Fragment>
            <span style={{ color: 'var(--color-icon)' }}>
              <Icon name={uploading ? 'upload' : 'image'} size={22} />
            </span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {uploading ? '업로드 중…' : '이미지 업로드'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>PNG / JPG / WEBP</span>
          </React.Fragment>
        )}
        {src && !uploading ? (
          <span style={{
            position: 'absolute', bottom: 8, left: 8, right: 8,
            fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.92)', padding: '4px 6px', borderRadius: 4,
          }}>
            클릭하여 교체
          </span>
        ) : null}
      </button>
      {slot.name ? (
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {slot.name}
        </span>
      ) : null}
    </div>
  );
}

function RegisterPage() {
  const editId = React.useMemo(() => queryEditId(), []);
  const isEdit = !!editId;
  const existingRef = React.useRef(null);
  const [hydrated, setHydrated] = React.useState(!editId);
  const [pdf, setPdf] = React.useState({ name: '', url: '' });
  const [previews, setPreviews] = React.useState([EMPTY_PREVIEW(), EMPTY_PREVIEW()]);
  const [busy, setBusy] = React.useState({ pdf: false, img0: false, img1: false, save: false });
  const [form, setForm] = React.useState({ title: '', artist: '', genre: D.genres[0], level: D.levels[1], pages: '', price: '', orig: '', status: '판매중', preview: '2페이지', popular: false, youtubeUrl: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const requiredPreviews = previewRangeCount(form.preview);
  const filledPreviewCount = previews
    .slice(0, requiredPreviews)
    .filter((p) => p.url || isImgSrc(p.thumb)).length;
  const imgBusy = busy.img0 || (requiredPreviews > 1 && busy.img1);
  const canSave = hydrated
    && pdf.url
    && form.title.trim()
    && form.artist.trim()
    && form.price
    && filledPreviewCount >= requiredPreviews
    && !busy.pdf
    && !imgBusy
    && !busy.save;

  React.useEffect(() => () => {
    previews.forEach(revokeThumb);
  }, []);

  React.useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      try {
        if (window.ChodrumAPI && window.ChodrumAPI.ready) await window.ChodrumAPI.ready;
      } catch (_) { /* ignore */ }
      if (cancelled) return;
      const s = D.byId(editId);
      if (!s) {
        B.toast('해당 악보를 찾을 수 없어요');
        setHydrated(true);
        return;
      }
      existingRef.current = s;
      const urls = Array.isArray(s.previewUrls) && s.previewUrls.length
        ? s.previewUrls.filter(Boolean).slice(0, 2)
        : (s.previewUrl ? [s.previewUrl] : []);
      let slots = [EMPTY_PREVIEW(), EMPTY_PREVIEW()];
      try {
        const resolved = window.ChodrumAPI && window.ChodrumAPI.sheets.resolvePreviewDisplays
          ? await window.ChodrumAPI.sheets.resolvePreviewDisplays(urls)
          : urls.map((u) => ({ path: u, displayUrl: isImgSrc(u) ? u : '' }));
        slots = [
          resolved[0]
            ? { name: fileNameFromUrl(resolved[0].path || urls[0]), url: resolved[0].path || urls[0], thumb: resolved[0].displayUrl || '' }
            : EMPTY_PREVIEW(),
          resolved[1]
            ? { name: fileNameFromUrl(resolved[1].path || urls[1]), url: resolved[1].path || urls[1], thumb: resolved[1].displayUrl || '' }
            : EMPTY_PREVIEW(),
        ];
      } catch (e) {
        console.warn(e);
        slots = [
          urls[0] ? { name: fileNameFromUrl(urls[0]), url: urls[0], thumb: isImgSrc(urls[0]) ? urls[0] : '' } : EMPTY_PREVIEW(),
          urls[1] ? { name: fileNameFromUrl(urls[1]), url: urls[1], thumb: isImgSrc(urls[1]) ? urls[1] : '' } : EMPTY_PREVIEW(),
        ];
      }
      if (cancelled) return;
      const pdfPath = (window.ChodrumAPI && window.ChodrumAPI.sheets.storagePath)
        ? (window.ChodrumAPI.sheets.storagePath(s.pdfUrl, 'pdf') || s.pdfUrl || '')
        : (s.pdfUrl || '');
      setPdf({
        name: fileNameFromUrl(pdfPath) || (pdfPath ? '등록된 PDF' : ''),
        url: pdfPath,
      });
      setPreviews(slots);
      const filled = slots.filter((p) => p.url).length;
      const previewCount = filled >= 2 ? '2페이지' : (filled === 1 ? '1페이지' : '2페이지');
      setForm({
        title: s.title || '',
        artist: s.artist || '',
        genre: s.genre || D.genres[0],
        level: s.level || D.levels[1],
        pages: s.pages != null ? String(s.pages) : '',
        price: s.price != null ? String(s.price) : '',
        orig: s.orig != null ? String(s.orig) : '',
        status: s.status || '판매중',
        preview: previewCount,
        popular: !!s.popular,
        youtubeUrl: s.youtubeUrl || '',
      });
      setHydrated(true);
      document.title = 'CHODRUM Admin — 악보 수정';
    })();
    return () => { cancelled = true; };
  }, [editId]);

  const pickPdf = async (file) => {
    setBusy((b) => ({ ...b, pdf: true }));
    try {
      const r = await window.ChodrumAPI.sheets.uploadFile(file, 'pdf');
      setPdf({ name: r.name || file.name, url: r.path || r.url });
      B.toast(isEdit ? 'PDF 원본을 교체했어요' : 'PDF 원본을 올렸어요');
    } catch (e) {
      console.warn(e);
      B.toast((e && e.message) || 'PDF 업로드에 실패했어요');
    } finally {
      setBusy((b) => ({ ...b, pdf: false }));
    }
  };

  const pickPreview = (index) => async (file) => {
    const key = index === 0 ? 'img0' : 'img1';
    setBusy((b) => ({ ...b, [key]: true }));
    try {
      const r = await window.ChodrumAPI.sheets.uploadFile(file, 'preview');
      const storePath = r.path || r.url || '';
      const thumb = r.signedUrl || (isImgSrc(r.url) ? r.url : '');
      setPreviews((prev) => {
        const next = prev.slice();
        revokeThumb(next[index]);
        /* url = storage path for DB; thumb = signed/blob URL for <img> */
        next[index] = { name: r.name || file.name, url: storePath, thumb: thumb };
        return next;
      });
      B.toast('미리보기 ' + (index + 1) + '페이지를 올렸어요 (상단 일부만 공개)');
    } catch (e) {
      console.warn(e);
      B.toast((e && e.message) || '이미지 업로드에 실패했어요');
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
    B.toast('미리보기 ' + (index + 1) + '페이지를 삭제했어요');
  };

  const save = async () => {
    if (!canSave) return;
    if (filledPreviewCount < requiredPreviews) {
      B.toast('미리보기 이미지를 ' + requiredPreviews + '장 올려 주세요');
      return;
    }
    setBusy((b) => ({ ...b, save: true }));
    const previewUrls = previews
      .slice(0, requiredPreviews)
      .map((p) => p.url)
      .filter(Boolean);
    const prev = existingRef.current || {};
    const sheet = {
      id: isEdit ? editId : ('s' + Date.now()),
      code: prev.code || undefined,
      title: form.title.trim(),
      artist: form.artist.trim(),
      genre: form.genre,
      level: form.level,
      pages: Number(form.pages) || 0,
      price: Number(form.price) || 0,
      orig: form.orig ? Number(form.orig) : undefined,
      status: form.status,
      popular: !!form.popular,
      isNew: isEdit ? !!prev.isNew : true,
      rating: isEdit ? (prev.rating || 0) : 0,
      sold: isEdit ? (prev.sold || 0) : 0,
      pdfUrl: pdf.url,
      previewUrl: previewUrls[0] || '',
      previewUrls: previewUrls,
      youtubeUrl: (form.youtubeUrl || '').trim(),
    };
    try {
      const mapped = await window.ChodrumAPI.sheets.upsert(sheet);
      if (mapped && mapped._warn) {
        B.toast(mapped._warn);
        setBusy((b) => ({ ...b, save: false }));
        return;
      }
      B.toast(isEdit
        ? '「' + form.title + '」 악보를 저장했어요'
        : '「' + form.title + '」 악보가 등록되었어요');
      setTimeout(() => location.href = '/bo/sheets', 900);
    } catch (e) {
      console.warn(e);
      B.toast((e && e.message) || (isEdit ? '저장 실패 — Supabase 연결을 확인하세요' : '등록 실패 — Supabase 연결을 확인하세요'));
      setBusy((b) => ({ ...b, save: false }));
    }
  };

  const rangePreviews = previews.slice(0, requiredPreviews);
  const filledPreviews = rangePreviews.filter((p) => p.url || isImgSrc(p.thumb));
  const pageTitle = isEdit ? '악보 수정' : '악보 등록';
  const saveLabel = busy.save
    ? (isEdit ? '저장 중…' : '등록 중…')
    : (isEdit ? '저장하기' : '등록하기');
  const previewHint = requiredPreviews + '장 필요 · 상단 일부만 공개되도록 처리돼요';

  return (
    <B.Shell active={isEdit ? 'sheets' : 'register'} title={pageTitle}
      actions={<Button variant="ghost" size="sm" iconLeft="chevron-left" onClick={() => location.href = '/bo/sheets'}>목록으로</Button>}>
      <div data-screen-label={isEdit ? 'BO-02-01 악보 수정' : 'BO-02-01 악보 등록'} className="bo-form-cols">
        {/* 파일 업로드 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding={18} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>원본 파일</span>
            <FileDrop
              icon="upload"
              title="PDF 원본 업로드"
              sub="구매자에게 제공되는 파일 · PDF만 가능"
              accept="application/pdf,.pdf"
              fileName={pdf.name}
              uploading={busy.pdf}
              onFile={pickPdf}
            />
          </Card>
          <Card padding={18} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>미리보기 이미지</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{previewHint}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: requiredPreviews > 1 ? '1fr 1fr' : '1fr', gap: 12 }}>
              {rangePreviews.map((_, i) => (
                <PreviewSlot
                  key={i}
                  page={i + 1}
                  slot={previews[i]}
                  uploading={busy[i === 0 ? 'img0' : 'img1']}
                  onFile={pickPreview(i)}
                  onClear={() => clearPreview(i)}
                />
              ))}
            </div>
          </Card>
          <Card padding={18} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>미리보기 확인</span>
            {filledPreviews.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: filledPreviews.length > 1 ? '1fr 1fr' : '1fr', gap: 10 }}>
                {rangePreviews.map((p, i) => {
                  const src = isImgSrc(p.thumb) ? p.thumb : (isImgSrc(p.url) ? p.url : '');
                  if (!src) return null;
                  return (
                    <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)', position: 'relative', background: '#f6f6f6', aspectRatio: '5 / 6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={src}
                        alt={'미리보기 ' + (i + 1) + '페이지'}
                        style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-16deg)', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, letterSpacing: 2, color: 'rgba(0,0,0,0.06)', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 2 }}>PREVIEW</div>
                      <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 3, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.92)', padding: '2px 6px', borderRadius: 4 }}>{i + 1}페이지</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)', position: 'relative', background: '#f6f6f6', aspectRatio: '5 / 6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 15px, #e7e7e7 15px 16px)', backgroundPosition: '0 14px' }}></div>
                <Icon name="music" size={40} style={{ color: '#cccccc', position: 'relative' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-16deg)', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, letterSpacing: 3, color: 'rgba(0,0,0,0.06)', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 2 }}>PREVIEW</div>
              </div>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {filledPreviews.length
                ? '업로드한 ' + filledPreviews.length + '장이 스토어 상세에 노출돼요. 하단은 가려져 전체 악보가 보이지 않아요.'
                : '스토어 상세에 노출돼요. 하단 가림 + 은은한 워터마크로 일부만 보이게 처리됩니다. (' + requiredPreviews + '장 필요)'}
            </span>
          </Card>
        </div>

        {/* 정보 입력 */}
        <Card padding={18} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>악보 정보</span>
          <Input label="곡명" placeholder="예: Snare Groove No.8" value={form.title} onChange={set('title')} />
          <Input label="아티스트" placeholder="예: The Metronomes" value={form.artist} onChange={set('artist')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <B.Labeled label="장르"><Select value={form.genre} onChange={set('genre')} options={D.genres} /></B.Labeled>
            <B.Labeled label="난이도"><Select value={form.level} onChange={set('level')} options={D.levels} /></B.Labeled>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="페이지 수" type="number" placeholder="6" value={form.pages} onChange={set('pages')} />
            <B.Labeled label="미리보기 범위" hint={'올릴 미리보기 이미지 수 · ' + requiredPreviews + '장 필요'}>
              <Select value={form.preview} onChange={set('preview')} options={['1페이지', '2페이지']} />
            </B.Labeled>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="판매가 (₩)" type="number" placeholder="4500" value={form.price} onChange={set('price')} />
            <Input label="정가 (₩ · 선택)" type="number" placeholder="할인 시에만 입력" value={form.orig} onChange={set('orig')} />
          </div>
          <Input
            label="YouTube URL (선택)"
            placeholder="https://www.youtube.com/watch?v=… 또는 youtu.be/…"
            value={form.youtubeUrl}
            onChange={set('youtubeUrl')}
          />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: -6, lineHeight: 1.45 }}>
            스토어 상세에서 클릭 시 페이지 안에서 재생돼요. 비우면 플레이어는 숨겨집니다.
          </span>
          <B.Labeled label="노출 상태" hint="숨김/판매중지 상태는 스토어에 노출되지 않아요.">
            <Select value={form.status} onChange={set('status')} options={['판매중', '판매중지', '숨김']} />
          </B.Labeled>
          <B.Labeled label="노출 옵션" hint="체크하면 홈 「인기 악보」와 목록 「인기순」에 우선 노출돼요.">
            <Checkbox
              checked={!!form.popular}
              onChange={(on) => setForm({ ...form, popular: !!on })}
              label="인기악보"
            />
          </B.Labeled>
          <hr style={{ height: 1, background: 'var(--border-default)', border: 0, margin: '4px 0' }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {!isEdit ? (
              <Button variant="secondary" size="md" onClick={() => B.toast('임시저장했어요')}>임시저장</Button>
            ) : null}
            <Button variant="primary" size="md" iconLeft="check" disabled={!canSave} onClick={save}>
              {saveLabel}
            </Button>
          </div>
        </Card>
      </div>
    </B.Shell>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<RegisterPage />);
});
