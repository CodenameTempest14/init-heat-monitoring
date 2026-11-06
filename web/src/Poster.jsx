// P06-02 QR poster #poster (F-14): a printable page for a classroom door. Markup and classes match design/qr-kiosk/poster.html.
import { qrModel, APP_URL, LEVELS } from './poster.js';

const QR = qrModel(APP_URL);

export default function Poster() {
  return (
    <>
      <div className="poster-tools"><button className="btn" type="button" onClick={() => window.print()}>Print this page</button> <span className="text-secondary">(hidden when printed)</span></div>
      <main className="poster">
        <img src="/logo-light.svg" width="140" height="51" alt="" />
        <h1>How hot is our classroom?</h1>
        <p className="lead">Scan to see the live heat index.</p>
        <svg className="qr-code" viewBox={`0 0 ${QR.size} ${QR.size}`} role="img" aria-label={`QR code for ${APP_URL}`} shapeRendering="crispEdges">
          <rect width="100%" height="100%" fill="#fff" /><path d={QR.d} fill="#000" />
        </svg>
        <p className="url">{APP_URL.replace('https://', '')}</p>
        <ul>{LEVELS.map((l) => <li key={l}>{l}</li>)}</ul>
        <p className="note">Heat index levels are PAGASA's. Init is a school project, not an official service.</p>
      </main>
    </>
  );
}
