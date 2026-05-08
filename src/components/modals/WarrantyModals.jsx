import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { fallas } from '../../constants/fallas';

export const WarrantySelectionModal = ({ 
  camionInGarantia, 
  setCamionInGarantia, 
  pendientesGarantia, 
  setPendientesGarantia, 
  confirmarGarantia 
}) => {
  if (!camionInGarantia) return null;

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          padding: '2rem',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '550px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.4)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '50px', height: '50px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ margin: 0, color: 'var(--primary-black)', fontSize: '1.5rem' }}>Anotar Pendientes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Camión {camionInGarantia.flota}: Selecciona las fallas originales que persisten.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
          {fallas.filter(f => (camionInGarantia?.fallas || '').includes(f.nombre)).map(f => {
            const isSelected = !!pendientesGarantia[f.id]?.selected;
            return (
              <div key={f.id} style={{
                background: 'white',
                padding: '0.8rem 1.5rem',
                borderRadius: '50px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                transition: 'all 0.3s',
                borderColor: isSelected ? 'var(--primary-red)' : 'var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: '500', width: '100%' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => setPendientesGarantia(prev => ({
                        ...prev,
                        [f.id]: { ...prev[f.id], selected: !prev[f.id]?.selected }
                      }))}
                      style={{ width: '20px', height: '20px' }}
                    />
                    {f.nombre}
                  </label>
                </div>
                {isSelected && (
                  <div className="fade-in" style={{ paddingLeft: '2.5rem' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Explica qué sigue fallando..."
                      value={pendientesGarantia[f.id]?.comment || ''}
                      onChange={(e) => setPendientesGarantia(prev => ({
                        ...prev,
                        [f.id]: { ...prev[f.id], comment: e.target.value }
                      }))}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setCamionInGarantia(null)} style={{ flex: 1 }}>Cancelar</button>
          <button className="btn btn-primary" onClick={confirmarGarantia} style={{ flex: 2 }}>Confirmar Garantía</button>
        </div>
      </div>
    </div>
  );
};

export const WarrantyDetailsModal = ({ selectedGarantiaDetails, onClose }) => {
  if (!selectedGarantiaDetails) return null;

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(15px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '450px',
          width: '100%',
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <ShieldAlert size={32} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Fallas Pendientes</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Equipo {selectedGarantiaDetails.flota}</p>
        </div>

        <div style={{ background: '#fff5f5', padding: '1.5rem', borderRadius: '12px', color: '#991b1b', maxHeight: '300px', overflowY: 'auto' }}>
          {(selectedGarantiaDetails.motivo_garantia || '').split(/\s*[|,]\s*/).filter(Boolean).map((item, idx) => (
            <div key={idx} style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.6rem' }}>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', background: '#ef4444' }} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};
