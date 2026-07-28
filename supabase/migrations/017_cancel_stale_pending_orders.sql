-- CHODRUM — stale / sibling pending cleanup
-- Redirect PG: closing Toss without failUrl leaves status=대기 forever.
-- These RPCs let FO cancel only 대기 rows (never 결제완료).

-- 1) Global soft expiry: 대기 older than N minutes → 취소
create or replace function public.cancel_stale_pending_orders(p_older_than_minutes integer default 45)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated int;
  mins int;
begin
  mins := greatest(coalesce(p_older_than_minutes, 45), 5);

  update public.orders
    set status = '취소'
  where status = '대기'
    and created_at < now() - make_interval(mins => mins);

  get diagnostics updated = row_count;
  return updated;
end;
$$;

revoke all on function public.cancel_stale_pending_orders(integer) from public;
grant execute on function public.cancel_stale_pending_orders(integer) to anon, authenticated;

-- 2) Same buyer starting a new checkout: cancel other 대기 for that email
create or replace function public.cancel_sibling_pending_orders(p_email text, p_except_order_no text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated int;
  em text;
begin
  em := lower(trim(coalesce(p_email, '')));
  if em = '' or position('@' in em) < 2 then
    return 0;
  end if;

  update public.orders
    set status = '취소'
  where status = '대기'
    and lower(email) = em
    and (p_except_order_no is null
         or length(trim(p_except_order_no)) = 0
         or order_no <> trim(p_except_order_no));

  get diagnostics updated = row_count;
  return updated;
end;
$$;

revoke all on function public.cancel_sibling_pending_orders(text, text) from public;
grant execute on function public.cancel_sibling_pending_orders(text, text) to anon, authenticated;
