import React, { useState, useEffect } from 'react';
import { RefreshCcw, LogOut, Download } from 'lucide-react';

const Header = ({
  activeTab,
  session,
  handleRefresh,
  loadingData,
  handleLogoutApp
}) => {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleInstallAvailable = () => {
      if (window.deferredPrompt) {
        setInstallPrompt(window.deferredPrompt);
      }
    };

    if (window.deferredPrompt) {
      setInstallPrompt(window.deferredPrompt);
    }

    window.addEventListener('pwa-install-available', handleInstallAvailable);

    // Si ya fue instalada
    window.addEventListener('appinstalled', () => {
      setInstallPrompt(null);
      window.deferredPrompt = null;
    });

    return () => window.removeEventListener('pwa-install-available', handleInstallAvailable);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setInstallPrompt(null);
    } else {
      console.log('User dismissed the install prompt');
    }
  };
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Panel de Control - Confort';
      case 'nuevo': return 'Nuevo Reporte';
      case 'cola': return 'Cola de Priorización Taller';
      case 'historial': return 'Historial de Mantenimientos';
      case 'usuarios': return 'Gestión de Usuarios';
      default: return 'Drummond Confort';
    }
  };

  return (
    <header className="page-header">
      <h1 className="page-title">{getTitle()}</h1>
      <div className="user-profile" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {/* Botón Instalar PWA */}
          {installPrompt && (
            <button
              onClick={handleInstallClick}
              title="Instalar App"
              style={{
                background: '#ef4444',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
              }}
            >
              <Download size={16} />
              <span className="desktop-only">Instalar App</span>
            </button>
          )}

          {/* v11.1: Botón de Actualización Rápida (Solo Móvil) */}
          <button
            onClick={handleRefresh}
            className="btn-refresh-header"
            title="Sincronizar y Limpiar Formulario"
            style={{
              background: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              borderRadius: '12px',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: '#2563eb'
            }}
          >
            <RefreshCcw size={20} className={loadingData ? 'spin-animation' : ''} />
          </button>

          <div style={{ textAlign: 'right' }} className="desktop-only">
            <div style={{ fontWeight: '700' }}>{session?.nombre || 'Usuario'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mina {session?.mina || 'N/A'}</div>
          </div>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '50%', backgroundColor: '#ef4444',
            color: 'white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem'
          }}>
            {(session?.nombre || 'U').charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Botón Logout Rápido para Móviles (v1.9.62) */}
        <button
          className="mobile-only"
          onClick={handleLogoutApp}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '0.4rem',
            borderRadius: '8px',
            marginLeft: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Cerrar Sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
