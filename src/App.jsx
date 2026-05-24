// VERSION_TAG: 2.0.0_STABLE_GOLD_READY
import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';

import { 
  LayoutDashboard, RefreshCcw, LogOut, ChevronUp, Clock, Plus, Users, Truck,
  Hourglass, Search, SearchCheck, Wrench, CheckCircle2, ShieldAlert
} from 'lucide-react';

import { supabase } from './supabaseClient';
import { fallas } from './constants/fallas';

// Motor de IA y Utilidades
import { normalizarNombre, corregirOrtografiaIA, unificarComentariosIA, reaccionarAcentos, limpiarFallasIA } from './utils/iaEngine';
import { parseFecha, formatFechaCorta, formatGrupo, formatearCiclo } from './utils/formatters';

// Servicios de Datos
import { camionService } from './services/camionService';

// Hooks Personalizados
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTruck } from './context/TruckContext';
import { useUI } from './context/UIContext';

// Componentes Modularizados
const ReportForm = lazy(() => import('./components/ReportForm'));
import ToastContainer from './components/ui/ToastContainer';
import GlobalModal from './components/ui/GlobalModal';
const UserManagement = lazy(() => import('./components/UserManagement'));
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
const DashboardView = lazy(() => import('./components/DashboardView'));
const KanbanBoard = lazy(() => import('./components/KanbanBoard'));
const HistoryView = lazy(() => import('./components/HistoryView'));
import MobileNavigation from './components/MobileNavigation';
import Header from './components/Header';
import WarrantySelectionModal from './components/modals/WarrantySelectionModal';
import WarrantyDetailsModal from './components/modals/WarrantyDetailsModal';
import HistoryModal from './components/modals/HistoryModal';
import EditModal from './components/modals/EditModal';
// v6.2: Motor de Unificación Semántica para Comentarios (Conserva Prefijos y Prioriza Trazabilidad)

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
    <div className="spin-animation" style={{ color: '#ef4444' }}>
      <RefreshCcw size={40} />
    </div>
    <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>Cargando módulo...</span>
  </div>
);

function App() {
  // VERSIÓN DE EMERGENCIA: 1.4.7_RENAME_CSS_FIX
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);
  const setActiveTab = (tab) => navigate('/' + tab);

  // Hooks de Lógica Modularizada Global
  const { toasts, modalConfig, addToast, showConfirm, handleModalConfirm, setModalConfig } = useUI();

  const { 
    session, pendingPasswordChangeUser, newPassword, setNewPassword, 
    confirmPassword, setConfirmPassword, usuarioLogin, setUsuarioLogin, 
    passwordLogin, setPasswordLogin, loadingAuth, handleLogin, 
    handlePasswordUpdate, logout 
  } = useAuth();

  const { 
    camionesRegistrados, setCamionesRegistrados, dbUsuarios, setDbUsuarios, 
    loadingData, handleRefresh, updateCamionLocalAndRemote 
  } = useTruck();


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

  // El estado de ReportForm fue migrado a src/components/ReportForm.jsx
  const [editingGroupContext, setEditingGroupContext] = useState(null);
  const [selectedDanosEdit, setSelectedDanosEdit] = useState({});
  const [observacionesEdit, setObservacionesEdit] = useState({});
  const [operadorEdit, setOperadorEdit] = useState('');
  const [dictamenEdit, setDictamenEdit] = useState('');
  const [camionEditando, setCamionEditando] = useState(null);

  useEffect(() => {
    if (camionEditando && editingGroupContext) sincronizarModal(camionEditando, editingGroupContext);
  }, [editingGroupContext, camionEditando?.id]);




  // ---------- MÓDULO CRUD DE USUARIOS ----------
  const [isCreandoUsuario, setIsCreandoUsuario] = useState(false);
  const [nuevoUsuarioParams, setNuevoUsuarioParams] = useState({ nombre: '', username: '', password: 'con123', mina: 'PB', grupo: '1', role: 'supervisor', estado: 'Activo' });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null); // Para el Modal de detalles técnicos
  const [expandedCardId, setExpandedCardId] = useState(null); // Acordeón de Kanban
  const [camionInGarantia, setCamionInGarantia] = useState(null); // Para el Modal de Motivo de Garantía
  const [selectedGarantiaDetails, setSelectedGarantiaDetails] = useState(null); // Para ver pendientes en modal
  const [pendientesGarantia, setPendientesGarantia] = useState({});

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











  // REEMPLAZADO POR HOOKS MODULARES

  const handleRefreshApp = async () => {
    await handleRefresh(() => {
      // Las variables de formulario (flota, operador, daños) ahora son locales en ReportForm.jsx.
      // Ya no es necesario ni posible limpiarlas desde App.jsx.
      console.log("Datos sincronizados desde App.jsx");
    });
  };


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

  const handleLogoutApp = () => {
    localStorage.removeItem('drummond_report_form');
    logout();
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

          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
              <DashboardView
              setSelectedReport={setSelectedReport}
              prepararEdicion={prepararEdicion}
              handleSafeDelete={handleSafeDelete}
              confirmDeleteId={confirmDeleteId}
              formatGrupo={formatGrupo}
              formatFechaCorta={formatFechaCorta}
              />
            } />

            <Route path="/cola" element={
              <KanbanBoard
              expandedCardId={expandedCardId}
              setExpandedCardId={setExpandedCardId}
              currentKanbanCol={currentKanbanCol}
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
              liberarCamion={liberarCamion}
              prepararEdicion={prepararEdicion}
              currentTime={currentTime}
              />
            } />

            <Route path="/historial" element={
              <HistoryView
              handleSafeDelete={handleSafeDelete}
              confirmDeleteId={confirmDeleteId}
              />
            } />

            <Route path="/usuarios" element={session.role === 'admin' ? (
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
            ) : <Navigate to="/dashboard" replace />} />

              <Route path="/nuevo" element={<ReportForm />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>

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
