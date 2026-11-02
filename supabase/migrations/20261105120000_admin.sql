-- P05-01 / P05-05 / P05-06 (S-4, S-10, F-09, F-21): one named admin.
-- "Signed in" is never enough: every admin rule asks is_admin(), which looks the user up in `admins`.
-- Design: documentation/specs/P05-01_05_DESIGN.md. Sign-ups stay off, the owner adds the admin row by hand.

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
revoke all on public.admins from anon, authenticated;
alter table public.admins enable row level security;  -- no policy on purpose: only the owner (DB password) and the secret key reach it

create function public.is_admin() returns boolean
  language sql stable security definer set search_path = ''
  as $$ select exists (select 1 from public.admins where user_id = (select auth.uid())) $$;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- Settings: the admin may change the five values, nothing else (not device_id), and cannot add or remove rows.
grant update (interval_s, temp_offset_c, rh_offset_pct, alert_heat_index_c, alert_quiet_min) on public.settings to authenticated;
create policy "admin update" on public.settings for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create function public.settings_touch() returns trigger
  language plpgsql set search_path = ''
  as $$ begin new.updated_at := now(); return new; end $$;
create trigger settings_touch before update on public.settings
  for each row execute function public.settings_touch();

-- Room (F-21): a function and not a direct update, because `devices` holds key_hash and is not readable by users.
-- Old readings keep their room (ingest_reading copies devices.room onto each new reading).
create function public.admin_set_room(p_device uuid, p_room text) returns void
  language plpgsql security definer set search_path = ''
  as $$
declare
  v_room text := btrim(coalesce(p_room, ''));
begin
  if not (select public.is_admin()) then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  if length(v_room) not between 1 and 60 then
    raise exception 'bad_room' using errcode = '22023';
  end if;
  update public.devices set room = v_room where id = p_device;
  if not found then
    raise exception 'no_such_device' using errcode = 'P0002';
  end if;
end $$;
revoke all on function public.admin_set_room(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_set_room(uuid, text) to authenticated;
