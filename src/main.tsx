import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource-variable/dm-sans';
import './styles.css';
import { ErrorBoundary } from './components/ErrorBoundary';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>);
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => {
  const hadController = !!navigator.serviceWorker.controller; let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !refreshing) { refreshing = true; location.reload(); } });
  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => { /* Offline caching is optional. */ });
});
