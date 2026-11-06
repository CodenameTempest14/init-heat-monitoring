// P06-02 QR poster (F-14): the QR picture and the level list. Plain functions, tested by tests/web-qr-kiosk.test.js.
// The QR is drawn in the browser by qrcode-generator (MIT); the picture must equal the approved mock (design/qr-kiosk/).
import qrcode from 'qrcode-generator';

// The poster always points at the hosted app, not at wherever it is opened from (a printed code must not depend on localhost).
export const APP_URL = 'https://init-heat-monitoring.vercel.app';

// PAGASA levels, the same ranges as category.js (D-019). The label for "below range" is left out on purpose.
export const LEVELS = ['Caution 27–32 °C', 'Extreme caution 33–41 °C', 'Danger 42–51 °C', 'Extreme danger 52 °C +'];

const QUIET = 4; // modules of white around the code (the QR standard asks for four)

// One path of 1x1 squares (one per dark module), plus the side of the picture in modules.
export function qrModel(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + QUIET} ${r + QUIET}h1v1h-1z`;
  return { size: n + 2 * QUIET, d };
}
