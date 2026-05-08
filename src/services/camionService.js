// src/services/camionService.js
import { supabase } from '../supabaseClient';

/**
 * Servicio centralizado para la gestión de camiones en Supabase.
 */
export const camionService = {
  
  /**
   * Obtiene todos los registros de camiones.
   */
  async getCamiones() {
    const { data, error } = await supabase
      .from('camiones')
      .select('*')
      .order('id', { ascending: false }); // Usamos id como fallback si created_at falla
    
    if (error) throw error;
    return data;
  },

  /**
   * Registra un nuevo camión.
   */
  async registrarCamion(camionData) {
    const { data, error } = await supabase
      .from('camiones')
      .insert([camionData])
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Actualiza el estado o cualquier campo.
   */
  async updateCamion(id, updates) {
    const { data, error } = await supabase
      .from('camiones')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Actualiza múltiples registros por flota.
   */
  async updateByFlota(flota, updates) {
    const { data, error } = await supabase
      .from('camiones')
      .update(updates)
      .eq('flota', flota)
      .not('estado', 'eq', 'liberado')
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Elimina un camión.
   */
  async eliminarCamion(id) {
    const { error } = await supabase
      .from('camiones')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
