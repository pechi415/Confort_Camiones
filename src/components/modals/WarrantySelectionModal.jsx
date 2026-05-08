import React, { useState, useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { fallas } from '../../constants/fallas';
import { corregirOrtografiaIA } from '../../utils/iaEngine';

const WarrantySelectionModal = ({
  camionInGarantia,
  setCamionInGarantia,
  pendientesGarantia,
  setPendientesGarantia,
  confirmarGarantia
}) => {
  const [comentariosExtra, setComentariosExtra] = useState('');

  // Limpiar campo de texto al cambiar de camión
  useEffect(() => {
    if (camionInGarantia) {
      setComentariosExtra('');
    }
  }, [camionInGarantia]);

  const handleComentariosChange = (e) => {
    let text = e.target.value;
    if (text.endsWith(' ') || text.endsWith('.')) {
      text = corregirOrtografiaIA(text);
    } else if (text.length === 1) {
      text = text.toUpperCase();
    }
    setComentariosExtra(text);
  };

  if (!camionInGarantia) {
    return null;
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid rgba(255, 255, 255, 0.2)', paddingBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ef4444', margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>
            <ShieldAlert size={26} /> Garantía en Curso
          </h3>
          <button 
            onClick={() => setCamionInGarantia(null)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#1e293b', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            El camión <strong>{camionInGarantia.flota}</strong> tiene pendientes. Selecciona cuáles persisten:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {pendientesGarantia && Object.keys(pendientesGarantia).map(fId => {
              const fallaDef = fallas.find(x => x.id === fId);
              if (!fallaDef) return null;
              
              const isSelected = pendientesGarantia[fId]?.selected || false;
              const comment = pendientesGarantia[fId]?.comment;

              return (
                <label key={fId} className="checkbox-item" style={{
                  padding: '0.8rem',
                  background: isSelected ? 'rgba(239, 68, 68, 0.05)' : '#f9fafb',
                  borderRadius: '10px',
                  border: `1px solid ${isSelected ? '#ef4444' : '#e5e7eb'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem'
                }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      setPendientesGarantia(prev => ({
                        ...prev,
                        [fId]: { ...prev[fId], selected: !prev[fId].selected }
                      }));
                    }}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                      {fallaDef.nombre}
                    </span>
                    {comment && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.1rem' }}>
                        {comment}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
          
          <div style={{ marginTop: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Notas Extras (Opcional)</label>
            <textarea
              className="input-field"
              placeholder="¿Alguna observación adicional sobre este re-ingreso?"
              value={comentariosExtra}
              onChange={handleComentariosChange}
              style={{ width: '100%', minHeight: '75px', resize: 'vertical', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '0.8rem', fontSize: '0.85rem', color: 'var(--primary-black)', background: '#f9fafb' }}
            />
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1.2rem' }}>
          <button 
            style={{ padding: '0.6rem 1.2rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} 
            onClick={() => setCamionInGarantia(null)}
            onMouseOver={(e) => e.target.style.background = '#e2e8f0'}
            onMouseOut={(e) => e.target.style.background = '#f1f5f9'}
          >
            Cancelar
          </button>
          <button
            style={{ 
              padding: '0.6rem 1.2rem', 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              fontWeight: '600', 
              cursor: (!pendientesGarantia || !Object.values(pendientesGarantia).some(item => item?.selected)) ? 'not-allowed' : 'pointer', 
              opacity: (!pendientesGarantia || !Object.values(pendientesGarantia).some(item => item?.selected)) ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            disabled={!pendientesGarantia || !Object.values(pendientesGarantia).some(item => item?.selected)}
            onClick={() => confirmarGarantia(comentariosExtra)}
          >
            Confirmar Re-Ingreso
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarrantySelectionModal;
