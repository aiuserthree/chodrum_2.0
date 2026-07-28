-- CHODRUM — FO may mark abandoned checkout rows as 취소
-- Pending orders (status=대기) are inserted before Toss; on fail/cancel the client
-- cannot UPDATE orders under 014 RLS. This security-definer RPC flips 대기 → 취소 only.
-- FO purchase history (purchasesForEmail) already hides non-결제완료 rows; this keeps BO clean.

create or replace function public.cancel_pending_order(p_order_no text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated int;
begin
  if p_order_no is null or length(trim(p_order_no)) < 3 then
    return false;
  end if;

  update public.orders
  set status = '취소'
  where order_no = trim(p_order_no)
    and status = '대기';

  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;

revoke all on function public.cancel_pending_order(text) from public;
grant execute on function public.cancel_pending_order(text) to anon, authenticated;
