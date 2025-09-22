import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nuova versione disponibile. Vuoi aggiornare?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App pronta per l\'uso offline');
  },
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
