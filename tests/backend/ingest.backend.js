// P02-04 (F-06): ingest_reading is the only way in for the device. Every rule rejects the whole
// call and saves nothing. Rules: documentation/specs/SCHEMA.md "Ingest rules".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heatIndexC } from '../../src/heat-index.js';
import { service, makeDevice, ingest, minutesFromNow } from './_helpers.js';

const good = (over = {}) => ({ recorded_at: minutesFromNow(-1), temp_c: 31.2, rh_pct: 64.5, ...over });

/** Runs fn with a fresh device and always deletes it. */
async function withDevice(opts, fn) {
  const device = await makeDevice(opts);
  try { await fn(device); } finally { await device.cleanup(); }
}

/** The call is refused with this HTTP status and rule name, and nothing is saved. */
async function assertRejected(device, readings, status, rule, key = device.key) {
  const res = await ingest(key, readings);
  assert.equal(res.status, status, `want ${status} ${rule}, got ${res.status} ${JSON.stringify(res.body)}`);
  assert.equal(res.body?.message, rule);
  assert.deepEqual(await device.readings(), [], 'nothing may be saved');
}

// ── Accepted ────────────────────────────────────────────────────────────────

test('a good reading is saved with the server-computed heat index and the device room', async () => {
  await withDevice({ room: 'Room 204' }, async (device) => {
    const sent = good();
    const res = await ingest(device.key, [sent]);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.deepEqual(res.body, { saved: 1, duplicates: 0, interval_s: 300 });

    const [row] = await device.readings();
    assert.equal(row.temp_c, 31.2);
    assert.equal(row.rh_pct, 64.5);
    assert.equal(row.room, 'Room 204');
    assert.equal(new Date(row.recorded_at).toISOString(), sent.recorded_at);
    assert.equal(row.heat_index_c, Math.round(heatIndexC(31.2, 64.5) * 10) / 10);

    const dev = (await service(`devices?id=eq.${device.id}&select=last_seen_at`)).body[0];
    assert.ok(Date.now() - new Date(dev.last_seen_at) < 60_000, 'last_seen_at is updated');
  });
});

test('the reply carries the upload interval from settings (P03-03)', async () => {
  await withDevice({ settings: { interval_s: 120 } }, async (device) => {
    const res = await ingest(device.key, [good()]);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.interval_s, 120);
  });
});

test('a device with no settings row gets the default interval of 300 s', async () => {
  await withDevice({}, async (device) => {
    await service(`settings?device_id=eq.${device.id}`, { method: 'DELETE' });
    const res = await ingest(device.key, [good()]);
    assert.equal(res.body.interval_s, 300);
  });
});

test('below the heat index range the reading is saved with a null heat index', async () => {
  await withDevice({}, async (device) => {
    assert.equal((await ingest(device.key, [good({ temp_c: 24, rh_pct: 50 })])).status, 200);
    assert.equal((await device.readings())[0].heat_index_c, null);
  });
});

test('the calibration offsets from settings are applied and recorded', async () => {
  await withDevice({ settings: { temp_offset_c: 1.5, rh_offset_pct: -5 } }, async (device) => {
    assert.equal((await ingest(device.key, [good({ temp_c: 30, rh_pct: 60 })])).status, 200);
    const [row] = await device.readings();
    assert.deepEqual([row.temp_c, row.rh_pct, row.temp_offset_c, row.rh_offset_pct], [31.5, 55, 1.5, -5]);
    assert.equal(row.heat_index_c, Math.round(heatIndexC(31.5, 55) * 10) / 10, 'heat index uses the corrected values');
  });
});

test('humidity after the offset is kept between 0 and 100', async () => {
  await withDevice({ settings: { rh_offset_pct: 5 } }, async (device) => {
    assert.equal((await ingest(device.key, [good({ rh_pct: 98 })])).status, 200);
    assert.equal((await device.readings())[0].rh_pct, 100);
  });
});

test('a batch from the offline buffer is saved in one call', async () => {
  await withDevice({}, async (device) => {
    const batch = Array.from({ length: 50 }, (_, i) => good({ recorded_at: minutesFromNow(-5 * (i + 1)) }));
    const res = await ingest(device.key, batch);
    assert.deepEqual(res.body, { saved: 50, duplicates: 0, interval_s: 300 });
    assert.equal((await device.readings()).length, 50);
  });
});

