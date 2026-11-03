-- F-24 (s27): the readings table under the history charts, picked by a from-to range of Philippine days.
-- readings_hourly: hourly averages (like history(), the average of the heat index skips nulls), newest first, one row per
-- hour and room (an hour in which the device was moved gives two rows, F-21), at most 500 rows per call; the page asks for the
-- next 500 with before_hour. readings_span: first and last reading time, so the date pickers only offer days with data.
-- security invoker: the same row-level rules as a plain SELECT apply (public read-only). Manila is UTC+8 all year (no daylight
-- saving), so a Manila hour is also a whole UTC hour and date_trunc('hour') lines up.
create function public.readings_hourly(from_day date, to_day date, for_device uuid, before_hour timestamptz default null, page_size integer default 500)
returns table (hour timestamptz, room text, temp_c numeric, rh_pct numeric, heat_index_c numeric, n integer)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if from_day is null or to_day is null or to_day < from_day then
    raise exception using errcode = 'PT400', message = 'bad_range';
  end if;
  if page_size is null or page_size < 1 or page_size > 500 then
    raise exception using errcode = 'PT400', message = 'bad_page_size';
  end if;

  return query
    select date_trunc('hour', r.recorded_at), r.room,
           round(avg(r.temp_c), 1), round(avg(r.rh_pct), 1), round(avg(r.heat_index_c), 1), count(*)::integer
    from public.readings r
    where r.device_id = for_device
      and r.recorded_at >= (from_day::timestamp at time zone 'Asia/Manila')
      and r.recorded_at < ((to_day + 1)::timestamp at time zone 'Asia/Manila')
      and (before_hour is null or r.recorded_at < before_hour)
    group by 1, 2
    order by 1 desc, 2
    limit page_size;
end;
$$;

create function public.readings_span(for_device uuid)
returns json
language sql
stable
security invoker
set search_path = ''
as $$
  select json_build_object('first_at', min(r.recorded_at), 'last_at', max(r.recorded_at))
  from public.readings r
  where r.device_id = for_device;
$$;

revoke execute on function public.readings_hourly(date, date, uuid, timestamptz, integer) from public;
grant execute on function public.readings_hourly(date, date, uuid, timestamptz, integer) to anon, authenticated, service_role;
revoke execute on function public.readings_span(uuid) from public;
grant execute on function public.readings_span(uuid) to anon, authenticated, service_role;
