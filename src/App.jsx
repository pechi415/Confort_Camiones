import React, { useState, useEffect } from 'react';
import './index.css';
import { LayoutDashboard, FileText, Blocks, ClipboardList, ShieldAlert, MonitorCheck, PlusCircle, Trash2, Edit3, Settings, Shield, Unlock, LockKeyhole, Lock, RefreshCcw, Users, AlertTriangle, CheckCircle2, Wrench, Activity, Truck, Search, Hourglass, SearchCheck, Award, FileSpreadsheet, MapPin, Calendar, Siren, AlertCircle, Info } from 'lucide-react';

import { supabase } from './supabaseClient';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Motor de Inteligencia Algorítmica (Fuzzy Logic) para Deduplicación de Reportes
function calcularSimilitudIA(s1, s2) {
  if (!s1 || !s2) return 0;
  const n1 = s1.toLowerCase().replace(/\s+/g, '');
  const n2 = s2.toLowerCase().replace(/\s+/g, '');
  if (n1 === n2) return 1;
  const getBigrams = (str) => {
    const bigrams = new Set();
    for (let i = 0; i < str.length - 1; i++) bigrams.add(str.substring(i, i + 2));
    return bigrams;
  };
  const b1 = getBigrams(n1);
  const b2 = getBigrams(n2);
  let intersection = 0;
  for (const b of b1) if (b2.has(b)) intersection++;
  return (2 * intersection) / (b1.size + b2.size);
}

// Motor de Limpieza Retroactiva (Aplica IA a datos existentes de la nube)
const limpiarFallasIA = (fallasStr) => {
  if (!fallasStr) return 'N/A';
  const items = fallasStr.split(', ').filter(Boolean);
  const result = [];
  
  items.forEach(item => {
    const match = item.match(/^(.*?)(?:\s\((.*?)\))?$/);
    if (!match) { result.push(item); return; }
    
    const nombre = match[1];
    const obsStr = match[2] || '';
    if (!obsStr) { result.push(nombre); return; }
    
    // Limpiar sub-comentarios redundantes con IA Avanzada (Normalización)
    const normalize = (txt) => txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const subObs = obsStr.split('|').map(s => s.trim()).filter(Boolean).sort((a,b) => b.length - a.length);
    const uniqueSubObs = [];
    
    subObs.forEach(curr => {
      const s2 = normalize(curr);
      const isRedundant = uniqueSubObs.some(larga => {
        const s1 = normalize(larga);
        const sim = calcularSimilitudIA(s1, s2);
        
        // Detección por palabras clave significativas (>3 letras)
        const words1 = s1.split(/\s+/).filter(w => w.length > 3);
        const words2 = s2.split(/\s+/).filter(w => w.length > 3);
        const common = words1.filter(w => words2.includes(w));
        
        return sim > 0.4 || s1.includes(s2) || s2.includes(s1) || common.length > 0;
      });
      if (!isRedundant) uniqueSubObs.push(curr);
    });
    
    const obsFinal = uniqueSubObs.join(' | ');
    result.push(nombre + (obsFinal ? ` (${obsFinal})` : ''));
  });
  
  return result.join(', ');
};

