-- CHODRUM FO ↔ BO schema (drum sheet store)
-- Run in Supabase SQL Editor (or: supabase db push)

create extension if not exists "pgcrypto";

-- ---------- sheets (악보) ----------
create table if not exists public.sheets (
  id text primary key,
  code text,
  title text not null,
  artist text not null,
  genre text not null,
  level text not null,
  pages integer not null default 0,
  price integer not null default 0,
  orig integer,
  popular boolean not null default false,
  is_new boolean not null default false,
  rating numeric(3,1) not null default 0,
  sold integer not null default 0,
  status text not null default '판매중'
    check (status in ('판매중', '판매중지', '숨김')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sheets_status_idx on public.sheets (status);
create index if not exists sheets_genre_idx on public.sheets (genre);

-- ---------- featured (홈 추천 큐레이션) ----------
create table if not exists public.featured_sheets (
  sheet_id text primary key references public.sheets (id) on delete cascade,
  sort_order integer not null default 0
);

-- ---------- home promo (FO 홈 상단 추천 배너 — 악보 1건) ----------
create table if not exists public.home_promo (
  id integer primary key default 1 check (id = 1),
  sheet_id text references public.sheets (id) on delete set null,
  label text not null default '이달의 추천',
  title text not null default '',
  copy text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------- banners (BO 배너 관리) ----------
create table if not exists public.banners (
  id text primary key,
  title text not null,
  link text not null default '',
  period text not null default '상시',
  image_name text not null default '',
  is_on boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  buyer_name text not null,
  email text not null,
  is_member boolean not null default false,
  method text not null default '신용카드',
  status text not null default '결제완료'
    check (status in ('결제완료', '대기', '취소', '환불')),
  total integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists orders_email_idx on public.orders (lower(email));
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  sheet_id text not null references public.sheets (id),
  qty integer not null default 1,
  price integer not null default 0
);

-- ---------- members (BO 회원 목록용 간단 프로필) ----------
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  auth_type text not null default '이메일',
  status text not null default '정상'
    check (status in ('정상', '정지', '탈퇴')),
  orders_count integer not null default 0,
  joined_at date not null default current_date,
  terms_agreed_at timestamptz,
  privacy_agreed_at timestamptz,
  marketing_agreed_at timestamptz
);

-- ---------- downloads (다운로드 권한) ----------
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  is_member boolean not null default false,
  sheet_id text not null references public.sheets (id),
  order_no text not null,
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'EXPIRED', 'REVOKED')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists downloads_email_idx on public.downloads (lower(email));

-- ---------- site_settings (장르/난이도 등) ----------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sheets_updated_at on public.sheets;
create trigger sheets_updated_at
  before update on public.sheets
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS — prototype / local demo
-- Anon key is used from static HTML. Tighten before production
-- (admin auth + role-based policies).
-- ============================================================
alter table public.sheets enable row level security;
alter table public.featured_sheets enable row level security;
alter table public.home_promo enable row level security;
alter table public.banners enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.members enable row level security;
alter table public.downloads enable row level security;
alter table public.site_settings enable row level security;

-- Drop existing demo policies if re-run
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in (
        'sheets','featured_sheets','home_promo','banners',
        'orders','order_items','members','downloads','site_settings'
      )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Public read
create policy sheets_select on public.sheets for select using (true);
create policy featured_select on public.featured_sheets for select using (true);
create policy home_promo_select on public.home_promo for select using (true);
create policy banners_select on public.banners for select using (true);
create policy orders_select on public.orders for select using (true);
create policy order_items_select on public.order_items for select using (true);
create policy members_select on public.members for select using (true);
create policy downloads_select on public.downloads for select using (true);
create policy settings_select on public.site_settings for select using (true);

-- Demo write (BO / FO checkout) — replace with authenticated admin later
create policy sheets_write on public.sheets for all using (true) with check (true);
create policy featured_write on public.featured_sheets for all using (true) with check (true);
create policy home_promo_write on public.home_promo for all using (true) with check (true);
create policy banners_write on public.banners for all using (true) with check (true);
create policy orders_write on public.orders for all using (true) with check (true);
create policy order_items_write on public.order_items for all using (true) with check (true);
create policy members_write on public.members for all using (true) with check (true);
create policy downloads_write on public.downloads for all using (true) with check (true);
create policy settings_write on public.site_settings for all using (true) with check (true);
