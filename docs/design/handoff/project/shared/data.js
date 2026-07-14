/* 드럼악보 스토어 — 공용 샘플 데이터 (설계서 기반, 가상의 곡/인물) */
window.DrumData = {
  genres: ['발라드', '락', '재즈', 'K-POP', '메탈', '시티팝', 'CCM'],
  levels: ['입문', '초급', '중급', '고급'],
  sorts: ['인기순', '최신순', '가격순', '이름순'],
  sheets: [
    { id: 's1',  title: 'Snare Groove No.7',   artist: 'The Metronomes', genre: '락',     level: '중급', pages: 6, price: 4500,             popular: true,  isNew: false, rating: 4.8, sold: 1240 },
    { id: 's2',  title: '한여름 밤의 셔플',        artist: '팔로우비트',       genre: '시티팝', level: '초급', pages: 4, price: 3500,             popular: true,  isNew: false, rating: 4.6, sold: 980 },
    { id: 's3',  title: 'Double Kick Study',    artist: 'IRONHAND',       genre: '메탈',   level: '고급', pages: 9, price: 6000,             popular: false, isNew: true,  rating: 4.9, sold: 420 },
    { id: 's4',  title: '너에게 닿기를',           artist: '오후세시',         genre: '발라드', level: '입문', pages: 3, price: 3000,             popular: false, isNew: true,  rating: 4.7, sold: 350 },
    { id: 's5',  title: 'Ghost Note Basics',    artist: 'The Metronomes', genre: '재즈',   level: '중급', pages: 5, price: 4000,             popular: true,  isNew: false, rating: 4.5, sold: 760 },
    { id: 's6',  title: '시티 나이트 드라이브',     artist: 'Neon Kits',      genre: '시티팝', level: '중급', pages: 6, price: 4500,             popular: false, isNew: false, rating: 4.4, sold: 610 },
    { id: 's7',  title: '예배를 위한 브러시',       artist: 'Grace Session',  genre: 'CCM',    level: '초급', pages: 4, price: 3500,             popular: false, isNew: true,  rating: 4.8, sold: 290 },
    { id: 's8',  title: 'Blast Beat 101',       artist: 'IRONHAND',       genre: '메탈',   level: '고급', pages: 8, price: 5500,             popular: false, isNew: false, rating: 4.6, sold: 540 },
    { id: 's9',  title: '봄, 첫 박자',            artist: '오후세시',         genre: 'K-POP',  level: '입문', pages: 3, price: 3000,             popular: true,  isNew: false, rating: 4.9, sold: 1520 },
    { id: 's10', title: 'Linear Fill Workbook', artist: 'The Metronomes', genre: '락',     level: '고급', pages: 7, price: 5000, orig: 6000, popular: false, isNew: true,  rating: 4.7, sold: 180 },
    { id: 's11', title: '새벽 두 시의 왈츠',       artist: '팔로우비트',       genre: '재즈',   level: '초급', pages: 4, price: 3500,             popular: false, isNew: false, rating: 4.3, sold: 330 },
    { id: 's12', title: '롤러코스터 러브',         artist: 'Neon Kits',      genre: 'K-POP',  level: '중급', pages: 5, price: 4000,             popular: true,  isNew: false, rating: 4.6, sold: 890 },
  ],
  recommended: ['s10', 's1', 's9', 's5'],   /* BO 배너/추천 설정 큐레이션 */
  banner: { sheetId: 's10', label: '이달의 추천', title: 'Linear Fill Workbook', copy: '리니어 필인 집중 연습 — 이번 달 한정 할인가로 만나보세요.' },
  /* 마이페이지 구매내역 샘플 (dday = 다운로드 잔여일, 음수 = 만료) */
  purchasesSample: [
    { id: 's1', orderNo: 'ORD-20260712-0311', date: '2026.07.12', dday: 6 },
    { id: 's5', orderNo: 'ORD-20260709-0207', date: '2026.07.09', dday: 3 },
    { id: 's2', orderNo: 'ORD-20260707-0141', date: '2026.07.07', dday: 1 },
    { id: 's8', orderNo: 'ORD-20260628-0096', date: '2026.06.28', dday: -8 },
  ],
  /* 비회원 주문 조회 샘플 (데모 이메일) */
  guestSampleEmail: 'guest@example.com',
  guestSampleOrders: [
    { orderNo: 'ORD-20260711-0288', date: '2026.07.11', items: [{ id: 's3', dday: 5 }, { id: 's9', dday: 5 }] },
    { orderNo: 'ORD-20260701-0102', date: '2026.07.01', items: [{ id: 's2', dday: -5 }] },
  ],
};