function App() {
  // Versión del Sistema: 1.6.6 (PDF Engine Fix)
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('drummond_activeTab') || 'dashboard');

  // Supabase Auth Session State
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('drummond_session');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      // Parche de compatibilidad: Si la sesión es vieja y usa 'rol', lo pasamos a 'role'
      if (parsed.rol && !parsed.role) parsed.role = parsed.rol;
      return parsed;
    } catch (e) {
      return null;
    }
  }); // null = No Logueado
  const [pendingPasswordChangeUser, setPendingPasswordChangeUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Login Form States
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  // Report Form State (Persistente)
  const [reportForm, setReportForm] = useState(() => {
    const saved = localStorage.getItem('drummond_report_form');
    if (!saved) return { flota: '', operador: '', mina: 'PB', grupo: '1', selectedDanos: {}, observaciones: {} };
    try {
      return JSON.parse(saved);
    } catch (e) {
      return { flota: '', operador: '', mina: 'PB', grupo: '1', selectedDanos: {}, observaciones: {} };
    }
  });

  const [flota, setFlota] = useState(reportForm.flota);
  const [operador, setOperador] = useState(reportForm.operador);
  const [mina, setMina] = useState(reportForm.mina);
  const [grupo, setGrupo] = useState(reportForm.grupo);
  const [selectedDanos, setSelectedDanos] = useState(reportForm.selectedDanos);
  const [observaciones, setObservaciones] = useState(reportForm.observaciones);

  // Efecto para persistir cambios en tiempo real
  useEffect(() => {
    localStorage.setItem('drummond_activeTab', activeTab);
    const state = { flota, operador, mina, grupo, selectedDanos, observaciones };
    localStorage.setItem('drummond_report_form', JSON.stringify(state));
  }, [activeTab, flota, operador, mina, grupo, selectedDanos, observaciones]);

  // Historial Filters State (Hooks deben ir arriba de los return tempranos)
  const [filtroFlota, setFiltroFlota] = useState('');
  const [filtroMina, setFiltroMina] = useState('');
  const [filtroMes, setFiltroMes] = useState('');

  // ---------- MÓDULO CRUD DE USUARIOS ----------
  const [dbUsuarios, setDbUsuarios] = useState([]);
  const [isCreandoUsuario, setIsCreandoUsuario] = useState(false);
  const [nuevoUsuarioParams, setNuevoUsuarioParams] = useState({ nombre: '', username: '', password: 'con123', mina: 'PB', grupo: '1', role: 'supervisor', estado: 'Activo' });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null); // Para el Modal de detalles técnicos
  const [camionEditando, setCamionEditando] = useState(null); // Para el Modal de edición rápida camión
  const [selectedDanosEdit, setSelectedDanosEdit] = useState({});
  const [observacionesEdit, setObservacionesEdit] = useState({});
  const [camionInGarantia, setCamionInGarantia] = useState(null); // Para el Modal de Motivo de Garantía
  const [pendientesGarantia, setPendientesGarantia] = useState({});
  
  // ---------- SISTEMA DE MENSAJERÍA PERSONALIZADA (ZERO BROWSER DIALOGS) ----------
  const [toasts, setToasts] = useState([]);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'info', // 'info', 'confirm', 'prompt'
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirm: null,
    onCancel: null,
    showInput: false,
    inputPlaceholder: '',
    inputValue: '',
    expectedValue: '' // Para el blindaje
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const showConfirm = (opts) => {
    setModalConfig({
      isOpen: true,
      type: opts.type || 'info',
      title: opts.title || 'Atención',
      message: opts.message || '',
      confirmText: opts.confirmText || 'Aceptar',
      cancelText: opts.cancelText || 'Cancelar',
      onConfirm: opts.onConfirm || null,
      onCancel: opts.onCancel || null,
      showInput: opts.type === 'prompt',
      inputPlaceholder: opts.placeholder || '',
      inputValue: '',
      expectedValue: opts.expectedValue || ''
    });
  };

  const handleModalConfirm = () => {
    if (modalConfig.type === 'prompt') {
      if (modalConfig.inputValue !== modalConfig.expectedValue) {
        addToast("❌ El número ingresado no coincide.", "error");
        return;
      }
    }
    if (modalConfig.onConfirm) modalConfig.onConfirm();
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Algoritmo de Inteligencia Algorítmica para detectar el 'Primer Apellido' oficial (v1.6.2)
  const generarAliasBase = (nombreCompleto, bdActual) => {
    const partes = nombreCompleto.trim().split(/\s+/).filter(p => p.length > 1);
    if (!partes || partes.length === 0) return "";
    
    const primeraLetra = partes[0].charAt(0).toLowerCase();
    let primerApellido = "";
    
    // Lista de nombres medios muy comunes (para ayudar a la IA a saltarlos en 3 palabras)
    const nombresComunesV2 = ['david', 'jose', 'maria', 'carlos', 'luis', 'antonio', 'manuel', 'francisco', 'jesus', 'miguel', 'angel', 'javier', 'david', 'alberto', 'eduardo', 'fernando', 'andres', 'felipe', 'leonardo', 'ricardo'];

    if (partes.length === 1) {
      primerApellido = partes[0].substring(1);
    } else if (partes.length === 2) {
       // Pedro Gonzalez -> pgonzalez
       primerApellido = partes[1];
    } else if (partes.length === 3) {
      // Juan David Perez -> jperez (Si la 2da es nombre común)
      // Juan Perez Rodriguez -> jperez (Si la 2da no es nombre común)
      const segundaPalabra = partes[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (nombresComunesV2.includes(segundaPalabra)) {
        primerApellido = partes[2];
      } else {
        primerApellido = partes[1];
      }
    } else if (partes.length >= 4) {
      // Alexander Francisco Ramirez Cordoba -> aramirez
      // Detectamos si hay conectores en la posición 1 (de, la, del)
      const conectores = ['de', 'la', 'del', 'los', 'las'];
      if (conectores.includes(partes[1].toLowerCase())) {
         // Juan de la Cruz Perez...
         primerApellido = partes[partes.length - 2]; 
      } else {
         primerApellido = partes[2];
      }
    } else {
      primerApellido = partes[1];
    }
    
    const aliasPuro = (primeraLetra + primerApellido).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '');
    
    // Verificador de Duplicados (Agrega 1, 2, 3...)
    let aliasCandidato = aliasPuro;
    let contador = 1;
    while (bdActual.some(usuario => usuario.username === aliasCandidato)) {
      aliasCandidato = aliasPuro + contador;
      contador++;
    }
    return aliasCandidato;
  };

  const fallas = [
    { id: 'tolva', nombre: 'Golpe de tolva', impacto: 25 },
    { id: 'suspensiones', nombre: 'Suspensiones', impacto: 25 },
    { id: 'nose_cone', nombre: 'Nose Cone', impacto: 15 },
    { id: 'barra', nombre: 'Barra estabilizadora (Hueso de perro)', impacto: 15 },
    { id: 'transmision', nombre: 'Transmisión al modular', impacto: 10 },
    { id: 'ruido', nombre: 'Ruido y polución en cabina', impacto: 5 },
    { id: 'varillaje', nombre: 'Varillaje de dirección', impacto: 5 },
    { id: 'otro', nombre: 'Otro', impacto: 0 },
  ];

  const handleDanoToggle = (id) => {
    setSelectedDanos(prev => ({ ...prev, [id]: !prev[id] }));
    if (selectedDanos[id]) {
      setObservaciones(prev => {
        const copy = {...prev};
        delete copy[id];
        return copy;
      });
    }
  };

  const handleObsChange = (id, text) => {
    setObservaciones(prev => ({ ...prev, [id]: text }));
  };

  // Calculadora...
  const totalImpacto = fallas.reduce((acc, curr) => {
    if (selectedDanos[curr.id]) return acc + curr.impacto;
    return acc;
  }, 0);

  const isFlotaValid = flota.length === 4 && flota.startsWith('2');

  // Kanban State (Nube real Supabase)
  const [camionesRegistrados, setCamionesRegistrados] = useState([]);

  // FETCH INICIAL AL MONTAR LA APP
  useEffect(() => {
    const fetchDatabase = async () => {
      // 1. Traer Usuarios en segundo plano para el Administrador
      const { data: usersInfo } = await supabase.from('usuarios').select('*');
      if (usersInfo) setDbUsuarios(usersInfo);

      // 2. Traer la Pila de Kanban
      const { data: flotaInfo } = await supabase.from('camiones').select('*');
      if (flotaInfo) setCamionesRegistrados(flotaInfo);
    };
    fetchDatabase();
  }, [session]); // Recarga si el estado auth cambia.

  // Filtro de Seguridad Global por Mina (v1.6.0)
  const camionesAccessibles = camionesRegistrados.filter(c => {
    if (session?.mina === 'Global' || session?.role === 'admin') return true;
    return c.mina === session?.mina;
  });

  const kpis = [
    { id: 'espera', titulo: 'Lista de Espera', icon: <Hourglass strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'espera').length.toString(), color: '#9ca3af', subtitulo: 'Pre-Programa' },
    { id: 'evaluar', titulo: 'Por Evaluar', icon: <Search strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'evaluar').length.toString(), color: 'var(--secondary-blue)', subtitulo: 'En Programa' },
    { id: 'evaluados', titulo: 'Evaluados', icon: <SearchCheck strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'evaluados').length.toString(), color: '#8b5cf6', subtitulo: 'En Programa' },
    { id: 'taller', titulo: 'En Taller', icon: <Wrench strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'taller').length.toString(), color: 'var(--secondary-yellow)', subtitulo: 'Ejecución' },
    { id: 'feedback', titulo: 'Feedback', icon: <CheckCircle2 strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'feedback').length.toString(), color: '#10b981', subtitulo: 'Validación' },
    { id: 'garantia', titulo: 'Garantía', icon: <ShieldAlert strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'garantia').length.toString(), color: 'var(--primary-red)', subtitulo: 'Retorno VIP' }
  ];

  const columnasKanban = [
    { id: 'espera', titulo: 'Lista de Espera', icon: <Hourglass strokeWidth={1.5} size={18} />, color: '#9ca3af' },
    { id: 'evaluar', titulo: 'Por Evaluar', icon: <Search strokeWidth={1.5} size={18} />, color: 'var(--secondary-blue)' },
    { id: 'evaluados', titulo: 'Evaluados', icon: <SearchCheck strokeWidth={1.5} size={18} />, color: '#8b5cf6' },
    { id: 'taller', titulo: 'En Taller', icon: <Wrench strokeWidth={1.5} size={18} />, color: 'var(--secondary-yellow)' },
    { id: 'feedback', titulo: 'Feedback', icon: <CheckCircle2 strokeWidth={1.5} size={18} />, color: '#10b981' },
    { id: 'garantia', titulo: 'Garantía', icon: <ShieldAlert strokeWidth={1.5} size={18} />, color: '#ef4444' }
  ];

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('camion_id', id);
  };

  const handleDrop = async (e, nuevoEstado) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('camion_id');
    if (!idStr) return;

    // Interceptamos si es paso a GARANTÍA
    if (nuevoEstado === 'garantia') {
      const camion = camionesRegistrados.find(c => c.id.toString() === idStr);
      setCamionInGarantia(camion);
      // Inicializamos pendientes con formato de objeto { selected, comment }
      const iniciales = {};
      fallas.forEach(f => {
        if ((camion?.fallas || '').includes(f.nombre)) {
          // Extraemos el comentario original si existe (texto entre paréntesis después del nombre)
          const regex = new RegExp(`${f.nombre}\\s*\\(([^)]+)\\)`);
          const match = (camion?.fallas || '').match(regex);
          const originalComment = match ? match[1] : '';
          
          iniciales[f.id] = { selected: false, comment: originalComment };
        }
      });
      setPendientesGarantia(iniciales);
      return; 
    }

    // UI Optimista (Instantáneo para el operador)
    setCamionesRegistrados(prev => 
      prev.map(c => c.id.toString() === idStr ? { ...c, estado: nuevoEstado } : c)
    );

    // Persistencia Oficial a la Nube (Asíncrono en segundo plano)
    await supabase.from('camiones').update({ estado: nuevoEstado }).eq('id', parseInt(idStr));
  };

  // Función para confirmar el envío a garantía con motivos detallados
  const confirmarGarantia = async () => {
    if (!camionInGarantia) return;

    const motivosArray = Object.keys(pendientesGarantia)
      .filter(id => pendientesGarantia[id].selected)
      .map(id => {
        const nombre = fallas.find(f => f.id === id)?.nombre;
        const comment = pendientesGarantia[id].comment ? `: ${pendientesGarantia[id].comment}` : '';
        return `${nombre}${comment}`;
      });

    if (motivosArray.length === 0) return addToast("Por favor, selecciona al menos una falla que persista.", "error");

    const motivosStr = motivosArray.join(', ');

    // Actualizamos localmente
    setCamionesRegistrados(prev => 
      prev.map(c => c.id === camionInGarantia.id ? { ...c, estado: 'garantia', motivo_garantia: motivosStr } : c)
    );

    // Actualizamos en Supabase
    await supabase.from('camiones').update({ 
      estado: 'garantia', 
      motivo_garantia: motivosStr 
    }).eq('id', camionInGarantia.id);

    setCamionInGarantia(null);
  };

  const toggleAprobacion = async (camionId, grupo, valorActual) => {
    const key = `aprobado_${grupo}`;
    const nuevoValor = !valorActual;

    // UI Optimista
    setCamionesRegistrados(prev => 
      prev.map(c => c.id === camionId ? { ...c, [key]: nuevoValor } : c)
    );

    // DB update
    await supabase.from('camiones').update({ [key]: nuevoValor }).eq('id', camionId);
  };

  const liberarCamion = async (camionId) => {
    // UI Optimista
    setCamionesRegistrados(prev => 
      prev.map(c => c.id === camionId ? { ...c, estado: 'liberado' } : c)
    );

    // DB update
    await supabase.from('camiones').update({ estado: 'liberado' }).eq('id', camionId);
    addToast("🚀 Camión liberado con éxito. Ahora reside en el Historial.");
  };

  const eliminarCamion = async (camionId, flota) => {
    showConfirm({
      type: 'prompt',
      title: '⚠ ADVERTENCIA DE SEGURIDAD',
      message: `Esta acción eliminará permanentemente el reporte del Camión ${flota}.\n\nPara confirmar, escribe el número del camión a continuación:`,
      expectedValue: String(flota),
      placeholder: `Escribe ${flota} aquí...`,
      confirmText: 'ELIMINAR PERMANENTEMENTE',
      onConfirm: async () => {
        const { error } = await supabase.from('camiones').delete().eq('id', camionId);
        if (error) return addToast("Error al eliminar: " + error.message, "error");

        setCamionesRegistrados(prev => prev.filter(c => c.id !== camionId));
        addToast(`🗑️ Camión ${flota} eliminado exitosamente del sistema.`, "success");
      }
    });
  };

  const guardarEdicionCamion = async () => {
    if (!camionEditando) return;
    
    // Validación básica de flota (Inicia con 2 y tiene 4 digitos)
    if (!camionEditando.flota.startsWith('2') || camionEditando.flota.length !== 4) {
      return addToast("El número de flota debe tener 4 dígitos y comenzar por 2.", "error");
    }

    const { error } = await supabase.from('camiones').update({
      flota: camionEditando.flota,
      mina: camionEditando.mina,
      grupo: camionEditando.grupo,
      atencion: camionEditando.atencion
    }).eq('id', camionEditando.id);

    if (error) return addToast("Error al actualizar: " + error.message, "error");

    setCamionesRegistrados(prev => prev.map(c => c.id === camionEditando.id ? camionEditando : c));
    setCamionEditando(null);
    addToast("✅ Cambios guardados en la nube.");
  };

  const prepararEdicion = (camion) => {
    const danos = {};
    const obs = {};
    if (camion.fallas) {
      const parts = camion.fallas.split(', ');
      parts.forEach(p => {
        const match = p.match(/^(.*?)(?:\s\((.*?)\))?$/);
        if (match) {
          const nombre = match[1];
          const comentario = match[2];
          const fallaObj = fallas.find(f => f.nombre === nombre);
          if (fallaObj) {
            danos[fallaObj.id] = true;
            if (comentario) obs[fallaObj.id] = comentario;
          }
        }
      });
    }
    setSelectedDanosEdit(danos);
    setObservacionesEdit(obs);
    setCamionEditando(camion);
  };

  const handleDanoToggleEdit = (id) => {
    setSelectedDanosEdit(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleObsChangeEdit = (id, text) => {
    setObservacionesEdit(prev => ({ ...prev, [id]: text }));
  };

  const guardarEdicionAvanzada = async () => {
    if (!camionEditando) return;

    // Recalcular Prioridad e Impacto
    let nuevoImpacto = 0;
    const itemsFallas = [];
    
    Object.keys(selectedDanosEdit).forEach(id => {
      if (selectedDanosEdit[id]) {
        const fallaObj = fallas.find(f => f.id === id);
        if (fallaObj) {
          nuevoImpacto += fallaObj.impacto;
          const obs = observacionesEdit[id] ? ` (${observacionesEdit[id]})` : '';
          itemsFallas.push(`${fallaObj.nombre}${obs}`);
        }
      }
    });

    const nuevaAtencion = nuevoImpacto > 50 ? 'CRÍTICA' : nuevoImpacto > 20 ? 'ALTA' : 'NORMAL';
    const nuevaFallasStr = itemsFallas.join(', ');

    const { error } = await supabase.from('camiones').update({
      flota: camionEditando.flota,
      operador: camionEditando.operador,
      mina: camionEditando.mina,
      grupo: camionEditando.grupo,
      atencion: nuevaAtencion,
      fallas: nuevaFallasStr,
      puntos: nuevoImpacto
    }).eq('id', camionEditando.id);

    if (error) return alert("Error al actualizar: " + error.message);

    // Actualizar estado local
    setCamionesRegistrados(prev => prev.map(c => c.id === camionEditando.id ? {
      ...c,
      flota: camionEditando.flota,
      operador: camionEditando.operador,
      mina: camionEditando.mina,
      grupo: camionEditando.grupo,
      atencion: nuevaAtencion,
      fallas: nuevaFallasStr,
      puntos: nuevoImpacto
    } : c));

    setCamionEditando(null);
    addToast("✅ Edición avanzada guardada y prioridad recalculada.");
  };

  // ---------- FUNCIONES DE EXPORTACIÓN (REPORTES) ----------

  const exportarAExcel = () => {
    if (registrosFiltrados.length === 0) {
      return addToast("No hay datos filtrados para exportar.", "error");
    }

    try {
      addToast("⏳ Preparando archivo Excel...", "info");
      
      const datosExcel = registrosFiltrados.map(r => ({
        "Flota": r.flota,
        "Ubicación": r.mina,
        "Operador": r.operador,
        "Fallas Reportadas": r.fallas,
        "Fecha Registro": r.time,
        "VB G1": r.aprobado_g1 ? 'Aprobado' : '-',
        "VB G2": r.aprobado_g2 ? 'Aprobado' : '-',
        "VB G3": r.aprobado_g3 ? 'Aprobado' : '-',
        "Estado Final": "LIBERADO"
      }));

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Historial Mantenimiento");
      XLSX.writeFile(workbook, `Historial_Drummond_Confort_${new Date().toLocaleDateString()}.xlsx`);
      addToast("✅ Excel descargado con éxito.");
    } catch (error) {
      addToast("❌ Error al generar Excel: " + error.message, "error");
    }
  };

  const generarPDF = (registro) => {
    try {
      addToast("⏳ Generando acta de trazabilidad...", "info");
      const doc = new jsPDF();
      
      doc.setFillColor(31, 41, 55); 
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("DRUMMOND LTD.", 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text("REPORTE TÉCNICO DE TRAZABILIDAD - CAMIONES DE CONFORT", 105, 30, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Identificación de Unidad: ${registro.flota}`, 20, 55);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Mina: ${registro.mina === 'PB' ? 'Pribbenow' : 'El Descanso'}`, 20, 65);
      doc.text(`Operador Permanente: ${registro.operador}`, 20, 72);
      doc.setFont("helvetica", "bold");
      doc.text(`Trazabilidad de Conductores por Turno:`, 20, 79);
      doc.setFont("helvetica", "normal");
      doc.text(`${registro.operador || 'N/A'}`, 20, 86);
      doc.text(`Supervisor(es) de Gestión: ${registro.supervisor || 'N/A'}`, 20, 93);
      doc.text(`Fecha de Liberación: ${new Date().toLocaleDateString()}`, 140, 65);
      
      doc.autoTable({
        startY: 100,
        head: [['Detalle de Fallas Intervenidas']],
        body: limpiarFallasIA(registro.fallas).split(', ').map(f => [f]),
        theme: 'striped',
        headStyles: { fillColor: [227, 25, 55], textColor: [255, 255, 255] }
      });

      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("HISTORIAL DE VALIDACIÓN POR GRUPOS", 20, finalY);
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Grupo de Turno', 'Visto Bueno (VB)', 'Estado']],
        body: [
          ['Grupo 1', registro.aprobado_g1 ? 'CONFIRMADO' : 'N/A', registro.aprobado_g1 ? 'Aceptado a Satisfacción' : 'Sin intervención'],
          ['Grupo 2', registro.aprobado_g2 ? 'CONFIRMADO' : 'N/A', registro.aprobado_g2 ? 'Aceptado a Satisfacción' : 'Sin intervención'],
          ['Grupo 3', registro.aprobado_g3 ? 'CONFIRMADO' : 'N/A', registro.aprobado_g3 ? 'Aceptado a Satisfacción' : 'Sin intervención'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [31, 41, 55] }
      });
      
      const signY = doc.lastAutoTable.finalY + 40;
      doc.line(20, signY, 80, signY);
      doc.text("Firma Supervisor Turno", 20, signY + 5);
      
      doc.line(130, signY, 190, signY);
      doc.text("V.B. Operaciones", 130, signY + 5);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Documento generado digitalmente por Drummond Confort System`, 105, 285, { align: 'center' });

      doc.save(`Acta_Trazabilidad_${registro.flota}_${new Date().getTime()}.pdf`);
      addToast(`✅ PDF del camión ${registro.flota} generado.`);
    } catch (err) {
      addToast("❌ Error al generar PDF: " + err.message, "error");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Lógica Funcional del Módulo de Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (usuarioLogin && passwordLogin) {
      const usernameReq = usuarioLogin.toLowerCase().trim();
      
      // Conexión Oficial con Servidor Supabase
      const { data: usuarioSupabase, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', usernameReq)
        .eq('password', passwordLogin)
        .single();
      
      if (error || !usuarioSupabase) {
        return alert(`❌ Credenciales incorrectas. Verifique el usuario "${usernameReq}" y su contraseña en el servidor de Drummond.`);
      }

      const usuarioActivo = usuarioSupabase;

      if (usuarioActivo.estado === 'Inactivo') {
        return alert(`❌ ACCESO DENEGADO: La cuenta "${usernameReq}" figura como INACTIVA, consulte con el Administrador del Sistema.`);
      }

      if (usuarioActivo.firstTime) {
        // Requiere forzar el cambio de clave por políticas operativas
        setPendingPasswordChangeUser(usuarioActivo);
        return;
      }

      const nuevaSesion = {
        user: { username: usernameReq },
        role: usuarioActivo.role,
        mina: usuarioActivo.mina === 'Ambas' || usuarioActivo.mina === 'Global' ? 'Global' : usuarioActivo.mina,
        grupo: usuarioActivo.grupo || '1',
        nombre: usuarioActivo.nombre,
        id: usuarioActivo.id
      };
      setSession(nuevaSesion);
      localStorage.setItem('drummond_session', JSON.stringify(nuevaSesion));
      setActiveTab('dashboard'); // Forzar render
    } else {
      alert("Por favor ingrese usuario y contraseña.");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 5) {
      return alert("La contraseña debe ser de al menos 5 caracteres de seguridad.");
    }
    if (newPassword !== confirmPassword) {
      return alert("⚠️ Las contraseñas no coinciden. Por favor, asegúrate de escribirlas idénticas.");
    }

    // Actualizamos al usuario en la Nube
    const { error } = await supabase.from('usuarios')
      .update({ password: newPassword, firstTime: false })
      .eq('id', pendingPasswordChangeUser.id);
    
    if (error) return addToast("Error al actualizar contraseña: " + error.message, "error");

    // Se realiza el setSession para pasar adelante
    const usuarioActivo = { ...pendingPasswordChangeUser, password: newPassword, firstTime: false };
    const nuevaSesion = {
      user: { username: usuarioActivo.username },
      role: usuarioActivo.rol,
      mina: usuarioActivo.mina === 'Ambas' || usuarioActivo.mina === 'Global' ? 'Global' : usuarioActivo.mina,
      nombre: usuarioActivo.nombre,
      id: usuarioActivo.id
    };
    setSession(nuevaSesion);
    localStorage.setItem('drummond_session', JSON.stringify(nuevaSesion));
    setActiveTab('dashboard'); // Forzar ir al panel seguro

    setPendingPasswordChangeUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setUsuarioLogin('');
    setPasswordLogin('');
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('drummond_session');
    localStorage.removeItem('drummond_activeTab');
    localStorage.removeItem('drummond_report_form');
    setUsuarioLogin('');
    setPasswordLogin('');
    setPendingPasswordChangeUser(null);
    setActiveTab('dashboard'); // Limpiar vista bloqueada
  };

  // Si no hay sesión activa, bloqueamos el acceso y mostramos el Login
  if (!session) {
    if (pendingPasswordChangeUser) {
      // PANTALLA CAMBIO CONTRASEÑA OBLIGATORIO
      return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
          <div className="fade-in" style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ background: '#fef2f2', width: '60px', height: '60px', borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#ef4444', fontSize: '1.5rem' }}>🔐</div>
              <h1 style={{ color: '#1f2937', margin: 0, fontSize: '1.4rem' }}>Actualización Requerida</h1>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>Hola, <b>{pendingPasswordChangeUser.nombre}</b>. Por políticas de seguridad, debes registrar una nueva clave antes de ingresar al sistema.</p>
            </div>
            
            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="input-group">
                <label className="input-label">📝 Define tu Nueva Contraseña</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Mínimo 5 caracteres" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ border: '2px solid #3b82f6' }}
                  required
                />
              </div>
              <div className="input-group" style={{ marginTop: '-0.5rem' }}>
                <label className="input-label">Confirma tu Contraseña</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Escríbela de nuevo idéntica" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ border: '2px solid #3b82f6' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', background: '#2563eb', borderColor: '#2563eb' }}>
                Actualizar y Acceder
              </button>
            </form>
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
             <h1 style={{ color: '#ef4444', margin: 0, fontSize: '1.8rem', letterSpacing: '-1px' }}>DRUMMOND</h1>
             <p style={{ color: '#1f2937', fontWeight: 'bold', margin: '0.2rem 0', fontSize: '1.2rem' }}>Programa de Confort Camiones</p>
             <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Plataforma Interna Asegurada</span>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="input-group">
              <label className="input-label">Usuario</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ejemplo: jperez" 
                value={usuarioLogin}
                onChange={e => setUsuarioLogin(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))} // Solo alfanuméricos
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Contraseña</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                value={passwordLogin}
                onChange={e => setPasswordLogin(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
              🔒 Ingresar al Sistema
            </button>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '1rem' }}>
              El estado de conexión en vivo con Supabase está pendiente de API keys.
            </p>
          </form>
        </div>
      </div>
    );
  }



  const registrosFiltrados = camionesAccessibles.filter(r => {
    return r.estado === 'liberado' &&
           r.flota.includes(filtroFlota) && 
           (filtroMina === '' || r.mina === filtroMina) && 
           r.time.toLowerCase().includes(filtroMes.toLowerCase());
  });

  const conteoLiberados = camionesAccessibles.filter(c => c.estado === 'liberado').length;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo-container">
            <div className="brand-logo-text">CAMIONES</div>
            <div className="brand-subtitle">PRODUCCIÓN</div>
          </div>
        </div>
        
        <nav className="nav-menu">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Dashboard Principal
          </div>
          <div 
            className={`nav-item ${activeTab === 'nuevo' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('nuevo');
              // Automatización de Datos por Usuario (v1.6.0)
              if (session.role !== 'admin') {
                setMina(session.mina === 'Global' ? mina : session.mina);
                setGrupo(session.grupo);
              }
            }}
          >
            <PlusCircle size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Nuevo Reporte
          </div>
          <div 
            className={`nav-item ${activeTab === 'cola' ? 'active' : ''}`}
            onClick={() => setActiveTab('cola')}
          >
            <Blocks size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Pila de Mantenimiento
          </div>
          <div className={`nav-item ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
            <ClipboardList size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Historial Analítico
          </div>
          {session.role === 'admin' && (
            <div className={`nav-item ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>
              <Settings size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Gestor de Cuentas
            </div>
          )}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
              {session.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>{session.nombre}</div>
              <div style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>Mina {session.mina}</div>
            </div>
          </div>
          <button 
            style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">
            {activeTab === 'dashboard' && 'Panel de Control - Confort'}
            {activeTab === 'nuevo' && 'Nuevo Reporte'}
            {activeTab === 'cola' && 'Cola de Priorización Taller'}
            {activeTab === 'historial' && 'Historial de Mantenimientos'}
          </h1>
          <div className="user-profile">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700' }}>{session.nombre}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mina {session.mina}</div>
              </div>
              <div style={{ 
                width: '40px', height: '40px', 
                borderRadius: '50%', backgroundColor: '#ef4444',
                color: 'white', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', fontWeight: 'bold' 
              }}>
                {session.nombre.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-view fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-black)', margin: 0 }}><LayoutDashboard strokeWidth={1.5} size={24} style={{ marginBottom: '-0.3rem', color: '#2563eb' }} />  Resumen de Control</h2>
              <span className="badge badge-liberado" style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.15)', color: '#059669', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)' }}>
                <Award size={16} strokeWidth={2} /> Camiones Entregados Satisfactoriamente: {conteoLiberados}
              </span>
            </div>
            <div className="kpi-grid">
              {kpis.map(k => (
                <div key={k.id} className="kpi-card" style={{ borderTopColor: k.color }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', alignItems: 'center' }}>
                    {k.titulo}
                    <span style={{ color: k.color }}>{k.icon}</span>
                  </div>
                  <div className="kpi-value">{k.valor}</div>
                  <div style={{fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem'}}>{k.subtitulo}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Top Prioridades Actuales</h3>
                <button className="btn btn-primary" onClick={() => setActiveTab('cola')}>Ver Cola Completa</button>
              </div>
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Flota (Camión)</th>
                      <th>Mina / Grupo</th>
                      <th>Atención Requerida</th>
                      <th>Estado</th>
                      <th>Fecha Reporte</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {camionesAccessibles.filter(c => c.estado !== 'liberado').slice(0, 5).map(camion => (
                      <tr key={camion.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <strong style={{ fontSize: '1.1rem' }}>{camion.flota}</strong>
                            <button 
                              onClick={() => setSelectedReport(camion)}
                              style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Ver Reporte Técnico"
                            >
                              <FileText size={16} />
                            </button>
                          </div>
                        </td>
                        <td>
                          {camion.mina} / {String(camion.grupo || '?').split(', ').map(g => g.startsWith('G') ? g : `G${g}`).join(', ')}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            {camion.atencion === 'CRÍTICA' && <><Siren size={20} color="#ef4444" strokeWidth={2} /><strong>CRÍTICA</strong></>}
                            {camion.atencion === 'ALTA' && <><AlertTriangle size={20} color="var(--secondary-yellow)" strokeWidth={2} /><strong>ALTA</strong></>}
                            {camion.atencion === 'NORMAL' && <><CheckCircle2 size={20} color="#10b981" strokeWidth={2} /><strong>NORMAL</strong></>}
                          </div>
                        </td>
                        <td><span className={`badge badge-${camion.estado}`}>{camion.estado.toUpperCase()}</span></td>
                        <td>{camion.time}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                            {(session?.role?.toLowerCase() === 'admin' || session?.role?.toLowerCase() === 'supervisor' || session?.rol?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'supervisor') && (
                              <button 
                                onClick={() => prepararEdicion(camion)} 
                                className="btn-action btn-action-edit"
                                title="Editar Ficha"
                              >
                                <Edit3 size={18} />
                              </button>
                            )}
                            {(session?.role?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'admin') && (
                              <button 
                                onClick={() => eliminarCamion(camion.id, camion.flota)} 
                                className="btn-action btn-action-delete"
                                title="Eliminar Registro"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {camionesRegistrados.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No hay camiones priorizados actualmente.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board View */}
        {activeTab === 'cola' && (
          <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--primary-black)', margin: 0 }}>🔧 Pila de Mantenimiento (Control Taller)</h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Arrastra los camiones para avanzar su estado</span>
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

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              overflowX: 'auto', 
              paddingBottom: '1rem',
              flex: 1,
              alignItems: 'flex-start'
            }}>
              {columnasKanban.map(col => {
                const camionesColumna = camionesAccessibles.filter(c => c.estado === col.id).sort((a,b) => b.puntos - a.puntos);
                
                return (
                  <div 
                    key={col.id} 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                    style={{ 
                      flex: '0 0 280px', 
                      background: 'rgba(255, 255, 255, 0.15)', 
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderRadius: '12px', 
                      padding: '1rem',
                      borderTop: `4px solid ${col.color}`,
                      border: '1px solid rgba(255,255,255,0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8rem',
                      minHeight: '60vh'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--primary-black)' }}>{col.titulo}</strong>
                      <span className="badge" style={{ background: 'white', color: 'var(--primary-black)', borderRadius: '50px' }}>
                        {camionesColumna.length}
                      </span>
                    </div>

                    {camionesColumna.map(camion => (
                      <div 
                        key={camion.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, camion.id)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          backdropFilter: 'blur(15px)',
                          padding: '1rem',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                          cursor: 'grab',
                          border: '1px solid rgba(255, 255, 255, 0.8)',
                          transition: 'transform 0.2s',
                          borderLeft: `4px solid ${camion.atencion === 'CRÍTICA' ? '#ef4444' : camion.atencion === 'ALTA' ? 'var(--secondary-yellow)' : '#10b981'}`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <Truck size={18} color="var(--primary-red)" />
                          <strong style={{ fontSize: '1.25rem', color: 'var(--primary-black)', letterSpacing: '-0.5px' }}>{camion.flota}</strong>
                          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            {camion.consenso > 1 && (
                              <div title={`Consenso de ${camion.consenso} grupos`} style={{ background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem', border: '1px solid #dbeafe' }}>
                                <Users size={12} /> {camion.consenso}
                              </div>
                            )}
                            {camion.atencion === 'CRÍTICA' && <span><Siren size={18} color="#ef4444" strokeWidth={2} /></span>}
                            {camion.atencion === 'ALTA' && <span><AlertTriangle size={18} color="#eab308" strokeWidth={2} /></span>}
                            {camion.atencion === 'NORMAL' && <span><CheckCircle2 size={18} color="#10b981" strokeWidth={2} /></span>}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          Ingreso: {camion.time}
                        </div>
                        {/* Botón de Diagnóstico para Móviles / Limpieza Visual */}
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setSelectedReport(camion)}
                          style={{ 
                            width: '100%', 
                            padding: '0.5rem', 
                            fontSize: '0.75rem', 
                            marginBottom: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            border: '1px solid #e5e7eb',
                            background: '#f9fafb'
                          }}
                        >
                          <MonitorCheck size={14} /> Ver Diagnóstico
                        </button>

                        {/* Mostrar motivo de garantía si aplica con transparencia */}
                        {camion.estado === 'garantia' && camion.motivo_garantia && (
                          <div style={{ 
                            marginBottom: '0.8rem', 
                            padding: '0.6rem', 
                            background: 'rgba(254, 226, 226, 0.4)', 
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                            borderRadius: '8px' 
                          }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#be123c', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <ShieldAlert size={12} /> FALLAS PENDIENTES:
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#9f1239', lineHeight: '1.2' }}>{camion.motivo_garantia}</div>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280' }}>Prioridad:</span>
                          <span className="badge" style={{ 
                            background: '#f9fafb', 
                            color: camion.atencion === 'CRÍTICA' ? '#ef4444' : 'var(--text-muted)',
                            border: '1px solid #e5e7eb'
                          }}>
                            {camion.atencion}
                          </span>
                        </div>
                        {/* Renderización Exclusiva para estado Feedback (Aprobaciones Conjuntas Reales) */}
                        {camion.estado === 'feedback' && (
                          <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px dashed #e5e7eb' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>Vistos Buenos (V.B):</span>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <button 
                                onClick={() => toggleAprobacion(camion.id, 'g1', !!camion.aprobado_g1)}
                                style={{ border: 'none', cursor: 'pointer', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '50px', background: camion.aprobado_g1 ? '#dcfce7' : '#f3f4f6', color: camion.aprobado_g1 ? '#166534' : '#6b7280', border: '1px solid', borderColor: camion.aprobado_g1 ? '#bbf7d0' : '#e5e7eb' }}
                              >
                                {camion.aprobado_g1 ? '✓ G1' : '? G1'}
                              </button>
                              <button 
                                onClick={() => toggleAprobacion(camion.id, 'g2', !!camion.aprobado_g2)}
                                style={{ border: 'none', cursor: 'pointer', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '50px', background: camion.aprobado_g2 ? '#dcfce7' : '#f3f4f6', color: camion.aprobado_g2 ? '#166534' : '#6b7280', border: '1px solid', borderColor: camion.aprobado_g2 ? '#bbf7d0' : '#e5e7eb' }}
                              >
                                {camion.aprobado_g2 ? '✓ G2' : '? G2'}
                              </button>
                              <button 
                                onClick={() => toggleAprobacion(camion.id, 'g3', !!camion.aprobado_g3)}
                                style={{ border: 'none', cursor: 'pointer', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '50px', background: camion.aprobado_g3 ? '#dcfce7' : '#f3f4f6', color: camion.aprobado_g3 ? '#166534' : '#6b7280', border: '1px solid', borderColor: camion.aprobado_g3 ? '#bbf7d0' : '#e5e7eb' }}
                              >
                                {camion.aprobado_g3 ? '✓ G3' : '? G3'}
                              </button>
                            </div>
                            
                            {/* Lógica de Liberación si hay >=2 aprobados */}
                            {([camion.aprobado_g1, camion.aprobado_g2, camion.aprobado_g3].filter(Boolean).length >= 2) ? (
                              <button 
                                className="btn btn-primary"
                                onClick={() => liberarCamion(camion.id)}
                                style={{ width: '100%', marginTop: '0.8rem', padding: '0.4rem', fontSize: '0.75rem', background: '#10b981', borderColor: '#10b981' }}
                              >
                                🚛 LIBERAR CAMIÓN
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                Requiere 2 aprobaciones para liberar.
                              </span>
                            )}
                          </div>
                        )}

                        {/* Mobile & Accessible 'Mover' Option */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', borderTop: '1px solid #f3f4f6', paddingTop: '0.8rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mover a:</span>
                          <select 
                            value={camion.estado} 
                            onChange={(e) => {
                              // Simulate drop event parameters
                              const evt = { preventDefault: () => {}, dataTransfer: { getData: () => camion.id.toString() } };
                              handleDrop(evt, e.target.value);
                            }}
                            className="input-field"
                            style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.8rem', background: '#f9fafb', width: 'auto', minWidth: '110px' }}
                          >
                            {columnasKanban.map(opts => (
                              <option key={opts.id} value={opts.id}>{opts.titulo.replace(/[^\w\sñáéíóúÁÉÍÓÚ]/gi, '')}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    
                    {camionesColumna.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', padding: '1rem 0' }}>
                        Vacío
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Historial View */}
        {activeTab === 'historial' && (
          <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ marginBottom: '0.2rem', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ClipboardList size={22} strokeWidth={2} style={{ color: 'var(--secondary-blue)' }} /> Historial de Mantenimientos 
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Registro histórico de camiones de confort completamente solucionados.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge badge-liberado" style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.15)', color: '#059669', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)' }}>
                  <Award size={16} strokeWidth={2} /> Camiones Registrados: {conteoLiberados}
                </span>
                <button 
                  className="btn btn-primary" 
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.7)', borderColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}
                  onClick={exportarAExcel}
                >
                  <FileSpreadsheet size={16} strokeWidth={2} /> Exportar a Excel
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Search size={16} strokeWidth={1.5}/> Flota:</span>
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
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={16} strokeWidth={1.5}/> Mina:</span>
                <select 
                  className="input-field" 
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.5)' }} 
                  value={filtroMina} 
                  onChange={(e) => setFiltroMina(e.target.value)}
                >
                  <option value="">Todas las Minas</option>
                  <option value="PB">Pribbenow (PB)</option>
                  <option value="ED">El Descanso (ED)</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={16} strokeWidth={1.5}/> Mes Salida:</span>
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
                    <th>Flota</th>
                    <th>Fallas Reparadas</th>
                    <th>Ingreso a Fila</th>
                    <th>Tiempo de Ciclo</th>
                    <th>Operador Permanente / Mina</th>
                    <th>Aprobado Por</th>
                    <th>Reporte</th>
                    {session.role === 'admin' && <th style={{ textAlign: 'center' }}>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.length > 0 ? registrosFiltrados.map(registro => (
                    <tr key={registro.id}>
                      <td><strong style={{ fontSize: '1.1rem', color: 'var(--primary-black)' }}>{registro.flota}</strong></td>
                      <td style={{ fontSize: '0.9rem', color: 'var(--text-main)', maxWidth: '200px' }}>{limpiarFallasIA(registro.fallas)}</td>
                      <td style={{ fontSize: '0.85rem' }}>{registro.time}</td>
                      <td style={{ fontSize: '0.85rem' }}>Calculando...</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {(registro.operador || 'N/A').split(', ').map((op, idx) => {
                             // Transformamos "G1: Carlos Perez" en "CARLOS PEREZ G1 / mina"
                             const parts = op.split(': ');
                             const grupoLabel = parts.length > 1 ? parts[0] : '';
                             const nombreOp = parts.length > 1 ? parts[1] : parts[0];
                             return (
                               <div key={idx} style={{ 
                                 background: 'rgba(99, 102, 241, 0.05)', 
                                 padding: '0.4rem 0.6rem', 
                                 borderRadius: '8px',
                                 color: 'var(--primary-black)', 
                                 fontWeight: '600',
                                 fontSize: '0.85rem',
                                 display: 'flex',
                                 alignItems: 'center',
                                 gap: '0.4rem',
                                 borderLeft: '3px solid var(--secondary-blue)'
                               }}>
                                 <Truck size={14} style={{ color: 'var(--secondary-blue)' }} />
                                 <span>{nombreOp.toUpperCase()} {grupoLabel} / {String(registro.mina || '').toUpperCase()}</span>
                               </div>
                             );
                          })}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          {registro.aprobado_g1 && <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>G1</span>}
                          {registro.aprobado_g2 && <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>G2</span>}
                          {registro.aprobado_g3 && <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>G3</span>}
                          {(!registro.aprobado_g1 && !registro.aprobado_g2 && !registro.aprobado_g3) && <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Sin V.B</span>}
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '1px solid rgba(227, 25, 55, 0.4)', color: 'var(--primary-red)', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(5px)' }}
                          onClick={() => generarPDF(registro)}
                        >
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
                            <FileText size={15} strokeWidth={1.5} /> Ver PDF
                          </div>
                        </button>
                      </td>
                      {session.role === 'admin' && (
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => eliminarCamion(registro.id, registro.flota)} 
                            className="btn-action btn-action-delete"
                            title="Eliminar Reporte Histórico"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={session.role === 'admin' ? "7" : "6"} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No hay registros que coincidan con estos filtros.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Console View: Gestión de Usuarios (Admins only) */}
        {activeTab === 'usuarios' && session.role === 'admin' && (
          <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ background: '#eef2ff', padding: '0.7rem', borderRadius: '12px', marginRight: '1rem', color: '#4f46e5' }}>
                  <Users size={24} />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--primary-black)', fontSize: '1.4rem' }}>Directorio de Cuentas</h2>
                  <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.9rem' }}>Control estricto de accesos al sistema y asignación a minas.</p>
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => { setIsCreandoUsuario(!isCreandoUsuario); setUsuarioEditando(null); }}
                style={{ backgroundColor: isCreandoUsuario ? '#6b7280' : 'var(--primary-red)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {isCreandoUsuario ? 'Cancelar Formulario' : <><PlusCircle size={16} /> Registrar Operador</>}
              </button>
            </div>

            {/* Formulario de Alta de Usuario */}
            {isCreandoUsuario && (
              <div className="fade-in" style={{ padding: '1.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--primary-black)' }}>Alta en Base de Datos</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Nombre del Profesional</label>
                    <input type="text" className="input-field" placeholder="ej: Pedro González" value={nuevoUsuarioParams.nombre} onChange={e => {
                      const nuevoNombre = e.target.value;
                      setNuevoUsuarioParams({...nuevoUsuarioParams, nombre: nuevoNombre, username: generarAliasBase(nuevoNombre, dbUsuarios)});
                    }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Usuario Login (Generado)</label>
                    <input type="text" className="input-field" placeholder="ej: pgonzalez" value={nuevoUsuarioParams.username} onChange={e => setNuevoUsuarioParams({...nuevoUsuarioParams, username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()})} style={{ background: '#f8fafc', color: '#64748b' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Clave Temporal</label>
                    <input type="text" className="input-field" value="con123" disabled style={{ background: '#f1f5f9', color: '#94a3b8' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Estado de la Cuenta</label>
                    <select className="input-field" value={nuevoUsuarioParams.estado} onChange={e => setNuevoUsuarioParams({...nuevoUsuarioParams, estado: e.target.value})}>
                      <option value="Activo">🟢 Activo</option>
                      <option value="Inactivo">🔴 Suspendido/Inactivo</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Rol Operativo</label>
                    <select className="input-field" value={nuevoUsuarioParams.role} onChange={e => setNuevoUsuarioParams({...nuevoUsuarioParams, role: e.target.value})}>
                      <option value="supervisor">Supervisor de Producción</option>
                      <option value="lector">Lector KPI (Auditoría)</option>
                      <option value="admin">Administrador TI</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Fijar Mina a Cargo</label>
                    <select className="input-field" value={nuevoUsuarioParams.mina} onChange={e => setNuevoUsuarioParams({...nuevoUsuarioParams, mina: e.target.value})} disabled={nuevoUsuarioParams.role === 'admin'}>
                      <option value="PB">Pribbenow (PB)</option>
                      <option value="ED">El Descanso (ED)</option>
                      <option value="Ambas">Ambas Minas (PB/ED)</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Asignar Grupo</label>
                    <select className="input-field" value={nuevoUsuarioParams.grupo} onChange={e => setNuevoUsuarioParams({...nuevoUsuarioParams, grupo: e.target.value})}>
                      <option value="1">Grupo 1</option>
                      <option value="2">Grupo 2</option>
                      <option value="3">Grupo 3</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-primary" onClick={async () => {
                    if(!nuevoUsuarioParams.username || !nuevoUsuarioParams.nombre) return addToast('Por favor, completa nombre y usuario.', 'error');
                    
                    const { data, error } = await supabase.from('usuarios').insert([{
                      nombre: nuevoUsuarioParams.nombre,
                      username: nuevoUsuarioParams.username,
                      password: nuevoUsuarioParams.password,
                      role: nuevoUsuarioParams.role,
                      mina: nuevoUsuarioParams.mina,
                      grupo: nuevoUsuarioParams.grupo,
                      estado: nuevoUsuarioParams.estado,
                      firstTime: true,
                      creado: new Date().toLocaleDateString()
                    }]).select();

                    if (error) return addToast("Error al crear usuario: " + error.message, "error");
                    
                    setDbUsuarios([...dbUsuarios, data[0]]);
                    setIsCreandoUsuario(false);
                    setNuevoUsuarioParams({ nombre: '', username: '', password: 'con123', mina: 'PB', grupo: '1', role: 'supervisor', estado: 'Activo' });
                    addToast('✅ Operador ' + nuevoUsuarioParams.nombre + ' admitido exitosamente.');
                  }}>Crear Acreditación</button>
                </div>
              </div>
            )}

            {/* Formulario de Edición de Usuario */}
            {usuarioEditando && (
              <div className="fade-in" style={{ padding: '1.5rem', background: '#faf5ff', border: '1px solid #e879f9', borderRadius: '8px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#a21caf' }}>✏️ Modificando Ficha Corporativa: @{usuarioEditando.username}</h3>
                  <button onClick={() => setUsuarioEditando(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>❌ Cancelar Edición</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Corregir Nombre</label>
                    <input type="text" className="input-field" value={usuarioEditando.nombre} onChange={e => setUsuarioEditando({...usuarioEditando, nombre: e.target.value})} style={{ borderColor: '#fbcfe8' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Nuevo Usuario Login</label>
                    <input type="text" className="input-field" value={usuarioEditando.username} onChange={e => setUsuarioEditando({...usuarioEditando, username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()})} style={{ borderColor: '#fbcfe8' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Ascender o Reasignar Rol</label>
                    <select className="input-field" value={usuarioEditando.role} onChange={e => setUsuarioEditando({...usuarioEditando, role: e.target.value})} style={{ borderColor: '#fbcfe8' }}>
                      <option value="supervisor">Supervisor de Producción</option>
                      <option value="lector">Lector KPI (Auditoría)</option>
                      <option value="admin">Administrador TI</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Cambiar Mina a Cargo</label>
                    <select className="input-field" value={usuarioEditando.mina} onChange={e => setUsuarioEditando({...usuarioEditando, mina: e.target.value})} disabled={usuarioEditando.role === 'admin'} style={{ borderColor: '#fbcfe8' }}>
                      <option value="PB">Pribbenow (PB)</option>
                      <option value="ED">El Descanso (ED)</option>
                      <option value="Ambas">Ambas Minas (PB/ED)</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Cambiar Grupo</label>
                    <select className="input-field" value={usuarioEditando.grupo || '1'} onChange={e => setUsuarioEditando({...usuarioEditando, grupo: e.target.value})} style={{ borderColor: '#fbcfe8' }}>
                      <option value="1">Grupo 1</option>
                      <option value="2">Grupo 2</option>
                      <option value="3">Grupo 3</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Estado Corporativo</label>
                    <select className="input-field" value={usuarioEditando.estado} onChange={e => setUsuarioEditando({...usuarioEditando, estado: e.target.value})} style={{ borderColor: '#fbcfe8', background: usuarioEditando.estado === 'Activo' ? '#f0fdf4' : '#fef2f2' }}>
                      <option value="Activo">🟢 Activo</option>
                      <option value="Inactivo">🔴 Inactivo / Suspendido</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-primary" style={{ background: '#c026d3', borderColor: '#c026d3' }} onClick={async () => {
                    if(!usuarioEditando.username || !usuarioEditando.nombre) return addToast('No puedes dejar campos principales vacíos.', 'error');
                    if(usuarioEditando.role === 'admin') usuarioEditando.mina = 'Ambas';
                    
                    const { error } = await supabase.from('usuarios').update(usuarioEditando).eq('id', usuarioEditando.id);
                    if (error) return addToast('Error al actualizar: ' + error.message, 'error');

                    setDbUsuarios(dbUsuarios.map(u => u.id === usuarioEditando.id ? usuarioEditando : u));
                    setUsuarioEditando(null);
                    addToast('✅ Modificaciones aplicadas en el directorio.');
                  }}>💾 Guardar Cambios</button>
                </div>
              </div>
            )}

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Nombre Completo</th>
                    <th>Estado</th>
                    <th>Rol en el Sistema</th>
                    <th>Ubicación Fija</th>
                    <th>Grupo</th>
                    <th>Otorgamiento</th>
                    <th style={{ textAlign: 'right' }}>Controles</th>
                  </tr>
                </thead>
                <tbody>
                  {dbUsuarios.map(u => (
                    <tr key={u.id}>
                      <td>
                        <strong style={{ color: 'var(--primary-black)', fontSize: '1rem' }}>{u.nombre}</strong><br/>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{u.username}</span>
                      </td>
                      <td>
                        {u.estado === 'Activo' ? (
                          <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span> Activo
                          </span>
                        ) : (
                          <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span> Inactivo
                          </span>
                        )}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        <span className="badge" style={{ background: u.role === 'admin' ? '#fee2e2' : '#e0e7ff', color: u.role === 'admin' ? '#991b1b' : '#3730a3' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500' }}>{u.role === 'admin' ? 'Todo' : `Mina ${u.mina}`}</td>
                      <td>
                        <span className="badge" style={{ background: '#f3f4f6', color: '#374151', fontSize: '0.8rem' }}>
                          G{u.grupo || '1'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.creado}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button title="Editar Parametros" className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', display: 'flex', alignItems: 'center' }} onClick={() => {
                            setUsuarioEditando(u);
                            setIsCreandoUsuario(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}>
                              <Edit3 size={15} />
                          </button>
                          <button title="Resetear Clave" className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', border: '1px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center' }} onClick={() => {
                            showConfirm({
                              type: 'confirm',
                              title: '🔐 Reseteo de Credenciales',
                              message: `¿Forzar a ${u.nombre} a actualizar su contraseña? Se le pedirá cambio obligatorio cuando intente loguearse nuevamente.`,
                              onConfirm: async () => {
                                const { error } = await supabase.from('usuarios').update({ password: 'con123', firstTime: true }).eq('id', u.id);
                                if (error) return addToast('Error al resetear clave: ' + error.message, 'error');
                                setDbUsuarios(dbUsuarios.map(x => x.id === u.id ? {...x, password: 'con123', firstTime: true} : x));
                                addToast(`Se ha suspendido temporalmente por reseteo a ${u.nombre}. Usará clave estándar "con123".`);
                              }
                            });
                          }}>
                              <RefreshCcw size={15} />
                          </button>
                          <button title="Eliminar del Sistema" className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center' }} onClick={() => {
                            if(u.username === 'admin' || u.username === 'aramirez') {
                              return addToast('No se puede despedir al Administrador Supremo del sistema.', 'error');
                            }
                            showConfirm({
                              type: 'confirm',
                              title: '🗑️ Baja de Colaborador',
                              message: `¿Remover a ${u.username} del ecosistema corporativo absolutamente?`,
                              onConfirm: async () => {
                                const { error } = await supabase.from('usuarios').delete().eq('id', u.id);
                                if (error) return addToast('Error al eliminar: ' + error.message, 'error');
                                setDbUsuarios(dbUsuarios.filter(x => x.id !== u.id));
                                addToast('Usuario removido del sistema con éxito.');
                              }
                            });
                          }}>
                              <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* New Report View */}
        {activeTab === 'nuevo' && (
          <div className="card fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <PlusCircle size={22} strokeWidth={2} style={{ color: 'var(--primary-red)' }} /> Nuevo Reporte
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Identificación de Flota</label>
                <input 
                  type="text" 
                  className="input-field"
                  style={{ borderColor: flota.length > 0 && !isFlotaValid ? 'var(--primary-red)' : '' }}
                  placeholder="Ej: 2554 (Inicia con 2)" 
                  value={flota}
                  onChange={(e) => setFlota(e.target.value.replace(/\D/g, '').slice(0,4))}
                />
                {flota.length > 0 && !isFlotaValid && (
                  <span style={{color: 'var(--primary-red)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block'}}>
                    Debe tener 4 dígitos y comenzar por 2.
                  </span>
                )}
              </div>
              <div className="input-group">
                <label className="input-label">Operador Permanente</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Nombre del operador" 
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
               <div className="input-group">
                <label className="input-label">Ubicación (Mina)</label>
                <select 
                  className="input-field" 
                  value={mina} 
                  onChange={(e) => setMina(e.target.value)}
                  disabled={session.role !== 'admin'}
                  style={{ 
                    backgroundColor: session.role !== 'admin' ? '#f3f4f6' : 'white', 
                    cursor: session.role !== 'admin' ? 'not-allowed' : 'default',
                    color: session.role !== 'admin' ? '#6b7280' : 'inherit'
                  }}
                >
                    <option value="PB">Mina Pribbenow (PB)</option>
                    <option value="ED">Mina El Descanso (ED)</option>
                </select>
               </div>
               <div className="input-group">
                <label className="input-label">Grupo</label>
                <select 
                  className="input-field" 
                  value={grupo} 
                  onChange={(e) => setGrupo(e.target.value)}
                  disabled={session.role !== 'admin'}
                  style={{ 
                    backgroundColor: session.role !== 'admin' ? '#f3f4f6' : 'white', 
                    cursor: session.role !== 'admin' ? 'not-allowed' : 'default',
                    color: session.role !== 'admin' ? '#6b7280' : 'inherit'
                  }}
                >
                    <option value="1">Grupo 1</option>
                    <option value="2">Grupo 2</option>
                    <option value="3">Grupo 3</option>
                </select>
               </div>
            </div>

            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Fallas Mecánicas (Falta de Confort)</h3>
                <div style={{ 
                  backgroundColor: totalImpacto > 50 ? 'var(--primary-red)' : totalImpacto > 20 ? 'var(--secondary-yellow)' : totalImpacto > 0 ? '#10b981' : '#e5e7eb', 
                  color: totalImpacto > 20 && totalImpacto <= 50 ? 'var(--primary-black)' : totalImpacto === 0 ? 'var(--primary-black)' : 'white' , 
                  padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}>
                  Atención Requerida: {totalImpacto > 50 ? '🚨 CRÍTICA' : totalImpacto > 20 ? '⚠️ ALTA' : totalImpacto > 0 ? '✅ NORMAL' : 'Sin Datos'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {fallas.map(falla => (
                  <div key={falla.id} style={{ background: 'white', padding: '0.8rem 1.5rem', borderRadius: '50px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.8rem', transition: 'all 0.3s', boxShadow: selectedDanos[falla.id] ? '0 4px 12px rgba(239, 68, 68, 0.1)' : 'none', borderColor: selectedDanos[falla.id] ? 'var(--primary-red)' : 'var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: '500', width: '100%' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={!!selectedDanos[falla.id]}
                            onChange={() => handleDanoToggle(falla.id)}
                            style={{ 
                              width: '24px', 
                              height: '24px', 
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              borderRadius: '50%', 
                              border: `2px solid ${selectedDanos[falla.id] ? 'var(--primary-red)' : '#d1d5db'}`,
                              backgroundColor: selectedDanos[falla.id] ? 'var(--primary-red)' : 'white',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          />
                          {selectedDanos[falla.id] && (
                            <div style={{ 
                              position: 'absolute', 
                              width: '10px', 
                              height: '10px', 
                              borderRadius: '50%', 
                              backgroundColor: 'white',
                              pointerEvents: 'none'
                             }} />
                          )}
                        </div>
                        {falla.nombre}
                      </label>
                      <span className="badge" style={{ 
                        background: falla.impacto >= 25 ? 'rgba(227, 25, 55, 0.1)' : falla.impacto >= 10 ? 'rgba(255, 242, 0, 0.2)' : '#e5e7eb', 
                        color: falla.impacto >= 25 ? 'var(--primary-red)' : falla.impacto >= 10 ? '#854d0e' : '#4b5563', 
                        padding: '0.4rem 0.8rem',
                        border: `1px solid ${falla.impacto >= 25 ? 'rgba(227, 25, 55, 0.2)' : falla.impacto >= 10 ? 'rgba(255, 242, 0, 0.5)' : '#d1d5db'}`
                      }}>
                        {falla.impacto >= 25 ? 'Crítico' : falla.impacto >= 10 ? 'Mayor' : 'Menor'}
                      </span>
                    </div>
                    
                    {selectedDanos[falla.id] && (
                      <div className="fade-in" style={{ paddingLeft: '2.5rem' }}>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder={`Detalle u observación sobre: ${falla.nombre}...`}
                          value={observaciones[falla.id] || ''}
                          onChange={(e) => handleObsChange(falla.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setActiveTab('dashboard')}>Cancelar</button>
              <button 
                className="btn btn-primary" 
                disabled={!isFlotaValid || !operador || totalImpacto === 0}
                onClick={async () => {
                    const camionExistente = camionesRegistrados.find(c => c.flota === flota && c.estado !== 'liberado');
                    
                    if (camionExistente) {
                        // 1. Integración de Grupos, Conductores y Supervisores
                        const listaGrupos = Array.from(new Set([...camionExistente.grupo.split(', '), grupo])).sort();
                        
                        const nuevoRegSup = `G${grupo}: ${session.nombre}`;
                        const supsActuales = (camionExistente.supervisor || '').split(', ').filter(Boolean);
                        const listaSupervisores = Array.from(new Set([...supsActuales, nuevoRegSup]));

                        const nuevoRegOp = `G${grupo}: ${operador}`;
                        const opsActuales = (camionExistente.operador || '').split(', ').filter(Boolean);
                        const listaOperadores = Array.from(new Set([...opsActuales, nuevoRegOp]));

                        const numGrupos = listaGrupos.length;

                        // 2. Integración de Fallas y Puntos Base
                        // Identificamos IDs de fallas nuevas y existentes para desduplicar puntos
                        const fallasActualesIds = new Set();
                        fallas.forEach(f => {
                          if (camionExistente.fallas.includes(f.nombre)) fallasActualesIds.add(f.id);
                        });
                        
                        const todasFallasIds = new Set([...Array.from(fallasActualesIds), ...Object.keys(selectedDanos)]);
                        
                        const puntosBase = Array.from(todasFallasIds).reduce((acc, id) => {
                          const f = fallas.find(x => x.id === id);
                          return acc + (f ? f.impacto : 0);
                        }, 0);

                        // 3. Algoritmo de Prioridad Escalable (Bono Consenso)
                        const bonoConsenso = (numGrupos - 1) * 30;
                        const puntosFinales = puntosBase + bonoConsenso;
                        const atencionLabel = puntosFinales > 50 ? 'CRÍTICA' : puntosFinales > 20 ? 'ALTA' : 'NORMAL';

                        // 4. Construcción del string de fallas consolidado (Preservando comentarios anteriores)
                        const obsAnteriores = {};
                        if (camionExistente.fallas) {
                          camionExistente.fallas.split(', ').forEach(p => {
                            const match = p.match(/^(.*?)(?:\s\((.*?)\))?$/);
                            if (match && match[2]) {
                              const fObj = fallas.find(f => f.nombre === match[1]);
                              if (fObj) obsAnteriores[fObj.id] = match[2];
                            }
                          });
                        }

                        const fallasConsolidadas = Array.from(todasFallasIds).map(id => {
                          const f = fallas.find(x => x.id === id);
                          const obsViejas = obsAnteriores[id] || '';
                          const obsNuevas = observaciones[id] || '';
                          
                          // Motor de Inteligencia Algorítmica (Detección Semántica / Lógica Difusa)
                          const todasObs = [obsViejas, obsNuevas].filter(Boolean).sort((a, b) => b.length - a.length);
                          const unicas = [];
                          todasObs.forEach(curr => {
                            // Si la similitud con una observación ya aceptada es > 65%, descartar por redundante
                            const esSimil = unicas.some(larga => {
                               const sim = calcularSimilitudIA(larga, curr);
                               const esSub = larga.toLowerCase().includes(curr.toLowerCase());
                               return sim > 0.65 || esSub;
                            });
                            if (!esSimil) unicas.push(curr);
                          });
                          
                          const combined = unicas.join(' | ');
                          
                          return f.nombre + (combined ? ` (${combined})` : '');
                        }).join(', ');

                        const camionActualizado = {
                          ...camionExistente,
                          grupo: listaGrupos.join(', '),
                          supervisor: listaSupervisores.join(', '),
                          operador: listaOperadores.join(', '),
                          fallas: fallasConsolidadas,
                          puntos: puntosFinales,
                          atencion: atencionLabel,
                          consenso: numGrupos // Nuevo campo para UI
                        };

                        const { error } = await supabase.from('camiones').update(camionActualizado).eq('id', camionExistente.id);
                        if (error) return addToast('Error al integrar reporte: ' + error.message, "error");

                        setCamionesRegistrados(prev => prev.map(c => c.id === camionExistente.id ? camionActualizado : c));
                        addToast(`✅ Reporte integrado con éxito para el camión ${flota}.`);

                    } else {
                        // Lógica de Inserción Normal (Primer reporte)
                        const atencionLabel = totalImpacto > 50 ? 'CRÍTICA' : totalImpacto > 20 ? 'ALTA' : 'NORMAL';
                        
                        const fallasDetalladas = Object.keys(selectedDanos).map(id => {
                          const nombreFalla = fallas.find(f => f.id === id)?.nombre;
                          const comentario = observaciones[id] ? ` (${observaciones[id]})` : '';
                          return `${nombreFalla}${comentario}`;
                        }).join(', ');

                        const nuevoCamion = {
                          flota: flota,
                          operador: `G${grupo}: ${operador}`,
                          mina: mina,
                          grupo: grupo,
                          supervisor: `G${grupo}: ${session.nombre}`,
                          estado: 'espera',
                          atencion: atencionLabel,
                          fallas: fallasDetalladas,
                          time: new Date().toLocaleString(),
                          puntos: totalImpacto,
                          consenso: 1
                        };

                        const { data, error } = await supabase.from('camiones').insert([nuevoCamion]).select();
                        if (error) return addToast('Error al registrar camión: ' + error.message, "error");

                        setCamionesRegistrados([data[0], ...camionesRegistrados]);
                        addToast('✅ Camión ' + flota + ' enviado a la Lista de Espera con éxito.');
                    }

                    setActiveTab('dashboard');
                    setFlota(''); setOperador(''); setSelectedDanos({}); setObservaciones({});
                }}
                style={{ opacity: (!isFlotaValid || !operador || totalImpacto === 0) ? 0.5 : 1 }}
              >
                📥 Enviar a Lista de Espera
              </button>
            </div>
          </div>
        )}


        {/* Modal de Motivo de Garantía Estilo Glassmorphism */}
        {camionInGarantia && (
          <div 
            className="fade-in" 
            style={{ 
              position: 'fixed', 
              top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 1000,
              padding: '1rem'
            }}
          >
            <div 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '350px', overflowY: 'auto', padding: '0.5rem' }}>
                {fallas.filter(f => (camionInGarantia?.fallas || '').includes(f.nombre)).map(f => (
                  <div key={f.id} style={{ 
                    padding: '1rem', 
                    background: pendientesGarantia[f.id]?.selected ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: pendientesGarantia[f.id]?.selected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', marginBottom: pendientesGarantia[f.id]?.selected ? '0.8rem' : 0 }}>
                      <input 
                        type="checkbox" 
                        checked={!!pendientesGarantia[f.id]?.selected}
                        onChange={() => setPendientesGarantia(prev => ({ 
                          ...prev, 
                          [f.id]: { ...prev[f.id], selected: !prev[f.id]?.selected } 
                        }))}
                        style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
                      />
                      <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary-black)' }}>{f.nombre}</span>
                    </label>
                    
                    {pendientesGarantia[f.id]?.selected && (
                      <input 
                        type="text"
                        placeholder="Explica qué sigue fallando..."
                        className="input-field"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', background: 'white' }}
                        value={pendientesGarantia[f.id]?.comment || ''}
                        onChange={(e) => setPendientesGarantia(prev => ({
                          ...prev,
                          [f.id]: { ...prev[f.id], comment: e.target.value }
                        }))}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setCamionInGarantia(null)}
                  style={{ flex: 1, background: 'rgba(0,0,0,0.05)', border: 'none' }}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={confirmarGarantia}
                  style={{ flex: 2, background: 'var(--primary-red)', border: 'none', boxShadow: '0 4px 12px rgba(227, 25, 55, 0.2)' }}
                >
                  Confirmar Garantía
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalles Técnicos (Global) */}
        {selectedReport && (
          <div 
            className="fade-in" 
            style={{ 
              position: 'fixed', 
              top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.4)', 
              backdropFilter: 'blur(10px)',
              zIndex: 1000, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '1rem' 
            }}
            onClick={() => setSelectedReport(null)}
          >
            <div 
              className="card" 
              style={{ 
                maxWidth: '500px', 
                width: '100%', 
                margin: 0, 
                position: 'relative', 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ background: '#fef2f2', padding: '0.5rem', borderRadius: '10px', color: '#ef4444' }}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--primary-black)' }}>Ficha Técnica - {selectedReport.flota}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mina {selectedReport.mina} - Grupo {selectedReport.grupo || 'N/A'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción de Fallas y Comentarios:</label>
                <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {limpiarFallasIA(selectedReport.fallas)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                   <span style={{ display: 'block', fontSize: '0.7rem', color: '#0369a1', fontWeight: 'bold' }}>REPORTE POR (SUPERVISOR):</span>
                   <span style={{ fontSize: '0.85rem', color: '#0c4a6e', fontWeight: 'bold' }}>{selectedReport.supervisor || 'N/A'}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                   <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>OPERADOR PERMANENTE:</span>
                   <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{selectedReport.operador || 'No asignado'}</span>
                </div>
              </div>

              <div style={{ background: '#fdf2f8', padding: '0.8rem', borderRadius: '8px', border: '1px solid #fbcfe8', marginBottom: '1.5rem', textAlign: 'center' }}>
                 <span style={{ fontSize: '0.7rem', color: '#be185d', fontWeight: 'bold', marginRight: '0.5rem' }}>FECHA DE REGISTRO:</span>
                 <span style={{ fontSize: '0.85rem', color: '#831843' }}>{selectedReport.time}</span>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }} 
                onClick={() => setSelectedReport(null)}
              >
                Cerrar Ficha Técnica
              </button>
            </div>
          </div>
        )}

        {/* Modal de Edición Rápida Avanzada de Camión (Admin/Supervisor) */}
        {camionEditando && (
          <div 
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
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(25px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(227, 25, 55, 0.1)', padding: '0.6rem', borderRadius: '12px' }}>
                    <Truck size={24} color="var(--primary-red)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--primary-black)', fontSize: '1.3rem' }}>Edición del Diagnóstico</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Corrija fallas y operador para el equipo <b>{camionEditando.flota}</b></p>
                  </div>
                </div>
                <button onClick={() => setCamionEditando(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.8rem' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Campos Principales */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                     <label className="input-label">N° Flota</label>
                     <input 
                       type="text" 
                       className="input-field" 
                       value={camionEditando.flota} 
                       onChange={e => setCamionEditando({...camionEditando, flota: e.target.value.replace(/\D/g, '').slice(0,4)})} 
                       style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.1)' }}
                     />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                     <label className="input-label">Nombre del Operador</label>
                     <input 
                       type="text" 
                       className="input-field" 
                       value={camionEditando.operador || ''} 
                       onChange={e => setCamionEditando({...camionEditando, operador: e.target.value})} 
                       placeholder="Nombre completo del conductor..."
                       style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.1)' }}
                     />
                  </div>
                </div>

                {/* Checklist de Fallas Estilo Premium */}
                <div style={{ marginTop: '0.5rem' }}>
                  <label className="input-label" style={{ marginBottom: '1rem', display: 'block' }}>Items de Fallas Reportadas</label>
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem'
                  }}>
                    {fallas.map(falla => (
                      <div 
                        key={falla.id} 
                        style={{ 
                          background: selectedDanosEdit[falla.id] ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', 
                          padding: '0.8rem 1.5rem', 
                          borderRadius: '50px', 
                          border: selectedDanosEdit[falla.id] ? '1px solid var(--primary-red)' : '1px solid rgba(0,0,0,0.05)',
                          transition: 'all 0.3s ease',
                          boxShadow: selectedDanosEdit[falla.id] ? '0 4px 12px rgba(227, 25, 55, 0.05)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                           <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <input 
                               type="checkbox" 
                               checked={!!selectedDanosEdit[falla.id]}
                               onChange={() => handleDanoToggleEdit(falla.id)}
                               style={{ 
                                 width: '24px', 
                                 height: '24px', 
                                 appearance: 'none',
                                 WebkitAppearance: 'none',
                                 borderRadius: '50%', 
                                 border: `2px solid ${selectedDanosEdit[falla.id] ? 'var(--primary-red)' : '#d1d5db'}`,
                                 backgroundColor: selectedDanosEdit[falla.id] ? 'var(--primary-red)' : 'white',
                                 cursor: 'pointer',
                                 transition: 'all 0.2s ease'
                               }}
                             />
                             {selectedDanosEdit[falla.id] && (
                               <div style={{ 
                                 position: 'absolute', 
                                 width: '10px', 
                                 height: '10px', 
                                 borderRadius: '50%', 
                                 backgroundColor: 'white',
                                 pointerEvents: 'none'
                               }} />
                             )}
                           </div>
                           <span style={{ fontSize: '0.95rem', fontWeight: selectedDanosEdit[falla.id] ? '600' : '400', flex: 1, color: 'var(--primary-black)' }}>
                             {falla.nombre}
                           </span>
                        </div>
                        {selectedDanosEdit[falla.id] && (
                          <div className="fade-in" style={{ marginTop: '0.8rem', paddingLeft: '2.2rem' }}>
                            <input 
                              type="text"
                              className="input-field"
                              style={{ 
                                padding: '0.6rem 0.8rem', 
                                fontSize: '0.85rem', 
                                background: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                              }}
                              placeholder="Observación técnica opcional..."
                              value={observacionesEdit[falla.id] || ''}
                              onChange={(e) => handleObsChangeEdit(falla.id, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer del Modal */}
                <div style={{ 
                  display: 'flex', 
                  gap: '1.2rem', 
                  marginTop: '1rem', 
                  paddingTop: '1.5rem', 
                  borderTop: '1px solid rgba(0,0,0,0.05)' 
                }}>
                  <button className="btn btn-secondary" style={{ flex: 1, height: '48px' }} onClick={() => setCamionEditando(null)}>Descartar Cambios</button>
                  <button 
                    className="btn btn-primary" 
                    style={{ 
                      flex: 2, 
                      height: '48px',
                      background: 'var(--primary-red)', 
                      borderColor: 'var(--primary-red)',
                      boxShadow: '0 10px 15px -3px rgba(227, 25, 55, 0.3)' 
                    }} 
                    onClick={guardarEdicionAvanzada}
                  >
                    Actualizar Ficha Técnica
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ---------- SISTEMA DE MENSAJERÍA PERSONALIZADA (UI) ---------- */}
      
      {/* Container de Toasts (Superior Central) */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 11000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        width: 'min(90%, 400px)'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} className="toast-animation" style={{
            background: toast.type === 'error' ? 'rgba(185, 28, 28, 0.9)' : 'rgba(16, 185, 129, 0.9)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            pointerEvents: 'auto',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            {toast.message}
          </div>
        ))}
      </div>

      {/* Modal Personalizado (Alert / Confirm / Prompt) */}
      {modalConfig.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div className="modal-pop" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(15px)',
            width: 'min(100%, 500px)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-black)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {modalConfig.type === 'prompt' ? <ShieldAlert size={28} color="#ef4444" /> : 
               modalConfig.type === 'confirm' ? <AlertCircle size={28} color="#f59e0b" /> : 
               <Info size={28} color="#2563eb" />}
              {modalConfig.title}
            </h3>
            <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '1.05rem', margin: '0 0 1.5rem 0', whiteSpace: 'pre-wrap' }}>
              {modalConfig.message}
            </p>

            {modalConfig.showInput && (
              <div style={{ marginBottom: '2rem' }}>
                <input 
                  autoFocus
                  type="text"
                  className="input-field"
                  placeholder={modalConfig.inputPlaceholder}
                  value={modalConfig.inputValue}
                  onChange={(e) => setModalConfig(prev => ({ ...prev, inputValue: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleModalConfirm()}
                  style={{ 
                    fontSize: '1.2rem', 
                    textAlign: 'center', 
                    letterSpacing: '2px', 
                    fontWeight: 'bold',
                    padding: '1rem',
                    border: '2px solid #e5e7eb'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              {(modalConfig.type === 'confirm' || modalConfig.type === 'prompt') && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    if (modalConfig.onCancel) modalConfig.onCancel();
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                  }}
                >
                  {modalConfig.cancelText}
                </button>
              )}
              <button 
                className="btn btn-primary" 
                style={{
                  backgroundColor: modalConfig.type === 'prompt' ? '#ef4444' : 'var(--primary-red)'
                }}
                onClick={handleModalConfirm}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes modalPop {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .toast-animation {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-pop {
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

export default App;
