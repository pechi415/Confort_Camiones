import React from 'react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';

const WarrantyDetailsModal = ({
  selectedGarantiaDetails,
  onClose
}) => {
  if (!selectedGarantiaDetails) return null;

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1.5rem 1.5rem 120px 1.5rem',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div
        className="card modal-content"
        style={{
          maxWidth: '450px',
          width: '100%',
          margin: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          background: 'rgba(215, 205, 185, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(130, 120, 100, 0.4)',
          padding: '1.8rem',
          borderRadius: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.6rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', margin: 0, fontSize: '1.25rem', fontWeight: '900' }}>
            <ShieldAlert size={22} /> Detalles de Garantía
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#1e293b', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: '0.5rem 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', padding: '0.3rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)', marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase' }}>Camión:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--primary-black)' }}>{selectedGarantiaDetails.flota}</div>
          </div>

          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Fallas Pendientes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {selectedGarantiaDetails.motivo_garantia.split(/\s*\|\s*/).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-main)', background: 'white', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <AlertTriangle size={14} color="#ef4444" style={{ marginTop: '1px', flexShrink: 0 }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.03)', fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginBottom: '0.5rem' }}>
            Este camión debe de regresar a taller porque los pendientes seleccionados no fueron solucionados satisfactoriamente.
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
          <button style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.6rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onClick={onClose} onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'} onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarrantyDetailsModal;
