-- CHODRUM — orders/downloads: provider-scoped identity (same email ≠ same buyer)
-- Run after 009_member_provider_identity.sql
--
-- Member purchase history must key off auth_user_id (and auth_provider + email),
-- not bare email — Kakao / Naver / email signup are separate accounts.

alter table public.orders
  add column if not exists auth_user_id uuid,
  add column if not exists auth_provider text;

alter table public.downloads
  add column if not exists auth_user_id uuid,
  add column if not exists auth_provider text;

create index if not exists orders_auth_user_id_idx
  on public.orders (auth_user_id)
  where auth_user_id is not null;

create index if not exists orders_provider_email_idx
  on public.orders (auth_provider, lower(email));

create index if not exists downloads_auth_user_id_idx
  on public.downloads (auth_user_id)
  where auth_user_id is not null;

-- Best-effort backfill: only when exactly one members row owns that email
-- (ambiguous same-email multi-provider cases stay null — FO will not share them)
update public.orders o
set
  auth_user_id = m.auth_user_id,
  auth_provider = coalesce(nullif(m.auth_provider, ''), 'email')
from public.members m
where o.is_member = true
  and o.auth_provider is null
  and lower(o.email) = lower(m.email)
  and (
    select count(*)::int
    from public.members m2
    where lower(m2.email) = lower(o.email)
  ) = 1;

update public.downloads d
set
  auth_user_id = o.auth_user_id,
  auth_provider = o.auth_provider
from public.orders o
where d.order_no = o.order_no
  and d.is_member = true
  and d.auth_provider is null
  and o.auth_provider is not null;

comment on column public.orders.auth_user_id is
  'Supabase auth.users.id of the buyer when is_member — null for guests / legacy';
comment on column public.orders.auth_provider is
  'email | kakao | naver | google — scopes member orders; null for guests / legacy';
comment on column public.downloads.auth_user_id is
  'Same identity as orders.auth_user_id for the purchase that granted this download';
comment on column public.downloads.auth_provider is
  'Same identity as orders.auth_provider for the purchase that granted this download';
