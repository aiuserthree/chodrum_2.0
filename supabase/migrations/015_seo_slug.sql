-- CHODRUM — SEO slug + meta columns (Phase 1)
-- Run in Supabase SQL Editor after 014_rls_hardening.sql
--
-- Adds slug (canonical URL), seo_title, seo_description, og_image_path.
-- Slug is auto-generated on INSERT; existing slug is preserved on title/artist UPDATE.

alter table public.sheets
  add column if not exists slug text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists og_image_path text;

comment on column public.sheets.slug is
  'Canonical URL path segment (/sheets/{slug}). Auto-generated; immutable after first set.';
comment on column public.sheets.seo_title is
  'Optional <title> override (null → build template)';
comment on column public.sheets.seo_description is
  'Optional meta description override';
comment on column public.sheets.og_image_path is
  'Storage preview/… path for og:image signing (mirrors preview_urls[1] or preview_url)';

-- ---------- slugify helpers (Korean + Latin) ----------

create or replace function public.slugify_part(raw text)
returns text
language plpgsql
immutable
as $$
declare
  s text;
begin
  s := coalesce(trim(raw), '');
  if s = '' then
    return '';
  end if;
  s := lower(s);
  s := regexp_replace(s, '[\s_\.]+', '-', 'g');
  s := regexp_replace(s, '[^가-힣a-z0-9-]', '', 'g');
  s := regexp_replace(s, '-+', '-', 'g');
  s := trim(both '-' from s);
  return s;
end;
$$;

create or replace function public.generate_sheet_slug(
  p_artist text,
  p_title text,
  p_code text,
  p_id text
)
returns text
language plpgsql
as $$
declare
  base text;
  candidate text;
  n int := 2;
  code_part text;
begin
  base := public.slugify_part(p_artist) || '-' || public.slugify_part(p_title);
  if length(base) < 3 then
    code_part := coalesce(
      public.slugify_part(replace(coalesce(p_code, ''), ' ', '-')),
      ''
    );
    if length(code_part) >= 3 then
      base := 'sheet-' || code_part;
    else
      base := 'sheet-' || coalesce(p_id, 'unknown');
    end if;
  end if;
  base := left(base, 80);
  candidate := base;
  while exists (
    select 1
    from public.sheets
    where slug = candidate
      and (p_id is null or id is distinct from p_id)
  ) loop
    candidate := left(base, 75) || '-' || n::text;
    n := n + 1;
  end loop;
  return candidate;
end;
$$;

-- ---------- trigger: slug (INSERT only) + og_image_path sync ----------

create or replace function public.sheets_set_slug()
returns trigger
language plpgsql
as $$
declare
  preview_path text;
begin
  if tg_op = 'INSERT' or new.slug is null or btrim(new.slug) = '' then
    new.slug := public.generate_sheet_slug(new.artist, new.title, new.code, new.id);
  end if;

  preview_path := null;
  if new.preview_urls is not null and cardinality(new.preview_urls) > 0 then
    preview_path := new.preview_urls[1];
  end if;
  if preview_path is null or btrim(preview_path) = '' then
    preview_path := new.preview_url;
  end if;
  if preview_path is not null and btrim(preview_path) <> '' then
    new.og_image_path := preview_path;
  end if;

  return new;
end;
$$;

drop trigger if exists sheets_set_slug_trg on public.sheets;
create trigger sheets_set_slug_trg
  before insert or update of preview_url, preview_urls
  on public.sheets
  for each row
  execute function public.sheets_set_slug();

-- ---------- backfill existing rows ----------

update public.sheets s
set slug = public.generate_sheet_slug(s.artist, s.title, s.code, s.id)
where s.slug is null or btrim(s.slug) = '';

update public.sheets s
set og_image_path = coalesce(
  case
    when s.preview_urls is not null and cardinality(s.preview_urls) > 0
      then s.preview_urls[1]
    else null
  end,
  s.preview_url
)
where (s.og_image_path is null or btrim(s.og_image_path) = '')
  and (
    (s.preview_urls is not null and cardinality(s.preview_urls) > 0)
    or (s.preview_url is not null and btrim(s.preview_url) <> '')
  );

-- ---------- constraints & indexes ----------

alter table public.sheets
  alter column slug set not null;

create unique index if not exists sheets_slug_unique_idx
  on public.sheets (slug);

create index if not exists sheets_slug_lookup_idx
  on public.sheets (slug)
  where status = '판매중';
