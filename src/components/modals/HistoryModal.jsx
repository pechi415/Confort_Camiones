import React from 'react';
import { 
  Truck, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar,
  FileText,
  User,
  UserCheck,
  MapPin,
  Users
} from 'lucide-react';
import { fallas } from '../../constants/fallas';
import { limpiarFallasIA, reaccionarAcentos, corregirOrtografiaIA } from '../../utils/iaEngine';
import { formatGrupo, formatFechaCorta } from '../../utils/formatters';

const HistoryModal = ({ selectedReport, onClose }) => {
  if (!selectedReport) return null;

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1.5rem 1.5rem 120px 1.5rem',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
      onClick={onClose}
    >
      <style>{`
        @media (max-width: 1024px) {
          .modal-content { 
            max-width: 94vw !important; 
            width: 94vw !important; 
            min-width: 94vw !important;
          }
        }
      `}</style>
      <div
        className="card modal-content"
        style={{
          maxWidth: '500px',
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
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', borderBottom: '2px solid rgba(255, 255, 255, 0.2)', paddingBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', padding: '0.7rem', borderRadius: '16px', color: '#ffffff', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
              <Truck size={28} strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.35rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
                Ficha Técnica • {selectedReport.flota}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#475569', fontSize: '0.75rem', fontWeight: '800', background: 'rgba(255,255,255,0.4)', padding: '0.15rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <MapPin size={12} strokeWidth={2.5} /> {selectedReport.mina}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#475569', fontSize: '0.75rem', fontWeight: '800', background: 'rgba(255,255,255,0.4)', padding: '0.15rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <Users size={12} strokeWidth={2.5} /> {formatGrupo(selectedReport.grupo)}
                </span>
                {selectedReport.atencion && (
                  <span style={{
                    background: selectedReport.atencion === 'CRÍTICA' ? '#fee2e2' : selectedReport.atencion === 'ALTA' ? '#fef3c7' : '#dcfce7',
                    color: selectedReport.atencion === 'CRÍTICA' ? '#b91c1c' : selectedReport.atencion === 'ALTA' ? '#b45309' : '#15803d',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    border: `1px solid ${selectedReport.atencion === 'CRÍTICA' ? '#fca5a5' : selectedReport.atencion === 'ALTA' ? '#fde68a' : '#86efac'}`,
                    display: 'flex', alignItems: 'center'
                  }}>
                    {selectedReport.atencion}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}>×</button>
        </div>

        {/* Sección: Descripción de Fallas */}
        <div style={{ marginBottom: '1.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem' }}>
            <AlertCircle size={16} color="#38bdf8" strokeWidth={2.5} />
            <label style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', fontWeight: '900', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Descripción de Fallas:</label>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.8rem', borderRadius: '18px', border: '1px solid rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(5px)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)', maxHeight: '350px', overflowY: 'auto' }}>
            {limpiarFallasIA(selectedReport.fallas)
              .map(f => {
                // Buscamos el impacto oficial y el icono para ordenar y renderizar
                const fNombreLimpio = reaccionarAcentos(f.falla.toLowerCase());
                const infoFalla = fallas.find(orig => 
                  reaccionarAcentos(orig.nombre.toLowerCase()) === fNombreLimpio ||
                  (orig.aliases && orig.aliases.some(alias => reaccionarAcentos(alias.toLowerCase()) === fNombreLimpio))
                );
                return { 
                  ...f, 
                  falla: infoFalla ? infoFalla.nombre : f.falla,
                  impacto: infoFalla ? infoFalla.impacto : 0, 
                  icon: infoFalla ? infoFalla.icon : null 
                };
              })
              .sort((a, b) => b.impacto - a.impacto)
              .map((f, i, arr) => {
                const IconoFalla = f.icon || FileText;
                const colorFalla = f.impacto >= 25 ? '#ef4444' : f.impacto >= 10 ? '#f59e0b' : '#10b981';
                return (
                <div key={i} style={{ 
                  marginBottom: i === arr.length - 1 ? 0 : '0.8rem', 
                  padding: '0.8rem', 
                  backgroundColor: 'rgba(255, 255, 255, 0.6)', 
                  borderRadius: '14px',
                  border: '1px solid rgba(0,0,0,0.02)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem' }}>
                     <IconoFalla size={18} strokeWidth={1.5} color={colorFalla} style={{ flexShrink: 0 }} />
                     {f.falla}
                  </div>
                  {f.obs !== '-' && (
                    <div style={{ 
                      marginLeft: '1.4rem', 
                      marginTop: '0.5rem', 
                      fontSize: '0.88rem', 
                      color: '#475569', 
                      fontStyle: 'italic',
                      borderLeft: '3px solid #38bdf8',
                      paddingLeft: '0.8rem',
                      lineHeight: '1.4'
                    }}>
                       "{f.obs}"
                    </div>
                  )}
                </div>
                );
              })}
          </div>
        </div>

        {/* Sección: Dictamen Técnico */}
        {selectedReport.dictamen_tecnico && (
          <div style={{ marginBottom: '1.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem' }}>
              <ShieldCheck size={16} color="#c084fc" strokeWidth={2.5} />
              <label style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', fontWeight: '900', color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Dictamen Técnico:</label>
            </div>
            <div style={{ background: 'rgba(124, 58, 237, 0.08)', padding: '1.2rem', borderRadius: '18px', border: '1px solid rgba(124, 58, 237, 0.25)', color: '#4c1d95', lineHeight: '1.6', fontSize: '1.05rem', fontWeight: '400', backdropFilter: 'blur(5px)' }}>
              {corregirOrtografiaIA(selectedReport.dictamen_tecnico)}
            </div>
          </div>
        )}

        {/* Sección: Fallas Pendientes de Garantía */}
        {selectedReport.motivo_garantia && (
          <div style={{ marginBottom: '1.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem' }}>
              <ShieldAlert size={16} color="#f87171" strokeWidth={2.5} />
              <label style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', fontWeight: '900', color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Garantía Pendiente:</label>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.2rem', borderRadius: '18px', border: '1px solid rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(5px)' }}>
              <div style={{ fontSize: '1rem', color: '#991b1b', lineHeight: '1.6', fontWeight: '400' }}>
                {selectedReport.motivo_garantia.split(/\s*[|,]\s*/).filter(Boolean).map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>•</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid de Responsables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.8rem' }}>
          <div style={{ background: 'rgba(3, 105, 161, 0.1)', padding: '1.1rem', borderRadius: '18px', border: '1px solid rgba(3, 105, 161, 0.2)', backdropFilter: 'blur(4px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
              <UserCheck size={14} strokeWidth={2.5} color="#0369a1" />
              <span style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supervisores</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(selectedReport.supervisor || 'N/A').split(/\s*[|,]\s*/).filter(Boolean).map((s, idx) => (
                <span key={idx} style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '500', lineHeight: '1.3', paddingBottom: '0.2rem', borderBottom: idx !== (selectedReport.supervisor || 'N/A').split(/\s*[|,]\s*/).filter(Boolean).length - 1 ? '1px dashed rgba(3, 105, 161, 0.2)' : 'none' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(71, 85, 105, 0.1)', padding: '1.1rem', borderRadius: '18px', border: '1px solid rgba(71, 85, 105, 0.2)', backdropFilter: 'blur(4px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
              <User size={14} strokeWidth={2.5} color="#475569" />
              <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operadores</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(selectedReport.operador || 'No asignado').split(/\s*[|,]\s*/).filter(Boolean).map((o, idx) => (
                <span key={idx} style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '500', lineHeight: '1.3', paddingBottom: '0.2rem', borderBottom: idx !== (selectedReport.operador || 'No asignado').split(/\s*[|,]\s*/).filter(Boolean).length - 1 ? '1px dashed rgba(71, 85, 105, 0.2)' : 'none' }}>
                  {o}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(0, 0, 0, 0.03)', padding: '1rem', borderRadius: '18px', border: '1px solid rgba(0, 0, 0, 0.05)', marginBottom: '1.6rem', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem' }}>
          <Calendar size={18} color="#64748b" />
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Registro:</span>
          <span style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '900' }}>{formatFechaCorta(selectedReport.time)}</span>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', color: '#1e293b' }}>
          DOCUMENTO TÉCNICO OFICIAL DRUMMOND
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '18px', fontSize: '1.1rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 8px 20px rgba(227, 25, 55, 0.3)' }}
          onClick={onClose}
        >
          Cerrar Ficha Técnica
        </button>
      </div>
    </div>
  );
};

export default HistoryModal;

