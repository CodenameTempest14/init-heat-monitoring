-- Security advisor (s07): only the device (public key, anon role) uploads readings.
-- A signed-in admin never needs ingest_reading, so take it away from authenticated.
-- The remaining warning (anon may run this security definer function) is intended: it is the
-- device's only door and checks the device key itself. Recorded for the P02-06 review.
revoke execute on function public.ingest_reading(text, jsonb) from authenticated;
