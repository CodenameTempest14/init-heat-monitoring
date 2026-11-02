-- P04-07 (F-12, D-033): one school day in one call. Monday to Friday, 6:00 AM to 7:15 PM Philippine time (the window is
-- half open: 19:15:00 itself is out). Today's window ends at now. The page only draws what this returns.
-- security invoker: runs as the caller, so the same read-only rules as a plain SELECT on readings apply.
--
-- How a reading counts: for the time until the next reading, at most 120 s (the same limit that makes the badge say
-- Offline), and never past the end of the window. The rest of the window is "no-reading", so the seconds in all levels
-- add up to window_seconds and a gap can never pass as "cool". A reading just before 6:00 is not carried into the day.
-- Levels use the heat index rounded to whole degrees (D-019); a null heat index (below the NWS range) is "below-range".
-- Highest, lowest, hottest hour and average skip readings with no heat index; they are null when there are none.
-- Refused with 400 'bad_day': no day or device, a weekend, a day in the future, or older than 90 days (raw readings
-- are kept 90 days).
create function public.school_day(day date, for_device uuid)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  tz constant text := 'Asia/Manila';
  today date := (now() at time zone 'Asia/Manila')::date;
  w_start timestamptz;
  w_end timestamptz;
  w_seconds numeric;
  result jsonb;
begin
  if day is null or for_device is null or day > today or today - day > 90 or extract(isodow from day) > 5 then
    raise exception using errcode = 'PT400', message = 'bad_day';
  end if;

  w_start := (day + time '06:00') at time zone tz;
  w_end   := least((day + time '19:15') at time zone tz, date_trunc('second', now()));
  if w_end < w_start then w_end := w_start; end if;
  w_seconds := extract(epoch from w_end - w_start);

  with r as (
    select recorded_at as t, heat_index_c as hi,
           least(interval '120 seconds',
                 coalesce(lead(recorded_at) over (order by recorded_at), 'infinity'::timestamptz) - recorded_at,
                 w_end - recorded_at) as dur
    from public.readings
    where device_id = for_device and recorded_at >= w_start and recorded_at < w_end
  ),
  lvl as (
    select extract(epoch from dur) as secs,
           case when hi is null then 'below-range'
                when round(hi) >= 52 then 'extreme-danger'
                when round(hi) >= 42 then 'danger'
                when round(hi) >= 33 then 'extreme-caution'
                when round(hi) >= 27 then 'caution'
                else 'below-range' end as category
    from r
  ),
  secs as (
    select category, sum(secs) as s from lvl group by category
  ),
  hours as (
    select date_trunc('hour', t at time zone tz) as h, avg(hi) as a
    from r where hi is not null group by 1
  )
  select jsonb_build_object(
    'day', day,
    'window_start', w_start,
    'window_end', w_end,
    'window_seconds', w_seconds,
    'readings', (select count(*) from r),
    'highest', (select jsonb_build_object('heat_index_c', hi, 'at', t) from r where hi is not null order by hi desc, t limit 1),
    'lowest',  (select jsonb_build_object('heat_index_c', hi, 'at', t) from r where hi is not null order by hi, t limit 1),
    'hottest_hour', (select jsonb_build_object('starts_at', (h at time zone tz), 'average', round(a, 1)) from hours order by a desc, h limit 1),
    'average', (select round(avg(hi), 1) from r where hi is not null),
    'levels', jsonb_build_object(
      'extreme-danger',  coalesce((select s from secs where category = 'extreme-danger'), 0),
      'danger',          coalesce((select s from secs where category = 'danger'), 0),
      'extreme-caution', coalesce((select s from secs where category = 'extreme-caution'), 0),
      'caution',         coalesce((select s from secs where category = 'caution'), 0),
      'below-range',     coalesce((select s from secs where category = 'below-range'), 0),
      'no-reading',      w_seconds - coalesce((select sum(s) from secs), 0)
    )
  ) into result;
  return result;
end;
$$;

revoke execute on function public.school_day(date, uuid) from public;
grant execute on function public.school_day(date, uuid) to anon, authenticated, service_role;
