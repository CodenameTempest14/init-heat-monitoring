// P05-03 (P5-g): the words of a heat alert. Run by the Edge Function `send-alert` (Deno) and tested with Node
// (tests/alert-message.test.js). No imports, so it runs in both. The bands are the PAGASA ones of src/heat-index.js
// (D-019); the test checks every tenth from 27 to 60 against that file, so the two cannot drift apart.
// No advice text until a teacher reviews it (F-15, D-034). The teacher also reviews these two lines before live.

const BANDS = [
  { min: 52, name: 'Extreme danger' },
  { min: 42, name: 'Danger' },
  { min: 33, name: 'Extreme caution' },
  { min: 27, name: 'Caution' },
];

/** The PAGASA level name for a heat index (°C), on the rounded value like the page. */
export function levelName(hiC) {
  const whole = Math.round(Number(hiC));
  return BANDS.find((b) => whole >= b.min)?.name;
}

/** { title, body, url } for one row of `alerts` ({ heat_index_c, room }). A tap opens the home page. */
export function alertMessage({ heat_index_c, room }) {
  const whole = Math.round(Number(heat_index_c));
  return {
    title: 'Init heat alert',
    body: `Heat index ${whole} °C (${levelName(whole)}) in ${room || 'Unassigned'}.`,
    url: '/',
  };
}
