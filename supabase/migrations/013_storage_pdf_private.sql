-- CHODRUM — PDF private Storage + tighten sheet/banner upload policies
-- Run AFTER 003_sheet_files.sql (+ 006 for banners).
--
-- Goals:
--  • Paid PDFs (path pdf/*) are NOT publicly downloadable
--  • Preview images (path preview/*) stay readable for FO catalog
--  • Anon cannot upload/overwrite sheets or banners (admin JWT only)
--
-- After running: re-upload is NOT required. Existing pdf/* objects become
-- private with the bucket. FO must use Edge Function sheet-download
-- (signed URL) instead of raw pdf_url.

-- ---------- sheets bucket: private (signed / policy-gated access) ----------
update storage.buckets
set public = false
where id = 'sheets';

-- Drop demo-open storage policies
drop policy if exists sheets_storage_select on storage.objects;
drop policy if exists sheets_storage_insert on storage.objects;
drop policy if exists sheets_storage_update on storage.objects;
drop policy if exists sheets_storage_delete on storage.objects;

-- Preview images: anyone can read (FO <img> via createSignedUrl / download API)
create policy sheets_storage_select_preview
  on storage.objects for select
  using (
    bucket_id = 'sheets'
    and (name like 'preview/%' or name like 'preview%')
  );

-- PDF originals: no anon/authenticated SELECT — service role (Edge) only
-- (service_role bypasses RLS)

-- Writes: admin JWT (app_metadata.role = admin) only
create policy sheets_storage_insert_admin
  on storage.objects for insert
  with check (
    bucket_id = 'sheets'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

create policy sheets_storage_update_admin
  on storage.objects for update
  using (
    bucket_id = 'sheets'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  )
  with check (
    bucket_id = 'sheets'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

create policy sheets_storage_delete_admin
  on storage.objects for delete
  using (
    bucket_id = 'sheets'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

comment on column public.sheets.pdf_url is
  'Storage path (pdf/...) or legacy public URL — FO must not fetch directly; use sheet-download Edge Function';

-- ---------- banners: keep public read for FO <img>, lock writes ----------
drop policy if exists banners_storage_select on storage.objects;
drop policy if exists banners_storage_insert on storage.objects;
drop policy if exists banners_storage_update on storage.objects;
drop policy if exists banners_storage_delete on storage.objects;

-- Public bucket stays public=true (006) so getPublicUrl works for banners
create policy banners_storage_select
  on storage.objects for select
  using (bucket_id = 'banners');

create policy banners_storage_insert_admin
  on storage.objects for insert
  with check (
    bucket_id = 'banners'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

create policy banners_storage_update_admin
  on storage.objects for update
  using (
    bucket_id = 'banners'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  )
  with check (
    bucket_id = 'banners'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

create policy banners_storage_delete_admin
  on storage.objects for delete
  using (
    bucket_id = 'banners'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );
