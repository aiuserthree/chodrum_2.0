/* BO-08 메인 관리 > 배너 관리 — 홈 배너 목록 · 노출 전환 · 배너 추가/수정/삭제 */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Button, IconButton, Card, Badge, Input, Checkbox, Icon } = DS;
const B = window.BO;
const A = window.AdminData;
const D = window.DrumData;

const EMPTY_FORM = { title: '', link: '', start: '', end: '', img: '', imgUrl: '', imgMobile: '', imgUrlMobile: '', sheetId: '', on: true };
const BANNER_IMG_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif';
/* FO CSS: PC ~1088×220 (@2x → 2240×440), Mobile ~360×176 (@2x/@3x → 1500×704) */
const BANNER_SIZE_PC = '2240×440px';
const BANNER_SIZE_MOBILE = '1500×704px';
const BANNER_MIN_PC = { w: 1600, h: 300 };
const BANNER_MIN_MOBILE = { w: 750, h: 352 };

function readImageSize(file) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
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

/** YYYY-MM-DD → MM.DD (목록 period 표시용) */
function fmtPeriodDay(iso) {
  if (!iso || iso.length < 10) return iso || '';
  return iso.slice(5, 7) + '.' + iso.slice(8, 10);
}

/** period 문자열("상시" | "MM.DD – MM.DD") → date input용 start/end */
function parsePeriod(period) {
  if (!period || period === '상시') return { start: '', end: '' };
  const m = String(period).match(/^(\d{2})\.(\d{2})\s*[–\-]\s*(\d{2})\.(\d{2})$/);
  if (!m) return { start: '', end: '' };
  const y = new Date().getFullYear();
  return {
    start: y + '-' + m[1] + '-' + m[2],
    end: y + '-' + m[3] + '-' + m[4],
  };
}

function periodFromForm(form) {
  return form.start && form.end
    ? fmtPeriodDay(form.start) + ' – ' + fmtPeriodDay(form.end)
    : '상시';
}

function sheetLabel(s) {
  if (!s) return '';
  return s.title + (s.artist ? ' · ' + s.artist : '');
}