test('the same reading sent twice is stored once', async () => {
  await withDevice({}, async (device) => {
    const r = good();
    const res = await ingest(device.key, [r, r]);
    assert.deepEqual(res.body, { saved: 1, duplicates: 1, interval_s: 300 });
    assert.equal((await device.readings()).length, 1);
  });
});

test('a moved device: old readings keep their room, new ones get the new room (F-21)', async () => {
  await withDevice({ room: 'Room 101' }, async (device) => {
    assert.equal((await ingest(device.key, [good({ recorded_at: minutesFromNow(-10) })])).status, 200);
    await service(`devices?id=eq.${device.id}`, { method: 'PATCH', body: { room: 'Room 204', last_seen_at: minutesFromNow(-5) } });
    assert.equal((await ingest(device.key, [good({ recorded_at: minutesFromNow(-1) })])).status, 200);
    assert.deepEqual((await device.readings()).map((r) => r.room), ['Room 101', 'Room 204']);
  });
});

// ── Rejected: key ───────────────────────────────────────────────────────────

test('a wrong device key is refused', async () => {
  await withDevice({}, (device) => assertRejected(device, [good()], 403, 'bad_key', 'f'.repeat(64)));
});

test('a missing device key is refused', async () => {
  await withDevice({}, (device) => assertRejected(device, [good()], 403, 'bad_key', null));
});

// ── Rejected: values ────────────────────────────────────────────────────────

for (const [label, over, rule] of [
  ['temperature above 60 C', { temp_c: 60.1 }, 'temp_out_of_range'],
  ['temperature below 0 C', { temp_c: -0.1 }, 'temp_out_of_range'],
  ['humidity above 100 %', { rh_pct: 100.1 }, 'rh_out_of_range'],
  ['humidity below 0 %', { rh_pct: -0.1 }, 'rh_out_of_range'],
  ['a number sent as text', { temp_c: '31.2' }, 'bad_field_type'],
  ['a null value', { rh_pct: null }, 'bad_field_type'],
  ['time 5 minutes in the future', { recorded_at: minutesFromNow(5) }, 'recorded_at_out_of_range'],
  ['time 8 days old', { recorded_at: minutesFromNow(-8 * 24 * 60) }, 'recorded_at_out_of_range'],
  ['time without a time zone', { recorded_at: '2026-10-31T10:00:00' }, 'bad_recorded_at'],
  ['time that is not a time', { recorded_at: 'yesterday-ish' }, 'bad_recorded_at'],
]) {
  test(`${label} is refused`, async () => {
    await withDevice({}, (device) => assertRejected(device, [good(over)], 400, rule));
  });
}

// ── Rejected: shape ─────────────────────────────────────────────────────────

test('a missing field is refused', async () => {
  const { rh_pct, ...missing } = good();
  await withDevice({}, (device) => assertRejected(device, [missing], 400, 'bad_fields'));
});

test('an extra field (e.g. a heat index from the device) is refused', async () => {
  await withDevice({}, (device) => assertRejected(device, [good({ heat_index_c: 99 })], 400, 'bad_fields'));
});

test('an empty batch, a batch over 50, and a non-list are refused', async () => {
  await withDevice({}, async (device) => {
    await assertRejected(device, [], 400, 'bad_batch_size');
    const big = Array.from({ length: 51 }, (_, i) => good({ recorded_at: minutesFromNow(-(i + 1)) }));
    await assertRejected(device, big, 400, 'bad_batch_size');
    await assertRejected(device, good(), 400, 'bad_batch_size');
  });
});

test('one bad reading in a batch rejects the whole batch', async () => {
  await withDevice({}, (device) =>
    assertRejected(device, [good({ recorded_at: minutesFromNow(-2) }), good({ temp_c: 99 })], 400, 'temp_out_of_range'));
});

// ── Rejected: rate ──────────────────────────────────────────────────────────

test('a second call within 30 seconds is refused', async () => {
  await withDevice({}, async (device) => {
    assert.equal((await ingest(device.key, [good({ recorded_at: minutesFromNow(-2) })])).status, 200);
    const res = await ingest(device.key, [good({ recorded_at: minutesFromNow(-1) })]);
    assert.equal(res.status, 429, JSON.stringify(res.body));
    assert.equal(res.body?.message, 'rate_limited');
    assert.equal((await device.readings()).length, 1, 'only the first call was saved');
  });
});
