import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { camionService } from '../services/camionService';
import { usuarioService } from '../services/usuarioService';

export const useMaintenanceData = (session, addToast) => {
  const [camionesRegistrados, setCamionesRegistrados] = useState([]);
  const [dbUsuarios, setDbUsuarios] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchDatabase = useCallback(async (retry = false) => {
    try {
      if (!session) return;
      setLoadingData(true);

      const [usersInfo, flotaInfo] = await Promise.all([
        usuarioService.getUsuarios(),
        camionService.getCamiones()
      ]);

      if (usersInfo) setDbUsuarios(usersInfo);
      if (flotaInfo && flotaInfo.length > 0) {
        setCamionesRegistrados(flotaInfo);
      } else if (!retry && (!flotaInfo || flotaInfo.length === 0)) {
        setTimeout(() => fetchDatabase(true), 800);
      }
    } catch {
      addToast("Error de conexión", "error");
    } finally {
      setLoadingData(false);
    }
  }, [session, addToast]);

  useEffect(() => {
    if (!session) return;
    
    fetchDatabase();

    const channelCamiones = supabase
      .channel('db_changes_camiones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'camiones' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCamionesRegistrados(prev => {
            if (prev.some(c => c.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setCamionesRegistrados(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
        } else if (payload.eventType === 'DELETE') {
          setCamionesRegistrados(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();

    const channelUsuarios = supabase
      .channel('realtime_usuarios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, () => {
        fetchDatabase();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelCamiones);
      supabase.removeChannel(channelUsuarios);
    };
  }, [session, fetchDatabase]);

  const handleRefresh = async (clearFormCallback) => {
    try {
      setLoadingData(true);
      const usersInfo = await usuarioService.getUsuarios();
      if (usersInfo) setDbUsuarios(usersInfo);

      const flotaInfo = await camionService.getCamiones();
      if (flotaInfo && flotaInfo.length > 0) {
        setCamionesRegistrados(flotaInfo);
        addToast('✅ Datos sincronizados');
      } else if (flotaInfo && flotaInfo.length === 0) {
        addToast('⚠️ No se encontraron datos para tu perfil', 'info');
      }

      if (typeof clearFormCallback === 'function') {
        clearFormCallback();
      }
    } catch {
      addToast('❌ Error de conexión', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const updateCamionLocalAndRemote = async (id, updates) => {
    // UI Optimista
    setCamionesRegistrados(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await camionService.updateCamion(id, updates);
    } catch (err) {
      addToast("Error al actualizar: " + err.message, "error");
      fetchDatabase(); // Revertir a datos reales
    }
  };

  return {
    camionesRegistrados,
    setCamionesRegistrados,
    dbUsuarios,
    setDbUsuarios,
    loadingData,
    setLoadingData,
    fetchDatabase,
    handleRefresh,
    updateCamionLocalAndRemote
  };
};
