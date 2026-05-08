import React from 'react';
import { ShieldAlert, AlertCircle, Info } from 'lucide-react';

const GlobalModal = ({ modalConfig, onConfirm, onCancel, setModalConfig }) => {
  if (!modalConfig.isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div className="modal-pop" style={{
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        width: 'min(100%, 500px)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.4)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-black)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {modalConfig.type === 'prompt' ? <ShieldAlert size={28} color="#ef4444" /> :
            modalConfig.type === 'confirm' ? <AlertCircle size={28} color="#f59e0b" /> :
              <Info size={28} color="#2563eb" />}
          {modalConfig.title}
        </h3>
        <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '1.05rem', margin: '0 0 1.5rem 0', whiteSpace: 'pre-wrap' }}>
          {modalConfig.message}
        </p>

        {modalConfig.showInput && (
          <div style={{ marginBottom: '2rem' }}>
            <input
              autoFocus
              type="text"
              className="input-field"
              placeholder={modalConfig.inputPlaceholder}
              value={modalConfig.inputValue}
              onChange={(e) => setModalConfig(prev => ({ ...prev, inputValue: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
              style={{
                fontSize: '1.2rem',
                textAlign: 'center',
                letterSpacing: '2px',
                fontWeight: 'bold',
                padding: '1rem',
                border: '2px solid #e5e7eb'
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          {(modalConfig.type === 'confirm' || modalConfig.type === 'prompt') && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (onCancel) onCancel();
                setModalConfig(prev => ({ ...prev, isOpen: false }));
              }}
            >
              {modalConfig.cancelText}
            </button>
          )}
          <button
            className="btn btn-primary"
            style={{
              backgroundColor: modalConfig.type === 'prompt' ? '#ef4444' : 'var(--primary-red)'
            }}
            onClick={onConfirm}
          >
            {modalConfig.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalModal;
