-- P02-05 (F-20) and P02-07 (F-21): raw readings are kept 90 days. After that, each device, hour
-- and room becomes one row in readings_hourly (with the exact time of each maximum, D-023), and
-- the raw readings are deleted. Runs daily with pg_cron.

-- ── The job ─────────────────────────────────────────────────────────────────
-- One statement: the DELETE hands the rows it removed straight to the INSERT, so exactly the
-- deleted rows are summarised. If the INSERT fails (e.g. that hour already has a row), the whole
-- statement is undone and nothing is deleted.
-- Only whole hours: the cut-off is the start of the UTC hour 90 days ago, so an hour is never
-- split over two runs. Late uploads can't add to an old hour (ingest_reading refuses > 7 days).
-- UTC hours are also whole local hours in the Philippines (UTC+8).
-- A tie for the maximum keeps the earliest time.
create function public.rollup_old_readings()
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  cutoff  timestamptz := date_trunc('hour', now() - interval '90 days', 'UTC');
  hours   integer;
  deleted integer;
begin
  with gone as (
    delete from public.readings
    where recorded_at < cutoff
    returning device_id, room, recorded_at, temp_c, rh_pct, heat_index_c
  ), rolled as (
    insert into public.readings_hourly (
      device_id, hour, room,
      temp_avg, temp_min, temp_max, temp_max_at,
      rh_avg, rh_min, rh_max, rh_max_at,
      hi_avg, hi_max, hi_max_at, n)
    select device_id, date_trunc('hour', recorded_at, 'UTC'), room,
           round(avg(temp_c), 1), min(temp_c), max(temp_c),
           (array_agg(recorded_at order by temp_c desc, recorded_at))[1],
           round(avg(rh_pct), 1), min(rh_pct), max(rh_pct),
           (array_agg(recorded_at order by rh_pct desc, recorded_at))[1],
           -- avg and max skip nulls: the heat index of the readings that had one.
           round(avg(heat_index_c), 1), max(heat_index_c),
           case when max(heat_index_c) is not null
                then (array_agg(recorded_at order by heat_index_c desc nulls last, recorded_at))[1] end,
           count(*)
    from gone
    group by device_id, date_trunc('hour', recorded_at, 'UTC'), room
    returning 1
  )
  select (select count(*) from rolled), (select count(*) from gone) into hours, deleted;

  return jsonb_build_object('hours', hours, 'deleted', deleted);
end;
$$;

-- Not for the public. pg_cron runs it as the owner (postgres); the tests use the secret key.
revoke execute on function public.rollup_old_readings() from public, anon, authenticated;
grant execute on function public.rollup_old_readings() to service_role;

-- ── Daily schedule ──────────────────────────────────────────────────────────
-- pg_cron times are UTC: 18:30 UTC = 02:30 in Manila, when no class is running.
-- cron.schedule with a name replaces a job of the same name, so re-running this is safe.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('rollup-old-readings', '30 18 * * *', 'select public.rollup_old_readings()');
