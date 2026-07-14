-- Seed sample catalog (matches html/shared/data.js)
-- Run AFTER 001_init.sql

truncate public.order_items, public.downloads, public.orders,
  public.featured_sheets, public.banners, public.home_promo,
  public.members, public.sheets, public.site_settings cascade;

insert into public.sheets
  (id, code, title, artist, genre, level, pages, price, orig, popular, is_new, rating, sold, status)
values
  ('s1',  'DS-1042', 'Snare Groove No.7',   'The Metronomes', '락',     '중급', 6, 4500, null, true,  false, 4.8, 1240, '판매중'),
  ('s2',  'DS-1041', '한여름 밤의 셔플',        '팔로우비트',       '시티팝', '초급', 4, 3500, null, true,  false, 4.6, 980,  '판매중'),
  ('s3',  'DS-1040', 'Double Kick Study',    'IRONHAND',       '메탈',   '고급', 9, 6000, null, false, true,  4.9, 420,  '판매중'),
  ('s4',  'DS-1039', '너에게 닿기를',           '오후세시',         '발라드', '입문', 3, 3000, null, false, true,  4.7, 350,  '숨김'),
  ('s5',  'DS-1038', 'Ghost Note Basics',    'The Metronomes', '재즈',   '중급', 5, 4000, null, true,  false, 4.5, 760,  '판매중'),
  ('s6',  'DS-1037', '시티 나이트 드라이브',     'Neon Kits',      '시티팝', '중급', 6, 4500, null, false, false, 4.4, 610,  '판매중'),
  ('s7',  'DS-1036', '예배를 위한 브러시',       'Grace Session',  'CCM',    '초급', 4, 3500, null, false, true,  4.8, 290,  '판매중'),
  ('s8',  'DS-1035', 'Blast Beat 101',       'IRONHAND',       '메탈',   '고급', 8, 5500, null, false, false, 4.6, 540,  '판매중'),
  ('s9',  'DS-1034', '봄, 첫 박자',            '오후세시',         'K-POP',  '입문', 3, 3000, null, true,  false, 4.9, 1520, '판매중'),
  ('s10', 'DS-1033', 'Linear Fill Workbook', 'The Metronomes', '락',     '고급', 7, 5000, 6000, false, true,  4.7, 180,  '판매중'),
  ('s11', 'DS-1032', '새벽 두 시의 왈츠',       '팔로우비트',       '재즈',   '초급', 4, 3500, null, false, false, 4.3, 330,  '판매중지'),
  ('s12', 'DS-1031', '롤러코스터 러브',         'Neon Kits',      'K-POP',  '중급', 5, 4000, null, true,  false, 4.6, 890,  '판매중');

insert into public.featured_sheets (sheet_id, sort_order) values
  ('s10', 0), ('s1', 1), ('s9', 2), ('s5', 3);

insert into public.home_promo (id, sheet_id, label, title, copy) values
  (1, 's10', '이달의 추천', 'Linear Fill Workbook',
   '리니어 필인 집중 연습 — 이번 달 한정 할인가로 만나보세요.');

insert into public.banners (id, title, link, period, image_name, is_on, sort_order) values
  ('b1', '여름맞이 신곡 라인업', '', '07.01 – 07.31', '', true, 0),
  ('b2', '입문자 추천 악보 모음', '', '상시', '', true, 1),
  ('b3', '가을 세션 준비 기획전', '', '09.01 – 09.30', '', false, 2);

insert into public.site_settings (key, value) values
  ('genres', '["발라드","락","재즈","K-POP","메탈","시티팝","CCM"]'::jsonb),
  ('levels', '["입문","초급","중급","고급"]'::jsonb);

insert into public.members (name, email, auth_type, status, orders_count, joined_at) values
  ('김드럼', 'kim@example.com',  '이메일', '정상', 8,  '2026-05-02'),
  ('이비트', 'lee@naver.com',    '네이버', '정상', 3,  '2026-05-18'),
  ('박리듬', 'park@gmail.com',   '구글',   '정상', 12, '2026-06-01'),
  ('최스틱', 'choi@kakao.com',   '카카오', '정상', 5,  '2026-06-20'),
  ('정박자', 'jung@example.com', '이메일', '정지', 1,  '2026-07-03'),
  ('한리듬', 'han@kakao.com',    '카카오', '탈퇴', 0,  '2026-07-10');

-- Sample orders
with o as (
  insert into public.orders (order_no, buyer_name, email, is_member, method, status, total, created_at)
  values
    ('ORD-20260713-0042', '김드럼',   'kim@example.com',   true,  '카카오페이', '결제완료', 8500,  '2026-07-13 14:22:00+09'),
    ('ORD-20260713-0041', '(비회원)', 'guest82@gmail.com', false, '신용카드',  '결제완료', 6000,  '2026-07-13 13:58:00+09'),
    ('ORD-20260713-0040', '이비트',   'lee@naver.com',     true,  '네이버페이', '환불',     3000,  '2026-07-13 12:30:00+09'),
    ('ORD-20260713-0039', '박리듬',   'park@gmail.com',    true,  '신용카드',  '결제완료', 11000, '2026-07-13 11:04:00+09'),
    ('ORD-20260713-0038', '(비회원)', 'drummer@daum.net',  false, '계좌이체',  '대기',     3500,  '2026-07-13 10:41:00+09')
  returning id, order_no
)
insert into public.order_items (order_id, sheet_id, qty, price)
select o.id, x.sheet_id, x.qty, x.price
from o
join (values
  ('ORD-20260713-0042', 's1', 1, 4500),
  ('ORD-20260713-0042', 's5', 1, 4000),
  ('ORD-20260713-0041', 's3', 1, 6000),
  ('ORD-20260713-0040', 's9', 1, 3000),
  ('ORD-20260713-0039', 's5', 1, 4000),
  ('ORD-20260713-0039', 's2', 2, 3500),
  ('ORD-20260713-0038', 's2', 1, 3500)
) as x(order_no, sheet_id, qty, price) on x.order_no = o.order_no;

insert into public.downloads (email, is_member, sheet_id, order_no, status, expires_at, created_at) values
  ('kim@example.com',   true,  's1',  'ORD-20260713-0042', 'ACTIVE',  now() + interval '7 days', '2026-07-13 14:30:00+09'),
  ('guest82@gmail.com', false, 's3',  'ORD-20260713-0041', 'ACTIVE',  now() + interval '7 days', '2026-07-13 14:02:00+09'),
  ('choi@kakao.com',    true,  's8',  'ORD-20260712-0037', 'ACTIVE',  now() + interval '6 days', '2026-07-12 22:20:00+09'),
  ('park@gmail.com',    true,  's5',  'ORD-20260709-0207', 'ACTIVE',  now() + interval '3 days', '2026-07-09 11:12:00+09'),
  ('kim@example.com',   true,  's2',  'ORD-20260704-0118', 'EXPIRED', now() - interval '2 days', '2026-07-04 16:45:00+09'),
  ('lee@naver.com',     true,  's9',  'ORD-20260628-0096', 'REVOKED', null,                    '2026-06-28 10:05:00+09');
