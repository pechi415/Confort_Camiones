import React, { createContext, useContext, useMemo } from 'react';
import { useMaintenanceData } from '../hooks/useMaintenanceData';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { fallas } from '../constants/fallas';
import { parseFecha } from '../utils/formatters';
import { Hourglass, Search, SearchCheck, Wrench, CheckCircle2, ShieldAlert } from 'lucide-react';
import { camionService } from '../services/camionService';

const TruckContext = createContext();

export const useTruck = () => {
  return useContext(TruckContext);
};

export const TruckProvider = ({ children }) => {
  const { session } = useAuth();
  const { addToast, showConfirm } = useUI();
  
  const truckState = useMaintenanceData(session, addToast);
  const { camionesRegistrados, setCamionesRegistrados } = truckState;

  const camionesAccessibles = useMemo(() => {
    if (!camionesRegistrados) return [];

    const filtradosSeguros = camionesRegistrados.filter(c => {
      if (!session) return true;
      if (session.mina === 'Global' || session.role === 'admin') return true;
      return c.mina === session.mina;
    });

    const ranked = filtradosSeguros.map(c => {
      const gruposReportando = [c.g1_danos, c.g2_danos, c.g3_danos].filter(d => d && Object.keys(d).length > 0).length;

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

    return [...ranked].sort((a, b) => {
      if (b._numGrupos !== a._numGrupos) return b._numGrupos - a._numGrupos;
      return b._totalPeso - a._totalPeso;
    });
  }, [camionesRegistrados, session]);

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

  const eliminarCamion = async (id, flota) => {
    showConfirm({
      type: 'prompt',
      title: '⚠ ADVERTENCIA DE SEGURIDAD',
      message: `Esta acción eliminará permanentemente el reporte del Camión ${flota}.\n\nPara confirmar, escribe el número del camión a continuación:`,
      expectedValue: String(flota),
      placeholder: `Escribe ${flota} aquí...`,
      confirmText: 'ELIMINAR PERMANENTEMENTE',
      onConfirm: async () => {
        try {
          await camionService.eliminarCamion(id);
          setCamionesRegistrados(prev => prev.filter(c => c.id !== id));
          addToast(`🗑️ Camión ${flota} eliminado exitosamente del sistema.`, "success");
        } catch (err) {
          addToast("Error al eliminar: " + err.message, "error");
        }
      }
    });
  };

  return (
    <TruckContext.Provider value={{
      ...truckState,
      camionesAccessibles,
      conteoLiberados,
      promedioCiclo,
      kpis,
      eliminarCamion
    }}>
      {children}
    </TruckContext.Provider>
  );
};

