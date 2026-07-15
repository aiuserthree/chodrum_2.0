-- CHODRUM — 배너 이미지 Storage
-- Run in Supabase SQL Editor after 001–005 (especially after 003_sheet_files.sql pattern).
--
-- Idempotent: safe to re-run.
-- Adds banners.image_url + public Storage bucket `banners`
-- with demo anon read/write policies (same pattern as sheets in 003).
-- Tighten policies before production.

-- ---------- columns ----------
alter table public.banners
  add column if not exists image_url text;

comment on column public.banners.image_name is '원본 파일명 (표시용)';
comment on column public.banners.image_url is '배너 이미지 public URL (Storage banners bucket)';

-- ---------- Storage bucket ----------
-- Public bucket so getPublicUrl works for FO/BO img tags.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'banners',
  'banners',
  true,
  10485760, -- 10MB
  array[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------- Storage policies (demo · same style as sheets_storage_*) ----------
-- storage.objects already has RLS enabled on hosted Supabase.
drop policy if exists banners_storage_select on storage.objects;
drop policy if exists banners_storage_insert on storage.objects;
drop policy if exists banners_storage_update on storage.objects;
drop policy if exists banners_storage_delete on storage.objects;

create policy banners_storage_select
  on storage.objects for select
  using (bucket_id = 'banners');

create policy banners_storage_insert
  on storage.objects for insert
  with check (bucket_id = 'banners');

create policy banners_storage_update
  on storage.objects for update
  using (bucket_id = 'banners')
  with check (bucket_id = 'banners');

create policy banners_storage_delete
  on storage.objects for delete
  using (bucket_id = 'banners');

-- Verify in Dashboard → Storage: bucket `banners` exists and is Public.
