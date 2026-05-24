import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './global.css';
import App from './App.jsx'
import { UIProvider } from './context/UIContext'
import { AuthProvider } from './context/AuthContext'
import { TruckProvider } from './context/TruckContext'

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
    <BrowserRouter>
      <UIProvider>
        <AuthProvider>
          <TruckProvider>
            <App />
          </TruckProvider>
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  </StrictMode>,
)
