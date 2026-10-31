-- P02-01 / P02-02: the tables from documentation/specs/SCHEMA.md and who may touch them.
-- The ingest function (P02-04), heat index function (D-023) and retention job (P02-05) come in later migrations.

-- ── Tables ──────────────────────────────────────────────────────────────────

create table public.devices (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(name) between 1 and 60),
  key_hash     text not null unique check (key_hash ~ '^[0-9a-f]{64}$'), -- SHA-256 hex; the key itself is never stored
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz
);

create table public.readings (
  id            bigint generated always as identity primary key,
  device_id     uuid not null references public.devices (id) on delete cascade,
  recorded_at   timestamptz not null,                -- device clock (NTP); kept for late uploads (F-11)
  received_at   timestamptz not null default now(),  -- server clock; used for the rate check
  temp_c        numeric(4,1) not null check (temp_c between -10 and 70),  -- corrected (raw + offset)
  rh_pct        numeric(4,1) not null check (rh_pct between 0 and 100),   -- corrected (raw + offset)
  temp_offset_c numeric(3,1) not null default 0,
  rh_offset_pct numeric(3,1) not null default 0,
  heat_index_c  numeric(4,1),                        -- computed by the server (D-023); null below the NWS range
  unique (device_id, recorded_at)
);
create index readings_device_received on public.readings (device_id, received_at desc);

create table public.readings_hourly (
  device_id   uuid not null references public.devices (id) on delete cascade,
  hour        timestamptz not null,
  temp_avg    numeric(4,1) not null,
  temp_min    numeric(4,1) not null,
  temp_max    numeric(4,1) not null,
  temp_max_at timestamptz not null,
  rh_avg      numeric(4,1) not null,
  rh_min      numeric(4,1) not null,
  rh_max      numeric(4,1) not null,
  rh_max_at   timestamptz not null,
  hi_avg      numeric(4,1),  -- null when every reading in the hour was below range
  hi_max      numeric(4,1),
  hi_max_at   timestamptz,
  n           integer not null check (n > 0),
  primary key (device_id, hour)
);

create table public.settings (
  device_id          uuid primary key references public.devices (id) on delete cascade,
  interval_s         integer      not null default 300 check (interval_s between 60 and 3600),
  temp_offset_c      numeric(3,1) not null default 0   check (temp_offset_c between -5 and 5),
  rh_offset_pct      numeric(3,1) not null default 0   check (rh_offset_pct between -10 and 10),
  alert_heat_index_c numeric(4,1) not null default 42  check (alert_heat_index_c between 27 and 60),
  alert_quiet_min    integer      not null default 60  check (alert_quiet_min between 10 and 1440),
  updated_at         timestamptz  not null default now()
);

-- What the public may see of a device: never key_hash.
create view public.device_status with (security_invoker = true) as
  select id, name, last_seen_at from public.devices;

-- ── Access rules (P02-02) ───────────────────────────────────────────────────
-- Two layers. Grants say which commands a role may run at all: Supabase grants everything
-- to anon/authenticated by default, so take it all back and give back only SELECT.
-- Row-level security then says which rows; with only a SELECT policy, no write can pass.

revoke all on public.devices, public.readings, public.readings_hourly, public.settings, public.device_status
  from anon, authenticated;

grant select on public.readings, public.readings_hourly, public.settings, public.device_status to anon, authenticated;
grant select (id, name, last_seen_at) on public.devices to anon, authenticated;  -- key_hash stays hidden

alter table public.devices         enable row level security;
alter table public.readings        enable row level security;
alter table public.readings_hourly enable row level security;
alter table public.settings        enable row level security;

create policy "public read" on public.devices         for select to anon, authenticated using (true);
create policy "public read" on public.readings        for select to anon, authenticated using (true);
create policy "public read" on public.readings_hourly for select to anon, authenticated using (true);
create policy "public read" on public.settings        for select to anon, authenticated using (true);
