# send-alert/

P05-03 Edge Function. Input: `POST { "alert_id": n }` with header `x-alert-secret`. Reads the alert and all
subscriptions with the server key, sends the push to each (`../_shared/webpush.js`), deletes subscriptions the push
service says are gone (404 / 410), writes `sent` / `failed` into the alert row. A second call for the same alert sends
nothing. Set-up and secrets: see `../README.md`.
