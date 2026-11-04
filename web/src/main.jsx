import { createRoot } from 'react-dom/client';
import '@tabler/core/dist/css/tabler.min.css';
import './tokens.css';
import './app.css';
import './charts.css';
import './school.css';
import './admin.css';
import './guide.css';
import './heat.css';
import './readings.css';
import './alerts.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);

// Installable app (F-05): the worker keeps the page files only; readings are never kept (public/sw.js).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
}
