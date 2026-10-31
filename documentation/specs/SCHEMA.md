# Backend schema (P02-01): APPROVED by the owner 2026-10-31 (s07), nothing built yet

Supabase (Postgres) for one room (D-003). Features: F-06 secure upload, F-07 public read, F-09 settings, F-20 housekeeping.
Load (D-018, F-04): one always-awake device, about one reading every 5 minutes → 288 rows a day, about 26 000 rows in 90 days. Far inside the free tier (500 MB).

## The idea in one picture

```
ESP32 ──HTTPS POST──► ingest_reading(device_key, readings[])   ← the ONLY way in for the device
                        │  1. hash the key, find the device (wrong key → reject)
                        │  2. check ranges, timestamps, rate (bad → reject, nothing saved)
                        │  3. apply the calibration offset, compute the heat index, insert
                        ▼
                     readings ──► public SELECT (anyone with the link, F-07)
                     readings_hourly (after 90 days, F-20)
Web app (anon) ── SELECT only. No INSERT / UPDATE / DELETE policy exists for anon.
Admin (P05) ── signs in, may UPDATE settings only.
```

Why a database function (RPC) and not a separate Edge Function: the check and the insert happen in one place, inside the database, in one transaction. There is no second service to deploy or keep a secret in. The device calls it with the public "anon" API key (that key is public by design; it grants nothing on its own) **plus** its own device key, which is the real secret.

## Tables

### `devices`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `name` | text | which device, e.g. "Init 1". No personal data. |
| `room` | text, default "Unassigned" | where it is now, e.g. "Room 204" (F-21, D-024). The admin changes it in P05. |
| `key_hash` | text, unique | SHA-256 of the device key. The key itself is never stored: if the database leaks, the key does not. |
| `created_at` | timestamptz | |
| `last_seen_at` | timestamptz | set by `ingest_reading`; drives the online/offline badge (F-03) |

Not readable by the public (it holds `key_hash`). The app reads a view `device_status (id, name, room, last_seen_at)` instead.

### `readings`
| Column | Type | Notes |
|---|---|---|
| `id` | bigint identity, primary key | |
| `device_id` | uuid → devices | |
| `recorded_at` | timestamptz | when the device measured (its NTP clock). Needed for the offline buffer (F-11): late uploads keep their real time. |
| `received_at` | timestamptz, default now() | when the server got it; used for the rate check |
| `temp_c` | numeric(4,1) | corrected value (raw + offset) |
| `rh_pct` | numeric(4,1) | corrected value |
| `temp_offset_c`, `rh_offset_pct` | numeric(3,1) | the offset that was applied, so history stays explainable after the offset changes |
| `room` | text | copied by the server from `devices.room` at upload, so a reading keeps the room it was taken in (F-21, D-024). The device never sends it. |
| `heat_index_c` | numeric(4,1), null allowed | **computed by the server** from the corrected values (D-023); `null` when below the NWS range, like the JS |

Unique on `(device_id, recorded_at)`: the same buffered reading sent twice is stored once.
The device never sends a heat index; the server computes it with a SQL port of `src/heat-index.js`, tested against the same `tests/heat-index-reference.json` (D-015, D-023). Trusting a number the device worked out is avoided.

### `readings_hourly` (F-20, D-023)
One row per device, hour and room. Primary key `(device_id, hour, room)`: an hour in which the device was moved gets one row per room (F-21). Public read.
| Columns | Notes |
|---|---|
| `temp_avg`, `temp_min`, `temp_max`, `temp_max_at` | |
| `rh_avg`, `rh_min`, `rh_max`, `rh_max_at` | |
| `hi_avg`, `hi_max`, `hi_max_at` | null when every reading in the hour was below range |
| `n` | readings in the hour |

The `*_max_at` columns keep the **exact time** of each hour's highest value (owner's request, s07). So the highest heat index and humidity of any day, week or the whole record, with the time it happened, is one query, and it still works after raw readings are deleted at 90 days.

### `settings` (one row per device, F-09)
| Column | Default | Allowed |
|---|---|---|
| `interval_s` | 300 | 60 to 3600 |
| `temp_offset_c` | 0.0 | −5.0 to +5.0 |
| `rh_offset_pct` | 0.0 | −10.0 to +10.0 |
| `alert_heat_index_c` | 42 (PAGASA Danger) | 27 to 60 |
| `alert_quiet_min` | 60 | 10 to 1440 |

Allowed ranges are enforced by `CHECK` constraints in the database, so even the admin can't save a nonsense value. Public read (nothing secret; the device reads its interval and offsets from here). Updates: admin only, added in P05. Alert columns are used in P05 (F-10). They are listed now so the table is not changed twice.

## Ingest rules (P02-04): every rule rejects the whole call, nothing is saved
| Check | Rule | Why |
|---|---|---|
| Device key | hash must match a device | F-06 |
| Batch size | 1 to 50 readings per call | room for the offline buffer, small enough to be cheap |
| Temperature (raw) | 0 to 60 °C | a classroom; the DHT22 can read −40 to 80, but outside 0 to 60 it's a fault |
| Humidity (raw) | 0 to 100 % | physical limit |
| `recorded_at` | not more than 2 min in the future, not older than 7 days | catches a device with a wrong clock |
| Rate | at most one call per 30 s per device (by `received_at`) | stops a stuck loop or a stolen key from flooding the table |
| Missing or extra fields | rejected | strict input |

Each rule gets a test that sends a bad payload and expects a rejection (test-first: the test fails before the function exists).

As built (P02-04): the device sends `POST /rest/v1/rpc/ingest_reading` with the public key and `{"device_key": "...", "readings": [{"recorded_at": "2026-11-03T08:00:00Z", "temp_c": 31.2, "rh_pct": 64.5}]}`. Answers: `200 {"saved": n, "duplicates": m}`; `403 bad_key`; `429 rate_limited`; `400` with the rule name (`bad_batch_size`, `bad_fields`, `bad_field_type`, `bad_recorded_at`, `recorded_at_out_of_range`, `temp_out_of_range`, `rh_out_of_range`). A repeated `recorded_at` is counted as a duplicate, not an error. The rate is measured from the last **accepted** call (`devices.last_seen_at`).

## Access rules (P02-02)
Row-level security is ON for every table.
- anon: `SELECT` on `readings`, `readings_hourly`, `settings`, `device_status`. Nothing else.
- anon: `EXECUTE` on `ingest_reading` only (the function checks the device key itself).
- An anonymous direct `INSERT` into `readings` is tried in a test and must fail.

## Retention (P02-05)
A daily `pg_cron` job: readings older than 90 days are averaged into `readings_hourly`, then deleted, in one transaction.

## Device key (P02-03)
Made once with a random generator (32 bytes, hex). It goes into `firmware/.../secrets.h` (gitignored) and only its hash goes into the database. Rotating the key = make a new one, update the hash, re-flash.

## Known gaps, stated now
- **Free-tier pausing:** Supabase pauses a free project after a period of inactivity. Device traffic every 5 min should keep it active. I have not verified this; checked in P07.
- **The rollup runs only after 90 days.** For the recent 90 days the highs come straight from `readings` (same query shape). If the app needs hourly rows sooner (charts), the job can also fill recent hours; decided in P04.
- **Device health (F-17)** columns (signal, reboot reason, firmware version) are added in P05, not now.
