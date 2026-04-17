import React, { useState, useEffect } from 'react';
import './index.css';
import { LayoutDashboard, Zap, FileText, Blocks, ClipboardList, ShieldAlert, MonitorCheck, PlusCircle, Trash2, Edit3, Settings, Shield, Unlock, LockKeyhole, Lock, RefreshCcw, Users, AlertTriangle, CheckCircle2, Wrench, Activity, Truck, Search, Hourglass, SearchCheck, Award, FileSpreadsheet, MapPin, Calendar, Siren, AlertCircle, Info, History, ChevronUp } from 'lucide-react';

import { supabase } from './supabaseClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    const subObs = obsStr.split('|').map(s => s.trim()).filter(Boolean).sort((a, b) => b.length - a.length);
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

  return result.join(' | ');
};

const LOGO_DRUMMOND = "iVBORw0KGgoAAAANSUhEUgAAAOkAAABACAYAAAD/JFDFAAANVElEQVR4AeydeYxVVx3HD8O+tIEiBAsGCGMUa0hsoAGhEBNLq8WStrFlSyWVFFqKQlsiZfsHbFSi0FLsEopoYIbUqIUEKDok2ECH0lgjMUHrEPgDaqSOlCKbw+J8bnsm5513l3O39+6Dn/HHPee33++733nvnXfubd2IocOuiQgGcg0U9xqoU/I/QUAQKDQCQtJCvzzSnCCglJBUrgJBoOAICEkr9wJJJUEgEQJC0kSwSZAgUDkEAkn62NVeavmVmwoti670VqOudakcWlJJEKgCAoEknXC1h5p8pVeh5f4rfdSLbf3Vust9haxVuHikZGUQCCRpZcpnU+X2q909svLOn01GyVLjCFxX7VeNpHX1g1Sfnzyl+v3mBdVrxWOKeVpkeefnXTVtHokXBIqEQFVICiH7N76kbp71kOo57g7V9/FHFXP0acHhXVWImhZFiS8SAhUnKUSEkF0Hf7YEB+bosZcYEkyEqAlAk5DCIlBRkkJAiAgh/RBBjx0/P3scHUT91eVb1GDZrxEHNvEtIAIVIynEg4AQMQwH7Pjhr1SYZ7Rt2NWuam1bPyFqNFTiUWAEKkJSCAfxIKALFvjhT5yLf5jPoPbfUYWoYQiJregI5E5SiAbhIF4cMPAnjvg4cX6+QlQ/VERXKwjkSlIIBtEgXBJAiCOePEnizRghqomGjGsJgdxICrEgGERLAwjx5CFfmjzEClFBIUhEX1QEciEphIJYECyLEycP+cibNl/WRG05fkyFyW93bFf33PtNr+03m/4Q6vvWgf1q+qyZnu/Pnl9X4kssBo5mPfwQU2eP3/3ze2rxkh8ojqaN+bDhw1VU/F//dsSLpz87/o6xY72eTb09Jn5LY4OiFudg2+25iZlts+emL7n9xMZMY+zia9fTc3LYebVNH8Fr7vwn/MrE0mVOUogEoSBWrE4inMlHXvJHuEaasyZqWMFRo0apVatXh7l02G4dPFgtW76842LuMKQc9OvXT82dN09xNFMxf3TOd02V77hHjx5ePP2ZDsRP+dYUU+U7Jn7suHFq9XM/9LXbyjiY4bt06VI7RSHm4LV48WLFH7I0DWVKUggEkSBUmqaCYslLfuoE+bjqK0lULmbXvrigx43/qqt7ar8+ffqkyhEn/jMDBjjXioMZZHBOXAXHEfUjUlXNjKQQBwJBpFQdRQSTnzrUi3CNNOdB1IatW9WK9nfDixcvRtaP4xuZzHD44ORJ9crLLxsapdBRr0QZMME3TTxp9zbtLesBvZ/QV0tLi5+pTIfvmjVrlAu+ZcEOinVr13qvH6+h7U5t9EjzgbdtszrY3OzFRp9LWWioIhOSQhiIA4FCq1nGtpP/VOea9imOlil0Sh3qUTfU0cGYNVGPHDmiGrdsVb/cvDmyOr7fmT27xA+CEF+ijDk5f+GCWvOjHyvzYkG3ctlyj6xR6fAlnotO+6JzjSdm7pw5ZT2g9xNwWLl8hZ+pTIfvKxt+rg7sP1Bmy0Lx5s5d3uvn9xpQGz1y/NixsnKnTp3yYl3PpSxBgCI1SSEKhIE4ATV81R+9tEl9OOZ+deaRJd7xQvMhX78gJfWoS/0gH1d91kSl7okTJzhESn19veIjrnbc2tCgh7kcIZtrYi462zdOvB0bNj908GCYucx27tx/y3RFUcQ9l6i+U5EUgkAUCBNVyLRD0POrXjVV6vSD31NFIOqka11L+sp7smP79pISCxYsKJnLRBBITNIsCapfhiIQdXlbP1VJoj71/YX69L0j76os73sT+UcQaEcgEUnzIGh7L97/q03U7qqTciaq17H8Iwjki0BskuZJUH2qEJUFJT13OfKRm4/e9OfiH+YDUedfvjnV3TNDhgwJK3Hd2/TGhbxOtHfvdD8d5dUXedP+LkoOU2KRFAJABAhhJoka+30HjYphQYm4KD/TTl/0R5+mPsk46WLSyJEjvR04Dz38cJKyNRnT7PNzBBsX2OXEwliWJ6XxHT9hfOK0OgdfK0xJ+4dl4MCB3mu/ZOmziXvzC3QmKRc+BIAIfomCdBDNXiQK8rX1xBFv68Pm9Eef9Bvm52LTRHXx1T4zZs70dhiZP8afPn1amxMfudi3NDYojomT5BTIzxH2ObLDiF1OZslD77xjThONNb58d9cJ+NlKj12OOgc7wUxJu4mEcyYfu6DMPo62HC3Z4tlyvPznG9PfHjuRlAueCx8C2AnC5hAMooX5RNmIJ0+Un2mnT/qlb1OfZAxR0z6FcPeuXUlKl8VwEdjKv7//vq2qynzjxo2hddl8sGnja6E+ocYQY94/W4WUjjQdPnxYpf1JxomkfdevVlz4kR0ZDnynhGCGKvGQPBD1f/84qlzl2vnz6qaVpSunSRuYdKVnolD+wrNzh00AcRO8sO55bwcLF7dfLO9c3q6e9h/2/eyV1rHBgJ1AnLNZm/65UJ95+mnFO65pSzumFjWpnTZX1vG8Pvy8Zq/eJ6njRNLuX6iPnfvSn/4SOyYsAKL+e9JMFUf4XhuW09XGQlLQk/Lrhw1XQTJx/ARv142uc8/X7yrxbdyy1TPZ8ei5oGdNn6G+/MWRJTHad8xXblfs6iEBF4LWc6QOeo7MEca2Dj2xCGMt2tfUax1H7ccRH/IikIVzRq+F/h+4b6piJw8+iLbpI+frp/fT6RiO1KImfmFi90ysn+g+dC7bx7aH5eX1ARteR/LZudC5ihNJL7fG/07VxXoaoGtDQX58dO0++14VV4LyxdW3droaN0T8BYFMEHAi6bkdu2MX6/m1OzN54DWFISjfMfs/t0LFkc6fG0x4ajnTTtCTyp+kLLebK4SMdUHGpuCLjftL0es5OoQ5elPQs+po6hibvtjNOXaEWBYpTEFvCnH4iRQXASeS8lGT74RxToPvsBALgplxccfEk4d8cWLpl77jxAT5NnY+G2RS06ZP81ZzWdXTws2+BOi5Pm7a/Avv3sKFixZ5McTip4W59tVHVnRZddRzfWzY1ujlYP7ssmW+fXBTss6tj/ibQk/80dB2ORYPASeS0jYXPBc+Y1eBWBAMornGmH7EEU8eUx81pk/6jfJzsb9Xd0k11EXfdkYuFgs42vc3sniCnp8NXO8t1DH2ii6LMOSilvYZOmwoqg7Rd6+EbajAh3h6mjx5ckesDIqHgDNJaZ0LHwIwdhUIBtEgnGsMfvgTRzxzV6E/+nT1D/ODoAu7fBTmUmL79gMPevcTcr+haVi/fr23UmvqwsasWk75xiePXLH9fv36656qtbVV/X7PHm9s/6Nvrg6y448PBGUsUmwEYpGUU4EAZ9/YydBZIBqEg3guQfjhT5yLv/apJkHpgZU8VgAR5lo+PnNG+d32pe32kdvByGXrXef6XtY7J04MDNnb1BRoE0OxEIhNUto/+8Sq3G4rq1WCggvf7XioF8JcC9vQRo8eraeRRz6mpnmAlf4jYe56sou63u9qx8m88ggkIiltsgk+6/s/a5Gg5o6fFzdsUPdNnaom3303EHUI29Ds76kYv3Tbbd6T+iA1K67oED6G6vtK+eiLLo6QD3++c3IUqW0EEpOU086SqLVIUDDYs2t32SNJ9KM99jbtxaVDIJx+l0PJPlxIjYwZM0Zta9zW8eweiIrPvn37OMQSyE+A7oOxSO0ikIqknHZSot7y2k8J96RWCUrzfHdk5wuLRciT8+d37ARiRxBz9Ah+xJgPu0KPQFD2eLJgxByZMW26Ykth84G3Oxak9JgcxOBnjvWcutSnninYEZ2HMXlMHxkXC4HUJOV0khC12+dHqFs/OKgGvPs7NeitN2LvDeajNotY1E8rcVdx/erxDomY29/wY44eYY6YOvQIBMUG6ZkjfjptJwd2/MyxnqMjX721bRE7ovMwJg++IskRyDMyE5LSYBKiEhd3BZcYCEo9xmklC4Km7UHiBYEwBDIjKUUgDgRinJeQnzpZ5BeCZoGi5MgbgUxJSrMQCCIxzlrIS/4s8u7vfEHF2aiQRU3JIQgkQaAuSVBUDESCUFF+cezkI2+cmCDfLV3OqqWdPw4yi14QKBQCuZCUM4RQEItxWiEP+dLmIR6Cvlp3nqGfiE4QKBwCuZGUM4VYEIxxUiGePEnjzTghqImGjGsFgVxJCggQDKIxjivEER83zs9fCOqHiuhqAYHcSQoIEA3CMXYV/Ilz9Q/zE4KGoSO2oiNQEZICAoSDeIyjBD/8o/xc7EJQF5Sq4iNFHRGoGEnpB+JBQMZBgh2/ILur/pK6poSgrmiJX5ERqChJAQICQkTGtqDHbuvjziHo6q6nlazixkVO/IuIQMVJCggQEUIy1sIcvZ4nPWqC/rFTW9IUEicIFAqBqpAUBCBk69JViqcpfPj4M95/nxR9GuGpfryDCkHToCixRUMgA5ImP6VLm3cq7mRp274/eZJPI9nmN69rqxKCfgqIHK4bBKpK0rQo8tGWTfJPtpOTbX5Bz8ZNW0fiBYFqIhBI0ke6/EdN7PavQstd3U4pNskf7nS5mhhKbUEgVwTqcs0uyQUBQSA1AkLS1BBWMoHUuhEREJLeiK+6nHNNISAkramXS5q9ERH4PwAAAP//UaGzSAAAAAZJREFUAwAVcKRC1+39wgAAAABJRU5ErkJggg==";

