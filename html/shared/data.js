/* 드럼악보 스토어 — 공용 데이터 골격 (데모 시드는 비움 · live는 Supabase hydrate) */
window.DrumData = {
  genres: ['OST', '가요', 'CCM', 'POP', 'J-POP'],
  levels: ['입문', '초급', '중급', '고급'],
  sorts: ['인기순', '최신순', '가격순', '이름순'],
  sheets: [],
  recommended: [],
  banner: { sheetId: '', label: '', title: '', copy: '' },
  /* BO-08 홈 배너 (hydrate · saveBanners 가 채움) */
  homeBanners: [],
  purchasesSample: [],
  guestSampleEmail: '',
  guestSampleOrders: [],
};

/* ---------------- BO(관리자) 데이터 골격 ---------------- */
window.AdminData = {
  statsByPeriod: {
    '일': [],
    '주': [],
    '월': [],
  },
  revenue: {
    '일': [],
    '주': [],
    '월': [],
  },
  sheetStatus: {},
  orders: [],
  members: [],
  downloads: [],
  joinDist: [],
  banners: [],
  /* terms: legal-docs.js 가 AdminData.terms 를 채움 (이용약관·개인정보·마케팅 v1.0) */
  terms: [],
  emailTemplates: [],
};

/* 공용 헬퍼 */
window.DrumData.byId = function (id) {
  var key = id == null ? '' : String(id);
  return window.DrumData.sheets.find(function (s) { return String(s.id) === key; });
};
window.DrumData.visibleSheets = function () {
  return window.DrumData.sheets.filter(function (s) {
    var st = s.status || (window.AdminData && window.AdminData.sheetStatus && window.AdminData.sheetStatus[s.id]) || '판매중';
    return st === '판매중';
  });
};

/** period: "상시" | "MM.DD – MM.DD" — 오늘이 구간에 있으면 true */
window.DrumData.bannerInPeriod = function (period) {
  if (!period || period === '상시') return true;
  var m = String(period).match(/^(\d{2})\.(\d{2})\s*[–\-]\s*(\d{2})\.(\d{2})$/);
  if (!m) return true;
  var now = new Date();
  var y = now.getFullYear();
  var start = new Date(y, Number(m[1]) - 1, Number(m[2]), 0, 0, 0, 0);
  var end = new Date(y, Number(m[3]) - 1, Number(m[4]), 23, 59, 59, 999);
  var t = now.getTime();
  if (end.getTime() < start.getTime()) {
    return t >= start.getTime() || t <= end.getTime();
  }
  return t >= start.getTime() && t <= end.getTime();
};

/** 홈에 노출할 배너 (on + 기간 유효) — imgUrl / image_url · imgUrlMobile / image_url_mobile · sheetId 허용 */
window.DrumData.activeHomeBanners = function () {
  var list = window.DrumData.homeBanners;
  if (!list || !list.length) {
    list = (window.AdminData && window.AdminData.banners) || [];
  }
  return list.filter(function (b) {
    if (!b) return false;
    var on = b.on == null ? !!b.is_on : !!b.on;
    if (!on) return false;
    if (!window.DrumData.bannerInPeriod(b.period)) return false;
    /* normalize image / sheet fields for FO render */
    if (!b.imgUrl && b.image_url) b.imgUrl = b.image_url;
    if (!b.imgUrlMobile && b.image_url_mobile) b.imgUrlMobile = b.image_url_mobile;
    if (!b.sheetId && b.sheet_id) b.sheetId = b.sheet_id;
    return true;
  });
};
/* 로컬 데모에도 status 필드 부여 */
(function () {
  var A = window.AdminData;
  if (!A || !window.DrumData.sheets) return;
  window.DrumData.sheets.forEach(function (s) {
    if (!s.status) s.status = (A.sheetStatus && A.sheetStatus[s.id]) || '판매중';
  });
})();
