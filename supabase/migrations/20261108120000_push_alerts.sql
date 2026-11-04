-- P05-03 (F-10, P5-f/g/h): heat alerts by web push. Design: documentation/specs/P05-03_DESIGN.md (approved s31).
-- The decision "send or not" lives here, in SQL, so the backend tests can check it without a phone.
-- The Edge Function `send-alert` only delivers: the trigger calls it through pg_net with an alert id.
--
-- Owner's answers (s31): remind every quiet period while still hot (DECIDE 1 = a), a trigger + pg_net (2 = a),
-- the rounded heat index against the threshold (4), at most 300 subscriptions (5).

create extension if not exists pg_net with schema extensions;  -- web requests from the database (net.http_post)

-- ── Tables ──────────────────────────────────────────────────────────────────────────────────────────────────────

-- One row per phone or browser that asked for alerts. No name, no email, no device of the person (P5-h).
-- The endpoint is the push service address the browser gave; p256dh and auth are the browser's keys that the
-- message is encrypted with. Nobody reads this through the REST address; only the Edge Function (secret key).
create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  endpoint   text not null unique check (length(endpoint) <= 1000),
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

-- A log: one row per alert decided. sent / failed are written by the Edge Function after delivery
-- (both stay null for a throwaway test device, or when the function is not set up yet).
create table public.alerts (
  id           bigint generated always as identity primary key,
  device_id    uuid not null references public.devices (id) on delete cascade,
  heat_index_c numeric(4,1) not null,
  room         text not null,
  created_at   timestamptz not null default now(),
  sent         integer check (sent >= 0),
  failed       integer check (failed >= 0)
);
create index alerts_device_created on public.alerts (device_id, created_at desc);

-- The quiet period: when this device last sent an alert.
create table public.alert_state (
  device_id     uuid primary key references public.devices (id) on delete cascade,
  last_alert_at timestamptz not null
);

-- Nobody but the secret key (service_role) and the database itself: RLS on, no policies, no grants.
alter table public.push_subscriptions enable row level security;
alter table public.alerts             enable row level security;
alter table public.alert_state        enable row level security;
revoke all on public.push_subscriptions, public.alerts, public.alert_state from anon, authenticated;

-- ── Subscribe / unsubscribe (anyone, P5-h) ──────────────────────────────────────────────────────────────────────

