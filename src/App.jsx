// VERSION_TAG: 2.0.0_STABLE_GOLD_READY
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './industrial-v3.css';
import { 
  LayoutDashboard, RefreshCcw, LogOut, ChevronUp, Clock, Plus, Users, Truck,
  Hourglass, Search, SearchCheck, Wrench, CheckCircle2, ShieldAlert
} from 'lucide-react';

import { supabase } from './supabaseClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { LOGO_DRUMMOND, fallas } from './constants/fallas';

// Motor de IA y Utilidades
import { normalizarNombre, corregirOrtografiaIA, unificarComentariosIA, reaccionarAcentos, limpiarFallasIA } from './utils/iaEngine';
import { parseFecha, formatFechaCorta, formatGrupo, formatearCiclo } from './utils/formatters';

// Servicios de Datos
import { camionService } from './services/camionService';

// Hooks Personalizados
import { useAuth } from './hooks/useAuth';
import { useMaintenanceData } from './hooks/useMaintenanceData';

// Componentes Modularizados
import ReportForm from './components/ReportForm';
import ToastContainer from './components/ui/ToastContainer';
import GlobalModal from './components/ui/GlobalModal';
import UserManagement from './components/UserManagement';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import KanbanBoard from './components/KanbanBoard';
import HistoryView from './components/HistoryView';
import MobileNavigation from './components/MobileNavigation';
import Header from './components/Header';
import WarrantySelectionModal from './components/modals/WarrantySelectionModal';
import WarrantyDetailsModal from './components/modals/WarrantyDetailsModal';
import HistoryModal from './components/modals/HistoryModal';
import EditModal from './components/modals/EditModal';
// v6.2: Motor de Unificación Semántica para Comentarios (Conserva Prefijos y Prioriza Trazabilidad)

