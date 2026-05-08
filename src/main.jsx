import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './industrial-v3.css'
import App from './App.jsx'

// Forzar la desinstalación de CUALQUIER Service Worker viejo que Chrome se niegue a soltar
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister()
        .then(success => {
          if (success) console.log('✅ Service Worker viejo asesinado con éxito.');
        });
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
