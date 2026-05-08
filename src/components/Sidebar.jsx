import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Blocks, 
  ClipboardList, 
  Settings 
} from 'lucide-react';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  session, 
  handleLogoutApp, 
  setMina, 
  setGrupo,
  mina 
}) => {
  const isAdmin = session?.role?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'admin';

  const handleNewReportClick = () => {
    setActiveTab('nuevo');
    // Automatización de Datos por Usuario (v1.6.0)
    if (!isAdmin) {
      setMina(session?.mina === 'Global' ? mina : session?.mina);
      setGrupo(session?.grupo);
    }
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo-container">
          <div className="brand-logo-text">CAMIONES</div>
          <div className="brand-subtitle">PRODUCCIÓN</div>
        </div>
      </div>

      <nav className="nav-menu">
        <div
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Dashboard Principal
        </div>
        <div
          className={`nav-item ${activeTab === 'nuevo' ? 'active' : ''}`}
          onClick={handleNewReportClick}
        >
          <PlusCircle size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Nuevo Reporte
        </div>
        <div
          className={`nav-item ${activeTab === 'cola' ? 'active' : ''}`}
          onClick={() => setActiveTab('cola')}
        >
          <Blocks size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Pila de Mantenimiento
        </div>
        <div 
          className={`nav-item ${activeTab === 'historial' ? 'active' : ''}`} 
          onClick={() => setActiveTab('historial')}
        >
          <ClipboardList size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Historial Analítico
        </div>
        {isAdmin && (
          <div 
            className={`nav-item ${activeTab === 'usuarios' ? 'active' : ''}`} 
            onClick={() => setActiveTab('usuarios')}
          >
            <Settings size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Gestor de Cuentas
          </div>
        )}
      </nav>

      <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '50px', 
            background: 'rgba(255,255,255,0.1)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', 
            fontWeight: 'bold', color: 'white' 
          }}>
            {session?.nombre?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>{session?.nombre || 'Usuario'}</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>Mina {session?.mina || 'N/A'}</div>
          </div>
        </div>
        <button
          style={{ 
            width: '100%', padding: '0.5rem', background: 'transparent', 
            border: '1px solid rgba(255,255,255,0.3)', color: 'white', 
            borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' 
          }}
          onClick={handleLogoutApp}
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
