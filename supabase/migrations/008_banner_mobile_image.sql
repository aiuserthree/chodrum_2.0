-- CHODRUM — 배너 모바일 이미지
-- Run in Supabase SQL Editor after 007_banner_sheet_id.sql.
--
-- Idempotent: safe to re-run.
-- Adds banners.image_url_mobile + image_name_mobile so BO can register
-- separate PC (2240×440 retina) and Mobile (1500×704 retina) banner images.
-- FO falls back to image_url when mobile is empty.

alter table public.banners
  add column if not exists image_url_mobile text;

alter table public.banners
  add column if not exists image_name_mobile text not null default '';

comment on column public.banners.image_url is 'PC 배너 이미지 public URL (권장 2240×440 · 표시 ~1088×220 @2x)';
comment on column public.banners.image_name is 'PC 배너 원본 파일명 (표시용)';
comment on column public.banners.image_url_mobile is '모바일 배너 이미지 public URL (권장 1500×704). 비어 있으면 FO가 image_url 사용';
comment on column public.banners.image_name_mobile is '모바일 배너 원본 파일명 (표시용)';
