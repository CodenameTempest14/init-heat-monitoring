-- F-21 (D-024): the room the device is in now, and the room each reading was taken in.
-- The ingest function (P02-04) copies devices.room onto every new reading; the device never sends it.

alter table public.devices
  add column room text not null default 'Unassigned' check (length(room) between 1 and 60);

alter table public.readings
  add column room text not null check (length(room) between 1 and 60);

-- An hour in which the device was moved gets one row per room.
alter table public.readings_hourly add column room text not null;
alter table public.readings_hourly drop constraint readings_hourly_pkey, add primary key (device_id, hour, room);

-- New view columns can only go at the end.
create or replace view public.device_status with (security_invoker = true) as
  select id, name, last_seen_at, room from public.devices;

-- Read only, like the other public device columns. Changing it is for the admin (P05).
grant select (room) on public.devices to anon, authenticated;
