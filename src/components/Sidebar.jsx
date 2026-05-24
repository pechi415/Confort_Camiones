import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Blocks, 
  ClipboardList, 
  Settings 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  session, 
  handleLogoutApp
}) => {
  const isAdmin = session?.role?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'admin';
  const navigate = useNavigate();

  const handleNavClick = (tab, path) => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandLogoContainer}>
          <div className={styles.brandLogoText}>CAMIONES</div>
          <div className={styles.brandSubtitle}>PRODUCCIÓN</div>
        </div>
      </div>

      <nav className={styles.navMenu}>
        <div
          className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
          onClick={() => handleNavClick('dashboard', '/dashboard')}
        >
          <LayoutDashboard size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Dashboard Principal
        </div>
        <div
          className={`${styles.navItem} ${activeTab === 'nuevo' ? styles.active : ''}`}
          onClick={() => handleNavClick('nuevo', '/dashboard')}
        >
          <PlusCircle size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Nuevo Reporte
        </div>
        <div
          className={`${styles.navItem} ${activeTab === 'cola' ? styles.active : ''}`}
          onClick={() => handleNavClick('cola', '/cola')}
        >
          <Blocks size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Pila de Mantenimiento
        </div>
        <div 
          className={`${styles.navItem} ${activeTab === 'historial' ? styles.active : ''}`} 
          onClick={() => handleNavClick('historial', '/historial')}
        >
          <ClipboardList size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Historial Analítico
        </div>
        {isAdmin && (
          <div 
            className={`${styles.navItem} ${activeTab === 'usuarios' ? styles.active : ''}`} 
            onClick={() => handleNavClick('usuarios', '/usuarios')}
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
