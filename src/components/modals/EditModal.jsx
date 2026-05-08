import React from 'react';
import { Truck, ShieldCheck } from 'lucide-react';
import { fallas } from '../../constants/fallas';

const EditModal = ({
  camionEditando,
  setCamionEditando,
  editingGroupContext,
  setEditingGroupContext,
  operadorEdit,
  setOperadorEdit,
  dictamenEdit,
  setDictamenEdit,
  selectedDanosEdit,
  observacionesEdit,
  handleDanoToggleEdit,
  handleObsChangeEdit,
  guardarEdicionAvanzada,
  sincronizarModal,
  session,
  corregirNombresIA,
  corregirOrtografiaIA
}) => {
  if (!camionEditando) return null;

  return (
          <div
            key={camionEditando.id} 
            className="fade-in"
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              className="card"
              style={{
                maxWidth: '650px',
                width: '100%',
                padding: '2.5rem',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(227, 25, 55, 0.1)', padding: '0.6rem', borderRadius: '12px' }}>
                    <Truck size={24} color="#e11d48" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.3rem', fontWeight: '900' }}>
                      {editingGroupContext === 'Mantenimiento' ? 'Dictamen Técnico' : 'Edición del Diagnóstico'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>
                      {editingGroupContext === 'Mantenimiento' 
                        ? `Registrando hallazgos para el equipo ${camionEditando?.flota}`
                        : `Corrija fallas y operador para el equipo ${camionEditando?.flota}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setCamionEditando(null)} 
                  style={{ 
                    background: 'rgba(0,0,0,0.05)', 
                    border: 'none', 
                    color: '#64748b', 
                    cursor: 'pointer', 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.4rem', 
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Campos Principales (Ocultos en Dictamen) */}
                {editingGroupContext !== 'Mantenimiento' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem' }}>
                    <div>
                      <label className="input-label">N° Flota</label>
                      <input type="text" className="input-field" value={camionEditando?.flota || ''} disabled style={{ background: '#f8fafc', fontWeight: 'bold' }} />
                    </div>
                    <div>
                      <label className="input-label">
                        {editingGroupContext === 'General' ? 'Nombres de Operadores (Completo)' : `Nombre del Operador`}
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={operadorEdit}
                        onChange={e => {
                          const val = e.target.value;
                          const capitalized = val.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
                          setOperadorEdit(capitalized);
                        }}
                        placeholder={editingGroupContext === 'General' ? "Nombres de todos los conductores..." : "Nombre del conductor para este grupo..."}
                        style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.1)' }}
                      />
                    </div>
                  </div>
                )}

                {/* Selector de Grupo Estilo Tabs */}
                {editingGroupContext !== 'Mantenimiento' && (session.role === 'admin' || session.role === 'supervisor') && (
                  <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                    {(session.role === 'admin' ? ['General', 'G1', 'G2', 'G3', 'Mantenimiento'] : (session.grupo ? [`G${session.grupo}`] : ['General'])).map(g => (
                      <button
                        key={g}
                        onClick={() => {
                          setEditingGroupContext(g);
                          sincronizarModal(camionEditando, g);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: editingGroupContext === g ? (g === 'Mantenimiento' ? '#7c3aed' : '#e11d48') : 'transparent',
                          color: editingGroupContext === g ? 'white' : '#64748b',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'block'
                        }}
                      >
                        {g === 'General' ? 'General (Unificado)' : g === 'Mantenimiento' ? 'Dictamen Técnico' : `Reporte ${g}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Vista Específica de Dictamen Técnico */}
                {editingGroupContext === 'Mantenimiento' && (
                  <div className="fade-in" style={{ marginTop: '1rem', background: '#f5f3ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
                    <label className="input-label" style={{ color: '#7c3aed', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={20} /> Hallazgos Técnicos de Mantenimiento
                    </label>
                    <textarea
                      className="input-field"
                      style={{ 
                        width: '100%', 
                        minHeight: '150px', 
                        padding: '1rem', 
                        fontSize: '0.9rem', 
                        borderRadius: '8px',
                        border: '1px solid #c4b5fd',
                        background: 'white'
                      }}
                      placeholder="Escriba aquí el dictamen técnico final, causas encontradas y reparaciones sugeridas..."
                      value={dictamenEdit}
                      onChange={(e) => setDictamenEdit(e.target.value)}
                    />
                    <p style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: '#6d28d9', fontStyle: 'italic' }}>
                      * Este diagnóstico será visible para todos los grupos en la Ficha Técnica.
                    </p>
                  </div>
                )}

                {/* Checklist de Fallas Estilo Premium (Solo si no es Dictamen) */}
                {editingGroupContext !== 'Mantenimiento' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                      {editingGroupContext === 'General' ? 'Reporte de Fallas General' : `Fallas Reportadas`}
                    </label>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8rem'
                    }}>
                      {fallas.map(falla => (
                        <div
                          key={falla.id}
                          style={{
                            background: selectedDanosEdit[falla.id] ? 'rgba(255,255,255,0.9)' : 'rgba(255, 255, 255, 0.6)',
                            padding: '0.8rem 1.2rem',
                            borderRadius: '14px',
                            border: selectedDanosEdit[falla.id] ? '1px solid #e11d48' : '1px solid rgba(0,0,0,0.05)',
                            transition: 'all 0.2s',
                            boxShadow: selectedDanosEdit[falla.id] ? '0 4px 12px rgba(227, 25, 55, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <input
                                type="checkbox"
                                checked={!!selectedDanosEdit[falla.id]}
                                onChange={() => handleDanoToggleEdit(falla.id)}
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  borderRadius: '6px',
                                  border: `2px solid ${selectedDanosEdit[falla.id] ? '#e11d48' : '#cbd5e1'}`,
                                  backgroundColor: selectedDanosEdit[falla.id] ? '#e11d48' : 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  flexShrink: 0
                                }}
                              />
                              {selectedDanosEdit[falla.id] && (
                                <div style={{
                                  position: 'absolute',
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '2px',
                                  backgroundColor: 'white',
                                  pointerEvents: 'none'
                                }} />
                              )}
                            </div>
                            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: selectedDanosEdit[falla.id] ? '#0f172a' : '#475569', flex: 1 }}>
                              {falla.nombre}
                            </span>
                          </div>

                          {selectedDanosEdit[falla.id] && (
                            <div className="fade-in" style={{ marginTop: '0.8rem', paddingLeft: '2.5rem' }}>
                              <textarea
                                className="input-field"
                                style={{
                                  width: '100%',
                                  minHeight: '60px',
                                  padding: '0.6rem',
                                  fontSize: '0.85rem',
                                  background: 'white',
                                  borderRadius: '8px',
                                  border: '1px solid #e2e8f0'
                                }}
                                placeholder={`Observación detallada de la falla...`}
                                value={observacionesEdit[falla.id] || ''}
                                onChange={(e) => handleObsChangeEdit(falla.id, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer del Modal */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setCamionEditando(null)}>Descartar Cambios</button>
                  <button
                    className="btn btn-primary"
                    onClick={guardarEdicionAvanzada}
                    style={{ 
                      flex: 2, 
                      justifyContent: 'center',
                      background: editingGroupContext === 'Mantenimiento' ? '#7c3aed' : 'var(--primary-red)',
                      borderColor: editingGroupContext === 'Mantenimiento' ? '#7c3aed' : 'var(--primary-red)',
                      boxShadow: '0 4px 15px rgba(227, 25, 55, 0.3)'
                    }}
                  >
                    Guardar {editingGroupContext === 'Mantenimiento' ? 'Dictamen Técnico' : 'Diagnóstico'}
                  </button>
                </div>
              </div>
            </div>
          </div>
  );
};

export default EditModal;
