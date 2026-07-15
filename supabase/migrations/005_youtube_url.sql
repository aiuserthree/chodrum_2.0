-- CHODRUM — 악보 연동 YouTube URL
-- Run in Supabase SQL Editor after 004_preview_urls.sql
--
-- Adds sheets.youtube_url for FO detail in-page playback.

alter table public.sheets
  add column if not exists youtube_url text;

comment on column public.sheets.youtube_url is
  '연동 YouTube URL (watch / youtu.be / shorts / embed). FO 상세에서 iframe 재생';
