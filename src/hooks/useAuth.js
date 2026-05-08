import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { usuarioService } from '../services/usuarioService';

export const useAuth = (addToast, setActiveTab) => {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('drummond_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [pendingPasswordChangeUser, setPendingPasswordChangeUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (usuarioLogin && passwordLogin) {
      setLoadingAuth(true);
      const usernameReq = usuarioLogin.trim().toLowerCase();
      addToast(`🔍 Autenticando acceso para ${usernameReq}...`, "info");

      try {
        const usuarioActivo = await usuarioService.login(usernameReq, passwordLogin);

        if (!usuarioActivo) {
          setLoadingAuth(false);
          return addToast(`❌ Credenciales incorrectas para "${usernameReq}".`, "error");
        }

        if (usuarioActivo.estado === 'Inactivo') {
          setLoadingAuth(false);
          return addToast(`🚫 ACCESO DENEGADO: La cuenta "${usernameReq}" figura como INACTIVA.`, "error");
        }

        if (usuarioActivo.firstTime) {
          setPendingPasswordChangeUser(usuarioActivo);
          setLoadingAuth(false);
          return;
        }

        const nuevaSesion = {
          user: { username: usernameReq },
          role: usuarioActivo.role,
          mina: usuarioActivo.mina === 'Ambas' || usuarioActivo.mina === 'Global' ? 'Global' : usuarioActivo.mina,
          grupo: usuarioActivo.grupo || '1',
          nombre: usuarioActivo.nombre,
          id: usuarioActivo.id
        };
        setSession(nuevaSesion);
        localStorage.setItem('drummond_session', JSON.stringify(nuevaSesion));
        if (setActiveTab) setActiveTab('dashboard');
      } catch (err) {
        let msg = err.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Credenciales incorrectas. Verifica tu usuario y contraseña.';
        }
        addToast(`❌ Error: ${msg}`, "error");
      } finally {
        setLoadingAuth(false);
      }
    } else {
      addToast("Por favor ingrese usuario y contraseña.", "warning");
    }
  };

  const handlePasswordUpdate = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword || newPassword.length < 5) {
      return addToast("La contraseña debe ser de al menos 5 caracteres de seguridad.", "warning");
    }
    if (newPassword !== confirmPassword) {
      return addToast("⚠️ Las contraseñas no coinciden. Por favor, asegúrate de escribirlas idénticas.", "warning");
    }

    setLoadingAuth(true);
    try {
      await usuarioService.updateUsuario(pendingPasswordChangeUser.id, {
        password: newPassword,
        firstTime: false
      });

      const usuarioActivo = { ...pendingPasswordChangeUser, password: newPassword, firstTime: false };
      const nuevaSesion = {
        user: { username: usuarioActivo.username },
        role: usuarioActivo.role,
        mina: usuarioActivo.mina === 'Ambas' || usuarioActivo.mina === 'Global' ? 'Global' : usuarioActivo.mina,
        grupo: usuarioActivo.grupo || '1',
        nombre: usuarioActivo.nombre,
        id: usuarioActivo.id
      };
      setSession(nuevaSesion);
      localStorage.setItem('drummond_session', JSON.stringify(nuevaSesion));
      if (setActiveTab) setActiveTab('dashboard');
      addToast("✅ Contraseña actualizada con éxito. ¡Bienvenido al sistema!", "success");

      setPendingPasswordChangeUser(null);
      setNewPassword('');
      setConfirmPassword('');
      setUsuarioLogin('');
      setPasswordLogin('');
    } catch (err) {
      addToast("Error al actualizar contraseña: " + err.message, "error");
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = async (callbacks = []) => {
    await supabase.auth.signOut();
    setSession(null);
    localStorage.removeItem('drummond_session');
    sessionStorage.removeItem('drummond_activeTab');
    localStorage.removeItem('drummond_report_form');
    
    setUsuarioLogin('');
    setPasswordLogin('');
    setPendingPasswordChangeUser(null);
    if (setActiveTab) setActiveTab('dashboard');
    
    // Ejecutar callbacks adicionales (reseteo de estados en App.jsx)
    callbacks.forEach(cb => cb());
  };

  return {
    session,
    setSession,
    pendingPasswordChangeUser,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    usuarioLogin,
    setUsuarioLogin,
    passwordLogin,
    setPasswordLogin,
    loadingAuth,
    handleLogin,
    handlePasswordUpdate,
    logout
  };
};
