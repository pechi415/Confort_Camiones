import React from 'react';
import { 
  ClipboardList, 
  Award, 
  FileSpreadsheet, 
  Search, 
  MapPin, 
  Calendar, 
  FileText, 
  Trash2, 
  RefreshCcw 
} from 'lucide-react';
import { limpiarFallasIA } from '../utils/iaEngine';
import { formatFechaCorta, formatearCiclo } from '../utils/formatters';
import { minaOptions } from '../constants/fallas';

const HistoryView = ({
  registrosFiltrados,
  registrosLimit,
  setRegistrosLimit,
  expandedHistoryId,
  setExpandedHistoryId,
  conteoLiberados,
  exportarAExcel,
  filtroFlota,
  setFiltroFlota,
  filtroMina,
  setFiltroMina,
  filtroMes,
  setFiltroMes,
  generarPDF,
  session,
  handleSafeDelete,
  eliminarCamion,
  confirmDeleteId
}) => {
  const isAdmin = session?.role?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'admin';

  return (
    <div className="card fade-in">
      <div className="history-header-container">
        <div className="history-title-area">
          <h2 style={{ marginBottom: '0.2rem', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ClipboardList size={22} strokeWidth={2} style={{ color: 'var(--secondary-blue)' }} /> Historial de Mantenimientos
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Registro histórico de camiones de confort completamente solucionados.</p>
        </div>
        <div className="history-header-actions">
          <span className="badge badge-liberado history-badge" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.15)', color: '#059669', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)' }}>
            <Award size={16} strokeWidth={2} /> <span>Camiones Entregados: <strong>{conteoLiberados}</strong></span>
          </span>
          <button
            className="btn btn-primary history-export-btn"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.8)', borderColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
            onClick={exportarAExcel}
          >
            <FileSpreadsheet size={18} strokeWidth={2} /> Exportar a Excel
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Search size={16} strokeWidth={1.5} /> Camión:</span>
          <input
            type="text"
            className="input-field"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', minWidth: '130px', background: 'rgba(255, 255, 255, 0.5)' }}
            placeholder="Ej: 2410"
            value={filtroFlota}
            onChange={(e) => setFiltroFlota(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={16} strokeWidth={1.5} /> Mina:</span>
          <select
            className="input-field"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.5)' }}
            value={filtroMina}
            onChange={(e) => setFiltroMina(e.target.value)}
          >
            <option value="">Todas las Minas</option>
            {minaOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={16} strokeWidth={1.5} /> Mes Salida:</span>
          <input
            type="text"
            className="input-field"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', minWidth: '130px', background: 'white' }}
            placeholder="Ej: Feb, Mar"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: '80px', whiteSpace: 'nowrap' }}>Camión</th>
              <th style={{ minWidth: '220px', width: '280px' }}>Fallas Reparadas</th>
              <th style={{ whiteSpace: 'nowrap' }}>Ingreso a Fila</th>
              <th style={{ whiteSpace: 'nowrap' }}>Liberación</th>
              <th style={{ whiteSpace: 'nowrap' }}>Tiempo de Ciclo</th>
              <th style={{ whiteSpace: 'nowrap' }}>Operador</th>
              <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Mina</th>
              <th style={{ whiteSpace: 'nowrap' }}>Aprobado</th>
              <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Reporte</th>
              {isAdmin && <th className="desktop-only" style={{ textAlign: 'center', width: '80px' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.length > 0 ? registrosFiltrados.slice(0, registrosLimit).map(registro => {
              const isExpanded = expandedHistoryId === registro.id;
              return (
                <tr
                  key={registro.id}
                  className={`history-row ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => {
                    if (window.innerWidth <= 768) {
                      setExpandedHistoryId(isExpanded ? null : registro.id);
                    }
                  }}
                >
                  <td data-label="Camión">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1rem' }}>
                      <span className="mobile-only" style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Camión</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--primary-black)', marginLeft: 'auto' }}>{registro.flota}</strong>
                    </div>
                  </td>
                  <td data-label="Fallas" className="collapsible-col" style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.3', minWidth: '220px' }}>
                    <div style={{ width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {limpiarFallasIA(registro.fallas).map(f => `${f.falla}${f.obs !== '-' ? ` (${f.obs})` : ''}`).join(' | ')}
                    </div>
                  </td>
                  <td data-label="Ingreso" style={{ fontSize: '0.85rem' }}>{formatFechaCorta(registro.time || registro.creado_at)}</td>
                  <td data-label="Liberación" style={{ fontSize: '0.85rem' }}>{formatFechaCorta(registro.finalizado_at)}</td>
                  <td data-label="Ciclo" className="collapsible-col" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>
                    {formatearCiclo(registro.time || registro.creado_at, registro.finalizado_at, registro.ingreso_evaluar_at)}
                  </td>
                  <td data-label="Operador" className="collapsible-col" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {(registro.operador || 'N/A').split(/\s*[,|]\s*/).map((op, idx) => {
                        const parts = op.split(': ');
                        const grupoLabel = parts.length > 1 ? parts[0] : '';
                        const nombreOp = parts.length > 1 ? parts[1] : parts[0];
                        return (
                          <div key={idx} style={{
                            background: 'rgba(99, 102, 241, 0.06)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            color: 'var(--primary-black)',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            border: '1px solid rgba(0,0,0,0.03)'
                          }}>
                            {grupoLabel && <span style={{ color: 'var(--secondary-blue)', fontWeight: 'bold' }}>{grupoLabel}:</span>} {nombreOp}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td data-label="Mina" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span className="mobile-only" style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mina</span>
                      <div style={{
                        background: 'var(--primary-black)',
                        color: 'white',
                        padding: '0.25rem 0.8rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {registro.mina || 'PB'}
                      </div>
                    </div>
                  </td>
                  <td data-label="Aprobado">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span className="mobile-only" style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aprobado</span>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {registro.aprobado_g1 && <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>G1</span>}
                        {registro.aprobado_g2 && <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>G2</span>}
                        {registro.aprobado_g3 && <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>G3</span>}
                        {(!registro.aprobado_g1 && !registro.aprobado_g2 && !registro.aprobado_g3) && <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Sin V.B</span>}
                      </div>
                    </div>
                  </td>
                  <td data-label="Reporte" className="collapsible-col">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '1px solid rgba(227, 25, 55, 0.4)', color: 'var(--primary-red)', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(5px)', whiteSpace: 'nowrap', minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={(e) => { e.stopPropagation(); generarPDF(registro); }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
                          <FileText size={15} strokeWidth={1.5} /> Ver PDF
                        </div>
                      </button>

                      {isAdmin && (
                        <button
                          className={`mobile-only ${confirmDeleteId === registro.id ? 'btn-action-confirm' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSafeDelete(registro.id, () => eliminarCamion(registro.id, registro.flota));
                          }}
                          style={{
                            background: confirmDeleteId === registro.id ? 'var(--primary-red)' : 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: confirmDeleteId === registro.id ? 'white' : '#ef4444',
                            padding: '0.4rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            minWidth: confirmDeleteId === registro.id ? '100px' : '40px'
                          }}
                          title="Eliminar Reporte"
                        >
                          {confirmDeleteId === registro.id ? (
                            <span style={{ fontSize: '0.65rem', fontWeight: '800' }}>¿BORRAR?</span>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="desktop-only" style={{ textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSafeDelete(registro.id, () => eliminarCamion(registro.id, registro.flota));
                        }}
                        className={`btn-action ${confirmDeleteId === registro.id ? 'btn-action-confirm-desktop' : 'btn-action-delete'}`}
                        style={{
                          margin: '0 auto',
                          width: confirmDeleteId === registro.id ? 'auto' : '36px',
                          padding: confirmDeleteId === registro.id ? '0.5rem 1rem' : '0'
                        }}
                        title="Eliminar Reporte"
                      >
                        {confirmDeleteId === registro.id ? (
                          <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>✓ CONFIRMAR</span>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>No hay registros que coincidan con los filtros.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Botón Cargar Más */}
        {registrosFiltrados.length > registrosLimit && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setRegistrosLimit(prev => prev + 20)}
              style={{ background: 'white', borderColor: 'var(--primary-red)', color: 'var(--primary-red)', padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
            >
              <RefreshCcw size={18} /> Cargar más registros antiguos
            </button>
            <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mostrando {registrosLimit} de {registrosFiltrados.length} registros totales.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
