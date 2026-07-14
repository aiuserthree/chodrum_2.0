-- CHODRUM — 악보 PDF 원본 · 미리보기 이미지
-- Run in Supabase SQL Editor after 001_init.sql (and 002 if used)
--
-- Adds sheets.pdf_url / preview_url and a public Storage bucket `sheets`
-- with demo anon read/write policies (tighten before production).

-- ---------- columns ----------
alter table public.sheets
  add column if not exists pdf_url text,
  add column if not exists preview_url text;

comment on column public.sheets.pdf_url is '원본 PDF public URL (Storage sheets bucket)';
comment on column public.sheets.preview_url is '워터마크 미리보기 1페이지 URL (호환용 · 복수는 004 preview_urls)';

-- ---------- Storage bucket ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sheets',
  'sheets',
  true,
  52428800, -- 50MB
  array[
    'application/pdf',
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

-- ---------- Storage policies (demo) ----------
drop policy if exists sheets_storage_select on storage.objects;
drop policy if exists sheets_storage_insert on storage.objects;
drop policy if exists sheets_storage_update on storage.objects;
drop policy if exists sheets_storage_delete on storage.objects;

create policy sheets_storage_select
  on storage.objects for select
  using (bucket_id = 'sheets');

create policy sheets_storage_insert
  on storage.objects for insert
  with check (bucket_id = 'sheets');

create policy sheets_storage_update
  on storage.objects for update
  using (bucket_id = 'sheets')
  with check (bucket_id = 'sheets');

create policy sheets_storage_delete
  on storage.objects for delete
  using (bucket_id = 'sheets');