-- Only real push services: otherwise our server would post to any address a stranger typed.
-- The host is the text between https:// and the first "/": no port, no user@ part, no look-alike endings.
create function public.push_subscribe(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  host text;
begin
  if p_endpoint is null or length(p_endpoint) > 1000 then
    raise exception using errcode = 'PT400', message = 'bad_endpoint';
  end if;
  host := lower(substring(p_endpoint from '^https://([A-Za-z0-9.-]+)/'));
  if host is null or not (
       host in ('fcm.googleapis.com', 'updates.push.services.mozilla.com')
       or host like '%.push.apple.com'        -- Apple (web.push.apple.com)
       or host like '%.notify.windows.com'    -- Microsoft Edge (WNS)
     ) then
    raise exception using errcode = 'PT400', message = 'bad_endpoint';
  end if;
  -- The browser's keys in base64url: p256dh is 65 bytes (87 characters), auth 16 bytes (22 characters).
  if coalesce(p_p256dh, '') !~ '^[A-Za-z0-9_-]{80,100}={0,2}$'
     or coalesce(p_auth, '') !~ '^[A-Za-z0-9_-]{16,30}={0,2}$' then
    raise exception using errcode = 'PT400', message = 'bad_keys';
  end if;

  -- The cap (DECIDE 5). One subscribe at a time, so two cannot both see 299 and make 301.
  perform pg_advisory_xact_lock(hashtext('public.push_subscriptions cap'));
  if not exists (select 1 from public.push_subscriptions s where s.endpoint = p_endpoint)
     and (select count(*) from public.push_subscriptions) >= 300 then
    raise exception using errcode = 'PT409', message = 'subscriptions_full';
  end if;

  -- The same address again (the browser renewed its keys) updates the row instead of adding one.
  insert into public.push_subscriptions (endpoint, p256dh, auth)
  values (p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth;
end;
$$;

-- Removes the row only when the endpoint AND the auth secret match: only the phone itself knows its auth,
-- so a stranger can remove only their own subscription. Returns true when a row was removed.
create function public.push_unsubscribe(p_endpoint text, p_auth text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.push_subscriptions s where s.endpoint = p_endpoint and s.auth = p_auth;
  return found;
end;
$$;

revoke execute on function public.push_subscribe(text, text, text), public.push_unsubscribe(text, text)
  from public, anon, authenticated;
grant execute on function public.push_subscribe(text, text, text), public.push_unsubscribe(text, text)
  to anon, authenticated, service_role;

-- ── The alert rule (design section 3) ───────────────────────────────────────────────────────────────────────────

-- Runs once per upload (statement trigger) and sees all the readings that upload added (new_rows).
-- For each device, the newest reading that is
--   1. fresh: recorded in the last 5 minutes (a queued batch after a Wi-Fi gap must not wake phones now),
--   2. at or over the admin's threshold on the ROUNDED heat index (default 42 = Danger; same value as the page's level),
-- starts an alert if
--   3. the quiet period (default 60 min) has passed since the last alert of this device.
-- Still hot after the quiet period = another alert (a reminder, DECIDE 1 = a).
-- The ingest call locks the device row, so two uploads of one device never run this at the same time.
create function public.alert_on_readings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  cand      record;
  fired     timestamptz;
  new_alert bigint;
  fn_url    text;
  fn_secret text;
begin
  for cand in
    select distinct on (n.device_id)
           n.device_id, n.heat_index_c, n.room, coalesce(s.alert_quiet_min, 60) as quiet_min, d.name as device_name
    from new_rows n
    join public.devices d on d.id = n.device_id
    left join public.settings s on s.device_id = n.device_id
    where n.heat_index_c is not null
      and n.recorded_at >= now() - interval '5 minutes'
      and round(n.heat_index_c) >= coalesce(s.alert_heat_index_c, 42)
    order by n.device_id, n.recorded_at desc
  loop
    -- Quiet period, in one statement: a first alert inserts the row; a later one moves the time only if the
    -- quiet period has passed. No row back = still quiet.
    fired := null;
    insert into public.alert_state as a (device_id, last_alert_at)
    values (cand.device_id, now())
    on conflict (device_id) do update set last_alert_at = excluded.last_alert_at
      where a.last_alert_at <= now() - make_interval(mins => cand.quiet_min)
    returning a.last_alert_at into fired;
    continue when fired is null;

    insert into public.alerts (device_id, heat_index_c, room)
    values (cand.device_id, cand.heat_index_c, coalesce(cand.room, 'Unassigned'))
    returning id into new_alert;

    -- Throwaway test devices (backend tests) are logged but never wake a phone.
    continue when cand.device_name like 'test %';

    -- The function address and the shared secret live in Vault, not in this file (set by the owner).
    select ds.decrypted_secret into fn_url from vault.decrypted_secrets ds where ds.name = 'send_alert_url';
    select ds.decrypted_secret into fn_secret from vault.decrypted_secrets ds where ds.name = 'send_alert_secret';
    continue when fn_url is null or fn_secret is null;

    -- pg_net queues the request and sends it after this upload commits; it never blocks or fails the upload.
    begin
      perform net.http_post(
        url := fn_url,
        body := jsonb_build_object('alert_id', new_alert),
        headers := jsonb_build_object('Content-Type', 'application/json', 'x-alert-secret', fn_secret),
        timeout_milliseconds := 10000
      );
    exception when others then
      raise warning 'send-alert request not queued: %', sqlerrm;
    end;
  end loop;
  return null;
end;
$$;

revoke execute on function public.alert_on_readings() from public, anon, authenticated;

create trigger readings_alert
  after insert on public.readings
  referencing new table as new_rows
  for each statement
  execute function public.alert_on_readings();

-- ── Retention: the alert log is kept 90 days, like the raw readings ─────────────────────────────────────────────
-- 18:35 UTC = 02:35 in Manila, five minutes after the readings roll-up.
select cron.schedule('delete-old-alerts', '35 18 * * *',
  $$delete from public.alerts where created_at < now() - interval '90 days'$$);
