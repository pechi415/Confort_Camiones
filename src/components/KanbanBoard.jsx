import React, { useState, useRef, useEffect } from 'react';
import { 
  Truck, 
  Users, 
  Siren, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  MonitorCheck,
  ShieldAlert,
  Unlock
} from 'lucide-react';

const KanbanBoard = ({
  columnasKanban,
  camionesAccessibles,
  expandedCardId,
  setExpandedCardId,
  setCurrentKanbanCol,
  currentKanbanCol,
  handleDragStart,
  handleDrop,
  handleDragOver,
  formatGrupo,
  formatFechaCorta,
  formatearCiclo,
  setSelectedReport,
  setSelectedGarantiaDetails,
  prepararDictamen,
  toggleAprobacion,
  showConfirm,
  liberarCamion,
  session,
  prepararEdicion,
  loadingData,
  currentTime
}) => {
  const boardRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (boardRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = boardRef.current;
      // Añadimos un pequeño margen de 2px para evitar falsos positivos por redondeos en pantallas retina
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [camionesAccessibles]);

  let maskStyle = 'none';
  if (canScrollLeft && canScrollRight) {
    maskStyle = 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)';
  } else if (canScrollLeft && !canScrollRight) {
    maskStyle = 'linear-gradient(to right, transparent 0%, black 5%, black 100%)';
  } else if (!canScrollLeft && canScrollRight) {
    maskStyle = 'linear-gradient(to right, black 0%, black 95%, transparent 100%)';
  }

  return (
          <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="kanban-title-stack" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--primary-black)', margin: '0 0 0.4rem 0', lineHeight: '1.2' }}>🔧 Pila de Mantenimiento</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Arrastra los camiones para avanzar su estado</span>
            </div>

            <div className="kanban-headers fade-in" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {columnasKanban.map(col => (
                <div key={col.id} className="kanban-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: col.color, borderRadius: '50%' }}></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {col.titulo} {col.icon && <span style={{ color: col.color }}>{col.icon}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div 
              className="kanban-board"
              ref={boardRef}
              onScroll={(e) => {
                 checkScroll();
                 const scrollLeft = e.target.scrollLeft;
                 const scrollWidth = e.target.scrollWidth;
                 const clientWidth = e.target.clientWidth;
                 if (scrollWidth > clientWidth) {
                   const maxScroll = scrollWidth - clientWidth;
                   const index = Math.round((scrollLeft / maxScroll) * 5);
                   if (index >= 0 && index <= 5) setCurrentKanbanCol(index);
                 }
              }}
              style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '120px', 
                flex: 1,
                alignItems: 'flex-start',
                scrollSnapType: 'x mandatory',
                minHeight: 'calc(100vh - 250px)',
                height: 'fit-content',
                maxHeight: 'calc(100vh - 250px)',
                overflowY: 'auto', 
                WebkitMaskImage: maskStyle,
                maskImage: maskStyle
              }}
            >
              {columnasKanban.map(col => {
                const camionesColumna = camionesAccessibles
                  .filter(c => c.estado === col.id)
                  .sort((a, b) => (Number(b.puntos) || 0) - (Number(a.puntos) || 0));

                return (
                  <div
                    key={col.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className="kanban-column"
                    style={{
                      borderTop: `4px solid ${col.color}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <strong style={{ color: 'var(--primary-black)' }}>{col.titulo}</strong>
                      <span className="badge" style={{ background: 'white', color: 'var(--primary-black)', borderRadius: '50px' }}>
                        {camionesColumna.length}
                      </span>
                    </div>

                    {camionesColumna.map((camion, index) => {
                      const shouldStack = camionesColumna.length > 1 && index > 0;
                      const isExpanded = expandedCardId === camion.id || camionesColumna.length === 1;
                      const marginTop = isExpanded ? '0' : (shouldStack ? '-1.2rem' : '0.5rem');
                      return (
                      <div 
                        key={camion.id}
                        className="kanban-card"
                        draggable
                        onDragStart={(e) => handleDragStart(e, camion.id)}
                        style={{
                          borderLeft: `4px solid ${camion.atencion === 'CRÍTICA' ? '#ef4444' : camion.atencion === 'ALTA' ? 'var(--secondary-yellow)' : '#10b981'}`,
                          marginTop: isExpanded ? '0.8rem' : (shouldStack ? '-1.5rem' : '0.5rem'),
                          zIndex: isExpanded ? 1100 : (camionesColumna.length - index),
                          background: 'rgba(255, 255, 255, 0.45)',
                          backdropFilter: 'blur(20px) saturate(200%) contrast(120%)',
                          border: '1px solid rgba(255, 255, 255, 0.6)',
                          boxShadow: isExpanded 
                            ? '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' 
                            : '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          cursor: 'pointer'
                        }}
                      >
                        <div 
                          className="kanban-card-header"
                          onClick={() => setExpandedCardId(expandedCardId === camion.id ? null : camion.id)}
                          style={{ 
                            padding: '0.6rem 0.5rem', 
                            display: 'flex', 
                            flexWrap: 'nowrap', 
                            alignItems: 'center', 
                            gap: '0.4rem' 
                          }}
                        >
                          <Truck size={18} color="var(--primary-red)" style={{ flexShrink: 0 }} />
                          <strong style={{ fontSize: '1.2rem', color: 'var(--primary-black)', margin: '0 0.2rem', flexShrink: 0 }}>{camion.flota}</strong>
                          
                          {camion.consenso > 1 && (
                            <div title={`Consenso de ${camion.consenso} grupos`} style={{ background: '#eff6ff', color: '#2563eb', padding: '0.1rem 0.2rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.1rem', border: '1px solid #dbeafe', flexShrink: 0 }}>
                              <Users size={11} /> {camion.consenso}
                            </div>
                          )}
                          
                          {camion.atencion === 'CRÍTICA' && <Siren size={17} color="#ef4444" strokeWidth={2} style={{ flexShrink: 0 }} />}
                          {camion.atencion === 'ALTA' && <AlertTriangle size={17} color="#eab308" strokeWidth={2} style={{ flexShrink: 0 }} />}
                          {camion.atencion === 'NORMAL' && <CheckCircle2 size={17} color="#10b981" strokeWidth={2} style={{ flexShrink: 0 }} />}
                          
                          <div style={{ 
                            marginLeft: 'auto', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.3rem', 
                            background: 'rgba(0,0,0,0.05)', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '6px', 
                            fontSize: '0.75rem', 
                            color: (camion.ingreso_evaluar_at || camion.estado === 'liberado') ? 'var(--primary-black)' : '#9ca3af',
                            fontWeight: '700'
                          }}>
                            <Clock size={12} strokeWidth={2.5} />
                            {formatearCiclo && formatearCiclo(camion.creado_at, new Date().toISOString(), camion.ingreso_evaluar_at)}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="fade-in">
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                              Ingreso: {formatFechaCorta(camion.time || camion.creado_at)}
                            </div>
                            
                            <button
                              onClick={() => setSelectedReport(camion)}
                              className="btn btn-secondary"
                              style={{ width: '100%', marginBottom: '0.6rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <MonitorCheck size={16} />
                                {camion.motivo_garantia && <ShieldAlert size={16} color="#ef4444" className="pulse-slow" />}
                              </div>
                              <span style={{ marginLeft: '0.2rem' }}>Diagnóstico</span>
                            </button>

                            {camion.estado === 'garantia' && camion.motivo_garantia && (
                              <button
                                onClick={() => setSelectedGarantiaDetails(camion)}
                                style={{ width: '100%', marginBottom: '0.6rem', padding: '0.5rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                              >
                                <ShieldAlert size={16} /> Pendientes
                              </button>
                            )}

                            {camion.estado === 'evaluados' && (
                              <button
                                onClick={() => prepararDictamen(camion)}
                                style={{ 
                                  width: '100%', 
                                  marginBottom: '0.5rem', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  gap: '0.4rem', 
                                  background: 'rgba(124, 58, 237, 0.08)', 
                                  border: '1px solid rgba(124, 58, 237, 0.15)',
                                  color: '#7c3aed',
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: '10px',
                                  fontSize: '0.72rem',
                                  fontWeight: '400',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <CheckCircle2 size={13} strokeWidth={2.5} /> <span>Dictamen Técnico</span>
                                </div>
                              </button>
                            )}

                            {camion.estado === 'feedback' && (
                              <div style={{ marginTop: '0.2rem', marginBottom: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '-0.3rem', marginLeft: '0.2rem' }}>Vistos Buenos (Consenso):</label>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  {[1, 2, 3].map(gNum => (
                                    <button
                                      key={gNum}
                                      onClick={() => toggleAprobacion(camion.id, `g${gNum}`, camion[`aprobado_g${gNum}`])}
                                      title={camion[`aprobado_g${gNum}`] ? `Grupo ${gNum} Aprobó` : `Aprobar Grupo ${gNum}`}
                                      style={{
                                        flex: 1,
                                        padding: '0.45rem',
                                        height: '32px',
                                        fontSize: '0.75rem',
                                        background: camion[`aprobado_g${gNum}`] ? '#dcfce7' : '#f3f4f6',
                                        color: camion[`aprobado_g${gNum}`] ? '#166534' : '#6b7280',
                                        border: `1px solid ${camion[`aprobado_g${gNum}`] ? '#166534' : '#d1d5db'}`,
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      {camion[`aprobado_g${gNum}`] ? (
                                        <CheckCircle2 size={18} className="fade-in" />
                                      ) : (
                                        `G${gNum}`
                                      )}
                                    </button>
                                  ))}
                                </div>

                                {([camion.aprobado_g1, camion.aprobado_g2, camion.aprobado_g3].filter(Boolean).length >= 2) ? (
                                  <button
                                    onClick={() => {
                                      showConfirm({
                                        type: 'confirm',
                                        title: 'Confirmar Liberación',
                                        message: `El camión ${camion.flota} tiene el consenso necesario.\n\n¿Desea finalizar el proceso?`,
                                        confirmText: 'Sí, Liberar Camión',
                                        onConfirm: () => liberarCamion(camion.id, camion.flota)
                                      });
                                    }}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', background: '#10b981', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.2rem', whiteSpace: 'nowrap' }}
                                  >
                                    <Unlock size={15} /> Liberar Camión
                                  </button>
                                ) : (
                                  <div style={{ padding: '0.4rem', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', fontSize: '0.65rem', color: '#9a3412', textAlign: 'center' }}>
                                    Esperando consenso (min. 2 grupos)
                                  </div>
                                )}
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', marginTop: '0.3rem' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#6b7280' }}>Prioridad:</span>
                              <span className="badge" style={{
                                background: '#f9fafb',
                                color: camion.atencion === 'CRÍTICA' ? '#ef4444' : '#6b7280',
                                border: '1px solid #e5e7eb',
                                fontSize: '0.6rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {camion.atencion}
                              </span>
                            </div>

                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Mover a:</label>
                              <select 
                                value={camion.estado}
                                onChange={(e) => {
                                  const evt = { preventDefault: () => { }, dataTransfer: { getData: () => camion.id.toString() } };
                                  handleDrop(evt, e.target.value);
                                }}
                                className="input-field"
                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }}
                              >
                                {columnasKanban.map(opts => (
                                  <option key={opts.id} value={opts.id}>{opts.titulo.replace(/[^\w\sñáéíóúÁÉÍÓÚ]/gi, '')}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                    })}

                    {camionesColumna.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', padding: '1rem 0' }}>
                        Vacío
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <style>
              {`
                @media (max-width: 768px) {
                  .kanban-column { 
                    min-width: 60vw !important; 
                    width: 60vw !important; 
                    max-width: 60vw !important;
                  }
                  
                  .kanban-indicators {
                    pointer-events: none; 
                    position: fixed !important;
                    bottom: 85px !important;
                    left: 0;
                    right: 0;
                    z-index: 6000 !important;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(8px);
                    padding: 0.5rem !important;
                    margin: 0 !important;
                    width: fit-content;
                    margin-left: auto !important;
                    margin-right: auto !important;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                  }
                }
              `}
            </style>
            <div className="kanban-indicators mobile-only">
              {columnasKanban.map((_, i) => (
                <div key={i} className={`indicator-dot ${currentKanbanCol === i ? 'active' : ''}`} />
              ))}
            </div>


          </div>
  );
};

export default KanbanBoard;
