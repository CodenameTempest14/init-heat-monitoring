// F-22 admin guide (#guide, D-034): plain text for the admins (high-school students), readable without signing in.
// Markup and classes match design/admin-guide/guide.html (the approved design); the wording is a draft until a teacher reviews it.
// #guide opens at the top; #guide/room, #guide/interval and #guide/alerts (the How? links on the admin page) open at that part.
import { useEffect } from 'react';

const Warn = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2z" /><path d="M12 10v4M12 17.5v.01" /></svg>;

const SECTIONS = [
  ['start', 'Before you start'],
  ['room', 'Room'],
  ['interval', 'Reporting interval'],
  ['offsets', 'Temperature and humidity offsets'],
  ['alerts', 'Heat alerts'],
  ['wrong', 'If something looks wrong'],
];

const Sec = ({ n, id, children }) => (
  <section className="gd-sec" id={id}><h2><span className="gd-num">{n}</span>{SECTIONS[n - 1][1]}</h2>{children}</section>
);

export default function Guide({ section }) {
  useEffect(() => {
    const el = section ? document.getElementById(section) : null;
    if (el) el.scrollIntoView();
  }, [section]);

  return (
    <>
      <a className="school-back" href="#admin">‹ Admin</a>
      <h2 className="visually-hidden">Admin guide</h2>
      <p className="gd-intro">How to set up the device. Read it before you change anything.</p>
      <nav className="gd-toc" aria-label="Sections"><p>In this guide</p><ol>
        {SECTIONS.map(([id, title]) => <li key={id}><a href={`#guide/${id}`}>{title}</a></li>)}
      </ol></nav>

      <Sec n={1} id="start">
        <p>An admin is a person who can change how the device works. Only a few people have the password.</p>
        <p>When you press <strong>Save changes</strong>, the new settings are stored. The device picks them up within about a minute. You do not need to touch the device.</p>
        <p>Everyone can look at the readings. Only admins can change the settings.</p>
      </Sec>

      <Sec n={2} id="room">
        <h3>What it does</h3>
        <p>It tells people which room the device is in right now.</p>
        <h3>When to change it</h3>
        <p>Only when you move the device to another room.</p>
        <h3>Steps</h3>
        <ol><li>Sign in on the Admin page.</li><li>Under <strong>Room</strong>, type the new name, for example <strong>Room 204</strong>.</li><li>Press <strong>Save changes</strong>.</li></ol>
        <div className="gd-note"><Warn /><span>Type a room name only. Never type a person's name. Old readings keep their old room.</span></div>
      </Sec>

      <Sec n={3} id="interval">
        <h3>What it does</h3>
        <p>It is how often the device sends a reading. 60 means one reading every 60 seconds.</p>
        <h3>When to change it</h3>
        <p>Keep it at <strong>60</strong> when the device runs on a power bank. A power bank can switch itself off if the device uses very little power for too long. A longer time is fine only on a wall charger.</p>
        <h3>Steps</h3>
        <ol><li>Under <strong>Device</strong>, find <strong>Reporting interval</strong>.</li><li>Type a number of seconds between 60 and 3600.</li><li>Press <strong>Save changes</strong>.</li></ol>
        <div className="gd-example"><span className="gd-label">Example</span>Wall charger, and you only need a reading every 5 minutes: 5 × 60 = <strong>300</strong>.</div>
      </Sec>

      <Sec n={4} id="offsets">
        <h3>What it does</h3>
        <p>An offset fixes a sensor that reads a little too high or too low. It is added to every new reading.</p>
        <h3>When to change it</h3>
        <p>Only after you compare the device with a thermometer you trust. If you have not done that, leave both at 0.0.</p>
        <h3>Steps</h3>
        <ol><li>Put the trusted thermometer next to the device, out of the sun.</li><li>Wait 30 minutes.</li><li>Write down both numbers. Do this 3 times, 5 minutes apart.</li><li>For each pair, subtract: trusted number minus device number.</li><li>Take the average of the 3 answers.</li><li>Type it in <strong>Temperature offset</strong> and press <strong>Save changes</strong>.</li></ol>
        <div className="gd-example"><span className="gd-label">Example</span>The device says 31.0 °C. The trusted thermometer says 30.2 °C. The offset is 30.2 − 31.0 = <strong>−0.8</strong>.</div>
        <p>Humidity works the same way, with the trusted humidity number.</p>
        <div className="gd-note"><Warn /><span>An offset changes new readings only. Old readings stay as they were.</span></div>
      </Sec>

      <Sec n={5} id="alerts">
        <div className="gd-note"><Warn /><span>Alerts are coming in a later step. These settings are saved now but nothing is sent yet.</span></div>
        <h3>The levels</h3>
        <p>These names and numbers are from PAGASA. They use the heat index in °C.</p>
        <table className="gd-table"><thead><tr><th>Level</th><th>Heat index</th></tr></thead><tbody>
          <tr><td>Caution</td><td>27 to 32</td></tr>
          <tr><td>Extreme caution</td><td>33 to 41</td></tr>
          <tr><td>Danger</td><td>42 to 51</td></tr>
          <tr><td>Extreme danger</td><td>52 and up</td></tr></tbody></table>
        <h3>Alert at heat index</h3>
        <p>The heat index where an alert is sent. <strong>42</strong> means an alert when the room reaches Danger.</p>
        <h3>Quiet period</h3>
        <p>After an alert, no new alert is sent for this many minutes. With 60, you get at most one alert an hour.</p>
        <h3>Steps</h3>
        <ol><li>Under <strong>Heat alerts</strong>, type the heat index for <strong>Alert at heat index</strong>.</li><li>Type the minutes for <strong>Quiet period</strong>.</li><li>Press <strong>Save changes</strong>.</li></ol>
      </Sec>

      <Sec n={6} id="wrong">
        <dl className="gd-qa">
          <dt>It says "Not saved"</dt><dd>A number is outside its range. The range is under each name. Fix the number and press Save again.</dd>
          <dt>It says "Not an admin"</dt><dd>You signed in with an account that is not an admin. Sign out and use the admin account. Ask the person who set it up.</dd>
          <dt>The page says Offline</dt><dd>No reading came in for 2 minutes. Check that the device has power and the Wi-Fi hotspot is on. It comes back by itself within a minute or two.</dd>
        </dl>
      </Sec>
    </>
  );
}
