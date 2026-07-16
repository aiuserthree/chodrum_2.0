-- CHODRUM — fix orders/downloads when the same contact email has multiple members
-- (email + Kakao + Naver). Run in Supabase SQL Editor AFTER 011.
--
-- Problem:
--   011 only backfills when exactly one members row owns the email.
--   Multi-provider emails left orders.auth_provider / auth_user_id NULL.
--   FO previously could still surface those rows for social logins via
--   email fallback / shared localStorage — fixed in api.js / fo-shared /
--   auth.js. This SQL attributes untagged member orders to the
--   email-password member only so Kakao/Naver never inherit them.
--
-- Safe for jhcho5784@naver.com-style triples:
--   • null-provider member orders → email member identity
--   • clears social auth_user_id mistakenly pointing at email-only rows
--     (auth_provider null/email but auth_user_id of kakao/naver member)

-- 1) Untagged member orders → email-password member (multi-provider emails)
--    Always use the email member's auth_user_id (do not keep a stray social uuid).
update public.orders o
set
  auth_provider = 'email',
  auth_user_id = m.auth_user_id
from public.members m
where o.is_member = true
  and (o.auth_provider is null or o.auth_provider = '')
  and lower(o.email) = lower(m.email)
  and coalesce(nullif(m.auth_provider, ''), 'email') = 'email'
  and m.auth_user_id is not null
  and (
    select count(*)::int
    from public.members m2
    where lower(m2.email) = lower(o.email)
  ) > 1;

-- 1b) Multi-provider email but email member has no auth_user_id yet:
--     still mark auth_provider='email' so social FO never claims null rows.
update public.orders o
set auth_provider = 'email'
where o.is_member = true
  and (o.auth_provider is null or o.auth_provider = '')
  and (
    select count(*)::int
    from public.members m2
    where lower(m2.email) = lower(o.email)
  ) > 1
  and exists (
    select 1 from public.members m
    where lower(m.email) = lower(o.email)
      and coalesce(nullif(m.auth_provider, ''), 'email') = 'email'
  );

-- 2) If an untagged/email order was incorrectly given a social auth_user_id,
--    re-point it to the email member (same contact email).
update public.orders o
set
  auth_provider = 'email',
  auth_user_id = m_email.auth_user_id
from public.members m_social
join public.members m_email
  on lower(m_email.email) = lower(m_social.email)
 and coalesce(nullif(m_email.auth_provider, ''), 'email') = 'email'
where o.is_member = true
  and o.auth_user_id = m_social.auth_user_id
  and coalesce(nullif(m_social.auth_provider, ''), 'email') in ('kakao', 'naver', 'google')
  and (o.auth_provider is null or o.auth_provider = '' or o.auth_provider = 'email')
  and m_email.auth_user_id is not null;

-- 3) Sync downloads from corrected orders
update public.downloads d
set
  auth_user_id = o.auth_user_id,
  auth_provider = o.auth_provider
from public.orders o
where d.order_no = o.order_no
  and d.is_member = true
  and o.is_member = true
  and o.auth_provider is not null
  and (
    d.auth_provider is null
    or d.auth_provider is distinct from o.auth_provider
    or d.auth_user_id is distinct from o.auth_user_id
  );

-- 4) Remaining null downloads with multi-provider email → email member
update public.downloads d
set
  auth_provider = 'email',
  auth_user_id = m.auth_user_id
from public.members m
where d.is_member = true
  and (d.auth_provider is null or d.auth_provider = '')
  and lower(d.email) = lower(m.email)
  and coalesce(nullif(m.auth_provider, ''), 'email') = 'email'
  and m.auth_user_id is not null
  and (
    select count(*)::int
    from public.members m2
    where lower(m2.email) = lower(d.email)
  ) > 1;
