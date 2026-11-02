# migrations/

One SQL file per database change, named `YYYYMMDDHHMMSS_name.sql`, applied in name order by `supabase db push`.
Never edit a file that has been pushed; add a new one.

**Access rule (SECURITY_REVIEW S-7):** Supabase gives every new table and function in `public` to `anon` and `authenticated` by default. Every new table or function revokes from `public, anon, authenticated`, grants back only what is needed, and gets an access test in `tests/backend/`.

- `20261031120000_core_schema.sql` — tables and access rules (P02-01, P02-02).
- `20261031130000_device_room.sql` — device room, room on each reading (F-21, P02-07).
- `20261031140000_ingest.sql` — `heat_index_c` (SQL port of `src/heat-index.js`, D-023) and `ingest_reading`, the device's only way in (P02-04).
- `20261031150000_ingest_anon_only.sql` — only the public (device) role may call `ingest_reading`.
- `20261031160000_retention.sql` — `rollup_old_readings` and its daily `pg_cron` job (18:30 UTC): readings older than 90 days → `readings_hourly`, then deleted (P02-05, F-20).
- `20261102120000_ingest_returns_interval.sql`, `20261102140000_ingest_returns_room.sql` — the upload reply carries `interval_s` and the room name (D-027, D-028).
- `20261103120000_history.sql` — `history(range_hours, for_device)`: 15 minute (24 h) or hourly (168 h) averages for the charts, at most 97 / 169 rows (P04-04, F-04).

(The CLI prints "Skipping migration README.md": harmless, this file is not SQL.)
