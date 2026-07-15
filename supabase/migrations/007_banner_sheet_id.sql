-- CHODRUM — 배너 ↔ 악보 연동
-- Run in Supabase SQL Editor after 006_banner_images.sql.
--
-- Idempotent: safe to re-run.
-- Adds banners.sheet_id so FO home can show the linked sheet's
-- watermarked thumbnail on the right side of the banner.

alter table public.banners
  add column if not exists sheet_id text references public.sheets (id) on delete set null;

create index if not exists banners_sheet_id_idx on public.banners (sheet_id);

comment on column public.banners.sheet_id is '연동 악보 id (FO 홈 배너 오른쪽 워터마크 썸네일)';
