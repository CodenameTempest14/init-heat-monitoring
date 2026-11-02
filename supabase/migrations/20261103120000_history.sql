-- P04-04 (F-04): the history charts. The page asks for one device's last 24 h (15 minute averages, at most 97 rows)
-- or last 7 days (hourly averages, at most 169 rows) instead of downloading the raw one-a-minute rows
-- (1 440 and 10 080 per refresh), which would waste the free tier's bandwidth.
-- security invoker: runs as the caller, so the same row-level rules as a plain SELECT apply (public read-only).
-- Only 24 and 168 are accepted, so nobody can ask for the whole table. The average of the heat index skips nulls
-- (readings below its range); a bucket where every reading was below range gives null.
create function public.history(range_hours integer, for_device uuid)
returns table (bucket timestamptz, temp_c numeric, rh_pct numeric, heat_index_c numeric)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  width interval;
begin
  if range_hours is null or range_hours not in (24, 168) then
    raise exception using errcode = 'PT400', message = 'bad_range';
  end if;
  width := case when range_hours = 24 then interval '15 minutes' else interval '1 hour' end;

  return query
    select date_bin(width, r.recorded_at, timestamptz '2000-01-01 00:00:00+00'),
           round(avg(r.temp_c), 1), round(avg(r.rh_pct), 1), round(avg(r.heat_index_c), 1)
    from public.readings r
    where r.device_id = for_device
      and r.recorded_at >= now() - make_interval(hours => range_hours)
    group by 1
    order by 1;
end;
$$;

revoke execute on function public.history(integer, uuid) from public;
grant execute on function public.history(integer, uuid) to anon, authenticated, service_role;
