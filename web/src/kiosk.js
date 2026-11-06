// P06-01 kiosk (F-13): turns the home page's reading view and badge status into what the full-screen page shows.
// Plain function, tested by tests/web-qr-kiosk.test.js. `view` = readingView(), `status` = deviceStatus() or null (not known yet).
import { CATEGORY_LABEL } from './category.js';

export function kioskModel(view, status, failed) {
  const cat = view.category;
  return {
    cls: `kiosk kiosk-${cat || 'none'}`,
    room: view.room,
    label: view.label,
    num: view.heatIndex,
    unit: view.heatIndex !== '—',
    cat,
    catLabel: cat ? CATEGORY_LABEL[cat] : '',
    temp: `Temperature ${view.temp}`,
    rh: `Humidity ${view.rh}`,
    updated: failed ? 'Could not load the readings. Will try again.' : view.updated,
    status: status ? status.text : '',
    statusKind: status ? status.kind : 'wait',
  };
}