function App() {
  // VERSIÓN DE EMERGENCIA: 1.4.7_RENAME_CSS_FIX
  const [activeTab, setActiveTab] = useState('dashboard');

  // ---------- SISTEMA DE MENSAJERÍA PERSONALIZADA (ZERO BROWSER DIALOGS) ----------
  const [toasts, setToasts] = useState([]);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'info', title: '', message: '', confirmText: 'Aceptar', cancelText: 'Cancelar',
    onConfirm: null, onCancel: null, showInput: false, inputPlaceholder: '', inputValue: '', expectedValue: ''
  });

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

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

  // Hooks de Lógica Modularizada
  const { 
    session, pendingPasswordChangeUser, newPassword, setNewPassword, 
    confirmPassword, setConfirmPassword, usuarioLogin, setUsuarioLogin, 
    passwordLogin, setPasswordLogin, loadingAuth, handleLogin, 
    handlePasswordUpdate, logout 
  } = useAuth(addToast, setActiveTab);

  const { 
    camionesRegistrados, setCamionesRegistrados, dbUsuarios, setDbUsuarios, 
    loadingData, handleRefresh, updateCamionLocalAndRemote 
  } = useMaintenanceData(session, addToast);


  const [isDraggingNav, setIsDraggingNav] = useState(false);
  const [navTouchX, setNavTouchX] = useState(0);
  const [navVelocity, setNavVelocity] = useState(0);
  const lastTouchX = useRef(0);
  const navRef = useRef(null);
  const [jumpStretch, setJumpStretch] = useState(1);
  const [jumpSkew, setJumpSkew] = useState(0);

  // Reloj de Tiempo Real para Ciclos (v8.5)
  const [currentTime, setCurrentTime] = useState(() => new Date().toISOString());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toISOString()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Report Form State (Persistente)
  const [reportForm, setReportForm] = useState(() => {
    const saved = localStorage.getItem('drummond_report_form');
    if (!saved) return { flota: '', operador: '', mina: 'PB', grupo: '1', selectedDanos: {}, observaciones: {}, atencion: 'No' };
    try { return JSON.parse(saved); } catch (e) { return { flota: '', operador: '', mina: 'PB', grupo: '1', selectedDanos: {}, observaciones: {}, atencion: 'No' }; }
  });

  const [flota, setFlota] = useState(reportForm.flota);
  const [operador, setOperador] = useState(reportForm.operador);
  const [mina, setMina] = useState(reportForm.mina);
  const [grupo, setGrupo] = useState(reportForm.grupo);
  const [selectedDanos, setSelectedDanos] = useState(reportForm.selectedDanos);
  const [observaciones, setObservaciones] = useState(reportForm.observaciones);
  const [atencion, setAtencion] = useState(reportForm.atencion || 'No');
  const [editingGroupContext, setEditingGroupContext] = useState(null);
  const [selectedDanosEdit, setSelectedDanosEdit] = useState({});
  const [observacionesEdit, setObservacionesEdit] = useState({});
  const [operadorEdit, setOperadorEdit] = useState('');
  const [dictamenEdit, setDictamenEdit] = useState('');
  const [camionEditando, setCamionEditando] = useState(null);
  const [reportStep, setReportStep] = useState(1);

  useEffect(() => {
    if (camionEditando && editingGroupContext) sincronizarModal(camionEditando, editingGroupContext);
  }, [editingGroupContext, camionEditando?.id]);

  useEffect(() => {
    if (session && !flota && !operador) {
      if (session.mina && session.mina !== 'Global') setMina(session.mina);
      if (session.grupo) setGrupo(session.grupo);
    }
  }, [session]);

  useEffect(() => {
    sessionStorage.setItem('drummond_activeTab', activeTab);
    const state = { flota, operador, mina, grupo, selectedDanos, observaciones };
    localStorage.setItem('drummond_report_form', JSON.stringify(state));
  }, [activeTab, flota, operador, mina, grupo, selectedDanos, observaciones]);

  // Historial Filters State (Hooks deben ir arriba de los return tempranos)
  const [filtroFlota, setFiltroFlota] = useState('');
  const [filtroMina, setFiltroMina] = useState('');
  const [filtroMes, setFiltroMes] = useState('');

  // ---------- MÓDULO CRUD DE USUARIOS ----------
  const [isCreandoUsuario, setIsCreandoUsuario] = useState(false);
  const [nuevoUsuarioParams, setNuevoUsuarioParams] = useState({ nombre: '', username: '', password: 'con123', mina: 'PB', grupo: '1', role: 'supervisor', estado: 'Activo' });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null); // Para el Modal de detalles técnicos
  const [expandedCardId, setExpandedCardId] = useState(null); // Acordeón de Kanban
  const [camionInGarantia, setCamionInGarantia] = useState(null); // Para el Modal de Motivo de Garantía
  const [selectedGarantiaDetails, setSelectedGarantiaDetails] = useState(null); // Para ver pendientes en modal
  const [pendientesGarantia, setPendientesGarantia] = useState({});
  const [registrosLimit, setRegistrosLimit] = useState(20);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Manejador de Doble Toque Táctico (Protección v1.9.43)
  const handleSafeDelete = (id, action) => {
    if (confirmDeleteId === id) {
      action();
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 4000); // 4 segundos para confirmar
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [currentKanbanCol, setCurrentKanbanCol] = useState(0);

  // Blindaje de Fechas v1.9.24 (Limpieza Universal de Comas)




  const handleModalConfirm = () => {
    if (modalConfig.type === 'prompt' && modalConfig.expectedValue) {
      if (modalConfig.inputValue !== modalConfig.expectedValue) {
        addToast("❌ El número ingresado no coincide.", "error");
        return;
      }
    }
    if (modalConfig.onConfirm) modalConfig.onConfirm(modalConfig.inputValue);
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };




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
    // v8.3: Corrección instantánea fluida
    let final = text;
    if (text.endsWith(' ') || text.endsWith('.')) {
      final = corregirOrtografiaIA(text);
    } else if (text.length === 1) {
      final = text.toUpperCase();
    }
    setObservaciones(prev => ({ ...prev, [id]: final }));
  };


  const isFlotaValid = /^2\d{3}$/.test(flota);

  // REEMPLAZADO POR HOOKS MODULARES

  const handleRefreshApp = async () => {
    await handleRefresh(() => {
      // Las variables de formulario (flota, operador, daños) ahora son locales en ReportForm.jsx.
      // Ya no es necesario ni posible limpiarlas desde App.jsx.
      console.log("Datos sincronizados desde App.jsx");
    });
  };

  // v13.0: Cálculo automático de Impacto y Prioridad (Atención Sugerida)
  const totalImpacto = useMemo(() => {
    return Object.keys(selectedDanos).reduce((acc, id) => {
      if (!selectedDanos[id]) return acc;
      const falla = fallas.find(f => f.id === id);
      return acc + (falla ? (falla.impacto || 0) : 0);
    }, 0);
  }, [selectedDanos]);

  // v13.2: Sincronizar 'atencion' con los nuevos rangos definidos por el usuario
  useEffect(() => {
    if (totalImpacto >= 70) setAtencion('CRÍTICA');
    else if (totalImpacto >= 50) setAtencion('ALTA');
    else if (totalImpacto >= 26) setAtencion('MEDIA');
    else setAtencion('BAJA');
  }, [totalImpacto]);

  // v13.3: Ranking Inteligente (Tiers de Grupos + Impacto Acumulado) y Aislamiento de Seguridad (Tenant Isolation)
  const camionesAccessibles = useMemo(() => {
    if (!camionesRegistrados) return [];

    // 0. Aislamiento de Seguridad: Restringir por Mina (Excepto Global/Admin)
    const filtradosSeguros = camionesRegistrados.filter(c => {
      if (!session) return true;
      if (session.mina === 'Global' || session.role === 'admin') return true;
      return c.mina === session.mina;
    });

    // 1. Calculamos metadatos de prioridad para cada camión
    const ranked = filtradosSeguros.map(c => {
      // Contamos cuántos grupos han reportado (G1, G2, G3)
      const gruposReportando = [c.g1_danos, c.g2_danos, c.g3_danos].filter(d => d && Object.keys(d).length > 0).length;

      // Calculamos impacto acumulado de todos los grupos (G1+G2+G3 + Mantenimiento)
      const totalPeso = [c.g1_danos, c.g2_danos, c.g3_danos, c.danos_mantenimiento].reduce((acc, danos) => {
        if (!danos) return acc;
        return acc + Object.keys(danos).reduce((sum, id) => {
          if (!danos[id]) return sum;
          const f = fallas.find(falla => falla.id === id);
          return sum + (f ? (f.impacto || 0) : 0);
        }, 0);
      }, 0);

      return { ...c, _numGrupos: gruposReportando, _totalPeso: totalPeso };
    });

    // 2. Ordenamos por Tiers (3 grupos > 2 grupos > 1 grupo) y luego por Peso Acumulado
    return [...ranked].sort((a, b) => {
      // Prioridad 1: Número de grupos (Tier)
      if (b._numGrupos !== a._numGrupos) return b._numGrupos - a._numGrupos;
      // Prioridad 2: Impacto total (Peso)
      return b._totalPeso - a._totalPeso;
    });
  }, [camionesRegistrados]);
  const conteoLiberados = useMemo(() => camionesAccessibles.filter(c => c.estado === 'liberado').length, [camionesAccessibles]);

  const promedioCiclo = useMemo(() => {
    const liberadosValidos = camionesAccessibles.filter(c => c.estado === 'liberado' && c.finalizado_at && (c.ingreso_evaluar_at || c.time || c.creado_at));
    if (liberadosValidos.length === 0) return "---";

    let validCount = 0;
    const sumaMs = liberadosValidos.reduce((acc, c) => {
      const startRaw = c.ingreso_evaluar_at || c.time || c.creado_at;
      const inicio = parseFecha(startRaw);
      const fin = parseFecha(c.finalizado_at);
      if (!inicio || !fin) return acc;

      const diffMs = fin - inicio;
      if (isNaN(diffMs) || diffMs < 0) return acc;

      validCount++;
      return acc + diffMs;
    }, 0);

    if (validCount === 0) return "---";

    const promMs = sumaMs / validCount;
    const hours = Math.floor(promMs / 3600000);
    const mins = Math.floor((promMs % 3600000) / 60000);
    return hours >= 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : (hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
  }, [camionesAccessibles]);

  const kpis = useMemo(() => [
    { id: 'espera', titulo: 'Lista de Espera', icon: <Hourglass strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'espera').length.toString(), color: '#9ca3af', subtitulo: 'Pre-Programa' },
    { id: 'evaluar', titulo: 'Por Evaluar', icon: <Search strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'evaluar').length.toString(), color: 'var(--secondary-blue)', subtitulo: 'En Programa' },
    { id: 'evaluados', titulo: 'Evaluados', icon: <SearchCheck strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'evaluados').length.toString(), color: '#8b5cf6', subtitulo: 'En Programa' },
    { id: 'taller', titulo: 'En Taller', icon: <Wrench strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'taller').length.toString(), color: 'var(--secondary-yellow)', subtitulo: 'Ejecución' },
    { id: 'feedback', titulo: 'Feedback', icon: <CheckCircle2 strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'feedback').length.toString(), color: '#10b981', subtitulo: 'Validación' },
    { id: 'garantia', titulo: 'Garantía', icon: <ShieldAlert strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'garantia').length.toString(), color: 'var(--primary-red)', subtitulo: 'Retorno VIP' },
  ], [camionesAccessibles]);

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
      try {
        const camion = camionesRegistrados.find(c => c.id.toString() === idStr);
        setCamionInGarantia(camion);
        
        const iniciales = {};
        fallas.forEach(f => {
          if ((camion?.fallas || '').includes(f.nombre)) {
            const nombreEscapado = f.nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`${nombreEscapado}\\s*\\(([^)]+)\\)`);
            const match = (camion?.fallas || '').match(regex);
            let originalComment = match ? match[1] : '';
            
            if (originalComment) {
              originalComment = unificarComentariosIA(originalComment);
              originalComment = originalComment.replace(/^(?:G\w+|General)\s*[:\-]\s*/gi, '').trim();
            }

            iniciales[f.id] = { selected: false, comment: originalComment || '' };
          }
        });
        
        setPendientesGarantia(iniciales);
      } catch (err) {
        addToast("Error al procesar fallas para garantía: " + err.message, "error");
        console.error("Garantia Parse Error:", err);
      }
      return;
    }

    // UI Optimista (Instantáneo para el operador)
    setCamionesRegistrados(prev =>
      prev.map(c => {
        if (c.id.toString() === idStr) {
          const updates = { ...c, estado: nuevoEstado };
          // v8.4: Inicio de ciclo flexible (se activa al entrar a Evaluar, Evaluados o Taller)
          if (['evaluar', 'evaluados', 'taller'].includes(nuevoEstado) && !c.ingreso_evaluar_at) {
            updates.ingreso_evaluar_at = new Date().toISOString();
          }
          return updates;
        }
        return c;
      })
    );

    // Persistencia Oficial a la Nube (Asíncrono en segundo plano)
    const dbUpdates = { estado: nuevoEstado };
    const targetCamion = camionesRegistrados.find(c => c.id.toString() === idStr);
    if (['evaluar', 'evaluados', 'taller'].includes(nuevoEstado) && targetCamion && !targetCamion.ingreso_evaluar_at) {
      dbUpdates.ingreso_evaluar_at = new Date().toISOString();
    }
    // Actualización Optimista (v2.0.2)
    setCamionesRegistrados(prev => prev.map(c => c.id === parseInt(idStr) ? { ...c, ...dbUpdates } : c));

    await camionService.updateCamion(parseInt(idStr), dbUpdates);
  };

  // Función para confirmar el envío a garantía con motivos detallados
  const confirmarGarantia = async (comentariosExtra = '') => {
    if (!camionInGarantia) return;

    const motivosArray = Object.keys(pendientesGarantia)
      .filter(id => pendientesGarantia[id].selected)
      .map(id => {
        const nombre = fallas.find(f => f.id === id)?.nombre;
        const comment = pendientesGarantia[id].comment ? `: ${pendientesGarantia[id].comment}` : '';
        return `${nombre}${comment}`;
      });

    // Agregar notas extras opcionales al final de las fallas reportadas
    if (comentariosExtra && comentariosExtra.trim() !== '') {
      motivosArray.push(`Notas Extras: ${comentariosExtra.trim()}`);
    }

    if (motivosArray.length === 0) return addToast("Por favor, selecciona al menos una falla que persista.", "error");

    // v8.5: Usamos el separador técnico '|' para permitir el split correcto en la visualización
    const motivosStr = motivosArray.join(' | ');

    // Actualizamos localmente
    setCamionesRegistrados(prev =>
      prev.map(c => c.id === camionInGarantia.id ? { ...c, estado: 'garantia', motivo_garantia: motivosStr } : c)
    );

    // Actualizamos en Supabase
    await camionService.updateCamion(camionInGarantia.id, {
      estado: 'garantia',
      motivo_garantia: motivosStr
    });

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
    await camionService.updateCamion(camionId, { [key]: nuevoValor });
  };

  const liberarCamion = async (camionId, flota) => {
    const idNum = parseInt(camionId);
    if (isNaN(idNum)) return addToast("❌ ID de camión inválido", "error");

    const ahoraStr = new Date().toISOString();

    // UI Optimista: Movemos todos los registros de esta flota a liberado localmente
    setCamionesRegistrados(prev =>
      prev.map(c => (c.id === idNum || c.flota === flota) ? { ...c, estado: 'liberado', finalizado_at: ahoraStr } : c)
    );

    // Persistencia en DB: Liberamos TODO lo que coincida con esta flota y no esté liberado
    // Esto resuelve el problema de registros duplicados o "fantasmas"
    const data = await camionService.updateByFlota(flota, {
      estado: 'liberado',
      finalizado_at: ahoraStr
    });

    if (error) {
      addToast("❌ Error en base de datos: " + error.message, "error");
      // Refresco forzado para recuperar estado real
      const retry = await camionService.getCamiones();
      if (retry) setCamionesRegistrados(retry);
    } else if (!data || data.length === 0) {
      addToast("⚠️ No se encontró el registro activo para liberar.", "warning");
    } else {
      addToast(`🚀 Camión ${flota} liberado con éxito. Sincronizando...`);

      setTimeout(async () => {
        const flotaInfo = await camionService.getCamiones();
        if (flotaInfo) setCamionesRegistrados(flotaInfo);
      }, 1000);
    }
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
        try {
          await camionService.eliminarCamion(camionId);
          setCamionesRegistrados(prev => prev.filter(c => c.id !== camionId));
          addToast(`🗑️ Camión ${flota} eliminado exitosamente del sistema.`, "success");
        } catch (err) {
          addToast("Error al eliminar: " + err.message, "error");
        }
      }
    });
  };

  const guardarEdicionCamion = async () => {
    if (!camionEditando) return;

    // Validación básica de flota (Inicia con 2 y tiene 4 digitos)
    if (!camionEditando.flota.startsWith('2') || camionEditando.flota.length !== 4) {
      return addToast("El número de flota debe tener 4 dígitos y comenzar por 2.", "error");
    }

    try {
      await camionService.updateCamion(camionEditando.id, {
        flota: camionEditando.flota,
        mina: camionEditando.mina,
        grupo: camionEditando.grupo,
        atencion: camionEditando.atencion
      });

      setCamionesRegistrados(prev => prev.map(c => c.id === camionEditando.id ? camionEditando : c));
      setCamionEditando(null);
      addToast("✅ Cambios guardados en la nube.");
    } catch (err) {
      addToast("Error al actualizar: " + err.message, "error");
    }
  };

  const prepararEdicion = (camion) => {
    setCamionEditando(camion);
    // v8.2: Normalización del contexto de grupo para evitar "GG1" o "Gundefined"
    let context = 'General';
    if (session.role !== 'admin') {
      const gRaw = session.grupo || '1';
      context = gRaw.startsWith('G') ? gRaw : `G${gRaw}`;
    }
    setEditingGroupContext(context);
    sincronizarModal(camion, context);
  };

  const prepararDictamen = (camion) => {
    setCamionEditando(camion);
    setEditingGroupContext('Mantenimiento');
    sincronizarModal(camion, 'Mantenimiento');
  };

  const sincronizarModal = (camion, context) => {
    if (!camion) return;

    setSelectedDanosEdit({});
    setObservacionesEdit({});
    setOperadorEdit('');
    setDictamenEdit(camion.dictamen_tecnico || '');

    const danos = {};
    const obs = {};
    let operadorUnificado = '';

    if (context === 'General') {
      operadorUnificado = camion.operador || '';
      if (camion.fallas) {
        const rawFallas = camion.fallas;
        const parts = [];
        let depth = 0;
        let lastSplit = 0;
        for (let i = 0; i < rawFallas.length; i++) {
          const char = rawFallas[i];
          if (char === '(') depth++;
          if (char === ')') depth--;
          // v6.6: Usar | en lugar de coma para parsear el string principal
          if (depth === 0 && char === '|') {
            parts.push(rawFallas.substring(lastSplit, i).trim());
            lastSplit = i + 1;
          }
        }
        parts.push(rawFallas.substring(lastSplit).trim());

        parts.forEach(p => {
          if (!p || p === '-') return;

          // v7.0: Motor de Emparejamiento de Precisión (No se deja engañar por paréntesis en nombres)
          const tLimpio = reaccionarAcentos(p.toLowerCase());
          const fallaObj = fallas.find(f =>
            tLimpio.startsWith(reaccionarAcentos(f.nombre.toLowerCase())) ||
            (f.aliases && f.aliases.some(alias => tLimpio.startsWith(reaccionarAcentos(alias.toLowerCase()))))
          );

          if (fallaObj) {
            danos[fallaObj.id] = true;
            // El comentario es todo lo que viene después del nombre del item
            let combinedObs = p.substring(fallaObj.nombre.length).trim();
            // Limpiar paréntesis y G1/G2 del comentario extraído
            combinedObs = combinedObs.replace(/^\(|\)$/g, '').replace(/(?:G\d+|General)\s*[:\-]\s*/gi, '').trim();

            if (combinedObs && combinedObs !== '-') {
              obs[fallaObj.id] = unificarComentariosIA(combinedObs);
            }
          } else {
            // Fallback para items desconocidos
            const match = p.match(/^(.*?)(?:\s*\((.*?)\))?$/);
            if (match) {
              const nombreExtraido = match[1].trim().toLowerCase();
              const obsExtraid = match[2] || '';
              const genericMatch = fallas.find(f => f.nombre.toLowerCase().includes(nombreExtraido));
              if (genericMatch) {
                danos[genericMatch.id] = true;
                if (obsExtraid) obs[genericMatch.id] = unificarComentariosIA(obsExtraid);
              }
            }
          }
        });
      }
    } else {
      const dg = camion.detalles_grupos || {};
      const miDetalle = dg[context];
      if (miDetalle) {
        operadorUnificado = miDetalle.operador || '';
        if (miDetalle.fallas) {
          Object.keys(miDetalle.fallas).forEach(fId => {
            danos[fId] = true;
            if (miDetalle.fallas[fId]) obs[fId] = miDetalle.fallas[fId];
          });
        }
      }
    }

    setSelectedDanosEdit(danos);
    setObservacionesEdit(obs);
    setOperadorEdit(operadorUnificado);
  };

  const handleDanoToggleEdit = (id) => {
    setSelectedDanosEdit(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleObsChangeEdit = (id, text) => {
    // v8.3: Corrección instantánea fluida en Modal
    let final = text;
    if (text.endsWith(' ') || text.endsWith('.')) {
      final = corregirOrtografiaIA(text);
    } else if (text.length === 1) {
      final = text.toUpperCase();
    }
    setObservacionesEdit(prev => ({ ...prev, [id]: final }));
  };

  const guardarEdicionAvanzada = async () => {
    if (!camionEditando) return;

    let operadorFinal = '';
    const finalFallasItems = [];
    let totalPuntos = 0;
    const detallesFinales = camionEditando.detalles_grupos ? { ...camionEditando.detalles_grupos } : {};

    if (editingGroupContext === 'General') {
      operadorFinal = operadorEdit || '';
      Object.keys(selectedDanosEdit).forEach(fId => {
        if (selectedDanosEdit[fId]) {
          const fallObj = fallas.find(f => f.id === fId);
          if (fallObj) {
            totalPuntos += fallObj.impacto;
            const obsLimpia = corregirOrtografiaIA(observacionesEdit[fId] || '');
            const obs = obsLimpia ? ` (${obsLimpia})` : '';
            finalFallasItems.push(`${fallObj.nombre}${obs}`);
          }
        }
      });
    } else {
      const fallasStruct = {};
      Object.keys(selectedDanosEdit).forEach(id => {
        if (selectedDanosEdit[id]) fallasStruct[id] = corregirOrtografiaIA(observacionesEdit[id] || '');
      });

      if (!detallesFinales[editingGroupContext]) {
        detallesFinales[editingGroupContext] = {
          supervisor: session.nombre,
          mina: camionEditando.mina,
          time: new Date().toISOString()
        };
      }
      detallesFinales[editingGroupContext].operador = operadorEdit;
      detallesFinales[editingGroupContext].fallas = fallasStruct;

      const opsSet = new Set();
      (camionEditando.operador || '').split(/\s*,\s*/).forEach(o => {
        const gMatch = o.match(/^(G\d+|General)\s*[:\-]/i);
        if (!gMatch) opsSet.add(o.trim()); // Guardar legacy puro sin etiqueta
        else if (!detallesFinales[gMatch[1].toUpperCase()]) opsSet.add(o.trim()); // Legacy con etiqueta que no esté en el JSON
      });
      Object.keys(detallesFinales).forEach(g => {
        // v8.2: Filtrado estricto de grupos válidos para evitar contaminación (G1, G2, G3, General, Mantenimiento)
        const gValido = /^(G\d+|General|Mantenimiento)$/i.test(g);
        if (gValido && detallesFinales[g].operador) {
          opsSet.add(`${g}: ${detallesFinales[g].operador}`);
        }
      });
      operadorFinal = Array.from(opsSet).filter(Boolean).sort().join(' | ');

      // v8.0: Motor de Consolidación por IDs (Elimina duplicidad por nombres/acentos)
      const fallasMap = {}; // KEY: fId, VALUE: { G1: obs, G2: obs, ... }

      // 1. Incorporar datos del string de fallas legado (Preservando comentarios existentes)
      if (camionEditando.fallas) {
        const rawFallas = camionEditando.fallas;
        const parts = [];
        let depth = 0; let lastSplit = 0;
        for (let i = 0; i < rawFallas.length; i++) {
          if (rawFallas[i] === '(') depth++;
          if (rawFallas[i] === ')') depth--;
          if (depth === 0 && rawFallas[i] === '|') {
            parts.push(rawFallas.substring(lastSplit, i).trim());
            lastSplit = i + 1;
          }
        }
        parts.push(rawFallas.substring(lastSplit).trim());

        parts.forEach(p => {
          if (!p || p === '-' || p.includes('Ficha Técnica')) return;
          const match = p.match(/^(.*?)(?:\s*\((.*?)\))?$/);
          if (match) {
            const nombreRaw = match[1].trim();
            const tLimpio = reaccionarAcentos(nombreRaw.toLowerCase());
            // Buscamos el ID oficial de esta falla
            const fObj = fallas.find(f =>
              reaccionarAcentos(f.nombre.toLowerCase()) === tLimpio ||
              (f.aliases && f.aliases.some(alias => reaccionarAcentos(alias.toLowerCase()) === tLimpio)) ||
              tLimpio.includes(reaccionarAcentos(f.nombre.toLowerCase()))
            );

            if (fObj) {
              if (!fallasMap[fObj.id]) fallasMap[fObj.id] = {};
              const combined = match[2] || '';
              if (combined) {
                combined.split(/\s*[|/]\s*/).forEach(seg => {
                  const gMatch = seg.match(/^(G\d+|General)\s*[:\-]\s*(.*)$/i);
                  if (gMatch && !detallesFinales[gMatch[1].toUpperCase()]) {
                    fallasMap[fObj.id][gMatch[1].toUpperCase()] = gMatch[2] || '';
                  } else if (!gMatch && seg.length > 1) {
                    if (!fallasMap[fObj.id]['General']) fallasMap[fObj.id]['General'] = seg;
                  }
                });
              }
            }
          }
        });
      }

      // 2. Incorporar datos frescos de los Reportes de Grupo (JSON)
      Object.keys(detallesFinales).forEach(g => {
        // v8.2: Filtrado estricto de grupos para evitar Gundefined en fallas
        const gValido = /^(G\d+|General|Mantenimiento)$/i.test(g);
        if (gValido) {
          const gFallas = detallesFinales[g].fallas;
          if (gFallas) {
            Object.keys(gFallas).forEach(fId => {
              const fObj = fallas.find(f => f.id === fId);
              if (fObj) {
                if (!fallasMap[fObj.id]) fallasMap[fObj.id] = {};
                fallasMap[fObj.id][g] = gFallas[fId] || '';
              }
            });
          }
        }
      });

      // 3. Generar lista final unificada y recalcular puntos
      const uniqueFallasIds = Object.keys(fallasMap);
      uniqueFallasIds.forEach(fId => {
        const fObj = fallas.find(f => f.id === fId);
        if (fObj) {
          const obsMap = fallasMap[fId];
          const segments = [];
          if (obsMap['General']) segments.push(obsMap['General']);
          ['G1', 'G2', 'G3'].forEach(g => {
            if (obsMap[g]) {
              const note = obsMap[g];
              if (note && note !== g) segments.push(`${g}: ${note}`);
            }
          });

          if (segments.length > 0) {
            const finalObs = unificarComentariosIA(segments.join(' | '));
            finalFallasItems.push(`${fObj.nombre} (${finalObs})`);
          } else {
            finalFallasItems.push(`${fObj.nombre}`);
          }
          totalPuntos += fObj.impacto;
        }
      });
    }

    const atencion = totalPuntos > 50 ? 'CRÍTICA' : totalPuntos > 20 ? 'ALTA' : 'NORMAL';

    const camionActualizado = {
      operador: operadorFinal,
      fallas: finalFallasItems.join(' | '),
      puntos: totalPuntos,
      atencion: atencion,
      dictamen_tecnico: dictamenEdit,
      detalles_grupos: detallesFinales
    };

    try {
      await camionService.updateCamion(camionEditando.id, camionActualizado);

      setCamionesRegistrados(prev => prev.map(c => c.id === camionEditando.id ? {
        ...c,
        ...camionActualizado
      } : c));

      setCamionEditando(null);
      addToast("✅ Edición avanzada guardada y prioridad recalculada.");
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    }
  };

  // ---------- FUNCIONES DE EXPORTACIÓN (REPORTES) ----------

  const exportarAExcel = () => {
    if (registrosFiltrados.length === 0) {
      return addToast("No hay datos filtrados para exportar.", "error");
    }

    try {
      addToast("⏳ Preparando archivo Excel...", "info");

      const datosExcel = registrosFiltrados.map(r => {
        // Extracción de datos desde JSONB (v2.1.0)
        const dG = r.detalles_grupos || {};

        const getOp = (g) => dG[`G${g}`]?.operador || (r.operador || '').split(', ').find(n => n.includes(`G${g}:`))?.replace(`G${g}:`, '').trim() || '-';
        const getSup = (g) => dG[`G${g}`]?.supervisor || (r.supervisor || '').split(', ').find(n => n.includes(`G${g}:`))?.replace(`G${g}:`, '').trim() || '-';

        // Cálculo de Tiempo de Ciclo
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
      // v6.9: Separador oficial es |
      const opNames = (registro.operador || '').split(/\s*\|\s*/);

      // Verificamos si el grupo actual ya participó
      const yaTieneOperador = opNames.some(n => n.includes(grupoPrefix));

      if (!yaTieneOperador) {
        // ACTIVACIÓN DE FIRMA TEMPORAL (Solo para el PDF, no se guarda en BD)
        showConfirm({
          type: 'prompt',
          title: `Firma de Recepción (Grupo ${grupoActual})`,
          message: `Vas a generar el PDF desde un grupo distinto al del reporte original.\n\nPor favor, ingresa el nombre del Operador que FIRMARÁ la recepción del equipo:`,
          placeholder: 'Escribe el nombre aquí (o deja en blanco)...',
          confirmText: 'Generar PDF',
          onConfirm: async (nombreIngresado) => {
            // v6.9.3: Aplicamos IA de corrección ortográfica (Capitalización)
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

      // === CABECERA PREMIUM MINIMALISTA ===
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(160, 10, 35, 16, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(160, 10, 35, 16, 3, 3, 'D');

      try {
        if (typeof LOGO_DRUMMOND !== 'undefined' && LOGO_DRUMMOND) {
          const logoData = LOGO_DRUMMOND.startsWith('data:') ? LOGO_DRUMMOND : `data:image/png;base64,${LOGO_DRUMMOND}`;
          doc.addImage(logoData, 'PNG', 15, 8, 28, 20);
        }
      } catch (e) {
        console.error("Error al cargar logo:", e);
      }

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("ACTA DE TRAZABILIDAD", 65, 20);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("CONFORT CAMIONES", 65, 26);

      // Info Badge
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("MINA:", 163, 16);
      doc.setFont("helvetica", "normal");
      doc.text(`${registro.mina === 'PB' ? 'PB' : 'ED'}`, 174, 16);

      doc.setFont("helvetica", "bold");
      doc.text("CAMIÓN:", 163, 22);
      doc.setFont("helvetica", "normal");
      doc.text(`${registro.flota}`, 177, 22);

      // Cuerpo
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

      // Formatear Operadores
      const rawOper = reporteroData.operador || registro.operador || 'N/A';
      const listaOper = rawOper.split(/\s*[|,]\s*/).filter(n => n.trim() !== "");
      const operFormateado = listaOper.map(n => `• ${n.trim()}`).join('\n');

      const operSplit = doc.splitTextToSize(operFormateado, 170);
      doc.text(operSplit, 20, 52);

      const supLabelY = 52 + (operSplit.length * 5) + 4;
      doc.setFont("helvetica", "bold");
      doc.text(`Gestor del reporte (Supervisor de Camiones):`, 20, supLabelY);

      doc.setFont("helvetica", "normal");
      // Formatear Supervisores
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
      // Usamos el nombre temporal si existe, sino el original filtrado
      const opNameFiltered = typeof registro.operador_temporal_pdf !== 'undefined'
        ? registro.operador_temporal_pdf
        : ((registro.detalles_grupos || {})[`G${grupoActual}`]?.operador || (registro.operador || '').split(/\s*\|\s*/).find(n => n.includes(`G${grupoActual}:`))?.replace(`G${grupoActual}:`, '').trim() || '');

      // El supervisor OBLIGATORIAMENTE es el que está logeado (si es quien genera el PDF de entrega)
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

  const handleReportSubmit = async () => {
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

      setActiveTab('dashboard');
      setFlota(''); setOperador(''); setSelectedDanos({}); setObservaciones({});
      setReportStep(1);
    } catch (err) {
      addToast('Error crítico: ' + err.message, "error");
    }
  };

  const handleLogoutApp = () => {
    logout([
      () => setFlota(''),
      () => setOperador(''),
      () => setSelectedDanos({}),
      () => setObservaciones({}),
      () => setReportStep(1)
    ]);
  };

  // Si no hay sesión activa, bloqueamos el acceso y mostramos el Login
  if (!session) {
    return (
      <LoginView
        pendingPasswordChangeUser={pendingPasswordChangeUser}
        handlePasswordUpdate={handlePasswordUpdate}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        loadingAuth={loadingAuth}
        handleLogin={handleLogin}
        usuarioLogin={usuarioLogin}
        setUsuarioLogin={setUsuarioLogin}
        passwordLogin={passwordLogin}
        setPasswordLogin={setPasswordLogin}
        toasts={toasts}
        modalConfig={modalConfig}
        handleModalConfirm={handleModalConfirm}
        setModalConfig={setModalConfig}
      />
    );
  }

  // Blindaje de Seguridad: Solo calcular si hay sesión activa
  // Lógica de Filtrado Inteligente v1.9.34 (Soporte Meses y Multi-búsqueda)
  const registrosFiltrados = (session && Array.isArray(camionesAccessibles)) ? camionesAccessibles.filter(r => {
    // Solo mostramos los que ya están en el historial (liberados)
    if (r.estado !== 'liberado') return false;

    try {
      // Blindaje de Datos (v1.9.51): Conversión segura a String
      const fFlota = String(r.flota || '').toLowerCase();
      const fMina = String(r.mina || '').toLowerCase();
      const fBusquedaFlota = String(filtroFlota || '').toLowerCase();
      const fBusquedaMina = String(filtroMina || '').toLowerCase();

      // Filtro por Flota y Mina
      const matchFlota = fFlota.includes(fBusquedaFlota);
      const matchMina = !fBusquedaMina || fMina === fBusquedaMina;
      if (!matchFlota || !matchMina) return false;

      // Filtro por Fecha (Mes/Año)
      if (filtroMes) {
        const fecha = parseFecha(r.finalizado_at || r.time || r.creado_at);
        if (!fecha) return false;
        const [anioF, mesF] = filtroMes.split('-');
        if (fecha.getFullYear() !== parseInt(anioF) || (fecha.getMonth() + 1) !== parseInt(mesF)) return false;
      }

      return true;
    } catch (e) { return false; }
  }) : [];

  // --- RENDERIZADO PRINCIPAL (DASHBOARD) ---

  return (
    <div className="industrial-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ToastContainer toasts={toasts} />
      <GlobalModal
        modalConfig={modalConfig}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        setModalConfig={setModalConfig}
      />

      <div className="app-container">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          session={session}
          handleLogoutApp={handleLogoutApp}
          setMina={setMina}
          setGrupo={setGrupo}
          mina={mina}
        />

        {/* Main Content */}
        <main className="main-content">
          <Header
            activeTab={activeTab}
            session={session}
            handleRefresh={handleRefreshApp}
            loadingData={loadingData}
            handleLogoutApp={handleLogoutApp}
          />

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <DashboardView
              promedioCiclo={promedioCiclo}
              conteoLiberados={conteoLiberados}
              kpis={kpis}
              camionesAccessibles={camionesAccessibles}
              setActiveTab={setActiveTab}
              setSelectedReport={setSelectedReport}
              session={session}
              prepararEdicion={prepararEdicion}
              handleSafeDelete={handleSafeDelete}
              eliminarCamion={eliminarCamion}
              confirmDeleteId={confirmDeleteId}
              formatGrupo={formatGrupo}
              formatFechaCorta={formatFechaCorta}
            />
          )}

          {/* Kanban Board View */}
          {activeTab === 'cola' && (
            <KanbanBoard
              columnasKanban={columnasKanban}
              camionesAccessibles={camionesAccessibles}
              expandedCardId={expandedCardId}
              setExpandedCardId={setExpandedCardId}
              setCurrentKanbanCol={setCurrentKanbanCol}
              handleDragStart={handleDragStart}
              handleDrop={handleDrop}
              handleDragOver={(e) => e.preventDefault()}
              formatGrupo={formatGrupo}
              formatFechaCorta={formatFechaCorta}
              formatearCiclo={formatearCiclo}
              setSelectedReport={setSelectedReport}
              setSelectedGarantiaDetails={setSelectedGarantiaDetails}
              prepararDictamen={prepararDictamen}
              toggleAprobacion={toggleAprobacion}
              showConfirm={showConfirm}
              liberarCamion={liberarCamion}
              session={session}
              prepararEdicion={prepararEdicion}
              loadingData={loadingData}
              currentTime={currentTime}
            />
          )}

          {/* Historial View */}
          {activeTab === 'historial' && (
            <HistoryView
              registrosFiltrados={registrosFiltrados}
              registrosLimit={registrosLimit}
              setRegistrosLimit={setRegistrosLimit}
              expandedHistoryId={expandedHistoryId}
              setExpandedHistoryId={setExpandedHistoryId}
              conteoLiberados={conteoLiberados}
              exportarAExcel={exportarAExcel}
              filtroFlota={filtroFlota}
              setFiltroFlota={setFiltroFlota}
              filtroMina={filtroMina}
              setFiltroMina={setFiltroMina}
              filtroMes={filtroMes}
              setFiltroMes={setFiltroMes}
              generarPDF={generarPDF}
              session={session}
              handleSafeDelete={handleSafeDelete}
              eliminarCamion={eliminarCamion}
              confirmDeleteId={confirmDeleteId}
            />
          )}

          {/* Vista de Gestión de Usuarios Modularizada (v17.0) */}
          {activeTab === 'usuarios' && session.role === 'admin' && (
            <UserManagement
              dbUsuarios={dbUsuarios}
              setDbUsuarios={setDbUsuarios}
              isCreandoUsuario={isCreandoUsuario}
              setIsCreandoUsuario={setIsCreandoUsuario}
              nuevoUsuarioParams={nuevoUsuarioParams}
              setNuevoUsuarioParams={setNuevoUsuarioParams}
              usuarioEditando={usuarioEditando}
              setUsuarioEditando={setUsuarioEditando}
              addToast={addToast}
              showConfirm={showConfirm}
            />
          )}

          {/* Vista de Nuevo Reporte Modularizada (v17.0) */}
          {activeTab === 'nuevo' && (
            <ReportForm
              reportStep={reportStep}
              setReportStep={setReportStep}
              flota={flota}
              setFlota={setFlota}
              operador={operador}
              setOperador={setOperador}
              mina={mina}
              setMina={setMina}
              grupo={grupo}
              setGrupo={setGrupo}
              selectedDanos={selectedDanos}
              handleDanoToggle={handleDanoToggle}
              observaciones={observaciones}
              handleObsChange={handleObsChange}
              atencion={atencion}
              totalImpacto={totalImpacto}
              isFlotaValid={isFlotaValid}
              addToast={addToast}
              onSubmit={handleReportSubmit}
              session={session}
            />
          )}


          {/* Modales de Garantía Modularizados (v17.0) */}
          <WarrantySelectionModal
            camionInGarantia={camionInGarantia}
            setCamionInGarantia={setCamionInGarantia}
            pendientesGarantia={pendientesGarantia}
            setPendientesGarantia={setPendientesGarantia}
            confirmarGarantia={confirmarGarantia}
          />

          <WarrantyDetailsModal
            selectedGarantiaDetails={selectedGarantiaDetails}
            onClose={() => setSelectedGarantiaDetails(null)}
          />

          {/* Modal de Edición Modularizado */}
          <EditModal
            camionEditando={camionEditando}
            setCamionEditando={setCamionEditando}
            editingGroupContext={editingGroupContext}
            setEditingGroupContext={setEditingGroupContext}
            operadorEdit={operadorEdit}
            setOperadorEdit={setOperadorEdit}
            dictamenEdit={dictamenEdit}
            setDictamenEdit={setDictamenEdit}
            selectedDanosEdit={selectedDanosEdit}
            observacionesEdit={observacionesEdit}
            handleDanoToggleEdit={handleDanoToggleEdit}
            handleObsChangeEdit={handleObsChangeEdit}
            guardarEdicionAvanzada={guardarEdicionAvanzada}
            sincronizarModal={sincronizarModal}
            session={session}
            corregirNombresIA={normalizarNombre}
            corregirOrtografiaIA={corregirOrtografiaIA}
          />

          {/* Modal de Ficha Técnica Modularizado */}
          <HistoryModal
            selectedReport={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        </main>

        {/* ---------- SISTEMA DE MENSAJERÍA PERSONALIZADA (UI) ---------- */}




        {/* Navegación Inferior de Próxima Generación - Gota Líquida + Color Reveal (v15) */}
        {(() => {
          if (selectedReport || camionEditando || camionInGarantia || selectedGarantiaDetails) return null;

          const mobileTabs = ['dashboard', 'cola', 'nuevo', 'historial'];
          const userRole = (session?.role || session?.rol || '').toLowerCase();
          if (userRole === 'admin') mobileTabs.push('usuarios');

          const activeIndex = mobileTabs.indexOf(activeTab);
          const itemWidthPct = 100 / mobileTabs.length;

          return (
            <MobileNavigation
              mobileTabs={mobileTabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isDraggingNav={isDraggingNav}
              setIsDraggingNav={setIsDraggingNav}
              navTouchX={navTouchX}
              setNavTouchX={setNavTouchX}
              navVelocity={navVelocity}
              setNavVelocity={setNavVelocity}
              lastTouchX={lastTouchX}
              navRef={navRef}
              jumpStretch={jumpStretch}
              setJumpStretch={setJumpStretch}
              jumpSkew={jumpSkew}
              setJumpSkew={setJumpSkew}
              activeIndex={activeIndex}
              itemWidthPct={itemWidthPct}
            />
          );
        })()}
        {/* Botón Volver Arriba Seguro v1.9.52 */}
        {showBackToTop && (
          <button
            className="back-to-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Volver arriba"
          >
            <ChevronUp size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