function BannersPage() {
  const [banners, setBanners] = React.useState((A.banners || []).map((b, i) => ({
    ...b,
    id: b.id || ('b' + (i + 1)),
    imgUrl: b.imgUrl || '',
    imgMobile: b.imgMobile || '',
    imgUrlMobile: b.imgUrlMobile || '',
    sheetId: b.sheetId || b.sheet_id || '',
  })));
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editId, setEditId] = React.useState(null);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [sheetQ, setSheetQ] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [uploadSlot, setUploadSlot] = React.useState(null); /* 'pc' | 'mobile' | null */
  const fileRefPc = React.useRef(null);
  const fileRefMobile = React.useRef(null);
  const isEdit = !!editId;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setDate = (k) => (e) => {
    const v = e.target.value;
    if (k === 'start' && form.end && v && form.end < v) {
      setForm({ ...form, start: v, end: v });
    } else {
      setForm({ ...form, [k]: v });
    }
  };
  const canSave = form.title.trim().length > 0 && !uploading;

  const sheets = (D.sheets || []).slice().sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'ko'));
  const sheetFilter = sheetQ.trim().toLowerCase();
  const sheetOptions = sheetFilter
    ? sheets.filter((s) => (s.title + ' ' + (s.artist || '')).toLowerCase().includes(sheetFilter))
    : sheets;
  const selectedSheet = form.sheetId ? D.byId(form.sheetId) : null;

  const pickSheet = (id) => {
    const s = id ? D.byId(id) : null;
    const nextLink = s
      ? ('/detail?id=' + encodeURIComponent(s.id))
      : (form.link && form.link.indexOf('/detail?id=') === 0 ? '' : form.link);
    setForm({ ...form, sheetId: id || '', link: nextLink });
  };

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setSheetQ('');
    setModalOpen(true);
  };

  const openEdit = (b) => {
    const dates = parsePeriod(b.period);
    setEditId(b.id);
    setForm({
      title: b.title || '',
      link: b.link || '',
      start: dates.start,
      end: dates.end,
      img: b.img || '',
      imgUrl: b.imgUrl || '',
      imgMobile: b.imgMobile || '',
      imgUrlMobile: b.imgUrlMobile || '',
      sheetId: b.sheetId || b.sheet_id || '',
      on: !!b.on,
    });
    setSheetQ('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (uploading) return;
    setModalOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setSheetQ('');
    setUploadSlot(null);
  };

  const pickImage = async (file, slot) => {
    if (!file || uploading) return;
    setUploading(true);
    setUploadSlot(slot);
    try {
      /* Upload as-is (no resize/compress). Warn if below retina-friendly size. */
      const dims = await readImageSize(file);
      const min = slot === 'mobile' ? BANNER_MIN_MOBILE : BANNER_MIN_PC;
      const soft = dims && (dims.w < min.w || dims.h < min.h);
      const r = await window.ChodrumAPI.banners.uploadImage(file);
      if (slot === 'mobile') {
        setForm((prev) => ({
          ...prev,
          imgMobile: r.name || file.name,
          imgUrlMobile: r.url || '',
        }));
        B.toast(soft
          ? '올렸어요. 모바일은 ' + BANNER_SIZE_MOBILE + ' 권장 — 작으면 홈에서 흐릿할 수 있어요'
          : '모바일 배너 이미지를 올렸어요');
      } else {
        setForm((prev) => ({
          ...prev,
          img: r.name || file.name,
          imgUrl: r.url || '',
        }));
        B.toast(soft
          ? '올렸어요. PC는 ' + BANNER_SIZE_PC + ' 권장 — 작으면 홈에서 흐릿할 수 있어요'
          : 'PC 배너 이미지를 올렸어요');
      }
    } catch (e) {
      console.warn(e);
      B.toast((e && e.message) || '이미지 업로드에 실패했어요');
    } finally {
      setUploading(false);
      setUploadSlot(null);
    }
  };

  const persist = async (next) => {
    setBanners(next);
    try { await window.ChodrumAPI.banners.save(next); }
    catch (e) { console.warn(e); B.toast('배너 동기화 실패'); }
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
      sheetId: form.sheetId || '',
      on: form.on,
    };
    const next = editing
      ? banners.map((b) => b.id === targetId ? { ...b, ...payload } : b)
      : [{ id: 'b' + Date.now(), ...payload }, ...banners];
    setModalOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setSheetQ('');
    await persist(next);
    B.toast(editing
      ? '배너를 수정했어요'
      : '배너가 추가되었어요 · 홈 최상단에 노출돼요');
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
    B.toast('배너를 삭제했어요');
  };
  const isLiveOnHome = (b) => !!b.on && (!window.DrumData.bannerInPeriod || window.DrumData.bannerInPeriod(b.period));
  const onCount = banners.filter(isLiveOnHome).length;
  const badgeFor = (b) => {
    if (!b.on) return { variant: 'neutral', label: '숨김' };
    if (!isLiveOnHome(b)) return { variant: 'neutral', label: '기간만료' };
    return { variant: 'success', label: '노출중' };
  };

  const renderImgUpload = (slot) => {
    const isPc = slot === 'pc';
    const previewSrc = isPc ? form.imgUrl : form.imgUrlMobile;
    const fileName = isPc ? form.img : form.imgMobile;
    const sizeLabel = isPc ? BANNER_SIZE_PC : BANNER_SIZE_MOBILE;
    const title = isPc ? 'PC 배너 이미지' : '모바일 배너 이미지';
    const busy = uploading && uploadSlot === slot;
    const fileRef = isPc ? fileRefPc : fileRefMobile;
    const height = isPc ? 96 : 120;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
          <span className="ds-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            권장 사이즈: <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{sizeLabel}</strong>
          </span>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current && fileRef.current.click()}
          style={{
            width: '100%',
            padding: previewSrc ? 0 : '20px 16px',
            height: previewSrc ? height : undefined,
            minHeight: previewSrc ? undefined : height,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: previewSrc || fileName ? 'var(--surface-sunken)' : 'var(--surface-card)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-cards)',
            cursor: uploading ? 'wait' : 'pointer',
            overflow: 'hidden',
            position: 'relative',
            opacity: uploading && !busy ? 0.6 : (busy ? 0.75 : 1),
          }}
        >
          {previewSrc && !busy ? (
            <React.Fragment>
              <img
                src={previewSrc}
                alt={title + ' 미리보기'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', position: 'absolute', inset: 0 }}
              />
              <span style={{
                position: 'absolute', bottom: 8, left: 8, right: 8,
                fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)',
                background: 'rgba(255,255,255,0.92)', padding: '4px 8px', borderRadius: 4, textAlign: 'center',
              }}>
                {fileName || '이미지'} · 클릭하여 교체
              </span>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <span style={{ color: fileName ? 'var(--status-success)' : 'var(--color-icon)' }}>
                <Icon name={busy ? 'upload' : (fileName ? 'check' : 'image')} size={22} />
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                {busy ? '업로드 중…' : (fileName || (isPc ? 'PC 이미지 업로드' : '모바일 이미지 업로드'))}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {busy ? '잠시만 기다려 주세요' : (fileName ? '다시 선택하려면 클릭하세요' : 'PNG / JPG / WEBP')}
              </span>
            </React.Fragment>
          )}
        </button>
        {!isPc ? (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.45 }}>
            권장 사이즈: {BANNER_SIZE_MOBILE}. 원본 그대로 저장 · 비우면 FO에서 PC 이미지를 사용해요.
          </p>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.45 }}>
            권장 사이즈: {BANNER_SIZE_PC}. 원본 그대로 저장돼요 (리사이즈·압축 없음).
          </p>
        )}
      </div>
    );
  };

  return (
    <B.Shell active="banners" title="메인 관리 — 배너 관리"
      actions={<Button variant="primary" size="sm" iconLeft="plus" onClick={openAdd}>배너 추가</Button>}>
      <div data-screen-label="BO-08 배너 관리" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card padding={0}>
          <B.CardHead title="홈 배너" right={<span className="ds-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{onCount}개 노출중 / 총 {banners.length}개</span>} />
          <div style={{ padding: '0 18px 16px' }}>
            {banners.length ? banners.map((b, i) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderTop: i ? '1px solid var(--border-default)' : 'none' }}>
                <span className="ds-mono" style={{ width: 18, fontSize: 13, fontWeight: 600, color: i === 0 ? 'var(--color-ink)' : 'var(--text-tertiary)', flex: 'none' }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                  <div className="ds-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {b.period || '상시'}
                  </div>
                </div>
                <Badge variant={badgeFor(b).variant} size="sm">{badgeFor(b).label}</Badge>
                <IconButton name="chevron-up" variant="ghost" size="sm" label="위로" disabled={i === 0} onClick={() => move(i, -1)} />
                <IconButton name="chevron-down" variant="ghost" size="sm" label="아래로" disabled={i === banners.length - 1} onClick={() => move(i, 1)} />
                <IconButton name={b.on ? 'eye-off' : 'eye'} variant="ghost" size="sm" label="노출 전환" onClick={() => toggle(b.id)} />
                <IconButton name="pencil" variant="ghost" size="sm" label="수정" onClick={() => openEdit(b)} />
                <IconButton name="trash-2" variant="ghost" size="sm" label="삭제" onClick={() => remove(b.id)} />
              </div>
            )) : (
              <p style={{ padding: '8px 0 4px', fontSize: 13, color: 'var(--text-secondary)' }}>등록된 배너가 없어요. 우측 상단 배너 추가로 등록해주세요.</p>
            )}
          </div>
        </Card>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>배너는 위에서부터 순서대로 홈에 전폭 이미지로 노출돼요. ▲▼ 버튼으로 순서를 바꿀 수 있어요. PC·모바일 이미지를 따로 올리면 뷰포트에 맞춰 전환되고, 모바일을 비우면 PC 이미지를 사용해요. 연동 악보가 있으면 클릭 시 해당 상세로 이동해요.</p>
      </div>

      {/* 배너 추가 / 수정 모달 */}
      <B.Modal open={modalOpen} onClose={closeModal} title={isEdit ? '배너 수정' : '배너 추가'} width={580}
        footer={
          <React.Fragment>
            <Button variant="secondary" size="sm" disabled={uploading} onClick={closeModal}>취소</Button>
            <Button variant="primary" size="sm" disabled={!canSave} onClick={save}>
              {isEdit ? '저장하기' : '추가하기'}
            </Button>
          </React.Fragment>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="배너 제목 (필수)" placeholder="예: 여름맞이 신곡 라인업" value={form.title} onChange={set('title')} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>연동 악보</div>
            <Input size="sm" iconLeft="search" placeholder="곡명 / 아티스트 검색" value={sheetQ} onChange={(e) => setSheetQ(e.target.value)} />
            <div style={{
              marginTop: 8,
              maxHeight: 168,
              overflowY: 'auto',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-cards)',
              background: 'var(--surface-card)',
            }}>
              <button
                type="button"
                onClick={() => pickSheet('')}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', border: 0, borderBottom: '1px solid var(--border-default)',
                  background: !form.sheetId ? 'var(--surface-sunken)' : 'transparent', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>선택 안 함 (연결 링크 사용)</span>
              </button>
              {sheetOptions.slice(0, 40).map((s) => {
                const on = form.sheetId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickSheet(s.id)}
                    style={{
                      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', border: 0, borderBottom: '1px solid var(--border-default)',
                      background: on ? 'var(--surface-sunken)' : 'transparent', cursor: 'pointer',
                    }}
                  >
                    <B.Thumb />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 13.5, fontWeight: on ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)' }}>{s.artist} · {s.genre}</span>
                    </span>
                    {on ? <Badge variant="solid" size="sm">선택</Badge> : null}
                  </button>
                );
              })}
              {!sheetOptions.length ? (
                <p style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>검색 결과가 없어요.</p>
              ) : null}
            </div>
            {selectedSheet ? (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                클릭 시 이동: <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{sheetLabel(selectedSheet)}</strong>
                {' '}· 연결 링크가 상세로 맞춰져요.
              </p>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>연동 악보를 고르면 홈 배너 클릭 시 해당 악보 상세로 이동해요.</p>
            )}
          </div>
          <Input label="연결 링크" placeholder="예: /list?cat=락 (악보 선택 시 상세로 자동 설정)" value={form.link} onChange={set('link')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="노출 시작일" type="date" value={form.start} onChange={setDate('start')} max={form.end || undefined} />
            <Input label="노출 종료일" type="date" value={form.end} onChange={setDate('end')} min={form.start || undefined} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: -6 }}>달력에서 선택하세요. 기간을 비우면 상시 노출돼요.</p>
          <input
            ref={fileRefPc}
            type="file"
            accept={BANNER_IMG_ACCEPT}
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              e.target.value = '';
              if (f) pickImage(f, 'pc');
            }}
          />
          <input
            ref={fileRefMobile}
            type="file"
            accept={BANNER_IMG_ACCEPT}
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              e.target.value = '';
              if (f) pickImage(f, 'mobile');
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {renderImgUpload('pc')}
            {renderImgUpload('mobile')}
          </div>
          <Checkbox
            checked={form.on}
            onChange={(on) => setForm({ ...form, on })}
            label={isEdit ? '홈에 노출' : '등록 즉시 노출'}
          />
        </div>
      </B.Modal>
    </B.Shell>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<BannersPage />);
});