function App() {
  // Versión del Sistema: 1.8.4 (Filtro Firma por Grupo)
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('drummond_activeTab') || 'dashboard');

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
    sessionStorage.setItem('drummond_activeTab', activeTab);
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
  const [expandedCardId, setExpandedCardId] = useState(null); // Acordeón de Kanban
  const [camionEditando, setCamionEditando] = useState(null); // Para el Modal de edición rápida camión
  const [selectedDanosEdit, setSelectedDanosEdit] = useState({});
  const [observacionesEdit, setObservacionesEdit] = useState({});
  const [camionInGarantia, setCamionInGarantia] = useState(null); // Para el Modal de Motivo de Garantía
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
  const formatFechaCorta = (dateStr) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const anio = String(d.getFullYear());
        return `${dia}/${mes}/${anio}`;
      }
      // Limpiamos comas, puntos o espacios al final del recorte (ej: "16/04/2026, " -> "16/04/2026")
      return dateStr.substring(0, 10).replace(/[,.\s]+$/, '');
    } catch (e) {
      return dateStr.substring(0, 10).replace(/[,.\s]+$/, '') || '---';
    }
  };

  // Formateador de Grupos v1.9.27 (Transforma "1, 2" en "G1 | G2")
  const formatGrupo = (grupo) => {
    if (!grupo) return '--';
    const numStr = String(grupo);
    if (!numStr.includes(',')) return `G${numStr}`;
    return numStr.split(/,[\s]*/).map(g => `G${g.trim()}`).join(' | ');
  };

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
        const copy = { ...prev };
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

      const datosExcel = registrosFiltrados.map(r => {
        const opEntries = (r.operador || '').split(', ');
        const getOp = (g) => opEntries.find(n => n.includes(`G${g}:`))?.replace(`G${g}:`, '').trim() || '-';
        return {
          "Fecha Registro": r.time,
          "Flota": r.flota,
          "Ubicación": r.mina,
          "Op. Grupo 1": getOp(1),
          "Op. Grupo 2": getOp(2),
          "Op. Grupo 3": getOp(3),
          "Fallas Reportadas": r.fallas,
          "VB G1": r.aprobado_g1 ? 'Aprobado' : '-',
          "VB G2": r.aprobado_g2 ? 'Aprobado' : '-',
          "VB G3": r.aprobado_g3 ? 'Aprobado' : '-'
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

  const generarPDF = (registro) => {
    try {
      addToast("⏳ Generando acta de trazabilidad...", "info");
      const doc = new jsPDF();

      doc.setFillColor(31, 41, 55);
      doc.rect(0, 0, 210, 40, 'F');

      // Añadir Logotipo Corporativo (v1.8.0)
      try {
        doc.addImage(LOGO_DRUMMOND, 'PNG', 15, 12, 65, 18);
      } catch (e) {
        console.error("Error al cargar logo:", e);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("CAMIONES", 200, 20, { align: 'right' });

      doc.setFontSize(10);
      doc.text("REPORTE TÉCNICO DE TRAZABILIDAD - PROGRAMA CONFORT", 200, 30, { align: 'right' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Identificación del Camión: ${registro.flota}`, 20, 55);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Mina: ${registro.mina === 'PB' ? 'Pribbenow' : 'El Descanso'}`, 20, 65);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 140, 55);

      doc.setFont("helvetica", "bold");
      doc.text(`Personal que reporta el estado (Operadores Permanentes):`, 20, 75);
      doc.setFont("helvetica", "normal");
      const operText = (registro.operador || 'N/A').replace(/, /g, ' | ');
      const operSplit = doc.splitTextToSize(operText, 170);
      doc.text(operSplit, 20, 82);

      const supLabelY = 82 + (operSplit.length * 5) + 2;
      doc.setFont("helvetica", "bold");
      doc.text(`Gestor del reporte (Supervisor de Camiones):`, 20, supLabelY);

      doc.setFont("helvetica", "normal");
      const supText = (registro.supervisor || 'N/A').replace(/, /g, ' | ');
      const supSplit = doc.splitTextToSize(supText, 170);
      const supDataY = supLabelY + 7;
      doc.text(supSplit, 20, supDataY);

      const tableY = Math.max(105, supDataY + (supSplit.length * 5) + 5);

      // Fix Universal para jspdf-autotable en Vite (v1.7.0)
      const tableFunc = typeof autoTable === 'function' ? autoTable : autoTable.default;

      // Preparar datos de fallas con comentarios (v1.7.0)
      const itemsFallas = limpiarFallasIA(registro.fallas).split(', ');
      const bodyFallas = itemsFallas.map(item => {
        const match = item.match(/^(.*?)(?:\s\((.*?)\))?$/);
        return [match ? match[1] : item, match && match[2] ? match[2] : '-'];
      });

      tableFunc(doc, {
        startY: tableY,
        head: [['Detalle de Fallas Intervenidas', 'Comentarios Técnica / Observación']],
        body: bodyFallas,
        theme: 'striped',
        headStyles: { fillColor: [227, 25, 55], textColor: [255, 255, 255] },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 'auto' } }
      });

      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("HISTORIAL DE VALIDACIÓN POR GRUPOS", 20, finalY);

      tableFunc(doc, {
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

      // Lógica de Firma Filtrada (v1.8.4)
      const grupoPrefix = `G${session.grupo || '1'}:`;
      const opNames = (registro.operador || '').split(', ');
      // Buscamos el nombre que coincida con el grupo del supervisor logeado
      const opNameFiltered = opNames.find(n => n.includes(grupoPrefix))?.replace(grupoPrefix, '').trim() || 'N/A';

      const signY = doc.lastAutoTable.finalY + 40;
      doc.line(20, signY, 80, signY);
      doc.setFont("helvetica", "bold");
      doc.text(`${opNameFiltered}`, 20, signY + 5);
      doc.setFont("helvetica", "normal");
      doc.text(`Operador Grupo ${session.grupo || '1'}`, 20, signY + 12);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Documento generado digitalmente por Drummond Confort System`, 105, 285, { align: 'center' });

      const dPdf = new Date();
      const fechaNombre = `${String(dPdf.getDate()).padStart(2, '0')}-${String(dPdf.getMonth() + 1).padStart(2, '0')}-${dPdf.getFullYear()}`;
      doc.save(`Acta_Trazabilidad_${registro.flota}_${fechaNombre}.pdf`);
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
    sessionStorage.removeItem('drummond_activeTab');
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

      // Lógica de Filtrado de Alto Nivel v1.9.40 (Rangos e Inteligencia Mensual)
      const busquedaMes = String(filtroMes || '').trim().toLowerCase();
      if (!busquedaMes) return true;
      
      const timeStr = String(r.time || r.creado_at || '');
      if (!timeStr) return false;

      let mesIndex = -1; // 0-indexed (0=Ene, 11=Dic)

      // Extractor de Mes Robusto (Soporte DD/MM/AAAA e ISO)
      if (timeStr.includes('/')) {
        const partes = timeStr.split('/');
        if (partes.length >= 2) mesIndex = parseInt(partes[1], 10) - 1;
      } else if (timeStr.includes('-')) {
        const partes = timeStr.split('-');
        if (partes.length >= 2) {
          // Detectar si es YYYY-MM-DD o DD-MM-YYYY
          mesIndex = partes[0].length === 4 ? parseInt(partes[1], 10) - 1 : parseInt(partes[1], 10) - 1;
        }
      }

      if (mesIndex === -1) return false;

      // Ayudante para normalizar cualquier entrada a índice de mes
      const getMesIndex = (str) => {
        const s = String(str || '').toLowerCase().trim();
        if (!s) return -1;
        const mesesAbbr = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const mesesFull = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        let idx = mesesAbbr.indexOf(s.substring(0, 3));
        if (idx === -1) idx = mesesFull.indexOf(s);
        if (idx === -1 && /^\d+$/.test(s)) {
          const n = parseInt(s, 10);
          if (n >= 1 && n <= 12) idx = n - 1;
        }
        return idx;
      };

      const terminos = busquedaMes.split(',').map(t => t.trim()).filter(Boolean);
      
      return terminos.some(t => {
        if (t.includes('-')) {
          const puntos = t.split('-').map(p => p.trim());
          if (puntos.length === 2) {
            const start = getMesIndex(puntos[0]);
            const end = getMesIndex(puntos[1]);
            if (start !== -1 && end !== -1) {
              return mesIndex >= start && mesIndex <= end;
            }
          }
        }
        const tIdx = getMesIndex(t);
        return tIdx !== -1 && tIdx === mesIndex;
      });
    } catch (err) {
      console.error("Error en filtro de historial:", err);
      return true; // En caso de duda, mostrar para evitar pantalla en blanco
    }
  }) : [];

  const conteoLiberados = session ? camionesAccessibles.filter(c => c.estado === 'liberado').length : 0;

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
              if (session?.role !== 'admin') {
                setMina(session?.mina === 'Global' ? mina : session?.mina);
                setGrupo(session?.grupo);
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
          {session?.role === 'admin' && (
            <div className={`nav-item ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>
              <Settings size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Gestor de Cuentas
            </div>
          )}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
              {session?.nombre?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>{session?.nombre || 'Usuario'}</div>
              <div style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>Mina {session?.mina || 'N/A'}</div>
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
                <div style={{ fontWeight: '700' }}>{session?.nombre || 'Usuario'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mina {session?.mina || 'N/A'}</div>
              </div>
              <div style={{
                width: '40px', height: '40px',
                borderRadius: '50%', backgroundColor: '#ef4444',
                color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 'bold'
              }}>
                {(session?.nombre || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-view fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-black)', margin: 0 }}><LayoutDashboard strokeWidth={1.5} size={24} style={{ marginBottom: '-0.3rem', color: '#2563eb' }} />  Resumen de Control</h2>
              <span className="badge badge-liberado dashboard-kpi-badge" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.15)', color: '#059669', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)' }}>
                <Award size={16} strokeWidth={2} /> <span>Entregados: <strong>{conteoLiberados}</strong></span>
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
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>{k.subtitulo}</div>
                </div>
              ))}
            </div>

            <div className="card fade-in" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Zap size={22} color="var(--primary-red)" /> Top Prioridades en Taller
                </h3>
                <button className="btn btn-primary mobile-only" onClick={() => setActiveTab('cola')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Ver Todos</button>
              </div>

              <div className="priority-view-container">
                {/* Vista exclusiva para PC: Tabla Moderna */}
                {window.innerWidth > 768 ? (
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
                        {(camionesAccessibles || []).filter(c => c && c.estado !== 'liberado').slice(0, 6).map((camion) => (
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
                                {(session?.role?.toLowerCase() === 'admin' || session?.role?.toLowerCase() === 'supervisor' || session?.rol?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'supervisor') && (
                                  <button onClick={() => prepararEdicion(camion)} className="btn-action btn-action-edit" title="Editar"><Edit3 size={18} /></button>
                                )}
                                {(session?.role?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'admin') && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleSafeDelete(camion.id, () => eliminarCamion(camion.id, camion.flota)); }} 
                                    className={`btn-action ${confirmDeleteId === camion.id ? 'btn-action-confirm-desktop' : 'btn-action-delete'}`}
                                    style={{ 
                                      width: confirmDeleteId === camion.id ? 'auto' : '36px',
                                      padding: confirmDeleteId === camion.id ? '0.5rem 1rem' : '0'
                                    }}
                                    title="Eliminar"
                                  >
                                    {confirmDeleteId === camion.id ? <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>✓ CONFIRMAR</span> : <Trash2 size={18} />}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Vista exclusiva para Móvil: Tarjetas Modernas */
                  <div className="priority-cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {(camionesAccessibles || []).filter(c => c && c.estado !== 'liberado').slice(0, 6).map((camion) => (
                      <div key={camion?.id || Math.random()} className="kanban-card card-overlay" style={{ background: 'white', borderRadius: '12px', padding: '1rem', borderLeft: `6px solid ${camion?.atencion === 'CRÍTICA' ? '#ef4444' : (camion?.atencion === 'ALTA' ? 'var(--secondary-yellow)' : '#10b981')}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-black)' }}>CAMIÓN {camion?.flota || 'S/N'}</span>
                          <span className={`badge badge-${camion?.estado || 'default'}`} style={{ fontSize: '0.65rem' }}>{(camion?.estado || 'N/A').toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Mina/Grupo:</span>
                            <strong style={{ color: 'var(--text-main)' }}>{camion?.mina || '--'} / {formatGrupo(camion?.grupo)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Prioridad:</span>
                            <strong style={{ color: camion?.atencion === 'CRÍTICA' ? '#ef4444' : 'var(--text-main)' }}>{camion?.atencion || 'NORMAL'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Ingreso:</span>
                            <strong style={{ color: 'var(--secondary-blue)' }}>{formatFechaCorta(camion?.time || camion?.creado_at)}</strong>
                          </div>
                        </div>
                        <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => setSelectedReport(camion)} style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3b82f6', padding: '0.3rem', borderRadius: '6px' }} title="Diagnóstico"><FileText size={16} /></button>
                          {(session?.role?.toLowerCase() === 'admin' || session?.role?.toLowerCase() === 'supervisor' || session?.rol?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'supervisor') && (
                            <button onClick={() => prepararEdicion(camion)} style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #e5e7eb', color: '#6b7280', padding: '0.3rem', borderRadius: '6px' }} title="Editar"><Edit3 size={16} /></button>
                          )}
                          {(session?.role?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'admin') && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleSafeDelete(camion.id, () => eliminarCamion(camion.id, camion.flota)); }} 
                              style={{ 
                                background: confirmDeleteId === camion.id ? 'var(--primary-red)' : 'rgba(239, 68, 68, 0.1)', 
                                border: confirmDeleteId === camion.id ? 'none' : '1px solid rgba(239, 68, 68, 0.2)',
                                color: confirmDeleteId === camion.id ? 'white' : '#ef4444', 
                                padding: '0.3rem', 
                                borderRadius: '6px',
                                minWidth: confirmDeleteId === camion.id ? '80px' : '32px',
                                transition: 'all 0.3s ease'
                              }} 
                              title="Eliminar"
                            >
                              {confirmDeleteId === camion.id ? <span style={{ fontSize: '0.6rem', fontWeight: '900' }}>¿BORRAR?</span> : <Trash2 size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

            <div 
              className="kanban-board"
              onScroll={(e) => {
                const scrollLeft = e.target.scrollLeft;
                const width = e.target.clientWidth;
                const index = Math.round(scrollLeft / (width * 0.72)); // 72vw es el ancho de col en movil
                if (index >= 0 && index <= 4) setCurrentKanbanCol(index);
              }}
              style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                flex: 1,
                alignItems: 'flex-start',
                scrollSnapType: 'x mandatory'
              }}
            >
              {columnasKanban.map(col => {
                const camionesColumna = camionesAccessibles.filter(c => c.estado === col.id).sort((a, b) => b.puntos - a.puntos);

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
                          marginTop: marginTop,
                          zIndex: isExpanded ? 1000 : index + 1
                        }}
                      >
                        <div
                          className={`kanban-card-header${isExpanded ? ' expanded' : ''}`}
                          onClick={() => setExpandedCardId(expandedCardId === camion.id ? null : camion.id)}
                        >
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
                        {isExpanded && (
                          <div className="fade-in">
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                              Ingreso: {formatFechaCorta(camion.time || camion.creado_at)}
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
                                <div style={{ fontSize: '0.75rem', color: '#9f1239', lineHeight: '1.2' }}>{camion.motivo_garantia?.split(', ').join(' | ')}</div>
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
                                  const evt = { preventDefault: () => { }, dataTransfer: { getData: () => camion.id.toString() } };
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

            {/* Indicadores de Columnas (Móvil) - Sincronizados v1.9.15 */}
            <div className="kanban-indicators mobile-only">
              {columnasKanban.map((_, i) => (
                <div key={i} className={`indicator-dot ${currentKanbanCol === i ? 'active' : ''}`} />
              ))}
            </div>
          </div>
        )}

        {/* Historial View */}
        {activeTab === 'historial' && (
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
                  <option value="PB">Pribbenow (PB)</option>
                  <option value="ED">El Descanso (ED)</option>
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
                    <th style={{ whiteSpace: 'nowrap' }}>Tiempo de Ciclo</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Operador</th>
                    <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Mina</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Aprobado</th>
                    <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Reporte</th>
                    {session.role === 'admin' && <th className="desktop-only" style={{ textAlign: 'center', width: '80px' }}>Acciones</th>}
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
                            {limpiarFallasIA(registro.fallas)}
                          </div>
                        </td>
                        <td data-label="Ingreso" style={{ fontSize: '0.85rem' }}>{formatFechaCorta(registro.time || registro.creado_at)}</td>
                        <td data-label="Ciclo" className="collapsible-col" style={{ fontSize: '0.85rem' }}>Calculando...</td>
                        <td data-label="Operador" className="collapsible-col" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {(registro.operador || 'N/A').split(', ').map((op, idx) => {
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
                           <div style={{ background: 'var(--primary-black)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block' }}>
                              {registro.mina || 'PB'}
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
                            
                            {/* Botón Eliminar Protegido para Móviles (v1.9.43) */}
                            {session.role === 'admin' && (
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
                         {session.role === 'admin' && (
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
                      <td colSpan="8" style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>No hay registros que coincidan con los filtros.</td>
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
                      setNuevoUsuarioParams({ ...nuevoUsuarioParams, nombre: nuevoNombre, username: generarAliasBase(nuevoNombre, dbUsuarios) });
                    }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Usuario Login (Generado)</label>
                    <input type="text" className="input-field" placeholder="ej: pgonzalez" value={nuevoUsuarioParams.username} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() })} style={{ background: '#f8fafc', color: '#64748b' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Clave Temporal</label>
                    <input type="text" className="input-field" value="con123" disabled style={{ background: '#f1f5f9', color: '#94a3b8' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Estado de la Cuenta</label>
                    <select className="input-field" value={nuevoUsuarioParams.estado} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, estado: e.target.value })}>
                      <option value="Activo">🟢 Activo</option>
                      <option value="Inactivo">🔴 Suspendido/Inactivo</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Rol Operativo</label>
                    <select className="input-field" value={nuevoUsuarioParams.role} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, role: e.target.value })}>
                      <option value="supervisor">Supervisor de Producción</option>
                      <option value="lector">Lector KPI (Auditoría)</option>
                      <option value="admin">Administrador TI</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Fijar Mina a Cargo</label>
                    <select className="input-field" value={nuevoUsuarioParams.mina} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, mina: e.target.value })} disabled={nuevoUsuarioParams.role === 'admin'}>
                      <option value="PB">Pribbenow (PB)</option>
                      <option value="ED">El Descanso (ED)</option>
                      <option value="Ambas">Ambas Minas (PB/ED)</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Asignar Grupo</label>
                    <select className="input-field" value={nuevoUsuarioParams.grupo} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, grupo: e.target.value })}>
                      <option value="1">Grupo 1</option>
                      <option value="2">Grupo 2</option>
                      <option value="3">Grupo 3</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-primary" onClick={async () => {
                    if (!nuevoUsuarioParams.username || !nuevoUsuarioParams.nombre) return addToast('Por favor, completa nombre y usuario.', 'error');

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
                    <input type="text" className="input-field" value={usuarioEditando.nombre} onChange={e => setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })} style={{ borderColor: '#fbcfe8' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Nuevo Usuario Login</label>
                    <input type="text" className="input-field" value={usuarioEditando.username} onChange={e => setUsuarioEditando({ ...usuarioEditando, username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() })} style={{ borderColor: '#fbcfe8' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Ascender o Reasignar Rol</label>
                    <select className="input-field" value={usuarioEditando.role} onChange={e => setUsuarioEditando({ ...usuarioEditando, role: e.target.value })} style={{ borderColor: '#fbcfe8' }}>
                      <option value="supervisor">Supervisor de Producción</option>
                      <option value="lector">Lector KPI (Auditoría)</option>
                      <option value="admin">Administrador TI</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Cambiar Mina a Cargo</label>
                    <select className="input-field" value={usuarioEditando.mina} onChange={e => setUsuarioEditando({ ...usuarioEditando, mina: e.target.value })} disabled={usuarioEditando.role === 'admin'} style={{ borderColor: '#fbcfe8' }}>
                      <option value="PB">Pribbenow (PB)</option>
                      <option value="ED">El Descanso (ED)</option>
                      <option value="Ambas">Ambas Minas (PB/ED)</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Cambiar Grupo</label>
                    <select className="input-field" value={usuarioEditando.grupo || '1'} onChange={e => setUsuarioEditando({ ...usuarioEditando, grupo: e.target.value })} style={{ borderColor: '#fbcfe8' }}>
                      <option value="1">Grupo 1</option>
                      <option value="2">Grupo 2</option>
                      <option value="3">Grupo 3</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Estado Corporativo</label>
                    <select className="input-field" value={usuarioEditando.estado} onChange={e => setUsuarioEditando({ ...usuarioEditando, estado: e.target.value })} style={{ borderColor: '#fbcfe8', background: usuarioEditando.estado === 'Activo' ? '#f0fdf4' : '#fef2f2' }}>
                      <option value="Activo">🟢 Activo</option>
                      <option value="Inactivo">🔴 Inactivo / Suspendido</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-primary" style={{ background: '#c026d3', borderColor: '#c026d3' }} onClick={async () => {
                    if (!usuarioEditando.username || !usuarioEditando.nombre) return addToast('No puedes dejar campos principales vacíos.', 'error');
                    if (usuarioEditando.role === 'admin') usuarioEditando.mina = 'Ambas';

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
                      <td data-label="Nombre Completo">
                        <strong style={{ color: 'var(--primary-black)', fontSize: '1rem' }}>{u.nombre}</strong><br />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{u.username}</span>
                      </td>
                      <td data-label="Estado">
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
                      <td data-label="Rol">
                        <span className="badge" style={{ background: u.role === 'admin' ? '#fee2e2' : '#e0e7ff', color: u.role === 'admin' ? '#991b1b' : '#3730a3' }}>
                          {u.role}
                        </span>
                      </td>
                      <td data-label="Ubicación" style={{ fontWeight: '500' }}>{u.role === 'admin' ? 'Todo' : `Mina ${u.mina}`}</td>
                      <td data-label="Grupo">
                        <span className="badge" style={{ background: '#f3f4f6', color: '#374151', fontSize: '0.8rem' }}>
                          G{u.grupo || '1'}
                        </span>
                      </td>
                      <td data-label="Alta" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.creado}</td>
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
                                setDbUsuarios(dbUsuarios.map(x => x.id === u.id ? { ...x, password: 'con123', firstTime: true } : x));
                                addToast(`Se ha suspendido temporalmente por reseteo a ${u.nombre}. Usará clave estándar "con123".`);
                              }
                            });
                          }}>
                            <RefreshCcw size={15} />
                          </button>
                          <button title="Eliminar del Sistema" className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center' }} onClick={() => {
                            if (u.username === 'admin' || u.username === 'aramirez') {
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

            <div className="form-section-divider"><span className="form-section-title">Datos del Camión</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Identificación del Camión</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ borderColor: flota.length > 0 && !isFlotaValid ? 'var(--primary-red)' : '' }}
                  placeholder="Ej: 2554 (Inicia con 2)"
                  value={flota}
                  onChange={(e) => setFlota(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
                {flota.length > 0 && !isFlotaValid && (
                  <span style={{ color: 'var(--primary-red)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                    Debe tener 4 dígitos y comenzar por 2.
                  </span>
                )}
              </div>
            <div className="form-section-divider"><span className="form-section-title">Operador Asignado</span></div>
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

            <div className="form-section-divider"><span className="form-section-title">Checklist de Fallas</span></div>
            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Fallas Mecánicas (Falta de Confort)</h3>
                <div style={{
                  backgroundColor: totalImpacto > 50 ? 'var(--primary-red)' : totalImpacto > 20 ? 'var(--secondary-yellow)' : totalImpacto > 0 ? '#10b981' : '#e5e7eb',
                  color: totalImpacto > 20 && totalImpacto <= 50 ? 'var(--primary-black)' : totalImpacto === 0 ? 'var(--primary-black)' : 'white',
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
                {fallas.filter(f => (camionInGarantia?.fallas || '').includes(f.nombre)).map(f => {
                  const isSelected = !!pendientesGarantia[f.id]?.selected;
                  return (
                    <div key={f.id} style={{ 
                      background: 'white', 
                      padding: '0.8rem 1.5rem', 
                      borderRadius: '50px', 
                      border: '1px solid var(--border-color)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.8rem', 
                      transition: 'all 0.3s', 
                      boxShadow: isSelected ? '0 4px 12px rgba(239, 68, 68, 0.1)' : 'none', 
                      borderColor: isSelected ? 'var(--primary-red)' : 'var(--border-color)' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: '500', width: '100%' }}>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => setPendientesGarantia(prev => ({
                                ...prev,
                                [f.id]: { ...prev[f.id], selected: !prev[f.id]?.selected }
                              }))}
                              style={{
                                width: '24px',
                                height: '24px',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                borderRadius: '50%',
                                border: `2px solid ${isSelected ? 'var(--primary-red)' : '#d1d5db'}`,
                                backgroundColor: isSelected ? 'var(--primary-red)' : 'white',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            />
                            {isSelected && (
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
                          {f.nombre}
                        </label>
                        <span className="badge" style={{
                          background: f.impacto >= 25 ? 'rgba(227, 25, 55, 0.1)' : f.impacto >= 10 ? 'rgba(255, 242, 0, 0.2)' : '#e5e7eb',
                          color: f.impacto >= 25 ? 'var(--primary-red)' : f.impacto >= 10 ? '#854d0e' : '#4b5563',
                          padding: '0.4rem 0.8rem',
                          border: `1px solid ${f.impacto >= 25 ? 'rgba(227, 25, 55, 0.2)' : f.impacto >= 10 ? 'rgba(255, 242, 0, 0.5)' : '#d1d5db'}`
                        }}>
                          {f.impacto >= 25 ? 'Crítico' : f.impacto >= 10 ? 'Mayor' : 'Menor'}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="fade-in" style={{ paddingLeft: '2.5rem' }}>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Explica qué sigue fallando..."
                            value={pendientesGarantia[f.id]?.comment || ''}
                            onChange={(e) => setPendientesGarantia(prev => ({
                              ...prev,
                              [f.id]: { ...prev[f.id], comment: e.target.value }
                            }))}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
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
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mina {selectedReport.mina} - Grupo {formatGrupo(selectedReport.grupo)}</p>
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
                  <span style={{ fontSize: '0.85rem', color: '#0c4a6e', fontWeight: 'bold' }}>{(selectedReport.supervisor || 'N/A').split(', ').join(' | ')}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>OPERADOR PERMANENTE:</span>
                  <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{(selectedReport.operador || 'No asignado').split(', ').join(' | ')}</span>
                </div>
              </div>

              <div style={{ background: '#fdf2f8', padding: '0.8rem', borderRadius: '8px', border: '1px solid #fbcfe8', marginBottom: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#be185d', fontWeight: 'bold', marginRight: '0.5rem' }}>FECHA DE REGISTRO:</span>
                <span style={{ fontSize: '0.85rem', color: '#831843' }}>{formatFechaCorta(selectedReport.time)}</span>
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
                      onChange={e => setCamionEditando({ ...camionEditando, flota: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.1)' }}
                    />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Nombre del Operador</label>
                    <input
                      type="text"
                      className="input-field"
                      value={camionEditando.operador || ''}
                      onChange={e => setCamionEditando({ ...camionEditando, operador: e.target.value })}
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

      {/* Navegación Inferior (Solo Móvil) - Estilo Liquid Glass Ready */}
      <nav className="bottom-nav mobile-only">
        <a 
          href="#" 
          className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
        >
          <LayoutDashboard size={20} />
          <span>Inicio</span>
        </a>
        <a 
          href="#" 
          className={`bottom-nav-item ${activeTab === 'cola' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('cola'); }}
        >
          <Truck size={20} />
          <span>Lista</span>
        </a>
        <a 
          href="#" 
          className={`bottom-nav-item ${activeTab === 'nuevo' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('nuevo'); }}
        >
          <PlusCircle size={20} />
          <span>Nuevo Reporte</span>
        </a>
        <a 
          href="#" 
          className={`bottom-nav-item ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('historial'); }}
        >
          <History size={20} />
          <span>Historial</span>
        </a>
        {session?.role === 'admin' && (
          <a 
            href="#" 
            className={`bottom-nav-item ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('usuarios'); }}
          >
            <Users size={20} />
            <span>Usuarios</span>
          </a>
        )}
      </nav>
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
  );
}

export default App;

