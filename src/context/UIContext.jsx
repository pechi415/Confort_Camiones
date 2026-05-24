import React, { createContext, useState, useCallback, useContext } from 'react';

const UIContext = createContext();

export const useUI = () => {
  return useContext(UIContext);
};

export const UIProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'info', title: '', message: '', confirmText: 'Aceptar', cancelText: 'Cancelar',
    onConfirm: null, onCancel: null, showInput: false, inputPlaceholder: '', inputValue: '', expectedValue: ''
  });

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const showConfirm = (opts) => {
    setModalConfig({
      isOpen: true,
      type: opts.type || 'info',
      title: opts.title || 'Atención',
      message: opts.message || '',
      confirmText: opts.confirmText || 'Aceptar',
      cancelText: opts.cancelText || 'Cancelar',
      onConfirm: opts.onConfirm || null,
      onCancel: opts.onCancel || null,
      showInput: opts.type === 'prompt',
      inputPlaceholder: opts.placeholder || '',
      inputValue: '',
      expectedValue: opts.expectedValue || ''
    });
  };

  const handleModalConfirm = (inputValue) => {
    if (modalConfig.type === 'prompt' && modalConfig.expectedValue) {
      if (inputValue !== modalConfig.expectedValue) {
        addToast("❌ El número ingresado no coincide.", "error");
        return;
      }
    }
    if (modalConfig.onConfirm) modalConfig.onConfirm(inputValue);
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  return (
    <UIContext.Provider value={{ toasts, addToast, modalConfig, showConfirm, handleModalConfirm, closeModal, setModalConfig }}>
      {children}
    </UIContext.Provider>
  );
};
