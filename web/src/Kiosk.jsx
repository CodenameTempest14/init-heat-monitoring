// P06-01 kiosk page #kiosk (F-13): huge numbers for a hallway TV or projector. No header, no links: just the room's reading.
// Markup and classes match design/qr-kiosk/kiosk.html (the approved mock). The data comes from App.jsx (same 30 s refresh).
import { kioskModel } from './kiosk.js';

const SHAPES = {
  'caution': <circle cx="12" cy="12" r="9" />,
  'extreme-caution': <path d="M12 3 22 21H2z" />,
  'danger': <path d="M12 2 22 12 12 22 2 12z" />,
  'extreme-danger': <path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" />,
  'below-range': <path d="M4 12h16" />,
};

export default function Kiosk({ view, status, failed }) {
  const k = kioskModel(view, status, failed);
  return (
    <main className={k.cls}>
      {k.status && <p className={`st st-${k.statusKind}`} role="status">● {k.status}</p>}
      <p className="room">{k.room}</p>
      <p className="num">{k.num}{k.unit && <small>°C</small>}</p>
      {k.cat && <p className="cat"><svg viewBox="0 0 24 24" aria-hidden="true">{SHAPES[k.cat]}</svg>{k.catLabel}</p>}
      <p className="pair"><span>{k.temp}</span><span>{k.rh}</span></p>
      <p className="upd">{`${k.updated} · init-heat-monitoring.vercel.app`}</p>
    </main>
  );
}
