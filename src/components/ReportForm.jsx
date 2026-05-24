import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ClipboardList, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { fallas } from '../constants/fallas';
import { normalizarNombre, corregirNombresIA, corregirOrtografiaIA, unificarComentariosIA } from '../utils/iaEngine';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useTruck } from '../context/TruckContext';
import { camionService } from '../services/camionService';

const ReportForm = () => {
  const { session } = useAuth();
  const { addToast } = useUI();
  const { camionesRegistrados, setCamionesRegistrados } = useTruck();
  const navigate = useNavigate();

  const [reportForm, setReportFormState] = useState(() => {
    const defaultState = { flota: '', operador: '', mina: 'PB', grupo: '1', selectedDanos: {}, observaciones: {}, atencion: 'No' };
    const saved = localStorage.getItem('drummond_report_form');
    if (!saved) return defaultState;
    try { 
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed, selectedDanos: parsed.selectedDanos || {}, observaciones: parsed.observaciones || {} };
    } catch (err) { 
      return defaultState; 
    }
  });

  const [reportStep, setReportStep] = useState(1);
  const [flota, setFlota] = useState(reportForm.flota);
  const [operador, setOperador] = useState(reportForm.operador);
  const [mina, setMina] = useState(reportForm.mina);
  const [grupo, setGrupo] = useState(reportForm.grupo);
  const [selectedDanos, setSelectedDanos] = useState(reportForm.selectedDanos);
  const [observaciones, setObservaciones] = useState(reportForm.observaciones);
  const [atencion, setAtencion] = useState(reportForm.atencion || 'No');

  useEffect(() => {
    if (session && !flota && !operador) {
      if (session.mina && session.mina !== 'Global') setMina(session.mina);
      if (session.grupo) setGrupo(session.grupo);
    }
  }, [session, flota, operador]);

  useEffect(() => {
    const state = { flota, operador, mina, grupo, selectedDanos, observaciones, atencion };
    localStorage.setItem('drummond_report_form', JSON.stringify(state));
  }, [flota, operador, mina, grupo, selectedDanos, observaciones, atencion]);

  const totalImpacto = useMemo(() => {
    return Object.keys(selectedDanos).reduce((acc, id) => {
      if (!selectedDanos[id]) return acc;
      const falla = fallas.find(f => f.id === id);
      return acc + (falla ? (falla.impacto || 0) : 0);
    }, 0);
  }, [selectedDanos]);

  useEffect(() => {
    if (totalImpacto >= 70) setAtencion('CRÍTICA');
    else if (totalImpacto >= 50) setAtencion('ALTA');
    else if (totalImpacto >= 26) setAtencion('MEDIA');
    else setAtencion('BAJA');
  }, [totalImpacto]);

  const isFlotaValid = /^2\d{3}$/.test(flota);

  const handleDanoToggle = (id) => {
    setSelectedDanos(prev => ({ ...prev, [id]: !prev[id] }));
    if (selectedDanos[id]) {
      setObservaciones(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleObsChange = (id, text) => {
    let final = text;
    if (text.endsWith(' ') || text.endsWith('.')) {
      final = corregirOrtografiaIA(text);
    } else if (text.length === 1) {
      final = text.toUpperCase();
    }
    setObservaciones(prev => ({ ...prev, [id]: final }));
  };

  const onSubmit = async () => {
    try {
      const camionExistente = camionesRegistrados.find(c => c.flota === flota && c.estado !== 'liberado');

      if (camionExistente) {
        const opLimpio = normalizarNombre(operador);
        const supLimpio = normalizarNombre(session.nombre);

        const listaGrupos = Array.from(new Set([...camionExistente.grupo.split(/\s*[,|]\s*/), grupo])).sort();

        const nuevoRegSup = `G${grupo}: ${supLimpio}`;
        const supsActuales = (camionExistente.supervisor || '').split(/\s*[,|]\s*/).filter(Boolean);
        const listaSupervisores = Array.from(new Set([...supsActuales, nuevoRegSup]));

        const nuevoRegOp = `G${grupo}: ${opLimpio}`;
        const opsActuales = (camionExistente.operador || '').split(/\s*[,|]\s*/).filter(Boolean);
        const listaOperadores = Array.from(new Set([...opsActuales, nuevoRegOp]));

        const numGrupos = listaGrupos.length;

        const fallasActualesIds = new Set();
        fallas.forEach(f => {
          if (camionExistente.fallas.includes(f.nombre)) fallasActualesIds.add(f.id);
        });

        const todasFallasIds = new Set([...Array.from(fallasActualesIds), ...Object.keys(selectedDanos)]);

        const puntosBase = Array.from(todasFallasIds).reduce((acc, id) => {
          const f = fallas.find(x => x.id === id);
          return acc + (f ? f.impacto : 0);
        }, 0);

        const bonoConsenso = (numGrupos - 1) * 30;
        const puntosFinales = puntosBase + bonoConsenso;

        let atencionLabel = 'NORMAL';
        if (puntosFinales >= 70) atencionLabel = 'CRÍTICA';
        else if (puntosFinales >= 26) atencionLabel = 'ALTA';

        const obsAnteriores = {};
        if (camionExistente.fallas) {
          const rawFallas = camionExistente.fallas;
          const parts = [];
          let depth = 0;
          let lastSplit = 0;

          for (let i = 0; i < rawFallas.length; i++) {
            const char = rawFallas[i];
            if (char === '(') depth++;
            if (char === ')') depth--;
            if (depth === 0 && char === '|') {
              parts.push(rawFallas.substring(lastSplit, i).trim());
              lastSplit = i + 1;
            }
          }
          parts.push(rawFallas.substring(lastSplit).trim());

          parts.forEach(p => {
            if (!p || p === '-' || p.includes('Ficha Técnica')) return;
            const match = p.match(/^(.*?)(?:\s*\((.*?)\))?$/);
            if (match && match[2]) {
              const nombreLimpio = match[1].split('|')[0].trim();
              const fObj = fallas.find(f => f.nombre === nombreLimpio || nombreLimpio.includes(f.nombre));
              if (fObj) obsAnteriores[fObj.id] = match[2];
            }
          });
        }

        const fallasConsolidadas = Array.from(todasFallasIds).map(id => {
          const f = fallas.find(x => x.id === id);
          const obsViejas = obsAnteriores[id] || '';
          const obsNuevaLimpia = corregirOrtografiaIA(observaciones[id] || '');
          const obsNuevas = obsNuevaLimpia ? `G${grupo}: ${obsNuevaLimpia}` : '';

          const textoAUnificar = [obsViejas, obsNuevas].filter(Boolean).join(' | ');
          const finalObs = unificarComentariosIA(textoAUnificar);

          return f.nombre + (finalObs ? ` (${finalObs})` : '');
        }).join(' | ');

        const fallasStruct = {};
        Object.keys(selectedDanos).forEach(id => {
          fallasStruct[id] = corregirOrtografiaIA(observaciones[id] || '');
        });
        const detallesAnteriores = camionExistente.detalles_grupos || {};
        const detallesNuevos = {
          ...detallesAnteriores,
          [`G${grupo}`]: {
            supervisor: normalizarNombre(session.nombre),
            operador: normalizarNombre(operador),
            mina: (session.mina === 'Global' || session.mina === 'Ambas') ? mina : (session.mina || mina),
            time: new Date().toISOString(),
            fallas: fallasStruct
          }
        };

        const camionActualizado = {
          ...camionExistente,
          grupo: listaGrupos.join(' | '),
          supervisor: listaSupervisores.join(' | '),
          operador: listaOperadores.join(' | '),
          fallas: fallasConsolidadas,
          puntos: puntosFinales,
          atencion: atencionLabel,
          detalles_grupos: detallesNuevos
        };
        await camionService.updateCamion(camionExistente.id, camionActualizado);

        setCamionesRegistrados(prev => prev.map(c => c.id === camionExistente.id ? camionActualizado : c));
        addToast(`✅ Reporte integrado con éxito para el camión ${flota}.`);

      } else {
        let atencionLabel = 'NORMAL';
        if (totalImpacto >= 70) atencionLabel = 'CRÍTICA';
        else if (totalImpacto >= 26) atencionLabel = 'ALTA';
        const fallasDetalladas = Object.keys(selectedDanos).map(id => {
          const nombreFalla = fallas.find(f => f.id === id)?.nombre;
          const comentarioLimpio = corregirOrtografiaIA(observaciones[id] || '');
          const comentario = comentarioLimpio ? ` (G${grupo}: ${comentarioLimpio})` : '';
          return `${nombreFalla}${comentario}`;
        }).join(' | ');

        const fallasStruct = {};
        Object.keys(selectedDanos).forEach(id => {
          fallasStruct[id] = corregirOrtografiaIA(observaciones[id] || '');
        });

        const nuevoCamion = {
          flota: flota,
          operador: `G${grupo}: ${normalizarNombre(operador)}`,
          mina: (session.mina === 'Global' || session.mina === 'Ambas') ? mina : (session.mina || mina),
          grupo: session.grupo || grupo,
          supervisor: `G${grupo}: ${normalizarNombre(session.nombre)}`,
          estado: 'espera',
          atencion: atencionLabel,
          fallas: fallasDetalladas,
          time: new Date().toISOString(),
          puntos: totalImpacto,
          detalles_grupos: {
            [`G${grupo}`]: {
              supervisor: normalizarNombre(session.nombre),
              operador: normalizarNombre(operador),
              mina: (session.mina === 'Global' || session.mina === 'Ambas') ? mina : (session.mina || mina),
              time: new Date().toISOString(),
              fallas: fallasStruct
            }
          }
        };

        const camionCreado = await camionService.registrarCamion(nuevoCamion);
        setCamionesRegistrados([camionCreado, ...camionesRegistrados]);
        addToast('✅ Camión ' + flota + ' enviado a taller con éxito.');
      }

      navigate('/dashboard');
      setFlota(''); setOperador(''); setSelectedDanos({}); setObservaciones({});
      setReportStep(1);
    } catch (err) {
      addToast('Error crítico: ' + err.message, "error");
    }
  };

  // Candado de Seguridad: Si el usuario NO es admin y NO pertenece a "Global", bloqueamos sus listas
  const isRestricted = session && session.role !== 'admin' && session.mina !== 'Global';

  return (
    <div className="card fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      {/* INDICADOR DE PASOS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', position: 'relative', padding: '0 10px' }}>
        <div style={{ position: 'absolute', top: '18px', left: '0', right: '0', height: '2px', background: '#e5e7eb', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '18px', left: '0', width: `${(reportStep - 1) * 50}%`, height: '2px', background: 'var(--primary-red)', zIndex: 2, transition: 'all 0.4s ease' }}></div>

        {[1, 2, 3].map(s => (
          <div key={s} style={{
            zIndex: 3, width: '38px', height: '38px', borderRadius: '50%',
            background: reportStep >= s ? 'var(--primary-red)' : 'white',
            border: `2px solid ${reportStep >= s ? 'var(--primary-red)' : '#e5e7eb'}`,
            color: reportStep >= s ? 'white' : '#9ca3af',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '900', transition: 'all 0.3s ease', fontSize: '0.9rem',
            boxShadow: reportStep === s ? '0 0 0 4px rgba(227, 25, 55, 0.15)' : 'none'
          }}>
            {s === 1 && <Truck size={18} />}
            {s === 2 && <ClipboardList size={18} />}
            {s === 3 && <CheckCircle size={18} />}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--primary-black)', marginBottom: '0.5rem' }}>
          {reportStep === 1 && "📍 Identificación"}
          {reportStep === 2 && "🛠️ Diagnóstico"}
          {reportStep === 3 && "🚀 Finalización"}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {reportStep === 1 && "Datos básicos del equipo y operador."}
          {reportStep === 2 && "Selecciona los componentes con falla."}
          {reportStep === 3 && "Revisa y envía el reporte a taller."}
        </p>
      </div>

      {/* CONTENIDO SEGÚN EL PASO */}
      <div style={{ minHeight: '300px' }}>
        {reportStep === 1 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Número de Flota</label>
              <input
                type="text"
                inputMode="numeric"
                className="input-field"
                placeholder="Ej: 2715"
                value={flota}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // Solo números
                  if (val.length <= 4) {
                    setFlota(val);
                  }
                }}
              />
              {flota.length > 0 && !flota.startsWith('2') && (
                <span style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.4rem', fontWeight: 'bold' }}>
                  ⚠️ Debe comenzar con el número 2
                </span>
              )}
              <span style={{ color: '#64748b', fontSize: '0.65rem', marginTop: '0.2rem' }}>
                Formato requerido: 4 dígitos (Ej: 2715)
              </span>
            </div>
            <div className="input-group">
              <label className="input-label">Nombre del Operador</label>
              <input
                type="text" className="input-field" placeholder="Nombre completo"
                value={operador}
                onChange={(e) => {
                  const val = e.target.value;
                  let formatted = val.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
                  if (val.endsWith(' ')) {
                    formatted = corregirNombresIA(formatted);
                  }
                  setOperador(formatted);
                }}
                onBlur={() => {
                  if (operador.trim().length > 3) {
                    let final = corregirNombresIA(operador);
                    final = corregirOrtografiaIA(final);
                    setOperador(final);
                  }
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Mina</label>
                <select 
                  className="input-field" 
                  value={mina} 
                  onChange={(e) => setMina(e.target.value)}
                  disabled={isRestricted}
                  style={{ cursor: isRestricted ? 'not-allowed' : 'pointer', opacity: isRestricted ? 0.7 : 1, backgroundColor: isRestricted ? '#f1f5f9' : 'white' }}
                >
                  <option value="PB">PB</option>
                  <option value="ED">ED</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Grupo</label>
                <select 
                  className="input-field" 
                  value={grupo} 
                  onChange={(e) => setGrupo(e.target.value)}
                  disabled={isRestricted}
                  style={{ cursor: isRestricted ? 'not-allowed' : 'pointer', opacity: isRestricted ? 0.7 : 1, backgroundColor: isRestricted ? '#f1f5f9' : 'white' }}
                >
                  <option value="1">G1</option>
                  <option value="2">G2</option>
                  <option value="3">G3</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {reportStep === 2 && (
          <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
              {fallas.map(f => (
                <button
                  key={f.id} type="button" onClick={() => handleDanoToggle(f.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', padding: '1.2rem 0.5rem',
                    background: selectedDanos[f.id] ? 'var(--primary-red)' : '#f9fafb',
                    color: selectedDanos[f.id] ? 'white' : 'var(--primary-black)',
                    borderRadius: '15px', border: '2px solid',
                    borderColor: selectedDanos[f.id] ? 'var(--primary-red)' : '#e5e7eb',
                    cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: selectedDanos[f.id] ? 'scale(0.98)' : 'scale(1)',
                    boxShadow: selectedDanos[f.id] ? '0 4px 12px rgba(227, 25, 55, 0.25)' : 'none'
                  }}
                >
                  <f.icon size={42} strokeWidth={1.5} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', textAlign: 'center' }}>{f.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {reportStep === 3 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {Object.keys(selectedDanos).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                <AlertTriangle size={40} style={{ marginBottom: '1rem' }} />
                <p>No has seleccionado fallas técnicas.</p>
              </div>
            ) : (
              <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {fallas.filter(f => selectedDanos[f.id]).map(f => (
                  <div key={f.id} style={{ marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <label className="input-label" style={{ color: 'var(--primary-red)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <f.icon size={16} /> {f.nombre}
                    </label>
                    <textarea
                      className="input-field" rows="2" placeholder="Detalle específico..."
                      value={observaciones[f.id] || ''}
                      onChange={(e) => handleObsChange(f.id, e.target.value)}
                      onBlur={(e) => {
                        const corregido = corregirOrtografiaIA(e.target.value);
                        if (corregido !== e.target.value) handleObsChange(f.id, corregido);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{
              padding: '1.2rem',
              borderRadius: '14px',
              background:
                atencion === 'CRÍTICA' ? 'rgba(220, 38, 38, 0.1)' :
                  atencion === 'ALTA' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: `2px solid ${atencion === 'CRÍTICA' ? '#dc2626' :
                  atencion === 'ALTA' ? '#f97316' : '#10b981'
                }`,
              marginTop: '1.5rem',
              textAlign: 'center'
            }}>
              <label style={{
                color:
                  atencion === 'CRÍTICA' ? '#dc2626' :
                    atencion === 'ALTA' ? '#ea580c' : '#059669',
                fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem'
              }}>
                Nivel de Gravedad Calculado
              </label>
              <div style={{
                fontSize: '1.4rem', fontWeight: '900',
                color:
                  atencion === 'CRÍTICA' ? '#dc2626' :
                    atencion === 'ALTA' ? '#ea580c' : '#059669',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem'
              }}>
                {atencion === 'CRÍTICA' ? <ShieldAlert size={28} /> :
                  atencion === 'ALTA' ? <AlertTriangle size={28} /> : <ShieldCheck size={28} />}
                {atencion}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.8rem', fontStyle: 'italic' }}>
                * El peso final en el tablero aumentará si otros grupos también reportan fallas en este equipo.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NAVEGACIÓN */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
        {reportStep > 1 && (
          <button
            className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setReportStep(reportStep - 1)}
          >
            <ChevronLeft size={18} /> Atrás
          </button>
        )}

        {reportStep < 3 ? (
          <button
            className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}
            onClick={() => {
              if (reportStep === 1) {
                if (!flota || !operador) return addToast("Completa los datos del equipo", "error");
                if (flota.length !== 4 || !flota.startsWith('2')) {
                  return addToast("El número de flota debe tener 4 dígitos y comenzar con 2", "error");
                }
              }
              setReportStep(reportStep + 1);
            }}
          >
            Siguiente <ChevronRight size={18} />
          </button>
        ) : (
          <button
            className="btn btn-primary"
            style={{ flex: 2, justifyContent: 'center', background: '#10b981', borderColor: '#10b981' }}
            disabled={!isFlotaValid || !operador || totalImpacto === 0}
            onClick={onSubmit}
          >
            📥 Enviar a Lista de Espera
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportForm;
