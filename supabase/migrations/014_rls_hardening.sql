-- CHODRUM — production RLS (replace demo anon-open policies from 001)
-- Run AFTER 011 + 012 (order identity columns) and preferably 013 (storage).
--
-- Model:
--  • FO catalog (sheets/banners/featured/settings): public read
--  • Sensitive rows (orders/downloads/members): own-only read; privileged writes via
--    service_role (Edge: toss-confirm, sheet-download) or is_admin() JWT
--  • FO may insert pending orders (status=대기) before Toss; paid + downloads = Edge only
--  • BO: Supabase Auth user with app_metadata.role = 'admin'
--
-- Create admin user (Dashboard Auth → Users), then in SQL Editor:
--   update auth.users
--   set raw_app_meta_data =
--     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
--   where email = 'YOUR_ADMIN_EMAIL';

-- ---------- helpers ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- drop demo policies ----------
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in (
        'sheets','featured_sheets','home_promo','banners',
        'orders','order_items','members','downloads','site_settings'
      )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ---------- sheets / catalog (public read, admin write) ----------
create policy sheets_select on public.sheets
  for select using (true);

create policy sheets_admin_write on public.sheets
  for all using (public.is_admin()) with check (public.is_admin());

create policy featured_select on public.featured_sheets
  for select using (true);

create policy featured_admin_write on public.featured_sheets
  for all using (public.is_admin()) with check (public.is_admin());

create policy home_promo_select on public.home_promo
  for select using (true);

create policy home_promo_admin_write on public.home_promo
  for all using (public.is_admin()) with check (public.is_admin());

create policy banners_select on public.banners
  for select using (true);

create policy banners_admin_write on public.banners
  for all using (public.is_admin()) with check (public.is_admin());

create policy settings_select on public.site_settings
  for select using (true);

create policy settings_admin_write on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- orders ----------
-- Admin: full access
create policy orders_admin_all on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- Member: read own (by auth_user_id), plus email-member legacy null-provider rows
create policy orders_select_own on public.orders
  for select using (
    auth.uid() is not null
    and (
      (auth_user_id is not null and auth_user_id = auth.uid())
      or (
        /* Legacy email-password rows before 011 backfill */
        is_member = true
        and auth_user_id is null
        and (auth_provider is null or auth_provider = '' or auth_provider = 'email')
        and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
    )
  );

-- FO: create pending checkout rows only (paid status only via service_role / Edge)
create policy orders_insert_pending on public.orders
  for insert
  with check (status = '대기');

-- ---------- order_items ----------
create policy order_items_admin_all on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy order_items_select_own on public.order_items
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.auth_user_id is not null
        and o.auth_user_id = auth.uid()
    )
  );

create policy order_items_insert_pending on public.order_items
  for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.status = '대기'
    )
  );

-- ---------- downloads ----------
create policy downloads_admin_all on public.downloads
  for all using (public.is_admin()) with check (public.is_admin());

create policy downloads_select_own on public.downloads
  for select using (
    auth.uid() is not null
    and (
      (auth_user_id is not null and auth_user_id = auth.uid())
      or (
        is_member = true
        and auth_user_id is null
        and (auth_provider is null or auth_provider = '' or auth_provider = 'email')
        and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
    )
  );

-- No anon/authenticated INSERT/UPDATE — Edge (service_role) only

-- ---------- members ----------
create policy members_admin_all on public.members
  for all using (public.is_admin()) with check (public.is_admin());

create policy members_select_own on public.members
  for select using (
    auth.uid() is not null
    and (
      auth_user_id = auth.uid()
      or (
        auth_user_id is null
        and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
    )
  );

create policy members_insert_own on public.members
  for insert
  with check (
    auth.uid() is not null
    and auth_user_id = auth.uid()
  );

create policy members_update_own on public.members
  for update
  using (
    auth.uid() is not null
    and auth_user_id = auth.uid()
  )
  with check (
    auth.uid() is not null
    and auth_user_id = auth.uid()
  );

-- ---------- guest order lookup (email) — security definer, no open table select ----------
create or replace function public.lookup_guest_orders(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if p_email is null or length(trim(p_email)) < 3 or position('@' in p_email) < 2 then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(row_to_json(x)::jsonb), '[]'::jsonb)
  into result
  from (
    select
      o.order_no,
      o.created_at,
      o.total,
      o.status,
      coalesce(
        (
          select jsonb_agg(jsonb_build_object(
            'sheet_id', oi.sheet_id,
            'qty', oi.qty,
            'price', oi.price,
            'status', d.status,
            'expires_at', d.expires_at
          ))
          from public.order_items oi
          left join public.downloads d
            on d.order_no = o.order_no and d.sheet_id = oi.sheet_id
          where oi.order_id = o.id
        ),
        '[]'::jsonb
      ) as items
    from public.orders o
    where o.is_member = false
      and lower(o.email) = lower(trim(p_email))
      and o.status = '결제완료'
    order by o.created_at desc
    limit 50
  ) x;

  return result;
end;
$$;

revoke all on function public.lookup_guest_orders(text) from public;
grant execute on function public.lookup_guest_orders(text) to anon, authenticated;
