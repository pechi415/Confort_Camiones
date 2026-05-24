import { useState, useMemo } from 'react';
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
import { limpiarFallasIA, normalizarNombre } from '../utils/iaEngine';
import { formatFechaCorta, formatearCiclo, parseFecha } from '../utils/formatters';
import { minaOptions, LOGO_DRUMMOND } from '../constants/fallas';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useTruck } from '../context/TruckContext';
import styles from './HistoryView.module.css';

const HistoryView = ({
  handleSafeDelete,
  confirmDeleteId
}) => {
  const { session } = useAuth();
  const { camionesAccessibles, eliminarCamion, conteoLiberados } = useTruck();
  const isAdmin = session?.role?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'admin';
  const { addToast, showConfirm } = useUI();
  
  const [filtroFlota, setFiltroFlota] = useState('');
  const [filtroMina, setFiltroMina] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [registrosLimit, setRegistrosLimit] = useState(20);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);



  const registrosFiltrados = useMemo(() => {
    if (!session || !Array.isArray(camionesAccessibles)) return [];
    return camionesAccessibles.filter(r => {
      if (r.estado !== 'liberado') return false;
      try {
        const fFlota = String(r.flota || '').toLowerCase();
        const fMina = String(r.mina || '').toLowerCase();
        const fBusquedaFlota = String(filtroFlota || '').toLowerCase();
        const fBusquedaMina = String(filtroMina || '').toLowerCase();

        const matchFlota = fFlota.includes(fBusquedaFlota);
        const matchMina = !fBusquedaMina || fMina === fBusquedaMina;
        if (!matchFlota || !matchMina) return false;

        if (filtroMes) {
          const fecha = parseFecha(r.finalizado_at || r.time || r.creado_at);
          if (!fecha) return false;
          const [anioF, mesF] = filtroMes.split('-');
          if (fecha.getFullYear() !== parseInt(anioF) || (fecha.getMonth() + 1) !== parseInt(mesF)) return false;
        }
        return true;
      } catch { return false; }
    });
  }, [camionesAccessibles, session, filtroFlota, filtroMina, filtroMes]);

  const exportarAExcel = () => {
    if (registrosFiltrados.length === 0) {
      return addToast("No hay datos filtrados para exportar.", "error");
    }

    try {
      addToast("⏳ Preparando archivo Excel...", "info");

      const datosExcel = registrosFiltrados.map(r => {
        const dG = r.detalles_grupos || {};

        const getOp = (g) => dG[`G${g}`]?.operador || (r.operador || '').split(', ').find(n => n.includes(`G${g}:`))?.replace(`G${g}:`, '').trim() || '-';
        const getSup = (g) => dG[`G${g}`]?.supervisor || (r.supervisor || '').split(', ').find(n => n.includes(`G${g}:`))?.replace(`G${g}:`, '').trim() || '-';

        let cicloTxt = '-';
        if (r.finalizado_at && (r.ingreso_evaluar_at || r.creado_at)) {
          const inicio = new Date(r.ingreso_evaluar_at || r.creado_at);
          const fin = new Date(r.finalizado_at);
          const diffMs = fin - inicio;
          const diffMin = Math.max(0, Math.floor(diffMs / 60000));
          const horas = Math.floor(diffMin / 60);
          const mins = diffMin % 60;
          cicloTxt = horas > 0 ? `${horas}h ${mins}m` : `${mins} min`;
        }

        return {
          "Fecha Reporte": r.time,
          "Flota": r.flota,
          "Mina/Ubicación": r.mina,
          "Atención/Prioridad": r.atencion || 'NORMAL',
          "Op. Grupo 1": getOp(1),
          "Sup. Grupo 1": getSup(1),
          "Op. Grupo 2": getOp(2),
          "Sup. Grupo 2": getSup(2),
          "Op. Grupo 3": getOp(3),
          "Sup. Grupo 3": getSup(3),
          "Fallas Unificadas": r.fallas,
          "Ciclo de Tiempo": cicloTxt,
          "Fecha Liberación": r.finalizado_at ? new Date(r.finalizado_at).toLocaleString() : '-',
          "Estado G1": r.aprobado_g1 ? 'Aprobado' : '-',
          "Estado G2": r.aprobado_g2 ? 'Aprobado' : '-',
          "Estado G3": r.aprobado_g3 ? 'Aprobado' : '-'
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Historial Mantenimiento");
      XLSX.writeFile(workbook, `Historial_Drummond_Confort_${new Date().toLocaleDateString()}.xlsx`);
      addToast("✅ Excel descargado con éxito.");
    } catch (error) {
      addToast("❌ Error al generar Excel: " + error.message, "error");
    }
  };

  const generarPDF = async (registro) => {
    try {
      const grupoActual = session.grupo || '1';
      const grupoPrefix = `G${grupoActual}:`;
      const opNames = (registro.operador || '').split(/\s*\|\s*/);
      const yaTieneOperador = opNames.some(n => n.includes(grupoPrefix));

      if (!yaTieneOperador) {
        showConfirm({
          type: 'prompt',
          title: `Firma de Recepción (Grupo ${grupoActual})`,
          message: `Vas a generar el PDF desde un grupo distinto al del reporte original.\n\nPor favor, ingresa el nombre del Operador que FIRMARÁ la recepción del equipo:`,
          placeholder: 'Escribe el nombre aquí (o deja en blanco)...',
          confirmText: 'Generar PDF',
          onConfirm: async (nombreIngresado) => {
            const nombreNormalizado = nombreIngresado ? normalizarNombre(nombreIngresado) : ' ';
            const registroTemporal = {
              ...registro,
              operador_temporal_pdf: nombreNormalizado,
              supervisor_temporal_pdf: session.nombre || 'Supervisor'
            };
            renderizarPDF(registroTemporal);
          }
        });
      } else {
        renderizarPDF(registro);
      }
    } catch (err) {
      addToast("❌ Error al iniciar PDF: " + err.message, "error");
    }
  };

  const renderizarPDF = (registro) => {
    try {
      addToast("⏳ Generando acta de trazabilidad...", "info");
      const doc = new jsPDF();

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(160, 10, 35, 16, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(160, 10, 35, 16, 3, 3, 'D');

      try {
        if (typeof LOGO_DRUMMOND !== 'undefined' && LOGO_DRUMMOND) {
          const logoData = LOGO_DRUMMOND.startsWith('data:') ? LOGO_DRUMMOND : `data:image/png;base64,${LOGO_DRUMMOND}`;
          doc.addImage(logoData, 'PNG', 15, 8, 28, 20);
        }
      } catch {
        console.error("Error al cargar logo:", e);
      }

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("ACTA DE TRAZABILIDAD", 65, 20);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("CONFORT CAMIONES", 65, 26);

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("MINA:", 163, 16);
      doc.setFont("helvetica", "normal");
      doc.text(`${registro.mina === 'PB' ? 'PB' : 'ED'}`, 174, 16);

      doc.setFont("helvetica", "bold");
      doc.text("CAMIÓN:", 163, 22);
      doc.setFont("helvetica", "normal");
      doc.text(`${registro.flota}`, 177, 22);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 145, 32);

      doc.setFont("helvetica", "bold");
      doc.text(`Personal que reporta el estado (Operadores Permanentes):`, 20, 45);
      doc.setFont("helvetica", "normal");

      const dG_orig = registro.detalles_grupos || {};
      const origG = registro.grupo || '1';
      const reporteroData = dG_orig[`G${origG}`] || {};

      const rawOper = reporteroData.operador || registro.operador || 'N/A';
      const listaOper = rawOper.split(/\s*[|,]\s*/).filter(n => n.trim() !== "");
      const operFormateado = listaOper.map(n => `• ${n.trim()}`).join('\n');

      const operSplit = doc.splitTextToSize(operFormateado, 170);
      doc.text(operSplit, 20, 52);

      const supLabelY = 52 + (operSplit.length * 5) + 4;
      doc.setFont("helvetica", "bold");
      doc.text(`Gestor del reporte (Supervisor de Camiones):`, 20, supLabelY);

      doc.setFont("helvetica", "normal");
      const rawSup = reporteroData.supervisor || registro.supervisor || 'N/A';
      const listaSup = rawSup.split(/\s*[|,]\s*/).filter(n => n.trim() !== "");
      const supFormateado = listaSup.map(n => `• ${n.trim()}`).join('\n');

      const supSplit = doc.splitTextToSize(supFormateado, 170);
      const supDataY = supLabelY + 7;
      doc.text(supSplit, 20, supDataY);

      const tableY = Math.max(85, supDataY + (supSplit.length * 5) + 5);

      const tableFunc = typeof autoTable === 'function' ? autoTable : autoTable.default;
      const itemsFallas = limpiarFallasIA(registro.fallas);
      const bodyFallas = itemsFallas.map(item => [item.falla, item.obs]);

      tableFunc(doc, {
        startY: tableY,
        head: [['Detalle de Fallas Intervenidas', 'Comentarios Técnica / Observación']],
        body: bodyFallas,
        theme: 'striped',
        headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 'auto' } }
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("HISTORIAL DE VALIDACIÓN POR GRUPOS", 20, finalY);

      tableFunc(doc, {
        startY: finalY + 5,
        head: [['Grupo de Turno', 'Visto Bueno (VB)', 'Estado']],
        body: [
          ['Grupo 1', registro.aprobado_g1 ? 'CONFIRMADO' : 'N/A', registro.aprobado_g1 ? 'Aceptada a Satisfacción' : 'Sin intervención'],
          ['Grupo 2', registro.aprobado_g2 ? 'CONFIRMADO' : 'N/A', registro.aprobado_g2 ? 'Aceptada a Satisfacción' : 'Sin intervención'],
          ['Grupo 3', registro.aprobado_g3 ? 'CONFIRMADO' : 'N/A', registro.aprobado_g3 ? 'Aceptada a Satisfacción' : 'Sin intervención'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] }
      });

      const grupoActual = session.grupo || '1';
      const opNameFiltered = typeof registro.operador_temporal_pdf !== 'undefined'
        ? registro.operador_temporal_pdf
        : ((registro.detalles_grupos || {})[`G${grupoActual}`]?.operador || (registro.operador || '').split(/\s*\|\s*/).find(n => n.includes(`G${grupoActual}:`))?.replace(`G${grupoActual}:`, '').trim() || '');

      const supNameFiltered = registro.supervisor_temporal_pdf || session.nombre || 'Supervisor';

      const signY = doc.lastAutoTable.finalY + 35;
      doc.setDrawColor(0);
      doc.line(20, signY, 85, signY);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${opNameFiltered}`, 20, signY + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Operador de Camion", 20, signY + 10);
      doc.text(`Grupo ${grupoActual}`, 20, signY + 15);

      doc.line(120, signY, 185, signY);
      doc.setFont("helvetica", "bold");
      doc.text(`${supNameFiltered}`, 120, signY + 5);
      doc.setFont("helvetica", "normal");
      doc.text(`Supervisor de Camiones`, 120, signY + 10);
      doc.text(`Drummond Ltd.`, 120, signY + 15);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Documento generado digitalmente por Drummond Confort System`, 105, 285, { align: 'center' });

      doc.save(`Acta_Trazabilidad_${registro.flota}_${new Date().toISOString().split('T')[0]}.pdf`);
      addToast(`✅ PDF del camión ${registro.flota} generado.`);
    } catch (err) {
      addToast("❌ Error al producir PDF: " + err.message, "error");
    }
  };

  return (
    <div className="card fade-in">
      <div className={styles.historyHeaderContainer}>
        <div className={styles.historyTitleArea}>
          <h2>
            <ClipboardList size={22} strokeWidth={2} style={{ color: 'var(--secondary-blue)' }} /> Historial de Mantenimientos
          </h2>
          <p>Registro histórico de camiones de confort completamente solucionados.</p>
        </div>
        <div className={styles.historyHeaderActions}>
          <span className={`badge badge-liberado ${styles.historyBadge}`} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.15)', color: '#059669', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)' }}>
            <Award size={16} strokeWidth={2} /> <span>Camiones Entregados: <strong>{conteoLiberados}</strong></span>
          </span>
          <button
            className={`btn btn-primary ${styles.historyExportBtn}`}
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
            type="month"
            className="input-field"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', minWidth: '130px', background: 'white' }}
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          />
          {filtroMes && (
            <button 
              onClick={() => setFiltroMes('')}
              style={{ background: 'none', border: 'none', color: 'var(--primary-red)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
            >
              X
            </button>
          )}
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
                  className={`${styles.historyRow} ${isExpanded ? styles.expanded : ''}`}
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
                  <td data-label="Fallas" className={styles.collapsibleCol} style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.3', minWidth: '220px' }}>
                    <div style={{ width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {limpiarFallasIA(registro.fallas).map(f => `${f.falla}${f.obs !== '-' ? ` (${f.obs})` : ''}`).join(' | ')}
                    </div>
                  </td>
                  <td data-label="Ingreso" style={{ fontSize: '0.85rem' }}>{formatFechaCorta(registro.time || registro.creado_at)}</td>
                  <td data-label="Liberación" style={{ fontSize: '0.85rem' }}>{formatFechaCorta(registro.finalizado_at)}</td>
                  <td data-label="Ciclo" className={styles.collapsibleCol} style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>
                    {formatearCiclo(registro.time || registro.creado_at, registro.finalizado_at, registro.ingreso_evaluar_at)}
                  </td>
                  <td data-label="Operador" className={styles.collapsibleCol} style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
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
                  <td data-label="Reporte" className={styles.collapsibleCol}>
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
