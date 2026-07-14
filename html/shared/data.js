/* 드럼악보 스토어 — 공용 데이터 골격 (데모 시드는 비움 · live는 Supabase hydrate) */
window.DrumData = {
  genres: ['OST', '가요', 'CCM', 'POP', 'J-POP'],
  levels: ['입문', '초급', '중급', '고급'],
  sorts: ['인기순', '최신순', '가격순', '이름순'],
  sheets: [],
  recommended: [],
  banner: { sheetId: '', label: '', title: '', copy: '' },
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
/* 로컬 데모에도 status 필드 부여 */
(function () {
  var A = window.AdminData;
  if (!A || !window.DrumData.sheets) return;
  window.DrumData.sheets.forEach(function (s) {
    if (!s.status) s.status = (A.sheetStatus && A.sheetStatus[s.id]) || '판매중';
  });
})();
