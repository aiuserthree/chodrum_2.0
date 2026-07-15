-- CHODRUM — members: provider-scoped identity (Kakao ≠ Naver even if email matches)
-- Run in Supabase SQL Editor after 002_member_consent.sql
--
-- Consent / membership is keyed by auth_user_id (and auth_provider + email),
-- so the same contact email can exist once per social provider.

alter table public.members
  add column if not exists auth_user_id uuid,
  add column if not exists auth_provider text;

-- Backfill provider from Korean auth_type labels (best-effort)
update public.members
set auth_provider = case
  when auth_type in ('카카오') then 'kakao'
  when auth_type in ('네이버') then 'naver'
  when auth_type in ('구글') then 'google'
  when auth_type in ('소셜') then 'social'
  else 'email'
end
where auth_provider is null or auth_provider = '';

alter table public.members
  alter column auth_provider set default 'email';

update public.members
set auth_provider = 'email'
where auth_provider is null or auth_provider = '';

-- Drop email-only uniqueness (allows same email across kakao / naver / email)
do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.members'::regclass
    and contype = 'u'
    and pg_get_constraintdef(oid) ilike '%email%';
  if cname is not null then
    execute format('alter table public.members drop constraint %I', cname);
  end if;
end $$;

drop index if exists public.members_email_key;

-- One members row per Auth user (NULL auth_user_id allowed for legacy rows)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.members'::regclass
      and conname = 'members_auth_user_id_key'
  ) then
    alter table public.members
      add constraint members_auth_user_id_key unique (auth_user_id);
  end if;
end $$;

-- Same contact email OK across providers; once per provider
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.members'::regclass
      and conname = 'members_provider_email_key'
  ) then
    alter table public.members
      add constraint members_provider_email_key unique (auth_provider, email);
  end if;
end $$;

create index if not exists members_email_idx
  on public.members (lower(email));

comment on column public.members.auth_user_id is
  'Supabase auth.users.id — primary membership/consent key for OAuth providers';
comment on column public.members.auth_provider is
  'email | kakao | naver | google — Kakao and Naver are never merged by email';
