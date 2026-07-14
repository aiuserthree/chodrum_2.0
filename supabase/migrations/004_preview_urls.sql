-- CHODRUM — 미리보기 이미지 최대 2장 (1·2페이지)
-- Run in Supabase SQL Editor after 003_sheet_files.sql
--
-- Adds sheets.preview_urls (text[]) while keeping preview_url for compatibility.

alter table public.sheets
  add column if not exists preview_urls text[];

comment on column public.sheets.preview_urls is
  '워터마크 미리보기 이미지 public URL 배열 (최대 2장: 1페이지, 2페이지)';

comment on column public.sheets.preview_url is
  '워터마크 미리보기 1페이지 URL (호환용 · preview_urls[1]과 동기화)';

-- 기존 단일 preview_url → 배열로 백필
update public.sheets
set preview_urls = array[preview_url]
where preview_url is not null
  and preview_url <> ''
  and (preview_urls is null or cardinality(preview_urls) = 0);
