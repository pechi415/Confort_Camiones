import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const ToastContainer = ({ toasts }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 11000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
      width: 'min(90%, 400px)'
    }}>
      {toasts.map(toast => (
        <div key={toast.id} className="toast-animation" style={{
          background: toast.type === 'error' ? 'rgba(185, 28, 28, 0.9)' : 'rgba(16, 185, 129, 0.9)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'auto',
          border: '1px solid rgba(255,255,255,0.2)',
          fontSize: '0.95rem',
          fontWeight: '500'
        }}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