/* ---------------- BO(관리자) 샘플 데이터 ---------------- */
window.AdminData = {
  statsByPeriod: {
    '일': [
      { k: '매출',     v: 428000, unit: '₩', delta: 12.4, ic: 'banknote' },
      { k: '주문',     v: 37,     unit: '건', delta: 8,    ic: 'receipt' },
      { k: '신규 회원', v: 12,     unit: '명', delta: 3,    ic: 'user-plus' },
      { k: '다운로드',  v: 154,    unit: '회', delta: -2.1, ic: 'download' },
    ],
    '주': [
      { k: '매출',     v: 2930000, unit: '₩', delta: 6.8, ic: 'banknote' },
      { k: '주문',     v: 241,     unit: '건', delta: 4,   ic: 'receipt' },
      { k: '신규 회원', v: 68,      unit: '명', delta: 11,  ic: 'user-plus' },
      { k: '다운로드',  v: 1043,    unit: '회', delta: 5.2, ic: 'download' },
    ],
    '월': [
      { k: '매출',     v: 12480000, unit: '₩', delta: 9.1, ic: 'banknote' },
      { k: '주문',     v: 1027,     unit: '건', delta: 7,   ic: 'receipt' },
      { k: '신규 회원', v: 294,      unit: '명', delta: -1.4, ic: 'user-plus' },
      { k: '다운로드',  v: 4380,     unit: '회', delta: 3.9, ic: 'download' },
    ],
  },
  revenue: {
    '일': [{ d: '월', v: 312 }, { d: '화', v: 388 }, { d: '수', v: 274 }, { d: '목', v: 420 }, { d: '금', v: 512 }, { d: '토', v: 596 }, { d: '일', v: 428 }],
    '주': [{ d: 'W23', v: 214 }, { d: 'W24', v: 246 }, { d: 'W25', v: 232 }, { d: 'W26', v: 275 }, { d: 'W27', v: 261 }, { d: 'W28', v: 293 }],
    '월': [{ d: '2월', v: 842 }, { d: '3월', v: 918 }, { d: '4월', v: 1004 }, { d: '5월', v: 1126 }, { d: '6월', v: 1187 }, { d: '7월', v: 1248 }],
  },
  sheetStatus: { s4: '숨김', s11: '판매중지' }, /* 나머지는 판매중 */
  orders: [
    { no: 'ORD-20260713-0042', buyer: '김드럼', email: 'kim@example.com',   member: true,  items: [{ id: 's1', qty: 1 }, { id: 's5', qty: 1 }], method: '카카오페이', status: '결제완료', date: '07.13 14:22' },
    { no: 'ORD-20260713-0041', buyer: '(비회원)', email: 'guest82@gmail.com', member: false, items: [{ id: 's3', qty: 1 }],                       method: '신용카드',  status: '결제완료', date: '07.13 13:58' },
    { no: 'ORD-20260713-0040', buyer: '이비트', email: 'lee@naver.com',     member: true,  items: [{ id: 's9', qty: 1 }],                       method: '네이버페이', status: '환불',     date: '07.13 12:30' },
    { no: 'ORD-20260713-0039', buyer: '박리듬', email: 'park@gmail.com',    member: true,  items: [{ id: 's5', qty: 1 }, { id: 's2', qty: 2 }], method: '신용카드',  status: '결제완료', date: '07.13 11:04' },
    { no: 'ORD-20260713-0038', buyer: '(비회원)', email: 'drummer@daum.net',  member: false, items: [{ id: 's2', qty: 1 }],                       method: '계좌이체',  status: '대기',     date: '07.13 10:41' },
    { no: 'ORD-20260712-0037', buyer: '최스틱', email: 'choi@kakao.com',    member: true,  items: [{ id: 's8', qty: 1 }],                       method: '카카오페이', status: '결제완료', date: '07.12 22:15' },
    { no: 'ORD-20260712-0036', buyer: '정박자', email: 'jung@example.com',  member: true,  items: [{ id: 's12', qty: 1 }],                      method: '신용카드',  status: '취소',     date: '07.12 18:03' },
    { no: 'ORD-20260712-0035', buyer: '(비회원)', email: 'sticks@naver.com',  member: false, items: [{ id: 's10', qty: 1 }],                      method: '네이버페이', status: '결제완료', date: '07.12 09:47' },
  ],
  members: [
    { name: '김드럼', email: 'kim@example.com',  type: '이메일', joined: '2026.05.02', orders: 8,  status: '정상' },
    { name: '이비트', email: 'lee@naver.com',    type: '네이버', joined: '2026.05.18', orders: 3,  status: '정상' },
    { name: '박리듬', email: 'park@gmail.com',   type: '구글',   joined: '2026.06.01', orders: 12, status: '정상' },
    { name: '최스틱', email: 'choi@kakao.com',   type: '카카오', joined: '2026.06.20', orders: 5,  status: '정상' },
    { name: '정박자', email: 'jung@example.com', type: '이메일', joined: '2026.07.03', orders: 1,  status: '정지' },
    { name: '한리듬', email: 'han@kakao.com',    type: '카카오', joined: '2026.07.10', orders: 0,  status: '탈퇴' },
  ],
  downloads: [
    { at: '07.13 14:30', email: 'kim@example.com',   member: true,  sheetId: 's1',  orderNo: 'ORD-20260713-0042', status: 'ACTIVE',  dday: 7 },
    { at: '07.13 14:02', email: 'guest82@gmail.com', member: false, sheetId: 's3',  orderNo: 'ORD-20260713-0041', status: 'ACTIVE',  dday: 7 },
    { at: '07.12 22:20', email: 'choi@kakao.com',    member: true,  sheetId: 's8',  orderNo: 'ORD-20260712-0037', status: 'ACTIVE',  dday: 6 },
    { at: '07.12 09:50', email: 'sticks@naver.com',  member: false, sheetId: 's10', orderNo: 'ORD-20260712-0035', status: 'ACTIVE',  dday: 6 },
    { at: '07.09 11:12', email: 'park@gmail.com',    member: true,  sheetId: 's5',  orderNo: 'ORD-20260709-0207', status: 'ACTIVE',  dday: 3 },
    { at: '07.04 16:45', email: 'kim@example.com',   member: true,  sheetId: 's2',  orderNo: 'ORD-20260704-0118', status: 'EXPIRED', dday: -2 },
    { at: '06.28 10:05', email: 'lee@naver.com',     member: true,  sheetId: 's9',  orderNo: 'ORD-20260628-0096', status: 'REVOKED', dday: null },
    { at: '06.25 20:31', email: 'drummer@daum.net',  member: false, sheetId: 's6',  orderNo: 'ORD-20260625-0071', status: 'EXPIRED', dday: -11 },
  ],
  joinDist: [{ type: '이메일', n: 412 }, { type: '카카오', n: 308 }, { type: '네이버', n: 191 }, { type: '구글', n: 154 }],
  banners: [
    { title: '여름맞이 신곡 라인업', period: '07.01 – 07.31', on: true },
    { title: '입문자 추천 악보 모음', period: '상시', on: true },
    { title: '가을 세션 준비 기획전', period: '09.01 – 09.30', on: false },
  ],
  terms: [
    { name: '이용약관', ver: 'v1.2', date: '2026.05.01' },
    { name: '개인정보 처리방침', ver: 'v2.0', date: '2026.06.15' },
    { name: '디지털 콘텐츠 환불 정책', ver: 'v1.1', date: '2026.04.10' },
  ],
  emailTemplates: [
    { k: '인증코드 발송', d: '회원가입 · 비회원 주문 조회 인증' },
    { k: '결제 완료 안내', d: '주문 내역 + 다운로드 안내' },
    { k: '다운로드 만료 임박 (D-1)', d: '만료 하루 전 리마인드' },
    { k: '환불 완료 안내', d: '환불 처리 + 권한 회수 고지' },
  ],
};

/* 공용 헬퍼 */
window.DrumData.byId = function (id) { return window.DrumData.sheets.find(function (s) { return s.id === id; }); };
