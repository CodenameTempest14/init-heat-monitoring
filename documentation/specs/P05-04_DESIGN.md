# P05-04 device health (F-17, P5-i): design

Status (s25): on top of the approved P5-i row in FEATURES.md. Migration and backend test written, **not yet applied** to any project (owner: after the 24 h run). Admin block and `#guide/health` built and gated (mocks approved by the owner, guide wording by a teacher; the page shows "Not reported yet" until a device sends health, and also when the table does not exist yet). Firmware: `health.h` and its PC test are written; `main.cpp` is not wired and nothing is flashed.

## What is built on the server
- The device adds an optional `health` object to the upload: `{"rssi_dbm": -67, "reset_reason": "POWERON", "fw_version": "0.5.0"}`.
  Exactly these three keys. A bad value refuses the whole call with `400 bad_health` (nothing saved).
  - `rssi_dbm`: whole number, -120 to 0.
  - `reset_reason`: one of the ESP32 reset names (`POWERON`, `EXT`, `SW`, `PANIC`, `INT_WDT`, `TASK_WDT`, `WDT`, `DEEPSLEEP`, `BROWNOUT`, `SDIO`, `UNKNOWN`).
  - `fw_version`: 1 to 20 characters from `0-9 A-Z a-z . _ + -`.
- Only the **latest** values per device are kept (table `device_health`, one row per device, `reported_at` = server time).
- Only the admin reads the table (`is_admin()`); nobody writes it from outside, the admin included. Only `ingest_reading` writes it. The public pages never show it.
- An upload without `health` (the firmware running today) works as before and leaves the stored health alone, so the server can go first and the firmware later.
- The reply is unchanged. `ingest_reading` gained a third optional argument, so the old two-argument version was dropped and re-created (same doors: `anon` with the device key, and the secret key; not a signed-in user).

## Why `reset_reason` matters
The 3 min 40 s gap of 2026-11-02 (16:15Z) looks like a reboot but cannot be proven: the board kept no queue and nothing logs a restart. With `reset_reason` (and later a history, if wanted) the cause is readable.

## Not decided, not built
- A history of resets (latest-only loses the previous one). Option: a small log row only when `reset_reason` changes. Needs the owner's yes.
- Uptime in seconds (not in P5-i; would make a reboot visible in the next upload).
- The admin page block and the firmware change (flash). The flash waits until the P03-07 run ends.
