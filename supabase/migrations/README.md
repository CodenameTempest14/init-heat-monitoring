# migrations/

One SQL file per database change, named `YYYYMMDDHHMMSS_name.sql`, applied in name order by `supabase db push`.
Never edit a file that has been pushed; add a new one.

- `20261031120000_core_schema.sql` — tables and access rules (P02-01, P02-02).
- `20261031130000_device_room.sql` — device room, room on each reading (F-21, P02-07).

(The CLI prints "Skipping migration README.md": harmless, this file is not SQL.)
