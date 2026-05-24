import React from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Award, 
  FileText, 
  Siren, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Truck, 
  MapPin, 
  Calendar 
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useTruck } from '../context/TruckContext';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardView.module.css';

const DashboardView = ({
  setSelectedReport,
  prepararEdicion,
  handleSafeDelete,
  confirmDeleteId,
  formatGrupo,
  formatFechaCorta
}) => {
  const { session } = useAuth();
  const { camionesAccessibles, conteoLiberados, promedioCiclo, kpis, eliminarCamion } = useTruck();
  const navigate = useNavigate();

  const isAdminOrSupervisor = (
    session?.role?.toLowerCase() === 'admin' || 
    session?.role?.toLowerCase() === 'supervisor' || 
    session?.rol?.toLowerCase() === 'admin' || 
    session?.rol?.toLowerCase() === 'supervisor'
  );

  const isAdmin = (
    session?.role?.toLowerCase() === 'admin' || 
    session?.rol?.toLowerCase() === 'admin'
  );

  return (
    <div className="dashboard-view fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-black)', margin: 0 }}>
          <LayoutDashboard strokeWidth={1.5} size={24} style={{ marginBottom: '-0.3rem', color: '#2563eb' }} /> Resumen de Control
        </h2>
        <div className={styles.dashboardKpiContainer} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', justifyContent: 'flex-start' }}>
          <span className={`badge ${styles.dashboardKpiBadge} ${styles.kpiPromCiclo}`}>
            <Zap size={16} strokeWidth={2} /> <span>Prom. Ciclo: <strong>{promedioCiclo}</strong></span>
          </span>
          <span className={`badge badge-liberado ${styles.dashboardKpiBadge} ${styles.kpiEntregados}`}>
            <Award size={16} strokeWidth={2} /> <span>Entregados: <strong>{conteoLiberados}</strong></span>
          </span>
        </div>
      </div>
      
      <div className={styles.kpiGrid}>
        {kpis.map(k => (
          <div key={k.id} className={styles.kpiCard} style={{ borderTopColor: k.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', alignItems: 'center' }}>
              {k.titulo}
              <span style={{ color: k.color }}>{k.icon}</span>
            </div>
            <div className={styles.kpiValue}>{k.valor}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>{k.subtitulo}</div>
          </div>
        ))}
      </div>

      <div className="card fade-in" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Zap size={22} color="var(--primary-red)" /> Top Prioridades en Taller
          </h3>
          <button className="btn btn-primary mobile-only" onClick={() => navigate('/cola')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Ver Todos</button>
        </div>

        <div className="priority-view-container">
          <div className={styles.desktopLandscapeView}>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Camión</th>
                    <th>Mina / Grupo</th>
                    <th>Atención Requerida</th>
                    <th>Estado</th>
                    <th>Fecha Reporte</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(camionesAccessibles || [])
                    .filter(c => c && c.estado !== 'liberado')
                    .sort((a, b) => (Number(b.puntos) || 0) - (Number(a.puntos) || 0))
                    .slice(0, 6)
                    .map((camion) => (
                      <tr key={camion?.id || Math.random()}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <strong style={{ fontSize: '1.10rem' }}>{camion?.flota || 'S/N'}</strong>
                            <button
                              onClick={() => setSelectedReport(camion)}
                              style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0 }}
                              title="Ver Diagnóstico Técnico"
                            >
                              <FileText size={16} />
                            </button>
                          </div>
                        </td>
                        <td>{camion?.mina || '--'} / {formatGrupo(camion?.grupo)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            {camion?.atencion === 'CRÍTICA' && <><Siren size={20} color="#ef4444" strokeWidth={2} /><strong>CRÍTICA</strong></>}
                            {camion?.atencion === 'ALTA' && <><AlertTriangle size={20} color="var(--secondary-yellow)" strokeWidth={2} /><strong>ALTA</strong></>}
                            {camion?.atencion === 'NORMAL' && <><CheckCircle2 size={20} color="#10b981" strokeWidth={2} /><strong>NORMAL</strong></>}
                          </div>
                        </td>
                        <td><span className={`badge badge-${camion?.estado || 'default'}`}>{(camion?.estado || 'N/A').toUpperCase()}</span></td>
                        <td>{formatFechaCorta(camion?.time || camion?.creado_at)}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                            {isAdminOrSupervisor && (
                              <button onClick={() => prepararEdicion(camion)} className="btn-action btn-action-edit" title="Editar"><Edit3 size={18} /></button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSafeDelete(camion.id, () => eliminarCamion(camion.id, camion.flota)); }}
                                className={`btn-action ${confirmDeleteId === camion.id ? 'btn-action-confirm-desktop' : 'btn-action-delete'}`}
                                style={{
                                  width: confirmDeleteId === camion.id ? 'auto' : '36px',
                                  padding: confirmDeleteId === camion.id ? '0.5rem 1rem' : '0.3rem',
                                  borderRadius: '6px',
                                  minWidth: confirmDeleteId === camion.id ? '80px' : '36px',
                                  transition: 'all 0.3s ease'
                                }}
                                title="Eliminar"
                              >
                                {confirmDeleteId === camion.id ? <span style={{ fontSize: '0.6rem', fontWeight: '900' }}>¿BORRAR?</span> : <Trash2 size={16} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.mobilePortraitView}>
            <div className={styles.priorityCardsContainer}>
              {(camionesAccessibles || [])
                .filter(c => c && c.estado !== 'liberado')
                .sort((a, b) => (Number(b.puntos) || 0) - (Number(a.puntos) || 0))
                .slice(0, 6)
                .map((camion) => (
                  <div key={camion.id} className={`${styles.priorityCard} fade-in`}>
                    <div className={styles.pCardHeader}>
                      <div className={styles.pCardTitle}>
                        <Truck size={20} color="var(--primary-red)" />
                        <strong>{camion.flota}</strong>
                      </div>
                      <span className={`badge badge-${camion?.estado || 'default'}`}>{(camion?.estado || 'N/A').toUpperCase()}</span>
                    </div>

                    <div className={styles.pCardBody}>
                      <div className={styles.pCardInfo}>
                        <MapPin size={14} /> <span>Mina {camion.mina} / {formatGrupo(camion.grupo)}</span>
                      </div>
                      <div className={styles.pCardInfo}>
                        <Calendar size={14} /> <span>{formatFechaCorta(camion.time || camion.creado_at)}</span>
                      </div>
                      <div className={`${styles.pCardStatus} ${styles['status-' + (camion?.atencion || 'NORMAL').toLowerCase()]}`}>
                        {camion.atencion === 'CRÍTICA' && <Siren size={18} />}
                        {camion.atencion === 'ALTA' && <AlertTriangle size={18} />}
                        {camion.atencion === 'NORMAL' && <CheckCircle2 size={18} />}
                        <strong>{camion.atencion}</strong>
                      </div>
                    </div>

                    <div className={styles.pCardActions}>
                      <button onClick={() => setSelectedReport(camion)} className={`${styles.btnPCard} ${styles.btnPSecondary}`}>
                        <FileText size={16} /> Diagnóstico
                      </button>
                      {isAdminOrSupervisor && (
                        <button onClick={() => prepararEdicion(camion)} className={`${styles.btnPCard} ${styles.btnPPrimary}`}>
                          <Edit3 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
