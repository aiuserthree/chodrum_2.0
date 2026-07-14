-- CHODRUM — members 약관/개인정보 동의 시각 기록
-- Run in Supabase SQL Editor after 001_init.sql
--
-- 기존 OAuth로 이미 members에 들어간 회원은 동의 완료로 간주(백필).
-- 신규 소셜 가입은 FO 약관 동의 화면에서 값을 채웁니다.

alter table public.members
  add column if not exists terms_agreed_at timestamptz,
  add column if not exists privacy_agreed_at timestamptz,
  add column if not exists marketing_agreed_at timestamptz;

-- 기존 회원: 필수 동의는 가입일로 백필 (재동의 요구 방지)
update public.members
set
  terms_agreed_at = coalesce(terms_agreed_at, joined_at::timestamptz, now()),
  privacy_agreed_at = coalesce(privacy_agreed_at, joined_at::timestamptz, now())
where terms_agreed_at is null
   or privacy_agreed_at is null;
