-- CHODRUM — members 생년월일 (YYYYMMDD)
-- Run in Supabase SQL Editor after 001~009
--
-- 가입/내정보수정 시 FO가 저장. 아이디 찾기(이름+생년월일)에도 사용.

alter table public.members
  add column if not exists birth text;

comment on column public.members.birth is
  '생년월일 YYYYMMDD (숫자 8자리). Auth user_metadata.birth 와 동기화';

create index if not exists members_name_birth_idx
  on public.members (name, birth)
  where birth is not null and birth <> '';
