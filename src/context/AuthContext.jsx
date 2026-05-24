import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';
import { useUI } from './UIContext';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const { addToast } = useUI();
  
  // TODO: Una vez que implementemos react-router, pasaremos useNavigate() aquí
  const mockSetActiveTab = (tab) => {
    // Almacenamos localmente por si la app recarga antes del refactor de Router
    sessionStorage.setItem('drummond_activeTab', tab);
    // Disparamos un evento para que App temporalmente lo escuche si lo necesita
    window.dispatchEvent(new CustomEvent('tabChange', { detail: tab }));
  };

  const authState = useAuthHook(addToast, mockSetActiveTab);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
