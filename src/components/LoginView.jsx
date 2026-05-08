import React from 'react';
import ToastContainer from './ui/ToastContainer';
import GlobalModal from './ui/GlobalModal';

const LoginView = ({
  pendingPasswordChangeUser,
  handlePasswordUpdate,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  loadingAuth,
  handleLogin,
  usuarioLogin,
  setUsuarioLogin,
  passwordLogin,
  setPasswordLogin,
  toasts,
  modalConfig,
  handleModalConfirm,
  setModalConfig
}) => {
  if (pendingPasswordChangeUser) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
        <ToastContainer toasts={toasts} />
        <GlobalModal
          modalConfig={modalConfig}
          onConfirm={handleModalConfirm}
          onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
          setModalConfig={setModalConfig}
        />

        <div className="fade-in" style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: '#fef2f2', width: '60px', height: '60px', borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#ef4444', fontSize: '1.5rem' }}>🔐</div>
            <h1 style={{ color: '#1f2937', margin: 0, fontSize: '1.4rem' }}>Actualización Requerida</h1>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>Hola, <b>{pendingPasswordChangeUser.nombre}</b>. Por políticas de seguridad, debes registrar una nueva clave antes de ingresar al sistema.</p>
          </div>

          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="input-group">
              <label className="input-label">📝 Define tu Nueva Contraseña</label>
              <input
                type="password"
                className="input-field"
                placeholder="Mínimo 5 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ border: '2px solid #3b82f6' }}
                required
              />
            </div>
            <div className="input-group" style={{ marginTop: '-0.5rem' }}>
              <label className="input-label">Confirma tu Contraseña</label>
              <input
                type="password"
                className="input-field"
                placeholder="Escríbela de nuevo idéntica"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ border: '2px solid #3b82f6' }}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loadingAuth}
              style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', background: '#2563eb', borderColor: '#2563eb', opacity: loadingAuth ? 0.7 : 1 }}
            >
              {loadingAuth ? '⏳ Procesando...' : 'Actualizar y Acceder'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
      <ToastContainer toasts={toasts} />
      <GlobalModal
        modalConfig={modalConfig}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        setModalConfig={setModalConfig}
      />

      <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#ef4444', margin: 0, fontSize: '1.8rem', letterSpacing: '-1px' }}>DRUMMOND</h1>
          <p style={{ color: '#1f2937', fontWeight: 'bold', margin: '0.2rem 0', fontSize: '1.2rem' }}>Programa de Confort Camiones</p>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Plataforma Interna Asegurada</span>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="input-group">
            <label className="input-label">Usuario</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ejemplo: jperez"
              value={usuarioLogin}
              onChange={e => setUsuarioLogin(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))} // Solo alfanuméricos
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={passwordLogin}
              onChange={e => setPasswordLogin(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loadingAuth}
            style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', opacity: loadingAuth ? 0.7 : 1 }}
          >
            {loadingAuth ? '⏳ Validando...' : '🔒 Ingresar al Sistema'}
          </button>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '1rem' }}>
            El estado de conexión en vivo con Supabase está operativo.
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
