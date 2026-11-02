import { createRoot } from 'react-dom/client';
import '@tabler/core/dist/css/tabler.min.css';
import './tokens.css';
import './app.css';
import './charts.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
