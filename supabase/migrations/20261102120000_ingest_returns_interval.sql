-- P03-03 (F-11): the reply also tells the device how often to upload (settings.interval_s, 60 to 3600 s;
-- 300 when the device has no settings row, the same as the table default). The device only knows its
-- key, so the reply is the one place it can learn its own setting without a second call.
-- Only the end of the function changed. create or replace keeps the grants set by earlier migrations.
create or replace function public.ingest_reading(device_key text, readings jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  dev      record;
  cfg      record;
  r        jsonb;
  at       timestamptz;
  raw_t    numeric;
  raw_rh   numeric;
  temp     numeric;
  rh       numeric;
  n        integer;
  saved    integer;
begin
  -- 1. Key: find the device by the SHA-256 of the key. Lock its row so two calls can't both
  --    pass the rate check at the same moment.
  select d.id, d.room, d.last_seen_at into dev
  from public.devices d
  where d.key_hash = encode(sha256(convert_to(coalesce(device_key, ''), 'UTF8')), 'hex')
  for update;
  if not found then
    raise exception using errcode = 'PT403', message = 'bad_key';
  end if;

  -- 2. Rate: at most one accepted call per 30 s per device.
  if dev.last_seen_at is not null and dev.last_seen_at > now() - interval '30 seconds' then
    raise exception using errcode = 'PT429', message = 'rate_limited';
  end if;

  -- 3. Batch: a list of 1 to 50 readings.
  if jsonb_typeof(readings) is distinct from 'array' then
    raise exception using errcode = 'PT400', message = 'bad_batch_size';
  end if;
  n := jsonb_array_length(readings);
  if n < 1 or n > 50 then
    raise exception using errcode = 'PT400', message = 'bad_batch_size';
  end if;

  -- 4. Each reading: exactly these three fields, right types, sane values.
  for r in select value from jsonb_array_elements(readings) loop
    if jsonb_typeof(r) is distinct from 'object'
       or (select array_agg(k order by k) from jsonb_object_keys(r) k) <> array['recorded_at', 'rh_pct', 'temp_c'] then
      raise exception using errcode = 'PT400', message = 'bad_fields';
    end if;
    if jsonb_typeof(r -> 'temp_c') <> 'number' or jsonb_typeof(r -> 'rh_pct') <> 'number'
       or jsonb_typeof(r -> 'recorded_at') <> 'string' then
      raise exception using errcode = 'PT400', message = 'bad_field_type';
    end if;

    -- A time must say its time zone (Z or +08:00), or it would be read in the server's zone.
    if (r ->> 'recorded_at') !~ '(Z|[+-]\d\d(:?\d\d)?)$' then
      raise exception using errcode = 'PT400', message = 'bad_recorded_at';
    end if;
    begin
      at := (r ->> 'recorded_at')::timestamptz;
    exception when others then
      raise exception using errcode = 'PT400', message = 'bad_recorded_at';
    end;
    if at > now() + interval '2 minutes' or at < now() - interval '7 days' then
      raise exception using errcode = 'PT400', message = 'recorded_at_out_of_range';
    end if;

    raw_t := (r ->> 'temp_c')::numeric;
    raw_rh := (r ->> 'rh_pct')::numeric;
    if raw_t < 0 or raw_t > 60 then
      raise exception using errcode = 'PT400', message = 'temp_out_of_range';
    end if;
    if raw_rh < 0 or raw_rh > 100 then
      raise exception using errcode = 'PT400', message = 'rh_out_of_range';
    end if;
  end loop;

  -- 5. Save: apply the calibration offsets, keep humidity within 0..100, compute the heat index
  --    from the stored (rounded) values, copy the device's room. A repeat of the same
  --    recorded_at is skipped, not an error (the offline buffer may resend).
  select coalesce(s.temp_offset_c, 0) as t_off, coalesce(s.rh_offset_pct, 0) as rh_off,
         coalesce(s.interval_s, 300) as interval_s into cfg
  from (select 1) one
  left join public.settings s on s.device_id = dev.id;

  with incoming as (
    select (e ->> 'recorded_at')::timestamptz as recorded_at,
           round((e ->> 'temp_c')::numeric + cfg.t_off, 1) as temp_c,
           round(least(100, greatest(0, (e ->> 'rh_pct')::numeric + cfg.rh_off)), 1) as rh_pct
    from jsonb_array_elements(readings) e
  ), inserted as (
    insert into public.readings (device_id, recorded_at, temp_c, rh_pct, temp_offset_c, rh_offset_pct, heat_index_c, room)
    select dev.id, i.recorded_at, i.temp_c, i.rh_pct, cfg.t_off, cfg.rh_off,
           round(public.heat_index_c(i.temp_c::double precision, i.rh_pct::double precision)::numeric, 1),
           dev.room
    from incoming i
    on conflict (device_id, recorded_at) do nothing
    returning 1
  )
  select count(*) into saved from inserted;

  update public.devices set last_seen_at = now() where id = dev.id;

  return jsonb_build_object('saved', saved, 'duplicates', n - saved, 'interval_s', cfg.interval_s);
end;
$$;

